import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { page61219254VisualCargoes } from '@/features/cargo/owned/fixtures/page-61-219-254.visual-fixture';
import { Page61StoryFrame } from '@/features/cargo/owned/stories/page-61-story-frame';

import { OwnedCargoShipmentCard } from './owned-cargo-shipment-card';

const [attentionCargo, inTransitCargo, deliveredCargo] = page61219254VisualCargoes;

const meta = {
  title: 'Page 61/Shipment Card',
  component: OwnedCargoShipmentCard,
  tags: ['autodocs'],
  args: {
    cargo: attentionCargo!,
    selected: true,
    visualFixtureEnabled: true,
    onSelect: () => undefined,
  },
  argTypes: {
    visualFixtureEnabled: {
      control: false,
      table: {
        category: 'Internal visual contract',
        disable: true,
      },
    },
    selected: {
      control: 'boolean',
      description: 'Selected state used by the master/detail list.',
    },
    cargo: {
      control: 'object',
      description: 'Real OwnedCargo domain object consumed by the application.',
    },
    onSelect: {
      action: 'select',
      description: 'Selection action from the real list component.',
    },
  },
  decorators: [
    (Story) => <Page61StoryFrame width={387}><Story /></Page61StoryFrame>,
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
    cargo: inTransitCargo!,
    selected: false,
  },
};

export const Delivered: Story = {
  args: {
    cargo: deliveredCargo!,
    selected: false,
  },
};

export const AttentionUnselected: Story = {
  args: {
    selected: false,
  },
};
