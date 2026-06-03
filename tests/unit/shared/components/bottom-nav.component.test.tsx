import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { BottomNav, type BottomNavProps } from '@/shared/components/bottom-nav';

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
});
