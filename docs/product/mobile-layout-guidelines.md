# Diretrizes de Layout Mobile (Bottom Nav + Safe Area + BottomSheets)

Data: 2026-05-11

## Objetivo

Garantir que a experiencia mobile pareca intencional, legivel e consistente entre rotas, especialmente em telas com:

- bottom navigation;
- floating actions (ex.: mapa);
- filtros em BottomSheet;
- overlays/popovers/dropdowns.

## Regras base (aplicacao toda)

- **Sem conteudo atras da bottom nav**: sempre garantir `padding-bottom` apropriado (incluindo safe-area).
- **Safe area**: respeitar `env(safe-area-inset-bottom)` quando aplicavel.
- **Sem overflow horizontal** em 360px.
- **Headers responsivos** (titulo + badge + acao):
  - permitir `flex-wrap`;
  - usar `min-width: 0` em containers flex;
  - evitar quebra "palavra por linha".
- **Cards podem crescer verticalmente**; evitar esmagar conteudo em colunas estreitas.

## BottomSheet (filtros e overlays mobile)

Requisitos minimos:

- `role="dialog"` e atributos aria quando aplicavel;
- botao fechar com `aria-label`;
- scroll interno do conteudo (sem competir com scroll da pagina);
- lock do body scroll quando aberto;
- footer/acoes acima da bottom nav (com safe-area).

Drag/snap:

- se existir, documentar snap points e estados (fechado/peek/aberto/expandido);
- se nao existir, preferir comportamento controlado e estavel (nao simular drag).

## Z-index (camadas)

Regra: tokens centralizados (evitar numeros magicos espalhados).

Camadas tipicas:

- header
- bottom nav
- floating action
- backdrop
- bottom sheet
- dropdown/popover

## Checklist rapido por rota

- A acao primaria esta visivel e tocavel?
- O final do scroll tem respiro acima da bottom nav?
- Filtros abrem/fecham sem sobreposicao quebrada?
- Dropdown nao fica por tras do sheet/header?

## Referencias

- `docs/architecture/mobile-ui-architecture.md`
- `docs/automation/mobile-ui-quality-workflow.md`
- `docs/MOBILE-BOTTOM-SHEET-FIX.md` (historico/relato tecnico)

