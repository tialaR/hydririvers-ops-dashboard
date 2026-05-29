# Round 25 — Filter Menu Modal Firewall

## Correções

- Menu de ações do filtro renderizado como camada modal de topo.
- Interações fora do menu são bloqueadas em `pointerdown`, `click`, `touchstart` e `touchend` no capture phase.
- Durante ações do menu, uma guarda permanece ativa para absorver o clique tardio do mobile.
- Vidro fosco mais fechado: blur forte, fundo mais opaco, conteúdo atrás não legível.

## Critérios de aceite

1. Abrir menu com filtros ativos.
2. Tocar em `Limpar filtros` não foca a busca.
3. Tocar em `Limpar filtros` remove badge e volta lista completa.
4. Tocar em `Visualizar filtros` abre o sheet.
5. Tocar fora do menu fecha o menu sem acionar componentes por trás.
