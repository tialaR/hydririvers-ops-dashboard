import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { CargoEtaBlock } from './CargoEtaBlock';

const meta = {
  title: 'Operational/CargoEtaBlock',
  component: CargoEtaBlock,
  parameters: {
    docs: {
      description: {
        component: 'Operational time indicators for compact cargo cards and expanded sheet summaries.',
      },
    },
  },
  args: {
    label: 'ETA',
    value: '18 set, 14:30',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['card', 'sheet'] },
  },
} satisfies Meta<typeof CargoEtaBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Card: Story = {};

export const CardUnavailable: Story = {
  args: { value: '—' },
};

export const Sheet: Story = {
  args: {
    variant: 'sheet',
    ariaLabel: 'Previsões da operação',
    metrics: [
      { label: 'ETA', value: '18 set, 14:30' },
      { label: 'Entrega prevista', value: '19 set, 08:00', tone: 'success' },
    ],
  },
};

export const SheetWithAttention: Story = {
  args: {
    variant: 'sheet',
    ariaLabel: 'Previsões atualizadas da operação',
    metrics: [
      { label: 'ETA revisado', value: '20 set, 17:00' },
      { label: 'Janela original', value: '18 set, 14:30' },
    ],
  },
};
