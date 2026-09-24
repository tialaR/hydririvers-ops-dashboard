#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const root = process.cwd();
const read = async (path) => readFile(new URL(path, `file://${root}/`), 'utf8');

const failures = [];

const canonical = await read('src/features/cargo/components/shipment-card/shipment-card.tsx');
const styles = await read('src/features/cargo/components/shipment-card/shipment-card.module.sass');
const stories = await read('src/features/cargo/components/shipment-card/shipment-card.stories.tsx');
const page61 = await read('src/features/cargo/owned/components/owned-cargo-shipment-card.tsx');
const page62 = await read('src/features/cargo/owned/stories/page-62-cargo-cockpit-preview.tsx');
const manifest = JSON.parse(await read('docs/governance/figma-freeze/page-62/manifest.json'));

for (const required of [
  'data-testid={testId}',
  'data-testid="shipment-card-status"',
  "data-state-code={origin.stateCode}",
  "data-state-code={destination.stateCode}",
]) {
  if (!canonical.includes(required)) failures.push(`canonical ShipmentCard missing contract anchor: ${required}`);
}

for (const tone of ['delayed', 'inTransit', 'completed', 'open', 'blocked']) {
  if (!styles.includes(`.status[data-tone='${tone}']`)) {
    failures.push(`ShipmentCard missing semantic status style: ${tone}`);
  }
}

for (const variant of ['Attention', 'InTransit', 'Delivered', 'Open', 'Blocked', 'AllOperationalVariants']) {
  if (!stories.includes(`export const ${variant}`)) failures.push(`Storybook missing ShipmentCard variant: ${variant}`);
}

if (!stories.includes("tags: ['autodocs']")) failures.push('ShipmentCard must keep Storybook Autodocs');
if (!page61.includes("from '@/features/cargo/components/shipment-card/shipment-card'")) {
  failures.push('Page 61 must reuse the canonical ShipmentCard');
}
if (!page62.includes("from '@/features/cargo/components/shipment-card/shipment-card'")) {
  failures.push('Page 62 composition must reuse the canonical ShipmentCard');
}

for (const forbidden of ['className={styles.card}', '<div className={styles.route}', '<div className={styles.cardTransit}']) {
  if (page61.includes(forbidden)) failures.push(`Page 61 duplicated ShipmentCard anatomy: ${forbidden}`);
}

if (manifest.canonicalShipmentCard?.crop?.width !== 386 || manifest.canonicalShipmentCard?.crop?.height !== 232) {
  failures.push('Page 62 canonical ShipmentCard reference crop must remain 386x232');
}
if (!manifest.source?.svgSha256 || !manifest.source?.pngSha256) {
  failures.push('Page 62 reference source hashes are required');
}

if (failures.length) {
  console.error('SHIPMENT CARD DESIGN CONTRACT FAIL');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('SHIPMENT CARD DESIGN CONTRACT PASS', {
  canonicalComponent: true,
  page61Reuse: true,
  page62Reuse: true,
  autodocs: true,
  variants: ['Attention', 'InTransit', 'Delivered', 'Open', 'Blocked'],
  stateBrands: ['AM', 'PA'],
  referenceCrop: '386x232',
});
