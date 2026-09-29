#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const files = {
  gate: 'docs/governance/HYDRORIVERS-SEMANTIC-COLOR-AND-STATE-VISUAL-GATE-v1.0.md',
  visualLanguage: 'docs/product/hydririvers-visual-language.md',
  evidence: 'src/shared/design-system/components/evidence-folder-item/evidence-folder-item.tsx',
  cockpit: 'src/features/cargo/owned/stories/page-62-cargo-cockpit-preview.tsx',
  documents: 'src/features/cargo/components/documents-occurrence/cargo-documents-evidence-panel.tsx',
  occurrence: 'src/features/cargo/components/documents-occurrence/cargo-occurrence-summary.tsx',
  tokens: 'src/shared/design-system/foundations/page-62-semantic-tokens.css',
};

const source = Object.fromEntries(
  await Promise.all(
    Object.entries(files).map(async ([key, file]) => [key, await readFile(file, 'utf8')]),
  ),
);

const failures = [];

for (const required of [
  'COLOR COMMUNICATES STATE. IT MUST NOT BECOME DECORATION.',
  'NEUTRAL INFORMATION STAYS IN THE NEUTRAL PALETTE UNTIL SEMANTICS REQUIRE COLOR.',
  'desktop + mobile',
  'data-semantic-status',
  'data-semantic-role="neutral-icon"',
]) {
  if (!source.gate.includes(required)) failures.push(`semantic color gate missing: ${required}`);
}

if (!source.visualLanguage.includes('HYDRORIVERS-SEMANTIC-COLOR-AND-STATE-VISUAL-GATE-v1.0.md')) {
  failures.push('visual language is not bound to semantic color gate');
}

for (const required of [
  'data-semantic-status',
  'data-semantic-role="neutral-icon"',
  'aria-pressed={selected}',
  "variant = 'card'",
]) {
  if (!source.evidence.includes(required)) failures.push(`EvidenceFolderItem semantic contract missing: ${required}`);
}

for (const required of [
  "type WorkspaceMode = 'cockpit' | 'timeline' | 'documents'",
  "setMode('documents')",
  'aria-pressed={active}',
  'data-semantic-role="neutral-icon"',
  'CargoDocumentsEvidencePanel',
  'CargoOccurrenceSummary',
  'EvidenceFolderItem',
]) {
  if (!source.cockpit.includes(required)) failures.push(`cockpit semantic integration missing: ${required}`);
}

for (const required of [
  'variant="card"',
  'document-inspector',
  'MDF-e',
  'document-row-',
]) {
  if (!source.documents.includes(required)) failures.push(`documents evidence contract missing: ${required}`);
}

for (const required of [
  'data-semantic-status="warning"',
  'data-semantic-role="neutral-icon"',
  'occurrence-mitigation',
  'occurrence-primary-action',
  'OperationalAlert',
]) {
  if (!source.occurrence.includes(required)) failures.push(`occurrence semantic contract missing: ${required}`);
}

for (const required of [
  '--hy-p62-status-monitor',
  '--hy-p62-status-informational',
  '--hy-p62-status-current',
]) {
  if (!source.tokens.includes(required)) failures.push(`semantic status token missing: ${required}`);
}

if (failures.length) {
  console.error('SEMANTIC COLOR & STATE VISUAL CONTRACT FAIL');
  failures.forEach((failure) => console.error('- ' + failure));
  process.exit(1);
}

console.log('SEMANTIC COLOR & STATE VISUAL CONTRACT PASS', {
  neutralFirst: true,
  crossDevice: true,
  selectedCurrentExplicit: true,
  reusableEvidencePattern: true,
});
