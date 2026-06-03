'use client';

import { type CSSProperties, type KeyboardEvent } from 'react';

import { CargoLabV2StatusBadge } from '@/features/cargo/components/cargo-lab-v2/cargo-lab-v2-status-badge';
import {
  ChevronIcon,
  ContainerIcon,
  CubeIcon,
} from '@/features/cargo/components/cargo-lab-v2/cargo-lab-v2-icons';
import { CargoEtaBlock } from '@/features/cargo/components/cargo-eta-block';
import { CargoRouteLine } from '@/features/cargo/components/cargo-route-line';
import type { CargoLabV2 } from '@/features/cargo/types/cargo-lab-v2.types';

import styles from './CargoCard.module.scss';

export type CargoCardProps = {
  cargo: CargoLabV2;
  index?: number;
  onClick?: (cargo: CargoLabV2) => void;
  onPrimaryAction?: (cargo: CargoLabV2) => void;
  actionLabel?: string;
  className?: string;
  isSelected?: boolean;
  isDisabled?: boolean;
};

export function CargoCard({
  cargo,
  index = 0,
  onClick,
  onPrimaryAction,
  actionLabel,
  className,
  isDisabled = false,
}: CargoCardProps) {
  const resolvedActionLabel =
    actionLabel ?? (cargo.status === 'agendado' ? 'Ver detalhes' : 'Acompanhar');

  function handleOpen() {
    if (isDisabled) return;
    (onClick ?? onPrimaryAction)?.(cargo);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) {
      return;
    }

    event.preventDefault();
    handleOpen();
  }

  return (
    <article
      className={[styles.card, className].filter(Boolean).join(' ')}
      style={{ '--card-index': index } as CSSProperties}
      data-cargo-id={cargo.id}
      data-cargo-label={cargo.title}
      role={onClick || onPrimaryAction ? 'button' : undefined}
      tabIndex={onClick || onPrimaryAction ? 0 : undefined}
      aria-disabled={isDisabled || undefined}
      onClick={onClick || onPrimaryAction ? handleOpen : undefined}
      onKeyDown={onClick || onPrimaryAction ? handleKeyDown : undefined}
    >
      <div className={styles.cardHeader}>
        <span className={styles.cargoIcon}>
          {cargo.cargoType === 'Projeto' ? <ContainerIcon /> : <CubeIcon />}
        </span>
        <span className={styles.cargoId}>{cargo.id}</span>
        <CargoLabV2StatusBadge cargo={cargo} showDot={false} size="sm" variant="card" />
      </div>

      <h2>{cargo.title}</h2>

      <CargoRouteLine originLabel={cargo.origin} destinationLabel={cargo.destination} />

      <div className={styles.footer}>
        <CargoEtaBlock label="ETA" value={cargo.eta} />
        <span className={styles.cardAction} aria-hidden="true">
          {resolvedActionLabel} <ChevronIcon />
        </span>
      </div>
    </article>
  );
}
