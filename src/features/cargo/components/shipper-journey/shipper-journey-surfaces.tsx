'use client';

import { Check, FileWarning, Radio, ShieldCheck } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

import type { ShipperDocumentEvidence, ShipperProposal } from '@/features/cargo/owned/domain/shipper-journey.types';
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
  onReview,
}: {
  proposals: ShipperProposal[];
  onReview?: () => void;
}) {
  const current = proposals[0];
  const alternative = proposals[1];
  if (!current || !alternative) return null;

  const etaDeltaMinutes = Math.round((new Date(current.arrivalAt).getTime() - new Date(alternative.arrivalAt).getTime()) / 60000);
  const priceDelta = alternative.priceBRL - current.priceBRL;
  const currentDemurrage = current.demurrage?.valueBRLPerHour;
  const alternativeDemurrage = alternative.demurrage?.valueBRLPerHour;

  return (
    <section className={styles.surface} data-testid="page62-d08-d09-negotiation">
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>D08–D09 · decisão comercial + coordenação</p>
          <h2 className={styles.title}>Negociação operacional</h2>
          <p className={styles.subtitle}>Compare preço, tempo, risco e restrições antes de confirmar a contraparte.</p>
        </div>
        <span className={styles.demoBadge}>DEMO</span>
      </header>

      <div className={styles.contextBar}>
        <span><strong>#HY-247-819 · proposta #PN-184</strong><small>Manaus → Santarém · janela operacional 18:40</small></span>
        <span className={styles.statusBadge}>Em negociação</span>
      </div>

      <div className={styles.negotiationGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>Comparar proposta</h3>
            <span className={styles.statusBadge}>2 válidas</span>
          </div>

          <div className={styles.proposalGrid}>
            {[current, alternative].map((proposal, index) => (
              <div className={styles.proposalCard} data-selected={index === 1} key={proposal.id}>
                <small>{proposal.counterparty}</small>
                <strong>{money(proposal.priceBRL)}</strong>
                <span className={styles.proposalMeta}>
                  <span>Chegada {time(proposal.arrivalAt)}</span>
                  <span>{proposal.vesselLabel}</span>
                  <span>validade {time(proposal.validityAt)}</span>
                </span>
              </div>
            ))}
          </div>

          <div className={styles.tradeTable}>
            <div className={styles.tradeRow}>
              <small>Chegada</small><span>{time(current.arrivalAt)}</span>
              <strong className={etaDeltaMinutes > 0 ? styles.deltaGood : styles.deltaWarn}>{etaDeltaMinutes > 0 ? '−' + etaDeltaMinutes + ' min' : '+' + Math.abs(etaDeltaMinutes) + ' min'}</strong>
              <span>{time(alternative.arrivalAt)}</span>
            </div>
            <div className={styles.tradeRow}>
              <small>Preço</small><span>{money(current.priceBRL)}</span>
              <strong className={priceDelta > 0 ? styles.deltaWarn : styles.deltaGood}>{priceDelta > 0 ? '+' : '−'} {money(Math.abs(priceDelta))}</strong>
              <span>{money(alternative.priceBRL)}</span>
            </div>
            <div className={styles.tradeRow}>
              <small>Demurrage</small><span>{currentDemurrage ? money(currentDemurrage) + '/h' : 'não informado'}</span>
              <strong>{alternativeDemurrage && currentDemurrage ? money(Math.abs(alternativeDemurrage - currentDemurrage)) : 'contratual'}</strong>
              <span>{alternativeDemurrage ? money(alternativeDemurrage) + '/h' : 'não informado'}</span>
            </div>
            <div className={styles.tradeRow}>
              <small>Validade</small><span>{time(current.validityAt)}</span><strong className={styles.deltaWarn}>−15 min</strong><span>{time(alternative.validityAt)}</span>
            </div>
          </div>

          <div className={styles.decisionRead}>
            <small className={styles.miniLabel}>LEITURA PARA DECISÃO</small>
            <strong>A alternativa custa R$ 550 a mais, chega 50 min antes e reduz a demurrage contratual em R$ 130/h.</strong>
          </div>

          <div className={styles.recommendation}>
            <div><small className={styles.miniLabel}>POR QUE ESTA PROPOSTA?</small><strong>Chega 50 min antes e reduz demurrage em R$ 130/h</strong></div>
            <span className={styles.recommendationMetrics}><span>ETA −50 min</span><span>−R$ 130/h</span></span>
          </div>
        </article>

        <OperationalCommunicationPanel onReview={onReview} />
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
  current,
  alternative,
  onConfirm,
  onCancel,
}: {
  current: ShipperProposal;
  alternative: ShipperProposal;
  onConfirm?: () => void;
  onCancel?: () => void;
}) {
  const etaDeltaMinutes = Math.round(
    (new Date(current.arrivalAt).getTime() - new Date(alternative.arrivalAt).getTime()) / 60000,
  );

  return (
    <section className={styles.surface} data-testid="page62-d10-review">
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>D10 · ação com consequência operacional</p>
          <h2 className={styles.title}>Revisar aceite da proposta</h2>
          <p className={styles.subtitle}>Antes de confirmar, veja exatamente o que muda e o que permanece dependente de validação.</p>
        </div>
        <span className={styles.demoBadge}>DEMO</span>
      </header>

      <article className={styles.reviewCard}>
        <p className={styles.eyebrow}>O QUE MUDA SE VOCÊ CONFIRMAR</p>
        <div className={styles.reviewGrid}>
          <div className={styles.reviewBlock}>
            <small>ANTES</small><strong>{current.counterparty}</strong><strong>{money(current.priceBRL)}</strong>
            <span>Chegada {time(current.arrivalAt)}</span><span>Demurrage {current.demurrage ? money(current.demurrage.valueBRLPerHour) + '/h' : 'não informado'}</span>
          </div>
          <div className={styles.reviewBlock + ' ' + styles.deltaBlock}>
            <small>EFEITO OPERACIONAL</small>
            <strong>{etaDeltaMinutes > 0 ? '−' + etaDeltaMinutes + ' min' : '+' + Math.abs(etaDeltaMinutes) + ' min'} chegada</strong>
            <span>{money(alternative.priceBRL - current.priceBRL)} custo</span>
            <span>calado: {alternative.compatibility.draft}</span>
          </div>
          <div className={styles.reviewBlock} data-after="true">
            <small>DEPOIS</small><strong>{alternative.counterparty}</strong><strong>{money(alternative.priceBRL)}</strong>
            <span>Chegada {time(alternative.arrivalAt)}</span><span>Demurrage {alternative.demurrage ? money(alternative.demurrage.valueBRLPerHour) + '/h' : 'não informado'}</span>
          </div>
        </div>

        <div className={styles.consequence}>
          <span><small className={styles.miniLabel}>DECISÃO EXPIRA</small><strong> A proposta precisa ser confirmada antes da validade indicada.</strong></span>
          <span className={styles.statusBadge}>{time(alternative.validityAt)}</span>
        </div>

        <div className={styles.actionBar}>
          <button className={styles.secondaryAction} type="button" onClick={onCancel}>Cancelar</button>
          <button className={styles.primaryAction} type="button" onClick={onConfirm}>Confirmar aceite</button>
        </div>
      </article>
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

      <div className={styles.changeGrid}>
        <div className={styles.changeCell}><small>Contraparte</small><strong>Operador B · DEMO</strong><span>alterada</span></div>
        <div className={styles.changeCell}><small>Chegada</small><strong>19:20 → 18:30</strong><span>−50 min</span></div>
        <div className={styles.changeCell}><small>Demurrage</small><strong>R$ 950/h → R$ 820/h</strong><span>−R$ 130/h</span></div>
        <div className={styles.changeCell}><small>MDF-e</small><strong>Revalidando</strong><span>em curso</span></div>
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

      <div className={styles.compareGrid}>
        <article className={styles.compareCard} data-tone="bad"><small>VALOR ENVIADO</small><strong>{document.observedValue}</strong><p className={styles.subtitle}>documento atual</p></article>
        <article className={styles.compareCard} data-tone="warn"><small>DIFERENÇA</small><strong>1,6 t</strong><p className={styles.subtitle}>corrigir antes da revalidação</p></article>
        <article className={styles.compareCard} data-tone="good"><small>EVIDÊNCIA</small><strong>{document.expectedValue}</strong><p className={styles.subtitle}>pesagem vinculada</p></article>
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
          <div className={styles.panelHeader}><h3>Eventos após a ação</h3><span className={styles.statusBadge}>5 eventos</span></div>
          <div className={styles.eventRail}>
            {[
              ['16:12', 'Aceite registrado', 'concluído', false],
              ['16:18', 'Contraparte confirmou', 'concluído', false],
              ['16:26', 'MDF-e validado', 'concluído', false],
              ['17:10', 'Posição atualizada', 'AIS + GPS', false],
              ['18:30', 'Próximo marco', 'chegada estimada', true],
            ].map(([eventTime, title, state, next]) => (
              <div className={styles.event} data-next={String(next)} key={String(eventTime)}><small>{eventTime}</small><i /><strong>{title}</strong><span className={styles.subtitle}>{state}</span></div>
            ))}
          </div>
        </article>

        <aside className={styles.panel + ' ' + styles.nextDecision}>
          <small>PRÓXIMA DECISÃO</small><strong>Chegada em Santarém</strong><p className={styles.deltaGood}>18:30 · sem ação imediata</p>
          <div className={styles.sourceBox}><ShieldCheck size={14} /> Nível atual DEMO: deve ser substituído por fonte hidrológica com timestamp antes de produção.</div>
          <div className={styles.sourceBox}><FileWarning size={14} /> Avisos e condições de navegabilidade precisam mostrar fonte, vigência e trecho afetado.</div>
          <div className={styles.actionBar}><button className={styles.secondaryAction} type="button" onClick={onReviewHydro}>Revisar contexto hidroviário</button></div>
        </aside>
      </div>
    </section>
  );
}
