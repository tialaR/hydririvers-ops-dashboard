# BottomNav — light mode (preview global)

Componente **oficial** de navegação inferior mobile (`src/shared/components/bottom-nav/`). `ProductMobileBottomNav` usa apenas este componente; `BottomNavLegacy` e gooey pill foram removidos. Light mode apenas; dark mode fica para PR futuro.

## Arquitetura

| Arquivo | Responsabilidade |
| --- | --- |
| `bottom-nav.tsx` | Shell semântico; compõe lens + itens |
| `bottom-nav-items.tsx` | Itens, ícones, labels, pending/press |
| `use-bottom-nav-indicator.ts` | Medição, slide da lens, stretch, icon jump |
| `bottom-nav-light-tokens.sass` | Tokens locais do componente (`--bn-*`) |
| `bottom-nav-motion-tokens.ts` | Durações compartilhadas Sass ↔ hook |
| `bottom-nav.module.sass` | Estilos glass + animações |

Regras: componente burro; lógica no hook; dados de itens no arquivo próprio; sem `querySelector`; sem `!important`.

## Comportamento visual

### Shell (vidro)

- Cápsula flutuante com `backdrop-filter: blur(4px) saturate(150%)`.
- Margem lateral `1rem` (compacta `0.75rem` ≤ 320px); largura máx. `26.875rem`.
- Altura `4.375rem`; offset inferior `max(0.875rem, safe-area)`.
- Conteúdo da página permanece visível atrás do vidro.

### Lens ativa (`activeCutout` + `activeGlass`)

- Segue **somente a rota confirmada** (`activeId`); pending não move a lens.
- **Single selection pill sized by largest item, container sized to avoid edge clipping.**
- Mede todos os itens via refs (`getBoundingClientRect` / `scrollWidth` intrínseco); define **uma** largura única `--active-width` pelo maior label (full ou compact conforme breakpoint) + padding interno do pill.
- O pill **não** muda de tamanho por item ativo; todos os ativos usam exatamente `--active-width`.
- `--active-x` centraliza o pill único sobre o item ativo (sem clamp nas bordas quando o container cumpre a largura mínima).
- `--menu-measured-min-width`: largura mínima do shell = `N × selectionWidth + gaps + padding + border`, limitada ao viewport (`100vw − margens`).
- Se o viewport for pequeno demais (≤360px), fallback compacto controlado (`labelCompact` / tokens tight); o pill continua único dentro desse modo.
- Slide: `280ms` `cubic-bezier(0.2, 0.92, 0.25, 1)`.
- Stretch no vidro interno ao trocar item: `340ms` `cubic-bezier(0.18, 0.9, 0.26, 1)`.

### Itens

- Ícone outlined sempre; label com fallback compacto ≤ 360px (`Negociaç…`).
- Press em item inativo: `scale(0.965)` no botão inteiro (feedback separado do jump).
- Pending: glow azul discreto até a rota confirmar.

### Icon jump

- Dispara **apenas** quando `activeIndex` muda (rota confirmada) — hook `use-bottom-nav-indicator`.
- Classe `.iconJumpActive` no `span.icon` do item ativo; duração `360ms`.
- Distância pico: `-0.3125rem`; scale pico `1.12`; repouso `scale(1.05)`.
- `prefers-reduced-motion`: animações desligadas.

## Component tokens (`--bn-*`)

Aplicados em `.nav` via mixin `bottom-nav-light-tokens` (`bottom-nav-light-tokens.sass`).

| Token | Valor | Uso |
| --- | --- | --- |
| `--bn-z-index` | `240` | Empilhamento local |
| `--bn-menu-max-width` | `22rem` | Largura base do shell (pode crescer até `--menu-measured-min-width`) |
| `--menu-measured-min-width` | (JS) | Largura mínima medida para caber pill único + 5 itens |
| `--bn-menu-margin-inline` | `1rem` | Margem lateral |
| `--bn-menu-bottom-offset` | `0.875rem` | Distância do fundo |
| `--bn-menu-height` | `4.375rem` | Altura do menu |
| `--bn-menu-padding-block` | `0.1875rem` | Padding vertical interno |
| `--bn-menu-padding-inline` | `0.25rem` | Padding horizontal interno |
| `--bn-item-min-width` | `3.125rem` | Largura mínima de item |
| `--bn-active-pill-width-fallback` | `3.5rem` | Fallback antes da medição |
| `--bn-icon-size` | `1.45rem` | Ícone (compacto `1.3125rem`) |
| `--bn-label-font-size` | `0.625rem` | Label |
| `--bn-shell-blur` | `4px` | Blur do vidro |
| `--bn-shell-saturate` | `150%` | Saturação do vidro |
| `--bn-text-inactive` | `rgba(118,118,123,0.82)` | Texto/ícone inativo |
| `--bn-text-active` | `#050507` | Texto/ícone ativo |
| `--bn-motion-cutout-duration` | `280ms` | Slide da lens |
| `--bn-motion-stretch-duration` | `340ms` | Stretch do activeGlass |
| `--bn-motion-icon-jump-duration` | `360ms` | Icon jump |
| `--bn-icon-jump-distance` | `-0.3125rem` | Pico do salto |
| `--bn-icon-jump-scale-peak` | `1.12` | Scale no pico |
| `--bn-icon-active-scale` | `1.05` | Scale em repouso ativo |

Cores de borda, gradientes e sombras do shell/activeGlass estão nomeadas como variáveis Sass (`$bn-shell-*`, `$bn-active-glass-*`) no mesmo arquivo — não promovidas a global até consolidação DS v2.

## Relação com tokens globais

`src/shared/styles/tokens/_hy-v2-light.scss` contém tokens `--hy-*` legados do lab HY. O BottomNav preview global usa **tokens locais `--bn-*`** com valores calibrados na implementação atual; convergência futura pode mapear `--bn-*` → `--hy-*` sem alterar markup.

## DevTools / warnings conhecidos

| Warning | Origem | Bloqueante? |
| --- | --- | --- |
| `[Violation] 'message' handler took …` | Scheduler React/Next em dev (HMR, RSC) | Não — aparece no load e navegação geral |
| `resource was preloaded using link preload but not used` | Prefetch de rotas (`prefetch` em `MotionLink`) + chunks Next | Não — esperado com prefetch agressivo; não é custo do hook de medição |
| `useEffect changed size between renders` | Hot reload durante dev após editar deps do hook | Dev-only; corrigir se reaparecer em build limpo |

O hook evita loops de resize (`ResizeObserver` só em nav + item ativo), debounce de jump e `requestAnimationFrame` para stretch.

## Validação

- Rota padrão: `/pt-BR/cargas`
- Três larguras: 360×740, 390×844, 430×932
- Conferir primeiro, central e último item ativo; lens inteira; margens; jump só após ativação; último card não coberto

## Referências

- `docs/agents/AGENTS-UI-MOBILE-STANDARDS.md` — BottomNav + viewport coverage
- `docs/adr/0023-mobile-layout-and-bottom-navigation-pattern.md`
- `docs/design/liquid-glass-bottom-dock.md` — primitive lab (não substitui este componente)
