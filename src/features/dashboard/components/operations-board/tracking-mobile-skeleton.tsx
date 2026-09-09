import styles from './tracking-mobile-skeleton.module.scss';

export function TrackingMobileSkeleton() {
  return (
    <div
      className={styles.root}
      data-tracking-mobile-skeleton="true"
      aria-busy="true"
      role="status"
    >
      <div className={styles.tabs} aria-hidden>
        <div className={styles.tab} />
        <div className={styles.tab} />
        <div className={styles.tab} />
      </div>
      <div className={styles.mapPanel} aria-hidden />
      <div className={styles.timeline} aria-hidden>
        {[0, 1].map((index) => (
          <div key={index} className={styles.timelineItem}>
            <div className={styles.timelineDot} />
            <div className={styles.timelineCopy}>
              <div className={styles.timelineTitle} />
              <div className={styles.timelineMeta} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
