# Mobile Cargo Round 11 — Apple Glass Cohesion

## Correções principais

- Header compacto com material translúcido, sem linha inferior pesada.
- Bottom dock icon-only inspirado na referência de veículo: trilha translúcida + lente ativa clara.
- Overlay do bottom sheet agora fecha no `click`, não no `pointerdown`, evitando vazamento de clique para cards por baixo.
- Bottom sheet com transição de saída `translateY(112%) + opacity`, mais suave.
- Close button reduzido para 36px e afastado visualmente do canto.
- Filter sheet usa o mesmo material dos cards/lista para evitar sensação de componente externo.
- Cards, chips e search receberam ajustes de vidro e sombra com a mesma família visual.

## Arquivos mais importantes

- `src/shared/design-system/primitives/liquid-glass-sheet/liquid-glass-sheet.tsx`
- `src/shared/design-system/primitives/liquid-glass-sheet/liquid-glass-sheet.module.scss`
- `src/shared/design-system/primitives/liquid-glass-bottom-dock/liquid-glass-bottom-dock.module.scss`
- `src/features/cargo/components/mobile-list-lab/mobile-cargo-list-lab.tsx`
- `src/features/cargo/components/mobile-list-lab/mobile-cargo-list-lab.module.scss`
