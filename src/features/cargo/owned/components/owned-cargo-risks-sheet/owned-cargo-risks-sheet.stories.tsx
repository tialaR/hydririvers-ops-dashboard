import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { deriveOwnedCargoDetail } from '@/features/cargo/domain/derive-owned-cargo-detail';
import { userCargosMock } from '@/features/cargo/mocks/owned-cargos.mock';
import { OwnedCargoSheetStoryFrame } from '@/features/cargo/owned/components/owned-cargo-sheets/owned-cargo-sheet-story-decorator';

import { OwnedCargoRisksSheet } from './owned-cargo-risks-sheet';

const detail = deriveOwnedCargoDetail(userCargosMock[0]!);

const meta = {
  title: 'Operational/OwnedCargoRisksSheet',
  component: OwnedCargoRisksSheet,
  args: { preview: detail.risks, risks: detail.riskItems, open: true, onOpenChange: () => undefined },
  decorators: [(Story) => <OwnedCargoSheetStoryFrame><Story /></OwnedCargoSheetStoryFrame>],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Operational risk hierarchy with critical impact, recommendation and clear-route state.' } } },
} satisfies Meta<typeof OwnedCargoRisksSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Attention: Story = {};
export const Clear: Story = { args: { preview: { state: 'clear', count: 0, primaryRiskMock: null, topSeverity: null }, risks: [] } };
