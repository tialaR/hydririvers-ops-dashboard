'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/core/i18n/navigation';
import { MobileAppShell } from '@/features/shipper-mobile-flow/components/mobile-app-shell/mobile-app-shell';
import { PrimaryButton } from '@/features/shipper-mobile-flow/components/primary-button/primary-button';
import { useShipperFlow } from '@/features/shipper-mobile-flow/providers/shipper-flow-provider';
import type { ShipperOffer, ShipperOwnedCargo } from '@/features/shipper-mobile-flow/types/shipper-flow-types';

import styles from '../components/shared-ui/shared-ui.module.sass';

type NegotiationScreenProps = {
  cargo: ShipperOwnedCargo;
  offers: ShipperOffer[];
};

export function NegotiationScreen({ cargo, offers }: NegotiationScreenProps) {
  const t = useTranslations('shipperMobileFlow.negotiation');
  const tOffers = useTranslations('shipperMobileFlow.offers');
  const router = useRouter();
  const { openConfirmation } = useShipperFlow();

  const selectOffer = (offer: ShipperOffer) => {
    openConfirmation({
      title: t('confirm.title'),
      description: t('confirm.body', { offer: tOffers(offer.labelKey) }),
      confirmLabel: t('confirm.confirm'),
      cancelLabel: t('confirm.cancel'),
      onConfirm: () => router.push('/sucesso/acao-operacional')
    });
  };

  return (
    <MobileAppShell title={t('title')} backHref={`/minhas-cargas/${cargo.id}`}>
      <article className={styles.alert}>
        <h2 className={styles.alertTitle}>{t('criterion.title')}</h2>
        <p className={styles.alertBody}>{t('criterion.body')}</p>
      </article>
      <div className={styles.list}>
        {offers.map((offer) => (
          <article key={offer.id} className={`${styles.offer} ${offer.recommended ? styles.recommended : ''}`}>
            <h3 className={styles.title}>{tOffers(offer.labelKey)}</h3>
            <p className={styles.summary}>{tOffers(offer.partnerKey)}</p>
            <p className={styles.summary}>{t('eta', { hours: offer.etaHours })}</p>
            <PrimaryButton label={t('selectOffer')} onClick={() => selectOffer(offer)} variant="secondary" />
          </article>
        ))}
      </div>
    </MobileAppShell>
  );
}
