#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const args = process.argv.slice(2);
const manifestArg = args.find((arg) => arg.startsWith('--manifest='));
const manifestName = manifestArg?.slice('--manifest='.length);

if (!manifestName) {
  console.error('RELEASELOCK FAIL: --manifest=<name> is required');
  process.exit(1);
}

const manifestPath = path.resolve('config/agentic/releases', `${manifestName}.json`);
let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
} catch (error) {
  console.error(`RELEASELOCK FAIL: cannot read ${manifestPath}: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

const allowedGates = new Set(['STATICLOCK', 'FLOWLOCK', 'SHARKLOCK']);
const gates = manifest.requiredGates ?? [];
if (!Array.isArray(gates) || gates.length === 0) {
  console.error('RELEASELOCK FAIL: requiredGates must be non-empty');
  process.exit(1);
}
for (const gate of gates) {
  if (!allowedGates.has(gate)) {
    console.error(`RELEASELOCK FAIL: unknown gate "${gate}"`);
    process.exit(1);
  }
}

const candidate = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim();
const results = [];

function runGate(gate, command, gateArgs) {
  console.log(`\nRELEASELOCK > ${gate}: ${command} ${gateArgs.join(' ')}`);
  const result = spawnSync(command, gateArgs, { stdio: 'inherit', shell: false });
  results.push({ gate, status: result.status === 0 ? 'PASS' : 'FAIL' });
  if (result.status !== 0) {
    persist('FAIL');
    console.error(`RELEASELOCK FAIL: ${gate} failed`);
    process.exit(result.status || 1);
  }
}

function persist(status) {
  const evidenceDir = path.resolve('reports/agentic-evidence');
  mkdirSync(evidenceDir, { recursive: true });
  writeFileSync(
    path.join(evidenceDir, `releaselock-${manifestName}.json`),
    `${JSON.stringify({
      gate: 'RELEASELOCK-v1',
      manifest: manifestName,
      candidateSha: candidate,
      requiredGates: gates,
      certificationStatus: status,
      results
    }, null, 2)}\n`
  );
}

for (const gate of gates) {
  if (gate === 'STATICLOCK') {
    runGate(gate, 'npm', ['run', 'agentic:static']);
  } else if (gate === 'FLOWLOCK') {
    if (!manifest.flowProfile) {
      console.error('RELEASELOCK FAIL: FLOWLOCK requires flowProfile');
      process.exit(1);
    }
    runGate(gate, 'npm', ['run', 'agentic:flow', '--', `--profile=${manifest.flowProfile}`]);
  } else if (gate === 'SHARKLOCK') {
    if (!manifest.visualManifest) {
      console.error('RELEASELOCK FAIL: SHARKLOCK requires visualManifest');
      process.exit(1);
    }
    runGate(gate, 'npm', ['run', 'agentic:shark', '--', `--manifest=${manifest.visualManifest}`]);
  }
}

persist('PASS');
console.log(`\nRELEASELOCK PASS: ${gates.join(' + ')} are objectively green for ${manifestName}.`);
