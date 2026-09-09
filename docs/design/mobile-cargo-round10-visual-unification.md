# Mobile Cargo Round 10 — Visual Unification + Sheet Fix

## Pontos tratados

- A tela usa um único campo visual (`#242b2e`) com superfícies translúcidas leves.
- Search bar remove o highlight superior e usa debounce com mínimo de 3 caracteres.
- Header compacto fica mais transparente e sem divisor inferior forte.
- Bottom dock volta a ser icon-only, com bolha ativa circular.
- Sheets usam grabber visível e close button menor/afastado.
- A lista do sheet e os botões ficam integrados ao material, sem fundos conflitantes.

## Arquivos principais

- `src/features/cargo/components/mobile-list-lab/mobile-cargo-list-lab.tsx`
- `src/features/cargo/components/mobile-list-lab/mobile-cargo-list-lab.module.scss`
- `src/shared/design-system/primitives/liquid-glass-bottom-dock/liquid-glass-bottom-dock.module.scss`
- `src/shared/design-system/lab/mobile-cargo-list-lab-canvas/mobile-cargo-list-lab-canvas.module.scss`
