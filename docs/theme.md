# Theme

## Tokens

- `--hx-bg`
- `--hx-card`
- `--hx-text`
- `--hx-muted`
- `--hx-line`
- `--hx-primary`
- `--hx-cyan`
- `--hx-green`
- `--hx-yellow`
- `--hx-red`

## Component tokens (escopo local)

Alguns componentes mobile mantêm tokens próprios até convergência com DS v2:

- **BottomNav light (preview global):** `--bn-*` em `src/shared/components/bottom-nav/bottom-nav-light-tokens.sass` — ver [bottom-nav-light.md](./design/bottom-nav-light.md).
- **IconButton / glass controls (padrão oficial):** `--hy-icon-button-*` — ver `docs/agents/AGENTS-UI-MOBILE-STANDARDS.md` → **IconButton and glass controls**. Tokens sugeridos: `size`, `icon-size`, `radius`, `glass-background`, `glass-border`, `glass-blur`, `glass-saturate`, `shadow`, `press-scale`, `icon-press-y`, `icon-press-scale`, `glow-size`, `glow-opacity`, `motion-press-duration`, `motion-release-duration`.

## Regras

- **Padrão inicial (sem cookie):** light — ver `resolveServerTheme` e layout `[locale]`.
- Dark mode permanece disponível via toggle; preferência salva em cookie/localStorage.
- Light mode precisa continuar legível.
- Não usar cores fixas fora dos tokens quando houver alternativa.
- Não usar `prefers-color-scheme` como fallback do tema da aplicação.

