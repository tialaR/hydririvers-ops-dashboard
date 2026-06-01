# Mobile Cargo Motion Round 6

## Objetivo
Adicionar uma camada forte de microinteração e rever o bottom dock para se aproximar das novas referências anexadas.

## Referências visuais usadas

- dock minimalista com item ativo em cápsula;
- cards escuros tipo crypto/widget;
- animação de troca entre pills;
- transições de sheet e apresentação de lista.

## Arquivos principais

- `src/features/cargo/components/mobile-list-lab/mobile-cargo-list-lab.tsx`
- `src/features/cargo/components/mobile-list-lab/mobile-cargo-list-lab.module.scss`
- `src/shared/design-system/primitives/liquid-glass-bottom-dock/liquid-glass-bottom-dock.tsx`
- `src/shared/design-system/primitives/liquid-glass-bottom-dock/liquid-glass-bottom-dock.module.scss`
- `src/shared/design-system/primitives/liquid-glass-sheet/liquid-glass-sheet.module.scss`

## Comportamentos implementados

### Lista
- Entrada em cascata dos cards.
- Cards com press state mais físico.
- Ícones internos e seta da rota reagem ao press.

### Filtros
- Entrada em cascata dos chips.
- Tap bloom em chips.
- Active state mais tátil.

### Search
- Foco com expansão sutil, highlight e alteração de sombra.

### Bottom dock
- Item ativo vira cápsula com label.
- Itens inativos ficam como botões circulares minimalistas.
- Bubble ativa desliza com spring visual.

### Sheets
- Action sheet com abertura física.
- Conteúdo interno entra em cascata.
- Filter sheet preserva drag e ganha sequência de entrada.
