#!/usr/bin/env node
/**
 * Generates HydriRivers design tokens from Figma iOS Kit JSON exports.
 * Raw: --hydro-kit-* | Semantic app aliases: --hydro-*
 */

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  collectSemanticAliases,
  SEMANTIC_FONT_LITERALS,
  SEMANTIC_MOTION_LITERALS,
} from './semantic-aliases.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const INPUT_DIR = path.join(__dirname, 'input');
const OUTPUT_DIR = path.join(ROOT, 'src/shared/design-system/tokens/generated');
const REPORT_DIR = path.join(__dirname, 'output');

const COLLECTIONS = [
  { key: 'colors', label: 'Colors', themed: true },
  { key: 'kit', label: 'Kit' },
  { key: 'size', label: 'Size' },
  { key: 'shape', label: 'Shape' },
  { key: 'responsive', label: 'Responsive' },
  { key: 'font-theme', label: 'Font theme' },
  { key: 'typography', label: 'Typography' },
  { key: 'typography-primitives', label: 'Typography Primitives' },
  { key: 'typescale', label: 'Typescale' },
  { key: 'icons', label: 'Icons', themed: true },
];

const COLOR_MODE_MAP = {
  'light.tokens.json': 'light',
  'dark.tokens.json': 'dark',
  'ic - light.tokens.json': 'ic-light',
  'ic - dark.tokens.json': 'ic-dark',
};

const PX_TYPES = new Set(['number']);
const DIMENSION_SCOPES = new Set([
  'GAP',
  'CORNER_RADIUS',
  'WIDTH_HEIGHT',
  'FONT_SIZE',
  'LINE_HEIGHT',
  'LETTER_SPACING',
  'EFFECT_FLOAT',
  'STROKE_FLOAT',
]);

