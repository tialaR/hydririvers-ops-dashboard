/**
 * IconButton Visual Lab Gate — reference (DevTools literal) vs production actual vs depth-proposal.
 * Route: /pt-BR/hy-ui-lab/icon-button
 * Screenshots: output/ui-lab/icon-button/
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test, type Page } from '@playwright/test';

const LAB_ROUTE = '/pt-BR/hy-ui-lab/icon-button';
const OUTPUT_DIR = join(process.cwd(), 'output/ui-lab/icon-button');

const VIEWPORTS = [
  { width: 360, height: 740, tag: '360x740' },
  { width: 390, height: 844, tag: '390x844' },
  { width: 430, height: 932, tag: '430x932' },
] as const;

const INFRASTRUCTURE_STATES = ['idle', 'pressed', 'release', 'focus', 'scroll'] as const;

const TRANSPARENCY_STATES = ['idle', 'pressed', 'release', 'after-scroll', 'focus'] as const;

/** Literal CSS targets — rendered box may differ slightly by viewport/zoom. */
const REFERENCE_SIZE_PX = 76;
const PRODUCTION_SIZE_PX = 52;
const SIZE_TOLERANCE_PX = 8;
const MIN_SCALE_DELTA_PX = 14;
const DEPTH_PROPOSAL_PRESS_SCALE = 0.945;
const DEPTH_PROPOSAL_PRESS_TOLERANCE = 0.02;
const APPROVED_VARIANT = 'glass-compact-production';
const CARGAS_ROUTE = '/pt-BR/cargas';

type ButtonMetrics = {
  width: number;
  height: number;
  top: number;
  left: number;
  transform: string;
  backdropFilter: string;
  boxShadow: string;
  dataPress: string | null;
  glowOpacity: number;
};

type ComparisonRow = {
  viewport: string;
  state: string;
  referenceScreenshot: string;
  actualScreenshot: string;
  depthProposalScreenshot: string;
  referenceSizePx: number;
  actualSizePx: number;
  scaleDeltaPx: number;
  referenceHasBlur: boolean;
  actualHasBlur: boolean;
  referencePressScale: boolean;
  actualPressScale: boolean;
  pass: boolean;
  notes: string[];
};

type TransparencyRow = {
  viewport: string;
  state: string;
  referenceScreenshot: string;
  actualScreenshot: string;
  depthProposalScreenshot: string;
  referenceHasBlur: boolean;
  actualHasBlur: boolean;
  depthProposalHasBlur: boolean;
  scrollOffsetPx: number | null;
  scrollTopBefore: number | null;
  scrollTopAfter: number | null;
  scrollMode: 'page' | 'internal-container';
  scrollOverflow: boolean;
  buttonStayedFixed: boolean | null;
  coloredBackdropVisible: boolean;
  backdropSampleChanged: boolean | null;
  pass: boolean;
  notes: string[];
};

type DepthProposalRow = {
  viewport: string;
  state: string;
  screenshot: string;
  hasBlur: boolean;
  hasInsetShadow: boolean;
  pressScaleOk: boolean;
  glowOnPressed: boolean;
  pass: boolean;
  notes: string[];
};

type ScrollEvidence = {
  viewport: string;
  scrollMode: 'page' | 'internal-container';
  scrollTopBefore: number;
  scrollTopAfter: number;
  buttonStayedFixed: boolean;
};

type CargasConsumerRow = {
  viewport: string;
  variant: string | null;
  sizePx: number;
  hasBlur: boolean;
  hasInsetShadow: boolean;
  screenshot: string;
  pass: boolean;
  notes: string[];
};

type GateReport = {
  gate: 'icon-button-visual-lab';
  route: string;
  generatedAt: string;
  infrastructureMode: {
    overall: 'PASS' | 'FAIL';
    passCount: number;
    failCount: number;
    rows: ComparisonRow[];
  };
  transparencyScrollMode: {
    overall: 'PASS' | 'FAIL';
    passCount: number;
    failCount: number;
    scrollEvidence: ScrollEvidence[];
    rows: TransparencyRow[];
  };
  depthProposalMode: {
    overall: 'PASS' | 'FAIL';
    passCount: number;
    failCount: number;
    rows: DepthProposalRow[];
  };
  productionEquivalence: {
    overall: 'PASS' | 'FAIL' | 'NOT APPLICABLE' | 'NOT YET';
    notes: string[];
    averageScaleDeltaPx: number;
    approvedVariant: string;
  };
  cargasConsumerMode: {
    overall: 'PASS' | 'FAIL';
    passCount: number;
    failCount: number;
    rows: CargasConsumerRow[];
  };
};

async function readGlobalIconButtonMetrics(page: Page, selector: string): Promise<ButtonMetrics & { variant: string | null }> {
  const button = page.locator(selector).first();
  await expect(button).toBeVisible();

  const box = await button.boundingBox();
  expect(box).not.toBeNull();

  const computed = await button.evaluate((element) => {
    const style = window.getComputedStyle(element);
    const glow = element.querySelector('span[aria-hidden]');
    const glowStyle = glow ? window.getComputedStyle(glow) : null;

    return {
      transform: style.transform,
      backdropFilter: style.backdropFilter || style.getPropertyValue('-webkit-backdrop-filter'),
      dataPress: element.getAttribute('data-press'),
      glowOpacity: glowStyle ? Number.parseFloat(glowStyle.opacity || '0') : 0,
      boxShadow: style.boxShadow,
      variant: element.getAttribute('data-icon-button-variant'),
    };
  });

  return {
    width: box!.width,
    height: box!.height,
    top: box!.y,
    left: box!.x,
    ...computed,
  };
}

