import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const testPath = path.join(root, 'tests/unit/app/minhas-cargas-detail-page.test.tsx');
const raw = readFileSync(testPath, 'utf8');

const legacyMock = "@/features/shipper-mobile-flow/screens/cargo-detail-screen";
const routeClientMock = "@/app/[locale]/(shipper-mobile-flow)/minhas-cargas/[id]/owned-cargo-detail-route-client";

if (raw.includes(legacyMock)) {
  throw new Error('[owned-cargo-detail-test-rewire] FAIL: test still mocks deleted persona cargo-detail screen');
}
if (!raw.includes(routeClientMock)) {
  throw new Error('[owned-cargo-detail-test-rewire] FAIL: test does not mock the route composition client');
}
if (!raw.includes("@/features/cargo/owned/application/get-owned-cargo-by-id")) {
  throw new Error('[owned-cargo-detail-test-rewire] FAIL: page test no longer exercises cargo/owned application ownership');
}

console.log('[owned-cargo-detail-test-rewire] PASS');
console.log(' page test follows Wave 06 route composition');
console.log(' deleted persona screen is not resurrected for tests');
console.log(' next-intl/client shell internals stay outside this server-route unit test');
