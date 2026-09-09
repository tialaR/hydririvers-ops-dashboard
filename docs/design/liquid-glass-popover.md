# LiquidGlassPopover

Primitive reutilizável do Design System HydroRivers, baseado no componente **Popovers (iPad Only) — Liquid Glass** exportado do Figma (Light examples).

## Origem

- CSS exportado do Figma: camadas *Background*, *Material / Regular*, *Arrow* e badge *Mode* (referência visual apenas).
- Referência visual: PNG `Light examples` e propriedades de material light (gradiente branco 60%, superfície 25%, `color-dodge` + `plus-lighter`, `backdrop-filter: blur(50px)`).

## Decisões de conversão

| Figma | Implementação |
| --- | --- |
| Frame 420×330 com `left` / `top` de canvas | Removido — popover `position: relative` sem artboard |
| Popover 200×200 centralizado com offsets fixos | Tamanhos via `size` (`min-width` + padding), conteúdo fluido |
| Camadas *Material* duplicadas no arrow | `::before` (corpo) e `::after` (seta) com a mesma receita de material |
| `filter: drop-shadow(0 10px 100px …)` | `filter: drop-shadow(var(--hydro-elevation-popover, …))` |
| Badge *Mode* “Light” | Prop opcional `title` (texto simples, sem ícone SF) |
| `transform: matrix(-1, 0, 0, 1, 0, 0)` no arrow | Rotação via classes `arrow_*` (`rotate` em top/left/right) |

## O que foi removido do CSS bruto

- `left`, `top`, `width` e `height` fixos de artboard (420px, 200px, posicionamento `calc(50% - …)`)
- `position: absolute` externa ao próprio popover
- `background: #FF0000` de debug no arrow
- Camadas *Union* / *Vector* do badge Mode (ícone SF)
- Fonte SF Pro empacotada — usa `--hydro-font-family-system`
- `order` / `flex-grow` de auto-layout Figma

## API

```tsx
import { LiquidGlassPopover } from '@/shared/design-system';

<LiquidGlassPopover title="Filtros" open arrow="bottom" size="md" tone="light">
  <FilterForm />
</LiquidGlassPopover>
```

### Props

| Prop | Tipo | Default | Descrição |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Conteúdo do popover |
| `title` | `string` | — | Rótulo opcional no topo |
| `open` | `boolean` | `true` | Estado visual aberto/fechado |
| `arrow` | `'top' \| 'bottom' \| 'left' \| 'right' \| 'none'` | `'bottom'` | Direção da seta (pseudo `::after`) |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | `min-width` e padding |
| `tone` | `'auto' \| 'light' \| 'dark'` | `'auto'` | Material claro/escuro |
| `role` | `'dialog' \| 'menu' \| 'region'` | `'dialog'` | Semântica ARIA básica |
| `className` | `string` | — | Classe adicional no root |

### Acessibilidade

- `role` default: `dialog`.
- `role="menu"`: apenas semântica; **não** implementa navegação por teclado nesta primitive.
- **Focus trap** e retorno de foco são responsabilidade de componentes compostos (menu ancorado, filter popover, etc.).
- Quando `open={false}`, define `aria-hidden="true"` e `pointer-events: none`.

### Animação (`open`)

| Estado | Visual |
| --- | --- |
| aberto | `opacity: 1`, `translateY(0)`, `scale(1)` |
| fechado | `opacity: 0`, `translateY(6px)`, `scale(0.98)` |

- Duração: `180ms` (via `--hydro-motion-control` com fallback local).
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` (`--hydro-motion-easing-standard`).
- Respeita `prefers-reduced-motion: reduce`.

## Tokens usados

Semânticos (`--hydro-*`), com fallback no módulo SCSS quando ausentes:

- `--hydro-radius-popover` (fallback `38px`)
- `--hydro-color-surface-glass` (fallback `rgba(255,255,255,.25)`)
- `--hydro-color-overlay`
- `--hydro-color-label-primary`
- `--hydro-elevation-popover` (fallback `0 10px 100px rgba(0,0,0,.3)`)
- `--hydro-motion-control`
- `--hydro-motion-easing-standard`
- `--hydro-font-family-system`

Brutos (`--hydro-kit-*`):

- `--hydro-kit-liquid-glass-frost-regular` (fallback blur `50px` do Figma)
- `--hydro-kit-liquid-glass-shadow-blur-bg`

## Exemplos

```tsx
// Referência Figma — light, seta inferior
<LiquidGlassPopover tone="light" arrow="bottom" title="Light">
  <Placeholder />
</LiquidGlassPopover>

// Menu contextual (sem navegação de teclado nesta primitive)
<LiquidGlassPopover role="menu" arrow="top" size="sm" open={isOpen}>
  <MenuItems />
</LiquidGlassPopover>

// Painel de preview
<LiquidGlassPopover arrow="left" size="lg" tone="auto">
  <PreviewContent />
</LiquidGlassPopover>
```

## Onde usar

- Menus contextuais
- Filter popovers
- Painéis flutuantes leves
- Preview panels

## Onde não usar

- Bottom sheet mobile principal
- Cards de lista
- Modais complexos (confirmação, formulários longos)
- Alertas críticos

## Localização no código

```
src/shared/design-system/primitives/liquid-glass-popover/
  liquid-glass-popover.tsx
  liquid-glass-popover.module.scss
  index.ts
```

Exportado em `@/shared/design-system` (apenas export; nenhuma UI de produto alterada).
