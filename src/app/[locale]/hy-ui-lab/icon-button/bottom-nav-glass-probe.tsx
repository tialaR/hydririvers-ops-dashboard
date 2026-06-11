import styles from './bottom-nav-glass-probe.module.sass';

/**
 * BottomNav shell glass — alvo de paridade de transparência no lab.
 * Usa os mesmos tokens/superfície de `bottom-nav-hy-light-shell`.
 */
export function BottomNavGlassProbe() {
  return (
    <div className={styles.probe} data-ui-bottom-nav-glass-probe="true" aria-hidden>
      <p className={styles.label}>Alvo — transparência BottomNav</p>
      <div className={styles.track}>
        <span className={styles.dot} />
        <span className={styles.dot} data-active="true" />
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>
    </div>
  );
}
