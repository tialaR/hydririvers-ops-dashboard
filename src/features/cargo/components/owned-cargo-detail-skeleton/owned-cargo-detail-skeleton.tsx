import styles from './owned-cargo-detail-skeleton.module.sass';

export function OwnedCargoDetailSkeleton() {
  return (
    <div className={styles.root} data-testid="owned-cargo-detail-skeleton" aria-hidden>
      <div className={styles.header}>
        <div className={styles.backBar} />
        <div className={styles.titleLine} />
        <div className={styles.routeLine} />
        <div className={styles.statusChip} />
        <div className={styles.nextStep} />
      </div>
      <div className={styles.summaryGrid}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={styles.summaryMetric} />
        ))}
      </div>
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
