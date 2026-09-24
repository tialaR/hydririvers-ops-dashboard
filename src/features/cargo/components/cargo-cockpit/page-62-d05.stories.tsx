import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CargoOperationalTimeline } from './cargo-operational-timeline';

const meta = {
  title: 'Page 62/D05 Operational Timeline',
  component: CargoOperationalTimeline,
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
} satisfies Meta<typeof CargoOperationalTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Reference: Story = {};
