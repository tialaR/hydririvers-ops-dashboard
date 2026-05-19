/**
 * Gera artefatos GeoJSON GOV-enriched (V2.6) de forma determinística.
 * Uso: node src/features/waterway-map/data/scripts/build-mock-geojson.mjs
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..');

const BBOX = { west: -60.5, east: -47.0, south: -4.0, north: 0.5 };
const LAST_REVIEWED = '2026-05-19';

/** @type {Record<string, [number, number]>} */
const NODES = {
  'port-belem': [-48.51875, -1.65],
  'port-barcarena': [-48.28, -1.38],
  'terminal-vila-conde': [-48.0125, -1.46],
  'port-santarem': [-52.23125, -1.84],
  'port-itaituba': [-55.35, -2.28],
  'port-manaus': [-56.1125, -1.79],
  'port-itacoatiara': [-54.05, -1.72],
  'port-porto-velho': [-58.95, -2.28],
  'port-macapa': [-51.05, -0.42],
  'port-abaetetuba': [-49.85, -1.52],
  'port-obidos': [-50.35, -1.76],
  'port-parintins': [-53.38, -1.82],
  'port-tefe': [-58.25, -1.52],
  'port-maraba': [-51.725, -2.0],
  'terminal-miritituba': [-55.05, -2.18],
  'port-breves': [-50.48, -1.02],
  'port-alenquer': [-54.32, -1.18],
  'port-juruti': [-53.05, -1.92],
  'port-altamira': [-52.05, -2.48],
  'port-prainha': [-51.68, -1.48],
  'transshipment-belem-mosqueiro': [-48.42, -1.58],
  'transshipment-santarem-tapajos': [-52.05, -1.78],
  'transshipment-itaituba-flex': [-55.22, -2.22],
  'terminal-santarem-oeste': [-52.15, -1.82],
};

function round5(n) {
  return Math.round(n * 1e5) / 1e5;
}

function clampInBbox([lng, lat]) {
  return [
    round5(Math.max(BBOX.west, Math.min(BBOX.east, lng))),
    round5(Math.max(BBOX.south, Math.min(BBOX.north, lat))),
  ];
}

/**
 * @param {[number, number][]} waypoints
 * @param {number} pointsPerLeg
 * @param {number} waveAmp
 * @param {number} phase
 */
function buildCurvedLine(waypoints, pointsPerLeg = 10, waveAmp = 0.06, phase = 0) {
  /** @type {[number, number][]} */
  const coords = [];
  for (let i = 0; i < waypoints.length - 1; i += 1) {
    const [x0, y0] = waypoints[i];
    const [x1, y1] = waypoints[i + 1];
    for (let j = 0; j < pointsPerLeg; j += 1) {
      const t = j / pointsPerLeg;
      const lng = x0 + (x1 - x0) * t;
      const lat = y0 + (y1 - y0) * t;
      const perpLng = -(y1 - y0);
      const perpLat = x1 - x0;
      const len = Math.hypot(perpLng, perpLat) || 1;
      const wave = waveAmp * Math.sin(Math.PI * t + phase + i * 0.65);
      coords.push(clampInBbox([lng + (perpLng / len) * wave, lat + (perpLat / len) * wave]));
    }
  }
  coords.push(clampInBbox(waypoints[waypoints.length - 1]));
  return coords;
}

function bboxFromCoords(coords) {
  const lngs = coords.map((c) => c[0]);
  const lats = coords.map((c) => c[1]);
  return [
    round5(Math.min(...lngs)),
    round5(Math.min(...lats)),
    round5(Math.max(...lngs)),
    round5(Math.max(...lats)),
  ];
}

function polylineKm(coords) {
  let km = 0;
  for (let i = 1; i < coords.length; i += 1) {
    const [lng0, lat0] = coords[i - 1];
    const [lng1, lat1] = coords[i];
    km += Math.hypot((lng1 - lng0) * 85, (lat1 - lat0) * 111);
  }
  return Math.round(km);
}

function govBase(overrides = {}) {
  return {
    sourceType: 'official-inspired',
    sourceInspiration: 'HydroRivers Arco Norte mock — source-inspired schematic',
    sourceNotes: 'Geometria fictícia determinística; não substitui shapefile oficial.',
    confidence: 'medium',
    mockLevel: 'enriched',
    lastReviewed: LAST_REVIEWED,
    visualPurpose: 'hydro-network',
    ...overrides,
  };
}

function lineFeature(id, name, kind, coords, props = {}) {
  return {
    type: 'Feature',
    properties: {
      id,
      name,
      kind,
      ...govBase(),
      ...props,
    },
    geometry: { type: 'LineString', coordinates: coords },
  };
}

function pointFeature(id, name, kind, coord, props = {}) {
  return {
    type: 'Feature',
    properties: {
      id,
      name,
      kind,
      ...govBase(),
      ...props,
    },
    geometry: { type: 'Point', coordinates: clampInBbox(coord) },
  };
}

