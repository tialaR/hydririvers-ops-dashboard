import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Page62D05ContractSurface } from './page-62-d05-contract-surface';

const meta = {
  title: 'Page 62/D05 Operational Timeline',
  component: Page62D05ContractSurface,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        component: 'Isolated D05 operational timeline frozen against the supplied Page 62 SVG crop. This timeline is reserved for temporal events and milestones, not generic quantitative data.',
      },
    },
  },
} satisfies Meta<typeof Page62D05ContractSurface>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Reference: Story = {};
