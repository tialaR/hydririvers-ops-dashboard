# LiquidGlassSwitch

Primitive reutilizável do Design System HydroRivers, baseado no componente **Toggle — Switch** exportado do Figma (iOS Kit).

## Origem

- CSS exportado do Figma: frames *Toggle - Switch* em temas **light** e **dark** (estados ligado/desligado).
- Referência visual: PNGs `Light Examples`, `Dark Examples` (anexos Toggle / Switch).

## Medidas extraídas

| Elemento | Valor |
| --- | --- |
| Track (switch) | 64×28px, padding 2px, `border-radius` 100px |
| Knob | 39×24px, fundo branco, `border-radius` 100px |
| Deslocamento do knob | 21px (largura interna − largura do knob) |
| Checked (light) | `#34C759` |
| Checked (dark) | `#30D158` |
| Unchecked (light) | `rgba(60, 60, 67, 0.3)` |
| Unchecked (dark) | `rgba(235, 235, 245, 0.3)` |

## Decisões de conversão

| Figma | Implementação |
| --- | --- |
| Canvas 170×180px com `left` / `top` | Removido — `inline-flex` sem posicionamento de artboard |
| Badge *Mode* (Light/Dark) | Não incluído — o tema é controlado por `tone` / `data-theme` |
| *AX Label* (traço / círculo decorativo) | Omitido — prioridade no switch limpo e acessível via `role="switch"` |
| Auto-layout `order` / `flex-grow` | Layout com `input` nativo + track/knob em CSS Module |

## O que foi removido do CSS bruto

- `left`, `top`, `right` e dimensões de artboard
- `position: absolute` de camadas internas do Figma (exceto overlay invisível do `input` para hit area)
- Badge *Mode* e tipografia SF Pro como dependência de arquivo
- Indicadores visuais *AX Label* (I / O) no track

## API

```tsx
import { LiquidGlassSwitch } from '@/shared/design-system';

<LiquidGlassSwitch
  checked={enabled}
  onChange={setEnabled}
  label="Notificações"
/>

<LiquidGlassSwitch
  checked={enabled}
  onChange={setEnabled}
  aria-label="Alternar notificações"
  tone="dark"
/>
```

### Props

| Prop | Tipo | Default | Descrição |
| --- | --- | --- | --- |
| `checked` | `boolean` | — | Estado ligado/desligado (controlado) |
| `onChange` | `(checked: boolean) => void` | — | Callback ao alternar |
| `disabled` | `boolean` | `false` | Desabilita interação (`opacity` 0.45) |
| `tone` | `'auto' \| 'light' \| 'dark'` | `'auto'` | Tema visual do track |
| `label` | `string` | — | Texto associado (envolve em `<label>`) |
| `aria-label` | `string` | — | **Obrigatório** se `label` ausente |
| `className` | `string` | — | Classe adicional no root |

## Tokens usados

| Token | Uso |
| --- | --- |
| `--hydro-color-success` | Fallback do verde ligado (light) |
| `--hydro-color-fill-secondary` | Fallback do track desligado |
| `--hydro-color-label-primary` | Cor do texto do `label` |
| `--hydro-radius-pill` | `border-radius` do track e knob |
| `--hydro-motion-control` | Duração da animação (180ms local) |
| `--hydro-motion-easing-standard` | Curva de easing |
| `--hydro-color-accent` | Anel de foco `focus-visible` |

Variáveis locais com fallback Figma: `--switch-width`, `--switch-checked-light`, `--switch-checked-dark`, etc.

## Tema

- `data-tone="light"` / `data-tone="dark"` — cores fixas do Figma
- `data-tone="auto"` — segue `html[data-theme='light'|'dark']` e `prefers-color-scheme`

## Interação

- Knob desliza com `transform` (180ms)
- `:active` — `scale(0.98)` no track
- `prefers-reduced-motion` — sem animação
- `input` checkbox nativo com `role="switch"` para leitores de tela e formulários

## Usos futuros

- Preferências de usuário (tema, alertas, privacidade)
- Filtros booleanos em listas mobile
- Configurações e permissões liga/desliga
- Estados on/off em formulários de settings

**Não usar** como substituto de `LiquidGlassSegmentedControl` — o switch é binário; segmentos são para 2–5 opções mutuamente exclusivas.

## Arquivos

- `src/shared/design-system/primitives/liquid-glass-switch/liquid-glass-switch.tsx`
- `src/shared/design-system/primitives/liquid-glass-switch/liquid-glass-switch.module.scss`
- `tests/unit/shared/design-system/liquid-glass-switch.test.tsx`
