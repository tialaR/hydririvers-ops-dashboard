# Mobile Cargo Reference Round 5

## Objetivo
Gerar a página de cargas com base nas referências mais recentes de UI dark premium, cards neumórficos e bottom dock com sensação de produto high-end.

## Alterações principais

- Reescrita visual de `mobile-cargo-list-lab.module.scss`.
- Reforço do canvas dark neutro em `mobile-cargo-list-lab-canvas.module.scss`.
- Redesenho dos cards: status dot, rota com ícone, origem/destino com subtítulo de porto, ETA e tag de janela portuária.
- Bottom dock mais alto, com bubble ativa e relevo semelhante às referências de carro.
- Search, chips e botões com shadows internos/externos.
- Novo item `Perfil` no dock para aproximar da referência visual.

## Arquivos principais

- `src/features/cargo/components/mobile-list-lab/mobile-cargo-list-lab.tsx`
- `src/features/cargo/components/mobile-list-lab/mobile-cargo-list-lab.module.scss`
- `src/shared/design-system/lab/mobile-cargo-list-lab-canvas/mobile-cargo-list-lab-canvas.module.scss`
- `src/shared/design-system/primitives/liquid-glass-bottom-dock/liquid-glass-bottom-dock.module.scss`
- `messages/*.json`

## Próxima etapa sugerida
Se esta direção visual for aprovada, extrair os padrões para componentes próprios:

- `PremiumCargoCard`
- `PremiumSearchField`
- `PremiumFilterChip`
- `PremiumBottomDock`
- `PremiumCardActionSheet`
