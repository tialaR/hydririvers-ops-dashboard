# HydriRivers Design System v2 — Auditoria técnica

**Rodada:** auditoria (sem redesign, sem refatoração de componentes, sem alteração de `/dev-v2` real).  
**Referência visual:** `/pt-BR/dev-v2` em **light mode** (`data-theme="light"` no lab).  
**Fonte de verdade:** implementação real, não Figma nem catálogo isolado.

| Artefato | Caminho |
| --- | --- |
| Lista de cargas dev v2 | `src/features/cargo/components/mobile-list-lab-v2/mobile-cargo-list-lab-v2.tsx` |
| Estilos do lab | `src/features/cargo/components/mobile-list-lab-v2/mobile-cargo-list-lab-v2.module.scss` |
| Bottom sheet compartilhado | `src/shared/components/bottom-sheet/BottomSheet.tsx`, `BottomSheet.module.scss` |
| Interações press | `src/shared/styles/interactions/_pressable.scss` |
| Catálogo (documentação) | `src/features/design-system-v2-catalog/` — tokens `hy-*` espelham o lab; **não** substituem o lab em produção |

---

## 1. Resumo da auditoria

A identidade visual de `/dev-v2` está **implementada de forma implícita**: ~2.4k linhas de SCSS no lab v2 com dezenas de cores, gradientes, blur e pesos tipográficos não padronizados (`610`, `720`, `860`, etc.). Existe um bloco inicial de variáveis `--v2-*` (tema claro/escuro no `.root`), mas a maior parte dos componentes ainda usa **valores literais** repetidos (slate/blue/green, `rgba(241, 245, 249, …)`, `#0f172a`).

O shell de bottom sheet já é **shared** (`BottomSheet` + tokens `--hx-*` sobrescritos por `.filterBottomSheet` / `.cargoBottomSheet`). Primitives de UI (botão, chip, busca, badge, bottom nav) existem apenas como **classes CSS acopladas ao lab**, com lógica de press duplicada (mixin `pressable` + `data-pressing` + `setTimeout(160)` no TSX).

**Decisão desta rodada:** documentar inventário, hardcodes, proposta `hy-*`, ownership e plano de PRs pequenos. **Não** alterar a UI visível de `/dev-v2`, mocks, i18n ou rotas de produto.

**Divergência global:** `layout` do app usa **Geist** (`--font-sans`); o lab v2 usa **system stack** (`--v2-font-family`). O catálogo DS v2 replica a stack do lab via import do SCSS real.

---

## 2. Foundations — inventário atual (light mode)

### 2.1 Tipografia

| Campo | Valor real (light) |
| --- | --- |
| **font-family** | `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif` (`--v2-font-family`) |
| **App global** | Geist via `next/font` → `--font-sans` (fora do escopo do lab) |
| **Monospace (sheet id)** | `ui-monospace, SFMono-Regular, Menlo, monospace` em `.cargoSheetId` |

**Pesos observados (numéricos Apple-like):** 400, 500, 560, 610, 620, 650, 660, 690, 710, 720, 740, 780, 820, 850, 860, 880, 900, 920.

**Escala tipográfica (elementos-chave):**

| Papel | size | line-height | weight | letter-spacing |
| --- | --- | --- | --- | --- |
| Page title | 44px | 0.98 | 900 | -0.075em |
| Page subtitle | 15px | 1.25 | 720 | 0 |
| Card title | 18px | 1.2 | 650 | -0.018em |
| Cargo code (card) | 13px | inherit | 610 | 0.01em |
| Route city | 13px | 1.22 | 500 | 0 |
| ETA label | 10px | inherit | 620 | 0.065em (uppercase) |
| ETA value | 14px | inherit | 620 | 0 |
| Chip | 13.5px | inherit | 710 | 0 |
| Badge (card) | 12px | 1.2 | 620 | 0 |
| Bottom nav label | 9.25px | 1 | 700 | 0.01em |
| Filter sheet title | 43px | 1.12 | 690 | -0.04em |
| Filter section h3 | 16px / 14px (1ª seção) | inherit | 780 | -0.02em / 0.01em |
| Cargo sheet title | 23px | 1.08 | 860 | -0.055em |

### 2.2 Cores — tokens `--v2-*` (light, `.root[data-theme='light']`)

| Token `--v2-*` | Valor |
| --- | --- |
| `--v2-bg-top` | `#eef4ff` |
| `--v2-bg-mid` | `#f7faff` |
| `--v2-bg-bottom` | `#e8eef8` |
| `--v2-text` | `#111827` |
| `--v2-title` | `#0f172a` |
| `--v2-muted` | `rgba(71, 85, 105, 0.74)` |
| `--v2-soft` | `rgba(100, 116, 139, 0.72)` |
| `--v2-blue` | `#2563eb` |
| `--v2-blue-strong` | `#1d4ed8` |
| `--v2-cyan` | `#0891b2` |
| `--v2-green` | `#16a34a` |
| `--v2-yellow` | `#ca8a04` |
| `--v2-glass` | `rgba(255, 255, 255, 0.78)` |
| `--v2-glass-strong` | `rgba(255, 255, 255, 0.92)` |
| `--v2-glass-soft` | `rgba(255, 255, 255, 0.64)` |
| `--v2-border` | `rgba(15, 23, 42, 0.12)` |
| `--v2-border-strong` | `rgba(15, 23, 42, 0.18)` |
| `--v2-line` | `rgba(15, 23, 42, 0.1)` |
| `--v2-shadow` | `0 26px 72px rgba(15, 23, 42, 0.14)` |
| `--v2-card-shadow` | `0 28px 74px rgba(15, 23, 42, 0.14)` |

**Status (card, light)** — hardcoded por `data-status`, não via `--v2-*`:

| Status | text | background | border |
| --- | --- | --- | --- |
| `transito` (default) | `#15803d` | `rgba(220, 252, 231, 0.72)` | `rgba(22, 163, 74, 0.16)` |
| `agendado`, `cotacao` | `#1d4ed8` | `rgba(219, 234, 254, 0.72)` | `rgba(37, 99, 235, 0.16)` |
| `atencao` | `#a16207` | `rgba(254, 243, 199, 0.74)` | (herda verde/amarelo conforme regra) |

**Concluída / Bloqueado:** não existem variantes no SCSS do card do lab v2 (apenas no catálogo `hy-*` como preparação).

### 2.3 Radius (light, valores literais dominantes)

| Uso | px | rem (hy proposto) |
| --- | --- | --- |
| Cargo card | 23 | 1.4375rem |
| Search field | 18 | 1.125rem |
| Icon button (header/filter) | 19 | 1.1875rem |
| Card CTA | 16 | 1rem |
| Cargo icon (card) | 12 | 0.75rem |
| Filter sheet top | 32px 32px 0 0 | 2rem |
| Cargo sheet | 29 | 1.8125rem |
| Chips / badges | 999px | pill |
| Bottom nav shell | 999px | pill |
| Active nav bubble | 999px | pill |

### 2.4 Shadows / elevation

