import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { StatusBadge, type StatusBadgeStatus } from './StatusBadge';

const STATUSES: StatusBadgeStatus[] = [
  'open', 'quotation', 'contracting', 'operating', 'inTransit',
  'completed', 'delayed', 'blocked', 'unknown',
];

const meta = {
  title: 'Primitives/StatusBadge',
  component: StatusBadge,
  args: { status: 'inTransit' },
  argTypes: {
    status: { control: 'select', options: STATUSES },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
  parameters: {
    docs: { description: { component: 'Status logístico compartilhado, com texto e cor redundantes para não depender somente da percepção de cor.' } },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const WithoutDot: Story = { args: { showDot: false } };
export const Compact: Story = { args: { size: 'sm' } };
export const AllOperationalStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, maxWidth: 720 }}>
      {STATUSES.map((status) => <StatusBadge key={status} status={status} />)}
    </div>
  ),
};
