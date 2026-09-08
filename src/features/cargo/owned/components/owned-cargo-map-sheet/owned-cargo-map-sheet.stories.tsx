import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { deriveOwnedCargoDetail } from '@/features/cargo/domain/derive-owned-cargo-detail';
import { userCargosMock } from '@/features/cargo/mocks/owned-cargos.mock';
import { OwnedCargoSheetStoryFrame } from '@/features/cargo/owned/components/owned-cargo-sheets/owned-cargo-sheet-story-decorator';

import { OwnedCargoMapSheet } from './owned-cargo-map-sheet';

const cargo = userCargosMock[5]!;
const detail = deriveOwnedCargoDetail(cargo);

const meta = {
  title: 'Operational/OwnedCargoMapSheet',
  component: OwnedCargoMapSheet,
  args: { cargo, map: detail.map, open: true, onOpenChange: () => undefined },
  decorators: [(Story) => <OwnedCargoSheetStoryFrame><Story /></OwnedCargoSheetStoryFrame>],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Operational route panel with corridor, current checkpoint and accessible progress.' } } },
} satisfies Meta<typeof OwnedCargoMapSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Available: Story = {};
export const Unavailable: Story = { args: { map: { ...detail.map, state: 'unavailable', statusKey: 'unavailable' } } };
