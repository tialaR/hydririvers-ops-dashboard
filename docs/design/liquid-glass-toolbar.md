# LiquidGlassToolbar

Primitive reutilizável do Design System HydroRivers, baseado nos componentes **Toolbar — Top — iPhone** e **Toolbar — Top — Sheet** exportados do Figma (Apple Design Resources / Liquid Glass).

## Origem

- Referências visuais: `Toolbar - Top - iPhone.png`, `Toolbar - Top - Sheet.png`.
- CSS exportado do Figma para as duas variantes de contexto (page vs sheet).
- Medidas de referência extraídas do artboard (402px de largura útil em iPhone); o componente usa **largura fluida** (`width: 100%`), sem dimensões fixas de canvas.

## Variantes

| `variant` | Layout |
| --- | --- |
| `default` | Título centralizado (17px / 22px) entre leading e trailing |
| `twoLine` | Título (15px) + subtítulo (12px) centralizados em overlay |
| `twoLineLeft` | Título + subtítulo alinhados à esquerda após o leading |
| `largeTitle` | Linha de controles + bloco de título grande (34px) abaixo |
| `compactLarge` | Título grande na mesma linha que a ação trailing |

## Contexto

| `context` | Altura mínima | Grabber |
| --- | --- | --- |
| `page` | 54px | `showGrabber` default `false` |
| `sheet` | 70px | `showGrabber` default `true` |

## Relação com LiquidGlassButton

Os botões leading/trailing são renderizados via **`LiquidGlassButton`** (`variant="icon"`, `size="md"`), com mapeamento de `tone`/`fill`:

- **Page + neutral** → `fill="glass"` (receita Liquid Glass do Figma).
- **Sheet + neutral** → `fill="tinted"` (`rgba(120,120,128,.16)`).
- **accent / destructive** → `fill="filled"`.

Não duplica a lógica de camadas glass do botão; futuras melhorias no botão propagam automaticamente para a toolbar.

## O que foi removido do CSS bruto

- `left`, `top`, `position: absolute` de artboard e frames de exemplo
- `width`/`height` fixos do canvas (440px, 402px posicionados)
- `border: 1px dashed #6155F5` de debug
- Comentários HTML / links do Figma (*Guidelines*, *Feedback*)
- Blocos `display: none` de grupos de botão não usados
- `mix-blend-mode: plus-darker` nos textos (substituído por tokens de cor)
- Fonte SF Pro empacotada — usa `--hydro-font-family-system`
- Gradientes complexos de botão duplicados (delegados ao `LiquidGlassButton`)

## API

```tsx
import { LiquidGlassToolbar } from '@/shared/design-system';

<LiquidGlassToolbar
  title="Cargas"
  variant="default"
  context="page"
  leadingAction={{
    label: 'Voltar',
    icon: <ChevronLeftIcon />,
    onClick: () => router.push('/cargas'),
  }}
  trailingAction={{
    label: 'Filtrar',
    icon: <FilterIcon />,
    tone: 'accent',
    onClick: () => setFiltersOpen(true),
  }}
/>
```

### Props principais

| Prop | Tipo | Default | Descrição |
| --- | --- | --- | --- |
| `title` | `string` | — | Título principal |
| `subtitle` | `string` | — | Subtítulo (variantes twoLine / largeTitle) |
| `variant` | ver tabela acima | `'default'` | Layout do bloco de título |
| `context` | `'page' \| 'sheet'` | `'page'` | Altura e estilo de botões |
| `tone` | `'auto' \| 'light' \| 'dark'` | `'auto'` | Paleta (respeita `html[data-theme]`) |
| `showGrabber` | `boolean` | `context === 'sheet'` | Pill superior do sheet |
| `leadingAction` | `LiquidGlassToolbarAction` | — | Botão leading |
| `trailingAction` | `LiquidGlassToolbarAction` | — | Botão trailing único |
| `trailingActions` | `LiquidGlassToolbarAction[]` | — | Múltiplas ações trailing |
| `className` | `string` | — | Classe no `<header>` |
| `titleClassName` | `string` | — | Classe no elemento de título |

### `LiquidGlassToolbarAction`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `label` | `string` | `aria-label` do botão |
| `icon` | `ReactNode` | Conteúdo do ícone |
| `onClick` | `() => void` | Callback |
| `tone` | `'neutral' \| 'accent' \| 'destructive'` | Estilo do botão |
| `disabled` | `boolean` | Desabilita interação |

## Tokens usados

Semânticos (`--hydro-*`) com fallback local no módulo SCSS:

- `--hydro-color-accent`
- `--hydro-color-label-primary`
- `--hydro-color-label-secondary`
- `--hydro-color-fill-secondary`
- `--hydro-color-surface`
- `--hydro-radius-pill`
- `--hydro-size-touch-target`
- `--hydro-motion-tap`
- `--hydro-motion-control`
- `--hydro-motion-easing-standard`
- `--hydro-font-family-system`

Fallbacks locais da toolbar (quando token ausente):

- `--toolbar-height-default: 54px`
- `--toolbar-height-sheet: 70px`
- `--toolbar-control-size: 44px`
- `--toolbar-horizontal-padding: 16px`
- `--toolbar-grabber-color: #CCCCCC`
- Tipografia de título, subtítulo e large title conforme Figma

### Tema claro / escuro

| Elemento | Light | Dark |
| --- | --- | --- |
| Título | `#1A1A1A` | `#F5F5F5` |
| Subtítulo | `#727272` | `#8A8A8A` |
| Leading fill | `rgba(120,120,128,.16)` | `rgba(120,120,128,.24)` |
| Accent trailing | `#0088FF` | `#0091FF` |

## Acessibilidade

- `<header>` semântico.
- Botões reais (`<button>` via `LiquidGlassButton`).
- `label` da ação vira `aria-label`.
- `disabled` nativo no botão.
- `focus-visible` herdado do `LiquidGlassButton`.
- Título vazio não renderiza elemento de texto.
- Título usa `<p>` (não heading) para evitar hierarquia incorreta em composições; prop de nível de heading pode ser adicionada no futuro.

## Usos futuros (não integrados automaticamente)

- Header da lista mobile (lab / produção).
- Toolbar de sheets (`LiquidGlassSheet` pode compor este primitive).
- Toolbar de fluxo de carga.
- Headers de detalhe.

**Não substitui** toolbars existentes em `/cargas`, mapa ou desktop — adoção é opt-in por feature.

## Testes

`tests/unit/shared/design-system/liquid-glass-toolbar.test.tsx` — render, variantes, contexto sheet, grabber, tone e callbacks.
