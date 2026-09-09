# Mobile Cargo List — Round 2 Notes

## Feedback endereçado

### 1. Sheet dos cards de carga com comportamento estranho
- O action sheet do card passou a abrir em modo **contido** (`draggable={false}`) para evitar a sensação de um segundo componente com física errada.
- O cabeçalho interno foi compactado e a área vazia superior foi reduzida.
- Lista de ações recebeu aparência de **grouped list** estilo iOS.

### 2. Search bar e botões sem identidade Apple suficiente
- Search bar revisada com material mais neutro, menos brilho azul e foco mais sutil.
- Botões circulares e pills revisados para usar fills e bordas da família iOS dark.
- Icon button base também foi refinado.

### 3. Dock / tab bar com ícones pouco legíveis
- Tab bar redesenhada com:
  - material mais próximo de tab bar flutuante iOS;
  - active bubble deslizante mais clara;
  - ícones maiores;
  - labels menores e mais nítidas;
  - acento azul restrito ao item ativo.

### 4. Dark mode “espacial”
- Fundo geral neutralizado.
- Redução dos gradientes azuis do canvas.
- Superfícies movidas para o eixo `#1C1C1E / #2C2C2E / #3A3A3C`.

## Arquivos mais impactados

- `src/features/cargo/components/mobile-list-lab/mobile-cargo-list-lab.tsx`
- `src/features/cargo/components/mobile-list-lab/mobile-cargo-list-lab.module.scss`
- `src/shared/design-system/primitives/liquid-glass-sheet/liquid-glass-sheet.module.scss`
- `src/shared/design-system/primitives/liquid-glass-bottom-dock/liquid-glass-bottom-dock.module.scss`
- `src/shared/design-system/components/icon-button/icon-button.module.scss`
- `src/shared/design-system/lab/mobile-cargo-list-lab-canvas/mobile-cargo-list-lab-canvas.module.scss`

## Observação importante

Ainda é uma aproximação em código. O arquivo `Apple iOS UI Kit.sketch` ajuda muito como direção, mas alguns microcomportamentos visuais/animados da Apple (especialmente física e morphing) dependem de tuning fino em runtime.