function evaluateProductionEquivalence(
  infrastructureRows: ComparisonRow[],
  transparencyRows: TransparencyRow[],
): {
  overall: 'PASS' | 'FAIL';
  notes: string[];
  averageScaleDeltaPx: number;
} {
  const notes: string[] = [];
  let pass = true;

  for (const row of infrastructureRows.filter((entry) => entry.state === 'idle')) {
    if (Math.abs(row.actualSizePx - PRODUCTION_SIZE_PX) > SIZE_TOLERANCE_PX) {
      pass = false;
      notes.push(`${row.viewport} production size ${row.actualSizePx.toFixed(1)}px expected ~${PRODUCTION_SIZE_PX}px`);
    }
    if (!row.actualHasBlur) {
      pass = false;
      notes.push(`${row.viewport} production missing backdrop blur`);
    }
    if (row.scaleDeltaPx < MIN_SCALE_DELTA_PX) {
      pass = false;
      notes.push(`${row.viewport} production must remain materially smaller than reference literal`);
    }
  }

  for (const row of infrastructureRows.filter((entry) => entry.state === 'pressed')) {
    if (!row.actualPressScale) {
      pass = false;
      notes.push(`${row.viewport} production pressed missing perceptible scale`);
    }
  }

  if (!transparencyRows.every((row) => row.actualHasBlur)) {
    pass = false;
    notes.push('transparency scroll production column missing blur');
  }

  const averageScaleDeltaPx =
    infrastructureRows.reduce((sum, row) => sum + row.scaleDeltaPx, 0) / infrastructureRows.length;

  if (pass) {
    notes.unshift(
      `Approved variant ${APPROVED_VARIANT} matches lab production column (middle).`,
      'Reference DevTools literal stays 76px in lab only — intentional size delta.',
    );
  }

  return { overall: pass ? 'PASS' : 'FAIL', notes, averageScaleDeltaPx };
}

function evaluateCargasConsumerRow(
  viewport: string,
  metrics: ButtonMetrics & { variant: string | null },
  screenshot: string,
): CargasConsumerRow {
  const notes: string[] = [];
  let pass = true;

  if (metrics.variant !== APPROVED_VARIANT) {
    pass = false;
    notes.push(`variant ${metrics.variant ?? 'missing'} expected ${APPROVED_VARIANT}`);
  }

  if (Math.abs(metrics.width - PRODUCTION_SIZE_PX) > SIZE_TOLERANCE_PX) {
    pass = false;
    notes.push(`size ${metrics.width.toFixed(1)}px expected ~${PRODUCTION_SIZE_PX}px`);
  }

  if (!/blur/i.test(metrics.backdropFilter) || !/10px/.test(metrics.backdropFilter)) {
    pass = false;
    notes.push(`backdrop-filter ${metrics.backdropFilter} expected blur(10px)`);
  }

  if (!buttonHasInsetShadow(metrics.boxShadow)) {
    pass = false;
    notes.push('missing inset shadow on approved glass shell');
  }

  return {
    viewport,
    variant: metrics.variant,
    sizePx: metrics.width,
    hasBlur: /blur/i.test(metrics.backdropFilter),
    hasInsetShadow: buttonHasInsetShadow(metrics.boxShadow),
    screenshot,
    pass,
    notes,
  };
}

async function readButtonMetrics(page: Page, hostTestId: string): Promise<ButtonMetrics> {
  const host = page.getByTestId(hostTestId);
  await expect(host).toBeVisible();

  const button = host.locator('button').first();
  await expect(button).toBeVisible();

  const box = await button.boundingBox();
  expect(box).not.toBeNull();

  const computed = await button.evaluate((element) => {
    const style = window.getComputedStyle(element);
    const glow = element.querySelector('span[aria-hidden]');
    const glowStyle = glow ? window.getComputedStyle(glow) : null;

    return {
      transform: style.transform,
      backdropFilter: style.backdropFilter || style.getPropertyValue('-webkit-backdrop-filter'),
      dataPress: element.getAttribute('data-press'),
      glowOpacity: glowStyle ? Number.parseFloat(glowStyle.opacity || '0') : 0,
      boxShadow: style.boxShadow,
    };
  });

  return {
    width: box!.width,
    height: box!.height,
    top: box!.y,
    left: box!.x,
    ...computed,
  };
}

function hasPressScale(transform: string, targetScale = 0.995) {
  if (!transform || transform === 'none') {
    return false;
  }

  const matrix = transform.match(/matrix\(([^)]+)\)/);
  if (!matrix) {
    return false;
  }

  const scaleX = Number.parseFloat(matrix[1].split(',')[0]);
  return Number.isFinite(scaleX) && scaleX < targetScale;
}

function pressScaleMatches(transform: string, expected: number, tolerance: number) {
  if (!transform || transform === 'none') {
    return false;
  }

  const matrix = transform.match(/matrix\(([^)]+)\)/);
  if (!matrix) {
    return false;
  }

  const scaleX = Number.parseFloat(matrix[1].split(',')[0]);
  return Number.isFinite(scaleX) && Math.abs(scaleX - expected) <= tolerance;
}

