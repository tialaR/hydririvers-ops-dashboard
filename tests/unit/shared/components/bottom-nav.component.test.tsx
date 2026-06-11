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
import navStyles from '@/shared/components/bottom-nav/BottomNav.module.sass';

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
    expect(html).toContain('data-bottom-nav-preview-global="true"');
    expect(html).toContain('data-hy-bottom-nav-preview-lens="true"');
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

  it('item ativo usa ícone outlined, activeCutout glass e label no item', () => {
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
    expect(html).toContain('data-active="true"');
    expect(html).toContain('data-bottom-nav-active="true"');
    expect(html).toContain('data-testid="outlined"');
    expect(html).not.toContain('data-bottom-nav-icon-variant="filled"');
    expect(html).not.toContain('data-testid="filled"');
    expect(html).toContain('data-bottom-nav-global="true"');
    expect(html).toContain('data-bottom-nav-preview-global="true"');
    expect(html).toContain('data-hy-bottom-nav-preview-lens="true"');
    expect(html).toContain(navStyles.activeCutout);
    expect(html).toContain(navStyles.activeGlass);
    expect(html).not.toContain('data-bottom-nav-active-bubble="true"');
    expect(html).not.toContain('data-bottom-nav-pill-slot="true"');
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

    expect(html).toContain('data-bottom-nav-preview-global="true"');
    expect(html).toContain(navStyles.nav);
    expect(html).toContain(navStyles.activeCutout);
    expect(html).not.toContain(bottomNavHyLightClassNames.activeBubble);
  });

  it('implementa pending separado com Link, useLinkStatus e markers nativos', () => {
    const navSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.tsx'),
      'utf8',
    );
    const itemsSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/bottomNavItems.tsx'),
      'utf8',
    );

    expect(navSource).toContain('pendingItemId');
    expect(navSource).toContain('setPendingItemId(null)');
    expect(navSource).toContain('data-hy-bottom-nav-preview-lens="true"');
    expect(itemsSource).toContain('useLinkStatus');
    expect(itemsSource).toContain('BottomNavLinkPendingBridge');
    expect(itemsSource).toContain('onPointerDown={handlePointerDown}');
    expect(itemsSource).not.toContain('triggerIconJump');
    expect(itemsSource).toContain('data-bottom-nav-pending');
    expect(itemsSource).toContain('data-bottom-nav-pending-glow');
    expect(itemsSource).toContain('prefetch');
    expect(navSource).not.toContain('router.push');
    expect(navSource).not.toContain('scheduleNavigation');
    expect(navSource).not.toContain('navigationTimerRef');
    expect(itemsSource).not.toContain('data-bottom-nav-icon-variant="filled"');
  });

  it('usa Motion provider, activeCutout glass e stretching state no preview', () => {
    const motionSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/bottom-nav-motion.tsx'),
      'utf8',
    );
    const navSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.tsx'),
      'utf8',
    );
    const itemsSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/bottomNavItems.tsx'),
      'utf8',
    );
    const indicatorSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/useBottomNavIndicator.ts'),
      'utf8',
    );
    const navModuleSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.module.sass'),
      'utf8',
    );

    expect(motionSource).toContain('LazyMotion');
    expect(motionSource).toContain('domMax');
    expect(motionSource).toContain('LayoutGroup');
    expect(motionSource).toContain('bottomNavPressSpring');
    expect(motionSource).toContain('useReducedMotion');
    expect(motionSource).not.toContain('framer-motion');
    expect(navSource).toContain('BottomNavMotionProvider');
    expect(navSource).toContain('useBottomNavIndicator');
    expect(navSource).toContain('data-hy-bottom-nav-preview-lens="true"');
    expect(navSource).toContain('data-hy-bottom-nav-moving');
    expect(navSource).toContain('isStretching');
    expect(itemsSource).toContain('MotionLink');
    expect(itemsSource).toContain('MotionButton');
    expect(itemsSource).toContain('isRouteActive');
    expect(indicatorSource).toContain('stretchPreviousIndexRef');
    expect(indicatorSource).toContain('jumpPreviousIndexRef');
    expect(indicatorSource).toContain('skipInitialJumpRef');
    expect(indicatorSource).toContain('triggerIconJump');
    expect(indicatorSource).toContain('setIsStretching(true)');
    expect(indicatorSource).toContain('measureBottomNavSelectionWidth');
    expect(indicatorSource).toContain('selectionWidth');
    expect(indicatorSource).not.toContain('setActiveWidth');
    expect(navSource).not.toContain('BottomNavActivePill');
    expect(navSource).not.toContain('routeCommitNonceForItem');
    expect(navSource).not.toContain('data-bottom-nav-pill-slot');
    expect(navSource).not.toContain('data-bottom-nav-active-bubble');
    expect(navModuleSource).toContain('.activeCutout');
    expect(navModuleSource).toContain('.activeGlass');
    expect(navModuleSource).toContain('translate3d(var(--active-x)');
    expect(navModuleSource).toContain("[data-hy-bottom-nav-moving='true']");
  });

  it('não define pending em modified click', () => {
    expect(shouldBypassPressFeedback({ metaKey: true, ctrlKey: false, shiftKey: false, altKey: false, button: 0 } as MouseEvent)).toBe(true);
    expect(shouldBypassPressFeedback({ metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, button: 0 } as MouseEvent)).toBe(false);

    const itemsSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/bottomNavItems.tsx'),
      'utf8',
    );
    expect(itemsSource).toContain('shouldBypassPressFeedback(event)');
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
    expect(html).toContain('data-bottom-nav-active="true"');
    expect(html).toContain('data-hy-bottom-nav-preview-lens="true"');
    expect(html).toContain('data-bottom-nav-item="negotiations"');
    expect(html).toContain('data-active="false"');
    expect(html).not.toMatch(/data-bottom-nav-item="negotiations"[^>]*aria-current="page"/);
  });

  it('preview global não expõe gooey legacy nem reduced-motion attrs no nav', () => {
    const html = renderToStaticMarkup(
      <BottomNav
        activeId="cargo"
        classNames={classNames}
        items={[{ id: 'cargo', label: 'Cargas', icon: <span>C</span> }]}
      />,
    );
    const navModuleSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.module.sass'),
      'utf8',
    );

    expect(html).toContain('data-bottom-nav-preview-global="true"');
    expect(html).not.toContain('data-hy-bottom-nav-reduced-motion');
    expect(html).not.toContain('data-hy-bottom-nav-gooey');
    expect(html).not.toContain('id="hy-bottom-nav-goo"');
    expect(navModuleSource).toContain('@media (prefers-reduced-motion: reduce)');
    expect(navModuleSource).toContain('.activeCutout');
  });

  it('preview global usa activeCutout glass, icon jump e pending glow no módulo novo', () => {
    const navModuleSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.module.sass'),
      'utf8',
    );
    const navSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.tsx'),
      'utf8',
    );
    const itemsSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/bottomNavItems.tsx'),
      'utf8',
    );

    expect(navModuleSource).toContain('backdrop-filter');
    expect(navModuleSource).toContain('.activeCutout');
    expect(navModuleSource).toContain('.activeGlass');
    expect(navModuleSource).toContain('.iconJumpActive');
    expect(navModuleSource).toContain('@keyframes simpleIconJump');
    expect(navModuleSource).toContain('@keyframes activeGlassStretch');
    expect(navModuleSource).toContain('.pendingGlow');
    expect(navModuleSource).toContain('bottom-nav-light-tokens');
    expect(navModuleSource).toContain('var(--bn-shell-blur)');
    expect(navModuleSource).not.toContain('.pillSlot');
    expect(navModuleSource).not.toContain('.activeBubble');
    expect(itemsSource).toContain('data-bottom-nav-pending-glow');
    expect(navSource).toContain('data-hy-bottom-nav-preview-lens="true"');
    expect(navSource).not.toContain('BottomNavActivePill');
    expect(navSource).not.toContain('feComposite');
    expect(navSource).not.toContain('data-bottom-nav-gooey-track');
  });

  it('reduced motion desliga transição do activeCutout preview global', () => {
    const navModuleSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.module.sass'),
      'utf8',
    );

    expect(navModuleSource).toContain('@media (prefers-reduced-motion: reduce)');
    expect(navModuleSource).toContain('.activeCutout');
    expect(navModuleSource).toContain('.activeGlass');
    expect(navModuleSource).toContain('transition: none');
    expect(navModuleSource).toContain("[data-hy-bottom-nav-moving='true'] .activeGlass");
    expect(navModuleSource).toContain('animation: none');
  });

  it('activeCutout glass renderiza no DOM', () => {
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

    expect(html).toContain('data-hy-bottom-nav-preview-lens="true"');
    expect(html).toContain(navStyles.activeCutout);
    expect(html).toContain(navStyles.activeGlass);
    expect(html).not.toContain('data-hy-liquid-glass-surface="true"');
    expect(html).not.toContain('data-hy-liquid-glass-rim="true"');
    expect(html).not.toContain(bottomNavHyLightClassNames.activeBubbleSurface);
    expect(html).not.toContain(bottomNavHyLightClassNames.activeBubbleRim);
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

  it('stretching state dispara somente quando activeIndex muda', () => {
    const navSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.tsx'),
      'utf8',
    );
    const indicatorSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/useBottomNavIndicator.ts'),
      'utf8',
    );
    const navModuleSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.module.sass'),
      'utf8',
    );

    expect(indicatorSource).toContain('stretchPreviousIndexRef');
    expect(indicatorSource).toContain('skipInitialJumpRef');
    expect(indicatorSource).toContain('setIsStretching(true)');
    expect(indicatorSource).toContain('setIsStretching(false)');
    expect(navSource).toContain('data-hy-bottom-nav-moving');
    expect(navSource).toContain('isStretching');
    expect(navSource).not.toContain('useBottomNavRouteCommitNonce');
    expect(navSource).not.toContain('routeCommitNonceForItem');
    expect(navSource).not.toContain('isRouteCommitCycle');
    expect(navModuleSource).toContain('.activeCutout');
    expect(navModuleSource).toContain('var(--bn-motion-cutout-duration)');
    expect(navModuleSource).toContain("[data-hy-bottom-nav-moving='true']");
    expect(navModuleSource).toContain('@keyframes activeGlassStretch');
    expect(resolveVisualActiveId('cargos', 'negotiations')).toBe('cargos');
  });

  it('nav grid permanece estável — morph só no activeGlass', () => {
    const navModuleSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.module.sass'),
      'utf8',
    );
    const navSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.tsx'),
      'utf8',
    );

    const navBlock = navModuleSource.match(/^\.nav[\s\S]*?(?=^\.activeCutout)/m)?.[0] ?? '';

    expect(navBlock).toContain('display: grid');
    expect(navBlock).toContain('grid-template-columns: repeat(5, minmax(0, 1fr))');
    expect(navBlock).toContain('bottom-nav-light-tokens');
    expect(navBlock).toContain('width: min(calc(100vw - calc(var(--menu-margin-inline) * 2))');
    expect(navBlock).toContain('--menu-measured-min-width');
    expect(navBlock).toContain('--menu-max-width');
    expect(navBlock).not.toContain('data-bottom-nav-route-commit');
    expect(navModuleSource).toContain('.activeCutout');
    expect(navModuleSource).not.toContain('.pillSlot');
    expect(navModuleSource).toContain("[data-hy-bottom-nav-moving='true'] .activeGlass");
    expect(navModuleSource).toContain('@keyframes activeGlassStretch');
    expect(navSource).not.toContain('BottomNavActivePill');
    expect(navSource).not.toContain('data-bottom-nav-pill-slot');
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

  it('activeCutout fica fora dos itens e permanece aria-hidden', () => {
    const html = renderToStaticMarkup(
      <BottomNav
        activeId="cargos"
        classNames={classNames}
        items={[{ id: 'cargos', label: 'Cargas', icon: <span>C</span>, href: '/cargas' }]}
      />,
    );

    const lensIndex = html.indexOf('data-hy-bottom-nav-preview-lens="true"');
    const itemIndex = html.indexOf('data-bottom-nav-item="cargos"');

    expect(lensIndex).toBeGreaterThan(-1);
    expect(itemIndex).toBeGreaterThan(lensIndex);
    expect(html).not.toContain('data-bottom-nav-pill-slot="true"');
    expect(html).not.toContain('data-bottom-nav-content-layer="true"');
    expect(html).not.toContain('data-bottom-nav-active-bubble="true"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain(navStyles.icon);
    expect(html).toContain(navStyles.label);
  });

  it('preview global não renderiza pill local — activeCutout é sempre decorativo', () => {
    const navSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.tsx'),
      'utf8',
    );
    const itemsSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/bottomNavItems.tsx'),
      'utf8',
    );

    expect(navSource).toContain('data-hy-bottom-nav-preview-lens="true"');
    expect(itemsSource).toContain('isRouteActive');
    expect(navSource).not.toContain('activePill');
    expect(navSource).not.toContain('BottomNavActivePill');
    expect(navSource).not.toContain('data-bottom-nav-pill-slot');
    expect(navSource).not.toContain('gooeyTrack');
    expect(navSource).not.toContain('useBottomNavGooeyPillTransition');
  });

  it('arquitetura antiga da pill local não existe — activeCutout global e icon/label no item', () => {
    const navSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.tsx'),
      'utf8',
    );
    const itemsSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/bottomNavItems.tsx'),
      'utf8',
    );
    const navModuleSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.module.sass'),
      'utf8',
    );

    expect(navSource).not.toContain('BottomNavActivePill');
    expect(navSource).not.toContain('data-bottom-nav-pill-slot');
    expect(navSource).not.toContain('data-bottom-nav-content-layer');
    expect(navSource).not.toContain('data-bottom-nav-active-bubble');
    expect(navSource).toContain('data-hy-bottom-nav-preview-lens="true"');
    expect(navSource).toContain('className={styles.activeCutout}');
    expect(itemsSource).toContain('styles.icon');
    expect(itemsSource).toContain('styles.label');
    expect(itemsSource).toContain('styles.iconJumpActive');
    expect(navModuleSource).toContain('.activeCutout');
    expect(navModuleSource).not.toContain('.pillSlot');
    const contentBlock = itemsSource.match(/const content = \([\s\S]*?\n  \);/)?.[0] ?? '';
    expect(contentBlock).toContain('styles.icon');
    expect(contentBlock).toContain('styles.label');
    expect(contentBlock).not.toContain('pillSlot');
    expect(contentBlock).not.toContain('contentLayer');
    expect(contentBlock).not.toContain('activeContent');
  });

  it('pill único mede todos os itens e centraliza no ativo', () => {
    const measurementSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/bottom-nav-measurement.ts'),
      'utf8',
    );
    const indicatorSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/useBottomNavIndicator.ts'),
      'utf8',
    );
    const itemsSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/bottomNavItems.tsx'),
      'utf8',
    );
    const navSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.tsx'),
      'utf8',
    );

    expect(measurementSource).toContain('measureBottomNavSelectionWidth');
    expect(measurementSource).toContain('measureBottomNavItemContentWidth');
    expect(measurementSource).toContain('computeBottomNavActiveX');
    expect(measurementSource).toContain('computeBottomNavContainerMinWidth');
    expect(measurementSource).not.toMatch(/\.querySelector\(/);
    expect(indicatorSource).toContain('itemRefs.current.values()');
    expect(indicatorSource).toContain('measureLayout');
    expect(indicatorSource).toContain('measureContainerMinWidth');
    expect(indicatorSource).toContain('--active-width');
    expect(indicatorSource).toContain('--menu-measured-min-width');
    expect(indicatorSource).not.toContain('itemRect.width');
    expect(itemsSource).toContain('data-bottom-nav-label-measure="true"');
    expect(navSource).toContain('items.length');
  });
});
