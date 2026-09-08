import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { InlineAlert } from './InlineAlert';

const meta = {
  title: 'Feedback/InlineAlert',
  component: InlineAlert,
  args: { children: 'Não foi possível concluir a operação. Tente novamente.' },
  decorators: [(Story) => <div style={{ width: 'min(100%, 520px)', padding: '16px' }}><Story /></div>],
  parameters: {
    docs: { description: { component: 'Concise live-region feedback: assertive for errors and polite for success or information.' } },
  },
} satisfies Meta<typeof InlineAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Error: Story = {};
export const Success: Story = { args: { tone: 'success', children: 'Alterações salvas com sucesso.' } };
export const Info: Story = { args: { tone: 'info', children: 'A confirmação foi enviada para o e-mail informado.' } };
export const LongMessage: Story = {
  args: { children: 'Não conseguimos validar os dados da empresa agora. Revise as informações ou tente novamente em alguns minutos.' },
};
