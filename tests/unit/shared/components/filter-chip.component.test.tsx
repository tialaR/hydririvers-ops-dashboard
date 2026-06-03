import { createElement, type MouseEvent, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { FilterChip, type FilterChipProps } from '@/shared/components/filter-chip';

describe('FilterChip', () => {
  it('renderiza como button com children', () => {
    const html = renderToStaticMarkup(<FilterChip>Em trânsito</FilterChip>);

    expect(html).toContain('<button');
    expect(html).toContain('type="button"');
    expect(html).toContain('Em trânsito');
  });

  it('chama onClick quando habilitado', () => {
    const onClick = vi.fn();
    const element = createElement(FilterChip, {
      onClick,
      children: 'Todos',
    } as FilterChipProps) as ReactElement<FilterChipProps>;

    element.props.onClick?.({} as MouseEvent<HTMLButtonElement>);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('não chama onClick quando disabled', () => {
    const onClick = vi.fn();
    const element = createElement(FilterChip, {
      disabled: true,
      onClick,
      children: 'Todos',
    } as FilterChipProps) as ReactElement<FilterChipProps>;

    expect(element.props.disabled).toBe(true);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('aplica aria-pressed e data-active quando selected', () => {
    const html = renderToStaticMarkup(
      <FilterChip isSelected ariaPressed>
        Agendado
      </FilterChip>,
    );

    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('data-active="true"');
  });

  it('aceita className', () => {
    const html = renderToStaticMarkup(
      <FilterChip className="lab-filter-chip">
        Spot
      </FilterChip>,
    );

    expect(html).toContain('lab-filter-chip');
  });
});