- App/page: `--v2-shadow`, `--v2-card-shadow` (pouco reutilizados nos filhos).
- Card: `--card-shadow` local + highlight inset.
- Icon button: `0 14px 30px rgba(15, 23, 42, 0.12)` + inset highlight.
- Bottom nav: `0 10px 24px …` + glow azul fraco.
- Sheets: `0 28px 86px`, `0 -18px 70px` (filter), múltiplas camadas inset.

### 2.5 Blur / glass

| Superfície | blur típico (light) |
| --- | --- |
| Search / header buttons | `blur(24px) saturate(1.06–1.08)` |
| Bottom nav | `blur(24px) saturate(1.08)` |
| Filter sheet panel | `blur(28px) saturate(1.08)` |
| Cargo sheet panel | `blur(36px) saturate(1.14)` |
| Overlay (filter, global) | `blur(10px)` via `:global(body):has(.filterBottomSheet)` |
| BottomSheet base (`strong`) | `blur(15px)` overlay + shell default |

Fundos “glass” são quase sempre **gradiente + rgba**, não um único token.

### 2.6 Overlay

- `BottomSheet` `overlayVariant="strong"`: `rgba(1, 7, 11, 0.58)` + blur 15px (default shared).
- Lab filter override: `rgba(3, 8, 14, 0.3)` + blur 10px quando body `:has(.filterBottomSheet)`.
- Proposta catálogo: `--hy-color-overlay-sheet: rgba(3, 8, 14, 0.3)` (light).

### 2.7 Motion / bubble press

| Mecanismo | Onde | Parâmetro |
| --- | --- | --- |
| `pressableBubble` | chips, search, nav, cardAction, filter actions | scale **1.045** default; card **1.035**; icon **1.06** |
| `pressableCard` | `.cargoCard` | scale 1.035, 160ms |
| `data-pressing` + scale 1.045 | filter chips, sheet footer buttons | TSX timeout **160ms** |
| `cardAction:active` | card footer CTA | scale **1.045** (redundante com card) |
| BottomSheet close | `closeButton` | scale **0.94**, delay close **160ms** |
| Entrada lista | `riseIn`, `cardIn` | 560ms, stagger `82ms * index` |
| Nav bubble | `activeNavBubble` | transitions 170–220ms |

Easing dominante: `cubic-bezier(0.2, 1, 0.2, 1)` e `cubic-bezier(0.2, 0.8, 0.2, 1)` (pressable).

---

## 3. Primitives — mapeamento atual

| Primitive | Classes / componentes reais | Shared hoje? | Press behavior |
| --- | --- | --- | --- |
| **Button** (secondary/primary) | `.filterSheetActions button`, `.sheetFooterActions button` | Não | `pressableBubble` + `data-pressing` |
| **IconButton** | `.headerButton`, `.filterSquare`, overrides sheet close | Não (estilo no lab) | `pressableIconButton` |
| **SearchField** | `.searchRow` + `.searchField` | Não | `pressableBubble(1.025)` + `focusBubble` |
| **FilterChip** | `.filterChipGrid button` + `FilterChipButton` | Não | pointer capture + `data-pressing` 160ms |
| **StatusBadge** | `.statusBadge` + `data-status` | Não | estático |
| **BottomNav** | `.bottomNav`, `.navItem`, `.activeNavBubble` | Não | `pressableBubble` nos itens |
| **BottomSheet shell** | `BottomSheet` + `.filterBottomSheet` / `.cargoBottomSheet` | **Sim** | drag + close press (shared) |
| **Pressable** | `_pressable.scss` | **Sim** (mixin) | ver §2.7 |

---

## 4. Cargo components — mapeamento atual

| Peça | Implementação | Estados |
| --- | --- | --- |
| **CargoCard** | `.cargoCard` + `CargoCard` TSX | `pressableCard`, click → sheet; sem `selected`/`disabled` explícitos |
| **Cargo icon** | `.cargoIcon` / inline SVG `CubeIcon` / `ContainerIcon` | troca por `cargoType === 'Projeto'` |
| **Route line + boat** | `.routeLine`, `.dashedRoute`, `RouteBoatIcon` | dots `origin` / `destination` |
| **Origin/destination markers** | `.routeDot[data-tone]` | verde / azul (light: implícito em rgba) |
| **ETA area** | `.cardFooter` label + strong | uppercase micro label |
| **CTA** | `.cardAction` (não `<button>`) | texto por status (`agendado` → "Ver detalhes") |
| **Status badge** | `StatusBadge` | 4 status no tipo TSX; 3 estilos visuais distintos no card |
| **Cargo detail sheet** | `CargoSheet` + `.cargoSheet*` | rota, stats, action list |

Tudo acima permanece **domínio cargo** até extração explícita de subpartes genéricas.

---

## 5. Hardcodes encontrados (amostra representativa)

**Contagem:** ~112 declarações com hex/rgba direto no SCSS do lab (além das ~20 `--v2-*`).

### 5.1 Cores repetidas sem token (light)

| Valor | Ocorrências típicas |
| --- | --- |
| `#0f172a` | títulos, inputs, sheet headers |
| `#111827` | `--v2-text`, card h2 |
| `#172033` | card text light |
| `rgba(37, 99, 235, …)` | subtitle, cargo id, chips ativos, nav |
| `rgba(71, 85, 105, …)` | bordas light, textos secundários |
| `rgba(241, 245, 249, …)` / `rgba(226, 234, 246, …)` | superfícies glass light |
| `#2f7bff`, `#29d2a9` / `#29c9a4` | gradiente primary CTA |
| `#6aa8ff` | badge contador header (hardcoded no gradient) |
| `#15803d`, `#1d4ed8`, `#a16207` | status badge light |

### 5.2 Dimensões / layout mágicos

| Valor | Uso |
| --- | --- |
| `430px` | `phoneShell`, sheets max-width |
| `52px` | altura search + icon buttons |
| `70px` / `58px` | bottom nav / active bubble |
| `40dvh` / `98dvh` / `90dvh` | snap heights filter/cargo |
| `128px` | padding-bottom shell (espaço nav) |

### 5.3 Tipografia hardcoded

- Pesos não padronizados: `610`, `690`, `710`, `780`, `850`, `860`, `920`.
- Tamanhos únicos: `43px` sheet title, `13.5px` chips, `9.25px` nav.

### 5.4 Duplicação tema light

- Regras triplicadas: `.root[data-theme='light']`, `:global(body:has([data-theme='light']))`, e blocos espelhados para sheets — risco de drift em extração.

### 5.5 TSX / comportamento

- `setTimeout(..., 160)` para press feedback (chips, filter actions, close sheet).
- Ícones SVG inline no mesmo arquivo (~15 componentes) — não shared.
- Estado inicial `theme: 'dark'` no lab — **light é opt-in** via toggle; auditoria foca light após toggle.

---

## 6. Proposta de tokens semânticos `hy-*`

Prefixo **`hy-`** = Design System v2 derivado do lab. **`hx-`** permanece contrato legado do `BottomSheet` shared (manter compatibilidade; mapear `hy` → `hx` nos overrides de sheet).

### 6.1 Cores

