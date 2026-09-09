#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const vesselHeroImages = [
  '/mock/vessels/cargo-vessel-real-water-01.webp',
  '/mock/vessels/cargo-container-aerial-blue-01.webp',
  '/mock/vessels/cargo-container-open-water-01.webp',
  '/mock/vessels/trade-boat-river-01.webp',
  '/mock/vessels/cargo-vessel-port-01.jpg',
  '/mock/vessels/rustic-fishing-boat-dusk-01.avif',
  '/mock/vessels/vessel-foggy-cinematic-01.avif',
  '/mock/vessels/river-tug-barges-dark-01.webp',
  '/mock/vessels/amazon-regional-cargo-01.webp',
  '/mock/vessels/refrigerated-river-vessel-01.webp',
  '/mock/vessels/regional-supply-barge-01.webp',
  '/mock/vessels/river-tanker-barge-01.webp'
];

function filePath(relativePath) {
  return path.join(root, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(filePath(relativePath));
}

function read(relativePath) {
  return fs.readFileSync(filePath(relativePath), 'utf8');
}

function write(relativePath, content) {
  fs.writeFileSync(filePath(relativePath), content);
}

function backup(relativePath) {
  const absolutePath = filePath(relativePath);
  if (!fs.existsSync(absolutePath)) return;
  const backupPath = `${absolutePath}.bak-final-fix`;
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(absolutePath, backupPath);
  }
}

function replaceRegex(content, regex, replacement, label) {
  if (!regex.test(content)) {
    console.warn(`⚠️  Não encontrei trecho para: ${label}`);
    return content;
  }
  regex.lastIndex = 0;
  return content.replace(regex, replacement);
}

function ensureContains(content, needle, insertAfterRegex, snippet, label) {
  if (content.includes(needle)) return content;
  if (!insertAfterRegex.test(content)) {
    console.warn(`⚠️  Não consegui inserir ${label}`);
    return content;
  }
  insertAfterRegex.lastIndex = 0;
  return content.replace(insertAfterRegex, (match) => `${match}${snippet}`);
}

function patchCargoVesselVisual() {
  const relativePath = 'src/features/cargo-market/components/cargo-detail/cargo-vessel-visual.ts';
  if (!exists(relativePath)) {
    console.warn(`⚠️  Arquivo não encontrado: ${relativePath}`);
    return;
  }

  backup(relativePath);
  let content = read(relativePath);

  content = replaceRegex(
    content,
    /function pickPresetIndex\(cargo: Cargo\): number \{[\s\S]*?\n\}/,
    `function pickPresetIndex(cargo: Cargo): number {
  const idPart = stableHash(cargo.id);
  const routePart = stableHash(\`\${cargo.origin}|\${cargo.destination}\`);
  const kindPart = stableHash(
    \`\${cargo.cargoType}|\${cargo.serviceType ?? ''}|\${cargo.mainRiver ?? ''}|\${cargo.corridor ?? ''}\`
  );

  // Bitwise XOR trabalha com inteiro assinado de 32 bits; >>> 0 garante índice positivo em SSR e client.
  return ((idPart ^ routePart ^ kindPart) >>> 0) % VESSEL_PRESETS.length;
}`,
    'pickPresetIndex com módulo positivo'
  );

  content = content.replace(
    /const preset = VESSEL_PRESETS\[idx\]!;/,
    'const preset = VESSEL_PRESETS[idx] ?? VESSEL_PRESETS[0];'
  );

  write(relativePath, content);
  console.log(`✅ Corrigido: ${relativePath}`);
}