function slugifySegment(segment) {
  return segment
    .trim()
    .toLowerCase()
    .replace(/\s*\(\s*/g, '-')
    .replace(/\s*\)\s*/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildRawVarName(collectionLabel, pathSegments) {
  const collectionSlug = slugifySegment(collectionLabel);
  const pathSlug = pathSegments.map(slugifySegment).filter(Boolean).join('-');
  const suffix =
    collectionSlug === 'kit' ? pathSlug : [collectionSlug, pathSlug].filter(Boolean).join('-');
  return `--hydro-kit-${suffix}`;
}

function toRefKey(collectionLabel, refPath) {
  const segments = refPath.split('.').map((part) => part.trim());
  return buildRawVarName(collectionLabel, segments).slice(2);
}

function formatColor(value) {
  const alpha = value.alpha ?? 1;
  if (value.hex && alpha >= 1) {
    return value.hex;
  }
  const [r, g, b] = value.components.map((c) => Math.round(c * 255));
  return `rgba(${r}, ${g}, ${b}, ${Number(alpha.toFixed(4))})`;
}

function formatTokenValue(type, value, extensions) {
  if (typeof value === 'string') {
    if (value.startsWith('{') && value.endsWith('}')) {
      return { kind: 'alias', ref: value.slice(1, -1) };
    }
    return { kind: 'literal', css: JSON.stringify(value) };
  }

  if (type === 'color' && value && typeof value === 'object') {
    return { kind: 'literal', css: formatColor(value) };
  }

  if (type === 'number' && typeof value === 'number') {
    const scopes = extensions?.['com.figma.scopes'] ?? [];
    const usePx = scopes.some((scope) => DIMENSION_SCOPES.has(scope)) || PX_TYPES.has(type);
    return { kind: 'literal', css: usePx ? `${value}px` : String(value) };
  }

  return { kind: 'literal', css: String(value) };
}

function walkTokens(node, pathSegments, collectionLabel, mode, sink, aliasIndex) {
  if (!node || typeof node !== 'object') {
    return;
  }

  if (Object.hasOwn(node, '$type') && Object.hasOwn(node, '$value')) {
    const name = buildRawVarName(collectionLabel, pathSegments);
    const key = name.slice(2);
    const formatted = formatTokenValue(node.$type, node.$value, node.$extensions);

    const entry = {
      name,
      key,
      collection: collectionLabel,
      path: pathSegments.join(' / '),
      type: node.$type,
      mode,
    };

    if (formatted.kind === 'alias') {
      entry.aliasRef = formatted.ref;
      aliasIndex.push(entry);
    } else {
      entry.value = formatted.css;
    }

    sink.push(entry);
    return;
  }

  for (const [childKey, childValue] of Object.entries(node)) {
    if (childKey.startsWith('$')) {
      continue;
    }
    walkTokens(childValue, [...pathSegments, childKey], collectionLabel, mode, sink, aliasIndex);
  }
}

async function readCollectionFiles(collectionKey) {
  const dir = path.join(INPUT_DIR, collectionKey);
  const files = await readdir(dir);
  const parsed = [];

  for (const file of files.filter((f) => f.endsWith('.tokens.json'))) {
    const raw = await readFile(path.join(dir, file), 'utf8');
    const json = JSON.parse(raw);
    const normalized = file.toLowerCase();
    parsed.push({ file, normalized, json });
  }

  return parsed;
}

function resolveAliases(tokens, collectionLabel) {
  const byKey = new Map(tokens.map((token) => [token.key, token]));

  for (const token of tokens) {
    if (!token.aliasRef || token.value) {
      continue;
    }

    const targetKey = toRefKey(collectionLabel, token.aliasRef);
    const target = byKey.get(targetKey);

    if (target?.value) {
      token.value = target.value;
      continue;
    }

    token.value = `var(--${targetKey})`;
  }

  return tokens;
}

function groupColorModes(tokens) {
  const grouped = new Map();

  for (const token of tokens) {
    if (!grouped.has(token.key)) {
      grouped.set(token.key, { ...token, modes: {} });
    }
    grouped.get(token.key).modes[token.mode] = token.value ?? `var(--${toRefKey(token.collection, token.aliasRef)})`;
  }

  return [...grouped.values()];
}

function emitRawCss(flatTokens, colorGroups) {
  const lines = [
    '/* Generated by tools/design-token-import/generate-design-tokens.mjs — do not edit. */',
    ':root {',
  ];

  const staticTokens = flatTokens.filter((t) => t.collection !== 'Colors' && t.collection !== 'Icons');
  for (const token of staticTokens) {
    if (token.value) {
      lines.push(`  ${token.name}: ${token.value};`);
    }
  }

  for (const token of colorGroups) {
    const lightValue = token.modes.light ?? token.modes['ic-light'];
    if (lightValue) {
      lines.push(`  ${token.name}: ${lightValue};`);
    }
  }

  lines.push('}', '');

  lines.push("[data-hydro-theme='dark'] {");
  for (const token of colorGroups) {
    const darkValue = token.modes.dark ?? token.modes['ic-dark'];
    if (darkValue) {
      lines.push(`  ${token.name}: ${darkValue};`);
    }
  }
  lines.push('}', '');

  return `${lines.join('\n')}\n`;
}

function emitRawModuleScss(flatTokens, colorGroups) {
  const exports = [];

  for (const token of flatTokens) {
    if (token.collection === 'Colors' || token.collection === 'Icons') {
      continue;
    }
    if (!token.value) {
      continue;
    }
    const exportName = token.key.replace(/-/g, '_');
    exports.push(`  ${exportName}: var(${token.name});`);
  }

  for (const token of colorGroups) {
    const exportName = token.key.replace(/-/g, '_');
    exports.push(`  ${exportName}: var(${token.name});`);
  }

  return `/* Generated by tools/design-token-import/generate-design-tokens.mjs — do not edit. */

/* CSS Modules bridge — raw tokens live on :root via hydro-kit.css (loaded globally). */
.hydroKitTheme {
  /* intentionally empty; satisfies CSS Modules pure-selector rules */
}

:export {
${exports.join('\n')}
}
`;
}

function collectSemanticVarLines(aliasReport) {
  const lines = [];

  for (const entry of collectSemanticAliases()) {
    if (!entry.raw) {
      continue;
    }
    const rawVar = entry.raw;
    if (!aliasReport.valid.has(rawVar)) {
      aliasReport.missing.push(entry);
      continue;
    }
    lines.push(`  --${entry.semantic}: var(--${rawVar});`);
    aliasReport.validSemantic.add(entry.semantic);
  }

  for (const [semantic, literal] of Object.entries(SEMANTIC_MOTION_LITERALS)) {
    lines.push(`  --${semantic}: ${literal};`);
    aliasReport.validSemantic.add(semantic);
  }

  for (const [semantic, literal] of Object.entries(SEMANTIC_FONT_LITERALS)) {
    lines.push(`  --${semantic}: ${literal};`);
    aliasReport.validSemantic.add(semantic);
  }

  return lines;
}

function emitSemanticCss(aliasReport) {
  const varLines = collectSemanticVarLines(aliasReport);

  return [
    '/* Generated semantic HydriRivers aliases — do not edit. */',
    '',
    ':root {',
    ...varLines,
    '}',
    '',
  ].join('\n');
}

function emitSemanticModuleScss(aliasReport) {
  const varLines = collectSemanticVarLines(aliasReport);

  return [
    '/* Generated semantic HydriRivers aliases (CSS Modules) — do not edit. */',
    '/* Raw --hydro-kit-* vars come from hydro-kit.css via HydroDesignSystemRoot. */',
    '',
    '.hydroSemanticTheme {',
    ...varLines,
    '}',
    '',
  ].join('\n');
}

function emitTokensTs(flatTokens, colorGroups) {
  const keys = new Set();

  for (const token of flatTokens) {
    if (token.collection !== 'Colors' && token.collection !== 'Icons') {
      keys.add(token.key);
    }
  }
  for (const token of colorGroups) {
    keys.add(token.key);
  }

  const sorted = [...keys].sort();
  const entries = sorted
    .map((key) => `  '${key}': '--${key}',`)
    .join('\n');

  return `/* Generated by tools/design-token-import/generate-design-tokens.mjs — do not edit. */

export const hydroKitCssVarNames = {
${entries}
} as const;

export type HydroKitCssVarName = keyof typeof hydroKitCssVarNames;

export const hydroSemanticCssVarNames = {
  'hydro-color-canvas': '--hydro-color-canvas',
  'hydro-color-surface': '--hydro-color-surface',
  'hydro-color-accent': '--hydro-color-accent',
  'hydro-font-body': '--hydro-font-body',
  'hydro-radius-card': '--hydro-radius-card',
} as const;

export type HydroSemanticCssVarName = keyof typeof hydroSemanticCssVarNames;
`;
}

function emitIndexTs() {
  return `/* Generated design token barrel — do not edit. */

export { hydroKitCssVarNames, hydroSemanticCssVarNames } from './hydro-kit.tokens';
export type { HydroKitCssVarName, HydroSemanticCssVarName } from './hydro-kit.tokens';
`;
}

function emitImportReport(stats, aliasReport) {
  return `# HydriRivers design token import report

Generated: ${new Date().toISOString()}

## Summary

- Raw token prefix: \`--hydro-kit-*\`
- Semantic alias prefix: \`--hydro-*\`
- Legacy \`--ios-*\` variables: **none** (removed from pipeline)
- Total raw tokens: ${stats.rawCount}
- Color tokens (light/dark): ${stats.colorCount}
- Semantic aliases resolved: ${aliasReport.validSemantic.size}
- Missing semantic targets: ${aliasReport.missing.length}

## Collections

${stats.collections
  .map((c) => `- ${c.label}: ${c.count} tokens`)
  .join('\n')}

${
  aliasReport.missing.length
    ? `## Missing semantic mappings

${aliasReport.missing.map((m) => `- \`--${m.semantic}\` → \`--${m.raw}\``).join('\n')}
`
    : ''
}

## Regenerate

\`\`\`bash
npm run tokens:design
\`\`\`
`;
}

async function main() {
  const allFlat = [];
  const aliasIndex = [];
  const collectionStats = [];

  for (const collection of COLLECTIONS) {
    const files = await readCollectionFiles(collection.key);
    let count = 0;

    for (const { file, normalized, json } of files) {
      const mode = collection.themed
        ? COLOR_MODE_MAP[normalized] ?? slugifySegment(file.replace('.tokens.json', ''))
        : 'default';

      if (collection.themed && !COLOR_MODE_MAP[normalized] && !normalized.includes('light') && !normalized.includes('dark')) {
        continue;
      }

      const before = allFlat.length;
      walkTokens(json, [], collection.label, mode, allFlat, aliasIndex);
      count += allFlat.length - before;
    }

    collectionStats.push({ label: collection.label, count });
  }

  const resolved = [];
  for (const collection of COLLECTIONS) {
    const slice = allFlat.filter((t) => t.collection === collection.label);
    resolved.push(...resolveAliases(slice, collection.label));
  }

  const deduped = new Map();
  for (const token of resolved) {
    const dedupeKey = `${token.key}::${token.mode ?? 'default'}`;
    if (!deduped.has(dedupeKey)) {
      deduped.set(dedupeKey, token);
    }
  }

  const flatTokens = [...deduped.values()];
  const colorTokens = flatTokens.filter((t) => t.collection === 'Colors');
  const colorGroups = groupColorModes(colorTokens);
  const nonThemedColors = flatTokens.filter((t) => t.collection !== 'Colors' && t.collection !== 'Icons');

  const rawRegistry = {
    generatedAt: new Date().toISOString(),
    prefix: 'hydro-kit',
    semanticPrefix: 'hydro',
    tokens: flatTokens.map(({ name, key, collection, path, type, mode, value }) => ({
      name,
      key,
      collection,
      path,
      type,
      mode,
      value,
    })),
  };

  const validRawKeys = new Set(flatTokens.map((t) => t.key));
  const aliasReport = {
    valid: validRawKeys,
    validSemantic: new Set(),
    missing: [],
  };

  await mkdir(OUTPUT_DIR, { recursive: true });
  await mkdir(REPORT_DIR, { recursive: true });

  const css = emitRawCss(nonThemedColors, colorGroups);
  const moduleScss = emitRawModuleScss(nonThemedColors, colorGroups);
  const semanticCss = emitSemanticCss(aliasReport);
  const semanticModuleScss = emitSemanticModuleScss(aliasReport);
  const tokensTs = emitTokensTs(flatTokens, colorGroups);

  await writeFile(path.join(OUTPUT_DIR, 'hydro-kit.raw-tokens.json'), `${JSON.stringify(rawRegistry, null, 2)}\n`);
  await writeFile(path.join(OUTPUT_DIR, 'hydro-kit.css'), css);
  await writeFile(path.join(OUTPUT_DIR, 'hydro-kit.module.scss'), moduleScss);
  await writeFile(path.join(OUTPUT_DIR, 'hydro-kit.tokens.ts'), tokensTs);
  await writeFile(path.join(OUTPUT_DIR, 'hydro.semantic.module.scss'), semanticModuleScss);
  await writeFile(path.join(OUTPUT_DIR, 'hydro.semantic.css'), semanticCss);
  await writeFile(path.join(OUTPUT_DIR, 'index.ts'), emitIndexTs());

  const stats = {
    rawCount: new Set(flatTokens.map((t) => t.key)).size,
    colorCount: colorGroups.length,
    collections: collectionStats,
  };

  await writeFile(
    path.join(REPORT_DIR, 'import-report.md'),
    emitImportReport(stats, aliasReport),
  );

  if (aliasReport.missing.length > 0) {
    console.warn(
      `[tokens:design] ${aliasReport.missing.length} semantic alias target(s) missing — see tools/design-token-import/output/import-report.md`,
    );
  }

  const iosLeak = [...css.matchAll(/--ios-[a-z0-9-]+/g)];
  if (iosLeak.length > 0) {
    throw new Error(`Legacy --ios-* variables detected in generated CSS (${iosLeak.length}).`);
  }

  console.log(
    `[tokens:design] Generated ${stats.rawCount} raw (--hydro-kit-*) and ${aliasReport.validSemantic.size} semantic (--hydro-*) tokens.`,
  );
}

main().catch((error) => {
  console.error('[tokens:design] Failed:', error);
  process.exit(1);
});
