import { describe, expect, it } from 'vitest';

import {
  canApplyShipperJourneyTransition,
  resolveShipperJourneyTransition,
} from '@/features/cargo/owned/domain/shipper-journey-state-machine';

describe('Page 62 shipper journey state machine', () => {
  it('returns the decision happy path to the operational cockpit', () => {
    expect(resolveShipperJourneyTransition('negotiation', { type: 'proposalSelected' })).toBe('review');
    expect(resolveShipperJourneyTransition('review', { type: 'reviewConfirmed' })).toBe('feedback');
    expect(resolveShipperJourneyTransition('feedback', { type: 'followUpOpened' })).toBe('cockpit');
  });

  it('routes rejected evidence into correction and back to the cockpit', () => {
    expect(resolveShipperJourneyTransition('feedback', { type: 'documentRejected' })).toBe('correction');
    expect(resolveShipperJourneyTransition('correction', { type: 'correctionSubmitted' })).toBe('cockpit');
  });

  it('keeps hydro follow-up inside the operational cockpit', () => {
    expect(resolveShipperJourneyTransition('cockpit', { type: 'hydroConstraintRaised' })).toBe('cockpit');
    expect(resolveShipperJourneyTransition('cockpit', { type: 'followUpRequired' })).toBe('cockpit');
  });

  it('rejects impossible state jumps', () => {
    expect(canApplyShipperJourneyTransition('review', { type: 'correctionSubmitted' })).toBe(false);
    expect(() => resolveShipperJourneyTransition('review', { type: 'correctionSubmitted' })).toThrow(
      /Invalid shipper journey transition/,
    );
  });
});
