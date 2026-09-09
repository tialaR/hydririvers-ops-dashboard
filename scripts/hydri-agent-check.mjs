#!/usr/bin/env node
/**
 * Hydri agent docs/rules check — required files must exist.
 */
import { existsSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const REQUIRED_DOCS = [
  'AGENTS.md',
  'docs/agents/AGENTS-TASK-ROUTER.md',
  'docs/agents/AGENTS-IMPLEMENTATION-PROOF.md',
  'docs/agents/AGENTS-WORKFLOW.md',
  'docs/agents/AGENTS-ZERO-REDEMOINHO.md',
  'docs/agents/HYDRI-AUTOPILOT-GATE.md',
];

const REQUIRED_RULES = [
  '.cursor/rules/hydri-task-router.mdc',
  '.cursor/rules/hydri-implementation-proof.mdc',
  '.cursor/rules/hydri-zero-redemoinho.mdc',
  '.cursor/rules/hydri-ui-architecture.mdc',
  '.cursor/rules/hydri-component-and-flow-standards.mdc',
  '.cursor/rules/hydri-scope-gate.mdc',
  '.cursor/rules/hydri-mobile-ui.mdc',
];

const REQUIRED_SCRIPTS = [
  'scripts/hydri-autopilot-gate.mjs',
  'scripts/hydri-verify.mjs',
  'scripts/hydri-audit.mjs',
];

const missing = [];
const present = [];

console.log('Hydri agent check — verificando docs, rules e scripts essenciais…\n');

function check(label, files) {
  console.log(`── ${label} ──`);
  for (const file of files) {
    const absolute = resolve(process.cwd(), file);
    if (existsSync(absolute)) {
      present.push(file);
      console.log(`🟢 ${file}`);
    } else {
      missing.push(file);
      console.log(`🔴 ${file}`);
    }
  }
  console.log('');
}

check('Docs', REQUIRED_DOCS);
check('Cursor rules', REQUIRED_RULES);
check('Scripts', REQUIRED_SCRIPTS);

// Optional: list all .mdc rules for inventory
const rulesDir = join(process.cwd(), '.cursor/rules');
if (existsSync(rulesDir)) {
  const allRules = readdirSync(rulesDir).filter((f) => f.endsWith('.mdc')).sort();
  console.log(`── .cursor/rules inventory (${allRules.length}) ──`);
  for (const r of allRules) {
    const mark = REQUIRED_RULES.includes(`.cursor/rules/${r}`) ? '🟢' : '🟡';
    console.log(`${mark} .cursor/rules/${r}`);
  }
  console.log('');
}

if (missing.length > 0) {
  console.log(`🔴 ${missing.length} arquivo(s) obrigatório(s) ausente(s) — agentes podem falhar.`);
  process.exit(1);
}

console.log('🟢 Todos os docs, rules e scripts de agentes estão presentes.');
console.log('→ Rode npm run hydri:gate antes de declarar implementação concluída.');
process.exit(0);
