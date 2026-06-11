import styles from './negotiation-board-skeleton.module.scss';

export function NegotiationBoardSkeleton() {
  return (
    <div
      className={styles.root}
      data-negotiations-mobile-skeleton="true"
      aria-busy="true"
      role="status"
    >
      <div className={styles.summary} aria-hidden />
      <div className={styles.cardList} aria-hidden>
        {[0, 1, 2].map((index) => (
          <div key={index} className={styles.card}>
            <div className={styles.cardTitle} />
            <div className={styles.cardMetaRow}>
              <div className={styles.cardMeta} />
              <div className={styles.cardMeta} />
            </div>
            <div className={styles.progress} />
          </div>
        ))}
      </div>
    </div>
  );
}
