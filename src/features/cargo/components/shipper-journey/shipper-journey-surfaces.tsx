'use client';

import { ArrowLeft, BadgeDollarSign, Check, CheckCircle2, Clock3, FileCheck2, FileClock, FileWarning, Navigation2, Radio, Route, Scale, ShieldCheck, ShipWheel, TrendingUp, Waves } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslations } from 'next-intl';

import type { HydroCondition, OperationalSourceRef, ShipperDocumentEvidence, ShipperProposal } from '@/features/cargo/owned/domain/shipper-journey.types';
import { ActionOutcomeLedgerChart, DocumentWeightComparisonChart, PostActionReadinessArcChart, ProposalDecisionComparisonChart } from '@/shared/design-system/patterns/operational-chart';
import { OperationalAlert } from '@/shared/design-system/components/operational-alert';
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

function clockMinutes(value: string) {
  const [hour, minute] = time(value).split(':').map(Number);
  return (hour * 60) + minute;
}

function metricNumber(value?: string) {
  if (!value) return null;
  const parsed = Number(value.replace(',', '.').replace(/[^0-9.-]+/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function formatMetricTons(value: number) {
  return value.toFixed(1).replace('.', ',') + ' t';
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
  const t = useTranslations('page62Journey.negotiation');
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
          <button className={styles.iconBackButton} type="button" onClick={onBack} aria-label={t('backAria')}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className={styles.eyebrow}>{t('eyebrow')}</p>
            <h2 className={styles.title}>{t('title')}</h2>
            <p className={styles.subtitle}>{t('subtitle')}</p>
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
                <p className={styles.eyebrow}>{t('validProposals')}</p>
                <h3>{t('choose')}</h3>
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
        <button className={styles.primaryAction} type="button" onClick={() => onReview?.(selected.id)}>{t('review')}</button>
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
  const t = useTranslations('page62Journey.review');
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
          <button className={styles.iconBackButton} type="button" onClick={onBack} aria-label={t('back')}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className={styles.eyebrow}>{t('eyebrow')}</p>
            <h2 className={styles.title}>{t('title')}</h2>
            <p className={styles.subtitle}>{t('subtitle')}</p>
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
          <button className={styles.secondaryAction} type="button" onClick={onBack}>{t('back')}</button>
          <button className={styles.primaryAction} type="button" onClick={onConfirm}>{t('confirm')}</button>
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
  const t = useTranslations('page62Journey.feedback');
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

  const sourceIds = new Set([hydro.sourceId, ...hydro.constraints.map((constraint) => constraint.sourceId)]);
  const operationalSources = sources.filter((source) => sourceIds.has(source.id));
  const sourceSet = operationalSources.length ? operationalSources : sources.slice(0, 3);
  const trendLabel = hydro.trend === 'falling' ? 'vazante' : hydro.trend === 'rising' ? 'enchente' : 'estável';
  const hydroNeedsAttention = hydro.status !== 'normal';
  const proposalName = selected.counterparty.replace(' · DEMO', '');
  const referenceName = reference.counterparty.replace(' · DEMO', '');
  const stableCount = pendingDocument ? 3 : 4;
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
          <p className={styles.eyebrow}>{t('eyebrow')}</p>
          <h2 className={styles.title}>{t('title')}</h2>
          <p className={styles.subtitle}>{t('subtitle')}</p>
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
          <p>{selected.vesselLabel} · chegada {time(selected.arrivalAt)} · calado {draftAfter.toFixed(1).replace('.', ',')} m. A rota permanece Manaus → Santarém pelo corredor do Rio Amazonas.</p>
        </div>
        <div className={styles.actionFeedbackHeroValue}>
          <small>FRETE CONFIRMADO</small>
          <strong>{money(selected.priceBRL)}</strong>
          <span>proposta {selected.id.replace('proposal-', '').toUpperCase()} · estado persistido na jornada DEMO</span>
        </div>
      </motion.article>

      <div className={styles.actionFeedbackMetricStrip} data-testid="action-feedback-impact-metrics">
        <article>
          <Clock3 size={19} data-semantic-role="neutral-icon" />
          <span><small>CHEGADA</small><strong>{time(reference.arrivalAt)} → {time(selected.arrivalAt)}</strong></span>
          <em>{etaDeltaMinutes >= 0 ? '−' : '+'}{Math.abs(etaDeltaMinutes)} min</em>
        </article>
        <article>
          <BadgeDollarSign size={19} data-semantic-role="neutral-icon" />
          <span><small>DEMURRAGE</small><strong>{money(demurrageBefore)}/h → {money(demurrageAfter)}/h</strong></span>
          <em>{demurrageDelta >= 0 ? '−' : '+'}{money(Math.abs(demurrageDelta))}/h</em>
        </article>
        <article>
          <ShipWheel size={19} data-semantic-role="neutral-icon" />
          <span><small>CALADO CONTRATADO</small><strong>{draftBefore.toFixed(1).replace('.', ',')} → {draftAfter.toFixed(1).replace('.', ',')} m</strong></span>
          <em data-semantic-status={selected.compatibility.draft === 'compatible' ? 'success' : 'warning'}>{selected.compatibility.draft === 'compatible' ? 'compatível' : 'requer atenção'}</em>
        </article>
        <article>
          <FileCheck2 size={19} data-semantic-role="neutral-icon" />
          <span><small>DOCUMENTOS DA PROPOSTA</small><strong>{reference.compatibility.documents === 'ready' ? 'Prontos' : 'Atenção'} → {selected.compatibility.documents === 'ready' ? 'Prontos' : 'Revisar'}</strong></span>
          <em data-semantic-status={selected.compatibility.documents === 'ready' ? 'success' : 'warning'}>{selected.compatibility.documents === 'ready' ? 'sem bloqueio comercial' : 'pendência ativa'}</em>
        </article>
      </div>

      <div className={styles.actionFeedbackMainGrid}>
        <article className={styles.actionFeedbackImpactCard} data-testid="action-feedback-impact">
          <div className={styles.sectionHeading + ' ' + styles.actionFeedbackSectionHeading}>
            <span className={styles.actionFeedbackSectionIcon} aria-hidden><TrendingUp size={21} data-semantic-role="neutral-icon" /></span>
            <div>
              <p className={styles.eyebrow}>EFEITO DO ACEITE</p>
              <h3>Impacto confirmado da decisão</h3>
              <span>Cada linha usa a própria unidade; a leitura compara somente o antes e o depois daquela métrica.</span>
            </div>
            <span className={styles.actionFeedbackRouteBadge}><Route size={14} data-semantic-role="neutral-icon" />{referenceName} → {proposalName}</span>
          </div>

          <div className={styles.actionFeedbackImpactChart} data-testid="action-feedback-impact-chart">
            <ActionOutcomeLedgerChart
              arrivalBeforeMinutes={clockMinutes(reference.arrivalAt)}
              arrivalAfterMinutes={clockMinutes(selected.arrivalAt)}
              demurrageBefore={demurrageBefore}
              demurrageAfter={demurrageAfter}
              draftBefore={draftBefore}
              draftAfter={draftAfter}
              documentsBefore={reference.compatibility.documents}
              documentsAfter={selected.compatibility.documents}
            />
          </div>

          <div className={styles.actionFeedbackInterpretation}>
            <span className={styles.actionFeedbackInterpretationIcon} aria-hidden><Navigation2 size={20} data-semantic-role="neutral-icon" /></span>
            <span>
              <small>LEITURA OPERACIONAL</small>
              <strong>{deltaSummary}.</strong>
              <em>O corredor e o destino permanecem; mudou a condição operacional contratada.</em>
            </span>
          </div>
        </article>

        <article className={styles.actionFeedbackReadiness} data-testid="action-feedback-readiness">
          <div className={styles.sectionHeading + ' ' + styles.actionFeedbackSectionHeading}>
            <span className={styles.actionFeedbackSectionIcon} aria-hidden><ShieldCheck size={21} data-semantic-role="neutral-icon" /></span>
            <div>
              <p className={styles.eyebrow}>ESTADO PÓS-ACEITE</p>
              <h3>Prontidão operacional</h3>
              <span>{pendingDocument ? 'Três frentes fecharam; a documental continua visível até a revalidação.' : 'As quatro frentes estão estabilizadas para acompanhamento.'}</span>
            </div>
          </div>

          <div className={styles.actionFeedbackReadinessBody}>
            <div className={styles.actionFeedbackReadinessChart} data-testid="action-feedback-readiness-chart">
              <PostActionReadinessArcChart pendingDocument={Boolean(pendingDocument)} />
              <div className={styles.actionFeedbackReadinessLegend} data-testid="action-feedback-readiness-summary">
                <span>
                  <span className={styles.actionFeedbackReadinessLegendIcon} aria-hidden><CheckCircle2 size={19} data-semantic-role="neutral-icon" /></span>
                  <small>ESTÁVEIS</small>
                  <strong>{stableCount}</strong>
                  <em>frentes estabilizadas</em>
                </span>
                <span data-semantic-status={pendingDocument ? 'warning' : undefined}>
                  <span className={styles.actionFeedbackReadinessLegendIcon} aria-hidden><FileClock size={19} data-semantic-role="neutral-icon" /></span>
                  <small>EM VALIDAÇÃO</small>
                  <strong>{pendingDocument ? 1 : 0}</strong>
                  <em>{pendingDocument ? 'ação documental necessária' : 'nenhuma frente'}</em>
                </span>
                <span>
                  <span className={styles.actionFeedbackReadinessLegendIcon} aria-hidden><FileWarning size={19} data-semantic-role="neutral-icon" /></span>
                  <small>BLOQUEADAS</small>
                  <strong>0</strong>
                  <em>sem trava crítica</em>
                </span>
              </div>
            </div>

            <ul className={styles.actionFeedbackReadinessList}>
              <li>
                <span className={styles.actionFeedbackStateIcon}><CheckCircle2 size={19} data-semantic-role="neutral-icon" /></span>
                <span><small>DECISÃO</small><strong>Aplicada</strong><em>contraparte e termos registrados</em><b data-semantic-status="success">Confirmada</b></span>
              </li>
              <li>
                <span className={styles.actionFeedbackStateIcon}><BadgeDollarSign size={19} data-semantic-role="neutral-icon" /></span>
                <span><small>CONDIÇÃO COMERCIAL</small><strong>{money(selected.priceBRL)}</strong><em>{money(demurrageAfter)}/h de demurrage</em><b data-semantic-status="current">Vigente</b></span>
              </li>
              <li>
                <span className={styles.actionFeedbackStateIcon}><FileClock size={19} data-semantic-role="neutral-icon" /></span>
                <span><small>DOCUMENTOS</small><strong>{pendingDocument ? 'Revalidar ' + pendingDocument.label : 'Validados'}</strong><em>{pendingDocument ? 'aceite comercial preservado' : 'sem correção pendente'}</em><b data-semantic-status={pendingDocument ? 'warning' : 'success'}>{pendingDocument ? 'Atenção' : 'Pronto'}</b></span>
              </li>
              <li>
                <span className={styles.actionFeedbackStateIcon}><Waves size={19} data-semantic-role="neutral-icon" /></span>
                <span><small>HIDROVIA</small><strong>{trendLabel}</strong><em>{hydro.riverLabel} · acompanhamento contínuo</em><b data-semantic-status="current">Monitorar</b></span>
              </li>
            </ul>
          </div>
        </article>
      </div>

      <div className={styles.actionFeedbackOperationsGrid}>
        <article className={styles.actionFeedbackHydro} data-testid="action-feedback-hydro-context">
          <div className={styles.sectionHeading + ' ' + styles.actionFeedbackSectionHeading}>
            <span className={styles.actionFeedbackSectionIcon} aria-hidden><Route size={21} data-semantic-role="neutral-icon" /></span>
            <div>
              <p className={styles.eyebrow}>CORREDOR HIDROVIÁRIO</p>
              <h3>O que a decisão não pode perder de vista</h3>
              <span>Calado contratado não substitui profundidade observada, aviso de navegação ou freshness da fonte.</span>
            </div>
          </div>
          <div className={styles.actionFeedbackRoute} aria-label="Rota Manaus a Santarém">
            <span data-state="complete"><i />Manaus</span><b /><span data-state="current"><i />Trecho em operação</span><b /><span data-state="future"><i />Santarém</span>
          </div>
          <div className={styles.actionFeedbackHydroFacts}>
            <span><Waves size={18} data-semantic-role="neutral-icon" /><small>REGIME</small><strong>{trendLabel}</strong><em>ciclo hidrológico altera profundidade e programação</em></span>
            <span><ShipWheel size={18} data-semantic-role="neutral-icon" /><small>CALADO CONTRATADO</small><strong>{draftAfter.toFixed(1).replace('.', ',')} m</strong><em>não confundir com profundidade navegável</em></span>
            <span data-semantic-status={hydroNeedsAttention ? 'warning' : 'success'}><ShieldCheck size={18} data-semantic-role="neutral-icon" /><small>CONDIÇÃO</small><strong>{hydroNeedsAttention ? 'monitorar trecho' : 'sem restrição no snapshot'}</strong><em>{hydro.constraints[0]?.title ?? 'sem restrição registrada'}</em></span>
          </div>
          <div className={styles.actionFeedbackSources}>
            <div><small>FONTES DE PRODUÇÃO PREVISTAS</small><strong>Freshness acompanha a decisão</strong><p>Origem e idade do dado ficam visíveis para não transformar snapshot em verdade eterna.</p></div>
            <div>
              {sourceSet.slice(0, 3).map((source) => (
                <span data-testid="action-feedback-source" key={source.id}>
                  <strong>{source.authority}</strong><em>{source.label}</em><small>{source.mode.toUpperCase()} · {source.freshnessState === 'fresh' ? 'recente' : source.freshnessState === 'offline' ? 'offline' : 'snapshot'}</small>
                </span>
              ))}
            </div>
          </div>
        </article>

        <article className={styles.actionFeedbackSchedule} data-testid="action-feedback-next-steps">
          <div className={styles.sectionHeading + ' ' + styles.actionFeedbackSectionHeading}>
            <span className={styles.actionFeedbackSectionIcon} aria-hidden><Clock3 size={21} data-semantic-role="neutral-icon" /></span>
            <div><p className={styles.eyebrow}>PRÓXIMOS MARCOS</p><h3>Da confirmação ao monitoramento</h3><span>A tela encerra o aceite e prepara a continuação da operação.</span></div>
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
          <OperationalAlert
            tone="warning"
            eyebrow="RECUPERAÇÃO DOCUMENTAL"
            badge={pendingDocument.label}
            title="Revalidar a evidência sem desfazer o aceite"
            description={pendingDocument.observedValue && pendingDocument.expectedValue ? pendingDocument.observedValue + ' enviado · ' + pendingDocument.expectedValue + ' esperado. A divergência permanece rastreável até a correção.' : 'A divergência permanece rastreável enquanto a condição comercial segue aplicada.'}
            actionLabel="Tratar rejeição documental"
            onAction={onCorrection}
            testId="action-feedback-correction-branch"
          />
        ) : null}
        <OperationalAlert
          tone="info"
          eyebrow="PRÓXIMA LEITURA"
          badge="monitoramento"
          title="Acompanhar a carga no estado pós-ação"
          description="ETA, documentos, sinal e condição hidroviária passam a ser acompanhados no contexto da decisão já aplicada."
          actionLabel="Acompanhar carga"
          onAction={onMonitor}
          testId="action-feedback-monitoring-next"
        />
      </div>
    </section>
  );
}


