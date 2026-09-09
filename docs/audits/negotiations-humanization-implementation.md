# Negociações — humanização do centro de decisões comercial

## Problema observado

- O topo da página já usava `PageShell`, mas o rótulo ARIA da lista ainda falava em “pipeline comercial”, linguagem interna.
- Os cartões eram uma grade técnica: status sem explicação curta, valor competindo com metadados e próximo passo misturado com data em uma única linha pequena.
- Em telas estreitas, não havia reserva explícita de espaço para a bottom navigation, aumentando risco de conteúdo colidir com a barra inferior.

## O que foi alterado

- **Topo (`PageShell` + i18n `pages.negotiations`)**: eyebrow “Decisões comerciais” (uppercase via DS), título “Negociações”, subtítulo alinhado ao pedido do produto; `listSectionAriaLabel` sem jargão de pipeline.
- **Bloco de orientação**: texto do guia atualizado para focar em valores, contrapropostas e acordos prontos para avançar; resumo com **negociações ativas** (exclui entregues), **cotações abertas**, **contrapropostas**, **contratos em andamento** (contrato + embarque) e **valor em negociação** (soma dos valores mock).
- **Domínio** (`getNegotiationsSummary`): novos campos `active` e `contractsInProgress`; mantém `total` para compatibilidade e testes.
- **Cartões**: linhas com rótulos (embarcação sugerida, rota, contrapartes, valor estimado); chip “Precisa de resposta” em estágio contraproposta; próximo passo em bloco próprio com “Atualizado” + data; barra de progresso preservada.
- **Lista vazia**: cartão com título e descrição quando não há negociações no dataset.
- **Mobile**: grade de resumo responsiva (até uma coluna em telas estreitas); meta em coluna única em telas menores que 860px; `padding-bottom` no wrapper alinhado à bottom nav em mobile.
- **QA Assistant**: quatro cenários (`negotiations-counteroffer-review`, `negotiations-quote-waiting`, `negotiations-contract-advanced`, `negotiations-empty-list`) com `startRoute`, `datasetScenarioId`, `expectedResult` e `priority`.

## Como a página responde “para que serve”

O subtítulo e o guia explicam que a tela reúne propostas e contratos ligados às cargas e onde priorizar ação (contrapropostas pendentes).

## Como entrega valor

O resumo numérico traduz etapas comerciais em contagens claras; cada cartão liga carga, contraparte, rota, valor e próximo passo, reduzindo ambiguidade entre “aguardar”, “responder” ou “avançar contrato”.

## Design system aplicado

- Mesma linguagem visual da área logada: `Card` com gradiente sutil, borda `hx-line-soft`, acento ciano no próximo passo e âmbar/dourado em alertas comerciais (`Badge` warning) e ícone do card.
- `PageShell` mantém hierarquia eyebrow → título → descrição como em Cargas, sem duplicar o layout da lista pública.

## Testes executados

- `npm run typecheck`
- `npm run lint`
- `npm run check:i18n`
- `npm test`
- `npm run build`

## Pendências

- Detalhe `/negociacoes/[id]` pode receber o mesmo tratamento de microcopy em histórico e CTAs (fora do escopo desta iteração).
- Valores do resumo são soma parseada dos mocks; com API real, alinhar regra de “valor em negociação” com financeiro.
