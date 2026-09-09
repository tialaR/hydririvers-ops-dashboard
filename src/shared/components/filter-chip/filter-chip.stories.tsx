import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { FilterChip } from './FilterChip';

const meta = {
  title: 'Primitives/FilterChip',
  component: FilterChip,
  parameters: {
    docs: {
      description: {
        component: 'HydroRivers toggle control for compact, mutually understandable filter states.',
      },
    },
  },
  args: {
    children: 'Em trânsito',
  },
} satisfies Meta<typeof FilterChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unselected: Story = {};

export const Selected: Story = {
  args: { isSelected: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const LongLabel: Story = {
  args: { children: 'Documentação aguardando regularização' },
};

export const InteractiveGroup: Story = {
  render: function InteractiveFilterGroup() {
    const options = ['Todas', 'Em trânsito', 'Com risco'] as const;
    const [selected, setSelected] = useState<(typeof options)[number]>('Todas');

    return (
      <div role="group" aria-label="Filtrar cargas" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
        {options.map((option) => (
          <FilterChip
            key={option}
            isSelected={selected === option}
            onClick={() => setSelected(option)}
          >
            {option}
          </FilterChip>
        ))}
      </div>
    );
  },
};
