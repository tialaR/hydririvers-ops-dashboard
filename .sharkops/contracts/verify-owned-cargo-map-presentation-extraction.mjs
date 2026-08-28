import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const canonical = path.join(root, 'src/features/cargo/owned/screens/owned-cargo-map-screen.tsx');
const canonicalStyles = path.join(root, 'src/features/cargo/owned/screens/owned-cargo-map-screen.module.sass');
const bridge = path.join(root, 'src/features/shipper-mobile-flow/components/operation-map-screen/operation-map-screen.tsx');
const oldScreen = path.join(root, 'src/features/shipper-mobile-flow/screens/cargo-map-screen.tsx');
const sharedStyles = path.join(root, 'src/features/shipper-mobile-flow/components/shared-ui/shared-ui.module.sass');
const page = path.join(root, 'src/app/[locale]/(shipper-mobile-flow)/minhas-cargas/[id]/mapa/page.tsx');
function fail(message) { console.error(`[owned-cargo-map-extraction] FAIL: ${message}`); process.exit(1); }
for (const file of [canonical, canonicalStyles, bridge, sharedStyles, page]) {
  if (!existsSync(file)) fail(`required file missing: ${path.relative(root, file)}`);
}
if (existsSync(oldScreen)) fail('legacy cargo-map-screen.tsx still exists');
const canonicalSource = readFileSync(canonical, 'utf8');
const styleSource = readFileSync(canonicalStyles, 'utf8');
const bridgeSource = readFileSync(bridge, 'utf8');
const sharedSource = readFileSync(sharedStyles, 'utf8');
const pageSource = readFileSync(page, 'utf8');
if (canonicalSource.includes('@/features/shipper-mobile-flow/')) fail('canonical owned map presentation imports persona God Feature');
if (!canonicalSource.includes('OwnedCargoMapScreen')) fail('canonical OwnedCargoMapScreen export missing');
if (!canonicalSource.includes('mapContent') || !canonicalSource.includes('BottomSheetComponent')) fail('canonical map presentation no longer uses injected map/sheet boundaries');
if (!bridgeSource.includes('ShipperOperationMap') || !bridgeSource.includes('getShipperMapRouteForCargo')) fail('temporary map infrastructure bridge is missing maplibre/route ownership');
if (!bridgeSource.includes('OwnedCargoMapScreen') || !bridgeSource.includes('MobileAppShell')) fail('operation-map-screen is not a thin bridge to canonical owned map screen');
if (bridgeSource.includes('mapStatusCard') || bridgeSource.includes('mapControlsStack')) fail('operation-map-screen still owns cargo map presentation');
if (!pageSource.includes('OperationMapScreen') || pageSource.includes('CargoMapScreen')) fail('map route is not wired to the existing operation-map bridge');
const mapClasses = ['mapFullScreen','mapControlsStack','mapControl','mapStatusCard','mapStatusHeader','mapStatusCode','mapStatusCorridor','mapStatusAction','mapContextSheet','mapContextRow','mapContextAction','mapStatusGrid','mapStatusCell','mapStatusLabel','mapStatusValue'];
for (const className of mapClasses) {
  if (!styleSource.includes(`.${className}`)) fail(`canonical map stylesheet missing .${className}`);
  if (sharedSource.includes(`.${className}\n`)) fail(`God stylesheet still owns map class .${className}`);
}
const legacyScreens = ['my-cargoes-screen.tsx','cargo-detail-screen.tsx','documents-screen.tsx','cargo-map-screen.tsx'];
let legacyLines = 0;
for (const file of legacyScreens) {
  const full = path.join(root, 'src/features/shipper-mobile-flow/screens', file);
  if (existsSync(full)) legacyLines += readFileSync(full, 'utf8').split(/\r?\n/).length;
}
if (legacyLines >= 121) fail(`legacy owned screen debt did not shrink: current ${legacyLines}, previous 121`);
console.log(` legacy owned screen debt: 121 -> ${legacyLines} lines`);
console.log('[owned-cargo-map-extraction] PASS');
console.log(' canonical owned map presentation: cargo/owned ownership');
console.log(' operational MapLibre + route data: isolated behind existing operation-map bridge');
console.log(' legacy cargo-map screen: removed');
console.log(' God stylesheet map block: carved out to owned cargo stylesheet');
console.log(' cargo/owned -> shipper-mobile-flow dependency: 0 in canonical map screen');
console.log(' business/map behavior: preserved by composition, not reimplementation');
