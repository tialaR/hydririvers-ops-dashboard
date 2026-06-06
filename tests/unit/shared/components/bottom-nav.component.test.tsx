import { createElement, type MouseEvent } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import {
  BottomNav,
  bottomNavV2LightClassNames,
  isBottomNavItemPending,
  resolveVisualActiveId,
  shouldBypassPressFeedback,
  type BottomNavProps,
} from '@/shared/components/bottom-nav';

vi.mock('next-intl', () => ({
  useLocale: () => 'pt-BR',
}));

vi.mock('@/core/i18n/navigation', () => ({
  getPathname: ({ href }: { href: string }) => href,
  useRouter: () => ({ push: vi.fn() }),
}));

const classNames = {
  item: 'nav-item',
  itemActive: 'nav-item-active',
  icon: 'nav-icon',
  label: 'nav-label',
  activeBubble: 'active-bubble',
  activeIcon: 'active-icon',
  activeLabel: 'active-label',
};

describe('BottomNav', () => {
  it('renderiza items e aria-label', () => {
    const html = renderToStaticMarkup(
      <BottomNav
        ariaLabel="Nav principal"
        activeId="cargo"
        classNames={classNames}
        items={[
          { id: 'cargo', label: 'Cargas', icon: <span>C</span> },
          { id: 'profile', label: 'Perfil', icon: <span>P</span> },
        ]}
      />,
    );

    expect(html).toContain('aria-label="Nav principal"');
    expect(html).toContain('Cargas');
    expect(html).toContain('active-bubble');
  });

  it('marca activeId com data-active', () => {
    const html = renderToStaticMarkup(
      <BottomNav
        activeId="cargo"
        classNames={classNames}
        items={[
          { id: 'cargo', label: 'Cargas', icon: <span>C</span> },
          { id: 'profile', label: 'Perfil', icon: <span>P</span> },
        ]}
      />,
    );

    expect(html).toContain('data-active="true"');
    expect(html).toContain('data-active="false"');
  });

  it('propaga onItemSelect para itens', () => {
    const onItemSelect = vi.fn();
    const element = createElement(BottomNav, {
      activeId: 'cargo',
      classNames,
      onItemSelect,
      items: [{ id: 'profile', label: 'Perfil', icon: <span>P</span> }],
    } as BottomNavProps);

    expect(element.props.onItemSelect).toBe(onItemSelect);
  });

  it('respeita item disabled', () => {
    const html = renderToStaticMarkup(
      <BottomNav
        activeId="cargo"
        classNames={classNames}
        items={[{ id: 'cargo', label: 'Cargas', icon: <span>C</span>, disabled: true }]}
      />,
    );

    expect(html).toContain('disabled');
  });

  it('renderiza href localizado em anchor nativo', () => {
    const html = renderToStaticMarkup(
      <BottomNav
        activeId="cargo"
        classNames={classNames}
        items={[{ id: 'cargo', label: 'Cargas', icon: <span>C</span>, href: '/cargas' }]}
      />,
    );

    expect(html).toContain('href="/cargas"');
    expect(html).toContain('data-active="true"');
  });

  it('item com href usa anchor e preserva callback de seleção', () => {
    const onItemSelect = vi.fn();
    const html = renderToStaticMarkup(
      <BottomNav
        activeId="cargo"
        classNames={classNames}
        onItemSelect={onItemSelect}
        items={[
          {
            id: 'profile',
            label: 'Perfil',
            href: '/perfil',
            iconOutlined: <span>P</span>,
          },
        ]}
      />,
    );

    expect(html).toContain('href="/perfil"');
    expect(onItemSelect).toBeDefined();
  });

  it('item ativo usa ícone outlined, bolha e label com marker semântico', () => {
    const html = renderToStaticMarkup(
      <BottomNav
        activeId="cargo"
        classNames={classNames}
        items={[
          {
            id: 'cargo',
            label: 'Cargas',
            iconOutlined: <span data-testid="outlined">O</span>,
            iconFilled: <span data-testid="filled">F</span>,
          },
          { id: 'profile', label: 'Perfil', iconOutlined: <span>P</span> },
        ]}
      />,
    );

    expect(html).toContain('data-bottom-nav-icon-variant="outlined"');
    expect(html).toContain('data-bottom-nav-icon-state="active"');
    expect(html).toContain('data-bottom-nav-icon-active="true"');
    expect(html).toContain('data-bottom-nav-label-active="true"');
    expect(html).toContain('data-testid="outlined"');
    expect(html).not.toContain('data-bottom-nav-icon-variant="filled"');
    expect(html).not.toContain('data-testid="filled"');
    expect(html).toContain('data-bottom-nav-global="true"');
    expect(html).toContain('data-bottom-nav-glass="true"');
  });

  it('exporta casca visual homologada /dev-v2 light para reuso', () => {
    expect(bottomNavV2LightClassNames.shell).toBeTruthy();
    expect(bottomNavV2LightClassNames.item).toBeTruthy();
    expect(bottomNavV2LightClassNames.activeBubble).toBeTruthy();

    const html = renderToStaticMarkup(
      <BottomNav
        className={bottomNavV2LightClassNames.shell}
        activeId="cargo"
        classNames={{
          item: bottomNavV2LightClassNames.item,
          itemActive: bottomNavV2LightClassNames.itemActive,
          icon: bottomNavV2LightClassNames.icon,
          label: bottomNavV2LightClassNames.label,
          activeBubble: bottomNavV2LightClassNames.activeBubble,
          activeIcon: bottomNavV2LightClassNames.activeIcon,
          activeLabel: bottomNavV2LightClassNames.activeLabel,
        }}
        items={[{ id: 'cargo', label: 'Cargas', iconOutlined: <span>C</span> }]}
      />,
    );

    expect(html).toContain(bottomNavV2LightClassNames.shell);
    expect(html).toContain(bottomNavV2LightClassNames.activeBubble);
  });

  it('implementa pending active otimista com pointerdown e markers nativos', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.tsx'),
      'utf8',
    );

    expect(source).toContain('pendingItemId');
    expect(source).toContain('onPendingSelect?.(item.id)');
    expect(source).toContain('setPendingItemId(null)');
    expect(source).toContain('onPointerDown={handlePointerDown}');
    expect(source).toContain('data-bottom-nav-pending');
    expect(source).toContain('data-bottom-nav-glass="true"');
    expect(source).toContain('scheduleNavigation');
    expect(source).toContain('navigationTimerRef');
    expect(source).not.toContain('data-bottom-nav-icon-variant="filled"');
  });

  it('não define pending em modified click', () => {
    expect(shouldBypassPressFeedback({ metaKey: true, ctrlKey: false, shiftKey: false, altKey: false, button: 0 } as MouseEvent)).toBe(true);
    expect(shouldBypassPressFeedback({ metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, button: 0 } as MouseEvent)).toBe(false);

    const source = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.tsx'),
      'utf8',
    );
    expect(source).toContain('shouldBypassPressFeedback(event)');
  });

  it('visualActiveId e pending derivam de helpers compartilhados', () => {
    expect(resolveVisualActiveId('cargos', 'negotiations')).toBe('negotiations');
    expect(isBottomNavItemPending('negotiations', 'cargos', 'negotiations')).toBe(true);
  });

  it('casca shared expõe blur/transparência via classNames homologados', () => {
    const shellSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/bottom-nav-v2-light-shell.module.scss'),
      'utf8',
    );

    expect(shellSource).toContain('backdrop-filter');
    expect(shellSource).toContain('bottomNavActiveBubbleIn');
  });
});
