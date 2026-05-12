# Auditoria: Dashboard (Estado Atual de Humanizacao)

Data: 2026-05-11  
Branch: `feat/mock-mode-qa-assistant`

## 1. Contexto

O Dashboard e a porta de entrada operacional do produto. Ele precisa ser compreensivel para:

- usuarios leigos (primeiro contato);
- usuarios operacionais (rotina).

## 2. Blocos atuais do Dashboard

Fonte de verdade:

- `src/app/[locale]/dashboard/page.tsx`
- `src/features/dashboard/components/dashboard-overview/dashboard-overview.tsx`

Blocos:

- Header `PageShell` (eyebrow + titulo + descricao).
- Card guia (hero) com CTAs:
  - Marketplace publico (`/cargas`)
  - Minhas cargas (`/minhas-cargas`)
- KPIs/metric cards (cargas, documentos, embarcacoes, negociacoes, CO2).
- Painel de atencao (lista curta de cargas com risco/prontidao).
- Rotas/corredores com mais movimento.
- Atividade recente (lista/tabela de negociacoes recentes).

## 3. Problemas de compreensao identificados (antes da melhoria)

- Copy do topo era correta tecnicamente, mas fria/tecnica para usuario leigo.
- Existia redundancia de CTA:
  - um card de "Atalho operacional / Abrir o marketplace de cargas" repetia o card guia do overview.
- KPIs tinham hints tecnicos/curtos demais (ex.: "marketplace ativo") e nao explicavam impacto.
- Alguns blocos pareciam "dados soltos" para usuario leigo:
  - o por que daquele numero/importancia nao estava explicito.

## 4. Riscos/impacto

- Usuario leigo demora para entender:
  - "para que serve esta tela?"
  - "o que devo fazer agora?"
- Repeticao de CTA aumenta ruido visual e dilui prioridade.
- Sem microcopy, KPIs parecem decorativos.

## 5. Recomendacoes (para manter o Dashboard saudavel)

- Manter o Dashboard como **resumo guiado** (contexto + proximo passo).
- Evitar duplicar atalhos: um bloco orientador e suficiente.
- KPIs sempre com "o que e" + "por que importa" em 1 linha curta.
- Blocos de lista devem ter titulos com significado (ex.: "Precisa de atencao") e nao apenas nomes tecnicos.
- Em mobile, evitar tabelas apertadas: preferir cards/linhas empilhadas e scroll com respiro.

