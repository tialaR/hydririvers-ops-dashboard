'use client';

import { Bot, CheckCircle2, MessageSquareText, Send, Ship, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

import styles from './operational-context-chat.module.sass';

type PromptId = 'attention' | 'proposal' | 'documents';

const promptCatalog: Array<{
  id: PromptId;
  label: string;
  answer: string;
  action?: string;
}> = [
  {
    id: 'attention',
    label: 'Por que esta carga está em atenção?',
    answer: 'Há uma divergência no MDF-e: 18,4 t declaradas contra 16,8 t na evidência vinculada. A correção precisa ser revalidada antes da janela operacional das 18:40.',
    action: 'Abrir evidências',
  },
  {
    id: 'proposal',
    label: 'O que muda se eu aceitar Rio Norte?',
    answer: 'A chegada estimada passa de 19:20 para 18:30. O preço sobe R$ 550, enquanto a demurrage contratual cai de R$ 950/h para R$ 820/h e a compatibilidade de calado melhora.',
    action: 'Revisar trade-off',
  },
  {
    id: 'documents',
    label: 'Qual documento bloqueia a operação?',
    answer: 'O ponto de atenção é o MDF-e. NF-e, CT-e e comprovante de coleta estão prontos neste snapshot DEMO. O MDF-e precisa ser corrigido e revalidado.',
    action: 'Abrir documentos',
  },
];

export function OperationalContextChat({
  onReview,
}: {
  onReview?: () => void;
}) {
  const [selectedPrompt, setSelectedPrompt] = useState<PromptId>('proposal');
  const selected = useMemo(
    () => promptCatalog.find((item) => item.id === selectedPrompt) ?? promptCatalog[0],
    [selectedPrompt],
  );

  return (
    <aside className={styles.root} data-testid="page62-d09-context-chat">
      <header className={styles.header}>
        <div className={styles.identity}>
          <span className={styles.avatar}><Ship size={18} /></span>
          <span>
            <strong>Coordenação da carga</strong>
            <small>#HY-247-819 · Rio Norte Logística · DEMO</small>
          </span>
        </div>
        <span className={styles.contextBadge}><MessageSquareText size={14} /> contexto ativo</span>
      </header>

      <div className={styles.body}>
        <div className={styles.systemMessage}>
          <span className={styles.botAvatar}><Bot size={17} /></span>
          <div>
            <strong>Resumo operacional</strong>
            <p>Tenho contexto da carga, proposta selecionada, condição documental e janela atual. Escolha uma pergunta para consultar o mock.</p>
          </div>
        </div>

        <div className={styles.suggestions} aria-label="Perguntas sugeridas">
          {promptCatalog.map((prompt) => (
            <button
              key={prompt.id}
              type="button"
              aria-pressed={selectedPrompt === prompt.id}
              onClick={() => setSelectedPrompt(prompt.id)}
            >
              <Sparkles size={14} aria-hidden />
              {prompt.label}
            </button>
          ))}
        </div>

        <div className={styles.userMessage}>
          <span>{selected.label}</span>
        </div>

        <div className={styles.answer}>
          <span className={styles.botAvatar}><Bot size={17} /></span>
          <div>
            <p>{selected.answer}</p>
            <span className={styles.answerEvidence}><CheckCircle2 size={14} /> resposta baseada no snapshot DEMO da carga</span>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.composer} aria-label="Composer demonstrativo">
          <span>Escolha uma sugestão acima para consultar o contexto da carga</span>
          <button type="button" aria-label="Enviar consulta demonstrativa" disabled>
            <Send size={17} />
          </button>
        </div>
        <button className={styles.reviewButton} type="button" onClick={onReview}>
          Revisar aceite
        </button>
      </footer>
    </aside>
  );
}
