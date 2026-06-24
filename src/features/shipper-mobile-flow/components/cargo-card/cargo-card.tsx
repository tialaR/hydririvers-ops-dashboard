'use client';

import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';
import type { ShipperOwnedCargo } from '@/features/shipper-mobile-flow/types/shipper-flow-types';
import { RiskBadge } from '@/features/shipper-mobile-flow/components/risk-badge/risk-badge';
import { FreshnessIndicator } from '@/features/shipper-mobile-flow/components/freshness-indicator/freshness-indicator';

import styles from './cargo-card.module.sass';

type CargoCardProps = {
  cargo: ShipperOwnedCargo;
};

function statusClass(status: ShipperOwnedCargo['status']) {
  if (status === 'attention') return styles.statusAttention;
  if (status === 'inTransit') return styles.statusTransit;
  return styles.statusOpen;
}

export function CargoCard({ cargo }: CargoCardProps) {
  const t = useTranslations('shipperMobileFlow.cargoCard');
  const tStatus = useTranslations('shipperMobileFlow.cargoDetail.status');

  return (
    <Link href={`/minhas-cargas/${cargo.id}`} className={styles.card}>
      <div className={styles.header}>
        <div>
          <p className={styles.code}>{cargo.code}</p>
          <p className={styles.route}>
            {cargo.origin} → {cargo.destination}
          </p>
        </div>
        <RiskBadge level={cargo.riskLevel} />
      </div>
      <div className={styles.metaRow}>
        <span className={`${styles.statusChip} ${statusClass(cargo.status)}`}>{tStatus(cargo.status)}</span>
      </div>
      <div className={styles.footer}>
        <FreshnessIndicator minutes={cargo.freshnessMinutes} state={cargo.freshnessState} />
        <span className={styles.cta}>
          {t('view')} <ChevronRight size={14} aria-hidden />
        </span>
      </div>
    </Link>
  );
}

export function CargoCardList({ cargoes }: { cargoes: ShipperOwnedCargo[] }) {
  return (
    <div className={styles.list}>
      {cargoes.map((cargo) => (
        <CargoCard key={cargo.id} cargo={cargo} />
      ))}
    </div>
  );
}
