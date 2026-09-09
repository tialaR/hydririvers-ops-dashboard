# Liquid Glass Text Field

Primitives reutilizáveis do Design System HydroRivers, baseados nos frames Figma **Text Field** e **Field Group** (iOS Kit / Liquid Glass).

## Origem

| Frame Figma | Primitive |
| --- | --- |
| Text Field (Light / Dark examples) | `LiquidGlassTextField` |
| Field Group frame | `LiquidGlassFieldGroup` |

Referências visuais: PNGs `Light examples` e `Dark examples` anexados ao spec de implementação.

## Medidas extraídas

| Token local | Valor | Uso |
| --- | --- | --- |
| `--text-field-row-height` | `52px` | Altura de cada fileira |
| `--text-field-padding-x` | `16px` | Padding horizontal da fileira |
| `--text-field-radius-group` | `26px` | Raio do container agrupado |
| `--text-field-font-size` | `17px` | Tipografia do input |
| `--text-field-line-height` | `20px` | |
| `--text-field-letter-spacing` | `-0.43px` | |
| `--text-field-font-weight` | `510` | |
| `--text-field-caret-light` | `#0088FF` | Caret light |
| `--text-field-caret-dark` | `#0091FF` | Caret dark |

Cores de grupo:

| Modo | Fundo | Separador |
| --- | --- | --- |
| Light | `#FFFFFF` | `#E6E6E6` |
| Dark | `#1C1C1E` | `#1A1A1A` |

Placeholder: `rgba(60,60,67,.3)` (light) / `rgba(235,235,245,.3)` (dark).

## Diferença entre SearchField e TextField

### `LiquidGlassSearchField`

- Cápsula pill (`border-radius: 296px`) com efeito Liquid Glass (camadas `::before` / `::after`).
- `<input type="search">` com ícone de busca e microfone opcional.
- Uso: barras de busca no topo de listas e mapas.

### `LiquidGlassTextField`

- Fileira reta (`52px`) sem glass pill — pensada para formulários agrupados.
- `<input>` nativo (`text`, `email`, `tel`, `number`, `password`).
- Botão **Limpar** opcional (`clearable`) quando há valor.
- Uso: campos de formulário, filtros avançados, edição em sheets.

### `LiquidGlassFieldGroup`

- Container com fundo elevado e `border-radius: 26px`.
- Separadores **entre** filhos (`> * + *`), não acima do primeiro item.
- Compõe várias instâncias de `LiquidGlassTextField`.

## API resumida

```tsx
import {
  LiquidGlassFieldGroup,
  LiquidGlassTextField,
} from '@/shared/design-system';

<LiquidGlassFieldGroup tone="auto">
  <LiquidGlassTextField
    value={origin}
    onChange={setOrigin}
    placeholder="Origem"
    aria-label="Origem"
  />
  <LiquidGlassTextField
    value={destination}
    onChange={setDestination}
    placeholder="Destino"
    clearable
    aria-label="Destino"
  />
</LiquidGlassFieldGroup>
```

## Tokens usados

Variáveis semânticas com fallback para kit:

- `--hydro-color-surface` / `--hydro-color-surface-elevated`
- `--hydro-color-label-primary` / `--hydro-color-label-tertiary`
- `--hydro-color-separator`
- `--hydro-color-accent`
- `--hydro-radius-card`
- `--hydro-motion-control` / `--hydro-motion-easing-standard`
- `--hydro-font-family-system`

## O que foi removido do CSS bruto do Figma

- Posicionamento absoluto de canvas (`left`, `top`, `width: 440px`, `height: 280px`).
- Badge **Mode** (Light/Dark) — apenas referência de tema nos PNGs.
- Cursor fake — o caret é nativo do `<input>`.
- `mix-blend-mode` em nós decorativos desnecessários fora do grupo.
- Divs editáveis ou pseudo-texto “Value” estático.

## Tema

- `data-tone="light" | "dark" | "auto"` em ambos os primitives.
- `auto` respeita `html[data-theme='light'|'dark']` e `prefers-color-scheme`.

## Acessibilidade

- Input nativo; sem `contenteditable`.
- `aria-label` quando não há `label` visível (ou use `label` associado via `htmlFor`).
- Botão limpar: `aria-label="Limpar campo"`.
- `disabled` real no input.
- `focus-visible` / `focus-within` sutil sem outline azul nativo.

## Usos futuros

- Formulários de carga (origem, destino, volume).
- Filtros avançados em sheets mobile.
- Edição de perfil de usuário.
- Campos em action sheets e detalhes de negociação.
- Qualquer formulário dentro de `LiquidGlassSheet`.
