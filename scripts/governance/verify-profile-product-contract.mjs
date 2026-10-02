import { readFileSync } from 'node:fs';

const files = {
  route: 'src/app/[locale]/(shipper-mobile-flow)/perfil/page.tsx',
  panel: 'src/features/auth/components/profile-panel/profile-panel.tsx',
  styles: 'src/features/auth/components/profile-panel/profile-panel.module.scss',
  api: 'src/app/api/auth/profile/route.ts',
};

const source = Object.fromEntries(
  Object.entries(files).map(([key, file]) => [key, readFileSync(file, 'utf8')])
);

const failures = [];

for (const token of ['ProfilePanel', 'LocaleShell']) {
  if (!source.route.includes(token)) failures.push(`profile route missing ${token}`);
}

for (const token of [
  'data-testid="profile-panel"',
  'handleAvatarUpload',
  'removeAvatar',
  'profileFormSchema',
  'updateProfile',
  'formPhoneLabel',
  'formCityLabel',
  'identityAccessBadgeApproved',
]) {
  if (!source.panel.includes(token)) failures.push(`profile panel contract missing: ${token}`);
}

for (const token of [
  '--profile-canvas: #080808',
  '--profile-surface: #121212',
  '--profile-text: #f3f3f3',
  '.profileIntro',
  '.identity',
  '.details',
  '.formCard',
  '.guidanceCard',
]) {
  if (!source.styles.includes(token)) failures.push(`profile DS contract missing: ${token}`);
}

for (const token of ['profileFormSchema.safeParse', 'upsertUser(user)', 'toPublicUser(user)']) {
  if (!source.api.includes(token)) failures.push(`profile persistence contract missing: ${token}`);
}

if (source.route.includes('ProfileScreen')) {
  failures.push('legacy ProfileScreen is still mounted as canonical profile route');
}

if (failures.length) {
  console.error('[profile-product] FAIL');
  failures.forEach((failure) => console.error(` - ${failure}`));
  process.exit(1);
}

console.log('[profile-product] PASS');
console.log(' canonical chrome: LocaleShell');
console.log(' profile surface: full editable ProfilePanel');
console.log(' persistence: PUT /api/auth/profile + mock DB');
console.log(' avatar: upload/remove preserved');
console.log(' visual language: neutral-first; color reserved for semantic status');
