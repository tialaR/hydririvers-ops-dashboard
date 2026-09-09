#!/usr/bin/env node
/**
 * Hydri standard verification: lint → typecheck → i18n.
 * Stops on first failure and prints a clear summary.
 */
import { spawnSync } from 'node:child_process';

const steps = [
  { name: 'lint', script: 'lint' },
  { name: 'typecheck', script: 'typecheck' },
  { name: 'check:i18n', script: 'check:i18n' },
];

const results = [];

console.log('Hydri verify — rodando checagens padrão…\n');

for (const step of steps) {
  console.log(`▶ npm run ${step.script}`);
  const outcome = spawnSync('npm', ['run', step.script], {
    stdio: 'inherit',
    shell: false,
  });

  const ok = outcome.status === 0;
  results.push({ name: step.name, ok });

  if (!ok) {
    console.log('\n── Resumo ──');
    for (const r of results) {
      console.log(`${r.ok ? '🟢' : '🔴'} ${r.name}`);
    }
    console.log('\n🔴 Hydri verify falhou — corrija o erro acima e rode de novo.');
    process.exit(outcome.status ?? 1);
  }

  console.log('');
}

console.log('── Resumo ──');
for (const r of results) {
  console.log(`🟢 ${r.name}`);
}
console.log('\n🟢 Hydri verify passou — lint, typecheck e i18n OK.');
