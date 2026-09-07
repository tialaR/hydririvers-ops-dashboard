import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { CARGO_LAB_V2_MOCKS } from '@/features/cargo/data/cargo-lab-v2.mock';

import { CargoDetailSheetContent } from './CargoDetailSheetContent';

const meta = {
  title: 'Operational/CargoDetailSheetContent',
  component: CargoDetailSheetContent,
  args: {
    cargo: CARGO_LAB_V2_MOCKS[0],
    selectedSection: 'overview',
    onSelectSection: () => undefined,
    onAction: () => undefined,
  },
  decorators: [(Story) => <div style={{ width: 'min(100%, 420px)' }}><Story /></div>],
  parameters: {
    docs: { description: { component: 'Conteúdo operacional real do detalhe de carga: status, corredor, ETA, previsão e acessos às áreas da operação.' } },
  },
} satisfies Meta<typeof CargoDetailSheetContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
export const JourneySelected: Story = { args: { selectedSection: 'journey' } };
export const DocumentsSelected: Story = { args: { selectedSection: 'documents' } };
export const LongRoute: Story = {
  args: {
    cargo: {
      ...CARGO_LAB_V2_MOCKS[0],
      title: 'Equipamentos industriais para modernização do terminal hidroviário',
      origin: 'São Félix do Xingu, PA',
      destination: 'São Francisco do Sul, SC',
    },
  },
};
