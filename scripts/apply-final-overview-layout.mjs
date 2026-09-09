#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const root = process.cwd();
const backupRoot = join(root, `.bak-overview-final-${new Date().toISOString().replace(/[:.]/g, '-')}`);

function read(rel) {
  const abs = join(root, rel);
  if (!existsSync(abs)) throw new Error(`Arquivo não encontrado: ${rel}`);
  return readFileSync(abs, 'utf8');
}

function write(rel, content) {
  const abs = join(root, rel);
  const backup = join(backupRoot, rel);
  mkdirSync(dirname(backup), { recursive: true });
  if (existsSync(abs)) copyFileSync(abs, backup);
  writeFileSync(abs, content, 'utf8');
  console.log(`✅ Atualizado: ${rel}`);
}

function copyAssets() {
  const source = join(root, 'public/mock/vessels');
  mkdirSync(source, { recursive: true });
  const assetDir = join(dirname(new URL(import.meta.url).pathname), '..', 'public/mock/vessels');
  if (!existsSync(assetDir)) return;
  for (const name of readdirSync(assetDir)) {
    if (!/^hr-vessel-hero-\d+\.webp$/.test(name)) continue;
    copyFileSync(join(assetDir, name), join(source, name));
  }
  console.log('✅ Assets hr-vessel-hero-*.webp copiados para public/mock/vessels/');
}

