# Hydri Mobile UI Standards

Mobile-first chrome and interaction standards. **Architecture rules below apply to all UI surfaces** (mobile and desktop) unless a task is explicitly desktop-only layout with no shared component patterns.

**Router:** Any UI task must read this doc via [UI tasks auto-routing](AGENTS-TASK-ROUTER.md#ui-tasks-mandatory-auto-routing). If you are implementing UI and have not read this file, stop and fix routing first.

**Cursor rule:** `.cursor/rules/hydri-ui-architecture.mdc` — dumb components, hooks, data separation, kebab-case.

## Principles

- Mobile is not squeezed desktop.
- Mobile and desktop must stay separated in architecture.
- Preserve visual consistency without shared fragile conditional JSX.
- Light mode is priority now; dark mode later.

## UI architecture

- **Dumb / semantic components** — JSX presents structure and styles; avoid embedding business logic, measurement, or side effects in the component when a hook can own them.
- **Hooks and helpers in scope** — movement, measurement, timers, resize, derived state, and effects live in a hook or helper next to the component (e.g. `use-bottom-nav-indicator.ts` beside `bottom-nav.tsx`).
- **Data in separate files** — nav items, labels, descriptions, icons, and metadata move to a dedicated file in the same feature/component folder when they exceed trivial inline literals (e.g. `bottom-nav-items.tsx`).
- **No global CSS for components** — feature and component styles stay in CSS/Sass Modules; do not use `src/app/globals.scss` for feature UI.
- **Refs and CSS variables first** — prefer React refs and scoped CSS variables over `querySelector` or `document.documentElement` tweaks.
- **Accessibility** — preserve landmarks, labels, focus order, keyboard support, and meaningful semantics after refactors.

## File and folder naming

- **New** paths: **kebab-case** (`bottom-nav/`, `filter-sheet.tsx`, `use-filter-sheet.ts`).
- **Touched** paths: rename to kebab-case only when **small and safe** (few imports, no route or i18n breakage).
- **No mass renames** without explicit user approval.
- **React component names** may remain **PascalCase** in code (`export function BottomNav`) even when the file is `bottom-nav.tsx`.

## Interaction

Use subtle bubble press feedback:
- scale slightly while pressed;
- return smoothly;
- do not permanently alter visual style.

Apply to:
- icon buttons;
- buttons;
- chips;
- search focus;
- bottom-sheet close icons;
- clickable cards.

## Design tokens (`--hy-*`)

- **New UI tokens** must use the `--hy-*` prefix.
- **Component tokens** follow `--hy-<component>-<property>` (examples: `--hy-bottom-nav-height`, `--hy-bottom-nav-glass-background`, `--hy-bottom-nav-motion-icon-jump-duration`).
- **Legacy tokens** outside this pattern (e.g. BottomNav `--bn-*`) stay until a **separate, safe migration** — rename progressively when touching related code, not in bulk drive-by refactors.
- **BottomNav target namespace:** `--hy-bottom-nav-*` when those tokens are migrated.

## Styling

- Prefer component-level CSS Modules.
- For touched/created styles, prefer `.module.sass` when possible.
- Avoid broad global CSS.
- Avoid `!important`.
- Avoid nondeterministic render values.

## BottomNav

- Global mobile component (`src/shared/components/bottom-nav/`).
- Active item follows **confirmed route** only; pending never moves the lens.
- Lens movement is behavior (`useBottomNavIndicator`), not static styling.
- Light mode tokens: `--bn-*` mixin in `bottom-nav-light-tokens.sass` — see `docs/design/bottom-nav-light.md`.
- Icon jump fires when route becomes active (not on pointer down); press uses separate scale feedback.
- Do not let old skins / `classNames` legados control the preview global component.

## Mobile viewport coverage (mandatory for UI work)

Any task classified with a UI category (`mobile-ui`, `bottom-nav`, `bottom-menu`, `bottom-sheet`, `filter-sheet`, `action-sheet`, `styling`, `visual-regression`, or `accessibility` when it touches visible interface) **must** validate layout on **at least three mobile widths** before claiming success.

### Required viewports

| Tier | Size | Typical device |
|------|------|----------------|
| **Small mobile** | 320×568 or 360×740 | iPhone SE, compact Android |
| **Standard mobile** | 390×844 | iPhone 14 / 15 |
| **Large mobile** | 430×932 | iPhone 14 Pro Max, large Android |

Use one size per tier. Record which size was used in `HYDRI_IMPLEMENTATION_PROOF` → **Mobile viewport coverage**.

### What to check (nav, sheets, cards, chips, search, controls)

On **each** viewport, confirm:

- text does not break awkwardly or overflow without intent;
- labels do not overlap or invade adjacent items;
- icons stay aligned with labels and hit targets;
- pills, indicators, and active lenses stay inside their container;
- content behind or beside overlays remains visible when expected;
- the last item or card is not covered by BottomNav, sheets, or safe-area insets;
- safe-area padding still works (`env(safe-area-inset-*)`);
- the primary animation or transition is perceptible (e.g. lens slide, sheet open).

### Width-dependent behavior

When a component **changes layout or density by width**, declare in proof and Captain closeout:

- **Small mobile** — what shrinks, truncates, stacks, or hides;
- **Standard mobile** — baseline behavior;
- **Large mobile** — what expands, gains spacing, or shows more content.

### Evidence

- Prefer Playwright or browser devtools at each width.
- When screenshots are taken, save or cite one per viewport (e.g. `output/playwright/<feature>-390x844.png`).
- Do **not** claim 🟢 **Pode seguir** on mobile UI if only one width was tested — use 🟡 **Segue com cuidado** and document missing widths in **Falta provar**.

### Captain closeout phrasing (human)

| Coverage | Prova simples |
|----------|---------------|
| All three tiers tested | "Testado em celular pequeno, médio e grande." |
| One width only | "Só testado em um tamanho, precisa revisar responsividade." |
| Two widths | "Testado em dois tamanhos; falta conferir o terceiro." |

Default preview route: `http://localhost:3000/pt-BR/cargas` (adjust per task).
