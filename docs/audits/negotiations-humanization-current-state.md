# Auditoria — Humanização de Negociações (Estado Atual)

Data: 2026-05-11

## Problema observado

A rota **Negociações** apresenta cards visualmente consistentes com o tema operacional, mas com baixo nível de orientação para usuários leigos:

- O topo usa linguagem técnica (ex.: “pipeline”), sem explicar claramente propósito e valor.
- O usuário vê status/valores/próximo passo, mas nem sempre entende “o que isso significa para mim”.
- Falta um bloco curto inicial que ajude a priorizar: “o que precisa de resposta agora”.
- No mobile, a experiência depende de a grade virar uma lista previsível e com bom respiro.

## Componentes e arquivos principais

- Página: `src/app/[locale]/negociacoes/page.tsx`
- Lista/cards: `src/features/negotiations/components/negotiation-board/*`
- Mensagens i18n: `messages/pt-BR.json`, `messages/en-US.json`, `messages/es.json`

## Riscos

- Usuário leigo não entende rapidamente o que fazer na tela.
- Cards ficam “bonitos”, mas sem contexto suficiente para decisão.
- Sem resumo inicial, a prioridade (ex.: contrapropostas) pode passar despercebida.

## Recomendação

1. Humanizar o topo da página (label + descrição).
2. Adicionar bloco curto de orientação + resumo por status (com destaque para “precisa de resposta”).
3. Adicionar microcopy de significado por status no card (sem inventar funcionalidades).
4. Garantir layout mobile em coluna com bom espaçamento.

