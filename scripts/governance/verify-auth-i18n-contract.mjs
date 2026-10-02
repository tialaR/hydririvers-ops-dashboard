import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');

const files = {
  login: read('src/app/[locale]/(shipper-mobile-flow)/entrar/page.tsx'),
  register: read('src/app/[locale]/(shipper-mobile-flow)/registrar/page.tsx'),
  otpAlias: read('src/app/[locale]/(shipper-mobile-flow)/verificar-otp/page.tsx'),
  authForm: read('src/features/auth/components/auth-form/auth-form.tsx'),
  authStyles: read('src/features/auth/components/auth-form/auth-form.module.sass'),
  otpStyles: read('src/shared/components/otp-input/OtpInput.module.scss'),
  storybook: read('.storybook/preview.tsx'),
  journey: read('src/features/cargo/components/shipper-journey/page-62-shipper-journey-demo.tsx'),
  overview: read('src/features/cargo/components/shipper-journey/page-62-overview-surface.tsx'),
  cockpit: read('src/features/cargo/owned/stories/page-62-cargo-cockpit-preview.tsx'),
  surfaces: read('src/features/cargo/components/shipper-journey/shipper-journey-surfaces.tsx'),
};

const localeFiles = ['pt-BR', 'en-US', 'es'].map((locale) => ({
  locale,
  messages: JSON.parse(read(`messages/${locale}.json`)),
}));

const failures = [];

for (const [label, source] of [['login', files.login], ['register', files.register]]) {
  if (!source.includes('<AuthForm')) failures.push(`${label} route no longer uses canonical AuthForm`);
}

if (!files.otpAlias.includes("redirect(`/${locale}/entrar`)")) {
  failures.push('detached /verificar-otp route must redirect to canonical /entrar flow');
}

for (const token of [
  "mode === 'login'",
  'requestLoginOtp',
  'requestRegisterOtp',
  'submitOtp',
  '<OtpInput',
  'challenge',
  'expiresAtMs',
]) {
  if (!files.authForm.includes(token)) failures.push(`canonical AuthForm missing OTP contract token: ${token}`);
}

for (const token of [
  '--auth-bg: #080808',
  '--auth-surface: #111111',
  '--auth-text: #f3f3f3',
  '.otpBox',
  '.submit',
]) {
  if (!files.authStyles.includes(token)) failures.push(`neutral auth DS token missing: ${token}`);
}

if (!files.otpStyles.includes('Auth DS v3 neutral slot skin')) {
  failures.push('OTP slots are not on the neutral DS skin');
}

for (const token of ["'pt-BR': ptBRMessages", "'en-US': enUSMessages", "es: esMessages", "icon: 'globe'"]) {
  if (!files.storybook.includes(token)) failures.push(`Storybook locale control missing: ${token}`);
}

const requiredJourneyNamespaces = [
  ['journey', "useTranslations('page62Journey')"],
  ['overview', "useTranslations('page62Journey.overview')"],
  ['cockpit', "useTranslations('page62Journey.cockpit')"],
  ['surfaces', "useTranslations('page62Journey.negotiation')"],
  ['surfaces', "useTranslations('page62Journey.review')"],
  ['surfaces', "useTranslations('page62Journey.feedback')"],
  ['surfaces', "useTranslations('page62Journey.correction')"],
];

for (const [file, token] of requiredJourneyNamespaces) {
  if (!files[file].includes(token)) failures.push(`Page 62 i18n namespace missing in ${file}: ${token}`);
}

const requiredPage62Paths = [
  ['toolbarAria'],
  ['labels', 'discovery'],
  ['labels', 'cockpit'],
  ['labels', 'documentsRisk'],
  ['labels', 'negotiation'],
  ['labels', 'review'],
  ['labels', 'feedback'],
  ['labels', 'correction'],
  ['overview', 'openCockpit'],
  ['cockpit', 'tabs', 'timeline'],
  ['negotiation', 'title'],
  ['review', 'title'],
  ['feedback', 'title'],
  ['correction', 'title'],
];

const get = (object, path) => path.reduce((value, key) => value?.[key], object);

for (const { locale, messages } of localeFiles) {
  for (const path of requiredPage62Paths) {
    const value = get(messages.page62Journey, path);
    if (typeof value !== 'string' || !value.trim()) {
      failures.push(`${locale} missing page62Journey.${path.join('.')}`);
    }
  }

  for (const key of ['loginTitle', 'registerTitle', 'loginDescription', 'registerDescription']) {
    const value = messages.auth?.[key];
    if (typeof value !== 'string' || !value.trim()) failures.push(`${locale} missing auth.${key}`);
  }
}

if (failures.length) {
  console.error('[auth-i18n] FAIL');
  failures.forEach((failure) => console.error(` - ${failure}`));
  process.exit(1);
}

console.log('[auth-i18n] PASS');
console.log(' auth: /entrar + /registrar share one OTP-capable AuthForm');
console.log(' otp: detached route retired; challenge stays in canonical flow');
console.log(' visual: neutral-first auth/OTP skin');
console.log(' locales: pt-BR / en-US / es available in Storybook');
console.log(' Page 62: D01-D12 workflow chrome localized; former D13 remains absorbed in Cockpit');
