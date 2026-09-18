#!/usr/bin/env node
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const CONFIG = JSON.parse(readFileSync('config/agentic/architecture-ratchet.json', 'utf8'));

function git(args) {
  const r = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' });
  return { ok: r.status === 0, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() };
}

function parseBase() {
  const arg = process.argv.slice(2).find((value) => value.startsWith('--base='));
  return arg ? arg.slice('--base='.length) : (process.env.AGENTIC_BASE_SHA || null);
}

function isRelevant(file) {
  const extension = extname(file);
  if (!CONFIG.includeExtensions.includes(extension)) return false;
  if (CONFIG.excludePrefixes.some((prefix) => file.startsWith(prefix))) return false;
  if (CONFIG.excludeContains.some((fragment) => file.includes(fragment))) return false;
  return true;
}

function fileType(file) {
  if (file.endsWith('.tsx')) return 'tsx';
  if (file.endsWith('.ts')) return 'ts';
  return 'style';
}

function changedFiles(base) {
  if (base) {
    const r = git(['diff', '--name-only', `${base}...HEAD`]);
    if (!r.ok) {
      console.error(`ARCHLOCK FAIL: cannot diff base ${base}: ${r.err}`);
      process.exit(1);
    }
    return r.out.split('\n').filter(Boolean);
  }

  const pieces = [
    git(['diff', '--name-only']).out,
    git(['diff', '--name-only', '--cached']).out,
    git(['ls-files', '--others', '--exclude-standard']).out
  ].filter(Boolean).join('\n');
  return [...new Set(pieces.split('\n').filter(Boolean))];
}

function baselineBytes(base, file) {
  if (!base) {
    const r = git(['show', `HEAD:${file}`]);
    return r.ok ? Buffer.byteLength(r.out, 'utf8') : null;
  }
  const r = git(['show', `${base}:${file}`]);
  return r.ok ? Buffer.byteLength(r.out, 'utf8') : null;
}

const base = parseBase();
const files = changedFiles(base).filter(isRelevant);
const failures = [];
const notes = [];

for (const file of files) {
  if (!existsSync(file)) {
    notes.push(`DELETE ${file}`);
    continue;
  }

  const current = statSync(file).size;
  const previous = baselineBytes(base, file);
  const type = fileType(file);
  const threshold = CONFIG.thresholds[type];

  if (previous === null) {
    if (current > threshold) {
      failures.push(`NEW ${file}: ${current} B > p95 ${threshold} B`);
    } else {
      notes.push(`PASS new ${file}: ${current} B <= p95 ${threshold} B`);
    }
    continue;
  }

  if (previous > threshold && current > previous) {
    failures.push(`GOD-RATCHET ${file}: ${previous} B -> ${current} B; grandfathered file grew`);
    continue;
  }

  if (previous <= threshold && current > threshold) {
    failures.push(`P95-CROSSING ${file}: ${previous} B -> ${current} B; p95 is ${threshold} B`);
    continue;
  }

  if (previous > threshold && current <= previous) {
    notes.push(`PASS ratchet ${file}: ${previous} B -> ${current} B`);
  } else {
    notes.push(`PASS ${file}: ${previous} B -> ${current} B`);
  }
}

console.log(`ARCHLOCK base: ${base || 'HEAD + working tree'}`);
console.log(`ARCHLOCK files checked: ${files.length}`);
for (const note of notes) console.log(`🟢 ${note}`);

if (failures.length > 0) {
  console.error(`\nARCHLOCK FAIL: ${failures.length} architecture size regression(s)`);
  for (const failure of failures) console.error(`🔴 ${failure}`);
  process.exit(1);
}

console.log('\nARCHLOCK PASS: no measured anti-GOD regression detected.');