function patchOperationsBoard() {
  const rel = 'src/features/dashboard/components/operations-board/operations-board.tsx';
  let source = read(rel);

  const vesselArray = `const OVERVIEW_VESSEL_IMAGES = [
  '/mock/vessels/hr-vessel-hero-01.webp',
  '/mock/vessels/hr-vessel-hero-02.webp',
  '/mock/vessels/hr-vessel-hero-03.webp',
  '/mock/vessels/hr-vessel-hero-04.webp',
  '/mock/vessels/hr-vessel-hero-05.webp',
  '/mock/vessels/hr-vessel-hero-06.webp',
  '/mock/vessels/hr-vessel-hero-07.webp',
  '/mock/vessels/hr-vessel-hero-08.webp',
  '/mock/vessels/hr-vessel-hero-09.webp',
  '/mock/vessels/hr-vessel-hero-10.webp',
  '/mock/vessels/hr-vessel-hero-11.webp',
  '/mock/vessels/hr-vessel-hero-12.webp'
] as const;

const DEFAULT_OVERVIEW_VESSEL_IMAGE = OVERVIEW_VESSEL_IMAGES[0];`;

  if (/const OVERVIEW_VESSEL_IMAGES = \[[\s\S]*?\] as const;\s*(?:\nconst DEFAULT_OVERVIEW_VESSEL_IMAGE[^\n]*;\s*)?/.test(source)) {
    source = source.replace(/const OVERVIEW_VESSEL_IMAGES = \[[\s\S]*?\] as const;\s*(?:\nconst DEFAULT_OVERVIEW_VESSEL_IMAGE[^\n]*;\s*)?/, vesselArray + '\n');
  } else if (!source.includes('const OVERVIEW_VESSEL_IMAGES = [')) {
    source = source.replace(/const tabs: Array<\{ key: DashboardTab; labelKey: string \}> = \[[\s\S]*?\];/, (match) => `${match}\n\n${vesselArray}`);
  }

  // Remove função randômica, se existir.
  source = source.replace(/\nfunction getRandomVesselImage\(\) \{\s*return OVERVIEW_VESSEL_IMAGES\[Math\.floor\(Math\.random\(\) \* OVERVIEW_VESSEL_IMAGES\.length\)\] \?\? OVERVIEW_VESSEL_IMAGES\[0\];\s*\}\n/g, '\n');

  // Garante fallback determinístico e positivo.
  const fallbackFn = `function getFallbackOverviewVesselImage(cargo?: Cargo | null) {
  const key = cargo
    ? \`\${cargo.id}|\${cargo.origin}|\${cargo.destination}|\${cargo.cargoType}|\${cargo.mainRiver ?? ''}|\${cargo.corridor ?? ''}\`
    : 'default-cargo';
  const index = stableIndexFromCargoId(key, OVERVIEW_VESSEL_IMAGES.length);
  return OVERVIEW_VESSEL_IMAGES[index] ?? DEFAULT_OVERVIEW_VESSEL_IMAGE;
}`;

  if (/function getFallbackOverviewVesselImage\(cargo\?: Cargo \| null\) \{[\s\S]*?\n\}/.test(source)) {
    source = source.replace(/function getFallbackOverviewVesselImage\(cargo\?: Cargo \| null\) \{[\s\S]*?\n\}/, fallbackFn);
  } else {
    source = source.replace(/function stableIndexFromCargoId\([\s\S]*?\n\}/, (match) => `${match}\n\n${fallbackFn}`);
  }

  // Corrige stableIndexFromCargoId quando necessário para nunca retornar índice inválido.
  source = source.replace(
    /function stableIndexFromCargoId\(input: string, modulo: number\) \{[\s\S]*?return Math\.abs\(hash\) % modulo;\s*\}/,
    `function stableIndexFromCargoId(input: string, modulo: number) {
  if (modulo <= 0) return 0;

  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = Math.imul(31, hash) + input.charCodeAt(index);
    hash |= 0;
  }

  return ((hash % modulo) + modulo) % modulo;
}`
  );

  // Troca map randômico por map determinístico. Funciona tanto no arquivo antigo quanto no já parcialmente patchado.
  source = source.replace(
    /const vesselImageMap = useMemo\(\s*\(\) =>[\s\S]*?\s*\[visualCargoes\]\s*\);\s*\n\s*const options = useMemo/,
    `const vesselImageMap = useMemo(
    () =>
      Object.fromEntries(
        visualCargoes.map((cargo) => [cargo.id, getFallbackOverviewVesselImage(cargo)])
      ) as Record<string, string>,
    [visualCargoes]
  );

  const options = useMemo`
  );

  // Garante selectedVesselImage determinístico.
  source = source.replace(
    /const selectedVesselImage = selectedCargo\s*\?[\s\S]*?\s*: [^;]+;/,
    `const selectedVesselImage = selectedCargo
    ? (vesselImageMap[selectedCargo.id] ?? getFallbackOverviewVesselImage(selectedCargo))
    : DEFAULT_OVERVIEW_VESSEL_IMAGE;`
  );

  // Next/Image: qualidade e sizes sem alterar semântica.
  source = source.replace(
    /<Image\s+src=\{selectedVesselImage\}\s+alt=\{`Embarcação associada à carga \$\{selectedCargo\.id\}`\}\s+className="hx-vessel-photo__image"\s+width=\{560\}\s+height=\{280\}\s+unoptimized\s+\/>/,
    `<Image
                        src={selectedVesselImage}
                        alt={\`Embarcação associada à carga \${selectedCargo.id}\`}
                        className="hx-vessel-photo__image"
                        width={960}
                        height={540}
                        sizes="(max-width: 900px) 100vw, 58vw"
                        priority
                        unoptimized
                      />`
  );

  // Alguns patches anteriores podem ter importado helper desnecessário; remove se estiver sem uso.
  source = source.replace(/\nimport \{ getVesselVisual \} from '@\/features\/cargo-market\/components\/cargo-detail\/cargo-vessel-visual';/g, '');

  if (/Math\.random|getRandomVesselImage|\/vessels\/overview/.test(source)) {
    throw new Error('Ainda existem referências antigas em operations-board.tsx. O script abortou para evitar patch parcial.');
  }

  write(rel, source);
}

