import { Mail } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { TextField } from './TextField';

const meta = {
  title: 'Forms/TextField',
  component: TextField,
  args: {
    id: 'storybook-email',
    label: 'E-mail corporativo',
    placeholder: 'voce@empresa.com.br',
  },
  decorators: [(Story) => <div style={{ width: 'min(100%, 420px)', padding: '16px' }}><Story /></div>],
  parameters: {
    docs: { description: { component: 'Shared form field with persistent guidance, validation feedback and accessible descriptions.' } },
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const WithHint: Story = { args: { hint: 'Usaremos este endereço para avisos da operação.' } };
export const WithIcon: Story = { args: { icon: <Mail aria-hidden />, defaultValue: 'operacoes@empresa.com.br' } };
export const Invalid: Story = {
  args: {
    defaultValue: 'operacoes@',
    hint: 'Use o endereço associado à sua empresa.',
    error: 'Informe um e-mail válido.',
  },
};
export const Disabled: Story = { args: { defaultValue: 'contato@empresa.com.br', disabled: true } };
export const WithTrailingStatus: Story = {
  args: { defaultValue: 'contato@empresa.com.br', trailing: <span>Verificado</span> },
};
