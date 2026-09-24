import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { page61StoryViewModels } from '@/features/cargo/owned/stories/page-61-story-data';
import { Page61StoryFrame } from '@/features/cargo/owned/stories/page-61-story-frame';

import { OwnedCargoDetailSummary } from './owned-cargo-detail-summary';

const meta = {
  title: 'Page 61/Selected Cargo Summary',
  component: OwnedCargoDetailSummary,
  tags: ['autodocs'],
  args: {
    viewModel: page61StoryViewModels[0]!,
      },
  argTypes: {
    },
    viewModel: {
      control: 'object',
      description: 'Canonical Page 61 view-model consumed by the real selected-cargo overview.',
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

