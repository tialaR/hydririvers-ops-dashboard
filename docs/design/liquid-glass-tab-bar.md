# LiquidGlassTabBar

Primitive reutilizável do Design System HydroRivers, baseado no componente **Tab Bar — iPhone** exportado do Figma (iOS Kit).

## Origem

- CSS exportado do Figma: frames `Tab Bar - iPhone` com variantes `Separate Search`, `Minimized` e contagem de abas (2–5).
- Referência visual: PNGs `Tab Bar - iPhone` e `Toolbar - Top - iPhone` (grupo pill + botão de busca separado).

## Medidas principais extraídas

| Elemento | Expanded | Minimized |
| --- | --- | --- |
| Padding do container | `16px 25px 25px` | `30px 25px 25px` |
| Altura do grupo de abas | 54px | 40px |
| Botão de busca separado | 54×54px | 40×40px |
| Ícone da aba | 18px / line-height 28px | idem |
| Label | 10px / line-height 12px | oculto no minimized |
| Cápsula selecionada | `#EDEDED`, radius 100px | idem |
| Cor ativa | `#0088FF` | idem |
| Cor inativa (light) | `#1A1A1A` | idem |
| Glass pill | gradientes + `box-shadow: 0 8px 40px rgba(0,0,0,.12)` + radius 296px | idem |

## O que foi removido do CSS bruto

- `left`, `top` e dimensões fixas de artboard (`width: 890px`, `width: 402px`, etc.)
- `border: 1px dashed` do frame de documentação Figma
- `position: absolute` entre variantes empilhadas no canvas
- `display: none` gerado para abas ausentes em cada variante estática
- Duplicação de 16+ frames exportados — substituída por props dinâmicas (`variant`, `separateSearch`, `showLabels`, contagem de `items`)

## API

```tsx
import { LiquidGlassTabBar } from '@/shared/design-system';

<LiquidGlassTabBar
  items={[
    { id: 'home', label: 'Início', icon: <HomeIcon /> },
    { id: 'cargo', label: 'Cargas', icon: <CargoIcon /> },
  ]}
  activeId="home"
  onChange={(id) => setActive(id)}
/>
```

### Props

| Prop | Tipo | Default | Descrição |
| --- | --- | --- | --- |
| `items` | `LiquidGlassTabBarItem[]` | — | 2–5 abas com `id`, `label`, `icon` |
| `activeId` | `string` | — | ID da aba ativa |
| `onChange` | `(id: string) => void` | — | Callback ao trocar aba |
| `variant` | `'expanded' \| 'minimized'` | `'expanded'` | Altura e labels |
| `tone` | `'auto' \| 'light' \| 'dark'` | `'auto'` | Tema visual |
| `showLabels` | `boolean` | `true` | Labels visíveis (somente em `expanded`) |
| `separateSearch` | `boolean` | `false` | Botão de busca em pill separado |
| `searchLabel` | `string` | `'Buscar'` | `aria-label` do botão de busca |
| `onSearch` | `() => void` | — | Handler do botão de busca |
| `className` | `string` | — | Classe adicional no `<nav>` |
| `aria-label` | `string` | `'Navegação principal'` | Rótulo do `<nav>` |

### `LiquidGlassTabBarItem`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | `string` | Identificador estável |
| `label` | `string` | Texto da aba |
| `icon` | `ReactNode` | Ícone (SVG recomendado) |
| `disabled` | `boolean` | Desabilita interação |
| `badge` | `string \| number` | Contador/notificação |

### Acessibilidade

- Container: `<nav aria-label="…">`
- Cada aba: `<button type="button">`
- Aba ativa: **`aria-current="page"`** (semântica de navegação; não usa `aria-pressed`)
- Busca separada: `aria-label` via `searchLabel`
- Badge: `aria-label="{label}: {badge}"`
- `disabled` nativo no botão

## Variantes

### `variant`

- **expanded** — grupo 54px, labels opcionais (`showLabels`)
- **minimized** — grupo 40px, apenas ícones

### `separateSearch`

- `false` — todas as abas no mesmo pill
- `true` — pill de abas + botão circular de busca com gap 16px
  - ≤3 abas: layout `space-between`
  - ≥4 abas: grupo flexível alinhado à direita

### `tone`

- **light** / **dark** — força paleta
- **auto** — segue `html[data-theme]` e `prefers-color-scheme`

## Tokens usados

- `--hydro-color-accent` / `--hydro-kit-colors-accents-blue`
- `--hydro-color-label-primary` / `--hydro-kit-colors-labels-vibrant-primary`
- `--hydro-color-fill-secondary` / `--hydro-kit-colors-fills-vibrant-tertiary`
- `--hydro-radius-pill`
- `--hydro-motion-tap`, `--hydro-motion-control`, `--hydro-motion-easing-standard`
- `--hydro-font-family-system`

Fallbacks locais no módulo SCSS: `--tabbar-height-*`, `--tabbar-padding-*`, `--tabbar-shadow`, `--tabbar-radius`, etc.

## Usos futuros

- Lab mobile de navegação (`/dev/mobile-cargo-list-lab`)
- Navegação segmentada flutuante
- Grupos de abas contextuais sobre mapa
- Ação de busca separada (sem substituir campo de busca inline)

## Não substitui automaticamente

Este primitive **não** altera o bottom navigation existente, rotas `/cargas`, mapa ou experiências desktop. Integração em produção exige PR dedicado no lab ou feature mobile.
