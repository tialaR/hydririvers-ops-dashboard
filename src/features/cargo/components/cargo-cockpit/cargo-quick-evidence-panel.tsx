import styles from './cargo-cockpit-panels.module.sass';

const items = [
  { label: 'NF-e', status: 'Pronta', tone: 'success' },
  { label: 'Romaneio', status: 'Em revisão', tone: 'warning' },
  { label: 'Manifesto', status: 'Pendente', tone: 'danger' },
] as const;

export function CargoQuickEvidencePanel() {
  return (
    <article className={styles.evidencePanel} data-testid="page62-d04-evidence">
      <h3 className={styles.panelTitle}>Evidências rápidas</h3>
      <div className={styles.evidenceList}>
        {items.map((item) => (
          <div className={styles.evidenceRow} key={item.label}>
            <span>{item.label}</span>
            <span className={styles.status} data-tone={item.tone}>{item.status}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
