# Mobile Cargo Round 21 — Filter Menu Operational Fix

## Objetivo
Resolver o bug operacional do menu contextual do filtro:

- abrir sheet ao tocar em `Visualizar filtros`;
- limpar filtros ao tocar em `Limpar filtros`;
- evitar que o click fora do sheet acione conteúdo por trás;
- tornar o menu mais fosco e legível.

## Alterações

- `MobileCargoFilterButton`: handlers de menu reforçados com `pointerdown`, `mousedown` e `click` protegidos.
- `handleClearFiltersFromLauncher`: reset direto de todos os estados de filtro.
- `LiquidGlassSheet`: overlay fecha no `pointerdown`, consumindo o gesto antes do click vazar.
- SCSS: blur/opacidade do menu contextual aumentados.
