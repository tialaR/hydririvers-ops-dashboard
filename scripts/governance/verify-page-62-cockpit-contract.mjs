#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const failures = [];

const read = async (relativePath) =>
  readFile(path.resolve(root, relativePath), 'utf8');

async function walk(dir) {
  const entries = await readdir(path.resolve(root, dir), { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relative = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(relative));
    else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) files.push(relative);
  }

  return files;
}

const preview = await read('src/features/cargo/owned/stories/page-62-cargo-cockpit-preview.tsx');
const stories = await read('src/features/cargo/owned/stories/page-62-cargo-cockpit.stories.tsx');
const chartIndex = await read('src/shared/design-system/patterns/operational-chart/index.ts');
const chartCore = await read('src/shared/design-system/patterns/operational-chart/operational-echart.tsx');
const documents = await read('src/features/cargo/components/documents-occurrence/cargo-documents-evidence-panel.tsx');
const occurrence = await read('src/features/cargo/components/documents-occurrence/cargo-occurrence-summary.tsx');
const d06Stories = await read('src/features/cargo/components/documents-occurrence/page-62-d06.stories.tsx');
const d07Stories = await read('src/features/cargo/components/documents-occurrence/page-62-d07.stories.tsx');
const packageJson = JSON.parse(await read('package.json'));

for (const required of [
  'OperationalGaugeChart',
  'OperationalTelemetryChart',
  'MotionConfig',
  'AnimatePresence',
  'ShipmentCard',
  'reducedMotion="user"',
]) {
  if (!preview.includes(required)) failures.push(`Page 62 preview missing contract anchor: ${required}`);
}

for (const required of ['CockpitReference', 'TimelineReference']) {
  if (!stories.includes(`export const ${required}`)) {
    failures.push(`Page 62 Storybook missing state: ${required}`);
  }
}

for (const required of ['CargoDocumentsEvidencePanel', 'Pré-visualizar evidência', 'Corrigir manifesto']) {
  if (!documents.includes(required)) failures.push(`D06 Documents contract missing anchor: ${required}`);
}
for (const required of ['CargoOccurrenceSummary', 'Divergência no manifesto', 'Plano de mitigação']) {
  if (!occurrence.includes(required)) failures.push(`D07 Occurrence contract missing anchor: ${required}`);
}
if (!d06Stories.includes('export const Reference')) failures.push('D06 Storybook reference missing');
if (!d07Stories.includes('export const Reference')) failures.push('D07 Storybook reference missing');

for (const required of ['OperationalGaugeChart', 'OperationalTelemetryChart']) {
  if (!chartIndex.includes(required)) failures.push(`operational chart DS missing export: ${required}`);
}

for (const required of [
  "from 'echarts/core'",
  "from 'echarts/charts'",
  'CanvasRenderer',
  'useDirtyRect: true',
]) {
  if (!chartCore.includes(required)) failures.push(`ECharts renderer missing production anchor: ${required}`);
}

if (!packageJson.dependencies?.echarts) failures.push('ECharts must be a runtime dependency');
if (!packageJson.dependencies?.motion) failures.push('Motion must be a runtime dependency');
if (packageJson.dependencies?.recharts) failures.push('Recharts must not remain after Page 62 chart migration');
if (packageJson.dependencies?.['framer-motion']) failures.push('framer-motion duplicate must not remain; use motion/react');

const sourceFiles = await walk('src');
for (const file of sourceFiles) {
  const source = await read(file);
  if (/from\s+['"]recharts['"]/.test(source)) failures.push(`legacy Recharts import remains: ${file}`);
  if (/from\s+['"]framer-motion['"]/.test(source)) failures.push(`legacy framer-motion import remains: ${file}`);
}

if (failures.length) {
  console.error('PAGE 62 COCKPIT CONTRACT FAIL');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('PAGE 62 COCKPIT CONTRACT PASS', {
  chartStack: 'Apache ECharts 6 + CanvasRenderer',
  interactionStack: 'Motion for React',
  states: ['CockpitReference', 'TimelineReference', 'D06 Reference', 'D07 Reference'],
  shipmentCardReuse: true,
  legacyChartImports: false,
  duplicateMotionPackage: false,
});
