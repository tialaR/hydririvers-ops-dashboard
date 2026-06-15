#!/usr/bin/env node
/**
 * Hydri Autopilot Gate — scoped implementation checks before claiming success.
 * Read-only on repo files; optional --run-verify / --run-tests execute npm scripts.
 *
 * Usage:
 *   node scripts/hydri-autopilot-gate.mjs --scope=workflow --mode=workflow
 *   node scripts/hydri-autopilot-gate.mjs --scope=minhas-cargas --mode=mobile
 *   node scripts/hydri-autopilot-gate.mjs --scope=minhas-cargas --mode=mobile --run-verify
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, basename, extname } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();

// ── CLI ──────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const opts = {
    scope: null,
    mode: null,
    allow: [],
    runVerify: false,
    runTests: false,
    runI18n: false,
    runBuild: false,
  };

  for (const arg of argv.slice(2)) {
    if (arg.startsWith('--scope=')) opts.scope = arg.slice('--scope='.length);
    else if (arg.startsWith('--mode=')) opts.mode = arg.slice('--mode='.length);
    else if (arg.startsWith('--allow=')) opts.allow.push(...arg.slice('--allow='.length).split(',').map((s) => s.trim()).filter(Boolean));
    else if (arg === '--run-verify') opts.runVerify = true;
    else if (arg === '--run-tests') opts.runTests = true;
    else if (arg === '--run-i18n') opts.runI18n = true;
    else if (arg === '--run-build') opts.runBuild = true;
    else if (arg === '--help' || arg === '-h') {
      console.log(`Hydri Autopilot Gate

Options:
  --scope=<name>     minhas-cargas | cargas | dashboard | shared | workflow | docs | full | mixed
                     (omitted → inferred from changed files)
  --mode=<name>      mobile | desktop | full | workflow | mixed
                     (omitted → inferred from changed files)
  --allow=<paths>    comma-separated path substrings to allow scope violations
  --run-verify       run npm run hydri:verify
  --run-tests        run scope-specific unit tests when defined
  --run-i18n         run npm run check:i18n
  --run-build        run npm run build
`);
      process.exit(0);
    }
  }

  return opts;
}

// ── Git helpers ──────────────────────────────────────────────────────────────

function git(args) {
  const r = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' });
  if (r.status !== 0 && r.stderr) return { ok: false, out: (r.stdout || '').trim(), err: r.stderr.trim() };
  return { ok: true, out: (r.stdout || '').trim(), err: '' };
}

function getBranch() {
  return git(['branch', '--show-current']).out || 'unknown';
}

function getChangedFiles() {
  const staged = git(['diff', '--name-only', '--cached']).out;
  const unstaged = git(['diff', '--name-only']).out;
  const untracked = git(['ls-files', '--others', '--exclude-standard']).out;
  const changed = new Set();
  for (const block of [staged, unstaged]) {
    if (!block) continue;
    for (const line of block.split('\n')) {
      if (line) changed.add(line);
    }
  }
  const untrackedList = untracked ? untracked.split('\n').filter(Boolean) : [];
  return { changed: [...changed].sort(), untracked: untrackedList.sort() };
}

function getDiffStat() {
  return git(['diff', '--stat']).out || '(no staged/unstaged diff stat)';
}

function fileExistsInHead(relPath) {
  const r = git(['ls-files', '--error-unmatch', relPath]);
  return r.ok;
}

// ── Result buckets ───────────────────────────────────────────────────────────

const PASS = [];
const WARN = [];
const FAIL = [];
const executed = [];
const recommended = [];

function pass(msg) {
  PASS.push(msg);
}

function warn(msg) {
  WARN.push(msg);
}

function fail(msg) {
  FAIL.push(msg);
}

function isAllowed(path, allowList) {
  return allowList.some((a) => path.includes(a));
}

// ── Path classifiers ─────────────────────────────────────────────────────────

const SCOPE_PATTERNS = {
  'minhas-cargas': [
    /minhas-cargas/,
    /features\/cargo\//,
    /features\/cargo-market\//,
    /owned-cargo/,
    /my-cargoes-list/,
    /owned-cargos\.mock/,
  ],
  cargas: [
    /\(product-shell\)\/cargas/,
    /public-cargas-/,
    /features\/cargo\/components\/public-cargas/,
    /features\/cargo\/components\/cargo-card/,
    /features\/cargo-market/,
  ],
  dashboard: [/features\/dashboard\//, /\(product-shell\)\/dashboard/],
  shared: [/src\/shared\//],
  workflow: [/scripts\//, /docs\//, /\.cursor\//, /tools\//, /package\.json$/],
  docs: [/^docs\//],
};

const PUBLIC_CARGAS_PATTERNS = [
  /public-cargas-/,
  /\(product-shell\)\/cargas\//,
  /features\/cargo\/components\/cargo-card\/CargoCard/,
  /CargoRouteLine\.module\.scss/,
];

const MOBILE_PATTERNS = [
  /mobile-product-shell/,
  /public-cargas-mobile/,
  /bottom-nav/,
  /owned-cargo/,
  /my-cargoes-list/,
  /minhas-cargas/,
  /product-mobile/,
];

const DESKTOP_PATTERNS = [
  /desktop-cargo-map/,
  /operations-board/,
  /features\/waterway-map\/components\/desktop/,
  /desktop-map-floating/,
];

const PRODUCT_UI_PATTERNS = [
  /^src\/app\//,
  /^src\/features\//,
  /^src\/shared\//,
  /^messages\//,
];

const WORKFLOW_SAFE_PATTERNS = [
  /^scripts\//,
  /^docs\//,
  /^\.cursor\//,
  /^tools\//,
  /^package\.json$/,
  /^AGENTS\.md$/,
];

function matchesAny(path, patterns) {
  return patterns.some((p) => p.test(path));
}

function allTouchedFiles(changed, untracked) {
  return [...new Set([...changed, ...untracked])];
}

// ── Scope/mode inference ─────────────────────────────────────────────────────

const INFERENCE_IGNORE_RE = /^(?:output\/|test-results\/|\.playwright-cli\/|__MACOSX\/)/;

function isInferenceIgnored(path) {
  return INFERENCE_IGNORE_RE.test(path);
}

function classifyFileScope(file) {
  if (isInferenceIgnored(file)) return null;

  if (
    /^\.cursor\//.test(file) ||
    /^scripts\/hydri-/.test(file) ||
    /^docs\/agents\//.test(file) ||
    /^docs\/automation\//.test(file) ||
    /^package\.json$/.test(file) ||
    /^AGENTS\.md$/.test(file)
  ) {
    return 'workflow';
  }

  if (
    /owned-cargo/.test(file) ||
    /my-cargoes-list/.test(file) ||
    /minhas-cargas/.test(file) ||
    /owned-cargos\.mock/.test(file) ||
    /docs\/product\/flows\/minhas-cargas-/.test(file)
  ) {
    return 'minhas-cargas';
  }

  if (
    /public-cargas-/.test(file) ||
    /\(product-shell\)\/cargas/.test(file) ||
    /features\/cargo\/components\/cargo-card/.test(file)
  ) {
    return 'cargas';
  }

  if (/features\/dashboard\//.test(file) || /operations-board/.test(file)) {
    return 'dashboard';
  }

  if (/^src\/shared\//.test(file)) {
    return 'shared';
  }

  if (/^docs\//.test(file) && !/docs\/product\/flows\/minhas-cargas-/.test(file)) {
    return 'docs';
  }

  if (/^scripts\//.test(file) || /^tools\//.test(file)) {
    return 'workflow';
  }

  if (/^tests\//.test(file)) {
    if (/owned-cargo|minhas-cargas|my-cargoes/.test(file)) return 'minhas-cargas';
    if (/public-cargas|cargo-card/.test(file)) return 'cargas';
    return 'other';
  }

  if (/^messages\//.test(file) || /^src\/(app|features)\//.test(file)) {
    return 'other';
  }

  return 'other';
}

function classifyFileMode(file) {
  if (isInferenceIgnored(file)) return null;

  if (
    /^\.cursor\//.test(file) ||
    /^scripts\//.test(file) ||
    /^docs\/agents\//.test(file) ||
    /^docs\/automation\//.test(file) ||
    /^package\.json$/.test(file) ||
    /^AGENTS\.md$/.test(file)
  ) {
    return 'workflow';
  }

  if (
    /mobile-product-shell/.test(file) ||
    /bottom-nav/.test(file) ||
    /bottom-sheet/.test(file) ||
    /filter-sheet/.test(file) ||
    /action-sheet/.test(file) ||
    /public-cargas-mobile/.test(file) ||
    /owned-cargo/.test(file) ||
    /my-cargoes-list/.test(file) ||
    /minhas-cargas/.test(file) ||
    /product-mobile/.test(file)
  ) {
    return 'mobile';
  }

  if (
    /desktop-cargo-map/.test(file) ||
    /operations-board/.test(file) ||
    /features\/waterway-map\/components\/desktop/.test(file) ||
    /desktop-map-floating/.test(file)
  ) {
    return 'desktop';
  }

  if (/^docs\//.test(file)) {
    return 'workflow';
  }

  if (/^tests\//.test(file)) {
    if (/owned-cargo|minhas-cargas|my-cargoes|mobile/.test(file)) return 'mobile';
    if (/desktop|operations-board/.test(file)) return 'desktop';
    return 'other';
  }

  return 'other';
}

function tallyInference(files, classifier) {
  const counts = {};
  let ignored = 0;
  let other = 0;

  for (const f of files) {
    const label = classifier(f);
    if (label === null) {
      ignored++;
      continue;
    }
    if (label === 'other') {
      other++;
      continue;
    }
    counts[label] = (counts[label] || 0) + 1;
  }

  return { counts, ignored, other, total: files.length - ignored };
}

function resolveWinner(counts) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return { winner: null, runnerUp: null };
  const runnerUp = entries.length > 1 ? entries[1] : null;
  return { winner: entries[0], runnerUp };
}

function computeConfidence(winner, runnerUp, other, total) {
  if (!winner || total === 0) return 'low';
  const [label, count] = winner;
  const share = count / total;
  const runnerCount = runnerUp ? runnerUp[1] : 0;

  if (share === 1 && other === 0) return 'high';
  if (share >= 0.85 && runnerCount <= 1 && other === 0) return 'high';
  if (share >= 0.65 && runnerCount <= Math.max(1, count * 0.25)) return 'medium';
  return 'low';
}

function inferScope(files) {
  const { counts, other, total } = tallyInference(files, classifyFileScope);
  const { winner, runnerUp } = resolveWinner(counts);

  if (!winner) {
    return { scope: 'full', confidence: 'low', explicit: false, counts, other };
  }

  const [label, count] = winner;
  const confidence = computeConfidence(winner, runnerUp, other, total);

  if (runnerUp && runnerUp[1] > 0 && runnerUp[1] >= count * 0.35) {
    const competing = [label, runnerUp[0]];
    if (competing.includes('minhas-cargas') && competing.includes('cargas')) {
      return { scope: 'mixed', confidence: 'low', explicit: false, counts, other, competing };
    }
    if (competing.includes('workflow') && (competing.includes('minhas-cargas') || competing.includes('cargas'))) {
      return { scope: 'mixed', confidence: 'low', explicit: false, counts, other, competing };
    }
  }

  if (confidence === 'low' && runnerUp && runnerUp[1] > 0) {
    return { scope: 'mixed', confidence: 'low', explicit: false, counts, other, competing: [label, runnerUp[0]] };
  }

  return { scope: label, confidence, explicit: false, counts, other };
}

function inferMode(files, inferredScope) {
  const { counts, other, total } = tallyInference(files, classifyFileMode);
  const { winner, runnerUp } = resolveWinner(counts);

  if (inferredScope === 'workflow' || inferredScope === 'docs') {
    return { mode: 'workflow', confidence: 'high', explicit: false, counts, other };
  }

  if (!winner) {
    return { mode: inferredScope === 'mixed' ? 'mixed' : 'full', confidence: 'low', explicit: false, counts, other };
  }

  const [label, count] = winner;
  let confidence = computeConfidence(winner, runnerUp, other, total);

  if (runnerUp && runnerUp[1] > 0) {
    const competing = [label, runnerUp[0]];
    if (competing.includes('mobile') && competing.includes('desktop')) {
      return { mode: 'mixed', confidence: 'low', explicit: false, counts, other, competing };
    }
    if (confidence === 'low') {
      return { mode: 'mixed', confidence: 'low', explicit: false, counts, other, competing };
    }
  }

  if (label === 'other' && inferredScope !== 'full' && inferredScope !== 'mixed') {
    if (inferredScope === 'minhas-cargas' || inferredScope === 'cargas') {
      return { mode: 'mobile', confidence: 'medium', explicit: false, counts, other };
    }
    return { mode: 'full', confidence: 'low', explicit: false, counts, other };
  }

  if (label === 'workflow' && inferredScope !== 'workflow') {
    return { mode: inferredScope === 'minhas-cargas' || inferredScope === 'cargas' ? 'mobile' : 'full', confidence: 'medium', explicit: false, counts, other };
  }

  return { mode: label === 'other' ? 'full' : label, confidence, explicit: false, counts, other };
}

function applyInference(opts, files) {
  const result = { scopeExplicit: opts.scope !== null, modeExplicit: opts.mode !== null };

  if (!result.scopeExplicit) {
    const inferred = inferScope(files);
    opts.scope = inferred.scope;
    result.scopeInference = inferred;
  }

  if (!result.modeExplicit) {
    const inferred = inferMode(files, opts.scope);
    opts.mode = inferred.mode;
    result.modeInference = inferred;
  }

  return result;
}

function checkInferenceQuality(inferenceMeta) {
  if (inferenceMeta.scopeExplicit && inferenceMeta.modeExplicit) return;

  const scopeInf = inferenceMeta.scopeInference;
  const modeInf = inferenceMeta.modeInference;

  if (scopeInf && !inferenceMeta.scopeExplicit) {
    if (scopeInf.scope === 'mixed') {
      fail('Escopo misto/ambíguo — declare --scope= explicitamente (ex.: --scope=minhas-cargas --mode=mobile)');
    } else if (scopeInf.confidence === 'low') {
      warn(`Inferência de scope com baixa confiança (${scopeInf.scope}) — prefira --scope= explícito`);
    }
  }

  if (modeInf && !inferenceMeta.modeExplicit) {
    if (modeInf.mode === 'mixed') {
      fail('Mode misto/ambíguo — declare --mode= explicitamente (ex.: --mode=mobile ou --mode=workflow)');
    } else if (modeInf.confidence === 'low') {
      warn(`Inferência de mode com baixa confiança (${modeInf.mode}) — prefira --mode= explícito`);
    }
  }

  if (scopeInf && modeInf && !inferenceMeta.scopeExplicit && !inferenceMeta.modeExplicit) {
    const combined =
      scopeInf.confidence === 'high' && modeInf.confidence === 'high'
        ? 'high'
        : scopeInf.confidence === 'low' || modeInf.confidence === 'low'
          ? 'low'
          : 'medium';
    console.log(`Combined inference confidence: ${combined}`);
    if (scopeInf.competing) {
      console.log(`  competing scopes: ${scopeInf.competing.join(' vs ')}`);
    }
    if (modeInf.competing) {
      console.log(`  competing modes: ${modeInf.competing.join(' vs ')}`);
    }
  }
}

// ── Legacy inventory (pre-existing — not errors by themselves) ─────────────────

const LEGACY_PATH_INVENTORY = [
  'src/features/cargo/components/mobile-list-lab-v2/',
  'src/features/cargo/components/cargo-lab-v2/',
  'src/features/cargo/data/cargo-lab-v2.mock.ts',
  'src/features/cargo/types/cargo-lab-v2.types.ts',
  'src/features/cargo/utils/map-marketplace-cargo-to-lab-v2.ts',
  'src/app/[locale]/dev-v2/',
  'src/shared/components/bottom-nav/BottomNav.module.sass',
  'src/shared/components/icon-button/IconButton.module.scss',
  'src/features/cargo/components/cargo-card/CargoCard.tsx',
];

const FORBIDDEN_NEW_NAME_RE = /(?:^|[/\\])(?:DSV2|ds-v2|dev-v2|lab-v2|cargo-lab-v2|legacy|old|new|tmp(?:-|$)|tmp-)/i;

const KEBAB_CASE_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9.-]+)?$/;

const ALLOWED_NON_KEBAB = new Set([
  'CargoCard.tsx',
  'BottomNav.module.sass',
  'BottomNav.tsx',
  'IconButton.module.scss',
  'IconButton.tsx',
  'README.md',
  'AGENTS.md',
]);

// ── Checks ───────────────────────────────────────────────────────────────────

function checkScope(opts, files) {
  if (opts.scope === 'mixed') {
    fail('scope=mixed — declare --scope= explícito antes de continuar');
    return;
  }

  if (opts.scope === 'full') {
    pass('scope=full — escopo amplo, checagens de boundary ainda aplicam');
    return;
  }

  const patterns = SCOPE_PATTERNS[opts.scope];
  if (!patterns) {
    warn(`scope desconhecido "${opts.scope}" — usando checagens genéricas`);
    return;
  }

  const outOfScope = files.filter((f) => {
    const inDeclared = matchesAny(f, patterns);
    const inWorkflow = opts.scope !== 'workflow' && matchesAny(f, SCOPE_PATTERNS.workflow);
    return !inDeclared && !inWorkflow;
  });

  if (outOfScope.length > 0) {
    const filtered = outOfScope.filter((f) => !isAllowed(f, opts.allow));
    if (filtered.length > 0) {
      warn(`Arquivos fora do scope "${opts.scope}": ${filtered.slice(0, 8).join(', ')}${filtered.length > 8 ? ` (+${filtered.length - 8})` : ''}`);
    }
  } else {
    pass(`Todos os arquivos tocados dentro do scope "${opts.scope}"`);
  }

  if (opts.scope === 'minhas-cargas') {
    const publicTouches = files.filter((f) => matchesAny(f, PUBLIC_CARGAS_PATTERNS) && !isAllowed(f, opts.allow));
    if (publicTouches.length > 0) {
      fail(`scope=minhas-cargas tocou rota/componente público /cargas: ${publicTouches.join(', ')}`);
    } else {
      pass('scope=minhas-cargas — /cargas pública não tocada');
    }
  }
}

function checkMode(opts, files) {
  if (opts.mode === 'mixed') {
    fail('mode=mixed — declare --mode= explícito antes de continuar');
    return;
  }

  if (opts.mode === 'full') return;

  if (opts.mode === 'workflow') {
    const productTouches = files.filter(
      (f) => matchesAny(f, PRODUCT_UI_PATTERNS) && !matchesAny(f, WORKFLOW_SAFE_PATTERNS) && !isAllowed(f, opts.allow),
    );
    if (productTouches.length > 0) {
      fail(`mode=workflow bloqueia alteração de UI/produto: ${productTouches.slice(0, 10).join(', ')}`);
    } else {
      pass('mode=workflow — nenhuma alteração de UI/produto detectada');
    }
    return;
  }

  if (opts.mode === 'mobile') {
    const desktopTouches = files.filter((f) => matchesAny(f, DESKTOP_PATTERNS) && !isAllowed(f, opts.allow));
    if (desktopTouches.length > 0) {
      fail(`mode=mobile tocou desktop sem allowlist: ${desktopTouches.join(', ')}`);
    }
    const nonMobile = files.filter(
      (f) =>
        f.startsWith('src/') &&
        !matchesAny(f, MOBILE_PATTERNS) &&
        !matchesAny(f, WORKFLOW_SAFE_PATTERNS) &&
        !matchesAny(f, DESKTOP_PATTERNS) &&
        !f.includes('/domain/') &&
        !f.includes('/mocks/') &&
        !f.startsWith('tests/') &&
        !isAllowed(f, opts.allow),
    );
    if (nonMobile.length > 0) {
      warn(`mode=mobile — arquivos src fora de padrões mobile explícitos: ${nonMobile.slice(0, 6).join(', ')}`);
    } else {
      pass('mode=mobile — diff alinhado a paths mobile');
    }
  }

  if (opts.mode === 'desktop') {
    const mobileTouches = files.filter((f) => matchesAny(f, MOBILE_PATTERNS) && !isAllowed(f, opts.allow));
    if (mobileTouches.length > 0) {
      fail(`mode=desktop tocou mobile sem allowlist: ${mobileTouches.join(', ')}`);
    } else {
      pass('mode=desktop — paths mobile não tocados');
    }
  }
}

function readFileSafe(relPath) {
  try {
    return readFileSync(join(ROOT, relPath), 'utf8');
  } catch {
    return null;
  }
}

function checkStyling(changed) {
  const touchedScss = changed.filter((f) => f.endsWith('.module.scss') || (f.endsWith('.scss') && f.includes('/components/')));
  const touchedGlobals = changed.filter((f) => f === 'src/app/globals.scss');

  if (touchedGlobals.length > 0) {
    fail('Alteração em src/app/globals.scss — proibido salvo tarefa explícita');
  } else {
    pass('globals.scss não alterado');
  }

  for (const f of touchedScss) {
    warn(`Styling: ${f} — preferir .module.sass para component-level tocado/criado`);
  }

  for (const f of changed) {
    const content = readFileSafe(f);
    if (!content) continue;
    if (/!important/.test(content)) {
      const before = git(['show', `HEAD:${f}`]).out;
      if (before && !/!important/.test(before)) {
        fail(`Novo !important em ${f}`);
      } else if (!before) {
        warn(`!important presente em arquivo novo/tocado: ${f}`);
      }
    }
  }
}

function isKebabCaseName(name, fullPath) {
  if (ALLOWED_NON_KEBAB.has(name)) return true;
  if (/\.(test|spec)\.(tsx?|jsx?)$/.test(name)) return true;
  // Agent docs use SCREAMING-KEBAB convention
  if (/^docs\/agents\//.test(fullPath) && /^[A-Z0-9][A-Z0-9_-]*\.md$/.test(name)) return true;
  return KEBAB_CASE_RE.test(name);
}

function checkNaming(changed, untracked) {
  for (const f of untracked) {
    const parts = f.split('/');
    for (const part of parts) {
      if (part.includes('.')) {
        const name = part;
        if (!isKebabCaseName(name, f) && /^[A-Z]/.test(name.replace(/\.[^.]+$/, ''))) {
          fail(`Novo arquivo/pasta fora de kebab-case: ${f} (${name})`);
        }
      }
    }

    const isLegacyKnown = LEGACY_PATH_INVENTORY.some((p) => f.startsWith(p) || f.includes(p));
    if (!isLegacyKnown && FORBIDDEN_NEW_NAME_RE.test(f)) {
      fail(`Novo path com nomenclatura proibida: ${f}`);
    }
  }

  for (const f of changed) {
    if (FORBIDDEN_NEW_NAME_RE.test(f) && !LEGACY_PATH_INVENTORY.some((p) => f.startsWith(p))) {
      warn(`Path tocado com segmento legado/lab proibido para novo uso: ${f}`);
    }
  }

  if (untracked.length === 0) {
    pass('Nenhum arquivo untracked — naming de novos paths OK');
  }
}

function checkArchitecture(changed) {
  const ownedCard = changed.find((f) => f.endsWith('owned-cargo-card.tsx'));
  if (ownedCard) {
    const content = readFileSafe(ownedCard);
    if (content) {
      const importsMarketplaceCard =
        /import\s*\{[^}]*\bCargoCard\b[^}]*\}\s*from\s+['"][^'"]*\/cargo-card['"]/.test(content) ||
        /from\s+['"][^'"]*components\/cargo-card['"]/.test(content);
      const rendersMarketplaceCard = /<CargoCard[\s/>]/.test(content);
      if (importsMarketplaceCard || rendersMarketplaceCard) {
        fail(`${ownedCard} acopla OwnedCargoCard → CargoCard (proibido)`);
      } else {
        pass('owned-cargo-card.tsx sem acoplamento CargoCard');
      }
    }
  }

  for (const f of changed) {
    if (!f.endsWith('.ts') && !f.endsWith('.tsx')) continue;
    const content = readFileSafe(f);
    if (!content) continue;

    const isLabContext = /dev-v2|lab-v2|mobile-list-lab|cargo-lab-v2|public-cargas|\/cargas\//.test(f);
    const isTest = f.startsWith('tests/');

    if (/mobile-list-lab-v2/.test(content) && !isLabContext && !isTest && !f.includes('dev-v2')) {
      fail(`${f} importa mobile-list-lab-v2 fora de contexto lab/dev`);
    }

    if (/mapMarketplaceCargoToLabV2/.test(content) && !isLabContext && !isTest) {
      fail(`${f} usa mapMarketplaceCargoToLabV2 fora de contexto público/lab`);
    }

    if (/minhas-cargas/.test(f) || /owned-cargo/.test(f)) {
      if (/public-cargas-/.test(content) && !/\/\* gate:allow public-cargas \*\//.test(content)) {
        warn(`${f} referencia public-cargas-* — verificar boundary minhas-cargas vs /cargas`);
      }
    }
  }
}

function checkArtifacts(untracked, changed) {
  const artifactDirs = ['output/', 'test-results/', '.playwright-cli/', '__MACOSX/'];
  for (const d of artifactDirs) {
    const hits = untracked.filter((f) => f.startsWith(d) || f === d.replace(/\/$/, ''));
    if (hits.length > 0 || existsSync(join(ROOT, d.replace(/\/$/, '')))) {
      warn(`Artefato/pasta ${d} presente — não commitar (${hits.length || 'dir exists'} arquivo(s))`);
    }
  }

  for (const f of [...changed, ...untracked]) {
    if (/\.bak$/.test(f) || /before-/.test(basename(f)) || /\.backup-/.test(f)) {
      if (f.startsWith('src/') || f.startsWith('docs/') || f.startsWith('scripts/')) {
        warn(`Backup/artefato em tree produtiva: ${f}`);
      }
    }
    if (f === 'next-env.d.ts') {
      warn('next-env.d.ts modificado — normalmente gerado; evite commitar salvo intencional');
    }
  }

  const looseScreenshots = untracked.filter(
    (f) => /\.(png|jpg|jpeg|webp)$/i.test(f) && !f.startsWith('docs/product/') && !f.startsWith('docs/design/'),
  );
  for (const s of looseScreenshots) {
    warn(`Screenshot solto fora de docs aprovados: ${s}`);
  }
}

function checkI18n(opts, changed) {
  const uiTouched = changed.some((f) => /^messages\//.test(f) || (/^src\/features\/.+\.(tsx|ts)$/.test(f) && !f.includes('.test.')));
  recommended.push('npm run check:i18n');

  if (opts.runI18n) {
    executed.push('npm run check:i18n');
    const r = spawnSync('npm', ['run', 'check:i18n'], { cwd: ROOT, stdio: 'inherit' });
    if (r.status === 0) pass('check:i18n executado — OK');
    else fail('check:i18n falhou');
  } else if (uiTouched) {
    warn('Componentes/messages tocados — rode npm run check:i18n antes de 🟢');
  }
}

function buildRecommendations(opts) {
  recommended.push('npm run lint', 'npm run typecheck', 'npm run check:i18n', 'npm run build', 'npm run hydri:gate');

  if (opts.scope === 'minhas-cargas' || opts.scope === 'full') {
    recommended.push(
      'npm run test -- tests/unit/features/cargo/owned-cargo-card.component.test.tsx',
      'npm run test -- tests/unit/features/cargo/my-cargoes-list.component.test.tsx',
      'npm run test -- tests/unit/features/cargo/owned-cargo-detail.component.test.tsx',
      'npm run test:mock-mode',
      'BASE_URL=http://localhost:3000 node scripts/minhas-cargas-list-premium-qa.mjs',
      'BASE_URL=http://localhost:3000 node scripts/minhas-cargas-phase-f-qa.mjs',
    );
  }

  if (opts.mode === 'mobile' || opts.scope === 'minhas-cargas') {
    recommended.push('Preview mobile 360×740, 390×844, 430×932 — /pt-BR/minhas-cargas e /pt-BR/cargas');
  }

  recommended.push('npm run ds:check');
}

function runOptionalCommands(opts) {
  if (opts.runVerify) {
    executed.push('npm run hydri:verify');
    const r = spawnSync('npm', ['run', 'hydri:verify'], { cwd: ROOT, stdio: 'inherit' });
    if (r.status === 0) pass('hydri:verify executado — OK');
    else fail('hydri:verify falhou');
  }

  if (opts.runTests && (opts.scope === 'minhas-cargas' || opts.scope === 'full')) {
    const tests = [
      'tests/unit/features/cargo/owned-cargo-card.component.test.tsx',
      'tests/unit/features/cargo/my-cargoes-list.component.test.tsx',
      'tests/unit/features/cargo/owned-cargo-detail.component.test.tsx',
    ];
    for (const t of tests) {
      executed.push(`npm run test -- ${t}`);
      const r = spawnSync('npm', ['run', 'test', '--', t], { cwd: ROOT, stdio: 'inherit' });
      if (r.status === 0) pass(`${t} — OK`);
      else fail(`${t} falhou`);
    }
  }

  if (opts.runBuild) {
    executed.push('npm run build');
    const r = spawnSync('npm', ['run', 'build'], { cwd: ROOT, stdio: 'inherit' });
    if (r.status === 0) pass('build executado — OK');
    else fail('build falhou');
  }
}

function mobileVisualChecklist(opts) {
  if (opts.mode !== 'mobile' && opts.scope !== 'minhas-cargas' && opts.scope !== 'cargas') return;

  const widths = ['360×740', '390×844', '430×932'];
  const routes = ['/pt-BR/minhas-cargas', '/pt-BR/cargas'];
  warn(`QA visual mobile checklist (${widths.join(', ')}): overflow horizontal, bottom nav, chips, card principal`);
  for (const route of routes) {
    warn(`  → http://localhost:3000${route}`);
  }

  const screenshotHits = [...readdirSyncSafe(join(ROOT, 'output'))].filter((f) => /\.png$/i.test(f));
  if (screenshotHits.length >= 3) {
    pass(`output/ tem ${screenshotHits.length} screenshot(s) — evidência parcial de QA visual`);
  } else {
    warn('QA visual mobile incompleta — capture screenshots 360/390/430 ou marque WARN');
  }
}

function readdirSyncSafe(dir) {
  try {
    return readdirSync(dir);
  } catch {
    return [];
  }
}

function printLegacyInventory() {
  console.log('\n── Inventário legado conhecido (não tratar como erro se pré-existente) ──');
  for (const p of LEGACY_PATH_INVENTORY) {
    console.log(`  legacy/frozen: ${p}`);
  }
  console.log('  artifact/remove-before-commit: output/, test-results/, .playwright-cli/, __MACOSX/, *.bak, *before-*');
  console.log('  lab/dev-only: src/app/[locale]/dev-v2/, mobile-list-lab-v2/, cargo-lab-v2/');
}

function printReport(opts, branch, changed, untracked, diffStat, inferenceMeta) {
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('HYDRI AUTOPILOT GATE');
  console.log('══════════════════════════════════════════════════════════════');
  console.log(`branch:   ${branch}`);
  console.log(`scope:    ${opts.scope}${inferenceMeta?.scopeExplicit ? '' : ' (inferred)'}`);
  console.log(`mode:     ${opts.mode}${inferenceMeta?.modeExplicit ? '' : ' (inferred)'}`);
  if (opts.allow.length) console.log(`allow:    ${opts.allow.join(', ')}`);

  console.log(`\nchanged (${changed.length}):`);
  if (changed.length === 0) console.log('  (none)');
  else changed.slice(0, 30).forEach((f) => console.log(`  ${f}`));
  if (changed.length > 30) console.log(`  … +${changed.length - 30} more`);

  console.log(`\nuntracked (${untracked.length}):`);
  if (untracked.length === 0) console.log('  (none)');
  else untracked.slice(0, 30).forEach((f) => console.log(`  ${f}`));
  if (untracked.length > 30) console.log(`  … +${untracked.length - 30} more`);

  console.log('\n── git diff --stat ──');
  console.log(diffStat);

  console.log('\n── PASS ──');
  if (PASS.length === 0) console.log('  (none)');
  else PASS.forEach((m) => console.log(`  🟢 ${m}`));

  console.log('\n── WARN ──');
  if (WARN.length === 0) console.log('  (none)');
  else WARN.forEach((m) => console.log(`  🟡 ${m}`));

  console.log('\n── FAIL ──');
  if (FAIL.length === 0) console.log('  (none)');
  else FAIL.forEach((m) => console.log(`  🔴 ${m}`));

  console.log('\n── Comandos executados ──');
  if (executed.length === 0) console.log('  (none — use --run-verify, --run-tests, --run-i18n, --run-build)');
  else executed.forEach((c) => console.log(`  ▶ ${c}`));

  console.log('\n── Comandos recomendados ──');
  [...new Set(recommended)].forEach((c) => console.log(`  → ${c}`));

  const status = FAIL.length > 0 ? 'FAIL' : WARN.length > 0 ? 'WARN' : 'PASS';
  const emoji = status === 'PASS' ? '🟢' : status === 'WARN' ? '🟡' : '🔴';
  console.log(`\n${emoji} STATUS FINAL: ${status}`);
  if (status === 'FAIL') {
    console.log('Fechamento máximo do agente: 🔴 Para agora — proibido 🟢, "Pode seguir" ou sucesso.');
    console.log('Corrija violações FAIL antes de pedir validação humana.');
    console.log('Governança em branch suja: "Governança criada, mas branch atual segue bloqueada por FAIL legítimo no gate."');
  } else if (status === 'WARN') {
    console.log('Fechamento máximo do agente: 🟡 Segue com cuidado — proibido 🟢 ou "Pode seguir".');
    console.log('Riscos ou validação incompleta — execute lint/typecheck/i18n/build antes de reconsiderar 🟢.');
  } else {
    console.log('Gate PASS — ainda execute lint/typecheck/i18n/build antes de declarar 🟢 Pode seguir.');
  }

  printLegacyInventory();
  console.log('');
}

// ── Main ─────────────────────────────────────────────────────────────────────

const opts = parseArgs(process.argv);
const branch = getBranch();
const { changed, untracked } = getChangedFiles();
const diffStat = getDiffStat();
const files = allTouchedFiles(changed, untracked);

const inferenceMeta = applyInference(opts, files);

console.log('\n══════════════════════════════════════════════════════════════');
console.log('HYDRI AUTOPILOT GATE — inference');
console.log('══════════════════════════════════════════════════════════════');
if (inferenceMeta.scopeExplicit) {
  console.log(`Scope (explicit): ${opts.scope}`);
} else {
  console.log(`Inferred scope: ${opts.scope}`);
  if (inferenceMeta.scopeInference) {
    console.log(`Scope inference confidence: ${inferenceMeta.scopeInference.confidence}`);
  }
}
if (inferenceMeta.modeExplicit) {
  console.log(`Mode (explicit): ${opts.mode}`);
} else {
  console.log(`Inferred mode: ${opts.mode}`);
  if (inferenceMeta.modeInference) {
    console.log(`Mode inference confidence: ${inferenceMeta.modeInference.confidence}`);
  }
}
checkInferenceQuality(inferenceMeta);

checkScope(opts, files);
checkMode(opts, files);
checkStyling(changed);
checkNaming(changed, untracked);
checkArchitecture(changed);
checkArtifacts(untracked, changed);
checkI18n(opts, changed);
buildRecommendations(opts);
mobileVisualChecklist(opts);
runOptionalCommands(opts);

printReport(opts, branch, changed, untracked, diffStat, inferenceMeta);
process.exit(FAIL.length > 0 ? 1 : 0);
