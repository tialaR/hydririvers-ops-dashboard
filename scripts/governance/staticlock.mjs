#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const forwarded = process.argv.slice(2);
const baseArg = forwarded.find((arg) => arg.startsWith('--base='));
const base = baseArg ? baseArg.slice('--base='.length) : (process.env.AGENTIC_BASE_SHA || '');

const steps = [
  ['npm', ['run', 'hydri:agent:check']],
  ['npm', ['run', 'agentic:architecture', ...(base ? ['--', `--base=${base}`] : [])]],
  ['npm', ['run', 'lint']],
  ['npm', ['run', 'typecheck']],
  ['npm', ['run', 'check:i18n']]
];

for (const [command, args] of steps) {
  console.log(`\nSTATICLOCK > ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { stdio: 'inherit', shell: false });
  if (result.status !== 0) {
    console.error(`STATICLOCK FAIL: ${command} ${args.join(' ')}`);
    process.exit(result.status || 1);
  }
}

console.log('\nSTATICLOCK PASS: agent governance, architecture ratchet, lint, types and i18n are green.');
