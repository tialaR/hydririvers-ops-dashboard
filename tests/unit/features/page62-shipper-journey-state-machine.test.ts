import { describe, expect, it } from 'vitest';

import {
  canApplyShipperJourneyTransition,
  resolveShipperJourneyTransition,
} from '@/features/cargo/owned/domain/shipper-journey-state-machine';

describe('Page 62 shipper journey state machine', () => {
  it('follows the decision happy path', () => {
    expect(resolveShipperJourneyTransition('negotiation', { type: 'proposalSelected' })).toBe('review');
    expect(resolveShipperJourneyTransition('review', { type: 'reviewConfirmed' })).toBe('feedback');
    expect(resolveShipperJourneyTransition('feedback', { type: 'monitoringOpened' })).toBe('monitoring');
  });

  it('routes rejected evidence into correction and back to monitoring', () => {
    expect(resolveShipperJourneyTransition('feedback', { type: 'documentRejected' })).toBe('correction');
    expect(resolveShipperJourneyTransition('correction', { type: 'correctionSubmitted' })).toBe('monitoring');
  });

  it('routes a hydro constraint back into operational context', () => {
    expect(resolveShipperJourneyTransition('monitoring', { type: 'hydroConstraintRaised' })).toBe('cockpit');
  });

  it('rejects impossible state jumps', () => {
    expect(canApplyShipperJourneyTransition('review', { type: 'correctionSubmitted' })).toBe(false);
    expect(() => resolveShipperJourneyTransition('review', { type: 'correctionSubmitted' })).toThrow(
      /Invalid shipper journey transition/,
    );
  });
});
