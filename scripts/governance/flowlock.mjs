#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const args = process.argv.slice(2);
const profileArg = args.find((arg) => arg.startsWith('--profile='));
const profile = profileArg?.slice('--profile='.length);

if (!profile) {
  console.error('FLOWLOCK FAIL: --profile=<name> is required');
  process.exit(1);
}

const manifestPath = path.resolve('config/agentic/flows', `${profile}.json`);
let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
} catch (error) {
  console.error(`FLOWLOCK FAIL: cannot read ${manifestPath}: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

if (!Array.isArray(manifest.commands) || manifest.commands.length === 0) {
  console.error('FLOWLOCK FAIL: profile has no commands');
  process.exit(1);
}

const candidate = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim();
const evidenceDir = path.resolve('reports/agentic-evidence');
mkdirSync(evidenceDir, { recursive: true });

const results = [];

for (const step of manifest.commands) {
  if (!step?.command || !Array.isArray(step.args)) {
    console.error('FLOWLOCK FAIL: every command requires command + args[]');
    process.exit(1);
  }

  console.log(`\nFLOWLOCK > ${step.command} ${step.args.join(' ')}`);
  const result = spawnSync(step.command, step.args, {
    stdio: 'inherit',
    shell: false,
    env: { ...process.env, ...(step.env ?? {}) }
  });

  const row = {
    name: step.name ?? `${step.command} ${step.args.join(' ')}`,
    command: step.command,
    args: step.args,
    status: result.status === 0 ? 'PASS' : 'FAIL'
  };
  results.push(row);

  if (result.status !== 0) {
    const evidence = {
      gate: 'FLOWLOCK-v1',
      profile,
      candidateSha: candidate,
      certificationStatus: 'FAIL',
      results
    };
    writeFileSync(path.join(evidenceDir, `flowlock-${profile}.json`), `${JSON.stringify(evidence, null, 2)}\n`);
    console.error(`FLOWLOCK FAIL: ${row.name}`);
    process.exit(result.status || 1);
  }
}

const evidence = {
  gate: 'FLOWLOCK-v1',
  profile,
  candidateSha: candidate,
  certificationStatus: 'PASS',
  results
};
writeFileSync(path.join(evidenceDir, `flowlock-${profile}.json`), `${JSON.stringify(evidence, null, 2)}\n`);
console.log(`\nFLOWLOCK PASS: ${results.length} required behavior check(s) passed for ${profile}.`);
