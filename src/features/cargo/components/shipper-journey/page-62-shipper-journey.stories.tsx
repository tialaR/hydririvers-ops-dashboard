import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Page62ShipperJourneyDemo } from './page-62-shipper-journey-demo';

const meta = {
  title: 'Page 62/Shipper Journey',
  component: Page62ShipperJourneyDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Interactive Page 62 shipper journey built from the delivered Figma exports and the evidence-backed domain contract. DEMO data remains explicit and repository-shaped for a future API adapter.',
      },
    },
  },
} satisfies Meta<typeof Page62ShipperJourneyDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const D04D05Cockpit: Story = { args: { initial: 'cockpit' } };
export const D06D07DocumentsRisk: Story = { args: { initial: 'documentsRisk' } };
export const D08D09Negotiation: Story = { args: { initial: 'negotiation' } };
export const D10ActionReview: Story = { args: { initial: 'review' } };
export const D11ActionFeedback: Story = { args: { initial: 'feedback' } };
export const D12CorrectionResubmit: Story = { args: { initial: 'correction' } };
export const D13Monitoring: Story = { args: { initial: 'monitoring' } };
