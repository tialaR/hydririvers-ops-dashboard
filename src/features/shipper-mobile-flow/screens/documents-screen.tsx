'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/core/i18n/navigation';
import { MobileAppShell } from '@/features/shipper-mobile-flow/components/mobile-app-shell/mobile-app-shell';
import { PrimaryButton } from '@/features/shipper-mobile-flow/components/primary-button/primary-button';
import { useShipperFlow } from '@/features/shipper-mobile-flow/providers/shipper-flow-provider';
import type { ShipperDocument, ShipperOwnedCargo } from '@/features/shipper-mobile-flow/types/shipper-flow-types';

import styles from '../components/shared-ui/shared-ui.module.sass';

type DocumentsScreenProps = {
  cargo: ShipperOwnedCargo;
  documents: ShipperDocument[];
};

export function DocumentsScreen({ cargo, documents }: DocumentsScreenProps) {
  const t = useTranslations('shipperMobileFlow.documents');
  const router = useRouter();
  const { openConfirmation } = useShipperFlow();
  const hasBlocker = documents.some((doc) => doc.status === 'blocked');

  const resolveBlocker = () => {
    openConfirmation({
      title: t('confirm.title'),
      description: t('confirm.body'),
      confirmLabel: t('confirm.confirm'),
      cancelLabel: t('confirm.cancel'),
      onConfirm: () => router.push('/sucesso/acao-operacional')
    });
  };

  return (
    <MobileAppShell title={t('title')} backHref={`/minhas-cargas/${cargo.id}`}>
      <div className={styles.list}>
        {documents.map((doc) => (
          <div key={doc.id} className={styles.docRow}>
            <div>
              <p className={styles.title}>{t(`documents.${doc.nameKey}`)}</p>
              {doc.dueLabelKey ? <p className={styles.summary}>{t(doc.dueLabelKey)}</p> : null}
            </div>
            <span className={styles.tileValue}>{t(`status.${doc.status}`)}</span>
          </div>
        ))}
      </div>
      {hasBlocker ? <PrimaryButton label={t('resolve')} onClick={resolveBlocker} /> : null}
    </MobileAppShell>
  );
}
