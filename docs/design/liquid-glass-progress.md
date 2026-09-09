# Liquid Glass Progress

Primitives reutilizáveis do Design System HydroRivers para **barra de progresso** e **spinner** (activity indicator), baseados no componente **Progress indicator / Progress bar** exportado do Figma (iOS Kit).

## Origem

- Anexos visuais: `Dark examples`, `Light examples` (Progress indicator + Progress bar).
- CSS exportado do Figma: track/fill da barra, 8 segmentos do spinner com opacidade gradual, tags de modo Light/Dark.

## Medidas extraídas

| Elemento | Valor |
| --- | --- |
| Wrapper da barra (md) | altura 36px |
| Track | altura 6px, raio 3px, inset horizontal 16px |
| Fill | altura 6px, raio 3px, largura via `%` do valor |
| Spinner (md) | 30×30px |
| Segmentos | 8, `border-radius` 4px |
| Opacidades (12h → horário) | 1, 0.87, 0.75, 0.63, 0.51, 0.39, 0.27, 0.15 |
| Animação spinner | rotação 800ms linear infinita |
| Fill light | `#0088FF` |
| Fill dark | `#0091FF` |
| Track light | `rgba(120, 120, 120, 0.2)` |
| Track dark | `rgba(120, 120, 128, 0.36)` |
| Segmento light | `rgba(60, 60, 67, 0.6)` |
| Segmento dark | `rgba(235, 235, 245, 0.7)` |

## O que foi removido do CSS bruto

- `left`, `top` e dimensões de artboard (410×180, 420×180)
- Posicionamento absoluto por ângulo de cada segmento no canvas
- Tag “Mode” (Light/Dark) do frame de exemplos — substituída por `data-tone` na API
- `mix-blend-mode` por segmento (mantida apenas cor + opacidade)

## API

```tsx
import {
  LiquidGlassProgressBar,
  LiquidGlassSpinner,
} from '@/shared/design-system';

<LiquidGlassProgressBar value={50} max={100} tone="auto" aria-label="Upload" />
<LiquidGlassSpinner size="md" tone="dark" label="Carregando" showLabel />
```

### `LiquidGlassProgressBar`

| Prop | Tipo | Default | Descrição |
| --- | --- | --- | --- |
| `value` | `number` | — | Valor atual (clamp 0…`max`) |
| `max` | `number` | `100` | Valor máximo |
| `tone` | `'auto' \| 'light' \| 'dark'` | `'auto'` | Tema visual |
| `size` | `'sm' \| 'md'` | `'md'` | Altura da barra e track |
| `label` | `string` | — | Texto exibido com `showLabel` |
| `showLabel` | `boolean` | `false` | Exibe label ao lado da barra |
| `aria-label` | `string` | — | Nome acessível da barra |
| `className` | `string` | — | Classe adicional |

Atributos ARIA: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.

### `LiquidGlassSpinner`

| Prop | Tipo | Default | Descrição |
| --- | --- | --- | --- |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Diâmetro do indicador |
| `tone` | `'auto' \| 'light' \| 'dark'` | `'auto'` | Cor dos segmentos |
| `label` | `string` | — | Texto para leitores de tela / exibição |
| `showLabel` | `boolean` | `false` | Exibe label visível |
| `className` | `string` | — | Classe adicional |

Atributos ARIA: `role="status"`, `aria-live="polite"` quando `label` está definido.

## Tokens usados

| Token | Uso |
| --- | --- |
| `--hydro-color-accent` | Fill da barra (fallback `#0088FF` / `#0091FF`) |
| `--hydro-color-label-secondary` | Label opcional |
| `--hydro-color-fill-primary` | Reservado para extensões futuras |
| `--hydro-color-fill-secondary` | Reservado para extensões futuras |
| `--hydro-motion-control` | Transição de largura do fill |
| `--hydro-motion-easing-standard` | Easing da transição |
| `--hydro-font-family-system` | Tipografia do label |

Fallbacks locais no módulo SCSS: `--progress-track-height`, `--progress-bar-height`, `--spinner-duration`, etc.

## Tema

- `data-tone="light"` / `data-tone="dark"` — força paleta do anexo correspondente.
- `data-tone="auto"` — segue `html[data-theme='light'|'dark']` e `prefers-color-scheme` quando o tema global não está fixo.

## Acessibilidade

- Barra: porcentagem refletida em `aria-valuenow` e largura do fill.
- Spinner: `prefers-reduced-motion` desativa rotação contínua (estado estático).
- Use `aria-label` na barra ou `label` no spinner para estados sem texto visível.

## Usos futuros

- Loading de dados em telas mobile.
- Upload/download com progresso real.
- Progresso de rota / viagem.
- Validação de documentos com etapas.
- Alternativa leve a skeleton quando há percentual conhecido.

## Boas práticas

- **Não** usar barra de progresso decorativa em cards de lista sem dado real de avanço.
- Preferir `LiquidGlassSpinner` para espera indeterminada.
- Só mostrar `showLabel` quando o contexto exigir texto visível além do anúncio para SR.

## Arquivos

```
src/shared/design-system/primitives/liquid-glass-progress/
  liquid-glass-progress-bar.tsx
  liquid-glass-spinner.tsx
  liquid-glass-progress.module.scss
  index.ts
```
