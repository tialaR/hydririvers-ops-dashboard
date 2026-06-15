'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';
import { intlAppPaths } from '@/shared/routing/app-routes';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import type { HydroIconName } from '@/shared/ui/hydro-icon/hydro-icon';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { mapCargoStatusToBadgeStatus } from '@/features/cargo/utils/cargo-status-semantic';
import { translateMock } from '@/shared/i18n/mock-content';
import styles from './owned-cargo-detail-header.module.sass';

function resolveOriginLabel(origin: string): string {
  return origin.split(',')[0]?.trim() || origin;
}

function resolveDestinationLabel(destination: string): string {
  return destination.split(',')[0]?.trim() || destination;
}

function resolveCorridorLabel(cargo: Cargo): string {
  if (cargo.corridor?.trim()) return cargo.corridor.trim();
  if (cargo.mainRiver?.trim()) return cargo.mainRiver.trim();
  return '—';
}

function resolveCargoTypeLabel(cargo: Cargo): string {
  if (cargo.temperature?.trim()) return `${cargo.cargoType} · ${cargo.temperature}`;
  return cargo.cargoType;
}

const CONTEXT_ICONS: Record<string, HydroIconName> = {
  origin: 'route',
  destination: 'route',
  eta: 'clock',
  corridor: 'map',
  cargoType: 'cargo',
};

function showLivePill(status: Cargo['status']): boolean {
  return status === 'boarded' || status === 'reserved';
}

export function OwnedCargoDetailHeader({ cargo }: { cargo: Cargo }) {
  const tCommon = useTranslations('common');
  const tDetail = useTranslations('pages.minhasCargas.detail');
  const locale = useLocale();

  const title = translateMock(locale, cargo.title);
  const etaLabel = cargo.etaConfidence?.trim() || cargo.window;

  const contextItems = [
    { key: 'origin', label: tDetail('contextOrigin'), value: resolveOriginLabel(cargo.origin) },
    { key: 'destination', label: tDetail('contextDestination'), value: resolveDestinationLabel(cargo.destination) },
    { key: 'eta', label: tDetail('contextEta'), value: etaLabel },
    { key: 'corridor', label: tDetail('contextCorridor'), value: resolveCorridorLabel(cargo) },
    { key: 'cargoType', label: tDetail('contextCargoType'), value: resolveCargoTypeLabel(cargo) },
  ] as const;

  return (
    <header className={styles.root} data-testid="owned-cargo-detail-header">
      <div className={styles.topRow}>
        <Link
          href={intlAppPaths.cargos.myCargos}
          className={styles.backLink}
          aria-label={tDetail('backAria')}
        >
          <HydroIcon name="chevronDown" size={18} aria-hidden className={styles.backIcon} />
          <span>{tDetail('backLabel')}</span>
        </Link>
        {showLivePill(cargo.status) ? (
          <span className={styles.livePill}>
            <span className={styles.liveDot} aria-hidden />
            {tDetail('editorial.livePill')}
          </span>
        ) : null}
      </div>

      <div className={styles.identityCard} aria-label={tDetail('identityAria')}>
        <div className={styles.identityTop}>
          <span className={styles.code}>{cargo.id}</span>
          <span className={styles.statusChip} data-badge-status={mapCargoStatusToBadgeStatus(cargo.status)}>
            {tCommon(`cargoStatus.${cargo.status}`)}
          </span>
        </div>
        <h1 className={styles.title}>{title}</h1>
      </div>

      <div className={styles.contextGrid} aria-label={tDetail('contextAria')}>
        {contextItems.map((item) => (
          <div key={item.key} className={styles.contextCard} data-context={item.key}>
            <span className={styles.contextIcon} aria-hidden>
              <HydroIcon name={CONTEXT_ICONS[item.key] ?? 'cargo'} size={14} />
            </span>
            <span className={styles.contextLabel}>{item.label}</span>
            <strong className={styles.contextValue}>{item.value}</strong>
          </div>
        ))}
      </div>
    </header>
  );
}
