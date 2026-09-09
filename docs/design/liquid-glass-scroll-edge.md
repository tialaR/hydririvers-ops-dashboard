# Liquid Glass Scroll Edge

Primitive reutilizável do Design System HydroRivers para **acabamento visual nas bordas de áreas roláveis** — fade, blur e indicação de continuidade — baseado no componente **Scroll Edge** exportado do Figma (iOS/iPadOS Kit).

## Origem

- CSS exportado do Figma: camadas `Edge` (Leading, Trailing, Bottom, Top), `Gradient Mask`, `Blur` e variantes sólidas Top/Bottom.
- Anexos: Scroll Edge / Gradient Mask / Blur do kit Liquid Glass.

## Scroll container vs scroll edge

| Conceito | Responsabilidade |
| --- | --- |
| **Scroll container** | `overflow: auto`, rolagem, foco, conteúdo |
| **Scroll edge** | Camada decorativa `position: absolute` na borda; **não** rola nem captura eventos |

`LiquidGlassScrollEdge` **não** é um scroll container. É uma sobreposição visual para listas, sheets, filtros horizontais, tab strips e panels.

## O que foi removido do CSS bruto

- `left`, `top` e dimensões de artboard (200×200 em posições fixas)
- Vermelho de debug nas máscaras (`rgba(255, 0, 0, …)`) — substituído por máscara preta tokenizada
- `position` absoluto fora do contexto do consumidor

## API

```tsx
import { LiquidGlassScrollEdge } from '@/shared/design-system';

<div className={styles.scrollArea}>
  <LiquidGlassScrollEdge edge="top" />
  <LiquidGlassScrollEdge edge="bottom" variant="mixed" size="md" />
  <div className={styles.content}>…</div>
</div>
```

O container consumidor deve ter `position: relative` e `overflow: auto` (ou equivalente).

### Props

| Prop | Tipo | Default | Descrição |
| --- | --- | --- | --- |
| `edge` | `'top' \| 'bottom' \| 'leading' \| 'trailing'` | — | Borda onde a camada é ancorada |
| `tone` | `'auto' \| 'light' \| 'dark'` | `'auto'` | Tema visual (`html[data-theme]` + `prefers-color-scheme`) |
| `variant` | `'blur' \| 'solid' \| 'mixed'` | `'blur'` | Stack blur+gradient, sólido com separador, ou ambos |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Espessura da faixa (24 / 40 / 64 px) |
| `visible` | `boolean` | `true` | `false` não renderiza o nó |
| `className` | `string` | — | Classe adicional no root |

### Edges e dimensões

| Edge | Inset | Dimensão |
| --- | --- | --- |
| `top` | `left/right/top: 0` | `height` = size |
| `bottom` | `left/right/bottom: 0` | `height` = size |
| `leading` | `left/top/bottom: 0` | `width` = size |
| `trailing` | `right/top/bottom: 0` | `width` = size |

### Variants

| Variant | Camadas |
| --- | --- |
| `blur` | wrapper blur (5px) + gradient mask + blur (30px), blend `screen` |
| `solid` | superfície clara/escura, `multiply`, separador 1px, blur 30px |
| `mixed` | blur stack + camada sólida com separador |

### Gradientes (produto)

| Edge | Direção |
| --- | --- |
| `top` | `180deg`, preto → transparente |
| `bottom` | `0deg`, preto 90% → transparente |
| `leading` | `90deg`, preto 90% → transparente |
| `trailing` | `270deg`, preto 90% → transparente |

## Tokens e fallbacks locais

| Token / variável | Uso |
| --- | --- |
| `--hydro-color-canvas` | Fallback de superfície sólida |
| `--hydro-color-surface` | Fundo da variante `solid` |
| `--hydro-color-separator` | Borda sólida (fallback light/dark) |
| `--hydro-color-overlay` | Reservado para extensões |
| `--hydro-motion-control` | Transição de opacidade |
| `--hydro-motion-easing-standard` | Easing |
| `--scroll-edge-size-sm/md/lg` | 24 / 40 / 64 px |
| `--scroll-edge-blur` | 30px (`backdrop-filter`) |
| `--scroll-edge-wrapper-blur` | 5px |
| `--scroll-edge-opacity` | 0.9 |
| `--scroll-edge-separator-light` | `rgba(0,0,0,.12)` |
| `--scroll-edge-separator-dark` | `rgba(255,255,255,.17)` |

## Acessibilidade

- `aria-hidden` no root e camadas internas
- `pointer-events: none` — não bloqueia clique nem scroll
- Não participa da ordem de foco

## Detecção de scroll (futuro)

Não há hook de visibilidade automática nesta entrega. Um hook futuro pode alternar `visible` conforme `scrollTop` / `scrollLeft`.

## Usos futuros previstos

- Listas longas (mobile cargo, negociações)
- Sheets e action sheets
- Filtros horizontais / chips
- Tab strips com overflow
- Popovers e panels com conteúdo rolável

## Arquivos

- `src/shared/design-system/primitives/liquid-glass-scroll-edge/`
- `tests/unit/shared/design-system/liquid-glass-scroll-edge.test.tsx`