function patchCargoVesselVisual() {
  const rel = 'src/features/cargo-market/components/cargo-detail/cargo-vessel-visual.ts';
  if (!existsSync(join(root, rel))) {
    console.log(`ℹ️  ${rel} não existe neste checkout; pulando.`);
    return;
  }

  const content = `import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { vessels } from '@/features/marketplace/data/marketplace.mock';

export type VesselVisualTreatment =
  | 'real-water-dark'
  | 'studio-treated'
  | 'port-sunset'
  | 'foggy-cinematic';

export type VesselVisual = {
  src: string;
  alt: string;
  treatment: VesselVisualTreatment;
  objectPosition: string;
  vesselName: string;
};

const VESSEL_PRESETS = [
  { src: '/mock/vessels/hr-vessel-hero-01.webp', treatment: 'real-water-dark' as const, objectPosition: 'center right' },
  { src: '/mock/vessels/hr-vessel-hero-02.webp', treatment: 'real-water-dark' as const, objectPosition: 'center right' },
  { src: '/mock/vessels/hr-vessel-hero-03.webp', treatment: 'foggy-cinematic' as const, objectPosition: 'center right' },
  { src: '/mock/vessels/hr-vessel-hero-04.webp', treatment: 'foggy-cinematic' as const, objectPosition: 'center right' },
  { src: '/mock/vessels/hr-vessel-hero-05.webp', treatment: 'real-water-dark' as const, objectPosition: 'center right' },
  { src: '/mock/vessels/hr-vessel-hero-06.webp', treatment: 'port-sunset' as const, objectPosition: 'center right' },
  { src: '/mock/vessels/hr-vessel-hero-07.webp', treatment: 'real-water-dark' as const, objectPosition: 'center right' },
  { src: '/mock/vessels/hr-vessel-hero-08.webp', treatment: 'foggy-cinematic' as const, objectPosition: 'center right' },
  { src: '/mock/vessels/hr-vessel-hero-09.webp', treatment: 'real-water-dark' as const, objectPosition: 'center right' },
  { src: '/mock/vessels/hr-vessel-hero-10.webp', treatment: 'real-water-dark' as const, objectPosition: 'center right' },
  { src: '/mock/vessels/hr-vessel-hero-11.webp', treatment: 'foggy-cinematic' as const, objectPosition: 'center right' },
  { src: '/mock/vessels/hr-vessel-hero-12.webp', treatment: 'real-water-dark' as const, objectPosition: 'center right' }
] as const;

export function stableHash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function positiveModulo(value: number, modulo: number): number {
  if (modulo <= 0) return 0;
  return ((value % modulo) + modulo) % modulo;
}

function pickPresetIndex(cargo: Cargo): number {
  const idPart = stableHash(cargo.id);
  const routePart = stableHash(\`\${cargo.origin}|\${cargo.destination}\`);
  const kindPart = stableHash(
    \`\${cargo.cargoType}|\${cargo.serviceType ?? ''}|\${cargo.mainRiver ?? ''}|\${cargo.corridor ?? ''}\`
  );

  return positiveModulo(idPart ^ routePart ^ kindPart, VESSEL_PRESETS.length);
}

export function getVesselVisual(cargo: Cargo): VesselVisual {
  const idx = pickPresetIndex(cargo);
  const preset = VESSEL_PRESETS[idx] ?? VESSEL_PRESETS[0];
  const vessel = vessels[positiveModulo(idx, vessels.length)];
  const vesselName = vessel?.name ?? 'Embarcação';

  return {
    src: preset.src,
    alt: \`\${vesselName} — \${cargo.origin} – \${cargo.destination} · \${cargo.id}\`,
    treatment: preset.treatment,
    objectPosition: preset.objectPosition,
    vesselName
  };
}
`;
  write(rel, content);
}

function patchMarketplaceMock() {
  const rel = 'src/features/marketplace/data/marketplace.mock.ts';
  if (!existsSync(join(root, rel))) return;
  let source = read(rel);

  const replacements = [
    ['/vessels/overview/vessel-02.png', '/mock/vessels/hr-vessel-hero-01.webp'],
    ['/vessels/overview/vessel-05.png', '/mock/vessels/hr-vessel-hero-02.webp'],
    ['/vessels/overview/vessel-11.png', '/mock/vessels/hr-vessel-hero-03.webp'],
    ['/vessels/overview/vessel-13.png', '/mock/vessels/hr-vessel-hero-04.webp'],
    ['/vessels/overview/vessel-14.png', '/mock/vessels/hr-vessel-hero-05.webp'],
    ['/vessels/overview/vessel-07.png', '/mock/vessels/hr-vessel-hero-06.webp'],
    ['/vessels/overview/vessel-19.png', '/mock/vessels/hr-vessel-hero-07.webp']
  ];

  for (const [from, to] of replacements) {
    source = source.split(from).join(to);
  }

  write(rel, source);
}

