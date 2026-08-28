import type { ShipperNotification } from '@/features/notifications/domain/shipper-notification';

export const SHIPPER_NOTIFICATIONS: ShipperNotification[] = [
  {
    id: 'n1',
    severity: 'high',
    titleKey: 'draftLow.title',
    bodyKey: 'draftLow.body',
    timeLabelKey: 'draftLow.time',
  },
  {
    id: 'n2',
    severity: 'medium',
    titleKey: 'docDue.title',
    bodyKey: 'docDue.body',
    timeLabelKey: 'docDue.time',
  },
  {
    id: 'n3',
    severity: 'low',
    titleKey: 'offerReceived.title',
    bodyKey: 'offerReceived.body',
    timeLabelKey: 'offerReceived.time',
  },
];