```css
/* Background */
--hy-color-background-app: #eef4ff;
--hy-color-background-mid: #f7faff;
--hy-color-background-bottom: #e8eef8;
--hy-color-background-elevated: rgba(255, 255, 255, 0.78);

/* Text */
--hy-color-text-primary: #111827;
--hy-color-text-title: #0f172a;
--hy-color-text-secondary: rgba(71, 85, 105, 0.74);
--hy-color-text-muted: rgba(100, 116, 139, 0.72);
--hy-color-text-accent: rgba(37, 99, 235, 0.86);

/* Brand / semantic */
--hy-color-brand: #2563eb;
--hy-color-brand-strong: #1d4ed8;
--hy-color-success: #16a34a;
--hy-color-warning: #ca8a04;
--hy-color-cyan: #0891b2;

/* Surfaces */
--hy-color-surface-card: rgba(229, 236, 247, 0.72);
--hy-color-surface-search: rgba(226, 234, 246, 0.66);
--hy-color-surface-sheet: rgba(248, 251, 255, 0.92);
--hy-color-surface-bottom-nav: rgba(226, 234, 246, 0.76);
--hy-color-glass-surface: rgba(255, 255, 255, 0.78);
--hy-color-border-subtle: rgba(15, 23, 42, 0.1);
--hy-color-border-strong: rgba(15, 23, 42, 0.18);

/* Actions */
--hy-color-action-primary-start: #2f7bff;
--hy-color-action-primary-end: #29d2a9;
--hy-color-action-secondary: rgba(241, 245, 249, 0.64);
--hy-color-focus-ring: #2563eb;

/* Route */
--hy-color-route-origin: #16a34a;
--hy-color-route-destination: #2563eb;

/* Overlay */
--hy-color-overlay-sheet: rgba(3, 8, 14, 0.3);

/* Status — alinhado ao catálogo + lab */
--hy-color-status-in-transit-text: #15803d;
--hy-color-status-in-transit-bg: rgba(220, 252, 231, 0.72);
--hy-color-status-in-transit-border: rgba(22, 163, 74, 0.16);
--hy-color-status-scheduled-text: #1d4ed8;
--hy-color-status-scheduled-bg: rgba(219, 234, 254, 0.72);
--hy-color-status-scheduled-border: rgba(37, 99, 235, 0.16);
--hy-color-status-quotation-text: #1d4ed8; /* mesmo par agendado no lab */
--hy-color-status-quotation-bg: rgba(219, 234, 254, 0.72);
--hy-color-status-quotation-border: rgba(37, 99, 235, 0.16);
--hy-color-status-delayed-text: #a16207;
--hy-color-status-delayed-bg: rgba(254, 243, 199, 0.74);
--hy-color-status-delayed-border: rgba(202, 138, 4, 0.24);
/* completed / blocked: reservados no catálogo; wire quando lab tiver variantes */
```

### 6.2 Tipografia

```css
--hy-font-family-base: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif;
--hy-font-family-mono: ui-monospace, SFMono-Regular, Menlo, monospace;

--hy-font-size-display: 2.75rem;    /* 44px */
--hy-font-size-sheet-title: 2.6875rem; /* 43px filter */
--hy-font-size-title: 1.125rem;       /* 18px */
--hy-font-size-subtitle: 0.9375rem;   /* 15px */
--hy-font-size-body: 0.875rem;        /* 14px */
--hy-font-size-chip: 0.84375rem;      /* 13.5px */
--hy-font-size-label: 0.75rem;
--hy-font-size-caption: 0.6875rem;
--hy-font-size-micro: 0.625rem;       /* 10px ETA */
--hy-font-size-nav: 0.578125rem;    /* 9.25px */

--hy-font-weight-regular: 400;
--hy-font-weight-medium: 500;
--hy-font-weight-semibold: 620;
--hy-font-weight-bold: 720;
--hy-font-weight-heavy: 780;
--hy-font-weight-display: 690;
--hy-font-weight-black: 900;

--hy-line-height-display: 0.98;
--hy-line-height-title: 1.2;
--hy-line-height-subtitle: 1.25;
--hy-line-height-body: 1.35;
--hy-line-height-label: 1.2;

--hy-letter-spacing-display: -0.075em;
--hy-letter-spacing-sheet-title: -0.04em;
--hy-letter-spacing-title: -0.018em;
--hy-letter-spacing-label: 0.065em;
--hy-letter-spacing-code: 0.01em;
```

### 6.3 Radius, shadow, blur, motion

```css
--hy-radius-card: 1.4375rem;
--hy-radius-search: 1.125rem;
--hy-radius-icon-button: 1.1875rem;
--hy-radius-button: 1rem;
--hy-radius-sheet-top: 2rem;
--hy-radius-sheet: 1.8125rem;
--hy-radius-chip: 999rem;
--hy-radius-bottom-nav: 999rem;

--hy-shadow-card-soft: 0 1.625rem 4.5rem rgba(15, 23, 42, 0.14);
--hy-shadow-card-elevated: 0 1.125rem 2.625rem rgba(15, 23, 42, 0.12), 0 0.25rem 0.75rem rgba(15, 23, 42, 0.08);
--hy-shadow-icon-button: 0 0.8125rem 1.75rem rgba(15, 23, 42, 0.12);
--hy-shadow-sheet: 0 1.75rem 5.375rem rgba(15, 23, 42, 0.18);
--hy-shadow-bottom-nav: 0 0.625rem 1.5rem rgba(15, 23, 42, 0.14);

--hy-blur-surface-soft: blur(1.5rem) saturate(1.08);
--hy-blur-sheet-panel: blur(1.75rem) saturate(1.14);
--hy-blur-overlay: blur(0.625rem) saturate(1.02);

--hy-motion-duration-press: 160ms;
--hy-motion-duration-enter: 560ms;
--hy-motion-stagger-card: 82ms;
--hy-motion-ease-standard: cubic-bezier(0.2, 1, 0.2, 1);
--hy-motion-scale-bubble: 1.045;
--hy-motion-scale-card: 1.035;
--hy-motion-scale-icon: 1.06;
```

**Migração sugerida:** ` --v2-*` → alias para `hy-*` no lab (PR dedicado) antes de remover `--v2-*`.

---

## 7. Architecture ownership

| Camada | Dono | Exemplos |
| --- | --- | --- |
| **Foundations `hy-*`** | `src/shared/styles/tokens/` | cores, tipo, radius, motion — sem UI de negócio |
| **Primitives** | `src/shared/components/` ou `src/shared/design-system/components/` | `BottomSheet` (já), futuros `IconButton`, `SearchField`, `FilterChip`, `StatusBadge`, `BottomNav` |
| **Press mixin** | `src/shared/styles/interactions/` (já) | manter; opcional hook `usePressFeedback(ms)` |
| **Cargo UI** | `src/features/cargo/` | `CargoCard`, route line, `CargoSheet`, `FiltersSheet` conteúdo, ícones de domínio, mocks de filtro |
| **Catálogo** | `src/features/design-system-v2-catalog/` | documentação; importa shared + lab SCSS; **não** é runtime de produto |
| **Rota** | `src/app/[locale]/dev-v2/` | página fina |

