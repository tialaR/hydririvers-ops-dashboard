#!/usr/bin/env node
/**
 * Hydri repo hygiene audit — read-only, never deletes files.
 * Exit 0 even when items are found (local dev should not block).
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();

/** Top-level dirs/files to flag if present. */
const TOP_LEVEL_TARGETS = [
  '__MACOSX',
  '_incoming',
  '.artifacts',
  '.playwright-cli',
  'files',
  'output',
  'test-results',
];

/** Name patterns matched against basename (any depth). */
const NAME_PATTERNS = [
  { label: '*.bak', test: (name) => name.endsWith('.bak') },
  { label: '*before-*', test: (name) => name.includes('before-') },
];

/** Glob-like paths relative to repo root. */
const PATH_GLOBS = [
  { label: 'scripts/apply-hy-*.mjs', dir: 'scripts', prefix: 'apply-hy-', suffix: '.mjs' },
  { label: 'scripts/revert-hy-*.mjs', dir: 'scripts', prefix: 'revert-hy-', suffix: '.mjs' },
];

const SKIP_DIRS = new Set(['node_modules', '.git', '.next']);

const findings = [];

function addFinding(category, relPath) {
  findings.push({ category, path: relPath });
}

function walkDir(dir, onEntry) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      onEntry(full, entry.name, true);
      walkDir(full, onEntry);
    } else {
      onEntry(full, entry.name, false);
    }
  }
}

// Top-level targets
for (const target of TOP_LEVEL_TARGETS) {
  const full = join(ROOT, target);
  if (existsSync(full)) {
    addFinding(target, target);
  }
}

// Name patterns (skip heavy dirs)
walkDir(ROOT, (full, name, isDir) => {
  if (isDir) return;
  for (const pattern of NAME_PATTERNS) {
    if (pattern.test(name)) {
      addFinding(pattern.label, relative(ROOT, full));
      break;
    }
  }
});

// Path globs in scripts/
for (const glob of PATH_GLOBS) {
  const dir = join(ROOT, glob.dir);
  if (!existsSync(dir)) continue;
  for (const entry of readdirSync(dir)) {
    if (
      entry.startsWith(glob.prefix) &&
      entry.endsWith(glob.suffix) &&
      statSync(join(dir, entry)).isFile()
    ) {
      addFinding(glob.label, join(glob.dir, entry));
    }
  }
}

console.log('Hydri audit — procurando artefatos indesejados (somente leitura)…\n');

if (findings.length === 0) {
  console.log('🟢 Repositório limpo — nenhum artefato indesejado encontrado.');
  process.exit(0);
}

const byCategory = new Map();
for (const f of findings) {
  if (!byCategory.has(f.category)) byCategory.set(f.category, []);
  byCategory.get(f.category).push(f.path);
}

for (const [category, paths] of byCategory) {
  console.log(`🟡 ${category}`);
  for (const p of paths.sort()) {
    console.log(`   ${p}`);
  }
}

console.log(`\n🟡 ${findings.length} item(ns) encontrado(s) — revise manualmente (nada foi removido).`);
process.exit(0);
