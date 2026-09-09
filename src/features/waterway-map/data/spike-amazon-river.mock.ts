import type {
  HydrowayCityMarkerScene,
  HydrowayMapViewBox,
  HydrowayRiverCorridorScene,
} from '../providers/map-provider.types';

/** ViewBox schematico alinhado à foundation desktop (fictício, determinístico). */
export const SPIKE_MAP_VIEWBOX: HydrowayMapViewBox = {
  width: 1600,
  height: 900,
};

export const SPIKE_RIVER_CORRIDORS: HydrowayRiverCorridorScene[] = [
  {
    id: 'amazonas',
    label: 'AMAZONAS',
    labelPoint: { x: 520, y: 560 },
    pathD: 'M 80 520 C 280 500, 420 470, 620 455 C 820 440, 1020 450, 1240 445 C 1360 442, 1460 438, 1540 432',
  },
  {
    id: 'para',
    label: 'PARÁ',
    labelPoint: { x: 1240, y: 340 },
    pathD: 'M 1180 430 C 1260 390, 1320 350, 1400 310 C 1440 290, 1480 278, 1520 268',
  },
];

export const SPIKE_CONTEXT_CITIES: HydrowayCityMarkerScene[] = [
  { id: 'tefe', name: 'Tefé', point: { x: 240, y: 472 } },
  { id: 'manaus', name: 'Manaus', point: { x: 520, y: 458 } },
  { id: 'parintins', name: 'Parintins', point: { x: 700, y: 410 } },
  { id: 'obidos', name: 'Óbidos', point: { x: 900, y: 452 } },
  { id: 'juruti', name: 'Juruti', point: { x: 860, y: 440 } },
  { id: 'alenquer', name: 'Alenquer', point: { x: 940, y: 400 } },
  { id: 'santarem', name: 'Santarém', point: { x: 980, y: 468 } },
  { id: 'monte-alegre', name: 'Monte Alegre', point: { x: 1020, y: 408 } },
  { id: 'prainha', name: 'Prainha', point: { x: 1080, y: 418 } },
  { id: 'breves', name: 'Breves', point: { x: 1180, y: 438 } },
  { id: 'macapa', name: 'Macapá', point: { x: 1360, y: 300 } },
  { id: 'abaetetuba', name: 'Abaetetuba', point: { x: 1320, y: 448 } },
  { id: 'barcarena', name: 'Barcarena', point: { x: 1380, y: 418 } },
  { id: 'belem', name: 'Belém', point: { x: 1420, y: 430 } },
];
