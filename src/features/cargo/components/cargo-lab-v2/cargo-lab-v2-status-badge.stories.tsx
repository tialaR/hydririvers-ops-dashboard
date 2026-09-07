import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import type { CargoLabV2, CargoLabV2Status } from '@/features/cargo/types/cargo-lab-v2.types';

import { CargoLabV2StatusBadge } from './cargo-lab-v2-status-badge';

const cargo: CargoLabV2 = {
  id: 'CRG-7845', title: 'Soja em grãos', subtitle: 'Comboio Norte 04', status: 'transito',
  statusLabel: 'Em trânsito', origin: 'Santarém', originTerminal: 'Terminal de Santarém',
  destination: 'Barcarena', destinationTerminal: 'Vila do Conde', eta: '08 set, 14:30',
  delivery: '09 set, 08:00', volume: '18.400 t', vessel: 'Comboio Norte 04', cargoType: 'Soja',
};

const meta = {
  title: 'Operational/CargoStatusBadge',
  component: CargoLabV2StatusBadge,
  args: { cargo, variant: 'card', showDot: true, size: 'md' },
  parameters: {
    docs: { description: { component: 'Primeiro contrato operacional estabilizado: traduz o status canônico da carga para a semântica visual compartilhada sem duplicar o primitive.' } },
  },
} satisfies Meta<typeof CargoLabV2StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InTransit: Story = {};
export const Delayed: Story = { args: { cargo: { ...cargo, status: 'atrasada', statusLabel: 'Atrasada' } } };
export const Blocked: Story = { args: { cargo: { ...cargo, status: 'bloqueada', statusLabel: 'Bloqueada' } } };
export const OperationalLifecycle: Story = {
  render: () => {
    const states: Array<[CargoLabV2Status, string]> = [
      ['aberta', 'Aberta'], ['cotacao', 'Em cotação'], ['contratando', 'Contratando'],
      ['operacao', 'Em operação'], ['transito', 'Em trânsito'], ['concluida', 'Concluída'],
      ['atrasada', 'Atrasada'], ['bloqueada', 'Bloqueada'],
    ];
    return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>{states.map(([status, statusLabel]) => <CargoLabV2StatusBadge key={status} cargo={{ ...cargo, status, statusLabel }} />)}</div>;
  },
};
