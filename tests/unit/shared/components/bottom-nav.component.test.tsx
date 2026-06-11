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

  it('item ativo usa ícone outlined, lente preview global e label no item', () => {
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
    expect(html).toContain(navStyles.lens);
    expect(html).toContain(navStyles.waterGlow);
    expect(html).toContain(navStyles.waterSurface);
    expect(html).toContain(navStyles.waterDepth);
    expect(html).toContain(navStyles.waterDistortion);
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
    expect(html).toContain(navStyles.lens);
    expect(html).not.toContain(bottomNavHyLightClassNames.activeBubble);
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
    expect(source).toContain('data-bottom-nav-pending-glow');
    expect(source).toContain('data-hy-bottom-nav-preview-lens="true"');
    expect(source).toContain('prefetch');
    expect(source).not.toContain('router.push');
    expect(source).not.toContain('scheduleNavigation');
    expect(source).not.toContain('navigationTimerRef');
    expect(source).not.toContain('data-bottom-nav-icon-variant="filled"');
  });

  it('usa Motion provider, lente global e moving state no preview', () => {
    const motionSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/bottom-nav-motion.tsx'),
      'utf8',
    );
    const navSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.tsx'),
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
    expect(navSource).toContain('MotionLink');
    expect(navSource).toContain('MotionButton');
    expect(navSource).toContain('data-hy-bottom-nav-preview-lens="true"');
    expect(navSource).toContain('previousVisualIdRef');
    expect(navSource).toContain('setIsMoving(true)');
    expect(navSource).toContain('data-hy-bottom-nav-moving');
    expect(navSource).toContain('isRouteActive');
    expect(navSource).not.toContain('BottomNavActivePill');
    expect(navSource).not.toContain('routeCommitNonceForItem');
    expect(navSource).not.toContain('data-bottom-nav-pill-slot');
    expect(navSource).not.toContain('data-bottom-nav-active-bubble');
    expect(navModuleSource).toContain('.lens');
    expect(navModuleSource).toContain('transition-property: top, left, width, height, transform, filter');
    expect(navModuleSource).toContain("[data-hy-bottom-nav-moving='true']");
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
    expect(navModuleSource).toContain('.lens');
  });

  it('preview global usa lente decorativa, camadas water e pending glow no módulo novo', () => {
    const navModuleSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.module.sass'),
      'utf8',
    );
    const navSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.tsx'),
      'utf8',
    );

    expect(navModuleSource).toContain('backdrop-filter');
    expect(navModuleSource).toContain('.lens');
    expect(navModuleSource).toContain('.waterGlow');
    expect(navModuleSource).toContain('.waterSurface');
    expect(navModuleSource).toContain('.waterDepth');
    expect(navModuleSource).toContain('.waterDistortion');
    expect(navModuleSource).toContain('.waterEdge');
    expect(navModuleSource).toContain('.waterSpecular');
    expect(navModuleSource).toContain('.pendingGlow');
    expect(navModuleSource).toContain('minmax(0, 1fr)');
    expect(navModuleSource).toContain('overflow: visible');
    expect(navModuleSource).not.toContain('.pillSlot');
    expect(navModuleSource).not.toContain('.activeBubble');
    expect(navSource).toContain('data-bottom-nav-pending-glow');
    expect(navSource).toContain('data-hy-bottom-nav-preview-lens="true"');
    expect(navSource).not.toContain('BottomNavActivePill');
    expect(navSource).not.toContain('feComposite');
    expect(navSource).not.toContain('data-bottom-nav-gooey-track');
  });

  it('reduced motion desliga transição da lente preview global', () => {
    const navModuleSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.module.sass'),
      'utf8',
    );

    expect(navModuleSource).toContain('@media (prefers-reduced-motion: reduce)');
    expect(navModuleSource).toContain('.lens');
    expect(navModuleSource).toContain('.waterGlow');
    expect(navModuleSource).toContain('transition: none');
    expect(navModuleSource).toContain("[data-hy-bottom-nav-moving='true'] .lens");
    expect(navModuleSource).toContain('transform: none');
  });

  it('lente preview global renderiza camadas water no DOM', () => {
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
    expect(html).toContain(navStyles.lens);
    expect(html).toContain(navStyles.waterGlow);
    expect(html).toContain(navStyles.waterSurface);
    expect(html).toContain(navStyles.waterDepth);
    expect(html).toContain(navStyles.waterDistortion);
    expect(html).toContain(navStyles.waterEdge);
    expect(html).toContain(navStyles.waterSpecular);
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

  it('moving state dispara somente quando visualActiveId muda', () => {
    const navSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.tsx'),
      'utf8',
    );
    const navModuleSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.module.sass'),
      'utf8',
    );

    expect(navSource).toContain('previousVisualIdRef');
    expect(navSource).toContain('setIsMoving(true)');
    expect(navSource).toContain('setIsMoving(false)');
    expect(navSource).toContain('data-hy-bottom-nav-moving');
    expect(navSource).not.toContain('useBottomNavRouteCommitNonce');
    expect(navSource).not.toContain('routeCommitNonceForItem');
    expect(navSource).not.toContain('isRouteCommitCycle');
    expect(navModuleSource).toContain('.lens');
    expect(navModuleSource).toContain('transition-duration: 430ms');
    expect(navModuleSource).toContain("[data-hy-bottom-nav-moving='true']");
    expect(navModuleSource).toContain('scaleX(1.075) scaleY(1.12)');
    expect(resolveVisualActiveId('cargos', 'negotiations')).toBe('cargos');
  });

  it('nav e grid permanecem estáveis — morph só na lente preview global', () => {
    const navModuleSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.module.sass'),
      'utf8',
    );
    const navSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.tsx'),
      'utf8',
    );

    const navBlock = navModuleSource.match(/^\.nav[\s\S]*?(?=^\.lens)/m)?.[0] ?? '';

    expect(navBlock).toContain('grid-template-columns: repeat(var(--hy-bottom-nav-item-count, 5), minmax(0, 1fr))');
    expect(navBlock).toContain('overflow: visible');
    expect(navBlock).not.toContain('data-bottom-nav-route-commit');
    expect(navModuleSource).toContain('.lens');
    expect(navModuleSource).not.toContain('.pillSlot');
    expect(navModuleSource).toContain("[data-hy-bottom-nav-moving='true'] &");
    expect(navModuleSource).toContain('scaleX(1.075) scaleY(1.12)');
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

  it('lente preview global fica fora dos itens e permanece aria-hidden', () => {
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

  it('preview global não renderiza pill local — lente é sempre decorativa', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.tsx'),
      'utf8',
    );

    expect(source).toContain('data-hy-bottom-nav-preview-lens="true"');
    expect(source).toContain('isRouteActive');
    expect(source).not.toContain('activePill');
    expect(source).not.toContain('BottomNavActivePill');
    expect(source).not.toContain('data-bottom-nav-pill-slot');
    expect(source).not.toContain('gooeyTrack');
    expect(source).not.toContain('useBottomNavGooeyPillTransition');
  });

  it('arquitetura antiga da pill local não existe — lente global e icon/label no item', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.tsx'),
      'utf8',
    );
    const navModuleSource = readFileSync(
      resolve(process.cwd(), 'src/shared/components/bottom-nav/BottomNav.module.sass'),
      'utf8',
    );

    expect(source).not.toContain('BottomNavActivePill');
    expect(source).not.toContain('data-bottom-nav-pill-slot');
    expect(source).not.toContain('data-bottom-nav-content-layer');
    expect(source).not.toContain('data-bottom-nav-active-bubble');
    expect(source).toContain('data-hy-bottom-nav-preview-lens="true"');
    expect(source).toContain('className={styles.lens}');
    expect(source).toContain('className={styles.icon}');
    expect(source).toContain('className={styles.label}');
    expect(navModuleSource).toContain('.lens');
    expect(navModuleSource).not.toContain('.pillSlot');
    const contentBlock = source.match(/const content = \([\s\S]*?\n  \);/)?.[0] ?? '';
    expect(contentBlock).toContain('styles.icon');
    expect(contentBlock).toContain('styles.label');
    expect(contentBlock).not.toContain('pillSlot');
    expect(contentBlock).not.toContain('contentLayer');
    expect(contentBlock).not.toContain('activeContent');
  });
});
