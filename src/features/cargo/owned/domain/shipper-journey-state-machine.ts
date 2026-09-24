import type { ShipperJourneyEvent, ShipperJourneyExperience } from './shipper-journey.types';

export type ShipperJourneyTransitionEvent =
  | Pick<ShipperJourneyEvent, 'type'>
  | { type: 'reviewCancelled' }
  | { type: 'monitoringOpened' };

const transitions: Partial<Record<
  ShipperJourneyExperience,
  Partial<Record<ShipperJourneyTransitionEvent['type'], ShipperJourneyExperience>>
>> = {
  discovery: {
    cargoSelected: 'cockpit',
    hydroConstraintRaised: 'cockpit',
  },
  cockpit: {
    documentDivergenceFound: 'documentsRisk',
    proposalSelected: 'negotiation',
    hydroConstraintRaised: 'cockpit',
  },
  documentsRisk: {
    proposalSelected: 'negotiation',
    documentRejected: 'correction',
    hydroConstraintRaised: 'documentsRisk',
  },
  negotiation: {
    proposalSelected: 'review',
    reviewCancelled: 'negotiation',
    hydroConstraintRaised: 'negotiation',
  },
  review: {
    reviewConfirmed: 'feedback',
    reviewCancelled: 'negotiation',
  },
  feedback: {
    documentRejected: 'correction',
    followUpRequired: 'monitoring',
    monitoringOpened: 'monitoring',
  },
  correction: {
    correctionSubmitted: 'monitoring',
  },
  monitoring: {
    hydroConstraintRaised: 'cockpit',
    documentRejected: 'correction',
    followUpRequired: 'monitoring',
    monitoringOpened: 'monitoring',
  },
};

export function resolveShipperJourneyTransition(
  current: ShipperJourneyExperience,
  event: ShipperJourneyTransitionEvent,
): ShipperJourneyExperience {
  const next = transitions[current]?.[event.type];
  if (!next) {
    throw new Error(`Invalid shipper journey transition: ${current} + ${event.type}`);
  }
  return next;
}

export function canApplyShipperJourneyTransition(
  current: ShipperJourneyExperience,
  event: ShipperJourneyTransitionEvent,
): boolean {
  return Boolean(transitions[current]?.[event.type]);
}