**Regra:** shared só quando **≥2 domínios** ou contrato de shell (sheet, press, overlay). Visual de rota/carga/status copy permanece em cargo até segunda feature consumir.

---

## 8. Shared vs feature — decisão

### 8.1 Candidatos a shared (extração incremental)

| Item | Motivo |
| --- | --- |
| `BottomSheet` | já shared; manter overrides `--hx-*` em theme layer |
| Tokens `hy-*` (+ bridge `hx`) | single source para lab, catálogo e futuros consumers |
| `_pressable.scss` | já shared |
| `IconButton` | header, filter, padrão close 43px |
| `SearchField` | padrão glass 52px + ícone |
| `FilterChip` + lógica `data-pressing` | filtros e possíveis outras listas |
| `StatusBadge` | statuses logísticos reutilizáveis |
| `Button` / `ButtonPrimary` | footer de sheet (gradiente azul→verde) |
| `BottomNav` shell | 5 colunas, safe-area, glass pill — **sem** labels de produto hardcoded |
| Hook `usePointerPressFeedback(160)` | unificar TSX chips/actions/close |

### 8.2 Permanecer na feature cargo

| Item | Motivo |
| --- | --- |
| `CargoCard` composição | layout específico lista de cargas |
| `RouteBoatIcon`, route line, dots | semântica logística |
| `CargoSheet`, `FiltersSheet` seções | copy, ícones de seção, mocks |
| Dados `CARGOES`, regras de filtro | domínio + mocks existentes |
| `phoneShell` / page header "Cargas" | experiência dev-v2 |
| Variação ícone Projeto vs cubo | regra de negócio apresentação |
| Overrides `.filterBottomSheet` / `.cargoBottomSheet` | podem virar `cargo-bottom-sheet.theme.scss` na feature injetando `hy`/`hx` |

---

## 9. Plano incremental de PRs (pequenos)

| PR | Escopo | Critério de aceite | Risco |
| --- | --- | --- | --- |
| **PR-1** | ✅ `src/shared/styles/tokens/_hy-v2-light.scss` + mixin `hy-v2-light-tokens` | typecheck; sem consumo no lab | Baixo |
| **PR-2** | ✅ Alias `--v2-*` ← `--hy-*` em `.root[data-theme='light']` | visual neutro; 2 tokens literais | Baixo |
| **PR-3** | ✅ Tokenizar hardcodes repetidos no lab SCSS via `var(--v2-*)` (light) | visual neutro; portal body mirror | Médio |
| **PR-4** | ✅ `IconButton` shared + migração icon buttons `/dev-v2` + close em `BottomSheet` (lab) | visual neutro; testes unitários | Médio |
| **PR-5** | ✅ `StatusBadge` shared + migração badges `/dev-v2` | visual neutro; testes unitários | Baixo |
| **PR-6** | ✅ `FilterChip` shared + migração chips do filter sheet `/dev-v2` | visual neutro; Bubble Press; testes | Médio |
| **PR-7** | ✅ `Button`, `SearchField`, `BottomNav` shared + migração `/dev-v2` | visual neutro; testes | Médio |
| **PR-8** | Extrair `HyButton` primary/secondary | filter sheet footer | Médio — ícones mask CSS |
| **PR-9** | Documentar bridge `hy`→`hx` em theme partial para sheets | filter/cargo sheets iguais | Alto — muitos seletores globais |
| **PR-10** | Catálogo: consumir tokens shared; reduzir duplicação `hy-*` no catalog scss | rota design-system | Baixo |
| **PR-11** | `HyBottomNav` shell genérico; cargo passa slots/labels | nav ativo "Cargas" | Alto — fixed positioning |
| **PR-12** | Estados `concluida`/`bloqueado` no lab (se produto exigir) | novos tokens status | Baixo escopo inicial |

**Ordem:** PR-1 → PR-2 → PR-3 antes de qualquer componente React extraído.

---

## 10. Riscos de regressão visual

1. **Substituir rgba por token arredondado** — diferenças subpixel em glass/gradientes.
2. **Triplicação de regras light** — corrigir um bloco e esquecer `:global(body:has(...))`.
3. **Bottom sheet:** `BottomSheet.module.scss` + overrides lab — ordem de especificidade e `viewportAnchor="flush"`.
4. **Font stack:** trocar para Geist mudaria métricas de título 44px/43px.
5. **Pesos 610–860:** navegadores renderizam synthetic bold — mudar para escala 400–700 altera aparência.
6. **Nav fixed vs catálogo** — `position: relative` em specimen muda sombra/recorte.
7. **Motion:** remover stagger ou scale quebra percepção "nativa iOS".
8. **Tema default dark no código** — testes manuais devem **sempre** ativar light antes de comparar.
9. **Desktop/produto** — extrair para shared sem feature flag pode vazar estilo mobile; manter escopo `/dev-v2` até revisão explícita.

---

## 11. Checklist — validação visual (light mode)

Abrir `/pt-BR/dev-v2`, alternar para **light**, viewport **430×~932** (ou device toolbar iPhone 14).

- [ ] Fundo app: gradiente azul claro `#eef4ff` → `#e8eef8`, sem banding
- [ ] Título "Cargas" 44px preto azulado `#0f172a`, subtítulo azul `rgba(37,99,235,.62)`
- [ ] Botões header 52×52px, glass claro, badge contador gradiente azul
- [ ] Campo busca 52px altura, placeholder legível, focus scale sutil
- [ ] Cards: raio ~23px, sombra suave, stagger na entrada
- [ ] Badge status: verde trânsito, azul agendado/cotação, âmbar atenção
- [ ] Rota: dot verde origem, azul destino, linha tracejada + barco central
- [ ] CTA card: pill 16px, não parece botão nativo disabled
- [ ] Bottom nav: pill fixo, item "Cargas" com bubble azul ativo
- [ ] Sheet filtros: título ~43px, chips wrap, chip ativo azul, footer "Ver cargas" gradiente
- [ ] Overlay filtros: blur leve, não escurece demais o fundo em light
- [ ] Sheet cargo: rota box, stats ETA/entrega, lista de ações, botão "Ações da carga"
- [ ] Fechar sheet: botão 43px, feedback press 160ms
- [ ] `prefers-reduced-motion`: sem scale em press/card

Comparar lado a lado com `/pt-BR/dev-v2/design-system` (specimens) — tolerância: posição nav (specimen relative).

---

## 12. Checklist — validação técnica

```bash
npm run lint
npm run typecheck
npm run check:i18n
npm run build
```

- [ ] Sem novas deps
- [ ] Sem edição de `globals.scss` para UI de feature
- [ ] Sem `!important` novo
- [ ] Mocks/auth/i18n intocados
- [ ] Mobile/desktop produto fora do escopo não alterados
- [ ] Determinismo SSR: sem `Math.random`/`Date.now` em render de novos componentes
- [ ] A11y: `aria-pressed` em chips, roles em cards botão, labels de sheet preservados

---

## 13. Catálogo `/dev-v2/design-system` (referência, fora do escopo de mudança)

