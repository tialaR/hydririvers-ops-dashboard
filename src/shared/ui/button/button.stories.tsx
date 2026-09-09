import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from './button';

const meta = {
  title: 'Primitives/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: 'HydroRivers shared action primitive. Stories exercise semantic themes and behavioral states without redefining product behavior.',
      },
    },
  },
  args: {
    children: 'Abrir contexto',
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'ghost'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: 'primary' },
};

export const Secondary: Story = {
  args: { variant: 'secondary' },
};

export const Ghost: Story = {
  args: { variant: 'ghost' },
};

export const Loading: Story = {
  args: {
    loading: true,
    loadingLabel: 'Atualizando operação',
    children: 'Atualizar operação',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Ação indisponível',
  },
};