function patchOperationsBoard() {
  const relativePath = 'src/features/dashboard/components/operations-board/operations-board.tsx';
  if (!exists(relativePath)) {
    console.warn(`⚠️  Arquivo não encontrado: ${relativePath}`);
    return;
  }

  backup(relativePath);
  let content = read(relativePath);

  content = ensureContains(
    content,
    "cargo-vessel-visual",
    /import \{ PriorityTab \} from '@\/features\/dashboard\/components\/priority-tab\/priority-tab';\n/,
    "import { getVesselVisual } from '@/features/cargo-market/components/cargo-detail/cargo-vessel-visual';\n",
    'import getVesselVisual'
  );

  content = replaceRegex(
    content,
    /const OVERVIEW_VESSEL_IMAGES = \[[\s\S]*?\] as const;\n/,
    `type OverviewVesselVisual = ReturnType<typeof getVesselVisual>;

const DEFAULT_OVERVIEW_VESSEL_IMAGE = '${vesselHeroImages[0]}';

`,
    'catálogo antigo OVERVIEW_VESSEL_IMAGES'
  );

  content = replaceRegex(
    content,
    /function stableIndexFromCargoId\(value: string, modulo: number\) \{[\s\S]*?function getTimelineSource\(event: TrackingEvent\) \{/,
    `function getTimelineSource(event: TrackingEvent) {`,
    'remoção de stableIndex/getFallback/getRandom'
  );

  content = replaceRegex(
    content,
    /const vesselImageMap = useMemo\(\s*\(\) =>\s*Object\.fromEntries\(\s*visualCargoes\.map\(\(cargo\) => \[cargo\.id, getRandomVesselImage\(\)\]\)\s*\) as Record<string, string>,\s*\[visualCargoes\]\s*\);/,
    `const vesselVisualMap = useMemo(
    () =>
      Object.fromEntries(
        visualCargoes.map((cargo) => [cargo.id, getVesselVisual(cargo)])
      ) as Record<string, OverviewVesselVisual>,
    [visualCargoes]
  );`,
    'memo vesselImageMap aleatório'
  );

  content = replaceRegex(
    content,
    /const selectedVesselImage = selectedCargo\s*\?\s*\(vesselImageMap\[selectedCargo\.id\] \?\? getFallbackOverviewVesselImage\(selectedCargo\)\)\s*:\s*OVERVIEW_VESSEL_IMAGES\[0\];/,
    `const selectedVesselVisual = selectedCargo
    ? (vesselVisualMap[selectedCargo.id] ?? getVesselVisual(selectedCargo))
    : null;
  const selectedVesselImage = selectedVesselVisual?.src ?? DEFAULT_OVERVIEW_VESSEL_IMAGE;`,
    'selectedVesselImage randômico/fallback antigo'
  );

  content = content.replace(
    /<div className="hx-vessel-photo hx-vessel-photo--editorial" aria-label=\{tBoard\('overview\.vesselImageAria'\)\}>/,
    `<div
                    className="hx-vessel-photo hx-vessel-photo--editorial"
                    data-treatment={selectedVesselVisual?.treatment ?? 'real-water-dark'}
                    aria-label={tBoard('overview.vesselImageAria')}
                  >`
  );

  content = content.replace(
    /alt=\{`Embarcação associada à carga \$\{selectedCargo\.id\}`\}/,
    "alt={selectedVesselVisual?.alt ?? `Embarcação associada à carga ${selectedCargo.id}`}"
  );

  content = content.replace(
    /height=\{280\}\n\s*unoptimized/,
    "height={280}\n                        style={{ objectPosition: selectedVesselVisual?.objectPosition ?? 'center right' }}\n                        unoptimized"
  );

  write(relativePath, content);
  console.log(`✅ Corrigido: ${relativePath}`);
}

function patchMarketplaceMockImages() {
  const relativePath = 'src/features/marketplace/data/marketplace.mock.ts';
  if (!exists(relativePath)) {
    console.warn(`⚠️  Arquivo não encontrado: ${relativePath}`);
    return;
  }

  backup(relativePath);
  let content = read(relativePath);
  content = content.replace(/\/vessels\/overview\/vessel-(\d+)\.(?:jpg|png)/g, (_, numberText) => {
    const index = (Number(numberText) - 1) % vesselHeroImages.length;
    return vesselHeroImages[index] ?? vesselHeroImages[0];
  });

  write(relativePath, content);
  console.log(`✅ Corrigido: ${relativePath}`);
}

function patchMockQaAssistantLinks() {
  const relativePath = 'src/shared/ui/mock-mode/mock-qa-assistant.tsx';
  if (!exists(relativePath)) {
    console.warn(`⚠️  Arquivo não encontrado: ${relativePath}`);
    return;
  }

  backup(relativePath);
  let content = read(relativePath);

  content = content.replace("import { useLocale, useTranslations } from 'next-intl';", "import { useTranslations } from 'next-intl';");
  content = content.replace("import type { AppLocale } from '@/shared/routing/route-types';\n", '');
  content = content.replace("import { localizedAppPath } from '@/shared/routing/app-routes';\n", '');
  content = content.replace(/\n\s*const locale = useLocale\(\);/, '');

  content = content.replace(/href=\{localizedAppPath\(locale as AppLocale, scenario\.startRoute\)\}/g, 'href={scenario.startRoute}');

  write(relativePath, content);
  console.log(`✅ Corrigido: ${relativePath}`);
}

function mergeDeep(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      target[key] = mergeDeep(target[key] && typeof target[key] === 'object' ? target[key] : {}, value);
    } else if (target[key] === undefined) {
      target[key] = value;
    }
  }
  return target;
}