function polygonFeature(id, name, kind, ring, props = {}) {
  const closed = [...ring];
  const first = closed[0];
  const last = closed[closed.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    closed.push([...first]);
  }
  return {
    type: 'Feature',
    properties: {
      id,
      name,
      kind,
      ...govBase(),
      ...props,
    },
    geometry: { type: 'Polygon', coordinates: [closed.map(clampInBbox)] },
  };
}

// ——— Main rivers ———
const amazonasWp = [
  NODES['port-manaus'],
  [-57.2, -1.88],
  [-56.5, -1.82],
  NODES['port-itacoatiara'],
  [-54.8, -1.75],
  NODES['port-parintins'],
  [-52.8, -1.8],
  NODES['port-obidos'],
  [-51.2, -1.7],
  NODES['port-prainha'],
  NODES['port-breves'],
  [-49.5, -1.45],
  NODES['port-abaetetuba'],
  NODES['port-belem'],
  NODES['port-macapa'],
];

const madeiraWp = [
  NODES['port-porto-velho'],
  [-59.4, -2.1],
  [-58.6, -2.0],
  [-57.5, -1.95],
  NODES['port-manaus'],
];

const tapajosWp = [
  NODES['port-itaituba'],
  NODES['terminal-miritituba'],
  [-54.5, -2.0],
  [-53.2, -1.9],
  NODES['port-santarem'],
];

const tocantinsWp = [
  NODES['port-maraba'],
  [-51.4, -1.95],
  [-50.6, -1.7],
  NODES['port-obidos'],
  NODES['port-abaetetuba'],
  NODES['port-belem'],
];

const paraEstWp = [
  NODES['port-belem'],
  NODES['port-abaetetuba'],
  [-49.2, -1.35],
  NODES['port-barcarena'],
  NODES['terminal-vila-conde'],
  [-47.8, -1.2],
];

const mainRivers = {
  type: 'FeatureCollection',
  features: [
    lineFeature('amazonas-solimoes', 'Rio Amazonas / Solimões', 'river', buildCurvedLine(amazonasWp, 12, 0.09, 0.1), {
      corridorId: 'amazonas',
      waterwayCode: 'HN-100',
      state: 'AM',
      strategicRole: 'eixo-logistico-principal',
      operationalStatus: 'active',
      navigabilityRisk: 'medium',
      importance: 'critical',
      referenceContext: 'Eixo Amazonas-Solimões — inspiração BIT/ANTAQ HN-100',
      sourceInspiration: 'BIT Mapas Aquaviário + ANTAQ vias interiores',
      sourceNotes: 'Geometria curvilínea fictícia para demo; não é shapefile oficial.',
      confidence: 'medium',
      visualPurpose: 'main-river-backbone',
    }),
    lineFeature('madeira', 'Rio Madeira', 'river', buildCurvedLine(madeiraWp, 10, 0.07, 0.4), {
      corridorId: 'madeira',
      state: 'RO',
      strategicRole: 'corredor-graos-combustiveis',
      operationalStatus: 'active',
      navigabilityRisk: 'high',
      importance: 'high',
      sourceInspiration: 'ANTAQ fluxos hidroviários Madeira',
      visualPurpose: 'tributary-main',
    }),
    lineFeature('tapajos', 'Rio Tapajós', 'river', buildCurvedLine(tapajosWp, 10, 0.08, 0.8), {
      corridorId: 'tapajos-teles-pires',
      state: 'PA',
      strategicRole: 'eixo-miritituba-santarem',
      operationalStatus: 'active',
      navigabilityRisk: 'high',
      importance: 'high',
      sourceInspiration: 'ANTAQ Miritituba / Tapajós',
      visualPurpose: 'tributary-main',
    }),
    lineFeature('tocantins', 'Rio Tocantins', 'river', buildCurvedLine(tocantinsWp, 10, 0.07, 1.1), {
      corridorId: 'tocantins-araguaia',
      state: 'PA',
      strategicRole: 'eixo-graos-tocantins',
      operationalStatus: 'attention',
      navigabilityRisk: 'high',
      importance: 'high',
      sourceInspiration: 'BIT hidroviário Tocantins',
      visualPurpose: 'tributary-main',
    }),
    lineFeature('araguaia-branch', 'Ramo Araguaia (mock)', 'tributary', buildCurvedLine(
      [NODES['port-maraba'], [-51.9, -2.15], [-51.5, -2.35], [-51.1, -2.5]],
      8,
      0.05,
      1.4,
    ), {
      corridorId: 'tocantins-araguaia',
      state: 'PA',
      importance: 'medium',
      sourceInspiration: 'Domain-inspired confluence',
      sourceType: 'domain-inspired',
      visualPurpose: 'tributary-context',
    }),
    lineFeature('para-estuario', 'Estuário do Pará / Baía do Marajó', 'river', buildCurvedLine(paraEstWp, 10, 0.1, 0.2), {
      corridorId: 'barra-norte',
      state: 'PA',
      strategicRole: 'acesso-belem-barcarena',
      operationalStatus: 'active',
      navigabilityRisk: 'medium',
      importance: 'critical',
      sourceInspiration: 'ANTAQ portos Belém-Barcarena',
      visualPurpose: 'estuary-main',
    }),
  ],
};

