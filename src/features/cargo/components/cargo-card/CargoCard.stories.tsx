import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { CARGO_LAB_V2_MOCKS } from '@/features/cargo/data/cargo-lab-v2.mock';

import { CargoCard } from './CargoCard';

const inTransitCargo = CARGO_LAB_V2_MOCKS[0];
const operatingCargo = CARGO_LAB_V2_MOCKS[1];
const quotationCargo = CARGO_LAB_V2_MOCKS[3];

const meta = {
  title: 'Operational/CargoCard',
  component: CargoCard,
  args: {
    cargo: inTransitCargo,
    onClick: () => undefined,
  },
  decorators: [
    (Story) => <div style={{ width: 'min(100%, 420px)' }}><Story /></div>,
  ],
  parameters: {
    docs: {
      description: {
        component: 'Contrato operacional completo de carga: identidade, status, corredor, ETA e ação principal. A story cataloga o componente real usado pelo produto.',
      },
    },
  },
} satisfies Meta<typeof CargoCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InTransit: Story = {};
export const Operating: Story = { args: { cargo: operatingCargo } };
export const Quotation: Story = { args: { cargo: quotationCargo } };
export const Selected: Story = { args: { isSelected: true } };
export const Disabled: Story = { args: { isDisabled: true } };
export const DirectRouteAction: Story = {
  args: {
    primaryActionHref: '/pt-BR/minhas-cargas/CRG-7845/mapa',
    actionLabel: 'Ver no mapa',
  },
};
export const LongOperationalContent: Story = {
  args: {
    cargo: {
      ...inTransitCargo,
      id: 'CRG-99281',
      title: 'Equipamentos industriais para terminal hidroviário',
      origin: 'São Félix do Xingu, PA',
      destination: 'São Francisco do Sul, SC',
      eta: 'ETA 30–42h',
    },
  },
};
