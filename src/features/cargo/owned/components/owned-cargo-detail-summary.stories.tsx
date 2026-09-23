import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { page61219254VisualCargoes } from '@/features/cargo/owned/fixtures/page-61-219-254.visual-fixture';
import { Page61StoryFrame } from '@/features/cargo/owned/stories/page-61-story-frame';

import { OwnedCargoDetailSummary } from './owned-cargo-detail-summary';

const meta = {
  title: 'Page 61/Selected Cargo Summary',
  component: OwnedCargoDetailSummary,
  tags: ['autodocs'],
  args: {
    cargo: page61219254VisualCargoes[0]!,
    visualFixtureEnabled: true,
  },
  argTypes: {
    visualFixtureEnabled: {
      control: false,
      table: {
        category: 'Internal visual contract',
        disable: true,
      },
    },
    cargo: {
      control: 'object',
      description: 'Real OwnedCargo domain input used by the selected-cargo overview.',
    },
  },
  decorators: [
    (Story) => <Page61StoryFrame width={768}><Story /></Page61StoryFrame>,
  ],
  parameters: {
    docs: {
      description: {
        component: 'Selected-cargo overview contract: operation state, carrier, cargo facts and operational attention. This story renders the production component rather than a Storybook-only clone.',
      },
    },
  },
} satisfies Meta<typeof OwnedCargoDetailSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CanonicalAttention: Story = {};

export const DomainDriven: Story = {
  args: {
    visualFixtureEnabled: false,
  },
};
