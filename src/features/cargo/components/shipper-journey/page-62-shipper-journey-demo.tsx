'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useMemo, useState } from 'react';

import { PAGE62_SHIPPER_JOURNEY_DEMO } from '@/features/cargo/owned/mocks/page-62-shipper-journey.mock';
import {
  Page62CargoCockpitPreview,
  type CargoCockpitPostActionState,
} from '@/features/cargo/owned/stories/page-62-cargo-cockpit-preview';
import { Page62OverviewSurface } from './page-62-overview-surface';
import type { ShipperJourneyExperience } from '@/features/cargo/owned/domain/shipper-journey.types';
import { resolveShipperJourneyTransition } from '@/features/cargo/owned/domain/shipper-journey-state-machine';
import {
  ActionFeedbackSurface,
  CorrectionResubmitSurface,
  DecisionActionReviewSurface,
  ProposalNegotiationSurface,
} from './shipper-journey-surfaces';
import styles from './shipper-journey.module.sass';

const experiences: Array<{ id: ShipperJourneyExperience; label: string }> = [
  { id: 'discovery', label: 'D01–D03 · Carteira e rota' },
  { id: 'cockpit', label: 'D04–D05 · Cockpit' },
  { id: 'documentsRisk', label: 'D06–D07 · Evidências' },
  { id: 'negotiation', label: 'D08–D09 · Negociação' },
  { id: 'review', label: 'D10 · Revisão' },
  { id: 'feedback', label: 'D11 · Feedback' },
  { id: 'correction', label: 'D12 · Correção' },
];

export function Page62ShipperJourneyDemo({
  initial = 'discovery',
  initialPostAction = null,
}: {
  initial?: ShipperJourneyExperience;
  initialPostAction?: CargoCockpitPostActionState | null;
}) {
  const reduceMotion = useReducedMotion();
  const [experience, setExperience] = useState<ShipperJourneyExperience>(initial);
  const [postActionState, setPostActionState] = useState<CargoCockpitPostActionState | null>(initialPostAction);
  const [selectedProposalId, setSelectedProposalId] = useState('proposal-b');
  const snapshot = PAGE62_SHIPPER_JOURNEY_DEMO;
  const proposals = snapshot.proposals;
  const divergentDocument = useMemo(
    () => snapshot.documents.find((document) => document.state === 'divergent') ?? snapshot.documents[0],
    [snapshot.documents],
  );

  const content = (() => {
    if (experience === 'discovery') {
      return <Page62OverviewSurface onOpenCockpit={() => setExperience(resolveShipperJourneyTransition('discovery', { type: 'cargoSelected' }))} />;
    }
    if (experience === 'cockpit') {
      return (
        <Page62CargoCockpitPreview
          initialMode="cockpit"
          postAction={postActionState}
          onOverview={() => setExperience('discovery')}
          onOpenCorrection={() => setExperience(
            resolveShipperJourneyTransition('documentsRisk', { type: 'documentRejected' }),
          )}
          onOpenNegotiation={() => setExperience(
            resolveShipperJourneyTransition('documentsRisk', { type: 'proposalSelected' }),
          )}
        />
      );
    }
    if (experience === 'documentsRisk') {
      const openCorrection = () => setExperience(
        resolveShipperJourneyTransition('documentsRisk', { type: 'documentRejected' }),
      );
      const openNegotiation = () => setExperience(
        resolveShipperJourneyTransition('documentsRisk', { type: 'proposalSelected' }),
      );

      return (
        <Page62CargoCockpitPreview
          initialMode="documents"
          onOverview={() => setExperience('discovery')}
          onOpenCorrection={openCorrection}
          onOpenNegotiation={openNegotiation}
        />
      );
    }
    if (experience === 'review' && proposals.length > 1) {
      const selectedProposal =
        proposals.find((proposal) => proposal.id === selectedProposalId) ?? proposals[1] ?? proposals[0];
      const referenceProposal =
        proposals.find((proposal) => proposal.id !== selectedProposal?.id) ?? proposals[0];

      if (selectedProposal && referenceProposal) {
        return (
          <DecisionActionReviewSurface
            selected={selectedProposal}
            reference={referenceProposal}
            onBack={() => setExperience(resolveShipperJourneyTransition('review', { type: 'reviewCancelled' }))}
            onConfirm={() => setExperience(resolveShipperJourneyTransition('review', { type: 'reviewConfirmed' }))}
          />
        );
      }
    }
    if (experience === 'feedback' && proposals.length > 1) {
      const selectedProposal =
        proposals.find((proposal) => proposal.id === selectedProposalId) ?? proposals[1] ?? proposals[0];
      const referenceProposal =
        proposals.find((proposal) => proposal.id !== selectedProposal?.id) ?? proposals[0];

      if (selectedProposal && referenceProposal) {
        return (
          <ActionFeedbackSurface
            selected={selectedProposal}
            reference={referenceProposal}
            documents={snapshot.documents}
            hydro={snapshot.hydro}
            sources={snapshot.sources}
            onCorrection={() => setExperience(resolveShipperJourneyTransition('feedback', { type: 'documentRejected' }))}
            onMonitor={() => {
              setPostActionState('decisionApplied');
              setExperience(resolveShipperJourneyTransition('feedback', { type: 'followUpOpened' }));
            }}
          />
        );
      }
    }
    if (experience === 'correction' && divergentDocument) {
      return (
        <CorrectionResubmitSurface
          document={divergentDocument}
          hydro={snapshot.hydro}
          sources={snapshot.sources}
          cargoId={snapshot.cargoId}
          onBack={() => setExperience('feedback')}
          onSubmit={() => {
            setPostActionState('documentCorrected');
            setExperience(resolveShipperJourneyTransition('correction', { type: 'correctionSubmitted' }));
          }}
        />
      );
    }
    return (
      <ProposalNegotiationSurface
        proposals={proposals}
        selectedProposalId={selectedProposalId}
        onSelectProposal={setSelectedProposalId}
        onBack={() => setExperience('documentsRisk')}
        onReview={(proposalId) => {
          setSelectedProposalId(proposalId);
          setExperience(resolveShipperJourneyTransition('negotiation', { type: 'proposalSelected' }));
        }}
      />
    );
  })();

  return (
    <div data-testid="page62-shipper-journey">
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
