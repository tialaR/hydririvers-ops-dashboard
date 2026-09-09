import styles from './owned-cargo-detail-skeleton.module.sass';

export function OwnedCargoDetailSkeleton() {
  return (
    <div className={styles.root} data-testid="owned-cargo-detail-skeleton" aria-hidden>
      <div className={styles.header}>
        <div className={styles.backBar} />
        <div className={styles.editorialBand} />
        <div className={styles.identityCard}>
          <div className={styles.identityTop} />
          <div className={styles.titleLine} />
        </div>
        <div className={styles.contextGrid}>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className={styles.contextCard} />
          ))}
        </div>
      </div>
      <div className={styles.mapHero} />
      <div className={styles.previewGrid}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={styles.previewCard} />
        ))}
      </div>
      <div className={styles.actionsRow}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className={styles.actionChip} />
        ))}
      </div>
    </div>
  );
}
