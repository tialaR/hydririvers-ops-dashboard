import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { page61StoryViewModels } from '@/features/cargo/owned/stories/page-61-story-data';
import { Page61StoryFrame } from '@/features/cargo/owned/stories/page-61-story-frame';

import { OwnedCargoAttentionPanel } from './owned-cargo-attention-panel';

const meta = {
  title: 'Page 61/Attention Panel',
  component: OwnedCargoAttentionPanel,
  tags: ['autodocs'],
  args: {
    viewModel: page61StoryViewModels[0]!,
  },
  argTypes: {
    viewModel: {
      control: 'object',
      description: 'Canonical Page 61 view-model used by the real attention surface.',
    },
  },
  decorators: [
    (Story) => <Page61StoryFrame width={732}><Story /></Page61StoryFrame>,
  ],
  parameters: {
    docs: {
      description: {
        component: 'Operational attention surface from the real Page 61 detail view. Missing document/deadline/action hierarchy is a contract regression.',
      },
    },
  },
} satisfies Meta<typeof OwnedCargoAttentionPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CanonicalAttention: Story = {};
