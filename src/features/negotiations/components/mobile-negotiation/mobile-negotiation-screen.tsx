'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/core/i18n/navigation';
import { MobileAppShell } from '@/features/product-shell/components/mobile-app-shell/mobile-app-shell';
import { PrimaryButton } from '@/features/product-shell/components/primary-button/primary-button';
import { useProductShell } from '@/features/product-shell/providers/product-shell-provider';
import type { CargoOffer, OwnedCargo } from '@/features/cargo/owned/domain/owned-cargo-types';

import styles from './mobile-negotiation-screen.module.sass';

type MobileNegotiationScreenProps = {
  cargo: OwnedCargo;
  offers: CargoOffer[];
};

export function MobileNegotiationScreen({ cargo, offers }: MobileNegotiationScreenProps) {
  const t = useTranslations('shipperMobileFlow.negotiation');
  const tOffers = useTranslations('shipperMobileFlow.offers');
  const router = useRouter();
  const { openConfirmation } = useProductShell();
  const bestEta = offers.reduce((min, offer) => Math.min(min, offer.etaHours), offers[0]?.etaHours ?? 0);

  const selectOffer = (offer: CargoOffer) => {
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
      <section className={styles.negotiationHero} aria-label={t('heroAria')}>
        <p className={styles.negotiationHeroLabel}>{t('heroLabel')}</p>
        <h2 className={styles.negotiationHeroTitle}>{cargo.code}</h2>
        <p className={styles.negotiationHeroBody}>{t('heroBody', { offers: offers.length })}</p>
      </section>
      <section className={styles.negotiationFactsGrid} aria-label={t('heroAria')}>
        <article className={styles.negotiationFactCard}>
          <p className={styles.negotiationFactLabel}>{t('meta.price')}</p>
          <p className={styles.negotiationFactValue}>{offers[0]?.pricePerTonLabel ?? '-'}</p>
        </article>
        <article className={styles.negotiationFactCard}>
          <p className={styles.negotiationFactLabel}>{t('eta', { hours: bestEta })}</p>
          <p className={styles.negotiationFactValue}>{t('meta.low')}</p>
        </article>
      </section>
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
            <div className={styles.offerMetaGrid}>
              <div className={styles.offerMetaCell}>
                <span className={styles.offerMetaLabel}>{t('meta.price')}</span>
                <strong className={styles.offerMetaValue}>{offer.pricePerTonLabel}</strong>
              </div>
              <div className={styles.offerMetaCell}>
                <span className={styles.offerMetaLabel}>{t('meta.risk')}</span>
                <strong className={styles.offerMetaValue}>{offer.recommended ? t('meta.low') : t('meta.medium')}</strong>
              </div>
            </div>
            <PrimaryButton label={t('selectOffer')} onClick={() => selectOffer(offer)} variant="secondary" />
          </article>
        ))}
      </div>
    </MobileAppShell>
  );
}
