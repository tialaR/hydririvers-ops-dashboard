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
        component:
          'D04-D05 reference contract for the Page 62 operational workspace. It reuses the canonical Shipment Card, ECharts operational visualizations and Motion only for meaningful state transitions. Cockpit and Timeline are independent Storybook states before route wiring.',
      },
    },
  },
} satisfies Meta<typeof Page62CargoCockpitPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CockpitReference: Story = {
  args: { initialMode: 'cockpit' },
};

export const TimelineReference: Story = {
  args: { initialMode: 'timeline' },
};
