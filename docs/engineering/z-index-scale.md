# Z-Index Scale

## Standard scale
- `base`: 0
- `sticky`: 10
- `header`: 30
- `bottomNav`: 40
- `floatingAction`: 45
- `overlay`: 80
- `bottomSheet`: 90
- `modal`: 100
- `toast`: 110

## Rules
- Use the shared scale everywhere.
- Never invent ad-hoc z-index values in feature CSS.
- Bottom sheets must sit above bottom navigation.
- Modals must sit above sheets.
- Toasts must stay above overlays without blocking essential interactions.

## Why this matters
The app has map layers, notifications, menus, filters, and mobile sheets. A shared scale avoids hidden overlays and keeps interaction predictable.
