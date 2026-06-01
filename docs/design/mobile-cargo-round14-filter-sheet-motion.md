# Mobile Cargo Round 14 — Filter Sheet Motion Polish

Esta rodada refina o sheet de filtros, feedback tátil e estados ativos sem alterar a arquitetura principal.

## Ajustes

- Header do sheet de filtros reposicionado com padding top/right de 1rem para o botão de fechar.
- Topo do sheet com baixa opacidade para manter sensação de vidro.
- Footer sticky translúcido, com distância de 1.5rem da lista e botão Limpar filtros com fundo legível.
- Sheet scrollável sem scrollbar visível.
- Busca já permanece com debounce e mínimo de 3 caracteres.
- Adicionado resumo de filtros ativos na página: visualizar filtros e limpar filtros.
- Microinterações de press em chips, search, botão de filtro, footer e botões de sheet.
- Hotfix incorporado: repository volta a cumprir o contrato `Cargo[]` e enriquecimento hidroviário fica no service.

## Backup

O script cria branch backup antes da aplicação.