// ——— Secondary rivers & tributaries ———
const secondaryRivers = {
  type: 'FeatureCollection',
  features: [
    lineFeature('rio-negro-branch', 'Ramo Rio Negro (mock)', 'tributary', buildCurvedLine(
      [[-59.2, -2.2], [-58.4, -2.0], [-57.8, -1.9], NODES['port-manaus']],
      8,
      0.06,
      0.3,
    ), {
      corridorId: 'amazonas',
      importance: 'medium',
      sourceInspiration: 'ANA/SNIRH hidrografia — schematic',
      sourceType: 'domain-inspired',
      visualPurpose: 'tributary-density',
    }),
    lineFeature('rio-xingu-branch', 'Ramo Xingu (mock)', 'tributary', buildCurvedLine(
      [NODES['port-altamira'], [-52.4, -2.2], [-52.0, -2.0], NODES['port-obidos']],
      8,
      0.05,
      0.6,
    ), {
      corridorId: 'amazonas',
      importance: 'medium',
      sourceType: 'domain-inspired',
      visualPurpose: 'tributary-density',
    }),
    lineFeature('rio-purus-branch', 'Ramo Purus (mock)', 'secondary', buildCurvedLine(
      [[-58.8, -2.4], [-57.5, -2.1], [-56.8, -1.95], NODES['port-manaus']],
      8,
      0.04,
      0.9,
    ), {
      corridorId: 'amazonas',
      importance: 'low',
      sourceType: 'synthetic',
      visualPurpose: 'secondary-density',
    }),
    lineFeature('rio-juruena-branch', 'Ramo Juruena (mock)', 'secondary', buildCurvedLine(
      [[-56.8, -2.5], [-56.2, -2.2], NODES['port-itaituba']],
      7,
      0.04,
      1.2,
    ), {
      corridorId: 'tapajos-teles-pires',
      importance: 'low',
      sourceType: 'synthetic',
      visualPurpose: 'secondary-density',
    }),
    lineFeature('rio-maica-branch', 'Canal Maicá (mock)', 'secondary', buildCurvedLine(
      [NODES['port-breves'], [-50.2, -0.95], NODES['port-abaetetuba']],
      6,
      0.03,
      0.5,
    ), {
      corridorId: 'barra-norte',
      importance: 'medium',
      sourceType: 'domain-inspired',
      visualPurpose: 'estuary-channel',
    }),
    lineFeature('rio-guama-branch', 'Ramo Guamá (mock)', 'secondary', buildCurvedLine(
      [NODES['port-belem'], [-48.9, -1.55], NODES['port-abaetetuba']],
      6,
      0.04,
      0.7,
    ), {
      corridorId: 'barra-norte',
      importance: 'medium',
      sourceType: 'domain-inspired',
      visualPurpose: 'estuary-channel',
    }),
    lineFeature('rio-capim-branch', 'Ramo Capim (mock)', 'secondary', buildCurvedLine(
      [NODES['port-breves'], [-50.0, -0.75], NODES['port-macapa']],
      7,
      0.05,
      1.0,
    ), {
      corridorId: 'amazonas',
      importance: 'low',
      sourceType: 'synthetic',
      visualPurpose: 'secondary-density',
    }),
    lineFeature('rio-nhamunda-branch', 'Ramo Nhamundá (mock)', 'tributary', buildCurvedLine(
      [NODES['port-parintins'], [-53.8, -1.65], NODES['port-alenquer']],
      7,
      0.04,
      1.3,
    ), {
      corridorId: 'amazonas',
      importance: 'low',
      sourceType: 'synthetic',
      visualPurpose: 'tributary-density',
    }),
    lineFeature('rio-jutai-branch', 'Ramo Jutaí (mock)', 'tributary', buildCurvedLine(
      [NODES['port-juruti'], [-53.6, -1.75], NODES['port-parintins']],
      7,
      0.04,
      1.5,
    ), {
      corridorId: 'amazonas',
      importance: 'low',
      sourceType: 'synthetic',
      visualPurpose: 'tributary-density',
    }),
    lineFeature('rio-coari-branch', 'Ramo Coari (mock)', 'secondary', buildCurvedLine(
      [[-57.2, -2.0], [-56.5, -1.88], NODES['port-itacoatiara']],
      7,
      0.04,
      1.7,
    ), {
      corridorId: 'madeira',
      importance: 'medium',
      sourceType: 'domain-inspired',
      visualPurpose: 'secondary-density',
    }),
    lineFeature('rio-tefe-branch', 'Ligação Tefé (mock)', 'secondary', buildCurvedLine(
      [NODES['port-tefe'], [-57.8, -1.62], [-57.0, -1.75], NODES['port-manaus']],
      8,
      0.05,
      1.9,
    ), {
      corridorId: 'amazonas',
      importance: 'medium',
      sourceType: 'domain-inspired',
      visualPurpose: 'secondary-density',
    }),
    lineFeature('rio-araguari-branch', 'Ramo Araguari (mock)', 'secondary', buildCurvedLine(
      [NODES['port-macapa'], [-50.8, -0.55], NODES['port-breves']],
      7,
      0.04,
      2.1,
    ), {
      corridorId: 'amazonas',
      importance: 'low',
      sourceType: 'synthetic',
      visualPurpose: 'secondary-density',
    }),
  ],
};

