#!/usr/bin/env node
/**
 * Hydri agent docs/rules check — required files must exist.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const REQUIRED = [
  'AGENTS.md',
  'docs/agents/AGENTS-TASK-ROUTER.md',
  'docs/agents/AGENTS-IMPLEMENTATION-PROOF.md',
  'docs/agents/AGENTS-WORKFLOW.md',
  '.cursor/rules/hydri-task-router.mdc',
  '.cursor/rules/hydri-implementation-proof.mdc',
];

const missing = [];
const present = [];

console.log('Hydri agent check — verificando docs e rules essenciais…\n');

for (const file of REQUIRED) {
  const absolute = resolve(process.cwd(), file);
  if (existsSync(absolute)) {
    present.push(file);
    console.log(`🟢 ${file}`);
  } else {
    missing.push(file);
    console.log(`🔴 ${file}`);
  }
}

if (missing.length > 0) {
  console.log(`\n🔴 ${missing.length} arquivo(s) obrigatório(s) ausente(s) — agentes podem falhar.`);
  process.exit(1);
}

console.log('\n🟢 Todos os docs e rules de agentes estão presentes.');
process.exit(0);
