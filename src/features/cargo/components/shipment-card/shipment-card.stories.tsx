import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ShipmentCard, type ShipmentCardProps } from './shipment-card';

const base: ShipmentCardProps = {
  code: '#HY-000-000',
  statusLabel: 'Atrasada',
  statusTone: 'delayed',
  origin: { stateCode: 'AM', stateLabel: 'Amazonas', city: 'Manaus' },
  destination: { stateCode: 'PA', stateLabel: 'Pará', city: 'Santarém' },
  cargoLabel: 'Carga',
  cargoValue: 'Equipamentos eletrônicos',
  etaValue: '08:45',
  etaSuffix: 'Hoje',
  selected: false,
};

const meta = {
  title: 'Cargo/Shipment Card',
  component: ShipmentCard,
  tags: ['autodocs'],
  args: base,
  argTypes: {
    statusTone: {
      control: 'select',
      options: ['open', 'quotation', 'contracting', 'operating', 'inTransit', 'completed', 'delayed', 'blocked', 'unknown'],
      description: 'Semantic status tone. The visual indicator must change with the operational state.',
    },
    selected: {
      control: 'boolean',
      description: 'Master/detail selection state without changing the component anatomy.',
    },
    origin: {
      control: 'object',
      description: 'Origin presentation contract. AM and PA currently have frozen state brands; other states fall back to their code.',
    },
    destination: {
      control: 'object',
      description: 'Destination presentation contract. AM and PA currently have frozen state brands; other states fall back to their code.',
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: '100%',
          maxWidth: '27.125rem',
          boxSizing: 'border-box',
          padding: '1.5rem',
          marginInline: 'auto',
          background: '#1e1e1e',
        }}
      >
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'COMP-CARGO-CARD-001 materialized as a reusable application component. Page 61, Page 62 and Storybook must consume this same anatomy; variants change data/status semantics, never silently redesign the card.',
      },
    },
  },
} satisfies Meta<typeof ShipmentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Attention: Story = {
  args: { statusLabel: 'Atrasada', statusTone: 'delayed', selected: true },
};

export const InTransit: Story = {
  args: { statusLabel: 'Em trânsito', statusTone: 'inTransit' },
};

export const Delivered: Story = {
  args: { statusLabel: 'Entregue', statusTone: 'completed' },
};

export const Open: Story = {
  args: { statusLabel: 'Aberta', statusTone: 'open' },
};

export const Blocked: Story = {
  args: { statusLabel: 'Bloqueada', statusTone: 'blocked' },
};

export const AllOperationalVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '1rem', width: '100%', maxWidth: '24.125rem', marginInline: 'auto' }}>
      <ShipmentCard {...base} statusLabel="Atrasada" statusTone="delayed" selected />
      <ShipmentCard {...base} statusLabel="Em trânsito" statusTone="inTransit" />
      <ShipmentCard {...base} statusLabel="Entregue" statusTone="completed" />
      <ShipmentCard {...base} statusLabel="Aberta" statusTone="open" />
      <ShipmentCard {...base} statusLabel="Bloqueada" statusTone="blocked" />
    </div>
  ),
};
