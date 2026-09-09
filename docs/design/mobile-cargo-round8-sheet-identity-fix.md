# Mobile Cargo Round 8 — Sheet + Identity Fix

## Foco

Rodada focada nos pontos observados nos vídeos e prints de 20:02–20:07:

- filtros horizontais não podem cortar à direita;
- página não pode abrir espaço lateral direito;
- scrollbars móveis não devem aparecer;
- todos os sheets devem ser arrastáveis;
- sheet deve voltar para um snap abaixo da metade e expandir até 95% da tela;
- fechamento do sheet deve escorregar para baixo de forma visível;
- sheet de card deve usar o mesmo comportamento base do sheet de filtros;
- conteúdo de cards/sheets não deve cortar informações importantes;
- header e botão de filtro precisam de vidro fosco mais forte;
- bottom dock mantém comportamento, mas o item ativo mostra nome.

## Arquivos alterados

- `src/features/cargo/components/mobile-list-lab/mobile-cargo-list-lab.tsx`
- `src/features/cargo/components/mobile-list-lab/mobile-cargo-list-lab.module.scss`
- `src/shared/design-system/primitives/liquid-glass-sheet/liquid-glass-sheet.tsx`
- `src/shared/design-system/primitives/liquid-glass-sheet/liquid-glass-sheet.module.scss`
- `src/shared/design-system/primitives/liquid-glass-bottom-dock/liquid-glass-bottom-dock.module.scss`

## Decisões

- O sheet de card deixou de ser um overlay manual separado e passou a usar o mesmo primitive `LiquidGlassSheet` do filtro.
- O snap `content` agora mira uma altura abaixo de metade da tela.
- O snap `expanded` mira 95% da tela.
- Os chips superiores agora quebram linha, evitando corte lateral em viewport estreita.
- O bottom dock usa item ativo expandido com label e itens inativos circulares.
