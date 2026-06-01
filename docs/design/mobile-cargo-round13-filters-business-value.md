# Mobile Cargo Round 13 — filtros hidroviários

## Decisão

A Round 13 mantém o componente de filtros existente, mas adiciona valor operacional real ao sheet por meio de filtros ligados à decisão logística hidroviária.

## Filtros adicionados

- Tipo de carga: contêiner, granel sólido, granel líquido, carga geral e reefer.
- Tipo de embarcação: balsa porta-contêineres, balsa graneleira, balsa tanque, comboio misto e empurrador com balsa refrigerada.
- Disponibilidade / cut-off: janela 24h, cut-off 48h, próxima maré, restrição noturna e cut-off 12h.
- Calado máximo permitido: faixas operacionais de calado úteis em hidrovias sazonais.

## Regras de interação

- Status continua single-select.
- Origem é single-select.
- Destino é single-select.
- Tipo de carga, embarcação, cut-off e calado aceitam múltipla seleção.
- A ação redundante de atenção foi removida, pois `Atenção` já existe no status.

## Visual

- Footer transparente.
- Padding de 1.5rem entre a lista de filtros e o rodapé.
- Sem scrollbar visível no mobile.
- Botão de fechar com enquadramento mais equilibrado.
