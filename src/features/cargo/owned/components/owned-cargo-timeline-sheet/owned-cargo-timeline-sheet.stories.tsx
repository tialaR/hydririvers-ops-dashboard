import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { deriveOwnedCargoDetail } from '@/features/cargo/domain/derive-owned-cargo-detail';
import { userCargosMock } from '@/features/cargo/mocks/owned-cargos.mock';
import { OwnedCargoSheetStoryFrame } from '@/features/cargo/owned/components/owned-cargo-sheets/owned-cargo-sheet-story-decorator';

import { OwnedCargoTimelineSheet } from './owned-cargo-timeline-sheet';

const detail = deriveOwnedCargoDetail(userCargosMock[5]!);

const meta = {
  title: 'Operational/OwnedCargoTimelineSheet',
  component: OwnedCargoTimelineSheet,
  args: { preview: detail.timeline, events: detail.timelineEvents, open: true, onOpenChange: () => undefined },
  decorators: [(Story) => <OwnedCargoSheetStoryFrame><Story /></OwnedCargoSheetStoryFrame>],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Operational journey history with completed, current and upcoming milestones.' } } },
} satisfies Meta<typeof OwnedCargoTimelineSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ActiveJourney: Story = {};
export const Empty: Story = { args: { preview: { ...detail.timeline, state: 'empty', eventCount: 0, nextEventMock: null, phaseDots: [] }, events: [] } };
