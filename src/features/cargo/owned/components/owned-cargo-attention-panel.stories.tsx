import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { page61219254VisualCargoes } from '@/features/cargo/owned/fixtures/page-61-219-254.visual-fixture';
import { Page61StoryFrame } from '@/features/cargo/owned/stories/page-61-story-frame';

import { OwnedCargoAttentionPanel } from './owned-cargo-attention-panel';

const meta = {
  title: 'Page 61/Attention Panel',
  component: OwnedCargoAttentionPanel,
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
      description: 'Owned cargo used to resolve risk, documents and ETA context.',
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

export const DomainDrivenCopy: Story = {
  args: {
    visualFixtureEnabled: false,
  },
};
