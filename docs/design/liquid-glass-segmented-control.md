# LiquidGlassSegmentedControl

Primitive reutilizável do Design System HydroRivers, baseado no componente **Segmented Control** exportado do Figma (Apple Design Resources — Light/Dark examples).

## Origem

- CSS exportado do Figma: frames `Segmented control` com 2–5 segmentos em tema claro e escuro.
- Referência visual: `Light examples.png` e `Dark examples.png` (track pill + segmento selecionado em cápsula branca / translúcida).

## Medidas principais extraídas

| Elemento | `sm` | `md` |
| --- | --- | --- |
| Altura do track | 32px | 36px |
| Padding do track | 2px | 2px |
| Gap entre segmentos | 4px | 4px |
| Border-radius do track | 100px | 100px |
| Altura do segmento selecionado | 28px | 32px |
| Padding do segmento | 3px 6px | 3px 6px |
| Border-radius do segmento | 20px | 20px |
| Fonte do label | 13.333px / line-height 18px | idem |
| Letter-spacing | -0.08px | idem |
| Peso ativo / inativo | 590 / 510 | idem |

### Cores (Light)

| Token visual | Valor |
| --- | --- |
| Track | `rgba(118, 118, 128, 0.12)` |
| Segmento selecionado | `#FFFFFF` |
| Labels | `#000000` |

### Cores (Dark)

| Token visual | Valor |
| --- | --- |
| Track | `rgba(118, 118, 128, 0.24)` |
| Segmento selecionado | `rgba(255, 255, 255, 0.27)` |
| Labels | `#FFFFFF` |

## O que foi removido do CSS bruto

- `left`, `top` e dimensões fixas de artboard (`width: 420px`, `width: 370px`, etc.)
- `border` e `background` do card de documentação (`#FFFFFF` / `#000000`, `border-radius: 22px`)
- Pill `Mode` (Light/Dark) do canto superior
- Comentários HTML do Figma (guidelines / feedback links)
- Duplicação de 4 frames estáticos (2–5 segmentos) — substituída por `items` dinâmico (2–5 entradas)

## API

```tsx
import { LiquidGlassSegmentedControl } from '@/shared/design-system';

<LiquidGlassSegmentedControl
  items={[
    { id: 'all', label: 'Todas' },
    { id: 'active', label: 'Ativas' },
    { id: 'done', label: 'Concluídas' },
  ]}
  value="all"
  onChange={(id) => setFilter(id)}
/>
```

### Props

| Prop | Tipo | Default | Descrição |
| --- | --- | --- | --- |
| `items` | `LiquidGlassSegmentedControlItem[]` | — | 2–5 segmentos com `id` e `label` |
| `value` | `string` | — | ID do segmento selecionado |
| `onChange` | `(id: string) => void` | — | Callback ao trocar segmento |
| `size` | `'sm' \| 'md'` | `'sm'` | Altura do track e dos segmentos |
| `tone` | `'auto' \| 'light' \| 'dark'` | `'auto'` | Tema visual |
| `fullWidth` | `boolean` | `true` | Segmentos dividem largura igualmente |
| `className` | `string` | — | Classe adicional no container |
| `aria-label` | `string` | `'Controle segmentado'` | Rótulo do `radiogroup` |

### `LiquidGlassSegmentedControlItem`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | `string` | Identificador estável |
| `label` | `string` | Texto do segmento |
| `disabled` | `boolean` | Desabilita interação |

### Acessibilidade

- Container: `role="radiogroup"` + `aria-label`
- Cada segmento: `<button type="button">` com `aria-pressed`
- Selecionado: `aria-pressed="true"`
- `disabled` nativo no botão

### Tokens CSS usados

- `--hydro-color-label-primary`
- `--hydro-color-fill-tertiary`
- `--hydro-color-surface`
- `--hydro-radius-pill`
- `--hydro-motion-tap`
- `--hydro-motion-control`
- `--hydro-motion-easing-standard`
- `--hydro-font-family-system`

Fallbacks locais: `--segmented-height-sm`, `--segmented-height-md`, `--segmented-padding`, `--segmented-gap`, `--segmented-radius`, `--segmented-item-radius`, `--segmented-item-padding`, `--segmented-font-size`, `--segmented-line-height`, `--segmented-letter-spacing`.

## Usos futuros (não implementados neste PR)

- Filtros da lista mobile (lab de cargas)
- Alternância de status compacta
- Opções dentro de sheets
- Controles compactos em toolbars

**Não usar** como navegação principal inferior — para isso, usar `LiquidGlassTabBar`.

## Localização no código

```
src/shared/design-system/primitives/liquid-glass-segmented-control/
  liquid-glass-segmented-control.tsx
  liquid-glass-segmented-control.module.scss
  index.ts
```
