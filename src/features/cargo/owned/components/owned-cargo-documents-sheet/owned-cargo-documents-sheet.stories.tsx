import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { deriveOwnedCargoDetail } from '@/features/cargo/domain/derive-owned-cargo-detail';
import { userCargosMock } from '@/features/cargo/mocks/owned-cargos.mock';
import { OwnedCargoSheetStoryFrame } from '@/features/cargo/owned/components/owned-cargo-sheets/owned-cargo-sheet-story-decorator';

import { OwnedCargoDocumentsSheet } from './owned-cargo-documents-sheet';

const detail = deriveOwnedCargoDetail(userCargosMock[0]!);
const readyDocuments = detail.documentItems.map((document) => ({ ...document, status: 'ok' as const, displayStatus: 'authorized' as const, needsAction: false }));

const meta = {
  title: 'Operational/OwnedCargoDocumentsSheet',
  component: OwnedCargoDocumentsSheet,
  args: { preview: detail.documents, documents: detail.documentItems, open: true, onOpenChange: () => undefined },
  decorators: [(Story) => <OwnedCargoSheetStoryFrame><Story /></OwnedCargoSheetStoryFrame>],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Operational document readiness, pending action and status inventory.' } } },
} satisfies Meta<typeof OwnedCargoDocumentsSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PendingAction: Story = {};
export const Ready: Story = { args: { preview: { ...detail.documents, pendingCount: 0, readinessPercent: 100, topPendingName: null }, documents: readyDocuments } };
export const Empty: Story = { args: { preview: { ...detail.documents, state: 'empty', totalCount: 0, pendingCount: 0, readinessPercent: 0, topPendingName: null }, documents: [] } };
