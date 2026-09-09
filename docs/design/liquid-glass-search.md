# Liquid Glass Search

Primitives reutilizáveis do Design System HydroRivers, baseados nos frames Figma **_Search - Top** e **_Search Accessory** (iOS Kit / Liquid Glass).

## Origem

| Frame Figma | Primitive |
| --- | --- |
| `_Search - Top` | `LiquidGlassSearchField` |
| `_Search Accessory` | `LiquidGlassSearchAccessory` |

Referências visuais: PNGs `_Search - Top` e `_Search Accessory` anexados ao spec de implementação.

## Medidas extraídas

| Token local | Valor | Uso |
| --- | --- | --- |
| `--search-height` | `44px` | Altura do campo e da fileira accessory |
| `--search-radius` | `296px` | Cápsula pill |
| `--search-padding` | `0 10px 0 11px` | Padding horizontal interno |
| `--search-gap` | `4px` | Gap ícone / input / mic |
| `--search-font-size` | `17px` | Tipografia do input |
| `--search-line-height` | `20px` | |
| `--search-font-weight` | `510` | |
| `--search-shadow` | `0 8px 40px rgba(0,0,0,.12)` | Sombra Fill+Shadow |
| `--search-accessory-gap` | `8px` | Gap search ↔ segmented |
| `--search-segment-height` | `44px` | Altura do segmented control |
| `--search-segment-button-height` | `36px` | Botões internos |

Ícones: caixa de busca `26×20px`, microfone `18×20px`.

## Diferenças entre SearchField e SearchAccessory

### `LiquidGlassSearchField`

- Campo de busca isolado em cápsula Liquid Glass.
- `<input type="search">` nativo (sem cursor fake, sem `contenteditable`).
- Ícone de busca decorativo à esquerda; microfone à direita (`showMicrophone`, default `true`).
- Microfone: `<button>` se `onMicrophoneClick` existir; `<span>` decorativo caso contrário.

### `LiquidGlassSearchAccessory`

- Fileira horizontal: search flexível + segmented control opcional.
- Compõe `LiquidGlassSearchField` internamente.
- Filtros: `showFilters` + `filters[]` controlados pelo consumidor (`activeFilterId`, `onFilterChange`).
- Segmented com `role="group"` e `aria-pressed` nos botões de filtro.

## API resumida

```tsx
import {
  LiquidGlassSearchField,
  LiquidGlassSearchAccessory,
} from '@/shared/design-system';

<LiquidGlassSearchField
  value={query}
  onChange={setQuery}
  placeholder="Buscar"
  tone="auto"
/>

<LiquidGlassSearchAccessory
  value={query}
  onChange={setQuery}
  showFilters
  filters={[
    { id: 'all', label: 'Todas' },
    { id: 'active', label: 'Ativas' },
  ]}
  activeFilterId="all"
  onFilterChange={setFilterId}
/>
```

## Tokens usados

Variáveis semânticas com fallback para kit:

- `--hydro-color-accent` / `--hydro-kit-colors-accents-blue`
- `--hydro-color-label-primary` / `--hydro-kit-colors-labels-vibrant-primary`
- `--hydro-color-label-secondary` / `--hydro-kit-colors-labels-vibrant-secondary`
- `--hydro-color-label-tertiary` / `--hydro-kit-colors-labels-vibrant-tertiary`
- `--hydro-radius-pill`
- `--hydro-size-search-height`
- `--hydro-motion-control`, `--hydro-motion-easing-standard`
- `--hydro-font-family-system`

Cores fixas do spec Figma (light/dark) aplicadas via `data-tone` e `html[data-theme]`.

## O que foi removido do CSS bruto

- `left`, `top`, `width: 190px` e dimensões de artboard
- `position: absolute` fora dos pseudo-elementos de fundo
- Cursor fake (`width: 2px; background: #0091FF`)
- Label fake / div editável
- `order` / `flex-grow` de camadas internas do auto-layout Figma
- Importação de fonte SF Pro como arquivo

## Camadas visuais

| Camada Figma | Implementação |
| --- | --- |
| Fill + Shadow | `::before` no wrapper |
| Glass Effect | `::after` no wrapper |
| Conteúdo (ícones, input, mic) | filhos com `z-index: 2` |

## Tema

- `data-tone="light" | "dark" | "auto"`
- `auto` respeita `html[data-theme='light'|'dark']` e `prefers-color-scheme`

Caret: light `#0088FF`, dark `#0091FF` via `caret-color`.

## Usos futuros

- Busca da lista de cargas (lab mobile e produção mobile)
- Busca em sheets (`LiquidGlassSheet`)
- Filtros rápidos ao lado da busca (accessory)
- Toolbar search em barras compactas

## Limitações

- Microfone **não** implementa Web Speech API — apenas callback visual (`onMicrophoneClick`).
- `state` no SearchField é opcional para demos; em uso real derive de `value` ou passe explicitamente.
- Blend modes (`plus-darker`, `plus-lighter`) podem variar entre navegadores.

## Arquivos

```
src/shared/design-system/primitives/liquid-glass-search-field/
tests/unit/shared/design-system/liquid-glass-search-field.test.tsx
```
