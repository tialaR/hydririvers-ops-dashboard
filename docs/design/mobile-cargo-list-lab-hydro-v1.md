# Mobile Cargo List Lab — Hydro v1

Rota de avaliação visual/funcional da lista mobile de cargas com composição **dark mode first** (Hydro DS + liquid glass).

## Rota

- **URL:** `/{locale}/dev/mobile-cargo-list-lab` (ex.: `/pt-BR/dev/mobile-cargo-list-lab`)
- **Guard:** `isMobileCargoListLabRouteEnabled()` — fora de dev/flag retorna 404.

## Dev Lab Layout Isolation

O laboratório **não** usa `AdminChrome`, header global, título Dashboard nem bottom nav do produto.

| Camada | Arquivo | Papel |
|--------|---------|--------|
| Locale (providers) | `src/app/[locale]/layout.tsx` | `next-intl`, `ThemeProvider`, `HydroDesignSystemRoot` |
| Product shell | `src/app/[locale]/(product-shell)/layout.tsx` | `LocaleShell` → `AdminChrome` |
| Dev segment | `src/app/[locale]/dev/layout.tsx` | Container neutro full-viewport |
| Página lab | `src/app/[locale]/dev/mobile-cargo-list-lab/page.tsx` | Lista lab + view model mock |

**Fora de escopo desta rodada:** `/[locale]/cargas`, mapa Hydroway, desktop, `globals.scss`, pipeline de tokens gerados.

## Dark mode first (contrato local)

- Root da lab: `data-theme="dark"` + `data-hydro-theme="dark"` — **não** altera tema global.
- Canvas compõe `hydroSemanticTheme` e aliases `--mobile-cargo-list-*` com fallback para `--hydro-color-*`.
- Hierarquia: canvas escuro cinza/azulado → surfaces translúcidas → elevated (cards, sheet, dock) → accent com parcimônia.

### Tokens Hydro usados (semânticos)

| Token | Uso na lab |
|-------|------------|
| `--hydro-color-canvas` | Base do gradiente de fundo |
| `--hydro-color-surface` / `--hydro-color-surface-elevated` | Cards, search, chips |
| `--hydro-color-label-primary` / `secondary` / `tertiary` | Tipografia |
| `--hydro-color-separator` | Bordas e divisores |
| `--hydro-color-fill-primary` / `secondary` | Pills, chips inativos |
| `--hydro-color-accent` | Foco, badge filtros, item ativo dock |
| `--hydro-color-warning` | Alertas discretos nos cards |
| `--hydro-radius-*` | Pills, cards, sheet |
| `--hydro-motion-*` | Tap, control, sheet |

Aliases locais (módulo canvas): `--mobile-cargo-list-canvas-top|mid|bottom`, `--mobile-cargo-list-surface*`, `--mobile-cargo-list-label-*`, etc.

**Proibido** na lab: `--ios-*`, `--ds-*`, `--hx-*` (CSS), `--lab-*`.

## Composição v1.8 (HIG + funcional)

1. **Header large + compact glass** — título 34/40, subtítulo com total; botão circular de filtros (ícone + badge); header compacto translúcido ao rolar (`hidden`, não `aria-hidden`).
2. **Sem hero dashboard** — contexto só no subtítulo (`N operações hidroviárias`).
3. **Search glass** — pill 46px, filtro em tempo real (código, título, rota, status, operação), caret accent, limpar busca.
4. **Chips horizontais** — Todas / Abertas / Cotação / Operação / Atenção; scroll com padding final.
5. **Sheet de filtros** — header → botão filtros; Status, Atenção, Origem/Destino, limpar.
6. **Cards** — código, status pill, título (2 linhas), rota, ETA, warning discreto; sem `(mock)` / `ETA ETA`.
7. **Sheet de ações** — card → sheet; Visão geral → `/{locale}/cargas/{id}/mapa`; demais “Em breve”; drag expande visualmente para snap superior e escorrega para baixo no fechamento.
8. **Bottom dock** — `LiquidGlassBottomDock`: Cargas / Atenção / Mapa (**sem Filtros**); bolha deslizante; tint/glow contextual por item ativo; oculto com sheet aberto; Mapa `disabled` sem carga selecionada.

## Acessibilidade / foco

| Problema | Correção |
|----------|----------|
| `aria-hidden` com foco retido | `LiquidGlassSheet`: `inert` quando fechado. Header compacto: `hidden`. Lista: `inert` com sheet aberto. |
| Foco ao abrir sheet | `requestAnimationFrame` → botão close `[data-open="true"]`. |
| Foco ao fechar | Retorna ao card ou ao botão de filtros que abriu o sheet. |

## Sheet de filtros vs dock

| Controle | Função |
|----------|--------|
| Botão filtros (header) | Abre sheet avançado + badge de filtros ativos |
| Chips horizontais | Filtro rápido de status |
| Dock **Atenção** | Filtro atenção + scroll para chips |
| Dock **Cargas** | Limpa filtros + topo da lista |
| Dock **Mapa** | Navega se houver carga selecionada (card aberto antes); senão `disabled` |

## Arquivos principais

- `src/features/cargo/components/mobile-list-lab/mobile-cargo-list-lab.tsx`
- `src/features/cargo/components/mobile-list-lab/mobile-cargo-list-lab.module.scss`
- `src/shared/design-system/lab/mobile-cargo-list-lab-canvas/mobile-cargo-list-lab-canvas.module.scss`
- `src/shared/design-system/primitives/liquid-glass-bottom-dock/*`
- `docs/design/liquid-glass-bottom-dock.md`
- `docs/design/mobile-cargo-list-reference-analysis-2026-05-27.md`

## Pendências

- Smoke Playwright viewport 390×844.
- Validar manualmente drag/snap de ações e filtros em viewport real 390×844.
- Jornada / Documentos / Custos / Prioridade permanecem “Em breve”.
- Não promovido para `/cargas` real nesta rodada.
