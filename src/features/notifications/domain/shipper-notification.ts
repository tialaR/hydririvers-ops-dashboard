export type ShipperNotificationSeverity = 'low' | 'medium' | 'high';

export type ShipperNotification = {
  id: string;
  severity: ShipperNotificationSeverity;
  titleKey: string;
  bodyKey: string;
  timeLabelKey: string;
};