function buttonHasInsetShadow(boxShadow: string) {
  return /inset/i.test(boxShadow);
}

async function detectScrollMode(page: Page): Promise<'page' | 'internal-container'> {
  const viewport = page.locator('[data-ui-scroll-viewport]').first();
  const count = await viewport.count();
  if (count > 0) {
    return 'internal-container';
  }

  return 'page';
}

async function readScrollViewportMetrics(page: Page) {
  return page.locator('[data-ui-scroll-viewport]').first().evaluate((surface) => {
    const scrollHeight = surface.scrollHeight;
    const clientHeight = surface.clientHeight;
    const scrollTop = surface.scrollTop;
    const hasOverflow = scrollHeight > clientHeight + 8;

    return { scrollHeight, clientHeight, scrollTop, hasOverflow };
  });
}

function evaluateInfrastructureRow(
  viewport: string,
  state: string,
  reference: ButtonMetrics,
  actual: ButtonMetrics,
  referenceShot: string,
  actualShot: string,
  depthProposalShot: string,
): ComparisonRow {
  const notes: string[] = [];
  let pass = true;

  const refSizeOk = Math.abs(reference.width - REFERENCE_SIZE_PX) <= SIZE_TOLERANCE_PX;
  if (!refSizeOk) {
    pass = false;
    notes.push(`reference size ${reference.width}px expected ~${REFERENCE_SIZE_PX}px`);
  }

  const actualNotReferenceSize = Math.abs(actual.width - REFERENCE_SIZE_PX) > SIZE_TOLERANCE_PX;
  if (!actualNotReferenceSize) {
    pass = false;
    notes.push(`production width ${actual.width}px must not match reference literal ${REFERENCE_SIZE_PX}px`);
  }

  const scaleDeltaPx = reference.width - actual.width;
  if (scaleDeltaPx < MIN_SCALE_DELTA_PX) {
    pass = false;
    notes.push(`scale delta ${scaleDeltaPx.toFixed(1)}px — reference must stay materially larger than production`);
  }

  if (Math.abs(actual.width - PRODUCTION_SIZE_PX) > SIZE_TOLERANCE_PX) {
    notes.push(`production size ${actual.width.toFixed(1)}px vs token ~${PRODUCTION_SIZE_PX}px (informational)`);
  }

  const referenceHasBlur = /blur/i.test(reference.backdropFilter);
  const actualHasBlur = /blur/i.test(actual.backdropFilter);
  if (!referenceHasBlur || !actualHasBlur) {
    pass = false;
    notes.push('backdrop blur missing on reference or actual');
  }

  if (state === 'pressed') {
    const referencePressScale = hasPressScale(reference.transform);
    const actualPressScale = hasPressScale(actual.transform);
    if (!referencePressScale || !actualPressScale) {
      pass = false;
      notes.push('pressed state missing perceptible scale on reference or actual');
    }

    return {
      viewport,
      state,
      referenceScreenshot: referenceShot,
      actualScreenshot: actualShot,
      depthProposalScreenshot: depthProposalShot,
      referenceSizePx: reference.width,
      actualSizePx: actual.width,
      scaleDeltaPx,
      referenceHasBlur,
      actualHasBlur,
      referencePressScale,
      actualPressScale,
      pass,
      notes,
    };
  }

  if (state === 'release') {
    if (reference.dataPress !== 'release' || actual.dataPress !== 'release') {
      pass = false;
      notes.push('release state data-press mismatch');
    }
  }

  return {
    viewport,
    state,
    referenceScreenshot: referenceShot,
    actualScreenshot: actualShot,
    depthProposalScreenshot: depthProposalShot,
    referenceSizePx: reference.width,
    actualSizePx: actual.width,
    scaleDeltaPx,
    referenceHasBlur,
    actualHasBlur,
    referencePressScale: hasPressScale(reference.transform),
    actualPressScale: hasPressScale(actual.transform),
    pass,
    notes,
  };
}

async function transparencyScrollHasColoredBackdrop(page: Page) {
  return page.locator('[data-ui-scroll-content]').evaluate((content) => {
    const candidates = [
      content,
      ...Array.from(
        content.querySelectorAll(
          '[data-ui-panorama-segment], [data-spectrum-band], [data-spectrum], [data-ui-scroll-contrast-marker]',
        ),
      ),
    ];

    return candidates.some((element) => {
      const style = window.getComputedStyle(element);
      const backgroundImage = style.backgroundImage;
      const hasGradient =
        backgroundImage !== 'none' &&
        (backgroundImage.includes('linear-gradient') || backgroundImage.includes('radial-gradient'));

      if (hasGradient) {
        return true;
      }

      const rgb = style.backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!rgb) {
        return false;
      }

      const r = Number.parseInt(rgb[1], 10);
      const g = Number.parseInt(rgb[2], 10);
      const b = Number.parseInt(rgb[3], 10);
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const saturation = max === 0 ? 0 : (max - min) / max;
      const notFlatWhite = !(r > 245 && g > 245 && b > 245);

      return saturation > 0.06 && notFlatWhite;
    });
  });
}

