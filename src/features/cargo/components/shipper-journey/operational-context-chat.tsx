'use client';

import {
  ArrowRight,
  Bot,
  CheckCircle2,
  CircleHelp,
  MessageSquareText,
  Paperclip,
  Send,
  Ship,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import type { ShipperProposal } from '@/features/cargo/owned/domain/shipper-journey.types';

import styles from './operational-context-chat.module.sass';

type PromptId = 'attention' | 'proposal' | 'documents' | 'hydro';

type ConversationTurn = {
  id: PromptId;
  label: string;
  answer: string;
};

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

export function OperationalContextChat({
  selectedProposal,
  referenceProposal,
}: {
  selectedProposal: ShipperProposal;
  referenceProposal: ShipperProposal;
}) {
  const catalog = useMemo<Array<ConversationTurn>>(() => {
    const etaDeltaMinutes = Math.round(
      (new Date(referenceProposal.arrivalAt).getTime() - new Date(selectedProposal.arrivalAt).getTime()) / 60000,
    );
    const priceDelta = selectedProposal.priceBRL - referenceProposal.priceBRL;
    const demurrageDelta =
      (referenceProposal.demurrage?.valueBRLPerHour ?? 0) -
      (selectedProposal.demurrage?.valueBRLPerHour ?? 0);

    return [
      {
        id: 'attention',
        label: 'Por que esta carga está em atenção?',
        answer:
          'O snapshot DEMO mantém uma pendência documental no MDF-e e condição hidroviária em acompanhamento. Para decidir a contraparte, o ponto principal é não perder a janela operacional enquanto a documentação é revalidada.',
      },
      {
        id: 'proposal',
        label: 'O que muda se eu aceitar esta proposta?',
        answer:
          `Com ${selectedProposal.counterparty.replace(' · DEMO', '')}, a chegada estimada fica em ${time(selectedProposal.arrivalAt)}, ${etaDeltaMinutes > 0 ? etaDeltaMinutes + ' min antes' : Math.abs(etaDeltaMinutes) + ' min depois'} da referência. O frete muda ${priceDelta >= 0 ? 'em +' : 'em -'}${money(Math.abs(priceDelta))} e a exposição de demurrage muda ${demurrageDelta >= 0 ? 'em -' : 'em +'}${money(Math.abs(demurrageDelta))}/h.`,
      },
      {
        id: 'documents',
        label: 'Qual documento ainda exige atenção?',
        answer:
          selectedProposal.compatibility.documents === 'ready'
            ? 'A proposta selecionada está documentalmente pronta neste snapshot DEMO. A divergência anterior permanece rastreada no contexto da carga, mas não bloqueia esta alternativa.'
            : 'A proposta selecionada ainda exige atenção documental antes do aceite. Revise o MDF-e e a evidência associada para evitar carregar uma pendência para a decisão comercial.',
      },
      {
        id: 'hydro',
        label: 'Qual é o impacto hidroviário desta escolha?',
        answer:
          `O cenário DEMO considera vazante em acompanhamento no corredor e compara compatibilidade de calado entre as alternativas. A proposta selecionada usa ${selectedProposal.vesselLabel.toLowerCase()} e está classificada como ${selectedProposal.compatibility.draft === 'compatible' ? 'compatível' : 'atenção'} para calado; em produção, a decisão precisa carregar fonte e freshness do contexto hidroviário.`,
      },
    ];
  }, [referenceProposal, selectedProposal]);

  const [askedIds, setAskedIds] = useState<PromptId[]>(['proposal']);
  const turns = askedIds
    .map((id) => catalog.find((item) => item.id === id))
    .filter((item): item is ConversationTurn => Boolean(item));

  const ask = (id: PromptId) => {
    setAskedIds((current) => (current.includes(id) ? current : [...current, id]));
  };

  return (
    <aside className={styles.root} data-testid="page62-d09-context-chat">
      <header className={styles.header}>
        <div className={styles.identity}>
          <span className={styles.avatar} data-semantic-role="neutral-icon"><Ship size={18} /></span>
          <span>
            <strong>Assistente operacional</strong>
            <small>Contexto da carga + proposta selecionada · DEMO</small>
          </span>
        </div>
        <span className={styles.contextBadge}><MessageSquareText size={14} /> contexto ativo</span>
      </header>

      <div className={styles.body}>
        <div className={styles.systemMessage}>
          <span className={styles.botAvatar} data-semantic-role="neutral-icon"><Bot size={17} /></span>
          <div>
            <strong>Posso explicar a decisão sem sair da negociação.</strong>
            <p>Pergunte sobre prazo, documentos, calado ou impacto comercial. As respostas usam o snapshot DEMO desta carga.</p>
          </div>
        </div>

        <div className={styles.suggestions} aria-label="Perguntas sugeridas">
          {catalog.map((prompt) => {
            const asked = askedIds.includes(prompt.id);
            return (
              <button
                key={prompt.id}
                type="button"
                aria-pressed={asked}
                onClick={() => ask(prompt.id)}
              >
                {asked ? <CheckCircle2 size={14} aria-hidden /> : <CircleHelp size={14} aria-hidden />}
                <span>{prompt.label}</span>
                <ArrowRight size={14} aria-hidden />
              </button>
            );
          })}
        </div>

        <div className={styles.thread} aria-live="polite">
          {turns.map((turn) => (
            <div className={styles.turn} key={turn.id}>
              <div className={styles.userMessage}>
                <span>{turn.label}</span>
              </div>
              <div className={styles.answer}>
                <span className={styles.botAvatar} data-semantic-role="neutral-icon"><Bot size={17} /></span>
                <div>
                  <p>{turn.answer}</p>
                  <span className={styles.answerEvidence}>
                    <CheckCircle2 size={14} /> resposta baseada no snapshot DEMO
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.composer} aria-label="Composer demonstrativo">
          <Paperclip size={17} aria-hidden />
          <span>Escolha uma pergunta sugerida para simular a consulta contextual</span>
          <button type="button" aria-label="Enviar consulta demonstrativa" disabled>
            <Send size={17} />
          </button>
        </div>
      </footer>
    </aside>
  );
}
