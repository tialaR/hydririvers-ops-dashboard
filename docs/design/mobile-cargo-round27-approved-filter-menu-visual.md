# Mobile Cargo Round 27 — Approved Filter Menu Visual

Escopo da rodada:

- preservar o comportamento modal/firewall que funcionou nas rodadas 25/26;
- refinar somente a identidade visual do menu acionado pelo ícone de filtros;
- manter o fundo fora do menu visível;
- fazer o blur/fosco atuar dentro do componente, impedindo leitura nítida do conteúdo atrás;
- harmonizar o menu com as cores dark hydro/glass da lista de cargas;
- ancorar visualmente o menu ao botão de filtros com ponteiro sutil;
- ajustar a ação do sheet de filtros para exibir “Visualizar filtros” em vez de “Aplicar”.

Critérios de aceite:

1. Com filtros ativos, clicar no ícone de filtro abre um menu glass único.
2. O menu conversa visualmente com cards, search e dock.
3. O conteúdo atrás do menu fica turvo dentro do componente, não legível.
4. O fundo fora do menu continua aparente e não recebe clique.
5. “Visualizar filtros” abre o bottom sheet.
6. “Limpar filtros” preserva o comportamento operacional já corrigido.