const qaTranslations = {
  'pt-BR': {
    mockMode: {
      qaAssistant: {
        journeyFilterLabel: 'Filtrar por jornada',
        filterAll: 'Todas',
        journeyGroups: {
          auth: 'Acesso',
          dashboard: 'Dashboard',
          cargoes: 'Cargas',
          'my-cargoes': 'Minhas cargas',
          negotiations: 'Negociações',
          tracking: 'Rastreio',
          notifications: 'Notificações',
          mobile: 'Celular',
          theme: 'Tema',
          impact: 'Impacto',
          government: 'Governo',
          vessels: 'Embarcações',
          other: 'Outros'
        },
        journeyGroupDescriptions: {
          auth: 'Login, cadastro, sessão e recuperação de acesso.',
          dashboard: 'Visão operacional, filtros e leitura rápida da operação.',
          cargoes: 'Cadastro, publicação e acompanhamento de cargas.',
          'my-cargoes': 'Cargas vinculadas ao perfil e próximos passos.',
          negotiations: 'Propostas, contrapropostas e acordos.',
          tracking: 'Rastreamento, status e baixa conectividade.',
          notifications: 'Alertas, avisos e leitura de pendências.',
          mobile: 'Navegação e experiência em telas menores.',
          theme: 'Tema visual, contraste e preferências de interface.',
          impact: 'Indicadores de impacto e sustentabilidade.',
          government: 'Fluxos institucionais e de validação pública.',
          vessels: 'Embarcações, operadores e disponibilidade.',
          other: 'Cenários complementares de QA.'
        }
      }
    }
  },
  'en-US': {
    mockMode: {
      qaAssistant: {
        journeyFilterLabel: 'Filter by journey',
        filterAll: 'All',
        journeyGroups: {
          auth: 'Access',
          dashboard: 'Dashboard',
          cargoes: 'Cargoes',
          'my-cargoes': 'My cargoes',
          negotiations: 'Negotiations',
          tracking: 'Tracking',
          notifications: 'Notifications',
          mobile: 'Mobile',
          theme: 'Theme',
          impact: 'Impact',
          government: 'Government',
          vessels: 'Vessels',
          other: 'Other'
        },
        journeyGroupDescriptions: {
          auth: 'Login, registration, session and access recovery.',
          dashboard: 'Operational overview, filters and quick status reading.',
          cargoes: 'Cargo creation, publishing and monitoring.',
          'my-cargoes': 'Cargoes linked to the profile and next steps.',
          negotiations: 'Offers, counteroffers and agreements.',
          tracking: 'Tracking, status and low-connectivity behavior.',
          notifications: 'Alerts, notices and pending items.',
          mobile: 'Navigation and experience on smaller screens.',
          theme: 'Visual theme, contrast and interface preferences.',
          impact: 'Impact and sustainability indicators.',
          government: 'Institutional and public validation flows.',
          vessels: 'Vessels, operators and availability.',
          other: 'Additional QA scenarios.'
        }
      }
    }
  },
  es: {
    mockMode: {
      qaAssistant: {
        journeyFilterLabel: 'Filtrar por jornada',
        filterAll: 'Todas',
        journeyGroups: {
          auth: 'Acceso',
          dashboard: 'Dashboard',
          cargoes: 'Cargas',
          'my-cargoes': 'Mis cargas',
          negotiations: 'Negociaciones',
          tracking: 'Rastreo',
          notifications: 'Notificaciones',
          mobile: 'Móvil',
          theme: 'Tema',
          impact: 'Impacto',
          government: 'Gobierno',
          vessels: 'Embarcaciones',
          other: 'Otros'
        },
        journeyGroupDescriptions: {
          auth: 'Inicio de sesión, registro, sesión y recuperación de acceso.',
          dashboard: 'Vista operativa, filtros y lectura rápida del estado.',
          cargoes: 'Creación, publicación y seguimiento de cargas.',
          'my-cargoes': 'Cargas vinculadas al perfil y próximos pasos.',
          negotiations: 'Propuestas, contrapropuestas y acuerdos.',
          tracking: 'Rastreo, estado y baja conectividad.',
          notifications: 'Alertas, avisos y pendientes.',
          mobile: 'Navegación y experiencia en pantallas pequeñas.',
          theme: 'Tema visual, contraste y preferencias de interfaz.',
          impact: 'Indicadores de impacto y sostenibilidad.',
          government: 'Flujos institucionales y validación pública.',
          vessels: 'Embarcaciones, operadores y disponibilidad.',
          other: 'Escenarios adicionales de QA.'
        }
      }
    }
  }
};

