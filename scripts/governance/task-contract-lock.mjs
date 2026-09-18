#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { evaluateWrite, loadContract, loadPolicy } from './agentic-policy.mjs';

function git(args) {
  const result = spawnSync('git', args, { encoding: 'utf8' });
  if (result.status !== 0) {
    console.error(result.stderr || `git ${args.join(' ')} failed`);
    process.exit(1);
  }
  return result.stdout.trim();
}

const baseArg = process.argv.slice(2).find((arg) => arg.startsWith('--base='));
const base = baseArg ? baseArg.slice('--base='.length) : null;
const contract = loadContract();

if (!contract) {
  console.error('SCOPELOCK FAIL: .agentic/current-task.json is missing');
  process.exit(1);
}

let files = [];
if (base) {
  files = git(['diff', '--name-only', `${base}...HEAD`]).split('\n').filter(Boolean);
} else {
  const changed = [
    git(['diff', '--name-only']),
    git(['diff', '--name-only', '--cached']),
    git(['ls-files', '--others', '--exclude-standard'])
  ].filter(Boolean).join('\n');
  files = [...new Set(changed.split('\n').filter(Boolean))].sort();
}

const policy = loadPolicy();
const denied = [];

for (const file of files) {
  const result = evaluateWrite(file, policy, contract);
  if (result.permission !== 'allow') denied.push({ file, reason: result.reason });
}

if (denied.length > 0) {
  console.error(`SCOPELOCK FAIL: ${denied.length} file(s) violate task contract ${contract.taskId}`);
  for (const item of denied) console.error(`- ${item.file}: ${item.reason}`);
  process.exit(1);
}

console.log(`SCOPELOCK PASS: ${files.length} changed file(s) authorized by task contract ${contract.taskId}`);
