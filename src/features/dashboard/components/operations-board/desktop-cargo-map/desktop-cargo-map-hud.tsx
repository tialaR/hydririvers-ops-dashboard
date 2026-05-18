'use client';

import { ChevronDown, ChevronUp, Radio, Ship } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import {
  extractDesktopMapConfidenceShort,
  extractDesktopMapEtaShort,
} from './desktop-cargo-map.helpers';
import styles from './desktop-cargo-map.module.scss';

type DesktopCargoMapHudProps = {
  cargo: Cargo;
  progressPercent: number;
  riverLabel: string;
  legendOpen: boolean;
  onLegendToggle: () => void;
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function connectivityToneClass(connectivity: Cargo['connectivity']) {
  if (connectivity === 'online') return styles.signal_online;
  if (connectivity === 'delayedSync') return styles.signal_delayed;
  if (connectivity === 'lowSignal') return styles.signal_low;
  return styles.signal_unknown;
}

export function DesktopCargoMapHud({
  cargo,
  progressPercent,
  riverLabel,
  legendOpen,
  onLegendToggle,
}: DesktopCargoMapHudProps) {
  const tBoard = useTranslations('operationsBoard');
  const tTracking = useTranslations('operationsBoard.mapTracking');
  const tCommon = useTranslations('common');
  const etaShort = extractDesktopMapEtaShort(cargo.etaConfidence);
  const confidenceShort = extractDesktopMapConfidenceShort(cargo.etaConfidence);
  const signalLabel = cargo.connectivity ? tCommon(`connectivity.${cargo.connectivity}`) : undefined;

  return (
    <div className={styles.floatingHud} aria-label={tBoard('map.hudAria')}>
      <div className={styles.floatingHudRow}>
        <div className={styles.floatingHudChip} title={tBoard('map.hud.progress')}>
          <span className={styles.floatingHudLabel}>{tBoard('map.hud.progress')}</span>
          <strong className={styles.floatingHudValue}>{progressPercent}%</strong>
          <span className={styles.floatingHudTrack} aria-hidden>
            <span className={styles.floatingHudFill} style={{ width: `${progressPercent}%` }} />
          </span>
        </div>

        {etaShort ? (
          <div className={styles.floatingHudChip} title={tTracking('eta')}>
            <span className={styles.floatingHudLabel}>{tTracking('eta')}</span>
            <strong className={styles.floatingHudValue}>{etaShort}</strong>
          </div>
        ) : null}

        {signalLabel ? (
          <div
            className={cx(styles.floatingHudChip, styles.floatingHudSignal, connectivityToneClass(cargo.connectivity))}
            title={tCommon('connectivityLabel')}
          >
            <span className={styles.floatingHudLabel}>
              <Radio size={12} strokeWidth={2.4} aria-hidden />
              {tCommon('connectivityLabel')}
            </span>
            <strong className={styles.floatingHudValue}>{signalLabel}</strong>
            {confidenceShort ? <span className={styles.floatingHudMeta}>{confidenceShort}</span> : null}
          </div>
        ) : confidenceShort ? (
          <div className={styles.floatingHudChip}>
            <span className={styles.floatingHudLabel}>{tBoard('map.hud.routeStatus')}</span>
            <strong className={styles.floatingHudValue}>{confidenceShort}</strong>
          </div>
        ) : null}
      </div>

      <div className={styles.legendDock}>
        <button
          type="button"
          className={styles.legendToggle}
          aria-expanded={legendOpen}
          aria-controls="desktop-cargo-map-legend"
          onClick={onLegendToggle}
        >
          {tBoard('map.legend')}
          {legendOpen ? (
            <ChevronDown size={14} strokeWidth={2.4} aria-hidden />
          ) : (
            <ChevronUp size={14} strokeWidth={2.4} aria-hidden />
          )}
        </button>

        {legendOpen ? (
          <div id="desktop-cargo-map-legend" className={styles.legendPanel} role="region" aria-label={tTracking('legendAria')}>
            <span className={styles.legendItem}>
              <span className={cx(styles.legendSwatch, styles.legendSwatch_origin)} aria-hidden />
              {tBoard('map.hud.origin')}
            </span>
            <span className={styles.legendItem}>
              <span className={cx(styles.legendSwatch, styles.legendSwatch_destination)} aria-hidden />
              {tBoard('map.hud.destination')}
            </span>
            <span className={styles.legendItem}>
              <Ship size={12} strokeWidth={2.2} aria-hidden />
              {tBoard('map.inOperation')}
            </span>
            <span className={styles.legendItem}>
              <span className={cx(styles.legendSwatch, styles.legendSwatch_traveled)} aria-hidden />
              {tBoard('map.hud.progress')}
            </span>
            <span className={styles.legendItem}>
              <span className={cx(styles.legendSwatch, styles.legendSwatch_corridor)} aria-hidden />
              {riverLabel}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
