# Header responsivo — implementação (audit)

## Problema observado

O header global do shell administrativo comprimia o bloco de título à esquerda em rotas com títulos longos; o subtítulo podia ser cortado por **`max-height`** fixo no topbar e **`line-clamp`** no `h1`; o bullet verde perdia alinhamento em quebras; a barra de busca ocupava largura excessiva; o estado **glass** ao rolar podia não aparecer se apenas **`window`** rolasse (o scroll real costuma ser **`.hr-dashboard-content-root`**).

## O que foi alterado

- **`src/shared/layout/admin-chrome/admin-chrome.tsx`**
  - **`shellRef`** na `.hx-shell` + **`ResizeObserver`** no topbar desktop: grava **`--hr-topbar-height`** no shell (mín. 72px), removendo a propriedade quando o topbar está **`display: none`** (mobile).
  - **`dashboardTopbarRef`** no `<header className="hx-topbar hr-topbar">`.
  - **`isDashboardHeaderScrolled`**: `scrollTop > 8` em **`.hr-dashboard-content-root`** **ou** **`window.scrollY > 8`**, listeners passivos + cleanup.
  - Título em estrutura semântica: **`hx-title-block__kicker`** (rótulo + bullet **`nowrap`**) + **`hx-title-block__section`** (área, com quebra); subtítulo em **`hx-title-block__description`**.
  - Wrapper **`hx-profile-text`** (inalterado nesta iteração).

- **`src/app/globals.scss`**
  - Shell dashboard: **`grid-template-rows: auto minmax(0, 1fr)`** — a primeira linha cresce com o conteúdo do header.
  - **`.hx-topbar.hr-topbar`**: **`height: auto`**, **`min-height: var(--hr-topbar-height, 90px)`**, **`max-height: none`** — elimina clipping vertical.
  - **`.hx-title-block`**: coluna flex, **`overflow: visible`**, **`gap`**, sem clamp no título inteiro.
  - **`.hx-top-search`**: **`max-width: clamp(200px, 28vw, 360px)`**; grid do topbar com a mesma coluna central.
  - **`.hx-topbar.hr-topbar.hx-topbar--scrolled`**: blur/transparência/sombra (inalterado em espírito).

## Regra de largura da busca

- **`clamp(200px, 28vw, 360px)`** na coluna central do grid e na busca, com **`min-width: 200px`**.

## Regra de padding e respiro

- Padding inferior do topbar reforçado (`~0.82–0.85rem`); bloco esquerdo com padding vertical leve e **`gap`** entre título e subtítulo.

## Comportamento de blur ao rolar

- Scroll do **slot de conteúdo** e da **janela** (ambos > 8px) ativam **`hx-topbar--scrolled`**.
- **`--hr-topbar-height`** medido no cliente mantém **`calc(100dvh - var(--hr-topbar-height) - …)`** alinhado à altura real do header quando o título ocupa duas linhas.

## Hover / focus

- Mantidos: elevação leve com **`prefers-reduced-motion`**, **`focus-visible`**, hover em busca/perfil/sino/pill.

## Mobile

- Topbar desktop oculto por CSS; **`ResizeObserver`** não força variável quando **`display: none`**.

## Testes

- `tests/unit/shared/layout/admin-chrome-header-structure.test.ts` — contrato de fonte (scroll duplo, RO, markup do título, grid `auto`, `clamp` na busca).

## Quality gates (executar no PR)

```bash
npm run typecheck
npm run lint
npm run check:i18n
npm test
npm run build
npm run test:mock-mode
```

## Pendências

- `*.test.tsx` fora do `include` padrão do Vitest até ajuste de config.
- Validação visual em rotas longas (ex.: Início / Minhas cargas) e breakpoints 1440 → 390.
- Tema claro: revisar contraste das misturas `color-mix` se necessário.
