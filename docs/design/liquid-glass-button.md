# LiquidGlassButton

Primitive reutilizável do Design System HydroRivers, baseado no componente **Button — Liquid Glass** exportado do Figma (iOS Kit).

## Origem

- CSS exportado do Figma: camadas *Fill + Shadow*, *Glass Effect* e tipografia *Symbol* para variantes **Text** e **Symbol** em temas **light** e **dark**.
- Referência visual: PNGs `Light Examples`, `Dark Examples` e frames `Button - Liquid Glass - Text/Symbol`.

## Decisões de conversão

| Figma | Implementação |
| --- | --- |
| Frame com `left` / `top` de canvas | Removido — botão `inline-flex` sem posicionamento de artboard |
| Camadas absolutas *BG*, *Fill + Shadow*, *Glass Effect* | `::before` (fill + sombra) e `::after` (overlay glass) |
| Tipografia SF Pro com pesos 510/590 | `font-family` via `--hydro-font-family-system` (stack do sistema, sem fontes Apple versionadas) |
| `mix-blend-mode: plus-darker` / `plus-lighter` | Mantido no conteúdo (`.label` / `.iconSlot`) conforme tema |
| Grade completa de exemplos (solid, tinted, ghost, disabled, 3 tamanhos) | API com `fill`, `tone`, `size`, `selected`, `disabled` — estilos derivados com fallbacks consistentes |

## O que foi removido do CSS bruto

- `left`, `top` e dimensões fixas de artboard (`width: 85px` como largura obrigatória)
- `position: absolute` fora dos pseudo-elementos de fundo
- `order` / `flex-grow` de camadas internas do auto-layout Figma
- Importação de fonte SF Pro como arquivo

## API

```tsx
import { LiquidGlassButton } from '@/shared/design-system';

<LiquidGlassButton label="Play" tone="accent" fill="glass" />
<LiquidGlassButton variant="icon" aria-label="Play" icon={<PlayIcon />} />
```

### Props

| Prop | Tipo | Default | Descrição |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Conteúdo para `variant="text"` |
| `icon` | `ReactNode` | — | Ícone para `variant="icon"` |
| `label` | `string` | — | Texto quando `children` ausente |
| `variant` | `'text' \| 'icon'` | `'text'` | Layout texto ou símbolo circular |
| `tone` | `'accent' \| 'neutral' \| 'destructive'` | `'neutral'` | Cor semântica |
| `fill` | `'glass' \| 'filled' \| 'tinted' \| 'plain'` | `'glass'` | Tratamento de superfície |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Altura/padding (`md` = 48px Figma) |
| `themeTone` | `'auto' \| 'light' \| 'dark'` | `'auto'` | Tema visual do botão |
| `selected` | `boolean` | `false` | Realce sutil + `aria-pressed` |
| `disabled` | `boolean` | `false` | Opacidade 0.45, sem interação |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Tipo nativo |
| `aria-label` | `string` | — | **Obrigatório** em `variant="icon"` |
| `onClick` | `MouseEventHandler` | — | Handler de clique |
| `className` | `string` | — | Classe adicional |

## Variantes

### `variant`

- **text** — cápsula com label (`children` ou `label`)
- **icon** — cápsula circular 1:1 com `icon` centralizado

### `tone`

- **accent** — azul (`--hydro-color-accent`)
- **destructive** — vermelho (`--hydro-color-danger`)
- **neutral** — rótulo primário / glass neutro

### `fill`

- **glass** — receita Liquid Glass do Figma (gradientes + overlay)
- **filled** — cor sólida do `tone`
- **tinted** — fundo suave do `tone`
- **plain** — sem cápsula; apenas texto/ícone colorido

### `size`

| Size | Texto (altura) | Ícone |
| --- | --- | --- |
| `sm` | 36px | 36×36px |
| `md` | 48px | 48×48px |
| `lg` | 56px | 56×56px |

### `themeTone`

- **light** / **dark** — força paleta
- **auto** — segue `html[data-theme]` ou `prefers-color-scheme`

## Tokens usados

Semânticos (`--hydro-*`):

- `--hydro-radius-pill`
- `--hydro-size-touch-target`
- `--hydro-color-accent`, `--hydro-color-danger`
- `--hydro-color-label-primary`
- `--hydro-color-fill-primary`, `--hydro-color-fill-secondary`
- `--hydro-motion-tap`, `--hydro-motion-control`, `--hydro-motion-easing-standard`
- `--hydro-font-family-system`

Brutos (`--hydro-kit-*`), quando disponíveis:

- `--hydro-kit-colors-accents-blue`
- `--hydro-kit-colors-accents-red`
- `--hydro-kit-liquid-glass-frost-regular`
- `--hydro-kit-liquid-glass-shadow-blur-bg`
- `--hydro-kit-liquid-glass-shadow-blur-layer`

## Fallbacks locais

Valores literais do Figma permanecem como fallback no módulo SCSS (ex.: gradientes light `#F7F7F7` / `#DDDDDD`, sombra `0 8px 40px rgba(0,0,0,.12)`, labels `#1A1A1A` / `#F5F5F5`) até que todos os aliases semânticos estejam presentes no tema global.

## Exemplos

```tsx
// Glass neutro (referência Figma Text light/dark)
<LiquidGlassButton label="Label" fill="glass" themeTone="light" />
<LiquidGlassButton label="Label" fill="glass" themeTone="dark" />

// Accent filled (coluna Solid dos exemplos)
<LiquidGlassButton label="Play" tone="accent" fill="filled" />

// Icon glass
<LiquidGlassButton
  variant="icon"
  aria-label="Confirmar seleção"
  icon={<CheckIcon />}
  fill="glass"
/>

// Ghost / plain
<LiquidGlassButton label="Play" tone="accent" fill="plain" size="sm" />
```

## Onde usar

- Ações em toolbar mobile
- Filtros e chips acionáveis
- Botões de action sheet
- Ações tab-like
- Atalhos com ícone único

## Onde não usar

- Superfície inteira de card clicável (usar `PressableSurface`)
- Texto longo ou multilinha
- Ação destrutiva principal sem confirmação
- Linhas densas de tabela/lista desktop

## Localização no código

```
src/shared/design-system/primitives/liquid-glass-button/
  liquid-glass-button.tsx
  liquid-glass-button.module.scss
  index.ts
```

Exportado em `@/shared/design-system`.
