import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Page62D06ContractSurface, Page62D07ContractSurface } from './page-62-d06-d07-contract-surfaces';

const d06Meta = {
  title: 'Page 62/D06 Documents & Evidence',
  component: Page62D06ContractSurface,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Page62D06ContractSurface>;

export default d06Meta;
type Story = StoryObj<typeof d06Meta>;

export const Reference: Story = {};

export const D07OccurrencePreview = {
  render: () => <Page62D07ContractSurface />,
  parameters: {
    docs: {
      description: {
        story: 'D07 occurrence surface is split into its own contract story file for visual certification.',
      },
    },
  },
};
