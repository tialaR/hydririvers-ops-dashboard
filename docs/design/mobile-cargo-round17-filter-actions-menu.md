# Mobile Cargo Round 17 — Filter Actions Menu

## Objetivo

Refinar apenas o componente do ícone de filtros da lista mobile.

## Regras

1. `activeFilterCount === 0`
   - clique no ícone abre o sheet de filtros imediatamente.

2. `activeFilterCount > 0`
   - clique no ícone abre um menu glass vertical com duas ações:
     - Visualizar filtros
     - Limpar filtros

## Correções

- O menu deixou de parecer dois botões/pills.
- As ações agora têm apresentação de menu contextual Apple-like.
- A ação de limpar filtros usa `preventDefault` e `stopPropagation` para evitar fechamento/efeitos colaterais antes de limpar.
- A barra antiga `Visualizar filtros / Limpar filtros` fica escondida.
