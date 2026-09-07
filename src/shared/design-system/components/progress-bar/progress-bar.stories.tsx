import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ProgressBar } from './progress-bar';

const meta = {
  title: 'Primitives/ProgressBar',
  component: ProgressBar,
  args: { value: 64, label: 'Progresso da viagem', tone: 'accent', showValue: true },
  argTypes: { tone: { control: 'inline-radio', options: ['neutral', 'accent', 'success', 'warning', 'danger'] } },
  decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>],
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Empty: Story = { args: { value: 0 } };
export const Complete: Story = { args: { value: 100, tone: 'success' } };
export const Attention: Story = { args: { value: 78, tone: 'warning', label: 'Janela operacional consumida' } };
export const ClampedOverflow: Story = { args: { value: 140, tone: 'danger' } };
