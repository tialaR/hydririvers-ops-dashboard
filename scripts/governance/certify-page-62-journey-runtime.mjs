#!/usr/bin/env node
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const baseUrl = process.env.PAGE62_STORYBOOK_URL || 'http://127.0.0.1:6106';
const evidenceDir = path.resolve(root, 'reports/sharklock-evidence/page-62/journey-runtime');

const states = [
  {
    name: 'Overview',
    storyKey: 'Overview',
    selector: '[data-testid="page62-overview"]',
    minCharts: 0,
    map: true,
  },
  {
    name: 'D04-D05 Cockpit',
    storyKey: 'D04D05Cockpit',
    selector: '[data-testid="page62-cargo-cockpit"]',
    minCharts: 2,
  },
  {
    name: 'D06-D07 Documents Risk',
    storyKey: 'D06D07DocumentsRisk',
    selector: '[data-testid="page62-d06-documents"]',
    secondarySelector: '[data-testid="page62-d07-occurrence"]',
    minCharts: 1,
  },
  {
    name: 'D08-D09 Negotiation',
    storyKey: 'D08D09Negotiation',
    selector: '[data-testid="page62-d08-d09-negotiation"]',
    minCharts: 1,
  },
  {
    name: 'D10 Action Review',
    storyKey: 'D10ActionReview',
    selector: '[data-testid="page62-d10-review"]',
    minCharts: 1,
  },
  {
    name: 'D11 Action Feedback',
    storyKey: 'D11ActionFeedback',
    selector: '[data-testid="page62-d11-feedback"]',
    minCharts: 2,
  },
  {
    name: 'D12 Correction Resubmit',
    storyKey: 'D12CorrectionResubmit',
    selector: '[data-testid="page62-d12-correction"]',
    minCharts: 1,
  },
  {
    name: 'D13 Monitoring',
    storyKey: 'D13Monitoring',
    selector: '[data-testid="page62-d13-monitoring"]',
    minCharts: 1,
  },
];

await mkdir(evidenceDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];

const normalizeStoryName = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
const indexResponse = await fetch(`${baseUrl}/index.json`);
if (!indexResponse.ok) throw new Error(`Storybook index unavailable: ${indexResponse.status}`);
const storyIndex = await indexResponse.json();
const storyEntries = Object.values(storyIndex.entries || {}).filter(
  (entry) => entry.type === 'story' && entry.title === 'Page 62/Shipper Journey',
);

function resolveStoryId(storyKey) {
  const normalized = normalizeStoryName(storyKey);
  const entry = storyEntries.find((candidate) => normalizeStoryName(candidate.name) === normalized);
  if (!entry) {
    throw new Error(`Storybook journey story not found: ${storyKey}. Available: ${storyEntries.map((item) => item.name).join(', ')}`);
  }
  return entry.id;
}

