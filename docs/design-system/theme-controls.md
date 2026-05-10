# Theme Controls

## Purpose
Global preferences for theme and language live in the sidebar footer and in the mobile "More options" sheet. This keeps the header clean and gives users a predictable place to change app-wide settings.

## Theme Switch
- Uses a compact icon-only control.
- Shows sun and moon only.
- No visible helper text in the UI.
- The active state is indicated by stronger contrast and a subtle aqua/teal accent.
- The control must stay `fit-content`, never stretch full width.
- It must expose an accessible label and pressed state.

## Language Accordion
- Shows the current language first, followed by the flag/brand and the chevron.
- Opens as an accordion, not a native select.
- Keeps the active language visible and marked with `aria-current`.
- The accordion must remain keyboard accessible and work in the collapsed sidebar and mobile sheet.

## Sidebar and Mobile Rules
- Desktop sidebar footer order: theme, language, logout.
- Collapsed sidebar: compact icon/flag only, with tooltips.
- Mobile sheet: same controls, stacked vertically, with touch targets of at least 44px.
- Keep content inside the sheet scrollable so the bottom navigation is never covered.

## Tokens
Use the existing design system tokens for:
- background / surface / elevated surface
- subtle and strong borders
- primary, secondary, and muted text
- aqua / teal accent
- warning, danger, and success tones

Avoid hardcoded colors unless they are already part of the approved token set.

## Accessibility
- Theme control must have a clear `aria-label`.
- Theme state must be announced with `aria-pressed`.
- Language accordion must use `aria-expanded` and keyboard navigation.
- Logout must remain a real button or link with a clear accessible name.
