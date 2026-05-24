import type { HydrowayOperationalLayerMode } from '../domain/hydroway-operational-domain.types';

export type OperationalLegendItem = {
  key: string;
  color: string;
  dashed?: boolean;
};

export const OPERATIONAL_MODE_LEGEND: Record<
  HydrowayOperationalLayerMode,
  readonly OperationalLegendItem[]
> = {
  operation: [
    { key: 'corridor', color: '#00E6D0' },
    { key: 'checkpoint', color: '#7FFFF2' },
    { key: 'alert', color: '#FFB020' },
  ],
  navigation: [
    { key: 'normal', color: '#22C55E' },
    { key: 'attention', color: '#F59E0B' },
    { key: 'restricted', color: '#EF4444' },
    { key: 'dredging', color: '#2563EB', dashed: true },
  ],
  logistics: [
    { key: 'terminal', color: '#8B5CF6' },
    { key: 'checkpoint', color: '#38BDF8' },
    { key: 'bottleneck', color: '#F97316' },
  ],
  risk: [
    { key: 'critical', color: '#FF2D55' },
    { key: 'warning', color: '#FFB020' },
    { key: 'restricted', color: '#EF4444' },
  ],
  government: [
    { key: 'corridor', color: '#2563EB' },
    { key: 'planning', color: '#A855F7' },
    { key: 'outline', color: '#E0F2FE' },
  ],
};
