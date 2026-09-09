# 0026 — Negociações como central de decisões comerciais

Status: **Aceito**  
Data: **2026-05-11**

## Contexto

O produto precisa atender usuários leigos e operacionais. A tela de **Negociações** já possui bons cards, mas não orienta claramente “onde agir”, nem explica o valor do que está sendo exibido.

## Problema

- Copy técnica (“pipeline”) diminui compreensão.
- Sem resumo e orientação, a prioridade (ex.: contrapropostas) se perde.
- Cards mostram dados, mas faltam “significados” curtos para guiar decisão.

## Decisão

Evoluir **Negociações** para uma **central de decisões comerciais**, alinhada ao Design System de Cargas, porém com propósito próprio:

- Topo humanizado (explica a função da página).
- Bloco inicial curto de orientação.
- Resumo por status derivado da mesma lista renderizada.
- Microcopy curta por status para reduzir ambiguidade (ex.: “Precisa de resposta”).

## Alternativas consideradas

1. Manter Negociações como grade técnica de cards.
2. Transformar Negociações em tabela financeira.
3. Fundir Negociações com Cargas.
4. Humanizar Negociações como central de decisões (decisão escolhida).

## Consequências positivas

- Usuário entende rapidamente o que a tela entrega.
- Prioridades ficam explícitas (contrapropostas).
- Consistência visual aumenta sem duplicar a função da tela de Cargas.

## Trade-offs

- Um resumo por status pode gerar expectativa de métricas “oficiais”; por isso ele deve ser derivado da mesma fonte e permanecer simples.
- Se existir separação por role (shipper/carrier), a copy pode precisar variar por perfil no futuro.

## Critérios de revisão futura

- Quando houver RBAC/capabilities maduros, avaliar copy e filtros por perfil.
- Se surgirem muitos status, revisar o conjunto de resumo para manter foco (sem virar dashboard dentro da tela).

