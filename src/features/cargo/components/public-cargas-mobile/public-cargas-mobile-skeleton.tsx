import styles from './public-cargas-mobile-skeleton.module.scss';

export function PublicCargasMobileSkeleton() {
  return (
    <section
      className={styles.root}
      data-theme="light"
      data-public-cargas-mobile-skeleton="true"
      data-public-cargas-mobile-skeleton-theme="light"
      aria-busy="true"
      role="status"
    >
      <div className={styles.shell} aria-hidden>
        <div className={styles.actionsRow}>
          <div className={styles.publishLink} />
        </div>
        <div className={styles.searchRow}>
          <div className={styles.searchBar} />
          <div className={styles.filterButton} />
        </div>
        <div className={styles.resultsMeta}>
          <div className={styles.resultsLead} />
          <div className={styles.clearAction} />
        </div>
        <div className={styles.cardList}>
          {[0, 1, 2].map((index) => (
            <div key={index} className={styles.card}>
              <div className={styles.cardRoute} />
              <div className={styles.cardMetaRow}>
                <div className={styles.cardMeta} />
                <div className={styles.cardMeta} />
              </div>
              <div className={styles.cardAction} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
