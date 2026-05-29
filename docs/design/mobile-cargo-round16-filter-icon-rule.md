# Mobile Cargo Round 16 — Filter Icon Rule

Rodada focada somente no componente de filtros da lista de cargas.

## Regra implementada

- Com `0` filtros aplicados: clicar no ícone de filtros abre o bottom sheet normalmente.
- Com `1+` filtros aplicados: clicar no ícone de filtros não abre o sheet direto; primeiro abre uma cápsula glass com duas ações:
  - Visualizar filtros: abre o bottom sheet de filtros.
  - Limpar filtros: remove todos os filtros aplicados.

## Remoção de redundância

A antiga barra/CTA de filtros ativos dentro da lista fica escondida, porque as ações agora pertencem ao próprio ícone de filtros.

## Áreas alteradas

- `mobile-cargo-list-lab.tsx`
- `mobile-cargo-list-lab.module.scss`
