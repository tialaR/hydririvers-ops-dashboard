'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useMemo, useState } from 'react';

import { PAGE62_SHIPPER_JOURNEY_DEMO } from '@/features/cargo/owned/mocks/page-62-shipper-journey.mock';
import type { ShipperJourneyExperience } from '@/features/cargo/owned/domain/shipper-journey.types';
import { resolveShipperJourneyTransition } from '@/features/cargo/owned/domain/shipper-journey-state-machine';
import {
  ActionFeedbackSurface,
  CorrectionResubmitSurface,
  DecisionActionReviewSurface,
  FollowUpMonitoringSurface,
  ProposalNegotiationSurface,
} from './shipper-journey-surfaces';
import styles from './shipper-journey.module.sass';

const experiences: Array<{ id: ShipperJourneyExperience; label: string }> = [
  { id: 'negotiation', label: 'D08–D09 · Negociação' },
  { id: 'review', label: 'D10 · Revisão' },
  { id: 'feedback', label: 'D11 · Feedback' },
  { id: 'correction', label: 'D12 · Correção' },
  { id: 'monitoring', label: 'D13 · Monitoramento' },
];

export function Page62ShipperJourneyDemo({ initial = 'negotiation' }: { initial?: ShipperJourneyExperience }) {
  const reduceMotion = useReducedMotion();
  const [experience, setExperience] = useState<ShipperJourneyExperience>(initial);
  const snapshot = PAGE62_SHIPPER_JOURNEY_DEMO;
  const proposals = snapshot.proposals;
  const divergentDocument = useMemo(
    () => snapshot.documents.find((document) => document.state === 'divergent') ?? snapshot.documents[0],
    [snapshot.documents],
  );

  const content = (() => {
    if (experience === 'review' && proposals[0] && proposals[1]) {
      return (
        <DecisionActionReviewSurface
          current={proposals[0]}
          alternative={proposals[1]}
          onCancel={() => setExperience(resolveShipperJourneyTransition('review', { type: 'reviewCancelled' }))}
          onConfirm={() => setExperience(resolveShipperJourneyTransition('review', { type: 'reviewConfirmed' }))}
        />
      );
    }
    if (experience === 'feedback') {
      return <ActionFeedbackSurface onMonitor={() => setExperience(resolveShipperJourneyTransition('feedback', { type: 'monitoringOpened' }))} />;
    }
    if (experience === 'correction' && divergentDocument) {
      return <CorrectionResubmitSurface document={divergentDocument} onSubmit={() => setExperience(resolveShipperJourneyTransition('correction', { type: 'correctionSubmitted' }))} />;
    }
    if (experience === 'monitoring') {
      return <FollowUpMonitoringSurface onReviewHydro={() => setExperience(resolveShipperJourneyTransition('monitoring', { type: 'hydroConstraintRaised' }))} />;
    }
    return <ProposalNegotiationSurface proposals={proposals} onReview={() => setExperience(resolveShipperJourneyTransition('negotiation', { type: 'proposalSelected' }))} />;
  })();

  return (
    <div>
      <nav className={styles.journeyToolbar} aria-label="Page 62 journey state selector">
        {experiences.map((item) => (
          <button key={item.id} type="button" aria-pressed={experience === item.id} onClick={() => setExperience(item.id)}>
            {item.label}
          </button>
        ))}
      </nav>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={experience}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