async function captureScrollCenterBackdropSample(page: Page) {
  return page.locator('[data-ui-scroll-viewport]').first().evaluate((surface) => {
    const saturation = (r: number, g: number, b: number) => {
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      return max === 0 ? 0 : (max - min) / max;
    };

    const rect = surface.getBoundingClientRect();
    const sampleX = Math.round(rect.left + rect.width / 2);
    const sampleY = Math.round(rect.top + rect.height / 2);
    const elements = document.elementsFromPoint(sampleX, sampleY);

    const candidates = elements.filter((element) => {
      if (!(element instanceof HTMLElement)) {
        return false;
      }

      if (
        element.closest(
          '[data-ui-reference-scroll-button], [data-ui-actual-scroll-button], [data-ui-depth-proposal-button]',
        )
      ) {
        return false;
      }

      return Boolean(element.closest('[data-ui-scroll-content]'));
    }) as HTMLElement[];

    const ranked = candidates
      .map((element) => {
        const style = window.getComputedStyle(element);
        const backgroundImage = style.backgroundImage;
        const rgb = style.backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        const r = rgb ? Number.parseInt(rgb[1], 10) : 255;
        const g = rgb ? Number.parseInt(rgb[2], 10) : 255;
        const b = rgb ? Number.parseInt(rgb[3], 10) : 255;
        const hasMarker =
          element.hasAttribute('data-ui-panorama-segment') ||
          element.hasAttribute('data-spectrum-band') ||
          element.hasAttribute('data-spectrum') ||
          element.hasAttribute('data-ui-after-scroll-target') ||
          element.hasAttribute('data-ui-glass-probe') ||
          element.hasAttribute('data-ui-scroll-contrast-marker') ||
          element.hasAttribute('data-cargo-facsimile');
        const hasGradient =
          backgroundImage !== 'none' &&
          (backgroundImage.includes('linear-gradient') || backgroundImage.includes('radial-gradient'));

        return {
          element,
          backgroundImage,
          r,
          g,
          b,
          score: (hasMarker ? 4 : 0) + (hasGradient ? 3 : 0) + saturation(r, g, b),
        };
      })
      .sort((left, right) => right.score - left.score);

    const winner = ranked[0];
    if (!winner || winner.score < 0.08) {
      return null;
    }

    return {
      tag: winner.element.tagName.toLowerCase(),
      dataMarker:
        winner.element.getAttribute('data-ui-panorama-segment') ??
        winner.element.getAttribute('data-spectrum-band') ??
        winner.element.getAttribute('data-spectrum') ??
        winner.element.getAttribute('data-ui-glass-probe') ??
        winner.element.getAttribute('data-ui-after-scroll-target'),
      backgroundImage: winner.backgroundImage,
      r: winner.r,
      g: winner.g,
      b: winner.b,
    };
  });
}

function evaluateTransparencyRow(
  viewport: string,
  state: string,
  reference: ButtonMetrics,
  actual: ButtonMetrics,
  depthProposal: ButtonMetrics,
  referenceShot: string,
  actualShot: string,
  depthProposalShot: string,
  scrollOffsetPx: number | null,
  scrollTopBefore: number | null,
  scrollTopAfter: number | null,
  scrollMode: 'page' | 'internal-container',
  scrollOverflow: boolean,
  buttonStayedFixed: boolean | null,
  coloredBackdropVisible: boolean,
  backdropSampleChanged: boolean | null,
): TransparencyRow {
  const notes: string[] = [];
  let pass = true;

  const referenceHasBlur = /blur/i.test(reference.backdropFilter);
  const actualHasBlur = /blur/i.test(actual.backdropFilter);
  const depthProposalHasBlur = /blur/i.test(depthProposal.backdropFilter);

  if (!referenceHasBlur || !actualHasBlur || !depthProposalHasBlur) {
    pass = false;
    notes.push('backdrop blur missing on reference, actual, or depth-proposal in transparency scenario');
  }

  if (scrollMode !== 'internal-container') {
    pass = false;
    notes.push(`scroll mode is ${scrollMode} — expected internal-container with data-ui-scroll-viewport`);
  }

  if (!scrollOverflow) {
    pass = false;
    notes.push('transparency scroll viewport has no real overflow — scroll not possible');
  }

  if (!coloredBackdropVisible) {
    pass = false;
    notes.push('colored scroll backdrop not visible behind transparency buttons — white/flat scenario');
  }

  if (state === 'pressed') {
    if (!hasPressScale(reference.transform) || !hasPressScale(actual.transform) || !hasPressScale(depthProposal.transform)) {
      pass = false;
      notes.push('pressed transparency scenario missing perceptible scale on one or more buttons');
    }
  }

  if (state === 'release' && (reference.dataPress !== 'release' || actual.dataPress !== 'release')) {
    pass = false;
    notes.push('release state data-press mismatch in transparency scenario');
  }

  if (state === 'after-scroll') {
    if (scrollOffsetPx == null || scrollOffsetPx < 120) {
      pass = false;
      notes.push(`scroll offset ${scrollOffsetPx ?? 0}px — background must move behind fixed buttons`);
    }

    if (scrollTopBefore != null && scrollTopAfter != null && scrollTopAfter <= scrollTopBefore + 80) {
      pass = false;
      notes.push(`scrollTop before ${scrollTopBefore} after ${scrollTopAfter} — insufficient scroll movement`);
    }

    if (buttonStayedFixed === false) {
      pass = false;
      notes.push('buttons moved with scroll — expected fixed/sticky rail');
    }

    if (backdropSampleChanged === false) {
      pass = false;
      notes.push('backdrop sample behind buttons unchanged after scroll — static background suspected');
    }
  }

  return {
    viewport,
    state,
    referenceScreenshot: referenceShot,
    actualScreenshot: actualShot,
    depthProposalScreenshot: depthProposalShot,
    referenceHasBlur,
    actualHasBlur,
    depthProposalHasBlur,
    scrollOffsetPx,
    scrollTopBefore,
    scrollTopAfter,
    scrollMode,
    scrollOverflow,
    buttonStayedFixed,
    coloredBackdropVisible,
    backdropSampleChanged,
    pass,
    notes,
  };
}