export function CorrectionResubmitSurface({
  document,
  hydro,
  sources,
  cargoId,
  onSubmit,
  onBack,
}: {
  document: ShipperDocumentEvidence;
  hydro: HydroCondition;
  sources: OperationalSourceRef[];
  cargoId: string;
  onSubmit?: () => void;
  onBack?: () => void;
}) {
  const t = useTranslations('page62Journey.correction');
  const submittedWeight = metricNumber(document.observedValue) ?? 18.4;
  const evidenceWeight = metricNumber(document.expectedValue) ?? 16.8;
  const difference = Math.abs(submittedWeight - evidenceWeight);
  const differencePercent = submittedWeight > 0 ? (difference / submittedWeight) * 100 : 0;
  const receitaSource = sources.find((source) => source.authority === 'RECEITA');
  const dnitSource = sources.find((source) => source.authority === 'DNIT');
  const anaSource = sources.find((source) => source.authority === 'ANA');
  const trendLabel = hydro.trend === 'falling' ? 'vazante' : hydro.trend === 'rising' ? 'enchente' : 'estável';
  const correctionSteps = [
    { id: 'correct', title: 'Corrigir', description: 'Ajustar o MDF-e para a evidência confirmada', status: 'Em andamento', active: true },
    { id: 'revalidate', title: 'Revalidar', description: 'Submeter o documento ajustado à validação fiscal', status: 'Pendente', active: false },
    { id: 'forward', title: 'Reencaminhar', description: 'Atualizar vínculos e participantes da operação', status: 'Pendente', active: false },
    { id: 'monitor', title: 'Monitorar', description: 'Acompanhar retorno e próxima janela operacional', status: 'Pendente', active: false },
  ] as const;

  const evidenceItems = [
    {
      id: 'scale',
      icon: Scale,
      label: 'Pesagem vinculada',
      value: formatMetricTons(evidenceWeight),
      detail: document.evidenceIds[0] ?? 'evidência operacional',
      status: 'Validada',
      tone: 'success',
    },
    {
      id: 'manifest',
      icon: FileWarning,
      label: document.label + ' atual',
      value: formatMetricTons(submittedWeight),
      detail: document.evidenceIds[1] ?? 'manifesto em correção',
      status: 'Divergente',
      tone: 'critical',
    },
    {
      id: 'fiscal-links',
      icon: FileCheck2,
      label: 'Vínculos fiscais',
      value: 'NF-e + CT-e',
      detail: receitaSource?.label ?? 'Documentos fiscais eletrônicos',
      status: 'Preservados',
      tone: 'neutral',
    },
    {
      id: 'hydro',
      icon: Waves,
      label: 'Contexto hidroviário',
      value: hydro.riverLabel,
      detail: (dnitSource?.label ?? 'Hidrovia do Amazonas') + ' · ' + trendLabel,
      status: 'Acompanhar',
      tone: 'neutral',
    },
  ] as const;

  return (
    <section className={styles.surface + ' ' + styles.correctionSurface} data-testid="page62-d12-correction">
      <header className={styles.header}>
        <div className={styles.headerLead}>
          <button className={styles.iconBackButton} type="button" onClick={onBack} aria-label={t('back')}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className={styles.eyebrow}>{t('eyebrow')}</p>
            <h2 className={styles.title}>{t('title')}</h2>
            <p className={styles.subtitle}>{t('subtitle')}</p>
          </div>
        </div>
        <span className={styles.demoBadge}>DEMO</span>
      </header>

      <div className={styles.correctionMetricStrip} data-testid="correction-metrics">
        <article>
          <span className={styles.correctionMetricIcon}><FileWarning size={19} data-semantic-role="neutral-icon" /></span>
          <span><small>MDF-e ATUAL</small><strong>{formatMetricTons(submittedWeight)}</strong><em>valor declarado</em></span>
          <b data-semantic-status="critical">Divergente</b>
        </article>
        <article>
          <span className={styles.correctionMetricIcon}><Scale size={19} data-semantic-role="neutral-icon" /></span>
          <span><small>EVIDÊNCIA CONFIRMADA</small><strong>{formatMetricTons(evidenceWeight)}</strong><em>pesagem vinculada</em></span>
          <b data-semantic-status="success">Validada</b>
        </article>
        <article>
          <span className={styles.correctionMetricIcon}><Navigation2 size={19} data-semantic-role="neutral-icon" /></span>
          <span><small>AJUSTE NECESSÁRIO</small><strong>{formatMetricTons(difference)}</strong><em>{differencePercent.toFixed(1).replace('.', ',')}% do valor enviado</em></span>
          <b data-semantic-status="warning">Corrigir</b>
        </article>
      </div>

      <div className={styles.correctionWorkspace}>
        <article className={styles.correctionAnalysisCard} data-testid="correction-analysis">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>CONFRONTO DE PESO</p>
              <h3>Documento × evidência operacional</h3>
              <span>O gráfico prioriza a diferença real; cor fica reservada ao estado, não à decoração.</span>
            </div>
            <span className={styles.statusBadge}>toneladas</span>
          </div>

          <div className={styles.correctionChartStage} data-testid="correction-weight-chart">
            <DocumentWeightComparisonChart submitted={submittedWeight} evidence={evidenceWeight} variant="correction" />
          </div>

          <div className={styles.correctionChartRead}>
            <span><FileWarning size={16} data-semantic-role="neutral-icon" /><small>DIVERGÊNCIA</small><strong>{formatMetricTons(difference)}</strong></span>
            <p>O valor do manifesto precisa convergir com a evidência vinculada antes da próxima etapa de revalidação.</p>
          </div>

          <div className={styles.correctionEvidenceHeader}>
            <div>
              <p className={styles.eyebrow}>BASE DA CORREÇÃO</p>
              <h3>Evidências e vínculos preservados</h3>
            </div>
            <small>{document.evidenceIds.length} evidências diretas</small>
          </div>

          <div className={styles.correctionEvidenceGrid} data-testid="correction-evidence-list">
            {evidenceItems.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.id}>
                  <span className={styles.correctionEvidenceIcon}><Icon size={18} data-semantic-role="neutral-icon" /></span>
                  <span className={styles.correctionEvidenceCopy}>
                    <small>{item.label}</small>
                    <strong>{item.value}</strong>
                    <em>{item.detail}</em>
                  </span>
                  <b data-semantic-status={item.tone}>{item.status}</b>
                </article>
              );
            })}
          </div>
        </article>

        <aside className={styles.correctionSide} data-testid="correction-decision-rail">
          <OperationalAlert
            tone="danger"
            eyebrow="BLOQUEIO DOCUMENTAL"
            badge="ação requerida"
            title={document.label + ' precisa ser corrigido antes da revalidação'}
            description={formatMetricTons(submittedWeight) + ' enviado · ' + formatMetricTons(evidenceWeight) + ' confirmado pela evidência operacional.'}
            testId="correction-blocking-alert"
          />

          <article className={styles.correctionResolutionCard} data-testid="correction-next-action">
            <div className={styles.correctionResolutionHeader}>
              <span className={styles.correctionResolutionIcon}><FileClock size={19} data-semantic-role="neutral-icon" /></span>
              <div>
                <p className={styles.eyebrow}>RESOLUÇÃO</p>
                <h3>Salvar o novo valor e revalidar</h3>
                <span>Uma única ação documental destrava a próxima etapa.</span>
              </div>
            </div>

            <div className={styles.correctionResolutionHero}>
              <small>NOVO PESO DOCUMENTAL</small>
              <strong>{formatMetricTons(evidenceWeight)}</strong>
              <p>Valor confirmado pela pesagem vinculada. O ajuste preserva os documentos fiscais e o contexto da mesma operação.</p>
            </div>

            <div className={styles.correctionResolutionFacts}>
              <span><small>PRAZO</small><strong>{document.deadlineAt ? time(document.deadlineAt) : 'próximo marco'}</strong><em>para concluir a correção</em></span>
              <span><small>FONTE FISCAL</small><strong>{receitaSource?.authority ?? 'RECEITA'}</strong><em>{document.label} + vínculos fiscais</em></span>
              <span data-testid="correction-operation-context"><small>CORREDOR</small><strong>{hydro.riverLabel}</strong><em>{trendLabel} · {dnitSource?.authority ?? 'DNIT'} / {anaSource?.authority ?? 'ANA'}</em></span>
            </div>

            <div className={styles.correctionResolutionDivider} />

            <div className={styles.correctionChecklistHeader}>
              <div>
                <p className={styles.eyebrow}>ANTES DE REVALIDAR</p>
                <strong>2 de 4 condições prontas</strong>
              </div>
              <span className={styles.statusBadge}>pré-condições</span>
            </div>

            <ul className={styles.correctionResolutionChecklist} data-testid="correction-checklist">
              <li>
                <span><Check size={15} /></span>
                <div><strong>Evidência de peso identificada</strong><small>Pesagem vinculada ao caso</small></div>
                <b data-semantic-status="success">Pronto</b>
              </li>
              <li>
                <span><Check size={15} /></span>
                <div><strong>Valor-alvo confirmado</strong><small>{formatMetricTons(evidenceWeight)} será o novo peso</small></div>
                <b data-semantic-status="success">Pronto</b>
              </li>
              <li>
                <span><Clock3 size={15} /></span>
                <div><strong>Salvar correção no MDF-e</strong><small>Substituir apenas o valor divergente</small></div>
                <b data-semantic-status="warning">Agora</b>
              </li>
              <li>
                <span><Clock3 size={15} /></span>
                <div><strong>Enviar para revalidação</strong><small>Próxima etapa após salvar</small></div>
                <b>Pendente</b>
              </li>
            </ul>

            <div className={styles.correctionResolutionFooter}>
              <span><Route size={17} data-semantic-role="neutral-icon" /></span>
              <p><strong>Carga {cargoId}</strong> continua no mesmo corredor; o contexto hidroviário permanece informativo e não compete com a correção documental.</p>
            </div>
          </article>
        </aside>
      </div>

      <div className={styles.correctionProgress} data-testid="correction-progress">
        {correctionSteps.map((step, index) => (
          <article data-active={step.active} key={step.id}>
            <span className={styles.correctionStepNumber}>{index + 1}</span>
            <span><small>{step.title}</small><strong>{step.description}</strong></span>
            <b data-semantic-status={step.active ? 'warning' : undefined}>{step.status}</b>
          </article>
        ))}
      </div>

      <div className={styles.flowActionBar + ' ' + styles.correctionActionBar}>
        <button className={styles.secondaryAction} type="button" onClick={onBack}>{t('back')}</button>
        <span><strong>{formatMetricTons(evidenceWeight)}</strong> será o novo peso documental após salvar.</span>
        <button className={styles.primaryAction} type="button" onClick={onSubmit}>{t('submit')}</button>
      </div>
    </section>
  );
}
