'use client';

import { ArrowLeft, BadgeDollarSign, Check, CheckCircle2, Clock3, FileCheck2, FileWarning, Radio, Route, Scale, ShieldCheck, ShipWheel, TrendingUp } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

import type { ShipperDocumentEvidence, ShipperProposal } from '@/features/cargo/owned/domain/shipper-journey.types';
import { CargoTelemetryContextPanel } from '@/features/cargo/components/cargo-cockpit/cargo-telemetry-context-panel';
import { CargoQuickEvidencePanel } from '@/features/cargo/components/cargo-cockpit/cargo-quick-evidence-panel';
import { DocumentWeightComparisonChart, FollowUpHealthChart, OperationalGaugeChart, ProposalDecisionComparisonChart } from '@/shared/design-system/patterns/operational-chart';
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
  return new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
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
        <span><small>CONTEXTO HIDROVIÁRIO</small><strong>Rio Madeira · vazante</strong><em>DEMO · fonte ANA/DNIT prevista</em></span>
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
          onReview={() => onReview?.(selected.id)}
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

export function ActionFeedbackSurface({ onMonitor }: { onMonitor?: () => void }) {
  const reduceMotion = useReducedMotion();

  return (
    <section className={styles.surface} data-testid="page62-d11-feedback">
      <header className={styles.header}>
        <div><p className={styles.eyebrow}>D11 · feedback</p><h2 className={styles.title}>Ação concluída</h2></div>
        <span className={styles.demoBadge}>DEMO</span>
      </header>
      <motion.div
        className={styles.feedbackHero}
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        <div>
          <p className={styles.eyebrow}>AÇÃO APLICADA</p>
          <h3>Nova condição operacional confirmada</h3>
          <p className={styles.subtitle}>A decisão virou estado do produto e agora pode ser acompanhada.</p>
        </div>
        <motion.span className={styles.feedbackIcon} initial={reduceMotion ? false : { scale: 0.7 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 250, damping: 20 }}><Check /></motion.span>
      </motion.div>

      <div className={styles.feedbackBodyGrid}>
        <div className={styles.changeGrid}>
          <div className={styles.changeCell}><small>Contraparte</small><strong>Rio Norte · DEMO</strong><span>alterada</span></div>
          <div className={styles.changeCell}><small>Chegada</small><strong>19:20 → 18:30</strong><span>−50 min</span></div>
          <div className={styles.changeCell}><small>Demurrage</small><strong>R$ 950/h → R$ 820/h</strong><span>−R$ 130/h</span></div>
          <div className={styles.changeCell}><small>MDF-e</small><strong>Revalidando</strong><span>em curso</span></div>
        </div>
        <article className={styles.readinessCard}>
          <span className={styles.iconBubble}><CheckCircle2 size={24}/></span>
          <div><small>PRONTIDÃO OPERACIONAL</small><strong>86%</strong><p>Decisão aplicada; validação documental é o único item ainda em curso.</p></div>
          <OperationalGaugeChart value={86} label="Prontidão" ariaLabel="Prontidão operacional de 86%" />
          <div className={styles.segmentedReadiness}>
            <SegmentedGoalMeter
              value={3}
              max={4}
              segments={12}
              label="Etapas concluídas"
              valueLabel="3/4"
              targetLabel="ação completa"
              tone="success"
            />
          </div>
        </article>
      </div>

      <div className={styles.consequence}>
        <span><small className={styles.miniLabel}>RASTRO ATIVO</small><strong> decisão registrada → contraparte confirmada → validação documental → monitoramento</strong></span>
        <button className={styles.primaryAction} type="button" onClick={onMonitor}>Acompanhar carga</button>
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
