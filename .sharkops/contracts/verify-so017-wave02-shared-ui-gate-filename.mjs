import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const canonical = path.join(root, '.sharkops/contracts/verify-shared-ui-god-stylesheet-containment.mjs');

if (!existsSync(canonical)) {
  console.error('[so017-wave02-hotfix02] FAIL: canonical shared-ui containment gate is missing');
  process.exit(1);
}

console.log('[so017-wave02-hotfix02] PASS');
console.log(' canonical shared-ui gate exists: verify-shared-ui-god-stylesheet-containment.mjs');
console.log(' verification-chain repair only; production behavior unchanged');
