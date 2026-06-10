# Hydri Mobile UI Standards

## Principles

- Mobile is not squeezed desktop.
- Mobile and desktop must stay separated in architecture.
- Preserve visual consistency without shared fragile conditional JSX.
- Light mode is priority now; dark mode later.

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