function evaluateDepthProposalRow(
  viewport: string,
  state: string,
  metrics: ButtonMetrics,
  screenshot: string,
): DepthProposalRow {
  const notes: string[] = [];
  let pass = true;

  const hasBlur = /blur/i.test(metrics.backdropFilter);
  const hasInsetShadow = buttonHasInsetShadow(metrics.boxShadow);

  if (!hasBlur) {
    pass = false;
    notes.push('depth-proposal missing backdrop blur');
  }

  if (!hasInsetShadow) {
    pass = false;
    notes.push('depth-proposal missing inset shadow (internal depth)');
  }

  let pressScaleOk = true;
  let glowOnPressed = true;

  if (state === 'pressed') {
    pressScaleOk = pressScaleMatches(metrics.transform, DEPTH_PROPOSAL_PRESS_SCALE, DEPTH_PROPOSAL_PRESS_TOLERANCE);
    glowOnPressed = metrics.glowOpacity >= 0.4;

    if (!pressScaleOk) {
      pass = false;
      notes.push(`pressed scale expected ~${DEPTH_PROPOSAL_PRESS_SCALE}, got transform ${metrics.transform}`);
    }

    if (!glowOnPressed) {
      pass = false;
      notes.push('pressed state missing white/neutral glow on depth-proposal');
    }
  }

  return {
    viewport,
    state,
    screenshot,
    hasBlur,
    hasInsetShadow,
    pressScaleOk,
    glowOnPressed,
    pass,
    notes,
  };
}

async function alignTransparencyScrollTarget(page: Page, selector: string) {
  return page.locator('[data-ui-scroll-viewport]').first().evaluate((surface, targetSelector) => {
    const target = surface.querySelector<HTMLElement>(targetSelector);
    if (!target) {
      return 0;
    }

    const surfaceRect = surface.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    surface.scrollTop = Math.max(
      0,
      Math.round(surface.scrollTop + targetRect.top - surfaceRect.top - surfaceRect.height / 2 + targetRect.height / 2),
    );
    return surface.scrollTop;
  }, selector);
}

async function setTransparencyButtonPress(
  page: Page,
  testId: 'transparency-scroll-reference' | 'transparency-scroll-actual' | 'transparency-scroll-depth-proposal',
  press: 'idle' | 'pressed' | 'release',
) {
  await page.getByTestId(testId).locator('button').evaluate((el, value) => {
    el.setAttribute('data-press', value);
  }, press);
}

async function prepareTransparencyState(page: Page, state: (typeof TRANSPARENCY_STATES)[number]) {
  await page.getByTestId('transparency-scroll-stage').scrollIntoViewIfNeeded();

  const buttonHosts = [
    'transparency-scroll-reference',
    'transparency-scroll-actual',
    'transparency-scroll-depth-proposal',
  ] as const;

  if (state === 'after-scroll') {
    const scrollOffsetPx = await alignTransparencyScrollTarget(page, '[data-ui-after-scroll-target="true"]');
    for (const host of buttonHosts) {
      await setTransparencyButtonPress(page, host, 'idle');
    }
    return scrollOffsetPx;
  }

  await alignTransparencyScrollTarget(page, '[data-ui-glass-probe="true"]');

  if (state === 'idle') {
    for (const host of buttonHosts) {
      await setTransparencyButtonPress(page, host, 'idle');
      await page.getByTestId(host).locator('button').evaluate((el) => {
        el.removeAttribute('data-lab-focus');
      });
    }
  }

  if (state === 'pressed') {
    for (const host of buttonHosts) {
      await setTransparencyButtonPress(page, host, 'pressed');
    }
  }

  if (state === 'release') {
    for (const host of buttonHosts) {
      await setTransparencyButtonPress(page, host, 'release');
    }
  }

  if (state === 'focus') {
    for (const host of buttonHosts) {
      await page.getByTestId(host).locator('button').evaluate((el) => {
        el.setAttribute('data-lab-focus', 'true');
      });
    }
    await page.getByTestId('transparency-scroll-depth-proposal').locator('button').focus();
    await page.getByTestId('transparency-scroll-actual').locator('button').focus();
    await page.getByTestId('transparency-scroll-reference').locator('button').focus();
  }

  return null;
}