function patchMessages() {
  for (const locale of ['pt-BR', 'en-US', 'es']) {
    const relativePath = `messages/${locale}.json`;
    if (!exists(relativePath)) {
      console.warn(`⚠️  Arquivo não encontrado: ${relativePath}`);
      continue;
    }

    backup(relativePath);
    const json = JSON.parse(read(relativePath));
    mergeDeep(json, qaTranslations[locale]);
    write(relativePath, `${JSON.stringify(json, null, 2)}\n`);
    console.log(`✅ Corrigido: ${relativePath}`);
  }
}

function appendOverviewCss() {
  const relativePath = 'src/app/globals.scss';
  if (!exists(relativePath)) {
    console.warn(`⚠️  Arquivo não encontrado: ${relativePath}`);
    return;
  }

  backup(relativePath);
  let content = read(relativePath);
  const marker = '/* HydriRivers final cargo overview hero patch */';
  if (content.includes(marker)) {
    console.log(`ℹ️  CSS final já existe em ${relativePath}`);
    return;
  }

  const css = `

${marker}
.hx-overview-main-card {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  background:
    radial-gradient(circle at 72% 26%, rgba(45, 224, 210, 0.14), transparent 36%),
    linear-gradient(135deg, rgba(4, 15, 18, 0.98), rgba(3, 11, 13, 0.96));
}

.hx-overview-main-card::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background:
    linear-gradient(90deg, rgba(2, 8, 10, 0.96) 0%, rgba(2, 8, 10, 0.88) 34%, rgba(2, 8, 10, 0.48) 58%, rgba(2, 8, 10, 0.72) 100%),
    radial-gradient(circle at 78% 42%, rgba(42, 224, 210, 0.08), transparent 34%);
}

.hx-overview-hero {
  position: relative;
  overflow: hidden;
  min-height: clamp(21rem, 34vw, 29rem);
  display: grid;
  grid-template-columns: minmax(0, 0.58fr) minmax(18rem, 0.42fr);
  align-items: stretch;
  gap: clamp(1.25rem, 3vw, 3rem);
  padding: clamp(1.35rem, 2.4vw, 2rem);
  border-radius: inherit;
}

.hx-overview-info {
  position: relative;
  z-index: 3;
  max-width: 46rem;
  align-self: center;
  min-width: 0;
}

.hx-vessel-photo.hx-vessel-photo--editorial {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  border: 0;
  background: transparent;
  box-shadow: none;
  overflow: hidden;
}

.hx-vessel-photo__river,
.hx-vessel-photo__media {
  position: absolute;
  inset: 0;
}

.hx-vessel-photo__river {
  z-index: 2;
  background:
    linear-gradient(90deg, rgba(2, 8, 10, 0.96) 0%, rgba(2, 8, 10, 0.86) 35%, rgba(2, 8, 10, 0.36) 62%, rgba(2, 8, 10, 0.68) 100%),
    linear-gradient(180deg, rgba(2, 8, 10, 0.32) 0%, rgba(2, 8, 10, 0.05) 44%, rgba(2, 8, 10, 0.78) 100%),
    repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.024) 0 1px, transparent 1px 9px);
  mix-blend-mode: normal;
}

.hx-vessel-photo__media {
  z-index: 1;
}

.hx-vessel-photo__image {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
  object-position: center right;
  opacity: 0.68;
  filter: brightness(0.62) contrast(1.1) saturate(0.92);
  transform: scale(1.04);
}

.hx-vessel-photo[data-treatment="foggy-cinematic"] .hx-vessel-photo__image {
  opacity: 0.6;
  filter: brightness(0.58) contrast(1.04) saturate(0.78);
}

.hx-vessel-photo[data-treatment="port-sunset"] .hx-vessel-photo__image {
  opacity: 0.64;
  filter: brightness(0.58) contrast(1.08) saturate(0.88);
}

.hx-vessel-photo[data-treatment="studio-treated"] .hx-vessel-photo__image {
  opacity: 0.52;
  filter: brightness(0.48) contrast(1.12) saturate(0.72);
}

.hx-route-progress {
  position: relative;
  z-index: 4;
  margin: 0 clamp(1rem, 2.2vw, 1.75rem) clamp(1rem, 2vw, 1.5rem);
  background: rgba(1, 8, 10, 0.62);
  backdrop-filter: blur(16px);
}

@media (max-width: 900px) {
  .hx-overview-hero {
    display: flex;
    flex-direction: column;
    min-height: auto;
    padding-bottom: clamp(14rem, 44vw, 19rem);
  }

  .hx-vessel-photo.hx-vessel-photo--editorial {
    top: auto;
    min-height: clamp(13rem, 42vw, 18rem);
  }

  .hx-vessel-photo__river {
    background:
      linear-gradient(180deg, rgba(2, 8, 10, 0.62) 0%, rgba(2, 8, 10, 0.2) 42%, rgba(2, 8, 10, 0.82) 100%),
      linear-gradient(90deg, rgba(2, 8, 10, 0.88) 0%, rgba(2, 8, 10, 0.36) 52%, rgba(2, 8, 10, 0.62) 100%);
  }

  .hx-route-progress {
    margin-inline: 0.75rem;
    margin-bottom: 1rem;
  }
}
`;

  write(relativePath, `${content}${css}`);
  console.log(`✅ CSS final adicionado: ${relativePath}`);
}