// ——— Operational channels ———
const operationalChannels = {
  type: 'FeatureCollection',
  features: [
    lineFeature('channel-belem-barcarena', 'Canal operacional Belém–Barcarena', 'channel', buildCurvedLine(
      [NODES['port-belem'], [-48.65, -1.48], NODES['port-barcarena'], NODES['terminal-vila-conde']],
      8,
      0.03,
      0.2,
    ), {
      corridorId: 'barra-norte',
      operationalStatus: 'active',
      importance: 'high',
      sourceInspiration: 'ANTAQ terminais estuário',
      visualPurpose: 'operational-channel',
    }),
    lineFeature('channel-miritituba-santarem', 'Canal Miritituba–Santarém', 'channel', buildCurvedLine(
      [NODES['terminal-miritituba'], [-54.8, -2.05], NODES['transshipment-santarem-tapajos'], NODES['port-santarem']],
      8,
      0.04,
      0.5,
    ), {
      corridorId: 'tapajos-teles-pires',
      operationalStatus: 'attention',
      importance: 'high',
      sourceInspiration: 'ANTAQ transbordo grãos',
      visualPurpose: 'operational-channel',
    }),
    lineFeature('channel-maraba-estuario', 'Canal Marabá–estuário', 'channel', buildCurvedLine(
      [NODES['port-maraba'], NODES['port-abaetetuba'], NODES['port-barcarena']],
      9,
      0.05,
      0.8,
    ), {
      corridorId: 'tocantins-araguaia',
      operationalStatus: 'attention',
      importance: 'high',
      sourceInspiration: 'BIT Tocantins + estuário PA',
      visualPurpose: 'operational-channel',
    }),
    lineFeature('channel-obidos-calha', 'Calha estreita Óbidos', 'channel', buildCurvedLine(
      [NODES['port-obidos'], [-50.1, -1.68], NODES['port-prainha']],
      6,
      0.02,
      1.0,
    ), {
      corridorId: 'amazonas',
      navigabilityRisk: 'high',
      operationalStatus: 'attention',
      sourceInspiration: 'Domain-inspired bottleneck',
      sourceType: 'domain-inspired',
      visualPurpose: 'operational-channel',
    }),
    lineFeature('channel-itacoatiara-parintins', 'Canal Itacoatiara–Parintins', 'channel', buildCurvedLine(
      [NODES['port-itacoatiara'], [-53.6, -1.78], NODES['port-parintins']],
      7,
      0.03,
      1.2,
    ), {
      corridorId: 'amazonas',
      operationalStatus: 'active',
      visualPurpose: 'operational-channel',
    }),
    lineFeature('channel-madeira-grain', 'Canal graneleiro Madeira', 'channel', buildCurvedLine(
      [NODES['port-porto-velho'], [-59.2, -2.15], NODES['port-itacoatiara']],
      9,
      0.05,
      1.5,
    ), {
      corridorId: 'madeira',
      strategicRole: 'grain-fuel-corridor',
      cargoProfiles: 'grains,fuel',
      sourceInspiration: 'ANTAQ Madeira grain/fuel',
      visualPurpose: 'operational-channel',
    }),
  ],
};

// ——— Navigable corridors ———
function corridorProps(id, name, corridorId, extra) {
  return {
    id,
    name,
    kind: 'corridor',
    corridorId,
    classification: extra.waterwayCode ?? corridorId,
    ...govBase({
      sourceInspiration: extra.sourceInspiration ?? 'ANTAQ vias economicamente navegadas',
    }),
    waterwayCode: extra.waterwayCode,
    waterwayFamily: extra.waterwayFamily,
    region: extra.region ?? 'Arco Norte',
    navigability: extra.navigability ?? 'class-iii-mock',
    navigabilityRisk: extra.navigabilityRisk ?? 'medium',
    dredgingPriority: extra.dredgingPriority ?? 'medium',
    drySeasonRisk: extra.drySeasonRisk ?? 'medium',
    cargoProfiles: extra.cargoProfiles ?? 'general',
    strategicRole: extra.strategicRole,
    visualPriority: extra.visualPriority ?? 'high',
    referenceContext: extra.referenceContext,
    importance: extra.importance ?? 'high',
    visualPurpose: 'navigable-corridor',
    ...extra,
  };
}

