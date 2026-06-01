# Mobile Cargo Round 19 — Filter Context Menu Hotfix

Fixes targeted regressions from the filter launcher menu:

- contextual filter actions now render as real clickable menu controls, not inert rows;
- `Visualizar filtros` closes the menu and opens the filter bottom sheet;
- `Limpar filtros` clears active filters and closes the menu;
- menu visibility was strengthened as one glass block;
- bottom sheet backdrop now closes on click without triggering card clicks behind it.

Scope intentionally stays narrow: filter icon/menu behavior and sheet backdrop event handling.
