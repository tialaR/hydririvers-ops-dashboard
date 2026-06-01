# Mobile Cargo Round 20 — Filter Menu Clear Fix

Scope intentionally stays narrow:

- keep the filter icon contextual menu as a single glass block;
- make the glass block less transparent so the content behind is no longer clearly readable;
- make `Limpar filtros` execute the same canonical reset used elsewhere in the list;
- reset search, status, advanced filters, selected sheet/cargo, dock state and active menu;
- use pointer-down handling on menu actions so touch interactions cannot be swallowed by the menu closing lifecycle.

Expected behavior:

1. With no active filters, tapping the filter icon opens the filter bottom sheet directly.
2. With active filters, tapping the filter icon opens the contextual glass menu.
3. `Visualizar filtros` opens the filter bottom sheet.
4. `Limpar filtros` clears every filter and returns the full cargo list.
