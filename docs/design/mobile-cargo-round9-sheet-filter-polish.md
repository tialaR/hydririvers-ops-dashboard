# Mobile Cargo Round 9 — Sheet, Filters, Header and Dock Polish

## Problemas corrigidos

1. Filtros horizontais cortando na direita.
2. Tentativa anterior quebrou os filtros em duas linhas, fugindo do objetivo.
3. Gutter/padding lateral perceptível com cor diferente.
4. Header compacto pesado, com linha inferior marcada demais.
5. Sheet de card perdendo informações e fechando de forma abrupta.
6. Clique fora do sheet atravessando para cards por baixo.
7. Bottom dock com comportamento visual estranho.

## Decisões

- Filtros superiores usam scroll horizontal com `mask-image` para fade nas bordas.
- Conteúdo principal mantém padding, mas o fundo do root/lista foi neutralizado.
- `LiquidGlassSheet` agora bloqueia pointer/click/up no overlay para não vazar eventos para elementos abaixo.
- Snap expandido foi aumentado para 98vh.
- Card action sheet agora mostra resumo da carga antes da lista de ações.
- Bottom dock mantém item ativo expandido com label, mas sem active bubble duplicada.

## Arquivos principais

- `src/features/cargo/components/mobile-list-lab/mobile-cargo-list-lab.tsx`
- `src/features/cargo/components/mobile-list-lab/mobile-cargo-list-lab.module.scss`
- `src/shared/design-system/primitives/liquid-glass-sheet/liquid-glass-sheet.tsx`
- `src/shared/design-system/primitives/liquid-glass-sheet/liquid-glass-sheet.module.scss`
- `src/shared/design-system/primitives/liquid-glass-bottom-dock/liquid-glass-bottom-dock.module.scss`