const navigableCorridors = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: corridorProps('corridor-amazonas-hn100', 'HN-100 Amazonas-Solimões', 'amazonas', {
        waterwayCode: 'HN-100',
        waterwayFamily: 'amazonas-solimoes',
        strategicRole: 'eixo-dominante',
        navigabilityRisk: 'medium',
        importance: 'critical',
        referenceContext: 'Corredor classificado HN-100 — mock enriched',
        sourceInspiration: 'BIT HN-100 + ANTAQ Amazonas',
      }),
      geometry: { type: 'LineString', coordinates: buildCurvedLine(amazonasWp, 14, 0.04, 0.15) },
    },
    {
      type: 'Feature',
      properties: corridorProps('corridor-madeira', 'Madeira grain/fuel corridor', 'madeira', {
        waterwayFamily: 'madeira',
        strategicRole: 'export-graos-combustivel',
        navigabilityRisk: 'high',
        dredgingPriority: 'high',
        drySeasonRisk: 'high',
        cargoProfiles: 'grains,fuel',
        sourceInspiration: 'ANTAQ fluxos Madeira',
      }),
      geometry: { type: 'LineString', coordinates: buildCurvedLine(madeiraWp, 12, 0.035, 0.45) },
    },
    {
      type: 'Feature',
      properties: corridorProps('corridor-tapajos-teles-pires', 'Tapajós Miritituba–Santarém', 'tapajos-teles-pires', {
        waterwayFamily: 'tapajos',
        strategicRole: 'transbordo-soja',
        navigabilityRisk: 'high',
        cargoProfiles: 'grains',
        sourceInspiration: 'ANTAQ Miritituba',
      }),
      geometry: { type: 'LineString', coordinates: buildCurvedLine(tapajosWp, 12, 0.035, 0.75) },
    },
    {
      type: 'Feature',
      properties: corridorProps('corridor-tocantins-araguaia', 'Tocantins-Araguaia / Pará', 'tocantins-araguaia', {
        waterwayFamily: 'tocantins-araguaia',
        strategicRole: 'grains-tocantins',
        navigabilityRisk: 'high',
        dredgingPriority: 'critical',
        drySeasonRisk: 'critical',
        cargoProfiles: 'grains,ore',
        sourceInspiration: 'BIT Tocantins-Araguaia',
      }),
      geometry: { type: 'LineString', coordinates: buildCurvedLine(tocantinsWp, 12, 0.035, 1.05) },
    },
    {
      type: 'Feature',
      properties: corridorProps('corridor-barra-norte', 'Belém–Barcarena / Vila do Conde', 'barra-norte', {
        waterwayFamily: 'para-estuario',
        strategicRole: 'hub-estuarino-export',
        navigabilityRisk: 'medium',
        cargoProfiles: 'general,bulk',
        sourceInspiration: 'ANTAQ portos organizados PA',
        referenceContext: 'Estuário Belém-Barcarena-Vila do Conde',
      }),
      geometry: { type: 'LineString', coordinates: buildCurvedLine(paraEstWp, 12, 0.04, 0.25) },
    },
  ],
};

