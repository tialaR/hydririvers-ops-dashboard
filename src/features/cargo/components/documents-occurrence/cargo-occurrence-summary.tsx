'use client';

import {
  AlertTriangle,
  ArrowRight,
  Clock3,
  FileWarning,
  MapPin,
  Scale,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

import { OperationalAlert } from '@/shared/design-system/components/operational-alert';

import styles from './documents-occurrence.module.sass';

type CargoOccurrenceSummaryProps = {
  onOpenCorrection?: () => void;
};

export function CargoOccurrenceSummary({
  onOpenCorrection,
}: CargoOccurrenceSummaryProps = {}) {
  return (
    <article className={styles.occurrencePanel} data-testid="page62-d07-occurrence">
      <header className={styles.occurrenceHeader}>
        <div className={styles.occurrenceHeading}>
          <span className={styles.occurrenceHeadingIcon} data-semantic-role="neutral-icon" aria-hidden>
            <FileWarning size={22} strokeWidth={1.9} />
          </span>
          <div>
            <small>OCORRÊNCIA OPERACIONAL</small>
            <h3>Divergência documental com impacto na janela</h3>
            <p>O peso declarado no MDF-e não coincide com a evidência de pesagem vinculada à carga.</p>
          </div>
        </div>
        <span className={styles.severity} data-semantic-status="warning">
          <AlertTriangle size={14} aria-hidden />
          Moderado
        </span>
      </header>

      <section className={styles.occurrenceComparison} aria-label="Causa, evidência e impacto">
        <div className={styles.occurrenceMetric}>
          <span className={styles.occurrenceMetricIcon} data-semantic-role="neutral-icon" aria-hidden>
            <Scale size={19} />
          </span>
          <small>DECLARADO</small>
          <strong>18,4 t</strong>
          <span>MDF-e enviado</span>
        </div>

        <span className={styles.occurrenceFlowArrow} aria-hidden>
          <ArrowRight size={19} />
        </span>

        <div className={styles.occurrenceMetric}>
          <span className={styles.occurrenceMetricIcon} data-semantic-role="neutral-icon" aria-hidden>
            <ShieldCheck size={19} />
          </span>
          <small>COMPROVADO</small>
          <strong>16,8 t</strong>
          <span>Evidência de pesagem</span>
        </div>

        <span className={styles.occurrenceFlowArrow} aria-hidden>
          <ArrowRight size={19} />
        </span>

        <div className={styles.occurrenceMetric} data-impact>
          <span className={styles.occurrenceMetricIcon} data-semantic-role="neutral-icon" aria-hidden>
            <Clock3 size={19} />
          </span>
          <small>IMPACTO</small>
          <strong>18:40</strong>
          <span>janela sob risco</span>
        </div>
      </section>

      <section className={styles.occurrenceContext}>
        <div>
          <span data-semantic-role="neutral-icon" aria-hidden><MapPin size={17} /></span>
          <div>
            <small>TRECHO AFETADO</small>
            <strong>Aproximação de Santarém · 18 km</strong>
          </div>
        </div>
        <div>
          <span data-semantic-role="neutral-icon" aria-hidden><UserRound size={17} /></span>
          <div>
            <small>RESPONSÁVEIS</small>
            <strong>Embarcadora + contraparte documental</strong>
          </div>
        </div>
        <div>
          <span data-semantic-role="neutral-icon" aria-hidden><Clock3 size={17} /></span>
          <div>
            <small>PRAZO DE MITIGAÇÃO</small>
            <strong>Hoje · 16:30</strong>
          </div>
        </div>
      </section>

      <section className={styles.mitigation} data-testid="occurrence-mitigation">
        <header>
          <div>
            <small>PLANO DE MITIGAÇÃO</small>
            <strong>2 de 4 etapas concluídas</strong>
          </div>
          <span>50%</span>
        </header>
        <div className={styles.mitigationTrack} aria-label="Plano de mitigação 50% concluído">
          <span />
        </div>
        <div className={styles.mitigationSteps}>
          <span data-done>Corrigir</span>
          <span data-done>Revalidar</span>
          <span>Reencaminhar</span>
          <span>Acompanhar confirmação</span>
        </div>
      </section>

      <OperationalAlert
        tone="warning"
        eyebrow="PRÓXIMA AÇÃO"
        badge="até 16:30"
        title="Corrigir e revalidar o MDF-e"
        description="A correção precisa ser concluída antes da aproximação do próximo marco operacional."
        actionLabel="Abrir correção"
        onAction={onOpenCorrection}
        testId="occurrence-primary-action"
      />
    </article>
  );
}
