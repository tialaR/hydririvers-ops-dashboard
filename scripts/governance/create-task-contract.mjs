#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { CONTRACT_PATH } from './agentic-policy.mjs';

function values(argv, prefix) {
  return argv.filter((arg) => arg.startsWith(prefix)).flatMap((arg) => arg.slice(prefix.length).split(',')).map((v) => v.trim()).filter(Boolean);
}

function one(argv, prefix, fallback = '') {
  const hit = argv.find((arg) => arg.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : fallback;
}

const argv = process.argv.slice(2);
const mode = one(argv, '--mode=', 'observe');
const taskId = one(argv, '--id=', '');
const owner = one(argv, '--owner=', '');
const allowedPaths = values(argv, '--allow=');
const forbiddenPaths = values(argv, '--forbid=');
const requiredGates = values(argv, '--gates=');

if (!['observe', 'implement'].includes(mode)) {
  console.error('agentic:task FAIL: --mode must be observe or implement');
  process.exit(1);
}

if (!taskId) {
  console.error('agentic:task FAIL: --id is required');
  process.exit(1);
}

if (mode === 'implement' && allowedPaths.length === 0) {
  console.error('agentic:task FAIL: implementation requires at least one --allow= path');
  process.exit(1);
}

const contract = {
  version: 1,
  taskId,
  mode,
  owner: owner || null,
  allowedPaths,
  forbiddenPaths,
  allowProtectedWrites: argv.includes('--allow-protected-writes'),
  allowBaselineMutation: argv.includes('--allow-baseline-mutation'),
  allowDependencyChanges: argv.includes('--allow-dependency-changes'),
  allowGitMutation: argv.includes('--allow-git-mutation'),
  allowDeploy: argv.includes('--allow-deploy'),
  requiredGates,
  untouchedOwners: [],
  notes: ''
};

mkdirSync(path.dirname(CONTRACT_PATH), { recursive: true });
writeFileSync(CONTRACT_PATH, `${JSON.stringify(contract, null, 2)}\n`);
console.log(`agentic:task PASS: ${path.relative(process.cwd(), CONTRACT_PATH)} created for ${taskId} in ${mode} mode`);
