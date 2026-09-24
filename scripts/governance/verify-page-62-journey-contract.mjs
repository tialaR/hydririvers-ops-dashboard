#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const read = (relativePath) => readFile(path.resolve(root, relativePath), 'utf8');

const [
  manifestRaw,
  research,
  stateMachine,
  types,
  filters,
  mock,
  stories,
  surfaces,
  tokens,
  preview,
  shipmentCss,
  cockpitCss,
  documentsCss,
  journeyCss,
  chartCss,
  overview,
  echartCore,
  decisionCharts,
] = await Promise.all([
  read('docs/governance/figma-freeze/page-62/screen-delivery-manifest.json'),
  read('docs/product/PAGE-62-SHIPPER-DOMAIN-RESEARCH-AND-JOURNEY-v1.0.md'),
  read('docs/product/PAGE-62-EXPERIENCE-STATE-MACHINE-v1.0.md'),
  read('src/features/cargo/owned/domain/shipper-journey.types.ts'),
  read('src/features/cargo/owned/domain/shipper-portfolio-filters.ts'),
  read('src/features/cargo/owned/mocks/page-62-shipper-journey.mock.ts'),
  read('src/features/cargo/components/shipper-journey/page-62-shipper-journey.stories.tsx'),
  read('src/features/cargo/components/shipper-journey/shipper-journey-surfaces.tsx'),
  read('src/shared/design-system/foundations/page-62-semantic-tokens.css'),
  read('.storybook/preview.tsx'),
  read('src/features/cargo/components/shipment-card/shipment-card.module.sass'),
  read('src/features/cargo/components/cargo-cockpit/cargo-cockpit-panels.module.sass'),
  read('src/features/cargo/components/documents-occurrence/documents-occurrence.module.sass'),
  read('src/features/cargo/components/shipper-journey/shipper-journey.module.sass'),
  read('src/shared/design-system/patterns/operational-chart/operational-chart-card.module.sass'),
  read('src/features/cargo/components/shipper-journey/page-62-overview-surface.tsx'),
  read('src/shared/design-system/patterns/operational-chart/operational-echart.tsx'),
  read('src/shared/design-system/patterns/operational-chart/operational-decision-charts.tsx'),
]);

const manifest = JSON.parse(manifestRaw);
const screenIds = new Set((manifest.screens ?? []).map((screen) => screen.id));

for (let index = 1; index <= 13; index += 1) {
  const id = 'D' + String(index).padStart(2, '0');
  if (!screenIds.has(id)) failures.push(`screen manifest missing ${id}`);
}

if (manifest.flowBlueprint?.sha256 !== 'fa54c14618aff4bff3c3b6f52a7745cdbf99fe355a58092b0ca4c31344a8e871') {
  failures.push('M01 desktop flow blueprint hash is not frozen');
}

const negotiationComposite = (manifest.compositeReferences ?? []).find(
  (item) => item.file === 'Negotiation + Communication.svg',
);
if (!negotiationComposite) failures.push('Negotiation + Communication composite reference missing');
if (negotiationComposite?.sha256 !== '2e285c2df656d172dce0db18a4b9f015bfc2017c6e4335fa31cb05e9b3ca7e6a') {
  failures.push('Negotiation + Communication source hash changed');
}
if (JSON.stringify(negotiationComposite?.mapsTo) !== JSON.stringify(['D08', 'D09'])) {
  failures.push('Negotiation + Communication must map to D08 + D09');
}

for (const required of [
  'DNIT',
  'ANA',
  'ANTAQ',
  'Receita Federal',
  'CHM',
  'CARTEIRA → DETECTAR → SELECIONAR → ENTENDER → INVESTIGAR → DECIDIR → AGIR',
  'Mock → API readiness',
]) {
  if (!research.includes(required)) failures.push(`domain research missing anchor: ${required}`);
}

for (const required of [
  'discovery',
  'cockpit',
  'documentsRisk',
  'negotiation',
  'review',
  'feedback',
  'correction',
  'monitoring',
]) {
  if (!stateMachine.includes(required)) failures.push(`state machine missing: ${required}`);
}