function writeReport(payload: GateReport) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(join(OUTPUT_DIR, 'report.json'), JSON.stringify(payload, null, 2));

  const infraRows = payload.infrastructureMode.rows;
  const transparencyRows = payload.transparencyScrollMode.rows;
  const depthRows = payload.depthProposalMode.rows;
  const scrollEvidence = payload.transparencyScrollMode.scrollEvidence;

  const markdown = [
    '# IconButton Visual Lab Gate',
    '',
    '## 1. Infrastructure mode',
    '',
    `**Overall:** ${payload.infrastructureMode.overall}`,
    `**Pass:** ${payload.infrastructureMode.passCount} · **Fail:** ${payload.infrastructureMode.failCount}`,
    '',
    '| Viewport | State | Ref px | Actual px | Δ scale | Pass | Evidence |',
    '|----------|-------|--------|-----------|---------|------|----------|',
    ...infraRows.map(
      (row) =>
        `| ${row.viewport} | ${row.state} | ${row.referenceSizePx.toFixed(1)} | ${row.actualSizePx.toFixed(1)} | ${row.scaleDeltaPx.toFixed(1)} | ${row.pass ? 'PASS' : 'FAIL'} | ${row.referenceScreenshot}, ${row.actualScreenshot}, ${row.depthProposalScreenshot} |`,
    ),
    '',
    '## 2. Transparency scroll mode',
    '',
    `**Overall:** ${payload.transparencyScrollMode.overall}`,
    `**Pass:** ${payload.transparencyScrollMode.passCount} · **Fail:** ${payload.transparencyScrollMode.failCount}`,
    '',
    '### Scroll evidence',
    '',
    '| Viewport | Scroll mode | scrollTop before | scrollTop after | Button fixed |',
    '|----------|-------------|------------------|-----------------|--------------|',
    ...scrollEvidence.map(
      (row) =>
        `| ${row.viewport} | ${row.scrollMode} | ${row.scrollTopBefore} | ${row.scrollTopAfter} | ${row.buttonStayedFixed ? 'yes' : 'no'} |`,
    ),
    '',
    '| Viewport | State | Blur ref | Blur actual | Blur depth | Color bg | Overflow | Scroll px | scrollTop before | scrollTop after | Button fixed | Backdrop Δ | Pass | Evidence |',
    '|----------|-------|----------|-------------|------------|----------|----------|-----------|------------------|-----------------|--------------|------------|------|----------|',
    ...transparencyRows.map(
      (row) =>
        `| ${row.viewport} | ${row.state} | ${row.referenceHasBlur ? 'yes' : 'no'} | ${row.actualHasBlur ? 'yes' : 'no'} | ${row.depthProposalHasBlur ? 'yes' : 'no'} | ${row.coloredBackdropVisible ? 'yes' : 'no'} | ${row.scrollOverflow ? 'yes' : 'no'} | ${row.scrollOffsetPx ?? '—'} | ${row.scrollTopBefore ?? '—'} | ${row.scrollTopAfter ?? '—'} | ${row.buttonStayedFixed == null ? '—' : row.buttonStayedFixed ? 'yes' : 'no'} | ${row.backdropSampleChanged == null ? '—' : row.backdropSampleChanged ? 'yes' : 'no'} | ${row.pass ? 'PASS' : 'FAIL'} | ${row.referenceScreenshot}, ${row.actualScreenshot}, ${row.depthProposalScreenshot} |`,
    ),
    '',
    '## 3. Depth proposal mode',
    '',
    `**Overall:** ${payload.depthProposalMode.overall}`,
    `**Pass:** ${payload.depthProposalMode.passCount} · **Fail:** ${payload.depthProposalMode.failCount}`,
    '',
    '| Viewport | State | Blur | Inset shadow | Press scale | Glow pressed | Pass | Evidence |',
    '|----------|-------|------|--------------|-------------|--------------|------|----------|',
    ...depthRows.map(
      (row) =>
        `| ${row.viewport} | ${row.state} | ${row.hasBlur ? 'yes' : 'no'} | ${row.hasInsetShadow ? 'yes' : 'no'} | ${row.pressScaleOk ? 'yes' : '—'} | ${row.glowOnPressed ? 'yes' : '—'} | ${row.pass ? 'PASS' : 'FAIL'} | ${row.screenshot} |`,
    ),
    '',
    '## 4. Production equivalence',
    '',
    `**Overall:** ${payload.productionEquivalence.overall}`,
    `**Average scale delta:** ${payload.productionEquivalence.averageScaleDeltaPx.toFixed(1)}px (reference − production)`,
    '',
    ...payload.productionEquivalence.notes.map((note) => `- ${note}`),
    '',
    `**Approved variant:** ${payload.productionEquivalence.approvedVariant}`,
    '',
    '## 5. Cargas consumer mode',
    '',
    `**Overall:** ${payload.cargasConsumerMode.overall}`,
    `**Pass:** ${payload.cargasConsumerMode.passCount} · **Fail:** ${payload.cargasConsumerMode.failCount}`,
    '',
    '| Viewport | Variant | Size px | Blur | Inset | Pass | Evidence |',
    '|----------|---------|---------|------|-------|------|----------|',
    ...payload.cargasConsumerMode.rows.map(
      (row) =>
        `| ${row.viewport} | ${row.variant ?? '—'} | ${row.sizePx.toFixed(1)} | ${row.hasBlur ? 'yes' : 'no'} | ${row.hasInsetShadow ? 'yes' : 'no'} | ${row.pass ? 'PASS' : 'FAIL'} | ${row.screenshot} |`,
    ),
  ].join('\n');

  writeFileSync(join(OUTPUT_DIR, 'report.md'), markdown);
}

