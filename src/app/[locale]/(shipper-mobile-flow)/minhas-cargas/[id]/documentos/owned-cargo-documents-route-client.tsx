'use client';

import { useTranslations } from 'next-intl';

import { useRouter } from '@/core/i18n/navigation';
import type { CargoDocument, OwnedCargo } from '@/features/cargo/owned/domain/owned-cargo-types';
import {
  OwnedCargoDocumentsScreen,
  type OwnedCargoDocumentsActionProps,
} from '@/features/cargo/owned/screens/owned-cargo-documents-screen';
import { MobileAppShell } from '@/features/product-shell/components/mobile-app-shell/mobile-app-shell';
import { PrimaryButton } from '@/features/product-shell/components/primary-button/primary-button';
import { useProductShell } from '@/features/product-shell/providers/product-shell-provider';

type OwnedCargoDocumentsRouteClientProps = {
  cargo: OwnedCargo;
  documents: CargoDocument[];
};

const ActionButtonAdapter = (props: OwnedCargoDocumentsActionProps) => <PrimaryButton {...props} />;

export function OwnedCargoDocumentsRouteClient({ cargo, documents }: OwnedCargoDocumentsRouteClientProps) {
  const t = useTranslations('shipperMobileFlow.documents');
  const router = useRouter();
  const { openConfirmation } = useProductShell();

  const resolveBlocker = () => openConfirmation({
    title: t('confirm.title'),
    description: t('confirm.body'),
    confirmLabel: t('confirm.confirm'),
    cancelLabel: t('confirm.cancel'),
    onConfirm: () => router.push('/sucesso/acao-operacional'),
  });

  return (
    <MobileAppShell title={t('title')} backHref={`/minhas-cargas/${cargo.id}`}>
      <OwnedCargoDocumentsScreen
        cargo={cargo}
        documents={documents}
        onResolveBlocker={resolveBlocker}
        ActionButton={ActionButtonAdapter}
      />
    </MobileAppShell>
  );
}
