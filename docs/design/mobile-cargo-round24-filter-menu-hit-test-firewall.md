# Mobile Cargo Round 24 — Filter Menu Hit-Test Firewall

## Objetivo
Corrigir o bug em que toques nas ações do menu de filtros atravessavam para os elementos por baixo, especialmente a search bar, e reforçar o vidro fosco do menu.

## Ajustes

- Adicionada uma camada global `filterLauncherGlobalShield` enquanto o menu está aberto.
- A camada continua ativa por alguns milissegundos depois de `Visualizar filtros` ou `Limpar filtros`, bloqueando o click mobile tardio.
- Ações do menu executam no `pointerdown` e também têm fallback no `click`.
- `nativeEvent.stopImmediatePropagation()` foi usado para impedir vazamento de eventos.
- O menu ficou com vidro fosco mais fechado: maior blur, menor transparência e camada interna mais opaca.

## Critérios de aceite

1. Com filtro ativo, tocar no ícone abre o menu.
2. Tocar em `Visualizar filtros` abre o bottom sheet e não foca a search bar.
3. Tocar em `Limpar filtros` limpa todos os filtros, remove o badge e mostra a lista completa.
4. Nenhum toque no menu dispara cards, search ou botões atrás.
5. O menu ainda tem aparência glass, mas o conteúdo atrás não fica legível.
