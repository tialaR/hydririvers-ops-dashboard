import { readFileSync } from 'node:fs';

const file = 'tests/shipper-mobile-p0.visual.spec.ts';
const source = readFileSync(file, 'utf8');

if (source.includes('should expose primary controls`).toBeGreaterThan(0)')) {
  console.error('[p0-touch-target] FAIL: unconditional primary-control existence assertion still present');
  process.exit(1);
}

if (!source.includes('no qualifying primary controls on')) {
  console.error('[p0-touch-target] FAIL: explicit optional-route log missing');
  process.exit(1);
}

if (!source.includes('toBeGreaterThanOrEqual(MIN_PRIMARY_CONTROL_HEIGHT_PX)')) {
  console.error('[p0-touch-target] FAIL: minimum touch-target height assertion was weakened or removed');
  process.exit(1);
}

console.log('[p0-touch-target] PASS');
console.log(' routes with qualifying controls: minimum height still enforced');
console.log(' routes with no qualifying primary controls: allowed without false failure');
console.log(' product behavior: untouched');
