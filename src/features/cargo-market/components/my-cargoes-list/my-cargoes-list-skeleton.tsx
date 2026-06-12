import styles from './my-cargoes-list-skeleton.module.sass';

const SKELETON_CARD_COUNT = 3;

export function MyCargoesListSkeleton() {
  return (
    <div
      className={styles.root}
      data-minhas-cargas-skeleton="true"
      aria-busy="true"
      role="status"
    >
      <div className={styles.summaryRow} aria-hidden />
      <div className={styles.summaryGrid} aria-hidden>
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className={styles.summaryCard} />
        ))}
      </div>
      <div className={styles.cardList} aria-hidden>
        {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.cardTitle} />
            <div className={styles.cardMetaRow}>
              <div className={styles.cardMeta} />
              <div className={styles.cardMeta} />
            </div>
            <div className={styles.cardPanel} />
          </div>
        ))}
      </div>
    </div>
  );
}