- Reutiliza markup/classes do lab via import de `mobile-cargo-list-lab-v2.module.scss`.
- Define `hy-*` em `design-system-v2-catalog.module.scss` — **espelho documental**; alvo é convergir para tokens shared (PR-10).
- Toggle tema local não altera `/dev-v2` principal.

---

## 14. Arquivos alterados — rodada auditoria

| Arquivo | Ação |
| --- | --- |
| `docs/design/hydririvers-design-system-v2-audit.md` | Auditoria inicial |

---

## 15. PR-1 — tokens shared light (sem consumo visual)

**Status:** concluído. Light-only; dark mode ficará em PR futuro (`_hy-v2-dark.scss`).

| Arquivo | Ação |
| --- | --- |
| `src/shared/styles/tokens/_hy-v2-light.scss` | Criado — mixin `@include hy-v2-light-tokens` |
| `src/shared/styles/tokens/README.md` | Criado — uso e ownership |
| `docs/design/hydririvers-design-system-v2-audit.md` | Atualizado — PR-1 |

**Não alterados (sem mudança visual):** `mobile-cargo-list-lab-v2.module.scss`, catálogo, rotas `/dev-v2`, `globals.scss`, mocks, i18n, componentes.

### Grupos de tokens no mixin

| Grupo | Exemplos de variáveis |
| --- | --- |
| Background | `--hy-color-background-app`, `-mid`, `-bottom`, `-elevated` |
| Text | `--hy-color-text-primary`, `-title`, `-secondary`, `-muted`, `-accent` |
| Brand / semantic | `--hy-color-brand`, `-brand-strong`, `-success`, `-warning`, `-cyan` |
| Surfaces | `--hy-color-surface-card`, `-sheet`, `-search`, `-bottom-nav`, glass, borders, line |
| Actions | `--hy-color-action-primary-start/end`, `-secondary`, `-focus-ring` |
| Route | `--hy-color-route-origin`, `-destination` |
| Overlay | `--hy-color-overlay-sheet` |
| Status | `in-transit`, `scheduled`, `quotation`, `delayed`, `completed`, `blocked` (bg/text/border) |
| Layout / size | `--hy-size-shell-max-width`, `--hy-size-control-height`, spacing shell/card/chip |
| Radius | card, sheet, chip, badge, button, icon-button, bottom-nav, search, cargo-icon |
| Shadow | app, card-soft/elevated, sheet, bottom-nav, icon-button, focus |
| Blur | surface-soft, sheet-backdrop, bottom-nav, overlay |
| Typography | family, sizes (display → nav), weights, line-heights, letter-spacing |
| Motion | press duration/scale variants, enter duration, stagger, easing |

**Consumo:** mixin incluído no lab a partir do PR-2 (light).

---

## 16. PR-2 — alias `--v2-*` → `--hy-*` no lab (light)

**Status:** concluído. Escopo: `.root[data-theme='light']` em `mobile-cargo-list-lab-v2.module.scss`.

| Arquivo | Ação |
| --- | --- |
| `mobile-cargo-list-lab-v2.module.scss` | `@use` + `@include hy-v2-light-tokens` + aliases |
| `docs/design/hydririvers-design-system-v2-audit.md` | Esta seção |

**Contrato após PR-2:**

- `--hy-*` — fonte shared (mixin `hy-v2-light-tokens`) no escopo light do lab.
- `--v2-*` — API local do lab; estilos existentes continuam usando `var(--v2-*)`.
- Dark mode — inalterado; continua com literais no `.root` base.

### Aliases aplicados (`--v2-*` → `var(--hy-*)`)

| `--v2-*` | `--hy-*` |
| --- | --- |
| `--v2-bg-top` | `--hy-color-background-app` |
| `--v2-bg-mid` | `--hy-color-background-mid` |
| `--v2-bg-bottom` | `--hy-color-background-bottom` |
| `--v2-text` | `--hy-color-text-primary` |
| `--v2-title` | `--hy-color-text-title` |
| `--v2-muted` | `--hy-color-text-secondary` |
| `--v2-soft` | `--hy-color-text-muted` |
| `--v2-blue` | `--hy-color-brand` |
| `--v2-blue-strong` | `--hy-color-brand-strong` |
| `--v2-cyan` | `--hy-color-cyan` |
| `--v2-green` | `--hy-color-success` |
| `--v2-yellow` | `--hy-color-warning` |
| `--v2-glass` | `--hy-color-glass-surface` |
| `--v2-glass-strong` | `--hy-color-glass-strong` |
| `--v2-glass-soft` | `--hy-color-glass-soft` |
| `--v2-border-strong` | `--hy-color-border-strong` |
| `--v2-line` | `--hy-color-line-subtle` |
| `--v2-shadow` | `--hy-shadow-app` |

### Aliases evitados (valor lab ≠ token `hy-*`)

| Token | Motivo |
| --- | --- |
| `--v2-border` | Lab `rgba(15,23,42,0.12)` vs `hy-color-border-subtle` `0.1` |
| `--v2-card-shadow` | Lab `0 28px 74px` vs `hy-shadow-card-soft` `0 26px 72px` (1.625rem/4.5rem) |

### Não definidos no bloco light (sem alias nesta rodada)

| Token | Notas |
| --- | --- |
| `--v2-blur` | Só no `.root` dark; light herda — fora do escopo PR-2 |
| `--v2-font-family` | Só no `.root` dark; stack idêntica — PR futuro dark/light unificado |

**Hardcodes no lab (light):** PR-3 substituiu repetições por `var(--v2-*)`; ver §18.

**Validação visual (PR-2):** neutra — alias `--hy-*` byte-equivalente aos literais anteriores (exceto `--v2-border` / `--v2-card-shadow` mantidos literais).

---

## 18. PR-3 — tokenizar hardcodes repetidos no lab (light)

**Objetivo:** reduzir literais visuais duplicados em `mobile-cargo-list-lab-v2.module.scss` via API local `--v2-*`, sem mudança visual em `/pt-BR/dev-v2`.

**Arquivos:** `src/features/cargo/components/mobile-list-lab-v2/mobile-cargo-list-lab-v2.module.scss`, este audit.

### Grupos substituídos

| Grupo | Exemplos antes | Token(s) |
| --- | --- | --- |
| Texto primário / título | `#0f172a`, `rgba(15, 23, 42, 0.78–0.9)` | `--v2-title`, `--v2-text`, `--v2-text-strong`, `--v2-text-body*` |
| Texto secundário | `rgba(71, 85, 105, …)`, `rgba(100, 116, 139, …)` | `--v2-muted`, `--v2-soft`, `--v2-text-secondary-*`, `--v2-text-slate-*` |
| Superfícies frost | `rgba(241, 245, 249, 0.58–0.72)` | `--v2-surface-frosted-*`, `--v2-surface-card`, `--v2-surface-search` |
| Bordas slate | `rgba(71, 85, 105, 0.1–0.14)` | `--v2-border-slate-*` |
| Status badges/chips | rgba de status | `--v2-status-*` |
| Brand / accent | `#2563eb` | `--v2-blue`, `--v2-blue-strong` |
| Card / sheet bridge | `--hx-text`, `--hx-line-soft`, `--hx-cyan` | `var(--v2-title)`, `var(--v2-line)`, `var(--v2-blue)` |

