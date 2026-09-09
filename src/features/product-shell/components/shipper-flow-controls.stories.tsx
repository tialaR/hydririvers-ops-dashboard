'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { NextIntlClientProvider } from 'next-intl';
import { useState } from 'react';

import messages from '../../../../messages/pt-BR.json';
import { BottomSheet } from './bottom-sheet/bottom-sheet';
import { PrimaryButton } from './primary-button/primary-button';
import { SearchFilterStack } from './search-filter-stack/search-filter-stack';

const filters = [
  { id: 'all', label: 'Todas' },
  { id: 'in-transit', label: 'Em trânsito' },
  { id: 'attention', label: 'Atenção' },
];

function ShipperFlowControlsExample() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <NextIntlClientProvider locale="pt-BR" messages={messages} timeZone="America/Bahia">
      <div style={{ display: 'grid', gap: '24px', width: 'min(100vw - 32px, 430px)', minHeight: '520px' }}>
        <SearchFilterStack
          value={query}
          onChange={setQuery}
          chips={filters}
          activeChip={activeFilter}
          onChipChange={setActiveFilter}
          onFilterClick={() => setSheetOpen(true)}
        />
        <PrimaryButton label="Nova carga" onClick={() => setSheetOpen(true)} />
        <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Filtros" size="compact">
          <div style={{ display: 'grid', gap: '16px' }}>
            <p>Refine a lista de cargas sem sair do fluxo principal.</p>
            <PrimaryButton label="Aplicar filtros" onClick={() => setSheetOpen(false)} />
          </div>
        </BottomSheet>
      </div>
    </NextIntlClientProvider>
  );
}

const meta = {
  title: 'Operational/Shipper Flow Controls',
  component: ShipperFlowControlsExample,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ShipperFlowControlsExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {};
