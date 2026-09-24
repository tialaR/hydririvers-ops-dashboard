import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Page62D04ContractSurface } from './page-62-d04-contract-surface';

const meta = {
  title: 'Page 62/D04 Cargo Cockpit',
  component: Page62D04ContractSurface,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        component: 'Isolated D04 operational intelligence surface frozen against the supplied Page 62 SVG crop. Uses ECharts 6 for telemetry and the same component in the full cockpit composition.',
      },
    },
  },
} satisfies Meta<typeof Page62D04ContractSurface>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Reference: Story = {};
