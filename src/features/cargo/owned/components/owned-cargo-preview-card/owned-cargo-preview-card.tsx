'use client';

import { useLocale, useTranslations } from 'next-intl';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import type { HydroIconName } from '@/shared/ui/hydro-icon/hydro-icon';
import type { OwnedCargoPreviewPanel, OwnedCargoPreviewState } from '@/features/cargo/domain/derive-owned-cargo-detail';
import { translateMock } from '@/shared/i18n/mock-content';
import styles from './owned-cargo-preview-card.module.sass';

type OwnedCargoPreviewCardProps = {
  panel: OwnedCargoPreviewPanel;
  state: OwnedCargoPreviewState;
  title: string;
  summary: string;
  statusLabel: string;
  icon: HydroIconName;
  detailMock?: string | null;
  onOpen: (panel: OwnedCargoPreviewPanel) => void;
};

export function OwnedCargoPreviewCard({
  panel,
  state,
  title,
  summary,
  statusLabel,
  icon,
  detailMock,
  onOpen,
}: OwnedCargoPreviewCardProps) {
  const t = useTranslations('pages.minhasCargas.detail.preview');
  const locale = useLocale();
  const detailLine = detailMock ? translateMock(locale, detailMock) : null;

  return (
    <button
      type="button"
      className={styles.card}
      data-panel-target={panel}
      data-preview-state={state}
      data-testid={`owned-cargo-preview-${panel}`}
      aria-label={t('openAria', { panel: title })}
      onClick={() => onOpen(panel)}
    >
      <div className={styles.header}>
        <span className={styles.iconWrap} aria-hidden>
          <HydroIcon name={icon} size={18} />
        </span>
        <span className={styles.title}>{title}</span>
      </div>

      <div className={styles.copyBlock}>
        <p className={styles.summary}>{summary}</p>
        {detailLine ? <p className={styles.detail}>{detailLine}</p> : null}
      </div>

      <div className={styles.footer}>
        <span className={styles.status} data-state={state}>
          {statusLabel}
        </span>
        <span className={styles.cta} aria-hidden>
          {t('ctaView')}
        </span>
      </div>
    </button>
  );
}
