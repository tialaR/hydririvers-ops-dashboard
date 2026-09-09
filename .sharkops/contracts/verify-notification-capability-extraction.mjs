import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = process.cwd();
const personaRoot = join(root, 'src/features/shipper-mobile-flow');
const notificationsRoot = join(root, 'src/features/notifications');
const fail = (message) => {
  console.error(`[notification-capability] FAIL: ${message}`);
  process.exit(1);
};
const rel = (file) => relative(root, file).split(sep).join('/');

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const retired = [
  'src/features/shipper-mobile-flow/application/get-notifications.ts',
  'src/features/shipper-mobile-flow/data/mock/shipper-notification-mock.ts',
  'src/features/shipper-mobile-flow/data/repositories/mock-notification-repository.ts',
  'src/features/shipper-mobile-flow/domain/repositories/notification-repository.ts',
  'src/features/shipper-mobile-flow/screens/notifications-screen.tsx',
];
for (const file of retired) {
  if (existsSync(join(root, file))) fail(`retired persona notification file returned: ${file}`);
}

const retiredImportSpecifiers = [
  '@/features/shipper-mobile-flow/application/get-notifications',
  '@/features/shipper-mobile-flow/data/mock/shipper-notification-mock',
  '@/features/shipper-mobile-flow/data/repositories/mock-notification-repository',
  '@/features/shipper-mobile-flow/domain/repositories/notification-repository',
  '@/features/shipper-mobile-flow/screens/notifications-screen',
];
for (const file of walk(join(root, 'src')).filter((item) => /\.(ts|tsx)$/.test(item))) {
  const source = readFileSync(file, 'utf8');
  for (const specifier of retiredImportSpecifiers) {
    if (source.includes(specifier)) fail(`stale import to retired notification ownership in ${rel(file)}: ${specifier}`);
  }
}

const required = [
  'src/features/notifications/application/get-shipper-notifications.ts',
  'src/features/notifications/domain/shipper-notification.ts',
  'src/features/notifications/domain/shipper-notification-repository.ts',
  'src/features/notifications/mocks/shipper-notification.mock.ts',
  'src/features/notifications/repositories/mock-shipper-notification.repository.ts',
  'src/features/notifications/screens/notifications-screen.tsx',
  'src/features/notifications/screens/notifications-screen.module.sass',
];
for (const file of required) {
  if (!existsSync(join(root, file))) fail(`canonical notification ownership file missing: ${file}`);
}

for (const file of walk(notificationsRoot).filter((item) => /\.(ts|tsx)$/.test(item))) {
  const source = readFileSync(file, 'utf8');
  if (source.includes('@/features/shipper-mobile-flow')) {
    fail(`notifications imports Persona God Feature: ${rel(file)}`);
  }
}

const repositoryProviderPath = join(personaRoot, 'data/repositories/repository-provider.ts');
if (existsSync(repositoryProviderPath)) {
  const repositoryProvider = readFileSync(repositoryProviderPath, 'utf8');
  if (/notification/i.test(repositoryProvider)) fail('persona repository provider still owns notification repository composition');
}

const personaTypesPath = join(personaRoot, 'types/shipper-flow-types.ts');
if (existsSync(personaTypesPath)) {
  const personaTypes = readFileSync(personaTypesPath, 'utf8');
  if (personaTypes.includes('ShipperNotification')) fail('persona compatibility notification type still exists');
}

const route = readFileSync(join(root, 'src/app/[locale]/(shipper-mobile-flow)/notificacoes/page.tsx'), 'utf8');
if (!route.includes('@/features/notifications/application/get-shipper-notifications')) fail('notification route does not use notifications-owned application use case');
if (!route.includes('@/features/notifications/screens/notifications-screen')) fail('notification route does not use notifications-owned screen');
if (!route.includes('@/features/product-shell/components/mobile-app-shell/mobile-app-shell')) fail('notification route must use canonical product-shell mobile shell composition');
if (route.includes('@/features/shipper-mobile-flow/components/mobile-app-shell/mobile-app-shell')) fail('notification route regressed to persona-owned mobile shell');
if (route.includes('@/features/shipper-mobile-flow/screens/notifications-screen')) fail('notification route regressed to persona-owned screen');

const sharedStylesPath = join(personaRoot, 'components/shared-ui/shared-ui.module.sass');
if (existsSync(sharedStylesPath)) {
  const sharedStyles = readFileSync(sharedStylesPath, 'utf8');
  for (const selector of ['.notificationsHero', '.notificationSection', '.notificationRail', '.notificationHigh', '.notificationMedium', '.notificationLow']) {
    if (sharedStyles.includes(selector)) fail(`notification selector remains in persona God stylesheet: ${selector}`);
  }
}

const currentFeatureFiles = walk(personaRoot).filter((file) => !file.endsWith('.DS_Store'));
if (currentFeatureFiles.length > 83) fail(`shipper-mobile-flow expected <= 83 files after notification extraction, found ${currentFeatureFiles.length}`);

console.log('[notification-capability] PASS');
console.log(' notification data, repository, application and presentation ownership: features/notifications');
console.log(` shipper-mobile-flow files: ${currentFeatureFiles.length}`);
console.log(' notification feature -> shipper-mobile-flow dependency: 0');
console.log(' notification route preserves existing shipper shell composition');
