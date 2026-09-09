# Mobile Cargo List — Round 3 Aggressive Notes

## Objetivo
Levar a experiência para mais perto do vídeo de referência, principalmente em:
- sheet motion;
- hierarchy / visual density;
- dock / tab bar;
- search;
- distinção entre filter sheet e card action sheet.

## Ajustes centrais

### 1. Sheet primitive
- Easing suavizado para curva mais “Apple-like”.
- Entrada com `translateY + scale`.
- Grabber com presença maior e highlight interno.
- Alturas de snap ajustadas.

### 2. Card action sheet separado do filter sheet
- Classes dedicadas:
  - `actionSheetOverlay`
  - `actionSheetContent`
- Menos sensação de “full filter sheet reutilizado”.
- Overlay um pouco mais leve.

### 3. Filter sheet separado
- Classes dedicadas:
  - `filterSheetOverlay`
  - `filterSheetContent`
- Mantém a leitura da estrutura e a experiência de refinamento da lista.

### 4. Tab bar / dock
- Bubble motion mais suave.
- Item ativo ganha um pequeno shift visual no ícone.
- Material mais consistente com dark tab bar flutuante.

### 5. Search field
- Material escurecido e neutralizado.
- Menos acento azul fora de foco.

## Arquivos principais
- `src/shared/design-system/primitives/liquid-glass-sheet/liquid-glass-sheet.tsx`
- `src/shared/design-system/primitives/liquid-glass-sheet/liquid-glass-sheet.module.scss`
- `src/shared/design-system/primitives/liquid-glass-bottom-dock/liquid-glass-bottom-dock.module.scss`
- `src/features/cargo/components/mobile-list-lab/mobile-cargo-list-lab.tsx`
- `src/features/cargo/components/mobile-list-lab/mobile-cargo-list-lab.module.scss`

## Próximo refinamento sugerido
Se ainda faltar fidelidade, a próxima etapa ideal é criar um **sheet primitive separado só para o card action sheet**, em vez de continuar derivando tudo do mesmo primitive base.