// ——— Logistics nodes ———
/** @type {Array<{ id: string; name: string; kind: string; city: string; state: string; corridorId: string; importance: string; operationalRole: string; cargoProfile: string; waterway: string; sourceInspiration: string }>} */
const NODE_DEFS = [
  { id: 'port-belem', name: 'Porto Interior Belém', kind: 'port', city: 'Belém', state: 'PA', corridorId: 'amazonas', importance: 'critical', operationalRole: 'hub-estuarino', cargoProfile: 'general', waterway: 'para-estuario', sourceInspiration: 'ANTAQ instalações portuárias PA' },
  { id: 'port-barcarena', name: 'Porto Barcarena', kind: 'port', city: 'Barcarena', state: 'PA', corridorId: 'tocantins-araguaia', importance: 'high', operationalRole: 'terminal-industrial', cargoProfile: 'bulk', waterway: 'para-estuario', sourceInspiration: 'ANTAQ terminais privados' },
  { id: 'terminal-vila-conde', name: 'Terminal Vila do Conde', kind: 'terminal', city: 'Barcarena', state: 'PA', corridorId: 'tocantins-araguaia', importance: 'critical', operationalRole: 'exportacao-estuarina', cargoProfile: 'bulk,container', waterway: 'para-estuario', sourceInspiration: 'ANTAQ Vila do Conde' },
  { id: 'port-santarem', name: 'Porto Interior Santarém', kind: 'port', city: 'Santarém', state: 'PA', corridorId: 'amazonas', importance: 'high', operationalRole: 'confluencia-tapajos', cargoProfile: 'grains,general', waterway: 'amazonas', sourceInspiration: 'BIT hidroviário Santarém' },
  { id: 'port-itaituba', name: 'Porto Itaituba', kind: 'port', city: 'Itaituba', state: 'PA', corridorId: 'tapajos-teles-pires', importance: 'high', operationalRole: 'origem-graos', cargoProfile: 'grains', waterway: 'tapajos', sourceInspiration: 'ANTAQ Tapajós' },
  { id: 'port-manaus', name: 'Porto Interior Manaus', kind: 'port', city: 'Manaus', state: 'AM', corridorId: 'amazonas', importance: 'critical', operationalRole: 'hub-zfm', cargoProfile: 'general,container', waterway: 'amazonas', sourceInspiration: 'ANTAQ Manaus' },
  { id: 'port-itacoatiara', name: 'Porto Itacoatiara', kind: 'port', city: 'Itacoatiara', state: 'AM', corridorId: 'madeira', importance: 'high', operationalRole: 'transbordo-madeira', cargoProfile: 'fuel,grains', waterway: 'amazonas', sourceInspiration: 'ANTAQ Itacoatiara' },
  { id: 'port-porto-velho', name: 'Porto Porto Velho', kind: 'port', city: 'Porto Velho', state: 'RO', corridorId: 'madeira', importance: 'high', operationalRole: 'origem-madeira', cargoProfile: 'grains,fuel', waterway: 'madeira', sourceInspiration: 'BIT Madeira RO' },
  { id: 'port-macapa', name: 'Porto Macapá', kind: 'port', city: 'Macapá', state: 'AP', corridorId: 'amazonas', importance: 'medium', operationalRole: 'acesso-ap', cargoProfile: 'general', waterway: 'amazonas', sourceInspiration: 'ANTAQ AP' },
  { id: 'port-abaetetuba', name: 'Porto Abaetetuba', kind: 'port', city: 'Abaetetuba', state: 'PA', corridorId: 'barra-norte', importance: 'medium', operationalRole: 'apoio-estuario', cargoProfile: 'general', waterway: 'para-estuario', sourceInspiration: 'Domain-inspired estuário' },
  { id: 'port-obidos', name: 'Porto Óbidos', kind: 'port', city: 'Óbidos', state: 'PA', corridorId: 'amazonas', importance: 'medium', operationalRole: 'calha-estreita', cargoProfile: 'general', waterway: 'amazonas', sourceInspiration: 'BIT calha Óbidos' },
  { id: 'port-parintins', name: 'Porto Parintins', kind: 'port', city: 'Parintins', state: 'AM', corridorId: 'amazonas', importance: 'medium', operationalRole: 'apoio-interior', cargoProfile: 'general', waterway: 'amazonas', sourceInspiration: 'ANTAQ interior AM' },
  { id: 'port-tefe', name: 'Porto Tefé', kind: 'port', city: 'Tefé', state: 'AM', corridorId: 'amazonas', importance: 'medium', operationalRole: 'interior-solimoes', cargoProfile: 'general', waterway: 'solimoes', sourceInspiration: 'ANTAQ Solimões' },
  { id: 'port-maraba', name: 'Porto Interior Marabá', kind: 'port', city: 'Marabá', state: 'PA', corridorId: 'tocantins-araguaia', importance: 'high', operationalRole: 'origem-tocantins', cargoProfile: 'grains,ore', waterway: 'tocantins', sourceInspiration: 'BIT Tocantins origem' },
  { id: 'terminal-miritituba', name: 'Terminal Miritituba', kind: 'terminal', city: 'Miritituba', state: 'PA', corridorId: 'tapajos-teles-pires', importance: 'high', operationalRole: 'transbordo-soja', cargoProfile: 'grains', waterway: 'tapajos', sourceInspiration: 'ANTAQ Miritituba' },
  { id: 'port-breves', name: 'Porto Breves', kind: 'port', city: 'Breves', state: 'PA', corridorId: 'barra-norte', importance: 'medium', operationalRole: 'marajo-gateway', cargoProfile: 'general', waterway: 'para-estuario', sourceInspiration: 'Domain-inspired Marajó' },
  { id: 'port-alenquer', name: 'Porto Alenquer', kind: 'port', city: 'Alenquer', state: 'PA', corridorId: 'amazonas', importance: 'low', operationalRole: 'apoio-regional', cargoProfile: 'general', waterway: 'amazonas', sourceInspiration: 'Domain-inspired' },
  { id: 'port-juruti', name: 'Porto Juruti', kind: 'port', city: 'Juruti', state: 'PA', corridorId: 'amazonas', importance: 'medium', operationalRole: 'bauxite-hub', cargoProfile: 'ore', waterway: 'amazonas', sourceInspiration: 'ANTAQ mineral' },
  { id: 'port-altamira', name: 'Porto Altamira', kind: 'port', city: 'Altamira', state: 'PA', corridorId: 'amazonas', importance: 'medium', operationalRole: 'xingu-access', cargoProfile: 'general', waterway: 'xingu', sourceInspiration: 'Domain-inspired Xingu' },
  { id: 'port-prainha', name: 'Porto Prainha', kind: 'port', city: 'Prainha', state: 'PA', corridorId: 'amazonas', importance: 'low', operationalRole: 'calha-support', cargoProfile: 'general', waterway: 'amazonas', sourceInspiration: 'Domain-inspired calha' },
  { id: 'transshipment-belem-mosqueiro', name: 'Transbordo Mosqueiro', kind: 'transshipment', city: 'Belém', state: 'PA', corridorId: 'barra-norte', importance: 'medium', operationalRole: 'transbordo-estuario', cargoProfile: 'general', waterway: 'para-estuario', sourceInspiration: 'Domain-inspired' },
  { id: 'transshipment-santarem-tapajos', name: 'Transbordo Santarém Tapajós', kind: 'transshipment', city: 'Santarém', state: 'PA', corridorId: 'tapajos-teles-pires', importance: 'high', operationalRole: 'transbordo-graos', cargoProfile: 'grains', waterway: 'tapajos', sourceInspiration: 'ANTAQ transbordo' },
  { id: 'transshipment-itaituba-flex', name: 'Transbordo Itaituba Flex', kind: 'transshipment', city: 'Itaituba', state: 'PA', corridorId: 'tapajos-teles-pires', importance: 'medium', operationalRole: 'transbordo-flex', cargoProfile: 'grains', waterway: 'tapajos', sourceInspiration: 'Domain-inspired' },
  { id: 'terminal-santarem-oeste', name: 'Terminal Santarém Oeste', kind: 'terminal', city: 'Santarém', state: 'PA', corridorId: 'amazonas', importance: 'high', operationalRole: 'transbordo-graos', cargoProfile: 'grains', waterway: 'amazonas', sourceInspiration: 'ANTAQ Santarém' },
];