test.describe('IconButton Visual Lab Gate', () => {
  test('captures reference vs actual vs depth-proposal across mobile viewports', async ({ page }) => {
    test.setTimeout(120_000);
    const infrastructureRows: ComparisonRow[] = [];
    const transparencyRows: TransparencyRow[] = [];
    const depthProposalRows: DepthProposalRow[] = [];
    const scrollEvidence: ScrollEvidence[] = [];

    for (const viewport of VIEWPORTS) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(LAB_ROUTE, { waitUntil: 'networkidle' });
      await expect(page.locator('[data-icon-button-visual-lab="true"]')).toBeVisible();

      for (const state of INFRASTRUCTURE_STATES) {
        const referenceHost = `reference-${state}`;
        const actualHost = `actual-${state}`;
        const depthHost = `depth-proposal-${state}`;

        if (state === 'focus') {
          await page.getByTestId(depthHost).locator('button').focus();
          await page.getByTestId(actualHost).locator('button').focus();
          await page.getByTestId(referenceHost).locator('button').focus();
        }

        const referenceShot = join(OUTPUT_DIR, `${viewport.tag}-${state}-reference.png`);
        const actualShot = join(OUTPUT_DIR, `${viewport.tag}-${state}-actual.png`);
        const depthShot = join(OUTPUT_DIR, `${viewport.tag}-${state}-depth-proposal.png`);

        mkdirSync(OUTPUT_DIR, { recursive: true });

        await page.getByTestId(referenceHost).screenshot({ path: referenceShot });
        await page.getByTestId(actualHost).screenshot({ path: actualShot });
        await page.getByTestId(depthHost).screenshot({ path: depthShot });

        const referenceMetrics = await readButtonMetrics(page, referenceHost);
        const actualMetrics = await readButtonMetrics(page, actualHost);
        const depthMetrics = await readButtonMetrics(page, depthHost);

        const row = evaluateInfrastructureRow(
          viewport.tag,
          state,
          referenceMetrics,
          actualMetrics,
          referenceShot,
          actualShot,
          depthShot,
        );
        infrastructureRows.push(row);
        expect(row.pass, row.notes.join('; ')).toBe(true);

        const depthRow = evaluateDepthProposalRow(viewport.tag, state, depthMetrics, depthShot);
        depthProposalRows.push(depthRow);
        expect(depthRow.pass, depthRow.notes.join('; ')).toBe(true);
      }

      await prepareTransparencyState(page, 'idle');
      const scrollMode = await detectScrollMode(page);
      const beforeScrollShot = join(OUTPUT_DIR, `${viewport.tag}-transparency-scroll-before-scroll.png`);
      await page.getByTestId('transparency-scroll-stage').screenshot({ path: beforeScrollShot });
      const idleBackdropSample = await captureScrollCenterBackdropSample(page);
      const scrollMetrics = await readScrollViewportMetrics(page);
      const scrollTopBefore = scrollMetrics.scrollTop;

      const buttonBeforeScroll = await readButtonMetrics(page, 'transparency-scroll-depth-proposal');

      for (const state of TRANSPARENCY_STATES) {
        const scrollOffsetPx = await prepareTransparencyState(page, state);
        const scrollMetricsAfter = await readScrollViewportMetrics(page);
        const scrollTopAfter = scrollMetricsAfter.scrollTop;

        const referenceShot = join(
          OUTPUT_DIR,
          state === 'after-scroll'
            ? `${viewport.tag}-transparency-scroll-reference-after-scroll.png`
            : `${viewport.tag}-transparency-scroll-reference-${state}.png`,
        );
        const actualShot = join(
          OUTPUT_DIR,
          state === 'after-scroll'
            ? `${viewport.tag}-transparency-scroll-actual-after-scroll.png`
            : `${viewport.tag}-transparency-scroll-actual-${state}.png`,
        );
        const depthProposalShot = join(
          OUTPUT_DIR,
          state === 'after-scroll'
            ? `${viewport.tag}-transparency-scroll-depth-proposal-after-scroll.png`
            : `${viewport.tag}-transparency-scroll-depth-proposal-${state}.png`,
        );

        await page.getByTestId('transparency-scroll-reference').screenshot({ path: referenceShot });
        await page.getByTestId('transparency-scroll-actual').screenshot({ path: actualShot });
        await page.getByTestId('transparency-scroll-depth-proposal').screenshot({ path: depthProposalShot });

        const referenceMetrics = await readButtonMetrics(page, 'transparency-scroll-reference');
        const actualMetrics = await readButtonMetrics(page, 'transparency-scroll-actual');
        const depthProposalMetrics = await readButtonMetrics(page, 'transparency-scroll-depth-proposal');
        const coloredBackdropVisible = await transparencyScrollHasColoredBackdrop(page);

        let backdropSampleChanged: boolean | null = null;
        let buttonStayedFixed: boolean | null = null;

        if (state === 'after-scroll') {
          const afterScrollShot = join(OUTPUT_DIR, `${viewport.tag}-transparency-scroll-after-scroll.png`);
          await page.getByTestId('transparency-scroll-stage').screenshot({ path: afterScrollShot });

          const afterBackdropSample = await captureScrollCenterBackdropSample(page);
          if (idleBackdropSample && afterBackdropSample) {
            const colorDelta =
              Math.abs(idleBackdropSample.r - afterBackdropSample.r) +
              Math.abs(idleBackdropSample.g - afterBackdropSample.g) +
              Math.abs(idleBackdropSample.b - afterBackdropSample.b);
            const imageChanged = idleBackdropSample.backgroundImage !== afterBackdropSample.backgroundImage;
            const markerChanged = idleBackdropSample.dataMarker !== afterBackdropSample.dataMarker;
            backdropSampleChanged = colorDelta >= 24 || imageChanged || markerChanged;
          } else {
            backdropSampleChanged = false;
          }

          const buttonAfterScroll = await readButtonMetrics(page, 'transparency-scroll-depth-proposal');
          const topDelta = Math.abs(buttonAfterScroll.top - buttonBeforeScroll.top);
          const leftDelta = Math.abs(buttonAfterScroll.left - buttonBeforeScroll.left);
          buttonStayedFixed = topDelta < 3 && leftDelta < 3;

          scrollEvidence.push({
            viewport: viewport.tag,
            scrollMode,
            scrollTopBefore,
            scrollTopAfter,
            buttonStayedFixed,
          });
        }

        const row = evaluateTransparencyRow(
          viewport.tag,
          state,
          referenceMetrics,
          actualMetrics,
          depthProposalMetrics,
          referenceShot,
          actualShot,
          depthProposalShot,
          scrollOffsetPx,
          scrollTopBefore,
          state === 'after-scroll' ? scrollTopAfter : null,
          scrollMode,
          scrollMetrics.hasOverflow,
          buttonStayedFixed,
          coloredBackdropVisible,
          backdropSampleChanged,
        );
        transparencyRows.push(row);
        expect(row.pass, row.notes.join('; ')).toBe(true);

        const depthTransparencyRow = evaluateDepthProposalRow(
          viewport.tag,
          state === 'after-scroll' ? 'after-scroll' : state,
          depthProposalMetrics,
          depthProposalShot,
        );
        depthProposalRows.push(depthTransparencyRow);
        expect(depthTransparencyRow.pass, depthTransparencyRow.notes.join('; ')).toBe(true);
      }

      await prepareTransparencyState(page, 'after-scroll');
      const transparencyWideShot = join(OUTPUT_DIR, `${viewport.tag}-transparency-scroll-wide.png`);
      await page.getByTestId('transparency-scroll-stage').screenshot({ path: transparencyWideShot });
    }

    const infraFailCount = infrastructureRows.filter((row) => !row.pass).length;
    const transparencyFailCount = transparencyRows.filter((row) => !row.pass).length;
    const depthFailCount = depthProposalRows.filter((row) => !row.pass).length;

    const productionEquivalence = evaluateProductionEquivalence(infrastructureRows, transparencyRows);
    const cargasRows: CargasConsumerRow[] = [];

    for (const viewport of VIEWPORTS) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(CARGAS_ROUTE, { waitUntil: 'networkidle' });
      const filterSelector = '[data-mobile-cargas-filter-button="true"]';
      await expect(page.locator(filterSelector)).toBeVisible();
      const cargasShot = join(OUTPUT_DIR, `${viewport.tag}-cargas-filter-idle.png`);
      await page.locator(filterSelector).screenshot({ path: cargasShot });
      const cargasMetrics = await readGlobalIconButtonMetrics(page, filterSelector);
      const cargasRow = evaluateCargasConsumerRow(viewport.tag, cargasMetrics, cargasShot);
      cargasRows.push(cargasRow);
      expect(cargasRow.pass, cargasRow.notes.join('; ')).toBe(true);
    }

    const cargasFailCount = cargasRows.filter((row) => !row.pass).length;

    const report: GateReport = {
      gate: 'icon-button-visual-lab',
      route: LAB_ROUTE,
      generatedAt: new Date().toISOString(),
      infrastructureMode: {
        overall: infraFailCount === 0 ? 'PASS' : 'FAIL',
        passCount: infrastructureRows.length - infraFailCount,
        failCount: infraFailCount,
        rows: infrastructureRows,
      },
      transparencyScrollMode: {
        overall: transparencyFailCount === 0 ? 'PASS' : 'FAIL',
        passCount: transparencyRows.length - transparencyFailCount,
        failCount: transparencyFailCount,
        scrollEvidence,
        rows: transparencyRows,
      },
      depthProposalMode: {
        overall: depthFailCount === 0 ? 'PASS' : 'FAIL',
        passCount: depthProposalRows.length - depthFailCount,
        failCount: depthFailCount,
        rows: depthProposalRows,
      },
      productionEquivalence: {
        ...productionEquivalence,
        approvedVariant: APPROVED_VARIANT,
      },
      cargasConsumerMode: {
        overall: cargasFailCount === 0 ? 'PASS' : 'FAIL',
        passCount: cargasRows.length - cargasFailCount,
        failCount: cargasFailCount,
        rows: cargasRows,
      },
    };

    writeReport(report);

    expect(infraFailCount, `Infrastructure mode FAIL — see ${join(OUTPUT_DIR, 'report.md')}`).toBe(0);
    expect(transparencyFailCount, `Transparency scroll mode FAIL — see ${join(OUTPUT_DIR, 'report.md')}`).toBe(0);
    expect(depthFailCount, `Depth proposal mode FAIL — see ${join(OUTPUT_DIR, 'report.md')}`).toBe(0);
    expect(productionEquivalence.overall, `Production equivalence FAIL — see ${join(OUTPUT_DIR, 'report.md')}`).toBe(
      'PASS',
    );
    expect(cargasFailCount, `Cargas consumer mode FAIL — see ${join(OUTPUT_DIR, 'report.md')}`).toBe(0);
  });
});
