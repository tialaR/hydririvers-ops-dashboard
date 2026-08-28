import styles from './cargo-card-accent.module.sass';

export function CargoCardAccent() {
  return (
    <>
      <span className={styles.backPrimary} aria-hidden />
      <span className={styles.backSecondary} aria-hidden />
    </>
  );
}
