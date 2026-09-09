import type { PublicCargoRecord } from '../domain/public-cargo-types';

export const PUBLIC_CARGOES: PublicCargoRecord[] = [
  {
    id: 'pub-001',
    corridorId: 'tapajos',
    origin: 'Santarém',
    destination: 'Itacoatiara / Hermasa',
    cargoTypeKey: 'solidBulk',
    windowLabelKey: 'approxWeek32',
    statusKey: 'openInterest',
    riskLevel: 'medium'
  },
  {
    id: 'pub-002',
    corridorId: 'madeira',
    origin: 'Porto Velho',
    destination: 'Miritituba / Itaituba',
    cargoTypeKey: 'general',
    windowLabelKey: 'approxWeek33',
    statusKey: 'collectingOffers',
    riskLevel: 'low'
  },
  {
    id: 'pub-003',
    corridorId: 'amazonas-solimoes',
    origin: 'Manaus / Chibatão',
    destination: 'Santana',
    cargoTypeKey: 'container',
    windowLabelKey: 'approxWeek31',
    statusKey: 'windowClosing',
    riskLevel: 'high'
  }
];

