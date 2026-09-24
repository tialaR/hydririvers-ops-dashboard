import styles from './documents-occurrence.module.sass';

export function CargoOccurrenceSummary() {
  return (
    <article className={styles.occurrencePanel} data-testid="page62-d07-occurrence">
      <h3 className={styles.panelTitle}>Ocorrência operacional</h3>
      <span className={styles.severity}>Moderado</span>
      <h4 className={styles.occurrenceTitle}>Divergência no manifesto</h4>
      <p className={styles.occurrenceLead}>Volume informado não coincide com a evidência anexada.</p>

      <div className={styles.impactChain}>
        <span className={styles.impactCell} data-tone="danger">
          <small>Causa</small>
          <strong>18,4 t enviado</strong>
        </span>
        <span className={styles.impactArrow}>→</span>
        <span className={styles.impactCell} data-tone="info">
          <small>Evidência</small>
          <strong>16,8 t comprovado</strong>
        </span>
        <span className={styles.impactArrow}>→</span>
        <span className={styles.impactCell} data-tone="warning">
          <small>Impacto</small>
          <strong>risco na janela 18:40</strong>
        </span>
      </div>

      <div className={styles.occurrenceMeta}>
        <span className={styles.metaBlock}>
          <small>Trecho afetado</small>
          <strong>Aproximação de Santarém · 18 km</strong>
        </span>
        <span className={styles.metaBlock}>
          <small>Responsável</small>
          <strong>Embarcadora + contraparte documental</strong>
        </span>
      </div>

      <div className={styles.mitigation}>
        <small>Plano de mitigação · 2/4</small>
        <p>Corrigir → revalidar → reenviar antes de 16:30</p>
        <div className={styles.mitigationTrack} aria-label="Plano de mitigação 50% concluído">
          <span />
        </div>
      </div>

      <button className={styles.correctionAction} type="button">Abrir correção →</button>
    </article>
  );
}