**Exemplo:** `color: var(--v2-title)` no lugar de `#0f172a`; `border-color: var(--v2-border-slate-14)` no lugar de `rgba(71, 85, 105, 0.14)`.

### Literais centralizados (sem match exato `hy-*`)

`--v2-border-slate-10` … `--v2-border-slate-14`, `--v2-surface-frosted-*`, `--v2-text-slate-*`, `--v2-text-route-city`, `--v2-line-faint`, `--v2-highlight-inset`.

### Portal

`:global(body:has([data-theme='light']))` inclui mixin + espelho de `--v2-*` para bottom sheets portaled.

### Preservados

`--v2-border` (0.12), `--v2-card-shadow` (28/74), gradientes de fundo únicos, `--hx-card` / `--hx-card-2`, dark mode, `430px`, snaps `dvh`, radius/font soltos sem repetição clara, SVG/timings.

### Visual

Neutro por design — substituições referenciam os mesmos valores já renderizados no light.

### Próximo passo (PR-4)

Concluído — ver §19.

---

## 19. PR-4 — `IconButton` shared e migração `/dev-v2`

**Componente:** `src/shared/components/icon-button/IconButton.tsx` (+ `IconButton.module.scss`, `index.ts`).

**API:**

| Prop | Tipo | Notas |
| --- | --- | --- |
| `ariaLabel` | `string` | obrigatório (`aria-label`) |
| `icon` | `ReactNode` | conteúdo do ícone |
| `variant` | `default` \| `filter` \| `theme` \| `close` \| `map` \| `alert` | glass 52px em default/filter/theme |
| `size` | `sm` \| `md` \| `lg` | ignorado em `close` (estilo via `className`) |
| `isActive` | `boolean` | `aria-pressed` + `data-active` |
| `badgeCount` | `number` | badge canto superior direito se `> 0` |
| `disabled`, `className`, `onClick`, `type` | — | repassa ao `<button>`; `forwardRef` |

**Usos migrados:**

| Local | Variante | Notas |
| --- | --- | --- |
| Header — abrir filtros | `default` + `badgeCount` | `className={styles.headerButton}` |
| Header — tema claro/escuro | `theme` | `className={styles.headerButton}` |
| Search row — filtro | `filter` | `className={styles.filterSquare}` |
| `BottomSheet` — fechar | `close` + `className={styles.closeButton}` | press feedback preservado; overrides lab em `> header button` |

**Não migrados:**

| Uso | Motivo |
| --- | --- |
| Bottom nav `navItem` | navegação com label/ícone+texto, não icon-only compact |
| Filter chips / sheet chips | padrão chip textual, não icon button |
| `FilterSheetActions` / CTAs | botões com texto |
| `moreCargoActions`, ações cargo sheet | texto + estrutura composta |
| Ícones em `CargoCard` / rota / `cargoSheetIcon` | decorativos ou não clicáveis |
| Catálogo `/dev-v2/design-system` | ausente nesta branch |

**Testes:** `tests/unit/shared/components/icon-button.component.test.tsx` (aria-label, onClick, disabled, badge, active, variant).

**Visual:** neutro — estilos glass 52px movidos para o module do `IconButton`; overrides light/dark do lab em `.headerButton` / `.filterSquare` e `> header button` nos sheets mantidos.

**Próximo passo (PR-5):** concluído — ver §20.

---

## 20. PR-5 — `StatusBadge` shared e migração `/dev-v2`

**Componente:** `src/shared/components/status-badge/StatusBadge.tsx` (+ `StatusBadge.module.scss`, `status-badge-utils.ts`, `index.ts`).

**API:**

| Prop | Tipo | Notas |
| --- | --- | --- |
| `status` | `inTransit` \| `scheduled` \| `quotation` \| `delayed` \| `completed` \| `blocked` | mapeia `data-status` legado (`transito`, `agendado`, …) |
| `children` | `ReactNode` | opcional; default PT-BR por status |
| `showDot` | `boolean` | default `true`; `false` no card |
| `size` | `sm` \| `md` | `sm` = card compact; `md` = sheet com dot |
| `className`, `ariaLabel` | — | repassa ao `<span>` |

**Statuses com estilo no lab:** `inTransit`, `scheduled`, `quotation`, `delayed` (tokens `--v2-status-*` no light via overrides do lab).

**`completed` / `blocked`:** API + `data-status` preparados; sem tokens/estilos dedicados no lab atual — usam base `inTransit` até PR-12.

**Usos migrados:**

| Local | Config |
| --- | --- |
| `CargoCard` header | `CargoStatusBadge` → `size="sm"`, `showDot={false}`, label do mock |
| `CargoSheet` header | `CargoStatusBadge` → `size="md"`, dot ativo |

**Não migrados:** filter chips, CTAs, ícones decorativos, catálogo ausente nesta branch.

**Testes:** `tests/unit/shared/components/status-badge.component.test.tsx`.

**Visual:** neutro — estilos base/dark no module shared; overrides light (`.cargoCard .statusBadge`, `.cargoSheetHeader .statusBadge`) e portal `body:has` mantidos no lab SCSS.

**Próximo passo (PR-6):** concluído — ver §21.

---

## 21. PR-6 — `FilterChip` shared e migração `/dev-v2`

**Componente:** `src/shared/components/filter-chip/FilterChip.tsx` (+ `FilterChip.module.scss`, `index.ts`).

**API:**

| Prop | Tipo | Notas |
| --- | --- | --- |
| `children` | `ReactNode` | label do chip |
| `isSelected` | `boolean` | `data-active="true"` |
| `disabled` | `boolean` | bloqueia interação |
| `onClick` | — | handler de seleção |
| `ariaPressed` | `boolean` | toggle explícito (origem/destino) |
| `className`, `type` | — | repassa ao `<button>` |

**Comportamento:** Bubble Press (`pressableBubble`, 160ms), `pointer capture`, `focus-visible` via `--v2-focus-ring`, `aria-pressed` quando selecionado.

**Usos migrados:** 7 grupos no filter bottom sheet (`FiltersSheet`) — status, origem, destino, tipo de carga, embarcação, cutoff, capacidade (~40 chips via mocks).

**Não migrados:** chips no header/lista (inexistentes no lab v2), `sheetChipGrid` (sem uso em TSX), `StatusBadge`, CTAs do footer, `filterSelect`, catálogo ausente.

**Testes:** `tests/unit/shared/components/filter-chip.component.test.tsx`.

**Visual:** neutro — estilos dark no module shared; overrides light em `.filterChipGrid .filterChip` + portal `body:has` no lab SCSS.

**Próximo passo (PR-7):** concluído — ver §22.

---

## 22. PR-7 — `Button`, `SearchField`, `BottomNav` (shared)

### Button — `src/shared/components/button/`

| Prop | Notas |
| --- | --- |
| `children`, `variant` (`primary` \| `secondary` \| …), `size`, `iconLeft`, `iconRight` | |
| `isLoading`, `disabled`, `fullWidth`, `className`, `onClick` | `data-primary` em `primary`; ícones mask em `secondary`/`primary` via SCSS |