const logisticsNodes = {
  type: 'FeatureCollection',
  features: NODE_DEFS.map((n) =>
    pointFeature(n.id, n.name, n.kind, NODES[n.id], {
      corridorId: n.corridorId,
      city: n.city,
      state: n.state,
      waterway: n.waterway,
      importance: n.importance,
      operationalRole: n.operationalRole,
      cargoProfile: n.cargoProfile,
      strategicRole: n.operationalRole,
      operationalStatus: n.id === 'terminal-vila-conde' ? 'attention' : 'active',
      navigabilityRisk: n.importance === 'critical' ? 'low' : 'medium',
      referenceContext: `V2.6 GOV-enriched — ${n.city}/${n.state}`,
      sourceInspiration: n.sourceInspiration,
      visualPurpose: n.kind === 'transshipment' ? 'transshipment-node' : 'logistics-node',
    }),
  ),
};

// ——— Risk zones (polygons) ———
function boxAround(center, dLng, dLat) {
  const [lng, lat] = center;
  return [
    [lng - dLng, lat - dLat],
    [lng + dLng, lat - dLat],
    [lng + dLng, lat + dLat],
    [lng - dLng, lat + dLat],
    [lng - dLng, lat - dLat],
  ];
}

const riskZones = {
  type: 'FeatureCollection',
  features: [
    polygonFeature('risk-obidos-calha', 'Zona calha Óbidos', 'risk-zone', boxAround(NODES['port-obidos'], 0.35, 0.12), {
      corridorId: 'amazonas',
      navigabilityRisk: 'high',
      operationalStatus: 'attention',
      importance: 'high',
      sourceInspiration: 'Domain-inspired bottleneck',
      sourceType: 'domain-inspired',
      visualPurpose: 'risk-zone',
    }),
    polygonFeature('risk-tocantins-draft', 'Zona calado Tocantins', 'risk-zone', boxAround(NODES['port-maraba'], 0.45, 0.15), {
      corridorId: 'tocantins-araguaia',
      navigabilityRisk: 'critical',
      operationalStatus: 'attention',
      sourceInspiration: 'BIT seca Tocantins — schematic',
      visualPurpose: 'risk-zone',
    }),
    polygonFeature('floodplain-marajo', 'Várzea Marajó (sutil)', 'floodplain', boxAround(NODES['port-breves'], 0.55, 0.2), {
      corridorId: 'barra-norte',
      importance: 'low',
      sourceInspiration: 'ANA bacias — schematic floodplain',
      sourceType: 'domain-inspired',
      confidence: 'low',
      visualPurpose: 'floodplain-context',
    }),
    polygonFeature('floodplain-amazonas-central', 'Várzea Amazonas central', 'floodplain', boxAround([-53.5, -1.85], 0.7, 0.18), {
      corridorId: 'amazonas',
      importance: 'low',
      sourceType: 'synthetic',
      confidence: 'low',
      visualPurpose: 'floodplain-context',
    }),
    polygonFeature('risk-estuario-traffic', 'Zona tráfego estuário', 'risk-zone', boxAround(NODES['port-belem'], 0.4, 0.14), {
      corridorId: 'barra-norte',
      navigabilityRisk: 'medium',
      operationalStatus: 'attention',
      sourceInspiration: 'ANTAQ tráfego estuário',
      visualPurpose: 'risk-zone',
    }),
  ],
};

