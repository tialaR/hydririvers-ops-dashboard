import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { userCargosMock } from '@/features/cargo/mocks/owned-cargos.mock';
import {
  deriveOwnedCargoDetail,
  deriveOwnedCargoDocumentItems,
  deriveOwnedCargoProcessSteps,
  deriveOwnedCargoRiskItems,
} from '@/features/cargo/domain/derive-owned-cargo-detail';
import { OwnedCargoDocumentsSheet } from '@/features/cargo/owned/components/owned-cargo-documents-sheet/owned-cargo-documents-sheet';
import { OwnedCargoMapSheet } from '@/features/cargo/owned/components/owned-cargo-map-sheet/owned-cargo-map-sheet';
import { OwnedCargoProcessSheet } from '@/features/cargo/owned/components/owned-cargo-process-sheet/owned-cargo-process-sheet';
import { OwnedCargoRisksSheet } from '@/features/cargo/owned/components/owned-cargo-risks-sheet/owned-cargo-risks-sheet';
import { OwnedCargoTimelineSheet } from '@/features/cargo/owned/components/owned-cargo-timeline-sheet/owned-cargo-timeline-sheet';
import { OwnedCargoTrackingSheet } from '@/features/cargo/owned/components/owned-cargo-tracking-sheet/owned-cargo-tracking-sheet';

vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => {
    const key = (name: string, values?: Record<string, string | number>) => {
      const serialized = values ? ` ${JSON.stringify(values)}` : '';
      return `${namespace}:${name}${serialized}`;
    };
    return key;
  },
  useLocale: () => 'pt-BR',
}));

vi.mock('@/shared/i18n/mock-content', () => ({
  translateMock: (_locale: string, value: string) => value,
}));

vi.mock('@/shared/components/bottom-sheet', () => ({
  BottomSheet: ({ children, title }: { children: React.ReactNode; title: string }) =>
    React.createElement(
      'div',
      { 'data-testid': 'bottom-sheet-panel' },
      React.createElement('h2', null, title),
      children,
    ),
}));

vi.mock('@/features/cargo/owned/components/owned-cargo-sheet-defaults/owned-cargo-sheet-defaults', () => ({
  ownedCargoSheetDefaults: {},
  ownedCargoSheetPortalAttributes: {},
  ownedCargoSheetSnapHeights: [],
  useOwnedCargoSheetPortal: () => undefined,
}));

describe('owned cargo sheet domain enrichment', () => {
  it('expõe timestamps na timeline e severidade crítica no primeiro risco', () => {
    const cargo = userCargosMock[0]!;
    const detail = deriveOwnedCargoDetail(cargo);

    expect(detail.timelineEvents[0]?.timestampMock).toMatch(/\d{2}\/\d{2}/);
    expect(detail.riskItems[0]?.isCritical).toBe(true);
    expect(detail.riskItems[0]?.impactMock).toBeTruthy();
    expect(detail.processSteps.length).toBeGreaterThan(0);
  });

  it('mapeia status visual de documentos premium', () => {
    const items = deriveOwnedCargoDocumentItems(userCargosMock[0]!);
    expect(items.find((item) => item.name === 'NF-e')?.displayStatus).toBe('authorized');
    expect(items.find((item) => item.name === 'Comprovante de coleta')?.needsAction).toBe(true);
  });

  it('expõe rastreio live para carga embarcada', () => {
    const boarded = userCargosMock.find((cargo) => cargo.status === 'boarded')!;
    const detail = deriveOwnedCargoDetail(boarded);

    expect(detail.trackingDetail?.isLive).toBe(true);
    expect(detail.trackingDetail?.convoyLabelMock).toContain('HidroNave');
    expect(detail.trackingDetail?.etaLabel).toBeTruthy();
  });

  it('gera checklist de processo com fases', () => {
    const steps = deriveOwnedCargoProcessSteps(userCargosMock[0]!);
    expect(steps.some((step) => step.phase === 'current')).toBe(true);
  });

  it('classifica severidades de risco por ordem', () => {
    const risks = deriveOwnedCargoRiskItems(userCargosMock[0]!);
    expect(risks.map((risk) => risk.severity)).toEqual(['high', 'medium', 'low']);
  });
});

describe('owned cargo premium sheets', () => {
  const cargo = userCargosMock[0]!;
  const detail = deriveOwnedCargoDetail(cargo);

  it('renderiza mapa premium com rota e progresso', () => {
    const html = renderToStaticMarkup(
      React.createElement(OwnedCargoMapSheet, {
        cargo,
        map: detail.map,
        open: true,
        onOpenChange: () => undefined,
      }),
    );

    expect(html).toContain('data-testid="owned-cargo-map-sheet-preview"');
    expect(html).toContain('pages.minhasCargas.detail.sheets.map:status.open');
    expect(html).toContain(cargo.origin);
  });

  it('renderiza timeline premium com timestamps', () => {
    const html = renderToStaticMarkup(
      React.createElement(OwnedCargoTimelineSheet, {
        preview: detail.timeline,
        events: detail.timelineEvents,
        open: true,
        onOpenChange: () => undefined,
      }),
    );

    expect(html).toContain('data-testid="owned-cargo-timeline-sheet-list"');
    expect(html).toContain(detail.timelineEvents[0]!.timestampMock);
  });

  it('renderiza documentos premium com banner de ação', () => {
    const html = renderToStaticMarkup(
      React.createElement(OwnedCargoDocumentsSheet, {
        preview: detail.documents,
        documents: detail.documentItems,
        open: true,
        onOpenChange: () => undefined,
      }),
    );

    expect(html).toContain('data-testid="owned-cargo-documents-sheet-action-banner"');
    expect(html).toContain('Comprovante de coleta');
    expect(html).toContain('pages.minhasCargas.detail.sheets.documents:displayStatus.pending');
  });

  it('renderiza riscos premium com alerta crítico', () => {
    const html = renderToStaticMarkup(
      React.createElement(OwnedCargoRisksSheet, {
        preview: detail.risks,
        risks: detail.riskItems,
        open: true,
        onOpenChange: () => undefined,
      }),
    );

    expect(html).toContain('data-testid="owned-cargo-risks-sheet-critical"');
    expect(html).toContain('data-testid="owned-cargo-risks-sheet-list"');
  });

  it('renderiza processo premium com checklist', () => {
    const html = renderToStaticMarkup(
      React.createElement(OwnedCargoProcessSheet, {
        preview: detail.process,
        steps: detail.processSteps,
        documents: detail.documentItems,
        open: true,
        onOpenChange: () => undefined,
      }),
    );

    expect(html).toContain('data-testid="owned-cargo-process-sheet-checklist"');
    expect(html).toContain('pages.minhasCargas.detail.sheets.process:recommendedAction');
  });

  it('renderiza rastreio premium quando disponível', () => {
    const boarded = userCargosMock.find((item) => item.status === 'boarded')!;
    const boardedDetail = deriveOwnedCargoDetail(boarded);
    const html = renderToStaticMarkup(
      React.createElement(OwnedCargoTrackingSheet, {
        detail: boardedDetail.trackingDetail,
        originLabel: boarded.origin,
        destinationLabel: boarded.destination,
        open: true,
        onOpenChange: () => undefined,
      }),
    );

    expect(html).toContain('data-testid="owned-cargo-tracking-sheet-details"');
    expect(html).toContain('pages.minhasCargas.detail.sheets.tracking:liveStatus');
    expect(html).toContain('data-testid="owned-cargo-tracking-sheet-route"');
  });
});