for (const required of [
  'OperationalSourceRef',
  'HydroCondition',
  'ShipperDocumentEvidence',
  'ShipperOccurrence',
  'ShipperProposal',
  'ShipperDecision',
  'ShipperJourneyEvent',
  'ShipperJourneySnapshot',
  'ShipperPortfolioFilters',
]) {
  if (!types.includes(required)) failures.push(`API-ready domain missing: ${required}`);
}

for (const required of [
  'status',
  'actionRequired',
  'corridor',
  'navigability',
  'documentState',
  'freshness',
  'etaWindow',
  'openOccurrence',
]) {
  if (!filters.includes(`key: '${required}'`)) failures.push(`filter facet missing: ${required}`);
}

if (!mock.includes("mode: 'demo'")) failures.push('Page 62 mock must be explicitly DEMO');
if (!mock.includes("kind: 'mdfe'")) failures.push('MDF-e must be typed explicitly in the mock');
if (!mock.includes('arrivalAt')) failures.push('proposal arrivalAt must be explicit');
if (!mock.includes('valueBRLPerHour')) failures.push('demurrage unit must be explicit and hourly for the reference scenario');

for (const required of [
  'Overview',
  'D08D09Negotiation',
  'D10ActionReview',
  'D11ActionFeedback',
  'D12CorrectionResubmit',
  'D13Monitoring',
]) {
  if (!stories.includes(`export const ${required}`)) failures.push(`Storybook journey state missing: ${required}`);
}

for (const required of [
  'page62-d08-d09-negotiation',
  'page62-d09-communication',
  'page62-d10-review',
  'page62-d11-feedback',
  'page62-d12-correction',
  'page62-d13-monitoring',
]) {
  if (!surfaces.includes(required)) failures.push(`journey surface contract missing: ${required}`);
}

for (const required of [
  '--hy-p62-canvas',
  '--hy-p62-surface',
  '--hy-p62-border',
  '--hy-p62-text',
  '--hy-p62-warning',
  '--hy-p62-critical',
  '--hy-p62-status-in-transit',
]) {
  if (!tokens.includes(required)) failures.push(`Page 62 semantic token missing: ${required}`);
}

for (const required of ['ShipperOperationMap', 'HydroLevelTrendChart', 'OperationalGaugeChart', 'page62-overview']) {
  if (!overview.includes(required)) failures.push(`overview intelligence missing: ${required}`);
}

if (!echartCore.includes('useDirtyRect: false')) failures.push('ECharts dirty-rect must remain disabled to avoid hover repaint artifacts');

for (const required of ['ProposalTradeoffRadar', 'DocumentWeightComparisonChart', 'FollowUpHealthChart', 'HydroLevelTrendChart']) {
  if (!decisionCharts.includes(`export function ${required}`)) failures.push(`decision visualization missing: ${required}`);
}

for (const required of ['ProposalTradeoffRadar', 'DocumentWeightComparisonChart', 'FollowUpHealthChart', 'OperationalGaugeChart']) {
  if (!surfaces.includes(required)) failures.push(`journey surface is not using visualization: ${required}`);
}

if (!preview.includes("page-62-semantic-tokens.css")) {
  failures.push('Storybook does not load Page 62 semantic tokens');
}

const remOnlyFiles = [
  ['shipment-card.module.sass', shipmentCss],
  ['cargo-cockpit-panels.module.sass', cockpitCss],
  ['documents-occurrence.module.sass', documentsCss],
  ['shipper-journey.module.sass', journeyCss],
  ['operational-chart-card.module.sass', chartCss],
];

for (const [name, source] of remOnlyFiles) {
  const pxMatches = source.match(/(?:^|[^-\w])(-?\d+(?:\.\d+)?)px\b/g) ?? [];
  if (pxMatches.length) failures.push(`${name} contains px geometry: ${pxMatches.join(', ')}`);
}

if (failures.length) {
  console.error('PAGE 62 JOURNEY CONTRACT FAIL');
  failures.forEach((failure) => console.error('- ' + failure));
  process.exit(1);
}

console.log('PAGE 62 JOURNEY CONTRACT PASS', {
  screens: 13,
  groupedExperiences: 8,
  negotiationComposite: 'D08 + D09',
  dataMode: 'DEMO / API-ready repository boundary',
  semanticTokens: true,
  remOnly: true,
});
