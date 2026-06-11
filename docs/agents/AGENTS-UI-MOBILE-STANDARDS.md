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

## Styling

- Prefer component-level CSS Modules.
- For touched/created styles, prefer `.module.sass` when possible.
- Avoid broad global CSS.
- Avoid `!important`.
- Avoid nondeterministic render values.

## BottomNav

- Global mobile component.
- Active item follows route.
- Lens movement is behavior, not static styling.
- Do not let old skins control new component.
