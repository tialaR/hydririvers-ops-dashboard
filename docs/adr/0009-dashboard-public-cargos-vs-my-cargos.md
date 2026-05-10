# Dashboard exibe cargas públicas; Minhas Cargas exibe cargas do usuário logado

## Status

Superseded

## Contexto

Dashboard e Minhas Cargas precisavam ter papéis diferentes para não duplicar informação nem vazar dados privados.

## Decisão

`Dashboard` agora representa a visão operacional da operação. `Cargas` lista o marketplace público. `Minhas cargas` lista apenas cargas do usuário atual.

## Consequências

- Evita duplicidade de dataset.
- Melhora clareza de navegação e permissão.
- Exige helpers de visibilidade bem definidos.

## Alternativas consideradas

- Usar o mesmo dataset com filtros distintos.

## Atualização

Esta decisão foi refinada por [0016 - Fronteiras entre Dashboard, Cargas e Minhas cargas](./0016-dashboard-cargas-minhas-cargas-boundaries.md), que formaliza o papel operacional do Dashboard e a separação mais clara entre mercado público e área privada.

## Data

2026-05-09

## Responsáveis

HydroRivers frontend/product team
