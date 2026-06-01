import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import type { ReactElement } from 'react';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

import {
  MobileCargoLabCard,
  MobileCargoListLab,
  filterMobileCargoList,
  formatLabEtaLabel,
  type MobileCargoListLabItem,
  buildMobileCargoOverviewMapHref,
  getCargoActionItems,
} from '@/features/cargo/components/mobile-list-lab/mobile-cargo-list-lab';
import type { MobileCargoListItem } from '@/features/cargo/domain/cargo-list.types';

const item = (over: Partial<MobileCargoListLabItem> = {}): MobileCargoListLabItem => ({
  id: 'cargo-001',
  displayCode: 'CARGO-001',
  statusLabel: 'Em transito',
  title: 'Açaí congelado para entrega regional',
  origin: 'Belém, PA',
  destination: 'Santarém, PA',
  status: 'boarded',
  etaLabel: 'ETA 36–44h • confiança média',
  operationLabel: 'Corredor Tapajós',
  warningLabel: undefined,
  needsAttention: false,
  ...over,
});

describe('CargoLabCard', () => {
  it('renderiza id, status, rota e ETA', () => {
    const html = renderToStaticMarkup(
      <MobileCargoLabCard item={item()} onPress={() => undefined} />,
    );

    expect(html).toContain('CARGO-001');
    expect(html).toContain('Em transito');
    expect(html).toContain('Belém, PA');
    expect(html).toContain('Santarém, PA');
    expect(html).toContain('ETA 36–44h');
  });

  it('não renderiza texto mock/dev', () => {
    const html = renderToStaticMarkup(
      <MobileCargoLabCard
        item={item({ title: 'Operação regular' })}
        onPress={() => undefined}
      />,
    );

    expect(html.toLowerCase()).not.toContain('mock');
    expect(html.toLowerCase()).not.toContain('dev-only');
  });

  it('aciona callback ao tocar no card', () => {
    const onPress = vi.fn();
    const element = MobileCargoLabCard({ item: item(), onPress });
    const buttonEl = element.props.children as ReactElement<{ onClick: () => void }>;
    buttonEl.props.onClick();

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledWith(expect.objectContaining({ id: 'cargo-001' }));
  });
});

describe('MobileCargoListLab dark canvas', () => {
  it('força dark mode local no root do lab', () => {
    const html = renderToStaticMarkup(
      <MobileCargoListLab locale="pt-BR" items={[]} filters={{ chips: [] }} totalCount={0} />,
    );

    expect(html).toContain('data-theme="dark"');
    expect(html).toContain('data-hydro-theme="dark"');
    expect(html).not.toContain('data-sheet-open="true"');
    expect(html).toContain('cargo-lab-list-scroller');
    expect(html).not.toContain('cargo-lab-hero');
    expect(html).toContain('cargo-lab-filter-button');
  });
});

describe('getCargoActionItems', () => {
  it('marca overview como desabilitado quando não há carga selecionada', () => {
    const actions = getCargoActionItems(null);
    expect(actions[0]?.id).toBe('overview');
    expect(actions[0]?.disabled).toBe(true);
  });

  it('gera overview como primeira ação quando há carga selecionada', () => {
    const actions = getCargoActionItems(item());
    expect(actions[0]?.id).toBe('overview');
    expect(actions[0]?.disabled).toBe(false);
  });

  it('marca ações sem handler como desabilitadas / em breve', () => {
    const actions = getCargoActionItems(item());
    const secondary = actions.filter((action) => action.id !== 'overview');

    expect(secondary.every((action) => action.disabled && action.comingSoon)).toBe(true);
  });

  it('habilita visão geral quando há carga selecionada', () => {
    const actions = getCargoActionItems(item());
    const overview = actions.find((action) => action.id === 'overview');

    expect(overview?.disabled).toBe(false);
    expect(overview?.comingSoon).toBeFalsy();
  });
});

describe('formatLabEtaLabel', () => {
  it('remove prefixo ETA duplicado', () => {
    expect(formatLabEtaLabel('ETA ETA 30–42h • alta confiança')).toBe(
      'ETA 30–42h • alta confiança',
    );
  });
});

describe('filterMobileCargoList integration', () => {
  it('filtra por busca case-insensitive em código e rota', () => {
    const items: MobileCargoListItem[] = [
      {
        id: '1',
        displayId: 'CARGO-001',
        title: 'Açaí',
        origin: 'Belém, PA',
        destination: 'Santarém, PA',
        status: 'open',
        statusBadgeTone: 'info',
        etaLabel: 'ETA 24h',
        needsAttention: false,
      },
    ];

    expect(filterMobileCargoList(items, 'belem', 'all')).toHaveLength(1);
    expect(filterMobileCargoList(items, 'CARGO-001', 'all')).toHaveLength(1);
    expect(filterMobileCargoList(items, 'inexistente', 'all')).toHaveLength(0);
  });
});

describe('buildMobileCargoOverviewMapHref', () => {
  it('aponta para o mapa oficial da carga', () => {
    expect(buildMobileCargoOverviewMapHref('pt-BR', 'cargo-018')).toBe(
      '/pt-BR/cargas/cargo-018/mapa',
    );
  });
});

describe('MobileCargoListLab shell markup', () => {
  it('renderiza search, filtros, cards, dock e canvas dark local sem hero', () => {
    const html = renderToStaticMarkup(
      <MobileCargoListLab
        locale="pt-BR"
        items={[
          {
            id: 'cargo-001',
            displayId: 'CARGO-001',
            title: 'Carga teste',
            origin: 'Belém',
            destination: 'Manaus',
            status: 'open',
            statusBadgeTone: 'neutral',
            etaLabel: 'ETA 24h',
            needsAttention: false,
          },
        ]}
        filters={{ chips: [] }}
        totalCount={1}
      />,
    );

    expect(html).toContain('data-theme="dark"');
    expect(html).toContain('data-hydro-theme="dark"');
    expect(html).not.toContain('cargo-lab-hero');
    expect(html).toContain('searchPlaceholder');
    expect(html).toContain('cargo-lab-filter-scroll');
    expect(html).toContain('cargo-lab-filter-button');
    expect(html).toContain('cargo-lab-list');
    expect(html).toContain('cargo-lab-list-scroller');
    expect(html).toContain('cargo-lab-header');
    expect(html).toContain('cargo-lab-compact-header');
    expect(html).toContain('cargo-lab-bottom-dock');
    expect(html).toContain('CARGO-001');
    expect(html).not.toContain('ETA ETA');
    expect(html).not.toContain('dock.filters');
    expect(html).not.toContain('Filtros</span>');
  });

  it('marca sheet aberto e bloqueia lista por trás', () => {
    const html = renderToStaticMarkup(
      <MobileCargoListLab
        locale="pt-BR"
        items={[
          {
            id: 'cargo-001',
            displayId: 'CARGO-001',
            title: 'Carga teste',
            origin: 'Belém',
            destination: 'Manaus',
            status: 'open',
            statusBadgeTone: 'neutral',
            etaLabel: 'ETA 24h',
            needsAttention: false,
          },
        ]}
        filters={{ chips: [] }}
        totalCount={1}
      />,
    );

    expect(html).not.toContain('data-sheet-open="true"');
    expect(html).toContain('data-draggable="true"');
    expect(html).toContain('filterSheetHeader');
    expect(html).toContain('filterSheetFooter');
    expect(html).toContain('cargo-lab-filter-sheet');
  });
});
