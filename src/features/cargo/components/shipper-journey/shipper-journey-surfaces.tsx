'use client';

import { ArrowLeft, BadgeDollarSign, Check, CheckCircle2, Clock3, FileCheck2, FileClock, FileWarning, Navigation2, Radio, Route, Scale, ShieldCheck, ShipWheel, TrendingUp, Waves } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

import type { HydroCondition, OperationalSourceRef, ShipperDocumentEvidence, ShipperProposal } from '@/features/cargo/owned/domain/shipper-journey.types';
import { CargoTelemetryContextPanel } from '@/features/cargo/components/cargo-cockpit/cargo-telemetry-context-panel';
import { CargoQuickEvidencePanel } from '@/features/cargo/components/cargo-cockpit/cargo-quick-evidence-panel';
import { ActionAppliedImpactChart, DocumentWeightComparisonChart, FollowUpHealthChart, OperationalGaugeChart, ProposalDecisionComparisonChart } from '@/shared/design-system/patterns/operational-chart';
import { SegmentedGoalMeter } from '@/shared/design-system/patterns/segmented-goal-meter';
import { OperationalScheduleList } from '@/shared/design-system/patterns/operational-schedule-list';
import { OperationalContextChat } from './operational-context-chat';
import styles from './shipper-journey.module.sass';

