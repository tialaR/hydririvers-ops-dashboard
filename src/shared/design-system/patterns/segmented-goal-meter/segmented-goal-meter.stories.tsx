import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SegmentedGoalMeter } from './segmented-goal-meter';

const meta = {
  title: 'Patterns/Segmented Goal Meter',
  component: SegmentedGoalMeter,
  tags: ['autodocs'],
  args: {
    value: 12,
    max: 18,
    segments: 18,
    label: 'Validações concluídas',
    valueLabel: '12',
    targetLabel: '18 previstas',
  },
} satisfies Meta<typeof SegmentedGoalMeter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {};
export const Success: Story = { args: { value: 16, tone: 'success' } };
export const Warning: Story = { args: { value: 7, tone: 'warning' } };
