import { createElement, type MouseEvent, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import {
  BottomNav,
  bottomNavHyLightClassNames,
  bottomNavV2LightClassNames,
  isBottomNavItemPending,
  resolveVisualActiveId,
  shouldBypassPressFeedback,
  type BottomNavProps,
} from '@/shared/components/bottom-nav';

vi.mock('next-intl', () => ({
  useLocale: () => 'pt-BR',
}));

vi.mock('next/link', () => ({
  useLinkStatus: () => ({ pending: false }),
}));

const MOTION_DOM_STRIP_PROPS = new Set([
  'whileTap',
  'animate',
  'initial',
  'exit',
  'transition',
  'layout',
  'layoutId',
  'variants',
  'onAnimationStart',
  'onAnimationComplete',
]);

vi.mock('motion/react', () => {
  function passthrough(Tag: string) {
    const Component = ({ children, ...rest }: { children?: ReactNode; [key: string]: unknown }) => {
      const domProps = Object.fromEntries(
        Object.entries(rest).filter(([key]) => !MOTION_DOM_STRIP_PROPS.has(key)),
      );
      return createElement(Tag, domProps, children);
    };
    Component.displayName = `MotionMock${Tag}`;
    return Component;
  }

  return {
    LazyMotion: ({ children }: { children: ReactNode }) => createElement('div', null, children),
    LayoutGroup: ({ children }: { children: ReactNode }) => createElement('div', null, children),
    domAnimation: {},
    domMax: {},
    m: {
      span: passthrough('span'),
      button: passthrough('button'),
      create: () => passthrough('a'),
    },
    useReducedMotion: () => false,
  };
});

vi.mock('@/core/i18n/navigation', () => ({
  Link: ({
    href,
    children,
    className,
    prefetch: _prefetch,
    ...rest
  }: {
    href: string;
    children: ReactNode;
    className?: string;
    prefetch?: boolean;
  }) => (
    <a href={href} className={className} {...rest}>
      {children}
    </a>
  ),
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
  pendingGlow: 'pending-glow',
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
    expect(html).toContain('data-bottom-nav-active-bubble="true"');
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
    expect(html).toContain('aria-current="page"');
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

  it('item ativo usa ícone outlined, bolha decorativa e label acima da pill', () => {
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
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('data-bottom-nav-active-bubble="true"');
  });

  it('exporta casca visual HY light premium para reuso', () => {
    expect(bottomNavHyLightClassNames.shell).toBeTruthy();
    expect(bottomNavHyLightClassNames.item).toBeTruthy();
    expect(bottomNavHyLightClassNames.activeBubble).toBeTruthy();
    expect(bottomNavHyLightClassNames.activeLiquidLayer).toBeTruthy();
    expect(bottomNavHyLightClassNames.pendingGlow).toBeTruthy();
    expect(bottomNavV2LightClassNames.shell).toBe(bottomNavHyLightClassNames.shell);

    const html = renderToStaticMarkup(
      <BottomNav
        className={bottomNavHyLightClassNames.shell}
        activeId="cargo"
        classNames={{
          item: bottomNavHyLightClassNames.item,
          itemActive: bottomNavHyLightClassNames.itemActive,
          icon: bottomNavHyLightClassNames.icon,
          label: bottomNavHyLightClassNames.label,
          activeBubble: bottomNavHyLightClassNames.activeBubble,
          activeIcon: bottomNavHyLightClassNames.activeIcon,
          activeLabel: bottomNavHyLightClassNames.activeLabel,
          pendingGlow: bottomNavHyLightClassNames.pendingGlow,
        }}
        items={[{ id: 'cargo', label: 'Cargas', iconOutlined: <span>C</span> }]}
      />,
    );

    expect(html).toContain(bottomNavHyLightClassNames.shell);
    expect(html).toContain(bottomNavHyLightClassNames.activeBubble);
  });

  it('implementa pending separado com Link, useLinkStatus e markers nativos', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.tsx'),
      'utf8',
    );

    expect(source).toContain('pendingItemId');
    expect(source).toContain('useLinkStatus');
    expect(source).toContain('BottomNavLinkPendingBridge');
    expect(source).toContain('setPendingItemId(null)');
    expect(source).toContain('onPointerDown={handlePointerDown}');
    expect(source).toContain('data-bottom-nav-pending');
    expect(source).toContain('data-bottom-nav-glass="true"');
    expect(source).toContain('prefetch');
    expect(source).not.toContain('router.push');
    expect(source).not.toContain('scheduleNavigation');
    expect(source).not.toContain('navigationTimerRef');
    expect(source).not.toContain('data-bottom-nav-icon-variant="filled"');
  });

  it('usa Motion com spring medido para pill gooey (head + tail)', () => {
    const motionSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/bottom-nav-motion.tsx'),
      'utf8',
    );
    const gooeySource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/bottom-nav-gooey-pill.tsx'),
      'utf8',
    );
    const navSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.tsx'),
      'utf8',
    );

    expect(motionSource).toContain('LazyMotion');
    expect(motionSource).toContain('domMax');
    expect(motionSource).toContain('bottomNavPillSpring');
    expect(motionSource).toContain('bottomNavContentSpring');
    expect(motionSource).toContain('bottomNavBubblePressInSpring');
    expect(motionSource).toContain('bottomNavBubblePressOutSpring');
    expect(motionSource).toContain('BOTTOM_NAV_BUBBLE_PRESS_SCALE_Y');
    expect(motionSource).toContain('BOTTOM_NAV_ACTIVE_ICON_PRESS_SCALE');
    expect(motionSource).toContain('bottomNavActiveIconPressScale');
    expect(motionSource).toContain('useReducedMotion');
    expect(motionSource).not.toContain('framer-motion');
    expect(gooeySource).toContain('useBottomNavGooeyPillTransition');
    expect(gooeySource).toContain('tailMetrics');
    expect(gooeySource).toContain('measureBottomNavGooeyPill');
    expect(navSource).toContain('BottomNavGooeyPillLayer');
    expect(navSource).toContain('onBubblePressStart');
    expect(navSource).toContain('bubblePressItemId === visualActiveId');
    expect(navSource).not.toContain('MotionActivePill');
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
    expect(resolveVisualActiveId('cargos', 'negotiations')).toBe('cargos');
    expect(isBottomNavItemPending('negotiations', 'cargos', 'negotiations')).toBe(true);
  });

  it('active visual permanece na rota confirmada enquanto pending aponta destino', () => {
    const html = renderToStaticMarkup(
      <BottomNav
        activeId="cargos"
        classNames={classNames}
        items={[
          { id: 'cargos', label: 'Cargas', icon: <span>C</span>, href: '/cargas' },
          { id: 'negotiations', label: 'Negociações', icon: <span>N</span>, href: '/negociacoes' },
        ]}
      />,
    );

    expect(html).toContain('data-bottom-nav-item="cargos"');
    expect(html).toContain('data-active="true"');
    expect(html).toContain('data-bottom-nav-active-bubble="true"');
    expect(html).toContain('data-bottom-nav-item="negotiations"');
    expect(html).toContain('data-active="false"');
    expect(html).not.toMatch(/data-bottom-nav-item="negotiations"[^>]*aria-current="page"/);
  });

  it('expõe gooey controlado e reduced motion via data attrs', () => {
    const html = renderToStaticMarkup(
      <BottomNav
        activeId="cargo"
        classNames={classNames}
        items={[{ id: 'cargo', label: 'Cargas', icon: <span>C</span> }]}
      />,
    );

    expect(html).toContain('data-hy-bottom-nav-gooey="true"');
    expect(html).toContain('data-hy-bottom-nav-reduced-motion="false"');
    expect(html).toContain('id="hy-bottom-nav-goo"');
  });

  it('liquid glass shell HY usa gooey na camada decorativa e pending glow', () => {
    const shellSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/bottom-nav-hy-light-shell.module.sass'),
      'utf8',
    );

    expect(shellSource).toContain('backdrop-filter');
    expect(shellSource).toContain('--v2-surface-bottom-nav: transparent');
    expect(shellSource).toContain('--hy-color-bottom-nav-active-icon');
    expect(shellSource).toContain('--hy-color-bottom-nav-shell-surface');
    expect(shellSource).toContain('data-bottom-nav-bubble-pressing');
    expect(shellSource).toContain('data-bottom-nav-pending');
    expect(shellSource).toContain('.pendingGlow');
    expect(shellSource).toContain('hy-bottom-nav-gooey');
    expect(shellSource).toContain('--hy-color-bottom-nav-pending-glow');
    expect(shellSource).toContain('.activeLiquidLayer');
    expect(shellSource).toContain('data-bottom-nav-gooey-track');
    expect(readFileSync(resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.module.sass'), 'utf8')).toContain(
      "filter: url('#hy-bottom-nav-goo')",
    );
    expect(readFileSync(resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.tsx'), 'utf8')).toContain(
      'feComposite',
    );
    expect(readFileSync(resolve(process.cwd(), 'src/shared/components/bottom-nav/bottom-nav-gooey-pill.tsx'), 'utf8')).toContain(
      'data-bottom-nav-active-bubble-tail',
    );
    expect(shellSource).not.toContain('--hy-size-bottom-nav-active-bubble-width');
    expect(shellSource).not.toContain('color: #ffffff');
  });

  it('reduced motion desliga gooey e pending shimmer', () => {
    const navSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.tsx'),
      'utf8',
    );
    const shellSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/bottom-nav-hy-light-shell.module.sass'),
      'utf8',
    );

    expect(navSource).toContain('gooeyEnabled = !reducedMotion');
    expect(navSource).toContain('data-hy-bottom-nav-reduced-motion');
    expect(shellSource).toContain('[data-hy-bottom-nav-reduced-motion');
    expect(shellSource).toContain('animation: none');
    expect(shellSource).toContain('filter: none');
  });

  it('aria-current só no item com rota confirmada', () => {
    const html = renderToStaticMarkup(
      <BottomNav
        activeId="cargos"
        classNames={classNames}
        items={[
          { id: 'cargos', label: 'Cargas', icon: <span>C</span>, href: '/cargas' },
          { id: 'negotiations', label: 'Negociações', icon: <span>N</span>, href: '/negociacoes' },
        ]}
      />,
    );

    const cargosMatch = html.match(/data-bottom-nav-item="cargos"[^>]*aria-current="page"/);
    expect(cargosMatch).toBeTruthy();
    expect(html).not.toMatch(/data-bottom-nav-item="negotiations"[^>]*aria-current="page"/);
  });

  it('pill decorativa vive no gooey track absoluto — conteúdo icon/label nos items', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.tsx'),
      'utf8',
    );
    const gooeySource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/bottom-nav-gooey-pill.tsx'),
      'utf8',
    );

    expect(source).toContain('data-bottom-nav-gooey-track');
    expect(source).toContain('useBottomNavGooeyPillTransition');
    expect(source).toContain('className={classNames.activeIcon}');
    expect(gooeySource).toContain('BottomNavGooeyPillLayer');
    expect(gooeySource).toContain('tailMetrics');
    expect(gooeySource).toContain('scaleX');
    expect(gooeySource).toContain('scaleY');
    expect(gooeySource).toContain('data-bottom-nav-bubble-pressing');
    const activeContentBlock = source.match(/const activeContent = \([\s\S]*?\n  \);/)?.[0] ?? '';
    expect(activeContentBlock).not.toContain('MotionActivePill');
    expect(source).not.toContain('MotionActivePill');
  });
});
