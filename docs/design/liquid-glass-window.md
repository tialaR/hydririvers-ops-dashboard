# Liquid Glass Window

Primitives reutilizáveis do Design System HydroRivers para janelas flutuantes estilo macOS / iPadOS, baseados nos frames Figma **Window Controls**, **Window Resize** e **Window**.

## Origem

- `_Window Controls.png` — tráfego close / minimize / expand em estados **Active** e **Inactive**
- `_Window Resize.png` — área de hit 65×65 px e grabber 55.5×55.5 px
- `Untitled.png` (Window) — painel 400×400 px, raio 34 px, sombra elevada e canto de resize

## O que foi removido do CSS bruto

| Figma | Motivo |
| --- | --- |
| Canvas `100×100` / `590×600` com `background: #AAAAAA` | Artboard de preview, não UI |
| `border: 1px dashed #6155F5` | Guia de exportação |
| `position: absolute` com `left` / `top` | Posicionamento de artboard |
| Camada *Guide* (`visibility: hidden`, vermelho/laranja) | Alinhamento interno Figma |
| `order` / `flex-grow` / `z-index` de auto-layout | Substituído por flex + pseudo-elementos |
| Resize funcional | Fora do escopo desta rodada |

## Componentes

### `LiquidGlassWindowControls`

Barra pill 44×22 px com três dots de 6 px (gap 3 px, padding 8×10 px).

| Prop | Tipo | Default | Descrição |
| --- | --- | --- | --- |
| `state` | `'active' \| 'inactive'` | `'active'` | Cores vivas vs. dots cinza |
| `onClose` | `() => void` | — | Se presente, dot vira `<button>` |
| `onMinimize` | `() => void` | — | Idem |
| `onExpand` | `() => void` | — | Idem |
| `className` | `string` | — | Classe adicional |

**Active:** glass (`::before` gradientes + sombra `0 8px 40px rgba(0,0,0,.12)`), dots `#FF5F57` / `#FEBC2F` / `#27C840`.

**Inactive:** fundo `rgba(0,0,0,.05)`, dots `rgba(60,60,67,.6)`.

Sem callbacks → `<span aria-hidden>`. Com callbacks → `<button aria-label="Fechar|Minimizar|Expandir">` + `focus-visible`.

### `LiquidGlassResizeHandle`

Indicador visual de resize (sem lógica de redimensionamento).

| Prop | Tipo | Default | Descrição |
| --- | --- | --- | --- |
| `visible` | `boolean` | `true` | `visibility: hidden` quando `false` |
| `className` | `string` | — | Classe adicional |

Hit area 65×65 px; grabber quadrado 55.5 px com borda 3 px `currentColor`, ancorado no canto inferior direito do painel pai (`overflow: hidden` recorta o arco visível).

### `LiquidGlassWindowPanel`

Container de janela com sombra, raio e slots opcionais.

| Prop | Tipo | Default | Descrição |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Conteúdo principal |
| `controls` | `ReactNode` | — | Ex.: `<LiquidGlassWindowControls />` no canto superior esquerdo |
| `resizeHandle` | `boolean` | `false` | Renderiza `LiquidGlassResizeHandle` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | `min-size` 280 / 400 / 520 px |
| `tone` | `'auto' \| 'light' \| 'dark'` | `'auto'` | Superfície clara ou elevada escura |
| `className` | `string` | — | Classe adicional |

## Tokens e fallbacks locais

| Token | Uso |
| --- | --- |
| `--hydro-color-surface-elevated` | Fundo dark / fallback panel |
| `--hydro-color-label-primary` | Cor do grabber (`currentColor`) |
| `--hydro-color-accent` | `focus-visible` nos dots interativos |
| `--hydro-radius-pill` | Cápsula dos controles |
| `--hydro-radius-card` | Raio `size="sm"` |
| `--hydro-motion-control` | Transições |
| `--hydro-motion-easing-standard` | Easing |
| `--hydro-font-family-system` | Tipografia |

Fallbacks locais no módulo SCSS: `--window-panel-radius`, `--window-panel-shadow`, `--window-controls-width`, `--window-dot-size`, `--window-resize-size`, etc.

## Uso

```tsx
import {
  LiquidGlassWindowControls,
  LiquidGlassWindowPanel,
} from '@/shared/design-system';

<LiquidGlassWindowPanel
  size="md"
  tone="light"
  resizeHandle
  controls={
    <LiquidGlassWindowControls
      state="active"
      onClose={() => {}}
    />
  }
>
  Conteúdo do inspector
</LiquidGlassWindowPanel>
```

## Usos futuros

- Inspector desktop (painéis flutuantes sobre mapa)
- Floating panels e paletas de ferramentas
- Dev labs e protótipos de UI avançada
- Modal panels com chrome de janela (não bottom sheet)

## Não usar em

- Bottom sheet mobile (`LiquidGlassSheet`)
- Cards de lista mobile
- Botões comuns (`LiquidGlassButton`)
- Toolbar / tab bar existentes

## Arquivos

```
src/shared/design-system/primitives/liquid-glass-window/
  liquid-glass-window-controls.tsx
  liquid-glass-resize-handle.tsx
  liquid-glass-window-panel.tsx
  liquid-glass-window.module.scss
  index.ts
```

Testes: `tests/unit/shared/design-system/liquid-glass-window.test.tsx`
