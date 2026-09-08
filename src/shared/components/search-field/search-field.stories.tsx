import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { SearchField } from './SearchField';

function SearchGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

const meta = {
  title: 'Primitives/SearchField',
  component: SearchField,
  parameters: {
    docs: {
      description: {
        component: 'HydroRivers controlled search primitive used to find cargoes without owning filtering rules.',
      },
    },
  },
  args: {
    value: '',
    onChange: () => undefined,
    placeholder: 'Buscar por rota, carga ou embarcador',
    ariaLabel: 'Buscar cargas',
    icon: <SearchGlyph />,
  },
} satisfies Meta<typeof SearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithValue: Story = {
  args: { value: 'Santarém' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Interactive: Story = {
  render: function InteractiveSearchField(args) {
    const [value, setValue] = useState('');

    return <SearchField {...args} value={value} onChange={setValue} />;
  },
};
