import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { page61219254SelectedVisualFacts } from '@/features/cargo/owned/fixtures/page-61-219-254.visual-fixture';
import { Page61StoryFrame } from '@/features/cargo/owned/stories/page-61-story-frame';

import { OwnedCargoDetailTabs } from './owned-cargo-detail-tabs';

const meta = {
  title: 'Page 61/Detail Tabs',
  component: OwnedCargoDetailTabs,
  tags: ['autodocs'],
  args: {
    cargoId: 'visual-hy-247-819',
    labels: page61219254SelectedVisualFacts.tabs,
  },
  argTypes: {
    cargoId: {
      control: 'text',
      description: 'Cargo route id used by the real navigation links.',
    },
    labels: {
      control: 'object',
      description: 'Optional deterministic labels for visual contract capture. Omit to use production i18n labels.',
    },
  },
  decorators: [
    (Story) => <Page61StoryFrame width={768}><Story /></Page61StoryFrame>,
  ],
  parameters: {
    docs: {
      description: {
        component: 'Page 61 detail navigation. The component keeps real application links; Storybook only freezes labels when needed for deterministic comparison.',
      },
    },
  },
} satisfies Meta<typeof OwnedCargoDetailTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Canonical: Story = {};

export const ProductionLabels: Story = {
  args: {
    labels: undefined,
  },
};
