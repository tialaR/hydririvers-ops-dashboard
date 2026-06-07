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
  'prefetch',
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
    prefetch,
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
    expect(bottomNavHyLightClassNames.activeBubbleSurface).toBeTruthy();
    expect(bottomNavHyLightClassNames.activeBubbleRim).toBeTruthy();
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

  it('usa Motion com layoutId local, spring de press e LayoutGroup', () => {
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
    expect(motionSource).toContain('LayoutGroup');
    expect(motionSource).toContain('BOTTOM_NAV_ACTIVE_PILL_LAYOUT_ID');
    expect(motionSource).toContain('bottomNavPillSpring');
    expect(motionSource).toContain('bottomNavContentSpring');
    expect(motionSource).toContain('bottomNavBubblePressInSpring');
    expect(motionSource).toContain('bottomNavBubblePressOutSpring');
    expect(motionSource).toContain('BOTTOM_NAV_BUBBLE_PRESS_SCALE_Y');
    expect(motionSource).toContain('BOTTOM_NAV_ACTIVE_ICON_PRESS_SCALE = 1.04');
    expect(motionSource).toContain('BOTTOM_NAV_BUBBLE_PRESS_SCALE_X = 1.02');
    expect(motionSource).toContain('BOTTOM_NAV_ROUTE_COMMIT_SCALE_X = 1.04');
    expect(motionSource).toContain('BOTTOM_NAV_ROUTE_COMMIT_SCALE_Y = 1.14');
    expect(motionSource).toContain('BOTTOM_NAV_ROUTE_COMMIT_TRANSLATE_Y_REM = -0.09375');
    expect(motionSource).toContain('bottomNavRouteCommitSpring');
    expect(motionSource).toContain('useBottomNavRouteCommitNonce');
    expect(motionSource).toContain('useBottomNavRouteCommitCycle');
    expect(motionSource).toContain('BOTTOM_NAV_ROUTE_COMMIT_DURATION_MS');
    expect(motionSource).toContain('BOTTOM_NAV_ROUTE_COMMIT_PEAK_MS = 420');
    expect(motionSource).toContain('bottomNavActiveIconPressScale');
    expect(motionSource).toContain('stiffness: 350');
    expect(motionSource).toContain('damping: 30');
    expect(motionSource).toContain('useReducedMotion');
    expect(motionSource).not.toContain('framer-motion');
    expect(gooeySource).toContain('BottomNavActivePill');
    expect(gooeySource).toContain('HyLiquidGlassPillLayers');
    expect(gooeySource).toContain('data-hy-liquid-glass-surface');
    expect(gooeySource).toContain('data-hy-liquid-glass-rim');
    expect(gooeySource).not.toContain('data-hy-liquid-glass-refraction');
    expect(gooeySource).toContain('layoutId={BOTTOM_NAV_ACTIVE_PILL_LAYOUT_ID}');
    expect(gooeySource).toContain('layout="position"');
    expect(gooeySource).toContain('data-bottom-nav-route-commit');
    expect(gooeySource).toContain('data-bottom-nav-route-commit-peak');
    expect(gooeySource).toContain('data-hy-liquid-commit');
    expect(gooeySource).toContain('isRouteCommitCycle');
    expect(gooeySource).toContain('scaleX');
    expect(gooeySource).toContain('scaleY');
    expect(navSource).toContain('BottomNavActivePill');
    expect(navSource).toContain('LayoutGroup');
    expect(navSource).toContain('isRouteActive');
    expect(navSource).toContain('routeCommitNonce');
    expect(navSource).toContain('routeCommitNonceForItem');
    expect(navSource).toContain('isRouteCommitCycle');
    expect(navSource).toContain('BOTTOM_NAV_ROUTE_COMMIT_ICON_LIFT_REM');
    expect(navSource).not.toContain('useBottomNavGooeyPillTransition');
    expect(navSource).not.toContain('gooeyTrack');
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

  it('expõe reduced motion via data attrs', () => {
    const html = renderToStaticMarkup(
      <BottomNav
        activeId="cargo"
        classNames={classNames}
        items={[{ id: 'cargo', label: 'Cargas', icon: <span>C</span> }]}
      />,
    );

    expect(html).toContain('data-hy-bottom-nav-reduced-motion="false"');
    expect(html).not.toContain('data-hy-bottom-nav-gooey');
    expect(html).not.toContain('id="hy-bottom-nav-goo"');
  });

  it('liquid glass shell HY usa segmented pill local e pending glow neutro', () => {
    const shellSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/bottom-nav-hy-light-shell.module.sass'),
      'utf8',
    );
    const tokensSource = readFileSync(
      resolve(process.cwd(), 'src/shared/styles/tokens/_hy-v2-light.scss'),
      'utf8',
    );

    expect(shellSource).toContain('backdrop-filter');
    expect(shellSource).toContain('--v2-surface-bottom-nav: transparent');
    expect(shellSource).toContain('--hy-color-bottom-nav-active-icon');
    expect(shellSource).toContain('--hy-color-bottom-nav-shell-surface');
    expect(shellSource).toContain('data-bottom-nav-bubble-pressing');
    expect(shellSource).toContain('data-bottom-nav-pending');
    expect(shellSource).toContain('.pendingGlow');
    expect(shellSource).toContain('--hy-color-bottom-nav-pending-glow');
    expect(shellSource).toContain('.activeBubbleSurface');
    expect(shellSource).toContain('.activeBubbleRim');
    expect(shellSource).toContain('data-bottom-nav-route-commit');
    expect(shellSource).toContain('data-bottom-nav-route-commit-peak');
    expect(shellSource).toContain('--hy-motion-bottom-nav-route-commit-duration');
    expect(shellSource).toContain('data-bottom-nav-bubble-pressing');
    expect(shellSource).toContain('minmax(0, 1fr)');
    expect(shellSource).toContain('overflow: visible');
    expect(shellSource).not.toContain('text-overflow: ellipsis');
    expect(readFileSync(resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.module.sass'), 'utf8')).toContain(
      'display: contents',
    );
    expect(readFileSync(resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.tsx'), 'utf8')).not.toContain(
      'feComposite',
    );
    expect(shellSource).not.toContain('--hy-size-bottom-nav-active-bubble-width');
    expect(shellSource).not.toContain('color: #ffffff');
    expect(shellSource).not.toContain('data-bottom-nav-gooey-track');
    expect(tokensSource).toContain('--hy-color-bottom-nav-active-icon: #0f172a');
    expect(tokensSource).toContain('--hy-motion-bottom-nav-route-commit-duration');
    expect(tokensSource).toContain('--hy-shadow-bottom-nav-active-pill-commit');
    expect(tokensSource).toContain('--hy-shadow-bottom-nav-active-pill-commit-peak');
    expect(tokensSource).not.toContain('--hy-color-bottom-nav-active-liquid-glow: rgba(37, 99, 235');
    expect(tokensSource).not.toContain('rgba(30, 64, 175');
    expect(tokensSource).not.toContain('--hy-color-bottom-nav-press-glow: rgba(59, 130, 246');
    expect(tokensSource).not.toContain('--hy-color-bottom-nav-active-liquid-glow: rgba(59, 130, 246');
  });

  it('reduced motion desliga pending shimmer', () => {
    const navSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.tsx'),
      'utf8',
    );
    const shellSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/bottom-nav-hy-light-shell.module.sass'),
      'utf8',
    );

    expect(navSource).toContain('data-hy-bottom-nav-reduced-motion');
    expect(shellSource).toContain('[data-hy-bottom-nav-reduced-motion');
    expect(shellSource).toContain('animation: none');
    expect(shellSource).toContain('filter: none');
  });

  it('pill HY renderiza camadas liquid glass surface e rim no DOM', () => {
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
          activeBubbleSurface: bottomNavHyLightClassNames.activeBubbleSurface,
          activeBubbleRim: bottomNavHyLightClassNames.activeBubbleRim,
          activeLiquidLayer: bottomNavHyLightClassNames.activeLiquidLayer,
          activeIcon: bottomNavHyLightClassNames.activeIcon,
          activeLabel: bottomNavHyLightClassNames.activeLabel,
          pendingGlow: bottomNavHyLightClassNames.pendingGlow,
        }}
        items={[{ id: 'cargo', label: 'Cargas', iconOutlined: <span>C</span> }]}
      />,
    );

    expect(html).toContain('data-hy-liquid-glass-surface="true"');
    expect(html).toContain('data-hy-liquid-glass-rim="true"');
    expect(html).not.toContain('data-hy-liquid-glass-refraction="true"');
    expect(html).toContain(bottomNavHyLightClassNames.activeBubbleSurface);
    expect(html).toContain(bottomNavHyLightClassNames.activeBubbleRim);
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

  it('shell HY centraliza na viewport com left 50% e translateX', () => {
    const shellSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/bottom-nav-hy-light-shell.module.sass'),
      'utf8',
    );
    const tokensSource = readFileSync(
      resolve(process.cwd(), 'src/shared/styles/tokens/_hy-v2-light.scss'),
      'utf8',
    );

    expect(shellSource).toContain('left: 50%');
    expect(shellSource).toContain('transform: translateX(-50%)');
    expect(shellSource).toContain('--hy-spacing-bottom-nav-margin-inline');
    expect(shellSource).not.toMatch(/right:\s*max\(/);
    expect(tokensSource).toContain('--hy-spacing-bottom-nav-margin-inline: 0.75rem');
  });

  it('route commit morph dispara somente quando activeId confirmado muda', () => {
    const motionSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/bottom-nav-motion.tsx'),
      'utf8',
    );
    const navSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.tsx'),
      'utf8',
    );
    const gooeySource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/bottom-nav-gooey-pill.tsx'),
      'utf8',
    );

    expect(motionSource).toContain('useBottomNavRouteCommitNonce');
    expect(motionSource).toContain('previousActiveIdRef');
    expect(motionSource).toContain('BOTTOM_NAV_ROUTE_COMMIT_DURATION_MS');
    expect(motionSource).toContain('BOTTOM_NAV_ROUTE_COMMIT_PEAK_MS = 420');
    expect(motionSource).toContain('useBottomNavRouteCommitCycle');
    expect(navSource).toContain('useBottomNavRouteCommitNonce(activeId)');
    expect(navSource).toContain('routeCommitNonceForItem');
    expect(navSource).toContain('isRouteCommitCycle');
    expect(navSource).toContain('BOTTOM_NAV_ROUTE_COMMIT_ICON_SCALE');
    expect(gooeySource).toContain('isRouteCommitCycle');
    expect(gooeySource).toContain('bottomNavRouteCommitSpring');
    expect(gooeySource).toContain('BOTTOM_NAV_ROUTE_COMMIT_SCALE_X');
    expect(gooeySource).toMatch(/if \(isRouteCommitAnimating\) \{[\s\S]*scaleX: BOTTOM_NAV_ROUTE_COMMIT_SCALE_X/);
    expect(gooeySource).toContain("data-bottom-nav-route-commit={isRouteCommitCycle ? 'true' : undefined}");
    expect(gooeySource).toContain("data-hy-liquid-commit={liquidCommitActive ? 'true' : undefined}");
    expect(navSource).toContain('isRouteCommitCycle={isRouteCommitCycle}');
    expect(resolveVisualActiveId('cargos', 'negotiations')).toBe('cargos');
  });

  it('shell e grid permanecem estáveis — morph só na pill local', () => {
    const shellSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/bottom-nav-hy-light-shell.module.sass'),
      'utf8',
    );
    const navModuleSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.module.sass'),
      'utf8',
    );
    const gooeySource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/bottom-nav-gooey-pill.tsx'),
      'utf8',
    );
    const motionSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/bottom-nav-motion.tsx'),
      'utf8',
    );

    const shellBlock = shellSource.match(/^\.shell[\s\S]*?(?=^\.item)/m)?.[0] ?? '';

    expect(shellBlock).toContain('transform: translateX(-50%)');
    expect(shellBlock).not.toContain('data-bottom-nav-route-commit');
    expect(shellBlock).not.toMatch(/scale\(/);
    expect(shellBlock).toContain('grid-template-columns: repeat(var(--hy-bottom-nav-item-count, 5), minmax(0, 1fr))');
    expect(shellBlock).toContain('overflow: visible');
    expect(navModuleSource).toContain('.pillSlot');
    expect(navModuleSource).toContain('overflow: visible');
    expect(shellSource).toContain('.itemActive');
    expect(gooeySource).toContain('layout="position"');
    expect(gooeySource).toContain('BOTTOM_NAV_ROUTE_COMMIT_SCALE_X');
    expect(motionSource).toContain('BOTTOM_NAV_ROUTE_COMMIT_SCALE_X = 1.04');
    expect(motionSource).not.toContain('BOTTOM_NAV_ROUTE_COMMIT_SCALE_X = 1.15');
    expect(shellSource).toMatch(/\.itemActive[\s\S]*overflow: visible/);
    expect(gooeySource).toContain('BOTTOM_NAV_ROUTE_COMMIT_TRANSLATE_Y_REM');
  });

  it('renderiza label longa Negociações inteira no DOM', () => {
    const html = renderToStaticMarkup(
      <BottomNav
        activeId="negotiations"
        classNames={{
          ...classNames,
          label: bottomNavHyLightClassNames.label,
          activeLabel: bottomNavHyLightClassNames.activeLabel,
        }}
        items={[
          { id: 'cargos', label: 'Cargas', icon: <span>C</span>, href: '/cargas' },
          { id: 'negotiations', label: 'Negociações', icon: <span>N</span>, href: '/negociacoes' },
          { id: 'dashboard', label: 'Dashboard', icon: <span>D</span>, href: '/dashboard' },
        ]}
      />,
    );

    expect(html).toContain('>Negociações<');
    expect(html).toContain('>Dashboard<');
    expect(html).not.toContain('Negociaç…');
    expect(html).not.toContain('Negociaç...');
  });

  it('content layer fica fora da pill decorativa e pill permanece aria-hidden', () => {
    const html = renderToStaticMarkup(
      <BottomNav
        activeId="cargos"
        classNames={classNames}
        items={[{ id: 'cargos', label: 'Cargas', icon: <span>C</span>, href: '/cargas' }]}
      />,
    );

    const pillSlotIndex = html.indexOf('data-bottom-nav-pill-slot="true"');
    const contentLayerIndex = html.indexOf('data-bottom-nav-content-layer="true"');
    const bubbleIndex = html.indexOf('data-bottom-nav-active-bubble="true"');

    expect(pillSlotIndex).toBeGreaterThan(-1);
    expect(contentLayerIndex).toBeGreaterThan(pillSlotIndex);
    expect(bubbleIndex).toBeGreaterThan(-1);
    expect(bubbleIndex).toBeLessThan(contentLayerIndex);
    expect(html).toContain('aria-hidden="true"');
  });

  it('pending não renderiza active pill — só rota confirmada', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.tsx'),
      'utf8',
    );

    expect(source).toContain('const activePill = isRouteActive ?');
    expect(source).not.toMatch(/activePill = isVisualActive/);
    expect(source).not.toContain('gooeyTrack');
    expect(source).not.toContain('useBottomNavGooeyPillTransition');
  });

  it('pill decorativa vive dentro do item ativo — conteúdo icon/label acima', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.tsx'),
      'utf8',
    );
    const gooeySource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/bottom-nav-gooey-pill.tsx'),
      'utf8',
    );

    expect(source).toContain('BottomNavActivePill');
    expect(source).toContain('isRouteActive');
    expect(source).toContain('data-bottom-nav-pill-slot');
    expect(source).toContain('data-bottom-nav-content-layer');
    expect(source).toContain('className={classNames.activeIcon}');
    expect(gooeySource).toContain('layoutId={BOTTOM_NAV_ACTIVE_PILL_LAYOUT_ID}');
    expect(gooeySource).toContain('layout="position"');
    expect(gooeySource).toContain('aria-hidden="true"');
    expect(gooeySource).toContain('data-bottom-nav-bubble-pressing');
    expect(source).not.toContain('gooeyTrack');
    expect(source).not.toContain('useBottomNavGooeyPillTransition');
    const contentBlock = source.match(/const content = \([\s\S]*?\n  \);/)?.[0] ?? '';
    expect(contentBlock).toContain('pillSlot');
    expect(contentBlock).toContain('contentLayer');
    expect(contentBlock).toContain('activeContent');
  });
});
