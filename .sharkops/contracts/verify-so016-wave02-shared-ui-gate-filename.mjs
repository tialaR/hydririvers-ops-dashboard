import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const canonical = path.join(root, '.sharkops/contracts/verify-shared-ui-god-stylesheet-containment.mjs');
const wrongAlias = path.join(root, '.sharkops/contracts/verify-shared-ui-god-stylesheet.mjs');
const wave02 = path.join(root, '.sharkops/contracts/verify-public-cargo-presentation-extraction.mjs');

function fail(message) {
  console.error(`[so016-wave02-hotfix01] FAIL: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(canonical)) fail('canonical shared-ui containment gate is missing');
if (!fs.existsSync(wave02)) fail('Wave 02 presentation contract is missing; apply Wave 02 first');
if (fs.existsSync(wrongAlias)) fail('stale duplicate gate alias exists; canonical containment filename must remain the source of truth');

console.log('[so016-wave02-hotfix01] PASS');
console.log(' canonical shared-ui gate: verify-shared-ui-god-stylesheet-containment.mjs');
console.log(' Wave 02 presentation contract: present');
console.log(' duplicate gate alias: absent');