async function certifyInteractiveFlow({ name, correctionBranch = false }) {
  const storyId = resolveStoryId('FullFlow');
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1024 },
    deviceScaleFactor: 1,
  });

  const failures = [];
  const visited = [];
  const consoleErrors = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  const visit = async (selector, label) => {
    await page.locator(selector).first().waitFor({ state: 'visible', timeout: 20000 });
    visited.push(label);
  };

  try {
    await page.goto(`${baseUrl}/iframe.html?id=${storyId}&viewMode=story`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await page.evaluate(() => document.fonts.ready);

    await visit('[data-testid="page62-overview"]', 'D01-D03');
    await page.getByRole('button', { name: 'Abrir cockpit' }).click();

    await visit('[data-testid="page62-cargo-cockpit"]', 'D04');
    await page.getByRole('button', { name: 'Linha operacional' }).click();
    await visit('[data-testid="page62-d05-timeline"]', 'D05');

    await page.getByRole('button', { name: 'Documentos' }).click();
    await visit('[data-testid="page62-d06-documents"]', 'D06');
    await visit('[data-testid="page62-d07-occurrence"]', 'D07');

    await page.getByRole('button', { name: 'Comparar propostas' }).click();
    await visit('[data-testid="page62-d08-d09-negotiation"]', 'D08');
    await visit('[data-testid="page62-d09-context-chat"]', 'D09');

    await page.getByRole('button', { name: 'Revisar aceite' }).click();
    await visit('[data-testid="page62-d10-review"]', 'D10');

    await page.getByRole('button', { name: 'Confirmar proposta' }).click();
    await visit('[data-testid="page62-d11-feedback"]', 'D11');

    if (correctionBranch) {
      await page.getByRole('button', { name: 'Tratar rejeição documental' }).click();
      await visit('[data-testid="page62-d12-correction"]', 'D12');
      await page.getByRole('button', { name: 'Salvar correção e enviar para revalidação' }).click();
    } else {
      await page.getByRole('button', { name: 'Acompanhar carga' }).click();
    }

    await visit('[data-testid="page62-d13-monitoring"]', 'D13');

    const relevantConsoleErrors = consoleErrors.filter(
      (entry) => !/Failed to load resource|ERR_NAME_NOT_RESOLVED|net::ERR_/i.test(entry),
    );
    if (relevantConsoleErrors.length) failures.push(`runtime console errors: ${relevantConsoleErrors.length}`);
  } catch (error) {
    failures.push(error instanceof Error ? error.message : String(error));
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const screenshotPath = path.resolve(evidenceDir, `${slug}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true, animations: 'disabled', caret: 'hide' });

  results.push({
    name,
    storyKey: 'FullFlow',
    storyId,
    pass: failures.length === 0,
    failures,
    metrics: {
      canvasCount: 0,
      overflowX: 0,
      visitedCount: visited.length,
      visited,
      correctionBranch,
    },
    screenshot: path.relative(root, screenshotPath),
  });

  await page.close();
}

try {
  for (const state of states) {
    const storyId = resolveStoryId(state.storyKey);
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1024 },
      deviceScaleFactor: 1,
    });

    const consoleErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => consoleErrors.push(error.message));

    await page.goto(`${baseUrl}/iframe.html?id=${storyId}&viewMode=story`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await page.evaluate(() => document.fonts.ready);

    const target = page.locator(state.selector).first();
    await target.waitFor({ state: 'visible', timeout: 20000 });

    if (state.secondarySelector) {
      await page.locator(state.secondarySelector).first().waitFor({ state: 'visible', timeout: 20000 });
    }

    const metrics = await page.evaluate(({ selector, secondarySelector }) => {
      const node = document.querySelector(selector);
      const secondary = secondarySelector ? document.querySelector(secondarySelector) : null;
      if (!node) return null;
      const rect = node.getBoundingClientRect();
      const root = document.documentElement;
      const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4'));
      const headingSizes = headings
        .map((heading) => Number.parseFloat(getComputedStyle(heading).fontSize))
        .filter(Number.isFinite);
      const chartSurfaces = Array.from(document.querySelectorAll('[data-echart-renderer]'))
        .map((chart) => {
          const box = chart.getBoundingClientRect();
          return {
            width: box.width,
            height: box.height,
            renderer: chart.getAttribute('data-echart-renderer'),
          };
        })
        .filter((box) => box.width > 16 && box.height > 16);

      const timeline = document.querySelector('[data-testid="page62-d05-timeline"]');
      const timelineInsight = document.querySelector('[data-testid="page62-timeline-insight"]');
      const timelineEvents = timeline ? Array.from(timeline.querySelectorAll('ol > li')) : [];
      const cockpitKpis = document.querySelector('[data-testid="cockpit-kpi-grid"]');
      const currentTimelineEvent = timelineEvents.find((item) => item.getAttribute('data-phase') === 'current');
      const futureTimelineEvents = timelineEvents.filter((item) => item.getAttribute('data-phase') === 'future');
      const statusTones = timelineEvents.map((item) => item.getAttribute('data-tone')).filter(Boolean);
      const semanticStatusNodes = Array.from(document.querySelectorAll('[data-semantic-status]'));
      const semanticStatusColors = semanticStatusNodes
        .map((node) => getComputedStyle(node).color)
        .filter(Boolean);
      const neutralIconNodes = Array.from(document.querySelectorAll('[data-semantic-role="neutral-icon"]'));
      const neutralIconColors = neutralIconNodes.map((node) => getComputedStyle(node).color);
      const rgbSpread = (value) => {
        const match = String(value).match(/rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)/i);
        if (!match) return 0;
        const channels = match.slice(1, 4).map(Number);
        return Math.max(...channels) - Math.min(...channels);
      };
      const selectedEvidenceRow = document.querySelector('[data-testid^="document-row-"][data-selected="true"]');
      const unselectedEvidenceRow = document.querySelector('[data-testid^="document-row-"]:not([data-selected="true"])');
      const selectedStyle = selectedEvidenceRow ? getComputedStyle(selectedEvidenceRow) : null;
      const unselectedStyle = unselectedEvidenceRow ? getComputedStyle(unselectedEvidenceRow) : null;
      const documentsTab = Array.from(document.querySelectorAll('nav[aria-label="Navegação da carga"] button'))
        .find((button) => button.textContent?.trim() === 'Documentos');
      const documentCards = Array.from(document.querySelectorAll('[data-testid^="document-row-"]'));
      const documentCardRects = documentCards.map((item) => item.getBoundingClientRect());
      const documentsPrimary = document.querySelector('[data-testid="documents-primary-surface"]');
      const occurrencePrimary = document.querySelector('[data-testid="occurrence-primary-surface"]');
      const continuation = document.querySelector('[data-testid="page62-d06-d07-next"]');
      const occurrenceSections = [
        document.querySelector('[data-testid="occurrence-header"]'),
        document.querySelector('[data-testid="occurrence-decision-grid"]'),
        document.querySelector('[data-testid="occurrence-mitigation"]'),
        document.querySelector('[data-testid="occurrence-primary-action"]'),
      ].filter(Boolean);
      const rectsOverlap = (a, b) =>
        a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      const occurrenceSectionRects = occurrenceSections.map((item) => item.getBoundingClientRect());
      let occurrenceOverlapCount = 0;
      for (let first = 0; first < occurrenceSectionRects.length; first += 1) {
        for (let second = first + 1; second < occurrenceSectionRects.length; second += 1) {
          if (rectsOverlap(occurrenceSectionRects[first], occurrenceSectionRects[second])) {
            occurrenceOverlapCount += 1;
          }
        }
      }
      const documentsPrimaryRect = documentsPrimary?.getBoundingClientRect();
      const occurrencePrimaryRect = occurrencePrimary?.getBoundingClientRect();
      const continuationRect = continuation?.getBoundingClientRect();

      const proposalCards = Array.from(document.querySelectorAll('[data-testid="proposal-chooser"] button[aria-pressed]'));
      const selectedProposalCards = proposalCards.filter((item) => item.getAttribute('aria-pressed') === 'true');
      const negotiationBackButton = document.querySelector('button[aria-label="Voltar para documentos e ocorrências"]');
      const assistant = document.querySelector('[data-testid="page62-d09-context-chat"]');
      const assistantSuggestions = assistant ? Array.from(assistant.querySelectorAll('[aria-label="Perguntas sugeridas"] button')) : [];
      const assistantTurns = assistant ? Array.from(assistant.querySelectorAll('[aria-live="polite"] > *')) : [];
      const decisionDashboard = document.querySelector('[data-testid="proposal-decision-dashboard"]');
      const comparisonStrip = document.querySelector('[data-testid="proposal-comparison-strip"]');
      const reviewBackButton = document.querySelector('button[aria-label="Voltar à negociação"]');
      const reviewImpactCards = document.querySelector('[data-testid="review-impact-cards"]');
      const reviewChecklist = document.querySelector('[data-testid="review-preconfirm-checklist"]');
      const reviewNextSteps = document.querySelector('[data-testid="review-next-steps"]');
      const reviewSelectedProposal = document.querySelector('[data-testid="review-selected-proposal"]');
      const reviewChecklistItems = reviewChecklist ? Array.from(reviewChecklist.querySelectorAll('li')) : [];
      const feedbackImpact = document.querySelector('[data-testid="action-feedback-impact"]');
      const feedbackImpactMetrics = document.querySelector('[data-testid="action-feedback-impact-metrics"]');
      const feedbackImpactChartShell = document.querySelector('[data-testid="action-feedback-impact-chart"]');
      const feedbackReadiness = document.querySelector('[data-testid="action-feedback-readiness"]');
      const feedbackReadinessStates = feedbackReadiness ? Array.from(feedbackReadiness.querySelectorAll('[data-semantic-status]')) : [];
      const feedbackReadinessSummary = document.querySelector('[data-testid="action-feedback-readiness-summary"]');
      const feedbackImpactChart = feedbackImpactChartShell?.querySelector('[data-echart-renderer]');
      const feedbackReadinessChartShell = document.querySelector('[data-testid="action-feedback-readiness-chart"]');
      const feedbackReadinessChart = feedbackReadinessChartShell?.querySelector('[data-echart-renderer]');
      const feedbackImpactChartShellRect = feedbackImpactChartShell?.getBoundingClientRect();
      const feedbackImpactChartRect = feedbackImpactChart?.getBoundingClientRect();
      const feedbackReadinessRect = feedbackReadiness?.getBoundingClientRect();
      const feedbackReadinessChartShellRect = feedbackReadinessChartShell?.getBoundingClientRect();
      const feedbackReadinessChartRect = feedbackReadinessChart?.getBoundingClientRect();
      const feedbackNeutralIcons = feedbackReadiness ? Array.from(feedbackReadiness.querySelectorAll('[data-semantic-role="neutral-icon"]')) : [];
      const feedbackNeutralIconColors = feedbackNeutralIcons.map((node) => getComputedStyle(node).color);
      const feedbackHydro = document.querySelector('[data-testid="action-feedback-hydro-context"]');
      const feedbackSources = Array.from(document.querySelectorAll('[data-testid="action-feedback-source"]'));
      const feedbackNextSteps = document.querySelector('[data-testid="action-feedback-next-steps"]');
      const feedbackNextStepItems = feedbackNextSteps ? Array.from(feedbackNextSteps.querySelectorAll('article')) : [];
      const feedbackCorrectionBranch = document.querySelector('[data-testid="action-feedback-correction-branch"]');
      const feedbackMonitorButton = Array.from(document.querySelectorAll('button')).find((button) => button.textContent?.trim() === 'Acompanhar carga');
      const correctionMetrics = document.querySelector('[data-testid="correction-metrics"]');
      const correctionEvidenceList = document.querySelector('[data-testid="correction-evidence-list"]');
      const correctionOperationContext = document.querySelector('[data-testid="correction-operation-context"]');
      const correctionChecklist = document.querySelector('[data-testid="correction-checklist"]');
      const correctionProgress = document.querySelector('[data-testid="correction-progress"]');
      const correctionChart = document.querySelector('[data-testid="correction-weight-chart"] [data-echart-renderer]');
      const correctionPrimaryAction = Array.from(document.querySelectorAll('button')).find(
        (button) => button.textContent?.trim() === 'Salvar correção e enviar para revalidação',
      );
      const eventGaps = timelineEvents.slice(1).map((item, index) => {
        const previous = timelineEvents[index].getBoundingClientRect();
        const current = item.getBoundingClientRect();
        return current.top - previous.bottom;
      });

      return {
        width: rect.width,
        height: rect.height,
        secondaryVisible: secondary ? secondary.getBoundingClientRect().width > 0 : true,
        documentWidth: root.scrollWidth,
        viewportWidth: root.clientWidth,
        overflowX: root.scrollWidth - root.clientWidth,
        minHeadingPx: headingSizes.length ? Math.min(...headingSizes) : 0,
        maxHeadingPx: headingSizes.length ? Math.max(...headingSizes) : 0,
        canvasCount: chartSurfaces.length,
        canvases: chartSurfaces,
        mapSurfaceCount: document.querySelectorAll(
          '[aria-label^="Mapa operacional"], [data-testid="hydroway-map-product-stage"]',
        ).length,
        timelineEventCount: timelineEvents.length,
        timelineInsightVisible: Boolean(timelineInsight && timelineInsight.getBoundingClientRect().width > 0),
        cockpitKpisVisible: Boolean(cockpitKpis && cockpitKpis.getBoundingClientRect().height > 0),
        currentTimelineEventVisible: Boolean(currentTimelineEvent && currentTimelineEvent.getBoundingClientRect().height > 0),
        futureTimelineEventCount: futureTimelineEvents.length,
        distinctTimelineStatusTones: new Set(statusTones).size,
        minimumTimelineGap: eventGaps.length ? Math.min(...eventGaps) : 0,
        semanticStatusCount: semanticStatusNodes.length,
        distinctSemanticStatusColors: new Set(semanticStatusColors).size,
        neutralIconCount: neutralIconNodes.length,
        maxNeutralIconColorSpread: neutralIconColors.length ? Math.max(...neutralIconColors.map(rgbSpread)) : 0,
        selectedEvidenceVisualDelta: Boolean(
          selectedStyle &&
          unselectedStyle &&
          (
            selectedStyle.backgroundColor !== unselectedStyle.backgroundColor ||
            selectedStyle.borderColor !== unselectedStyle.borderColor ||
            selectedStyle.boxShadow !== unselectedStyle.boxShadow
          )
        ),
        documentInspectorVisible: Boolean(
          document.querySelector('[data-testid="document-inspector"]')?.getBoundingClientRect().height
        ),
        documentsTabActive: documentsTab?.getAttribute('aria-pressed') === 'true',
        documentCardCount: documentCards.length,
        documentCardMaxWidth: documentCardRects.length ? Math.max(...documentCardRects.map((item) => item.width)) : 0,
        documentCardMinWidth: documentCardRects.length ? Math.min(...documentCardRects.map((item) => item.width)) : 0,
        documentCardHeightSpread: documentCardRects.length
          ? Math.max(...documentCardRects.map((item) => item.height)) - Math.min(...documentCardRects.map((item) => item.height))
          : 0,
        documentsBeforeOccurrence: Boolean(
          documentsPrimaryRect && occurrencePrimaryRect && documentsPrimaryRect.bottom <= occurrencePrimaryRect.top
        ),
        documentsOccurrenceGap: documentsPrimaryRect && occurrencePrimaryRect
          ? occurrencePrimaryRect.top - documentsPrimaryRect.bottom
          : -1,
        occurrenceBeforeContinuation: Boolean(
          occurrencePrimaryRect && continuationRect && occurrencePrimaryRect.bottom <= continuationRect.top
        ),
        occurrenceOverlapCount,
        proposalCardCount: proposalCards.length,
        selectedProposalCardCount: selectedProposalCards.length,
        negotiationBackVisible: Boolean(negotiationBackButton && negotiationBackButton.getBoundingClientRect().width > 0),
        assistantSuggestionCount: assistantSuggestions.length,
        assistantTurnCount: assistantTurns.length,
        decisionDashboardVisible: Boolean(decisionDashboard && decisionDashboard.getBoundingClientRect().height > 0),
        comparisonStripVisible: Boolean(comparisonStrip && comparisonStrip.getBoundingClientRect().height > 0),
        reviewBackVisible: Boolean(reviewBackButton && reviewBackButton.getBoundingClientRect().width > 0),
        reviewImpactCardCount: reviewImpactCards ? reviewImpactCards.querySelectorAll('article').length : 0,
        reviewChecklistCount: reviewChecklistItems.length,
        reviewNextStepsVisible: Boolean(reviewNextSteps && reviewNextSteps.getBoundingClientRect().height > 0),
        reviewSelectedProposalVisible: Boolean(reviewSelectedProposal && reviewSelectedProposal.getBoundingClientRect().height > 0),
        feedbackImpactVisible: Boolean(feedbackImpact && feedbackImpact.getBoundingClientRect().height > 0),
        feedbackImpactMetricCount: feedbackImpactMetrics ? feedbackImpactMetrics.querySelectorAll('article').length : 0,
        feedbackReadinessVisible: Boolean(feedbackReadiness && feedbackReadiness.getBoundingClientRect().height > 0),
        feedbackReadinessStateCount: feedbackReadinessStates.length,
        feedbackReadinessSummaryCount: feedbackReadinessSummary ? feedbackReadinessSummary.children.length : 0,
        feedbackImpactChartWidthRatio: feedbackImpactChartShellRect && feedbackImpactChartRect
          ? feedbackImpactChartRect.width / feedbackImpactChartShellRect.width
          : 0,
        feedbackImpactChartHeight: feedbackImpactChartRect?.height ?? 0,
        feedbackReadinessChartWidthRatio: feedbackReadinessChartShellRect && feedbackReadinessChartRect
          ? feedbackReadinessChartRect.width / feedbackReadinessChartShellRect.width
          : 0,
        feedbackReadinessChartHeight: feedbackReadinessChartRect?.height ?? 0,
        feedbackImpactChartVisible: Boolean(feedbackImpactChart && feedbackImpactChart.getBoundingClientRect().height > 0),
        feedbackReadinessChartVisible: Boolean(feedbackReadinessChart && feedbackReadinessChart.getBoundingClientRect().height > 0),
        feedbackNeutralIconCount: feedbackNeutralIcons.length,
        feedbackNeutralIconColorSpread: feedbackNeutralIconColors.length ? Math.max(...feedbackNeutralIconColors.map(rgbSpread)) : 0,
        feedbackHydroVisible: Boolean(feedbackHydro && feedbackHydro.getBoundingClientRect().height > 0),
        feedbackSourceCount: feedbackSources.length,
        feedbackNextStepCount: feedbackNextStepItems.length,
        feedbackCorrectionVisible: Boolean(feedbackCorrectionBranch && feedbackCorrectionBranch.getBoundingClientRect().height > 0),
        feedbackMonitorVisible: Boolean(feedbackMonitorButton && feedbackMonitorButton.getBoundingClientRect().width > 0),
        correctionMetricCount: correctionMetrics ? correctionMetrics.querySelectorAll('article').length : 0,
        correctionEvidenceCount: correctionEvidenceList ? correctionEvidenceList.querySelectorAll('article').length : 0,
        correctionContextVisible: Boolean(correctionOperationContext && correctionOperationContext.getBoundingClientRect().height > 0),
        correctionChecklistCount: correctionChecklist ? correctionChecklist.querySelectorAll('li').length : 0,
        correctionProgressCount: correctionProgress ? correctionProgress.querySelectorAll('article').length : 0,
        correctionChartHeight: correctionChart?.getBoundingClientRect().height ?? 0,
        correctionPrimaryActionVisible: Boolean(correctionPrimaryAction && correctionPrimaryAction.getBoundingClientRect().width > 0),
      };
    }, { selector: state.selector, secondarySelector: state.secondarySelector || null });

    const failures = [];
    if (!metrics) failures.push('primary surface missing');
    else {
      if (metrics.width < 300 || metrics.height < 180) failures.push('surface geometry collapsed');
      if (!metrics.secondaryVisible) failures.push('secondary surface missing');
      if (metrics.overflowX > 4) failures.push(`horizontal overflow ${metrics.overflowX}px`);
      if (metrics.minHeadingPx > 0 && metrics.minHeadingPx < 13) failures.push(`heading too small ${metrics.minHeadingPx}px`);
      if (metrics.canvasCount < state.minCharts) failures.push(`expected at least ${state.minCharts} chart canvas, found ${metrics.canvasCount}`);
      if (state.map && metrics.mapSurfaceCount < 1) failures.push('MapLibre/fallback surface missing');
      if (state.storyKey === 'D06D07DocumentsRisk') {
        if (!metrics.documentsTabActive) failures.push('documents state is not integrated with the cockpit Documentos tab');
        if (!metrics.documentInspectorVisible) failures.push('selected document inspector missing');
        if (!metrics.selectedEvidenceVisualDelta) failures.push('selected document card lacks a clear visual delta');
        if (metrics.documentCardCount < 5) failures.push(`document card set incomplete: ${metrics.documentCardCount}`);
        if (metrics.documentCardMaxWidth > 320) failures.push(`document cards stretched beyond overview pattern: ${metrics.documentCardMaxWidth}px`);
        if (metrics.documentCardHeightSpread > 8) failures.push(`document cards lost visual consistency: ${metrics.documentCardHeightSpread}px height spread`);
        if (!metrics.documentsBeforeOccurrence) failures.push('documents and occurrence are competing side-by-side instead of following vertical hierarchy');
        if (metrics.documentsOccurrenceGap < 12) failures.push(`documents/occurrence spacing collapsed: ${metrics.documentsOccurrenceGap}px`);
        if (!metrics.occurrenceBeforeContinuation) failures.push('next-flow continuation is competing with the occurrence instead of following it');
        if (metrics.occurrenceOverlapCount > 0) failures.push(`occurrence sections visually overlap: ${metrics.occurrenceOverlapCount}`);
        if (metrics.semanticStatusCount < 4) failures.push(`document/occurrence status semantics too sparse: ${metrics.semanticStatusCount}`);
        if (metrics.distinctSemanticStatusColors < 3) failures.push(`distinct operational statuses collapsed into ${metrics.distinctSemanticStatusColors} computed colors`);
        if (metrics.neutralIconCount < 3) failures.push('neutral icon contract not represented in documents/occurrence');
        if (metrics.maxNeutralIconColorSpread > 42) failures.push(`neutral icons became status-colored: RGB spread ${metrics.maxNeutralIconColorSpread}`);
      }
      if (state.storyKey === 'D08D09Negotiation') {
        if (metrics.proposalCardCount < 3) failures.push(`negotiation choice set too narrow: ${metrics.proposalCardCount}`);
        if (metrics.selectedProposalCardCount !== 1) failures.push(`negotiation must expose exactly one selected proposal: ${metrics.selectedProposalCardCount}`);
        if (!metrics.negotiationBackVisible) failures.push('negotiation back navigation missing');
        if (!metrics.decisionDashboardVisible || !metrics.comparisonStripVisible) failures.push('negotiation decision hierarchy incomplete');
        if (metrics.assistantSuggestionCount < 4) failures.push(`operational assistant suggestion breadth incomplete: ${metrics.assistantSuggestionCount}`);
        if (metrics.assistantTurnCount < 1) failures.push('operational assistant conversation state missing');
      }
      if (state.storyKey === 'D10ActionReview') {
        if (!metrics.reviewBackVisible) failures.push('review back navigation missing');
        if (!metrics.reviewSelectedProposalVisible) failures.push('selected proposal summary missing from review');
        if (metrics.reviewImpactCardCount < 4) failures.push(`review impact breadth incomplete: ${metrics.reviewImpactCardCount}`);
        if (metrics.reviewChecklistCount < 4) failures.push(`pre-confirm checklist incomplete: ${metrics.reviewChecklistCount}`);
        if (!metrics.reviewNextStepsVisible) failures.push('post-accept next steps missing');
      }
      if (state.storyKey === 'D11ActionFeedback') {
        if (!metrics.feedbackImpactVisible) failures.push('applied-impact visualization missing');
        if (metrics.feedbackImpactMetricCount < 4) failures.push(`post-action impact breadth incomplete: ${metrics.feedbackImpactMetricCount}`);
        if (!metrics.feedbackReadinessVisible || metrics.feedbackReadinessStateCount < 4) failures.push('post-action readiness/state model incomplete');
        if (!metrics.feedbackImpactChartVisible || !metrics.feedbackReadinessChartVisible) failures.push('D11 must expose both impact and readiness visualizations');
        if (metrics.feedbackReadinessSummaryCount < 3) failures.push(`D11 readiness summary incomplete: ${metrics.feedbackReadinessSummaryCount}`);
        if (metrics.feedbackImpactChartWidthRatio < 0.96) failures.push(`D11 impact visualization is not using its available width: ${metrics.feedbackImpactChartWidthRatio.toFixed(2)}`);
        if (metrics.feedbackImpactChartHeight < 450) failures.push(`D11 impact visualization is too shallow: ${metrics.feedbackImpactChartHeight}px`);
        if (metrics.feedbackReadinessChartWidthRatio < 0.96) failures.push(`D11 readiness visualization is not using its available width: ${metrics.feedbackReadinessChartWidthRatio.toFixed(2)}`);
        if (metrics.feedbackReadinessChartHeight < 300) failures.push(`D11 readiness visualization is too shallow: ${metrics.feedbackReadinessChartHeight}px`);
        if (metrics.feedbackNeutralIconCount < 8) failures.push(`D11 neutral iconography too sparse: ${metrics.feedbackNeutralIconCount}`);
        if (metrics.feedbackNeutralIconColorSpread > 42) failures.push(`D11 state icons became status-colored: RGB spread ${metrics.feedbackNeutralIconColorSpread}`);
        if (!metrics.feedbackHydroVisible || metrics.feedbackSourceCount < 2) failures.push('post-action hydrographic/source context incomplete');
        if (metrics.feedbackNextStepCount < 4) failures.push(`post-action continuation too shallow: ${metrics.feedbackNextStepCount}`);
        if (!metrics.feedbackCorrectionVisible) failures.push('document recovery branch missing from action feedback');
        if (!metrics.feedbackMonitorVisible) failures.push('monitoring continuation missing from action feedback');
      }
      if (state.storyKey === 'D12CorrectionResubmit') {
        if (metrics.correctionMetricCount < 3) failures.push(`D12 correction metric strip incomplete: ${metrics.correctionMetricCount}`);
        if (metrics.correctionEvidenceCount < 4) failures.push(`D12 evidence/value support incomplete: ${metrics.correctionEvidenceCount}`);
        if (!metrics.correctionContextVisible) failures.push('D12 operational corridor context missing');
        if (metrics.correctionChecklistCount < 4) failures.push(`D12 revalidation checklist incomplete: ${metrics.correctionChecklistCount}`);
        if (metrics.correctionProgressCount < 4) failures.push(`D12 correction process incomplete: ${metrics.correctionProgressCount}`);
        if (metrics.correctionChartHeight < 220) failures.push(`D12 correction chart too shallow: ${metrics.correctionChartHeight}px`);
        if (!metrics.correctionPrimaryActionVisible) failures.push('D12 primary revalidation action missing');
      }
      if (state.storyKey === 'D04D05Cockpit' && metrics.timelineEventCount > 0) {
        if (metrics.timelineEventCount < 6) failures.push(`timeline breadth incomplete: ${metrics.timelineEventCount}`);
        if (!metrics.timelineInsightVisible) failures.push('timeline contextual info block missing');
        if (metrics.cockpitKpisVisible) failures.push('cockpit KPI strip must not repeat in timeline mode');
        if (!metrics.currentTimelineEventVisible) failures.push('current timeline event is not explicitly marked');
        if (metrics.futureTimelineEventCount < 1) failures.push('future timeline state missing');
        if (metrics.distinctTimelineStatusTones < 5) failures.push(`status semantics too repetitive: ${metrics.distinctTimelineStatusTones} tones`);
        if (metrics.minimumTimelineGap < 8) failures.push(`timeline cards visually collide: ${metrics.minimumTimelineGap}px gap`);
      }
    }

    const relevantConsoleErrors = consoleErrors.filter(
      (entry) => !/Failed to load resource|ERR_NAME_NOT_RESOLVED|net::ERR_/i.test(entry),
    );
    if (relevantConsoleErrors.length) failures.push(`runtime console errors: ${relevantConsoleErrors.length}`);

    const slug = storyId.replace(/[^a-z0-9-]+/gi, '-');
    const screenshotPath = path.resolve(evidenceDir, `${slug}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true, animations: 'disabled', caret: 'hide' });

    results.push({
      name: state.name,
      storyKey: state.storyKey,
      storyId,
      pass: failures.length === 0,
      failures,
      metrics,
      screenshot: path.relative(root, screenshotPath),
    });

    await page.close();
  }

  await certifyInteractiveFlow({
    name: 'Full Flow · happy path',
    correctionBranch: false,
  });
  await certifyInteractiveFlow({
    name: 'Full Flow · correction branch',
    correctionBranch: true,
  });

  const report = {
    gate: 'PAGE62-JOURNEY-RUNTIME-VISUAL-v1',
    status: results.every((result) => result.pass) ? 'PASS' : 'FAIL',
    results,
  };

  await writeFile(
    path.resolve(evidenceDir, 'page62-journey-runtime-result.json'),
    JSON.stringify(report, null, 2) + '\n',
  );

  for (const result of results) {
    console.log(
      `${result.pass ? 'PASS' : 'FAIL'} ${result.name}: charts=${result.metrics?.canvasCount ?? 0} overflow=${result.metrics?.overflowX ?? '?'}px`,
    );
    result.failures.forEach((failure) => console.log(`  - ${failure}`));
  }

  process.exitCode = report.status === 'PASS' ? 0 : 1;
} finally {
  await browser.close();
}