// ——— Cargo routes ———
function cargoRoute(cargoId, routeId, corridorId, originNodeId, destNodeId, waypoints, progress, eta, status) {
  const coords = buildCurvedLine(waypoints, 12, 0.05, cargoId.charCodeAt(cargoId.length - 1) * 0.1);
  const traveledEnd = Math.max(2, Math.floor(coords.length * progress));
  const traveled = coords.slice(0, traveledEnd);
  const remaining = coords.slice(traveledEnd - 1);
  const vessel = traveled[traveled.length - 1] ?? coords[0];
  const bbox = bboxFromCoords(coords);
  const dist = polylineKm(coords);

  return {
    type: 'Feature',
    properties: {
      id: routeId,
      name: `${originNodeId} → ${destNodeId} (${cargoId})`,
      kind: 'route',
      cargoId,
      routeId,
      corridorId,
      originNodeId,
      destinationNodeId: destNodeId,
      progress,
      currentLocation: vessel,
      distanceKmApprox: dist,
      etaWindowMock: eta,
      operationalStatus: status,
      bbox,
      strategicRole: `demo-route-${cargoId.toLowerCase()}`,
      referenceContext: `Rota demo ${cargoId} — source-inspired, não oficial`,
      sourceInspiration: 'HydroRivers domain mock V2.6',
      sourceType: 'domain-inspired',
      confidence: 'medium',
      mockLevel: 'enriched',
      lastReviewed: LAST_REVIEWED,
      visualPurpose: 'cargo-route',
      classification: 'demo-cargo-route',
    },
    geometry: { type: 'LineString', coordinates: coords },
  };
}

const route001 = cargoRoute(
  'CARGO-001',
  'route-cargo-001',
  'amazonas',
  'port-belem',
  'port-santarem',
  [
    NODES['port-belem'],
    NODES['transshipment-belem-mosqueiro'],
    NODES['port-abaetetuba'],
    NODES['port-breves'],
    NODES['port-prainha'],
    NODES['port-obidos'],
    NODES['port-santarem'],
  ],
  0.15,
  '2026-06-02/2026-06-05',
  'in-transit',
);

const route002 = cargoRoute(
  'CARGO-002',
  'route-cargo-002',
  'amazonas',
  'port-manaus',
  'port-belem',
  [
    NODES['port-manaus'],
    NODES['port-itacoatiara'],
    NODES['port-parintins'],
    NODES['port-juruti'],
    NODES['port-obidos'],
    NODES['port-santarem'],
    NODES['port-prainha'],
    NODES['port-breves'],
    NODES['port-abaetetuba'],
    NODES['port-belem'],
  ],
  0.25,
  '2026-06-08/2026-06-14',
  'in-transit',
);

const route004 = cargoRoute(
  'CARGO-004',
  'route-cargo-004',
  'tocantins-araguaia',
  'port-maraba',
  'terminal-vila-conde',
  [
    NODES['port-maraba'],
    NODES['port-obidos'],
    NODES['port-abaetetuba'],
    NODES['port-breves'],
    NODES['port-barcarena'],
    NODES['terminal-vila-conde'],
  ],
  0.4,
  '2026-05-28/2026-06-01',
  'in-transit',
);

const cargoRoutes = {
  type: 'FeatureCollection',
  features: [route001, route002, route004],
};

const FILES = {
  'amazon-main-rivers.mock.geojson': mainRivers,
  'amazon-secondary-rivers.mock.geojson': secondaryRivers,
  'amazon-operational-channels.mock.geojson': operationalChannels,
  'amazon-navigable-corridors.mock.geojson': navigableCorridors,
  'amazon-logistics-nodes.mock.geojson': logisticsNodes,
  'amazon-risk-zones.mock.geojson': riskZones,
  'cargo-routes.mock.geojson': cargoRoutes,
};

for (const [name, data] of Object.entries(FILES)) {
  const path = join(OUT_DIR, name);
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  const bytes = Buffer.byteLength(JSON.stringify(data), 'utf8');
  console.log(`${name}: ${data.features.length} features, ${bytes} bytes`);
}

const combined = Object.values(FILES).reduce((s, d) => s + Buffer.byteLength(JSON.stringify(d), 'utf8'), 0);
console.log(`Combined: ${combined} bytes (budget 512000)`);