function patchGlobals() {
  const rel = 'src/app/globals.scss';
  let source = read(rel);
  const start = '/* HYDRIRIVERS_FINAL_CARGAS_OVERVIEW_START */';
  const end = '/* HYDRIRIVERS_FINAL_CARGAS_OVERVIEW_END */';
  const block = `${start}
.hx-overview.hx-overview--split {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) minmax(19rem, 24rem) !important;
  gap: clamp(.85rem, 1vw, 1.1rem) !important;
  align-items: stretch !important;
  min-width: 0 !important;
}

.hx-overview.hx-overview--split .hx-overview-main-card {
  position: relative !important;
  isolation: isolate !important;
  overflow: hidden !important;
  display: grid !important;
  grid-template-rows: auto auto auto !important;
  gap: 0 !important;
  min-width: 0 !important;
  padding: 0 !important;
  border-radius: 22px !important;
  border: 1px solid color-mix(in srgb, var(--hx-cyan) 17%, var(--hx-line-soft)) !important;
  background:
    radial-gradient(circle at 78% 22%, color-mix(in srgb, var(--hx-cyan) 13%, transparent), transparent 26rem),
    linear-gradient(180deg, color-mix(in srgb, var(--hx-card-2) 72%, transparent), color-mix(in srgb, var(--hx-bg) 94%, transparent)) !important;
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, white 4%, transparent),
    0 22px 70px rgba(0, 0, 0, .26) !important;
}

.hx-overview.hx-overview--split .hx-overview-main-card::before {
  content: "" !important;
  position: absolute !important;
  inset: 0 !important;
  z-index: 0 !important;
  pointer-events: none !important;
  background:
    linear-gradient(90deg, rgba(1, 8, 11, .36), transparent 44%, rgba(1, 8, 11, .28)),
    radial-gradient(circle at 70% 95%, color-mix(in srgb, var(--hx-cyan) 8%, transparent), transparent 18rem) !important;
}

.hx-overview.hx-overview--split .hx-overview-hero {
  position: relative !important;
  z-index: 1 !important;
  display: grid !important;
  grid-template-columns: minmax(18rem, .44fr) minmax(25rem, .56fr) !important;
  gap: clamp(.9rem, 1.15vw, 1.25rem) !important;
  align-items: stretch !important;
  min-height: clamp(20rem, 26vw, 25rem) !important;
  padding: clamp(1.1rem, 1.55vw, 1.45rem) clamp(1.1rem, 1.55vw, 1.45rem) 1rem !important;
}

.hx-overview.hx-overview--split .hx-overview-info {
  position: relative !important;
  z-index: 3 !important;
  align-self: center !important;
  min-width: 0 !important;
  max-width: 34rem !important;
}

.hx-overview.hx-overview--split .hx-title-row {
  align-items: center !important;
  gap: .7rem !important;
}

.hx-overview.hx-overview--split .hx-title-row h2 {
  font-size: clamp(2rem, 2.3vw, 3rem) !important;
  line-height: .95 !important;
  letter-spacing: -.045em !important;
}

.hx-overview.hx-overview--split .hx-overview-info > p {
  max-width: 31rem !important;
  color: color-mix(in srgb, var(--hx-text) 76%, transparent) !important;
  font-size: clamp(1rem, 1.02vw, 1.22rem) !important;
  line-height: 1.38 !important;
}

.hx-overview.hx-overview--split .hx-operation-meta {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: .72rem !important;
  padding-top: .9rem !important;
  margin-top: .75rem !important;
  border-top: 1px solid color-mix(in srgb, var(--hx-line-soft) 82%, transparent) !important;
}

.hx-overview.hx-overview--split .hx-operation-meta span {
  min-width: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  background: transparent !important;
  display: grid !important;
  grid-template-columns: auto minmax(0, 1fr) !important;
  grid-template-areas: "icon label" "icon value" !important;
  column-gap: .55rem !important;
  row-gap: .18rem !important;
}

.hx-overview.hx-overview--split .hx-operation-meta svg {
  grid-area: icon !important;
  width: 1.1rem !important;
  height: 1.1rem !important;
  margin-top: .1rem !important;
  color: var(--hx-cyan) !important;
}

.hx-overview.hx-overview--split .hx-operation-meta em {
  grid-area: label !important;
  color: var(--hx-muted) !important;
  font-size: .72rem !important;
  font-weight: 800 !important;
  text-transform: uppercase !important;
  letter-spacing: .08em !important;
  font-style: normal !important;
}

.hx-overview.hx-overview--split .hx-operation-meta b {
  grid-area: value !important;
  color: var(--hx-text) !important;
  font-size: .98rem !important;
  line-height: 1.15 !important;
}

.hx-overview.hx-overview--split .hx-vessel-photo.hx-vessel-photo--editorial {
  position: relative !important;
  grid-column: 2 !important;
  grid-row: 1 !important;
  isolation: isolate !important;
  align-self: stretch !important;
  min-height: clamp(18rem, 24vw, 23rem) !important;
  max-height: none !important;
  margin: -.35rem -.35rem -.15rem 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  border: 0 !important;
  border-radius: 18px !important;
  background:
    radial-gradient(circle at 70% 30%, color-mix(in srgb, var(--hx-cyan) 12%, transparent), transparent 18rem),
    linear-gradient(180deg, #06151b, #02080c) !important;
  box-shadow: none !important;
}

.hx-overview.hx-overview--split .hx-vessel-photo.hx-vessel-photo--editorial::before {
  content: "" !important;
  display: block !important;
  position: absolute !important;
  inset: 0 !important;
  z-index: 3 !important;
  pointer-events: none !important;
  background:
    linear-gradient(90deg, rgba(3, 10, 12, .92) 0%, rgba(3, 10, 12, .58) 26%, rgba(3, 10, 12, .08) 55%, rgba(3, 10, 12, .45) 100%),
    linear-gradient(180deg, rgba(2, 7, 10, .62) 0%, transparent 42%, rgba(2, 7, 10, .82) 100%) !important;
}

.hx-overview.hx-overview--split .hx-vessel-photo.hx-vessel-photo--editorial::after {
  content: "" !important;
  display: block !important;
  position: absolute !important;
  inset: 0 !important;
  z-index: 4 !important;
  pointer-events: none !important;
  background:
    radial-gradient(ellipse at 76% 42%, transparent 0 28%, rgba(0, 0, 0, .38) 72%, rgba(0, 0, 0, .74) 100%),
    repeating-linear-gradient(0deg, rgba(255,255,255,.025) 0 1px, transparent 1px 8px) !important;
  opacity: .76 !important;
  mix-blend-mode: soft-light !important;
}

.hx-overview.hx-overview--split .hx-vessel-photo__river {
  position: absolute !important;
  inset: auto 0 0 !important;
  height: 42% !important;
  z-index: 2 !important;
  display: block !important;
  opacity: .42 !important;
  pointer-events: none !important;
  background:
    radial-gradient(ellipse at 66% 4%, color-mix(in srgb, var(--hx-cyan) 18%, transparent), transparent 52%),
    repeating-linear-gradient(174deg, transparent 0 20px, rgba(255,255,255,.035) 21px 22px) !important;
  filter: blur(.2px) !important;
  mix-blend-mode: screen !important;
}

.hx-overview.hx-overview--split .hx-vessel-photo__media {
  position: absolute !important;
  inset: 0 !important;
  z-index: 1 !important;
  display: block !important;
  min-height: 0 !important;
  padding: 0 !important;
}

.hx-overview.hx-overview--split .hx-vessel-photo.hx-vessel-photo--editorial .hx-vessel-photo__image {
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  max-width: none !important;
  max-height: none !important;
  object-fit: cover !important;
  object-position: center right !important;
  opacity: .78 !important;
  transform: scale(1.035) !important;
  filter: brightness(.68) contrast(1.12) saturate(.94) !important;
  mix-blend-mode: normal !important;
}

.hx-overview.hx-overview--split .hx-route-progress {
  position: relative !important;
  z-index: 2 !important;
  margin: 0 clamp(1.1rem, 1.55vw, 1.45rem) !important;
  padding: 1rem 1rem 1.08rem !important;
  border-radius: 18px !important;
  border: 1px solid color-mix(in srgb, var(--hx-line-soft) 86%, transparent) !important;
  background:
    linear-gradient(180deg, rgba(3, 10, 12, .78), rgba(2, 7, 10, .9)) !important;
  box-shadow: inset 0 1px 0 color-mix(in srgb, white 4%, transparent) !important;
}

.hx-overview.hx-overview--split .hx-route-points {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) !important;
  align-items: end !important;
  gap: .8rem !important;
}

.hx-overview.hx-overview--split .hx-route-points > div:last-child {
  text-align: right !important;
}

.hx-overview.hx-overview--split .hx-route-track {
  display: grid !important;
  grid-template-columns: auto minmax(0, 1fr) auto !important;
  align-items: center !important;
  gap: .72rem !important;
  margin-top: .65rem !important;
}

.hx-overview.hx-overview--split .hx-route-progress p {
  margin-top: .7rem !important;
  text-align: center !important;
}

.hx-overview.hx-overview--split .hx-bottom-kpis {
  position: relative !important;
  z-index: 2 !important;
  display: grid !important;
  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  margin: 1rem 0 0 !important;
  padding: .98rem clamp(1.1rem, 1.55vw, 1.45rem) 1.08rem !important;
  border-top: 1px solid color-mix(in srgb, var(--hx-line-soft) 78%, transparent) !important;
  background: linear-gradient(180deg, rgba(4, 13, 16, .34), rgba(2, 7, 10, .48)) !important;
}

.hx-overview.hx-overview--split .hx-bottom-kpis article {
  min-width: 0 !important;
  padding: .1rem .9rem !important;
  border-right: 1px solid color-mix(in srgb, var(--hx-line-soft) 76%, transparent) !important;
  background: transparent !important;
}

.hx-overview.hx-overview--split .hx-bottom-kpis article:first-child {
  padding-left: 0 !important;
}

.hx-overview.hx-overview--split .hx-bottom-kpis article:last-child {
  border-right: 0 !important;
  padding-right: 0 !important;
}

.hx-overview.hx-overview--split .hx-bottom-kpis small {
  color: color-mix(in srgb, var(--hx-muted) 88%, transparent) !important;
  font-size: .75rem !important;
}

.hx-overview.hx-overview--split .hx-bottom-kpis strong {
  color: var(--hx-cyan) !important;
  font-size: clamp(1.25rem, 1.5vw, 1.8rem) !important;
  line-height: 1 !important;
  letter-spacing: -.04em !important;
}

.hx-overview.hx-overview--split .hx-bottom-kpis span {
  color: var(--hx-muted) !important;
  font-size: .76rem !important;
  line-height: 1.25 !important;
}

.hx-overview.hx-overview--split .hx-overview-side-cards {
  display: grid !important;
  grid-template-columns: 1fr !important;
  grid-template-rows: repeat(4, minmax(0, 1fr)) !important;
  gap: .9rem !important;
  min-width: 0 !important;
}

.hx-overview.hx-overview--split .hx-side-metric {
  position: relative !important;
  overflow: hidden !important;
  display: grid !important;
  grid-template-columns: 3.2rem minmax(0, 1fr) auto !important;
  align-items: center !important;
  gap: .8rem !important;
  min-height: 8.4rem !important;
  padding: 1rem !important;
  border-radius: 18px !important;
  border: 1px solid color-mix(in srgb, var(--hx-cyan) 13%, var(--hx-line-soft)) !important;
  background:
    radial-gradient(circle at 100% 100%, color-mix(in srgb, var(--hx-cyan) 12%, transparent), transparent 9rem),
    linear-gradient(180deg, color-mix(in srgb, var(--hx-card-2) 72%, transparent), color-mix(in srgb, var(--hx-bg) 90%, transparent)) !important;
  box-shadow: inset 0 1px 0 color-mix(in srgb, white 4%, transparent) !important;
}

.hx-overview.hx-overview--split .hx-side-metric__icon {
  width: 3rem !important;
  height: 3rem !important;
  border-radius: 16px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: var(--hx-cyan) !important;
  background: color-mix(in srgb, var(--hx-cyan) 12%, transparent) !important;
  border: 1px solid color-mix(in srgb, var(--hx-cyan) 22%, transparent) !important;
}

.hx-overview.hx-overview--split .hx-side-metric small {
  color: var(--hx-muted) !important;
  font-size: .78rem !important;
  font-weight: 800 !important;
}

.hx-overview.hx-overview--split .hx-side-metric strong {
  color: var(--hx-cyan) !important;
  font-size: clamp(1.16rem, 1.35vw, 1.65rem) !important;
  line-height: 1.05 !important;
  letter-spacing: -.04em !important;
}

.hx-overview.hx-overview--split .hx-side-metric p {
  color: var(--hx-muted) !important;
  font-size: .76rem !important;
  line-height: 1.26 !important;
}

.hx-overview.hx-overview--split .hx-side-sparkline {
  width: 5.6rem !important;
  height: 2.35rem !important;
}

.hx-overview.hx-overview--split .hx-side-sparkline polyline {
  fill: none !important;
  stroke: var(--hx-cyan) !important;
  stroke-width: 3 !important;
  stroke-linecap: round !important;
  stroke-linejoin: round !important;
}

.hx-overview.hx-overview--split .hx-side-sparkline circle {
  fill: var(--hx-cyan) !important;
  r: 2 !important;
}

@media (max-width: 1500px) {
  .hx-overview.hx-overview--split {
    grid-template-columns: minmax(0, 1fr) !important;
  }

  .hx-overview.hx-overview--split .hx-overview-side-cards {
    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
    grid-template-rows: auto !important;
  }

  .hx-overview.hx-overview--split .hx-side-metric {
    grid-template-columns: 2.75rem minmax(0, 1fr) !important;
    min-height: 7.2rem !important;
  }

  .hx-overview.hx-overview--split .hx-side-sparkline,
  .hx-overview.hx-overview--split .hx-side-metric > b {
    grid-column: 2 !important;
    justify-self: start !important;
  }
}

@media (max-width: 1100px) {
  .hx-overview.hx-overview--split .hx-overview-hero {
    grid-template-columns: minmax(0, 1fr) !important;
    min-height: 0 !important;
  }

  .hx-overview.hx-overview--split .hx-vessel-photo.hx-vessel-photo--editorial {
    grid-column: 1 !important;
    min-height: clamp(14rem, 42vw, 20rem) !important;
    margin: .2rem 0 0 !important;
    order: 2 !important;
  }

  .hx-overview.hx-overview--split .hx-overview-info {
    order: 1 !important;
    max-width: none !important;
  }

  .hx-overview.hx-overview--split .hx-overview-side-cards,
  .hx-overview.hx-overview--split .hx-bottom-kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}

@media (max-width: 680px) {
  .hx-overview.hx-overview--split .hx-overview-hero {
    padding: 1rem !important;
  }

  .hx-overview.hx-overview--split .hx-operation-meta,
  .hx-overview.hx-overview--split .hx-bottom-kpis,
  .hx-overview.hx-overview--split .hx-overview-side-cards {
    grid-template-columns: 1fr !important;
  }

  .hx-overview.hx-overview--split .hx-route-points {
    grid-template-columns: 1fr !important;
    text-align: left !important;
  }

  .hx-overview.hx-overview--split .hx-route-points > div:last-child {
    text-align: left !important;
  }

  .hx-overview.hx-overview--split .hx-route-progress {
    margin-inline: 1rem !important;
  }

  .hx-overview.hx-overview--split .hx-bottom-kpis article {
    padding: .7rem 0 !important;
    border-right: 0 !important;
    border-bottom: 1px solid color-mix(in srgb, var(--hx-line-soft) 76%, transparent) !important;
  }

  .hx-overview.hx-overview--split .hx-bottom-kpis article:last-child {
    border-bottom: 0 !important;
  }
}
${end}`;

  const pattern = new RegExp(`${start}[\\s\\S]*?${end}\\n?`, 'g');
  source = source.replace(pattern, '');
  source = `${source.trimEnd()}\n\n${block}\n`;
  write(rel, source);
}

function verify() {
  const operations = read('src/features/dashboard/components/operations-board/operations-board.tsx');
  const oldRefs = operations.match(/Math\.random|getRandomVesselImage|\/vessels\/overview/g);
  if (oldRefs?.length) {
    console.error('❌ Ainda há referências antigas em operations-board.tsx:', oldRefs);
    process.exitCode = 1;
    return;
  }

  console.log('');
  console.log('✅ Verificação local OK: operations-board.tsx sem Math.random/getRandomVesselImage//vessels/overview');
  console.log(`🧾 Backup criado em: ${backupRoot}`);
  console.log('');
  console.log('Agora rode:');
  console.log('  rm -rf .next');
  console.log('  npm run typecheck');
  console.log('  npm run lint');
  console.log('  npm run check:i18n');
  console.log('  npm test');
  console.log('  npm run build');
  console.log('  npm run test:mock-mode');
}

copyAssets();
patchOperationsBoard();
patchCargoVesselVisual();
patchMarketplaceMock();
patchGlobals();
verify();