**Migrado:** footer do filter sheet — `Limpar filtros` (`secondary`), `Ver cargas` (`primary`), com press delay 160ms preservado.

**Não migrado:** `cardAction` (span decorativo no card), `sheetActionList`, `moreCargoActions`, `sheetFooterActions`.

### SearchField — `src/shared/components/search-field/`

| Prop | Notas |
| --- | --- |
| `value`, `onChange(value)`, `placeholder`, `icon`, `rightSlot`, `disabled`, `ariaLabel` | label + input `type="search"` |

**Migrado:** barra de busca principal (`searchRow` + `IconButton` filtro ao lado, layout externo).

### BottomNav — `src/shared/components/bottom-nav/`

| Prop | Notas |
| --- | --- |
| `items`, `activeId`, `onItemSelect`, `classNames` (lab skins), `ariaLabel` | bubble ativo preservado via classes do lab |

**Migrado:** nav fixa do lab (5 itens, `activeId="cargo"`, mock local sem roteamento).

**Testes:** `button.component.test.tsx`, `search-field.component.test.tsx`, `bottom-nav.component.test.tsx`.

**Visual:** neutro — estilos base nos modules shared; overrides light/portal e shell `.bottomNav` / `.navItem` / `.activeNavBubble` no lab SCSS.

**Próximo passo (PR-8):** concluído — ver §23.

---

## 23. PR-8 — componentes de domínio cargo (`/dev-v2`)

Extração feature-owned a partir de `mobile-cargo-list-lab-v2`, sem mudança visual intencional em `/pt-BR/dev-v2`.

### Componentes extraídos (`src/features/cargo/components/`)

| Componente | Path | Responsabilidade |
| --- | --- | --- |
| `CargoCard` | `cargo-card/` | Card clicável: tile, código, `StatusBadge`, título, rota, ETA, CTA decorativo |
| `CargoRouteLine` | `cargo-route-line/` | Rota card (pontos + tracejado + barco) e variant sheet (`sheetRouteBox`) |
| `CargoEtaBlock` | `cargo-eta-block/` | Métrica ETA no card; grid ETA + entrega no detail sheet |
| `CargoFilterSheetContent` | `cargo-filter-sheet-content/` | Corpo do filter sheet + `CargoFilterSheetFooter` (160ms) |
| `CargoDetailSheetContent` | `cargo-detail-sheet-content/` | Corpo do cargo detail sheet (header, rota, stats, seções, ações) |
| `CargoLabV2StatusBadge` | `cargo-lab-v2/` | Wrapper `StatusBadge` + mapa de status do lab |
| Ícones lab | `cargo-lab-v2/cargo-lab-v2-icons.tsx` | SVGs usados por cards/sheets |

**Tipos e mocks:** `src/features/cargo/types/cargo-lab-v2.types.ts`, `src/features/cargo/data/cargo-lab-v2.mock.ts` (determinísticos, dev-only).

### Permanece em `shared/`

`BottomSheet` (shell), `Button`, `IconButton`, `SearchField`, `FilterChip`, `StatusBadge`, `BottomNav`, tokens `--hy-*` / aliases `--v2-*`, helpers `pressable`.

### Permanece no lab (`mobile-list-lab-v2`)

Shell da página (`root`, `phoneShell`, header, busca, lista grid, bottom nav), estilos dos wrappers `filterBottomSheet` / `cargoBottomSheet`, portal light `body:has([data-theme='light'])` para tokens e chrome dos sheets, lógica de filtro (`matchesStatusFilter`, etc.), ícones de header/nav, toggle de tema.

### Usos migrados no `/dev-v2`

| Antes (inline no lab) | Depois |
| --- | --- |
| `CargoCard` | `<CargoCard onClick={openCargoSheet} />` |
| `FiltersSheet` | `<CargoFilterSheetContent … />` |
| `FilterSheetActions` | `<CargoFilterSheetFooter … />` |
| `CargoSheet` | `<CargoDetailSheetContent cargo={…} />` |

### Não migrados (motivo)

| Item | Motivo |
| --- | --- |
| `cardAction` como `<span>` | CTA visual dentro do card; não é botão isolado (evita nested buttons) |
| `sheetFooterActions`, `sheetChipGrid`, `metricTile` | Sem uso no TSX atual do lab v2 |
| Regras de filtro / contagem | Permanecem no orquestrador do lab |
| `/cargas`, `/minhas-cargas` | Fora de escopo desta rodada (PR-8) |

### Testes

`tests/unit/features/cargo/cargo-*.component.test.tsx` + ajustes em `mobile-cargo-list-lab-v2.test.tsx`.

### Próximos passos recomendados

1. ~~Aplicar componentes/tokens na `/cargas` pública mobile.~~ — ver §24.
2. Depois aplicar em `/minhas-cargas` privada.
3. Reforçar testes do fluxo embarcador mobile.

---

## 24. PR-9 — `/cargas` pública mobile (DS v2)

Aplicação do visual e componentes extraídos do `/dev-v2` na lista pública mobile (`≤860px`), sem alterar desktop, `/minhas-cargas`, `/dev-v2` nem regras de negócio de filtro.

### Arquivos principais

| Área | Path |
| --- | --- |
| Lista mobile | `src/features/cargo/components/public-cargas-mobile/` |
| Mapper marketplace → lab v2 | `src/features/cargo/utils/map-marketplace-cargo-to-lab-v2.ts` |
| ETA helper | `src/features/cargo/utils/parse-cargo-eta-meta.ts` |
| Shell light tokens | `src/features/cargo/styles/_cargo-v2-light-shell.scss` |
| Integração rota | `operations-board.tsx` (`mobileExperience="public-cargas"` opt-in em `/cargas`; default preserva `/rastreio`) |
| Bridge ações | `cargo-action-sheet-bridge.tsx` (`article[data-cargo-id]`) |

### Componentes reutilizados

`CargoCard`, `CargoRouteLine`, `CargoEtaBlock`, `CargoLabV2StatusBadge`, `CargoFilterSheetFooter`, `SearchField`, `IconButton`, `FilterChip`, `Button`, `BottomSheet`.

### Escopo de rota (correção PR-9)

- `OperationsBoard` expõe `mobileExperience?: 'public-cargas' | 'default'` (default).
- `/[locale]/cargas` passa `mobileExperience="public-cargas"` → `PublicCargasMobileList` só em viewport mobile.
- `/[locale]/rastreio` não passa a prop → timeline/fluxo mobile anterior preservado.
- Testes: `tests/unit/features/dashboard/operations-board-mobile-experience.test.ts`, `cargoes-page.test.tsx`.

### Light-first (mobile DS v2)

