# LiquidGlassSheet

Primitive reutilizável do Design System HydroRivers, baseado nos componentes **Sheet — Full Screen — iPhone** e **Sheet — Inspector — iPhone** exportados do Figma (Apple Design Resources / Liquid Glass).

## Origem

- CSS exportado do Figma: variantes *Stacked=True/False* (full screen), material *Fill + Shadow* + *Glass Effect* (inspector), toolbar com grabber, título centralizado e botões leading/trailing.
- Referências visuais: PNGs `Sheet - Full Screen - iPhone` e `Light examples` (inspector elevado).

## Variantes

| `variant` | Uso visual | Raio / sombra |
| --- | --- | --- |
| `fullScreen` | Sheet ocupa a altura útil do viewport (até ~852px de referência iPhone) | `38px 38px 0 0`, sombra `0 15px 75px rgba(0,0,0,.18)` |
| `inspector` | Painel parcial com material glass (padding `0 6px 6px`) | `34px 34px 58px 58px`, sombra `0 8px 40px rgba(0,0,0,.12)` |

### `stacked`

Quando `stacked={true}`, renderiza um *rail* de fundo (página anterior) com cantos superiores arredondados e dim overlay (`rgba(0,0,0,.1)`), e desloca o sheet principal `10px` para baixo — equivalente ao frame *Stacked=True* do Figma.

## O que foi removido do CSS bruto

- `left`, `top`, `width`/`height` de artboard (890px, 402px posicionados em canvas)
- `border: 1px dashed #6155F5` de debug
- Comentários HTML / links do Figma (*Guidelines*, *Feedback*)
- `position: absolute` de exemplos Stacked=False/True fora do componente
- `mix-blend-mode: plus-darker` nos textos (substituído por tokens de cor legíveis)
- Fonte SF Pro empacotada — usa `--hydro-font-family-system`

## API

```tsx
import { LiquidGlassSheet } from '@/shared/design-system';

<LiquidGlassSheet
  open={isOpen}
  title="Filtros"
  variant="inspector"
  tone="light"
  onClose={() => setOpen(false)}
>
  <FilterForm />
</LiquidGlassSheet>
```

### Props principais

| Prop | Tipo | Default | Descrição |
| --- | --- | --- | --- |
| `open` | `boolean` | — | Estado aberto/fechado (overlay + motion) |
| `title` | `string` | — | Título centralizado na toolbar |
| `children` | `ReactNode` | — | Conteúdo rolável |
| `variant` | `'fullScreen' \| 'inspector'` | `'inspector'` | Layout e material |
| `tone` | `'auto' \| 'light' \| 'dark'` | `'auto'` | Paleta clara/escura |
| `stacked` | `boolean` | `false` | Rail de fundo (modal empilhado) |
| `showGrabber` | `boolean` | `true` | Pill superior |
| `showCloseButton` | `boolean` | `true` | Botão leading (×) |
| `showPrimaryAction` | `boolean` | `false` | Botão trailing (↑) |
| `primaryActionLabel` | `string` | — | `aria-label` da ação primária |
| `closeLabel` | `string` | `'Fechar'` | `aria-label` do fechar |
| `onClose` | `() => void` | — | Fechar + tecla Escape |
| `onPrimaryAction` | `() => void` | — | Callback da ação primária |
| `role` | `'dialog' \| 'region'` | `'dialog'` | Semântica ARIA |

## Tokens usados

Semânticos (`--hydro-*`) com fallback local no módulo SCSS:

- `--hydro-color-overlay`
- `--hydro-color-surface` / `--hydro-color-surface-elevated`
- `--hydro-color-label-primary` / `--hydro-color-label-secondary`
- `--hydro-color-fill-secondary`
- `--hydro-color-accent`
- `--hydro-radius-sheet`
- `--hydro-motion-sheet` (fallback `240ms` no componente)
- `--hydro-motion-easing-standard`
- `--hydro-font-family-system`

Brutos (`--hydro-kit-*`):

- `--hydro-kit-sheet-iphone-top-radius` / `--hydro-kit-sheet-iphone-bottom-radius`
- `--hydro-kit-colors-backgrounds-primary` / `secondary`
- `--hydro-kit-colors-labels-primary`
- `--hydro-kit-colors-fills-secondary`
- `--hydro-kit-colors-accents-blue`

Fallbacks locais obrigatórios (quando tokens ausentes):

- `--sheet-radius-fullscreen`, `--sheet-radius-inspector`
- `--sheet-shadow-fullscreen`, `--sheet-shadow-inspector`
- `--sheet-toolbar-height`, `--sheet-control-size`, `--sheet-grabber-width`, `--sheet-grabber-height`

## Motion

| Estado | Overlay | Sheet |
| --- | --- | --- |
| aberto | `opacity: 1`, interativo | `translateY(0)`, `opacity: 1` |
| fechado | `opacity: 0`, `pointer-events: none`, `aria-hidden` | `translateY(16px)`, `opacity: 0` |

- Duração: `240ms` (`--hydro-motion-sheet` com fallback).
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)`.
- Respeita `prefers-reduced-motion: reduce`.

## Acessibilidade

- `role="dialog"` (default) com `aria-modal` quando `open` e `role="dialog"`.
- `aria-labelledby` quando `title` está presente.
- Botão fechar: `aria-label` via `closeLabel`.
- Ação primária: `aria-label` via `primaryActionLabel` (fallback *Ação principal*).
- `Escape` chama `onClose` quando o sheet está aberto e `onClose` foi informado.
- **Focus trap** ainda não implementado nesta primitive (responsabilidade de composição futura).
- Não usa `div` clicável para fechar — apenas `<button type="button">`.

## Limitações (v1)

- Sem **drag / snap** — será tratado em componente composto (ex.: sheet ancorado ao gesto).
- Sem **focus trap** / retorno de foco.
- **Não substitui** automaticamente o `BottomSheet` em `src/shared/components/bottom-sheet/`.
- Render **inline** (sem portal) — alinhado aos outros primitives liquid-glass do DS.

## Usos futuros

- Action sheet de carga no lab mobile (`mobile-cargo-list-lab`)
- Filter sheet
- Inspector panels
- Fluxos modais mobile leves

## Localização no código

```
src/shared/design-system/primitives/liquid-glass-sheet/
  liquid-glass-sheet.tsx
  liquid-glass-sheet.module.scss
  index.ts
```

Exportado em `@/shared/design-system`. Nenhuma UI de produto, `/cargas`, mapa ou desktop foi alterada nesta entrega.
