'use client';

import { useTranslations } from 'next-intl';
import type { OwnedCargoSupportCard } from '@/features/cargo/domain/derive-owned-cargo-detail';
import styles from './owned-cargo-support-cards.module.sass';

const SUPPORT_LABEL_KEYS = {
  volume: 'supportVolume',
  window: 'supportWindow',
  corridor: 'supportCorridor',
  operation: 'supportOperation',
  co2: 'supportCo2',
} as const;

type OwnedCargoSupportCardsProps = {
  cards: OwnedCargoSupportCard[];
};

export function OwnedCargoSupportCards({ cards }: OwnedCargoSupportCardsProps) {
  const t = useTranslations('pages.minhasCargas.detail');

  if (!cards.length) return null;

  return (
    <section className={styles.root} aria-label={t('supportAria')} data-testid="owned-cargo-support-cards">
      <h2 className={styles.title}>{t('supportTitle')}</h2>
      <div className={styles.list}>
        {cards.map((card) => (
          <article key={card.key} className={styles.card} data-support={card.key}>
            <span className={styles.label}>{t(SUPPORT_LABEL_KEYS[card.key])}</span>
            <strong className={styles.value}>{card.value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
