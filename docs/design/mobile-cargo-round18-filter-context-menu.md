# Mobile Cargo Round 18 — Filter Context Menu

## Objetivo
Refinar o comportamento do ícone de filtros quando existem filtros ativos.

## Regra
- `0` filtros ativos: clique abre o sheet de filtros diretamente.
- `1+` filtros ativos: clique abre um menu contextual glass.

## Menu
O menu deve ser percebido como um único bloco glass, inspirado em popovers nativos:
- lista vertical;
- itens clicáveis, não pills/botões isolados;
- `Visualizar filtros` abre o bottom sheet;
- `Limpar filtros` limpa todos os filtros e fecha o menu.

## Correções técnicas
- Itens do menu usam `role="menuitem"` e `tabIndex` para interação por teclado.
- Captura de click/pointer/touch no menu bloqueia vazamento de evento.
- O botão circular do filtro esmaece quando o menu está aberto, deixando a leitura como um único componente.
