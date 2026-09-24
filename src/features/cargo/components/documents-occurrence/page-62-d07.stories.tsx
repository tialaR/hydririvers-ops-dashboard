import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Page62D07ContractSurface } from './page-62-d06-d07-contract-surfaces';

const meta = {
  title: 'Page 62/D07 Risk & Occurrence',
  component: Page62D07ContractSurface,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Page62D07ContractSurface>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Reference: Story = {};
