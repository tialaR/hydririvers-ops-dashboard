import { readdirSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, '.mock-data');

let removed = 0;
try {
  for (const name of readdirSync(dir)) {
    if (name.endsWith('.json')) {
      unlinkSync(path.join(dir, name));
      removed += 1;
    }
  }
} catch (err) {
  if (err && typeof err === 'object' && 'code' in err && err.code === 'ENOENT') {
    console.log('mock-data:reset — .mock-data missing, nothing to do');
    process.exit(0);
  }
  throw err;
}

console.log(`mock-data:reset — removed ${removed} JSON file(s). Restart dev server if running.`);
