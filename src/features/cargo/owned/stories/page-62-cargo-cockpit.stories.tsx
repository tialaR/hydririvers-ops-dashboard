import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Page62CargoCockpitPreview } from './page-62-cargo-cockpit-preview';

const meta = {
  title: 'Page 62/Cargo Cockpit',
  component: Page62CargoCockpitPreview,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'First Page 62 composition rebuilt from the exported blueprint using the canonical Shipment Card and existing operational chart pattern. This is the Storybook contract surface before wiring the production route.',
      },
    },
  },
} satisfies Meta<typeof Page62CargoCockpitPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WorkingReference: Story = {};
