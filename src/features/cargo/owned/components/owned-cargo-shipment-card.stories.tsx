import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { page61StoryViewModels } from '@/features/cargo/owned/stories/page-61-story-data';
import { Page61StoryFrame } from '@/features/cargo/owned/stories/page-61-story-frame';

import { OwnedCargoShipmentCard } from './owned-cargo-shipment-card';

const [attentionCargo, inTransitCargo, deliveredCargo] = page61StoryViewModels;

const meta = {
  title: 'Page 61/Shipment Card',
  component: OwnedCargoShipmentCard,
  tags: ['autodocs'],
  args: {
    viewModel: attentionCargo!,
    selected: true,
    onSelect: () => undefined,
  },
  argTypes: {
    selected: {
      control: 'boolean',
      description: 'Selected state used by the master/detail list.',
    },
    viewModel: {
      control: 'object',
      description: 'Canonical Page 61 view-model built from the real cargo contract plus deterministic story data.',
    },
    onSelect: {
      action: 'select',
      description: 'Selection action from the real list component.',
    },
  },
  decorators: [
    (Story) => <Page61StoryFrame width={385}><Story /></Page61StoryFrame>,
  ],
  parameters: {
    docs: {
      description: {
        component: 'Canonical Page 61 shipment card rendered from the same application component. Stories prove status/selection variants without duplicating the card implementation.',
      },
    },
  },
} satisfies Meta<typeof OwnedCargoShipmentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SelectedAttention: Story = {};

export const InTransit: Story = {
  args: {
    viewModel: inTransitCargo!,
    selected: false,
  },
};

export const Delivered: Story = {
  args: {
    viewModel: deliveredCargo!,
    selected: false,
  },
};

export const AttentionUnselected: Story = {
  args: {
    selected: false,
  },
};
