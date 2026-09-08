import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { CargoRouteLine } from './CargoRouteLine';

const meta = {
  title: 'Operational/CargoRouteLine',
  component: CargoRouteLine,
  parameters: {
    docs: {
      description: {
        component: 'Operational origin-to-destination reading shared by cargo cards and detail sheets.',
      },
    },
  },
  args: {
    originLabel: 'Belém, PA',
    destinationLabel: 'Santarém, PA',
    ariaLabel: 'Rota de Belém para Santarém',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['card', 'sheet'] },
  },
} satisfies Meta<typeof CargoRouteLine>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Card: Story = {};

export const Sheet: Story = {
  args: {
    variant: 'sheet',
    originMeta: 'Porto de Belém',
    destinationMeta: 'Terminal Fluvial de Santarém',
  },
};

export const SheetWithoutMetadata: Story = {
  args: { variant: 'sheet' },
};

export const LongRoute: Story = {
  args: {
    originLabel: 'Terminal Hidroviário de Vila do Conde, PA',
    destinationLabel: 'Terminal Portuário de Porto Velho, RO',
    originMeta: 'Berço operacional Norte 02',
    destinationMeta: 'Pátio fluvial de descarga 04',
    ariaLabel: 'Rota de Vila do Conde para Porto Velho',
    variant: 'sheet',
  },
};
