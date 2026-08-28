'use client';

import type { ComponentType } from 'react';
import { useTranslations } from 'next-intl';

import type { CargoDocument, OwnedCargo } from '@/features/cargo/owned/domain/owned-cargo-types';
import styles from '@/features/cargo/styles/cargo-flow.module.sass';

export type OwnedCargoDocumentsActionProps = {
  label: string;
  onClick: () => void;
};

type OwnedCargoDocumentsScreenProps = {
  cargo: OwnedCargo;
  documents: CargoDocument[];
  onResolveBlocker: () => void;
  ActionButton: ComponentType<OwnedCargoDocumentsActionProps>;
};

export function OwnedCargoDocumentsScreen({
  cargo,
  documents,
  onResolveBlocker,
  ActionButton,
}: OwnedCargoDocumentsScreenProps) {
  const t = useTranslations('shipperMobileFlow.documents');
  const hasBlocker = documents.some((document) => document.status === 'blocked');

  return (
    <div data-owned-cargo-documents={cargo.id}>
      <div className={styles.list}>
        {documents.map((document) => (
          <div key={document.id} className={styles.docRow}>
            <div>
              <p className={styles.title}>{t(`documents.${document.nameKey}`)}</p>
              {document.dueLabelKey ? <p className={styles.summary}>{t(document.dueLabelKey)}</p> : null}
            </div>
            <span className={styles.tileValue}>{t(`status.${document.status}`)}</span>
          </div>
        ))}
      </div>
      {hasBlocker ? <ActionButton label={t('resolve')} onClick={onResolveBlocker} /> : null}
    </div>
  );
}
