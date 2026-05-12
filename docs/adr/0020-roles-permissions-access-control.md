# ADR 0020: Matriz central de papéis e permissões

## Status

Accepted

## Data

2026-05-10

## Contexto

HydriRivers passou a separar melhor embarcador, transportador, admin e visões institucionais. A navegação, as páginas e os serviços precisavam parar de decidir acesso de forma independente.

## Problema

As regras de permissão estavam espalhadas entre navegação, páginas, helpers de mock e serviços de domínio. Isso aumentava o risco de:

- menus inconsistentes;
- rotas expostas para perfis errados;
- acesso direto sem fallback claro;
- testes frágeis e difíceis de manter.

## Decisão

Centralizar papéis, permissões e acesso a rotas em helpers puros em `src/features/auth/domain/access-control.ts`, e reutilizar essa mesma política em navegação, páginas e serviços.

## Alternativas consideradas

1. Espalhar checks de role diretamente no JSX.
2. Criar um sistema complexo de RBAC no backend.
3. Deixar apenas a navegação filtrar itens.
4. Manter helpers puros e uma matriz simples por papel.

## Consequências positivas

- Regras ficam previsíveis e fáceis de testar.
- Sidebar, páginas e serviços falam a mesma linguagem de acesso.
- Novos perfis ou capacidades ficam mais fáceis de adicionar.
- O SSR continua estável porque a regra é determinística.

## Consequências negativas / trade-offs

- A camada central precisa ser mantida com disciplina.
- Algumas páginas ainda precisam de fallback específico por contexto.
- Se um novo fluxo surgir, a matriz deve ser atualizada antes da UI.

## Critérios de revisão futura

- Quando surgir um novo papel real.
- Quando governo deixar de ser apenas persona e virar role.
- Quando houver backend de autorização real.
- Quando algum fluxo exigir regras mais granulares do que o modelo atual.

## Links relacionados

- [docs/audits/roles-permissions-current-state.md](../audits/roles-permissions-current-state.md)
- [docs/product/roles-permissions-user-cases.md](../product/roles-permissions-user-cases.md)