- `/cargas` mobile e `/dev-v2` não dependem do tema global (`html[data-theme]`) para a primeira pintura dos cards.
- `PublicCargasMobileList` fixa `data-theme="light"` no SSR e aplica `cargo-v2-light-shell` no root do módulo.
- `MobileCargoListLabV2` inicia em `light` (`useState('light')`).
- Cards e satélites DS v2 usam `:global(.root[data-theme='light'])`; o root expõe a classe global `root` via `cargoDsV2ThemeRootClassName` (`src/features/cargo/constants/cargo-ds-v2-theme-scope.ts`).
- `ThemeToggle` deriva o ícone diretamente de `useTheme()` no SSR (sem `useSyncExternalStore`), evitando hydration mismatch; dark mode global permanece no `ThemeProvider` / cookie.

### Patch light-first — filter sheet e icon buttons (PR-9 visual)

**Causa filter sheet escuro:** `BottomSheet` portaled em `document.body` usa fallback `--hx-card` / `--hx-card-2` escuros quando o painel não define bridge light; estilos locais de superfície não bastavam sem `--hx-*` + tokens `--v2-*` em `body:has([data-theme='light'])`.

**Causa icon buttons escuros:** `IconButton` shared aplica superfície dark por padrão; faltavam overrides `.root[data-theme='light']` em `public-cargas-mobile-list.module.scss` (padrão já existente no lab `/dev-v2`).

**Correção aplicada:**

| Área | Mudança |
| --- | --- |
| `_cargo-v2-light-shell.scss` | Mixins `cargo-v2-light-portal-tokens`, `cargo-v2-light-filter-sheet-hx-bridge`, `cargo-v2-light-icon-button-surfaces`, chips e `cargo-v2-light-filter-bottom-sheet` |
| `public-cargas-mobile-list.module.scss` | Overrides light para `.headerButton`, `.filterSquare`, `.filterBottomSheet`, chips; `body:has([data-theme='light'])` com tokens completos |
| `public-cargas-mobile-filter-sheet.tsx` | Classe global `root` no painel + `data-theme="light"` no sheet portaled (client) |

**Pendências intencionais (próxima rodada):**

- Bottom nav: refinamento visual light-first pendente.
- Cargo detail sheet: bridge antigo (`CargoActionSheetBridge`) ainda abre no card; substituição/refino DS v2 depois.
- Filtros horizontais (status scroller) e botão “Limpar todos”: avaliar remoção/ajuste em rodada própria.
- Chrome externo do dashboard (shell/layout fora da lista): rodada dedicada.

### Fluxo preservado

- Filtros e busca: mesma lógica do `OperationsBoard` (não mocks do lab).
- Detalhe: `CargoActionSheetBridge` (não `CargoDetailSheetContent`).
- Dados sensíveis: sem telefone/valor no card público; CTA apenas visual.

### i18n novo

`operationsBoard.list.cardActionView`, `operationsBoard.list.cardActionTrack` (pt-BR, en-US, es).

---

## 17. Resultado das validações

### Auditoria (2026-06-02)

| Comando | Resultado |
| --- | --- |
| `npm run lint` | OK |
| `npm run typecheck` | OK |
| `npm run check:i18n` | OK — 1971 keys |
| `npm run build` | OK |

### PR-1 (2026-06-02)

| Comando | Resultado |
| --- | --- |
| `npm run lint` | OK |
| `npm run typecheck` | OK (após limpar `.next` obsoleto com rota `design-system` removida) |
| `npm run check:i18n` | OK — 1971 keys |
| `npm run build` | OK — rota `/dev-v2` inalterada; sem `/dev-v2/design-system` no bundle |

### PR-2 (2026-06-02)

| Comando | Resultado |
| --- | --- |
| `npm run lint` | OK |
| `npm run typecheck` | OK |
| `npm run check:i18n` | OK — 1971 keys |
| `npm run build` | OK |
| `npm run dev` | OK — preview em `http://localhost:3000/pt-BR/dev-v2` (toggle light) |

### PR-3 (2026-06-02)

| Comando | Resultado |
| --- | --- |
| `npm run lint` | OK |
| `npm run typecheck` | OK |
| `npm run check:i18n` | OK — 1971 keys |
| `npm run build` | OK |

### PR-4 (2026-06-02)

| Comando | Resultado |
| --- | --- |
| `npm run lint` | OK |
| `npm run typecheck` | OK |
| `npm run check:i18n` | OK — 1971 keys |
| `npm run build` | OK |
| `npm test` (icon-button + bottom-sheet) | OK — 9 testes |

### PR-5 (2026-06-02)

| Comando | Resultado |
| --- | --- |
| `npm run lint` | OK |
| `npm run typecheck` | OK |
| `npm run check:i18n` | OK — 1971 keys |
| `npm run build` | OK |
| `npm test` (status-badge) | OK — 5 testes |

### PR-6 (2026-06-02)

| Comando | Resultado |
| --- | --- |
| `npm run lint` | OK |
| `npm run typecheck` | OK |
| `npm run check:i18n` | OK — 1971 keys |
| `npm run build` | OK |
| `npm test` (filter-chip) | OK — 5 testes |

### PR-7 (2026-06-02)

| Comando | Resultado |
| --- | --- |
| `npm run lint` | OK |
| `npm run typecheck` | OK |
| `npm run check:i18n` | OK — 1971 keys |
| `npm run build` | OK |
| `npm test` (button, search-field, bottom-nav) | OK — 15 testes |

---

## Apêndice A — Mapeamento `--v2-*` → `--hy-*` (light)

| `--v2-*` | `--hy-*` proposto |
| --- | --- |
| `--v2-bg-top` | `--hy-color-background-app` |
| `--v2-bg-mid` | `--hy-color-background-mid` |
| `--v2-bg-bottom` | `--hy-color-background-bottom` |
| `--v2-text` | `--hy-color-text-primary` |
| `--v2-title` | `--hy-color-text-title` |
| `--v2-muted` | `--hy-color-text-secondary` |
| `--v2-soft` | `--hy-color-text-muted` |
| `--v2-blue` | `--hy-color-brand` |
| `--v2-blue-strong` | `--hy-color-brand-strong` |
| `--v2-green` | `--hy-color-success` |
| `--v2-yellow` | `--hy-color-warning` |
| `--v2-glass` | `--hy-color-glass-surface` |
| `--v2-border` | `--hy-color-border-subtle` (PR-2: **não** aliasado — alpha 0.12 vs 0.1) |
| `--v2-border-strong` | `--hy-color-border-strong` |
| `--v2-card-shadow` | `--hy-shadow-card-soft` (PR-2: **não** aliasado — 28px/74px vs 26px/72px) |
| `--v2-font-family` | `--hy-font-family-base` |

## Apêndice B — Bridge sheet `--hx-*` (light, no lab)

| `--hx-*` (filter/cargo light) | Origem visual |
| --- | --- |
| `--hx-card` | `rgba(241, 245, 249, 0.86–0.88)` |
| `--hx-card-2` | `rgba(226, 234, 246, 0.78)` |
| `--hx-line-soft` | `rgba(15, 23, 42, 0.1)` |
| `--hx-text` | `#0f172a` |
| `--hx-muted` | `rgba(71, 85, 105, 0.7)` |
| `--hx-cyan` | `#2563eb` (accent; nome legado) |

Proposta: gerar a partir de `hy-*` em `cargo-sheet-theme.scss` da feature para não duplicar hex.
