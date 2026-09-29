'use client';

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileWarning,
  MapPin,
  Scale,
  ShipWheel,
  UserRound,
} from 'lucide-react';

import { OperationalAlert } from '@/shared/design-system/components/operational-alert';
import { DocumentWeightComparisonChart } from '@/shared/design-system/patterns/operational-chart';

import styles from './documents-occurrence.module.sass';

type CargoOccurrenceSummaryProps = {
  onOpenCorrection?: () => void;
};

export function CargoOccurrenceSummary({
  onOpenCorrection,
}: CargoOccurrenceSummaryProps = {}) {
  return (
    <article className={styles.occurrencePanel} data-testid="page62-d07-occurrence">
      <header className={styles.occurrenceHeader} data-testid="occurrence-header">
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

      <div className={styles.occurrenceDecisionGrid} data-testid="occurrence-decision-grid">
        <section className={styles.occurrenceEvidenceCard} data-testid="occurrence-weight-evidence">
          <header>
            <div>
              <small>EVIDÊNCIA DE PESO</small>
              <strong>1,6 t de diferença entre o declarado e o comprovado</strong>
            </div>
            <span>+9,5%</span>
          </header>

          <DocumentWeightComparisonChart submitted={18.4} evidence={16.8} />

          <footer>
            <span>
              <Scale size={15} aria-hidden />
              <strong>18,4 t</strong>
              MDF-e enviado
            </span>
            <span>
              <CheckCircle2 size={15} aria-hidden />
              <strong>16,8 t</strong>
              evidência de pesagem
            </span>
          </footer>
        </section>

        <section className={styles.occurrenceImpactCard} data-testid="occurrence-operational-impact">
          <header>
            <small>IMPACTO OPERACIONAL</small>
            <strong>O que muda se nada for feito</strong>
          </header>

          <div className={styles.impactHero}>
            <span className={styles.impactHeroIcon} data-semantic-role="neutral-icon" aria-hidden>
              <Clock3 size={20} />
            </span>
            <div>
              <small>JANELA SOB RISCO</small>
              <strong>18:40</strong>
              <span>Correção precisa entrar antes do próximo marco.</span>
            </div>
          </div>

          <div className={styles.occurrenceContext}>
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
                <small>PRAZO</small>
                <strong>Hoje · 16:30</strong>
              </div>
            </div>
            <div>
              <span data-semantic-role="neutral-icon" aria-hidden><ShipWheel size={17} /></span>
              <div>
                <small>CONSEQUÊNCIA</small>
                <strong>Pressão na janela planejada de chegada</strong>
              </div>
            </div>
          </div>
        </section>
      </div>

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

        <ol className={styles.mitigationSteps}>
          <li data-done>
            <span>1</span>
            <div><strong>Corrigir</strong><small>Peso do MDF-e</small></div>
          </li>
          <li data-done>
            <span>2</span>
            <div><strong>Revalidar</strong><small>Documento corrigido</small></div>
          </li>
          <li>
            <span>3</span>
            <div><strong>Reencaminhar</strong><small>Contraparte documental</small></div>
          </li>
          <li>
            <span>4</span>
            <div><strong>Confirmar</strong><small>Retorno operacional</small></div>
          </li>
        </ol>
      </section>

      <OperationalAlert
        tone="warning"
        eyebrow="AÇÃO PRIORITÁRIA"
        badge="até 16:30"
        title="Corrigir e revalidar o MDF-e"
        description="Uma única ação resolve a divergência documental antes que ela pressione a janela de chegada."
        actionLabel="Abrir correção"
        onAction={onOpenCorrection}
        testId="occurrence-primary-action"
      />
    </article>
  );
}
