import type { ShipperNotification } from '@/features/shipper-mobile-flow/types/shipper-flow-types';

export const SHIPPER_NOTIFICATIONS: ShipperNotification[] = [
  {
    id: 'n1',
    severity: 'high',
    titleKey: 'draftLow.title',
    bodyKey: 'draftLow.body',
    timeLabelKey: 'draftLow.time'
  },
  {
    id: 'n2',
    severity: 'medium',
    titleKey: 'docDue.title',
    bodyKey: 'docDue.body',
    timeLabelKey: 'docDue.time'
  },
  {
    id: 'n3',
    severity: 'low',
    titleKey: 'offerReceived.title',
    bodyKey: 'offerReceived.body',
    timeLabelKey: 'offerReceived.time'
  }
];