function money(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

function time(value: string) {
  return new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Santarem' });
}

export function ProposalNegotiationSurface({
  proposals,
  selectedProposalId,
  onSelectProposal,
  onReview,
  onBack,
}: {
  proposals: ShipperProposal[];
  selectedProposalId: string;
  onSelectProposal?: (proposalId: string) => void;
  onReview?: (proposalId: string) => void;
  onBack?: () => void;
}) {
  const selected = proposals.find((proposal) => proposal.id === selectedProposalId) ?? proposals[1] ?? proposals[0];
  const reference = proposals.find((proposal) => proposal.id !== selected?.id) ?? proposals[0];
  if (!selected || !reference) return null;

  const priceValues = proposals.map((proposal) => proposal.priceBRL);
  const demurrageValues = proposals.map((proposal) => proposal.demurrage?.valueBRLPerHour ?? 0);
  const arrivalValues = proposals.map((proposal) => new Date(proposal.arrivalAt).getTime());
  const minPrice = Math.min(...priceValues);
  const maxPrice = Math.max(...priceValues);
  const minDemurrage = Math.min(...demurrageValues);
  const maxDemurrage = Math.max(...demurrageValues);
  const minArrival = Math.min(...arrivalValues);
  const maxArrival = Math.max(...arrivalValues);

  const normalizeLowerIsBetter = (value: number, min: number, max: number) => {
    if (max <= min) return 88;
    return Math.round(95 - ((value - min) / (max - min)) * 42);
  };
  const riskScore = (value: ShipperProposal['operationalRisk']) =>
    ({ info: 88, low: 92, medium: 66, high: 38, critical: 16 }[value] ?? 60);
  const docsScore = (value: ShipperProposal['compatibility']['documents']) =>
    ({ ready: 96, attention: 62, blocked: 18 }[value]);
  const draftScore = (value: ShipperProposal['compatibility']['draft']) =>
    ({ compatible: 96, attention: 60, incompatible: 14, unknown: 42 }[value]);
  const scores = (proposal: ShipperProposal): [number, number, number, number, number, number] => [
    riskScore(proposal.operationalRisk),
    docsScore(proposal.compatibility.documents),
    draftScore(proposal.compatibility.draft),
    normalizeLowerIsBetter(proposal.demurrage?.valueBRLPerHour ?? 0, minDemurrage, maxDemurrage),
    normalizeLowerIsBetter(proposal.priceBRL, minPrice, maxPrice),
    normalizeLowerIsBetter(new Date(proposal.arrivalAt).getTime(), minArrival, maxArrival),
  ];

  const etaDeltaMinutes = Math.round(
    (new Date(reference.arrivalAt).getTime() - new Date(selected.arrivalAt).getTime()) / 60000,
  );
  const priceDelta = selected.priceBRL - reference.priceBRL;
  const selectedDemurrage = selected.demurrage?.valueBRLPerHour ?? 0;
  const referenceDemurrage = reference.demurrage?.valueBRLPerHour ?? 0;
  const demurrageDelta = referenceDemurrage - selectedDemurrage;

  return (
    <section className={styles.surface + ' ' + styles.negotiationSurface} data-testid="page62-d08-d09-negotiation">
      <header className={styles.header}>
        <div className={styles.headerLead}>
          <button className={styles.iconBackButton} type="button" onClick={onBack} aria-label="Voltar para documentos e ocorrências">
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className={styles.eyebrow}>D08–D09 · decisão comercial + coordenação</p>
            <h2 className={styles.title}>Negociação operacional</h2>
            <p className={styles.subtitle}>Compare alternativas sem perder janela, restrição hidroviária ou evidência documental.</p>
          </div>
        </div>
        <span className={styles.demoBadge}>DEMO</span>
      </header>

      <div className={styles.negotiationContext} data-testid="negotiation-context-strip">
        <span><small>CARGA</small><strong>#HY-247-819</strong><em>Manaus → Santarém</em></span>
        <span><small>JANELA</small><strong>18:40</strong><em>marco operacional</em></span>
        <span><small>CONTEXTO HIDROVIÁRIO</small><strong>Rio Amazonas · vazante</strong><em>DEMO · fonte ANA/DNIT prevista</em></span>
        <span data-semantic-status="warning"><small>ATENÇÃO</small><strong>calado + prazo</strong><em>avaliar antes do aceite</em></span>
      </div>

      <div className={styles.negotiationGrid}>
        <div className={styles.negotiationMain}>
          <article className={styles.proposalChooser} data-testid="proposal-chooser">
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.eyebrow}>PROPOSTAS VÁLIDAS</p>
                <h3>Escolha a alternativa para comparar</h3>
                <span>A seleção muda gráfico, deltas e respostas do assistente.</span>
              </div>
              <span className={styles.statusBadge}>{proposals.length} opções</span>
            </div>

            <div className={styles.proposalGrid}>
              {proposals.map((proposal) => {
                const isSelected = proposal.id === selected.id;
                const needsAttention =
                  proposal.compatibility.documents !== 'ready' ||
                  proposal.compatibility.draft !== 'compatible';
                return (
                  <button
                    className={styles.proposalCard}
                    data-selected={isSelected}
                    aria-pressed={isSelected}
                    type="button"
                    key={proposal.id}
                    onClick={() => onSelectProposal?.(proposal.id)}
                  >
                    <span className={styles.proposalCardTop}>
                      <span>
                        <small>{proposal.counterparty}</small>
                        <strong>{money(proposal.priceBRL)}</strong>
                      </span>
                      <span className={styles.proposalSelection} aria-hidden>
                        {isSelected ? <Check size={15} /> : null}
                      </span>
                    </span>
                    <span className={styles.proposalCardFacts}>
                      <span><Clock3 size={16} /><small>Chegada</small><strong>{time(proposal.arrivalAt)}</strong></span>
                      <span><ShipWheel size={16} /><small>Calado</small><strong>{proposal.draftMeters ? proposal.draftMeters.toFixed(1).replace('.', ',') + ' m' : '—'}</strong></span>
                      <span><FileCheck2 size={16} /><small>Docs</small><strong>{proposal.compatibility.documents === 'ready' ? 'Prontos' : 'Atenção'}</strong></span>
                    </span>
                    <span className={styles.proposalCardFooter}>
                      <span>{proposal.vesselLabel}</span>
                      <span data-semantic-status={needsAttention ? 'warning' : 'success'}>
                        {needsAttention ? 'Requer leitura' : 'Sem bloqueio'}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </article>

          <article className={styles.decisionDashboard} data-testid="proposal-decision-dashboard">
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.eyebrow}>TRADE-OFF OPERACIONAL</p>
                <h3>{selected.counterparty.replace(' · DEMO', '')} × {reference.counterparty.replace(' · DEMO', '')}</h3>
                <span>Índice relativo para leitura rápida; os valores reais aparecem ao lado.</span>
              </div>
            </div>

            <div className={styles.decisionVisualGrid}>
              <div className={styles.visualPanel}>
                <ProposalDecisionComparisonChart
                  selectedLabel={selected.counterparty.replace(' · DEMO', '')}
                  referenceLabel={reference.counterparty.replace(' · DEMO', '')}
                  selectedScores={scores(selected)}
                  referenceScores={scores(reference)}
                />
              </div>

              <div className={styles.visualSummary}>
                <span>
                  <Clock3 size={20} data-semantic-role="neutral-icon"/>
                  <small>CHEGADA</small>
                  <strong>{time(selected.arrivalAt)}</strong>
                  <em>{etaDeltaMinutes >= 0 ? etaDeltaMinutes + ' min antes' : Math.abs(etaDeltaMinutes) + ' min depois'}</em>
                </span>
                <span>
                  <BadgeDollarSign size={20} data-semantic-role="neutral-icon"/>
                  <small>PREÇO</small>
                  <strong>{money(selected.priceBRL)}</strong>
                  <em>{priceDelta >= 0 ? '+' : '−'}{money(Math.abs(priceDelta))}</em>
                </span>
                <span>
                  <Route size={20} data-semantic-role="neutral-icon"/>
                  <small>CALADO</small>
                  <strong>{selected.draftMeters ? selected.draftMeters.toFixed(1).replace('.', ',') + ' m' : '—'}</strong>
                  <em>{selected.compatibility.draft === 'compatible' ? 'compatível' : 'atenção'}</em>
                </span>
                <span>
                  <FileCheck2 size={20} data-semantic-role="neutral-icon"/>
                  <small>DOCUMENTOS</small>
                  <strong>{selected.compatibility.documents === 'ready' ? 'Prontos' : 'Revisar'}</strong>
                  <em>{selected.compatibility.documents === 'ready' ? 'sem bloqueio' : 'pendência ativa'}</em>
                </span>
              </div>
            </div>

            <div className={styles.comparisonStrip} data-testid="proposal-comparison-strip">
              <span><small>Demurrage</small><strong>{money(selectedDemurrage)}/h</strong><em>{demurrageDelta >= 0 ? '−' : '+'}{money(Math.abs(demurrageDelta))}/h</em></span>
              <span><small>Validade</small><strong>{time(selected.validityAt)}</strong><em>decisão com prazo</em></span>
              <span><small>Risco operacional</small><strong>{selected.operationalRisk === 'low' ? 'Baixo' : 'Moderado'}</strong><em>snapshot DEMO</em></span>
              <span><small>Embarcação</small><strong>{selected.vesselLabel}</strong><em>compatibilidade de calado</em></span>
            </div>

            <div className={styles.decisionRead}>
              <div>
                <small className={styles.miniLabel}>LEITURA PARA DECISÃO</small>
                <strong>
                  {selected.counterparty.replace(' · DEMO', '')} {etaDeltaMinutes >= 0 ? 'antecipa' : 'posterga'} a chegada em {Math.abs(etaDeltaMinutes)} min,
                  {' '}muda o frete em {priceDelta >= 0 ? '+' : '−'}{money(Math.abs(priceDelta))}
                  {' '}e {demurrageDelta >= 0 ? 'reduz' : 'aumenta'} a demurrage em {money(Math.abs(demurrageDelta))}/h.
                </strong>
              </div>
              <span className={styles.decisionSource}>DEMO · decisão depende de fonte/freshness hidroviária em produção</span>
            </div>
          </article>
        </div>

        <OperationalContextChat
          selectedProposal={selected}
          referenceProposal={reference}
        />
      </div>

      <div className={styles.flowActionBar}>
        <button className={styles.secondaryAction} type="button" onClick={onBack}>Voltar</button>
        <span>Proposta selecionada: <strong>{selected.counterparty.replace(' · DEMO', '')}</strong></span>
        <button className={styles.primaryAction} type="button" onClick={() => onReview?.(selected.id)}>Revisar aceite</button>
      </div>
    </section>
  );
}

export function OperationalCommunicationPanel({ onReview }: { onReview?: () => void }) {
  return (
    <aside className={styles.panel + ' ' + styles.chat} data-testid="page62-d09-communication">
      <div className={styles.panelHeader}>
        <h3>Coordenação da carga</h3>
        <span className={styles.statusBadge}><Radio size={12} /> contexto ativo</span>
      </div>
      <div className={styles.chatBody}>
        <div className={styles.message}>Conseguimos antecipar a chegada para 18:30.<small>Rio Norte · 15:42</small></div>
        <div className={styles.message} data-own="true">Confirma demurrage e validade da proposta?<small>Você · 15:47</small></div>
        <div className={styles.message}>R$ 820/h. Validade até 16:45.<small>Rio Norte · 15:51</small></div>
      </div>
      <div className={styles.chatFooter}>
        <p><strong>Proposta + Trade-off + Conversa = Decisão.</strong> A conversa confirma os termos que sustentam a escolha.</p>
        <button className={styles.primaryAction} type="button" onClick={onReview}>Revisar aceite</button>
      </div>
    </aside>
  );
}

export function DecisionActionReviewSurface({
  selected,
  reference,
  onConfirm,
  onBack,
}: {
  selected: ShipperProposal;
  reference: ShipperProposal;
  onConfirm?: () => void;
  onBack?: () => void;
}) {
  const etaDeltaMinutes = Math.round(
    (new Date(reference.arrivalAt).getTime() - new Date(selected.arrivalAt).getTime()) / 60000,
  );
  const priceDelta = selected.priceBRL - reference.priceBRL;
  const demurrageDelta =
    (reference.demurrage?.valueBRLPerHour ?? 0) -
    (selected.demurrage?.valueBRLPerHour ?? 0);

  const selectedScores: [number, number, number, number, number, number] = [
    selected.operationalRisk === 'low' ? 92 : 66,
    selected.compatibility.documents === 'ready' ? 96 : 60,
    selected.compatibility.draft === 'compatible' ? 96 : 60,
    demurrageDelta >= 0 ? 92 : 58,
    priceDelta <= 0 ? 92 : 72,
    etaDeltaMinutes >= 0 ? 94 : 60,
  ];
  const referenceScores: [number, number, number, number, number, number] = [66, 62, 60, 64, 94, 62];

  return (
    <section className={styles.surface + ' ' + styles.reviewSurface} data-testid="page62-d10-review">
      <header className={styles.header}>
        <div className={styles.headerLead}>
          <button className={styles.iconBackButton} type="button" onClick={onBack} aria-label="Voltar à negociação">
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className={styles.eyebrow}>D10 · revisão antes da ação</p>
            <h2 className={styles.title}>Revisar aceite da proposta</h2>
            <p className={styles.subtitle}>Confirme consequência comercial, janela, calado, documentos e próximos passos antes de assumir a contraparte.</p>
          </div>
        </div>
        <span className={styles.demoBadge}>DEMO</span>
      </header>

      <div className={styles.reviewContext} data-testid="review-context-strip">
        <span><small>CARGA</small><strong>#HY-247-819</strong><em>Manaus → Santarém</em></span>
        <span><small>PROPOSTA</small><strong>{selected.counterparty.replace(' · DEMO', '')}</strong><em>{money(selected.priceBRL)}</em></span>
        <span><small>VALIDADE</small><strong>{time(selected.validityAt)}</strong><em>confirmar dentro da janela</em></span>
        <span data-semantic-status="success"><small>ESTADO</small><strong>Pronta para aceite</strong><em>sem bloqueio crítico</em></span>
      </div>

      <article className={styles.reviewHero} data-testid="review-selected-proposal">
        <div>
          <p className={styles.eyebrow}>PROPOSTA SELECIONADA</p>
          <h3>{selected.counterparty}</h3>
          <p>{selected.vesselLabel} · calado {selected.draftMeters ? selected.draftMeters.toFixed(1).replace('.', ',') + ' m' : 'não informado'} · chegada {time(selected.arrivalAt)}</p>
        </div>
        <strong>{money(selected.priceBRL)}</strong>
      </article>

      <div className={styles.reviewImpactCards} data-testid="review-impact-cards">
        <article><Clock3 size={19} data-semantic-role="neutral-icon"/><span><small>ETA</small><strong>{etaDeltaMinutes >= 0 ? '−' : '+'}{Math.abs(etaDeltaMinutes)} min</strong><em>vs. {time(reference.arrivalAt)}</em></span></article>
        <article><BadgeDollarSign size={19} data-semantic-role="neutral-icon"/><span><small>FRETE</small><strong>{priceDelta >= 0 ? '+' : '−'}{money(Math.abs(priceDelta))}</strong><em>vs. {money(reference.priceBRL)}</em></span></article>
        <article><Scale size={19} data-semantic-role="neutral-icon"/><span><small>DEMURRAGE</small><strong>{demurrageDelta >= 0 ? '−' : '+'}{money(Math.abs(demurrageDelta))}/h</strong><em>exposição contratual</em></span></article>
        <article><ShipWheel size={19} data-semantic-role="neutral-icon"/><span><small>CALADO</small><strong>{selected.draftMeters ? selected.draftMeters.toFixed(1).replace('.', ',') + ' m' : '—'}</strong><em>{selected.compatibility.draft === 'compatible' ? 'compatível' : 'atenção'}</em></span></article>
      </div>

      <div className={styles.reviewDecisionGrid}>
        <article className={styles.reviewChartCard}>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>IMPACTO DO ACEITE</p>
              <h3>Onde a proposta ganha ou cede</h3>
              <span>Leitura relativa, acompanhada pelos valores reais acima.</span>
            </div>
          </div>
          <ProposalDecisionComparisonChart
            selectedLabel={selected.counterparty.replace(' · DEMO', '')}
            referenceLabel={reference.counterparty.replace(' · DEMO', '')}
            selectedScores={selectedScores}
            referenceScores={referenceScores}
          />
        </article>

        <article className={styles.reviewChecklist} data-testid="review-preconfirm-checklist">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>CHECKLIST PRÉ-CONFIRMAÇÃO</p>
              <h3>O que precisa estar verdadeiro agora</h3>
            </div>
          </div>
          <ul>
            <li data-state="success"><CheckCircle2 size={17}/><span><strong>Documentos</strong><small>Proposta sem bloqueio documental</small></span></li>
            <li data-state="success"><CheckCircle2 size={17}/><span><strong>Calado</strong><small>Compatibilidade operacional confirmada no cenário DEMO</small></span></li>
            <li data-state="success"><CheckCircle2 size={17}/><span><strong>Janela</strong><small>Chegada estimada dentro do marco planejado</small></span></li>
            <li data-state="warning"><Clock3 size={17}/><span><strong>Prazo de aceite</strong><small>Confirmar até {time(selected.validityAt)}</small></span></li>
          </ul>
        </article>
      </div>

      <article className={styles.reviewNextSteps} data-testid="review-next-steps">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>APÓS CONFIRMAR</p>
            <h3>Próximos passos da operação</h3>
            <span>A decisão comercial já nasce conectada à coordenação e ao acompanhamento.</span>
          </div>
        </div>
        <OperationalScheduleList
          items={[
            { id: 'accept', time: 'agora', title: 'Registrar aceite', subtitle: 'Proposta selecionada vira condição vigente', status: '1', tone: 'neutral', icon: 'check' },
            { id: 'notify', time: '+5 min', title: 'Notificar coordenação', subtitle: 'Contraparte e operação recebem a decisão', status: '2', tone: 'neutral', icon: 'radio' },
            { id: 'sync', time: '+15 min', title: 'Atualizar cockpit', subtitle: 'ETA, demurrage e documentos passam ao novo estado', status: '3', tone: 'neutral', icon: 'clock' },
            { id: 'monitor', time: 'contínuo', title: 'Monitorar embarque', subtitle: 'Janela, calado, documentos e freshness', status: '4', tone: 'neutral', icon: 'calendar' },
          ]}
        />
      </article>

      <div className={styles.reviewActionBar}>
        <div>
          <small>PRONTA PARA CONFIRMAR</small>
          <strong>Sem bloqueio crítico no snapshot DEMO; atenção apenas ao prazo de validade.</strong>
        </div>
        <span>
          <button className={styles.secondaryAction} type="button" onClick={onBack}>Voltar à negociação</button>
          <button className={styles.primaryAction} type="button" onClick={onConfirm}>Confirmar proposta</button>
        </span>
      </div>
    </section>
  );
}

export function ActionFeedbackSurface({
  selected,
  reference,
  documents,
  hydro,
  sources,
  onMonitor,
  onCorrection,
}: {
  selected: ShipperProposal;
  reference: ShipperProposal;
  documents: ShipperDocumentEvidence[];
  hydro: HydroCondition;
  sources: OperationalSourceRef[];
  onMonitor?: () => void;
  onCorrection?: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const etaDeltaMinutes = Math.round(
    (new Date(reference.arrivalAt).getTime() - new Date(selected.arrivalAt).getTime()) / 60000,
  );
  const demurrageBefore = reference.demurrage?.valueBRLPerHour ?? 0;
  const demurrageAfter = selected.demurrage?.valueBRLPerHour ?? 0;
  const demurrageDelta = demurrageBefore - demurrageAfter;
  const draftBefore = reference.draftMeters ?? selected.draftMeters ?? 0;
  const draftAfter = selected.draftMeters ?? reference.draftMeters ?? 0;
  const draftDelta = draftBefore - draftAfter;
  const pendingDocument = documents.find((document) =>
    ['divergent', 'review', 'pending', 'blocked'].includes(document.state),
  );

  const scorePair = (delta: number): [number, number] => {
    if (delta > 0) return [62, 94];
    if (delta < 0) return [94, 62];
    return [82, 82];
  };
  const [windowBeforeScore, windowAfterScore] = scorePair(etaDeltaMinutes);
  const [demurrageBeforeScore, demurrageAfterScore] = scorePair(demurrageDelta);
  const [draftBeforeScore, draftAfterScore] = scorePair(draftDelta);
  const documentScore = (value: ShipperProposal['compatibility']['documents']) =>
    ({ ready: 96, attention: 62, blocked: 22 }[value]);
  const beforeScores: [number, number, number, number] = [
    windowBeforeScore,
    demurrageBeforeScore,
    draftBeforeScore,
    documentScore(reference.compatibility.documents),
  ];
  const afterScores: [number, number, number, number] = [
    windowAfterScore,
    demurrageAfterScore,
    draftAfterScore,
    documentScore(selected.compatibility.documents),
  ];

  const operationalRiskReadiness = (
    { info: 84, low: 96, medium: 72, high: 48, critical: 24 } as const
  )[selected.operationalRisk] ?? 60;
  const readinessScore = Math.round(
    (
      100 +
      (selected.compatibility.documents === 'ready' ? 100 : 66) +
      (selected.compatibility.draft === 'compatible' ? 100 : 64) +
      operationalRiskReadiness +
      (pendingDocument ? 45 : 100)
    ) / 5,
  );

  const sourceIds = new Set([hydro.sourceId, ...hydro.constraints.map((constraint) => constraint.sourceId)]);
  const operationalSources = sources.filter((source) => sourceIds.has(source.id));
  const sourceSet = operationalSources.length ? operationalSources : sources.slice(0, 3);
  const trendLabel = hydro.trend === 'falling' ? 'vazante' : hydro.trend === 'rising' ? 'enchente' : 'estável';
  const hydroNeedsAttention = hydro.status !== 'normal';
  const proposalName = selected.counterparty.replace(' · DEMO', '');
  const referenceName = reference.counterparty.replace(' · DEMO', '');
  const deltaSummary = [
    etaDeltaMinutes === 0
      ? 'ETA mantido'
      : etaDeltaMinutes > 0
        ? 'chegada antecipada em ' + etaDeltaMinutes + ' min'
        : 'chegada postergada em ' + Math.abs(etaDeltaMinutes) + ' min',
    demurrageDelta === 0
      ? 'demurrage mantida'
      : demurrageDelta > 0
        ? 'demurrage reduzida em ' + money(demurrageDelta) + '/h'
        : 'demurrage aumentada em ' + money(Math.abs(demurrageDelta)) + '/h',
    draftDelta === 0
      ? 'calado contratado mantido'
      : draftDelta > 0
        ? 'calado contratado reduzido em ' + draftDelta.toFixed(1).replace('.', ',') + ' m'
        : 'calado contratado aumentado em ' + Math.abs(draftDelta).toFixed(1).replace('.', ',') + ' m',
  ].join(' · ');

  return (
    <section className={styles.surface + ' ' + styles.actionFeedbackSurface} data-testid="page62-d11-feedback">
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>D11 · consequência da decisão</p>
          <h2 className={styles.title}>Decisão aplicada à operação</h2>
          <p className={styles.subtitle}>O aceite deixou de ser intenção: agora a tela mostra o que mudou, o que continua pendente e a próxima leitura operacional.</p>
        </div>
        <span className={styles.demoBadge}>DEMO</span>
      </header>

      <motion.article
        className={styles.actionFeedbackHero}
        data-semantic-status="success"
        data-testid="action-feedback-confirmation"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        <motion.span
          className={styles.actionFeedbackHeroMark}
          initial={reduceMotion ? false : { scale: 0.78 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 250, damping: 20 }}
          aria-hidden
        >
          <CheckCircle2 size={27} />
        </motion.span>
        <div className={styles.actionFeedbackHeroCopy}>
          <span className={styles.actionFeedbackStatus}><Check size={13} /> aceite registrado</span>
          <h3>{proposalName} assumiu a condição vigente da carga</h3>
          <p>
            {selected.vesselLabel} · chegada {time(selected.arrivalAt)} · calado {draftAfter.toFixed(1).replace('.', ',')} m.
            A rota permanece Manaus → Santarém pelo corredor do Rio Amazonas.
          </p>
        </div>
        <div className={styles.actionFeedbackHeroValue}>
          <small>FRETE CONFIRMADO</small>
          <strong>{money(selected.priceBRL)}</strong>
          <span>proposta {selected.id.replace('proposal-', '').toUpperCase()} · estado persistido na jornada DEMO</span>
        </div>
      </motion.article>

      <div className={styles.actionFeedbackMetricStrip} data-testid="action-feedback-impact-metrics">
        <article>
          <Clock3 size={18} data-semantic-role="neutral-icon" />
          <span><small>CHEGADA</small><strong>{time(reference.arrivalAt)} → {time(selected.arrivalAt)}</strong></span>
          <em data-semantic-status={etaDeltaMinutes >= 0 ? 'success' : 'warning'}>
            {etaDeltaMinutes >= 0 ? '−' : '+'}{Math.abs(etaDeltaMinutes)} min
          </em>
        </article>
        <article>
          <BadgeDollarSign size={18} data-semantic-role="neutral-icon" />
          <span><small>DEMURRAGE</small><strong>{money(demurrageBefore)}/h → {money(demurrageAfter)}/h</strong></span>
          <em data-semantic-status={demurrageDelta >= 0 ? 'success' : 'warning'}>
            {demurrageDelta >= 0 ? '−' : '+'}{money(Math.abs(demurrageDelta))}/h
          </em>
        </article>
        <article>
          <ShipWheel size={18} data-semantic-role="neutral-icon" />
          <span><small>CALADO CONTRATADO</small><strong>{draftBefore.toFixed(1).replace('.', ',')} → {draftAfter.toFixed(1).replace('.', ',')} m</strong></span>
          <em data-semantic-status={selected.compatibility.draft === 'compatible' ? 'success' : 'warning'}>
            {selected.compatibility.draft === 'compatible' ? 'compatível' : 'requer atenção'}
          </em>
        </article>
        <article>
          <FileCheck2 size={18} data-semantic-role="neutral-icon" />
          <span><small>DOCUMENTOS DA PROPOSTA</small><strong>{reference.compatibility.documents === 'ready' ? 'Prontos' : 'Atenção'} → {selected.compatibility.documents === 'ready' ? 'Prontos' : 'Revisar'}</strong></span>
          <em data-semantic-status={selected.compatibility.documents === 'ready' ? 'success' : 'warning'}>
            {selected.compatibility.documents === 'ready' ? 'sem bloqueio comercial' : 'pendência ativa'}
          </em>
        </article>
      </div>

      <div className={styles.actionFeedbackMainGrid}>
        <article className={styles.actionFeedbackImpactCard} data-testid="action-feedback-impact">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>ANTES × DEPOIS</p>
              <h3>Impacto operacional materializado</h3>
              <span>O gráfico resume a adequação relativa; os valores reais permanecem no eixo superior.</span>
            </div>
            <span className={styles.statusBadge}>{referenceName} → {proposalName}</span>
          </div>
          <div className={styles.actionFeedbackImpactChart}>
            <ActionAppliedImpactChart beforeScores={beforeScores} afterScores={afterScores} />
          </div>
          <div className={styles.actionFeedbackInterpretation}>
            <Navigation2 size={18} data-semantic-role="neutral-icon" />
            <span>
              <small>LEITURA DA MUDANÇA</small>
              <strong>{deltaSummary}.</strong>
              <em>O corredor e o destino não mudaram; mudou a condição operacional contratada.</em>
            </span>
          </div>
        </article>

        <article className={styles.actionFeedbackReadiness} data-testid="action-feedback-readiness">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>PRONTIDÃO PÓS-ACEITE</p>
              <h3>O que já está de pé</h3>
              <span>Sucesso não esconde pendência: cada estado continua explícito.</span>
            </div>
          </div>
          <div className={styles.actionFeedbackReadinessBody}>
            <div className={styles.actionFeedbackGauge}>
              <OperationalGaugeChart
                value={readinessScore}
                label="Prontidão"
                ariaLabel={'Prontidão operacional pós-aceite de ' + readinessScore + '%'}
              />
              <div>
                <strong>{readinessScore}%</strong>
                <small>prontidão operacional</small>
              </div>
            </div>
            <ul className={styles.actionFeedbackReadinessList}>
              <li data-semantic-status="success">
                <CheckCircle2 size={17} />
                <span><strong>Decisão aplicada</strong><small>contraparte e termos registrados</small></span>
              </li>
              <li data-semantic-status="success">
                <BadgeDollarSign size={17} />
                <span><strong>Condição comercial</strong><small>{money(selected.priceBRL)} · {money(demurrageAfter)}/h</small></span>
              </li>
              <li data-semantic-status={pendingDocument ? 'warning' : 'success'}>
                <FileClock size={17} />
                <span><strong>{pendingDocument ? pendingDocument.label + ' em revalidação' : 'Documentação operacional validada'}</strong><small>{pendingDocument ? 'a decisão comercial permanece aplicada' : 'sem correção pendente'}</small></span>
              </li>
              <li data-semantic-status="current">
                <Waves size={17} />
                <span><strong>Contexto hidroviário ativo</strong><small>{hydro.riverLabel} · {trendLabel} · monitoramento contínuo</small></span>
              </li>
            </ul>
            <div className={styles.actionFeedbackReadinessMeter}>
              <SegmentedGoalMeter
                value={pendingDocument ? 3 : 4}
                max={4}
                segments={12}
                label="Frentes estabilizadas"
                valueLabel={pendingDocument ? '3/4' : '4/4'}
                targetLabel={pendingDocument ? '1 em validação' : 'ação completa'}
                tone={pendingDocument ? 'warning' : 'success'}
              />
            </div>
          </div>
        </article>
      </div>

      <div className={styles.actionFeedbackOperationsGrid}>
        <article className={styles.actionFeedbackHydro} data-testid="action-feedback-hydro-context">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>CORREDOR HIDROVIÁRIO</p>
              <h3>O que a decisão não pode perder de vista</h3>
              <span>Calado contratado não substitui profundidade observada, aviso de navegação ou freshness da fonte.</span>
            </div>
            <span className={styles.statusBadge} data-semantic-status={hydroNeedsAttention ? 'warning' : 'success'}>
              {hydroNeedsAttention ? 'acompanhar' : 'estável'}
            </span>
          </div>

          <div className={styles.actionFeedbackRoute} aria-label="Rota Manaus a Santarém">
            <span data-state="complete"><i />Manaus</span>
            <b />
            <span data-state="current"><i />Trecho em operação</span>
            <b />
            <span data-state="future"><i />Santarém</span>
          </div>

          <div className={styles.actionFeedbackHydroFacts}>
            <span>
              <Waves size={17} data-semantic-role="neutral-icon" />
              <small>REGIME</small>
              <strong>{trendLabel}</strong>
              <em>ciclo hidrológico altera profundidade e programação</em>
            </span>
            <span>
              <ShipWheel size={17} data-semantic-role="neutral-icon" />
              <small>CALADO CONTRATADO</small>
              <strong>{draftAfter.toFixed(1).replace('.', ',')} m</strong>
              <em>não confundir com profundidade navegável</em>
            </span>
            <span data-semantic-status={hydroNeedsAttention ? 'warning' : 'success'}>
              <ShieldCheck size={17} />
              <small>CONDIÇÃO</small>
              <strong>{hydroNeedsAttention ? 'monitorar trecho' : 'sem restrição no snapshot'}</strong>
              <em>{hydro.constraints[0]?.title ?? 'sem restrição registrada'}</em>
            </span>
          </div>

          <div className={styles.actionFeedbackSources}>
            <div>
              <small>FONTES DE PRODUÇÃO PREVISTAS</small>
              <strong>Freshness deve acompanhar a decisão</strong>
            </div>
            <div>
              {sourceSet.slice(0, 3).map((source) => (
                <span data-testid="action-feedback-source" key={source.id}>
                  <strong>{source.authority}</strong>
                  <em>{source.label}</em>
                  <small>{source.mode.toUpperCase()} · {source.freshnessState === 'fresh' ? 'recente' : source.freshnessState === 'offline' ? 'offline' : 'snapshot'}</small>
                </span>
              ))}
            </div>
          </div>
        </article>

        <article className={styles.actionFeedbackSchedule} data-testid="action-feedback-next-steps">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>PRÓXIMOS MARCOS</p>
              <h3>Da confirmação ao monitoramento</h3>
              <span>A tela encerra o aceite e já prepara a continuação da operação.</span>
            </div>
          </div>
          <div className={styles.actionFeedbackScheduleBody}>
            <OperationalScheduleList
              items={[
                { id: 'accepted', time: 'agora', title: 'Aceite registrado', subtitle: proposalName + ' passa a ser a condição vigente', status: 'Concluído', tone: 'success', icon: 'check' },
                { id: 'coordination', time: '+5 min', title: 'Coordenação sincronizada', subtitle: 'ETA, demurrage e embarcação entram no contexto da carga', status: 'Sequência', tone: 'neutral', icon: 'radio' },
                { id: 'document', time: '+15 min', title: pendingDocument ? 'Revalidar ' + pendingDocument.label : 'Conferir evidências', subtitle: pendingDocument ? 'a divergência documental segue rastreável' : 'sem pendência documental ativa', status: pendingDocument ? 'Atenção' : 'Pronto', tone: pendingDocument ? 'warning' : 'success', icon: 'clock' },
                { id: 'monitor', time: 'contínuo', title: 'Monitorar corredor', subtitle: hydro.riverLabel + ' · ' + trendLabel + ' · fonte + timestamp', status: 'Ativo', tone: 'info', icon: 'calendar' },
              ]}
            />
          </div>
        </article>
      </div>

      <div className={styles.actionFeedbackFooter}>
        {pendingDocument ? (
          <div
            className={styles.actionFeedbackCorrectionBranch}
            data-semantic-status="warning"
            data-testid="action-feedback-correction-branch"
          >
            <FileWarning size={20} />
            <span>
              <small>RAMIFICAÇÃO DE RECUPERAÇÃO</small>
              <strong>Se a revalidação do {pendingDocument.label} falhar, corrija a evidência sem desfazer o aceite.</strong>
              <em>{pendingDocument.observedValue && pendingDocument.expectedValue ? pendingDocument.observedValue + ' enviado · ' + pendingDocument.expectedValue + ' esperado' : 'a divergência continua rastreável'}</em>
            </span>
            <button className={styles.secondaryAction} type="button" onClick={onCorrection}>Tratar rejeição documental</button>
          </div>
        ) : null}

        <div className={styles.actionFeedbackPrimaryNext}>
          <span>
            <small>PRÓXIMA LEITURA</small>
            <strong>Acompanhar ETA, documentos, sinal e condição hidroviária no estado pós-ação.</strong>
          </span>
          <button className={styles.primaryAction} type="button" onClick={onMonitor}>Acompanhar carga</button>
        </div>
      </div>
    </section>
  );
}


export function CorrectionResubmitSurface({
  document,
  onSubmit,
}: {
  document: ShipperDocumentEvidence;
  onSubmit?: () => void;
}) {
  return (
    <section className={styles.surface} data-testid="page62-d12-correction">
      <header className={styles.header}>
        <div><p className={styles.eyebrow}>D12 · correção baseada em evidência</p><h2 className={styles.title}>Corrigir documento rejeitado</h2></div>
        <span className={styles.demoBadge}>DEMO</span>
      </header>

      <div className={styles.errorHero}>
        <small className={styles.miniLabel}>DIVERGÊNCIA BLOQUEANTE</small>
        <p>{document.label} informa <strong>{document.observedValue}</strong>, enquanto a evidência operacional confirma <strong>{document.expectedValue}</strong>.</p>
      </div>

      <div className={styles.correctionVisualGrid}>
        <article className={styles.correctionChartCard}>
          <div className={styles.visualPanelHeader}>
            <span><Scale size={18}/><strong>Documento × evidência</strong></span>
            <small>a diferença precisa ser visível, não lida em parágrafo</small>
          </div>
          <DocumentWeightComparisonChart submitted={18.4} evidence={16.8} />
        </article>
        <div className={styles.compareGrid}>
          <article className={styles.compareCard} data-tone="bad"><small>VALOR ENVIADO</small><strong>{document.observedValue}</strong><p className={styles.subtitle}>documento atual</p></article>
          <article className={styles.compareCard} data-tone="warn"><small>DIFERENÇA</small><strong>1,6 t</strong><p className={styles.subtitle}>corrigir antes da revalidação</p></article>
          <article className={styles.compareCard} data-tone="good"><small>EVIDÊNCIA</small><strong>{document.expectedValue}</strong><p className={styles.subtitle}>pesagem vinculada</p></article>
        </div>
      </div>

      <div className={styles.stepper}>
        {['Corrigir', 'Revalidar', 'Reencaminhar', 'Monitorar'].map((step, index) => (
          <div className={styles.step} data-active={index === 0} key={step}><strong>{index + 1}. {step}</strong><div>{index === 0 ? 'ativo' : 'pendente'}</div></div>
        ))}
      </div>

      <div className={styles.actionBar}>
        <button className={styles.primaryAction} type="button" onClick={onSubmit}>Salvar correção e revalidar</button>
      </div>
    </section>
  );
}

export function FollowUpMonitoringSurface({ onReviewHydro }: { onReviewHydro?: () => void }) {
  const metrics = [
    ['ETA', '18:30', 74],
    ['Progresso', '72%', 72],
    ['Documentos', '8/8', 100],
    ['Risco', 'Baixo', 28],
    ['Ação de êxito', 'monitoramento ativo', 100],
  ] as const;

  return (
    <section className={styles.surface} data-testid="page62-d13-monitoring">
      <header className={styles.header}>
        <div><p className={styles.eyebrow}>D13 · pós-ação</p><h2 className={styles.title}>Acompanhamento após ação</h2><p className={styles.subtitle}>O dashboard deixa claro o estado atual, o que já fechou e a próxima decisão.</p></div>
        <span className={styles.demoBadge}>DEMO</span>
      </header>

      <div className={styles.monitoringMetrics}>
        {metrics.map(([label, value, progress]) => (
          <article className={styles.metric} key={label}><small>{label}</small><strong>{value}</strong><div className={styles.metricLine}><span style={{ width: String(progress) + '%' }} /></div></article>
        ))}
      </div>

      <div className={styles.monitoringGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}><h3>Saúde pós-ação</h3><span className={styles.statusBadge}><TrendingUp size={14}/> melhorando</span></div>
          <div className={styles.followUpChartWrap}>
            <FollowUpHealthChart />
          </div>
          <div className={styles.recentSignals}>
            <OperationalScheduleList
              items={[
                { id: 'mdfe', time: '16:26', title: 'MDF-e validado', subtitle: 'Prontidão documental restaurada', status: 'Concluído', tone: 'success', icon: 'check' },
                { id: 'position', time: '17:10', title: 'Posição atualizada', subtitle: 'AIS + GPS · freshness recente', status: 'Recente', tone: 'info', icon: 'radio' },
                { id: 'arrival', time: '18:30', title: 'Chegada estimada', subtitle: 'Santarém · próximo marco', status: 'Próximo', tone: 'warning', icon: 'calendar' },
              ]}
            />
          </div>
        </article>

        <aside className={styles.panel + ' ' + styles.nextDecision}>
          <small>PRÓXIMA DECISÃO</small><strong>Chegada em Santarém</strong><p className={styles.deltaGood}>18:30 · sem ação imediata</p>
          <div className={styles.sourceBox}><ShieldCheck size={16} /> Nível atual DEMO: deve ser substituído por fonte hidrológica com timestamp antes de produção.</div>
          <div className={styles.sourceBox}><FileWarning size={16} /> Avisos e condições de navegabilidade precisam mostrar fonte, vigência e trecho afetado.</div>
          <div className={styles.actionBar}><button className={styles.secondaryAction} type="button" onClick={onReviewHydro}>Revisar contexto hidroviário</button></div>
        </aside>
      </div>

      <div className={styles.monitoringCompactGrid}>
        <CargoTelemetryContextPanel />
        <CargoQuickEvidencePanel />
      </div>
    </section>
  );
}