function finalReport() {
  const opsPath = 'src/features/dashboard/components/operations-board/operations-board.tsx';
  const marketplacePath = 'src/features/marketplace/data/marketplace.mock.ts';
  const warnings = [];

  for (const relativePath of [opsPath, marketplacePath]) {
    if (!exists(relativePath)) continue;
    const content = read(relativePath);
    if (/Math\.random|getRandomVesselImage|\/vessels\/overview/.test(content)) {
      warnings.push(`Ainda há referência antiga em ${relativePath}`);
    }
  }

  const visualPath = 'src/features/cargo-market/components/cargo-detail/cargo-vessel-visual.ts';
  if (exists(visualPath) && !read(visualPath).includes('>>> 0')) {
    warnings.push(`cargo-vessel-visual.ts pode ainda estar sem módulo positivo`);
  }

  if (warnings.length) {
    console.log('\n⚠️  Pendências:');
    for (const warning of warnings) console.log(`- ${warning}`);
    process.exitCode = 1;
    return;
  }

  console.log('\n✅ Patches aplicados. Valide com:');
  console.log('grep -RInE "Math\\.random|getRandomVesselImage|/vessels/overview" src/features/dashboard/components/operations-board/operations-board.tsx');
  console.log('npm run typecheck && npm run lint && npm run check:i18n && npm test && npm run build && npm run test:mock-mode');
}

patchCargoVesselVisual();
patchOperationsBoard();
patchMarketplaceMockImages();
patchMockQaAssistantLinks();
patchMessages();
appendOverviewCss();
finalReport();
