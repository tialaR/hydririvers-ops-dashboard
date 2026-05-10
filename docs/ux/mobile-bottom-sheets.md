# Mobile Bottom Sheets

## Goal
Use one stable bottom sheet component for notifications, search, filters, menu actions, and map overlays.

## Rules
- The sheet is fixed to the viewport.
- The body scroll is locked while the sheet is open.
- The sheet uses a dark overlay with light blur.
- The sheet traps focus and closes with Escape.
- Overlay click closes only when enabled.
- Internal content scrolls inside the sheet, never behind it.
- Safe-area spacing must be respected.

## Supported heights
- `auto`
- `60vh`
- `75vh`
- `90vh`
- `fullscreen`

## Accessibility
- `role="dialog"`
- `aria-modal="true"`
- visible close button
- restored focus on close

## Notes
- Prefer one shared implementation instead of feature-specific overlays.
- Use sticky headers/footers inside the sheet when content is long.
