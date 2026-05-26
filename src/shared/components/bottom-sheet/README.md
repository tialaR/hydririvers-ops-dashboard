# BottomSheet (mobile)

Casca oficial de BottomSheet para overlays mobile na HydroRivers.

## Origem

Comportamento e visual base vêm da experiência aprovada no mapa hidroviário (`MobileRouteSheet` → `BottomSheet` com `viewportAnchor="flush"`, variantes `strong` / `map`).

## Escopo

| Vai no shared | Fica na feature |
|---------------|-----------------|
| overlay, blur, safe area | resumo de rota, ETA, progresso |
| handle, drag, snap | vessel, sync, layers |
| header shell, botão fechar | timeline, ações de domínio |
| slide up/down, reduced motion | textos e mocks de negócio |
| scroll interno da casca | |

**Não** criar um segundo motor de sheet na feature. Compor conteúdo via `children` (e `footer` quando precisar de ações fixas no rodapé).

## Uso

```tsx
import { BottomSheet } from '@/shared/components/bottom-sheet';

<BottomSheet
  open={open}
  onOpenChange={setOpen}
  title="Título acessível"
  description="Subtítulo opcional"
  closeAriaLabel="Fechar"
  variant="strong"
  enableDrag
  closeOnOverlayClick
  snapPoints={['75vh']}
>
  {/* conteúdo da feature */}
</BottomSheet>
```

### Snaps nomeados (mapa / filtros)

```tsx
<BottomSheet
  viewportAnchor="flush"
  snapHeights={{ partial: '36dvh', expanded: '95dvh' }}
  snapOrder={['partial', 'expanded']}
  initialSnap="partial"
  variant="strong"
  overlayVariant="map"
  onSnapChange={(snapId) => { /* opcional */ }}
>
  {children}
</BottomSheet>
```

## Props principais

- `open`, `onOpenChange`, `onClose`
- `title`, `description`, `ariaLabel`, `closeAriaLabel`, `dragHandleAriaLabel`
- `children`, `footer`
- `snapPoints` | `snap` | `snapHeights` + `snapOrder` + `initialSnap`
- `enableDrag` / `enableSnapDrag`
- `closeOnOverlayClick`
- `variant`, `overlayVariant` (`default` | `strong` | `light` | `map` | `fullscreen`)
- `viewportAnchor` (`inset` | `flush`)
- `stackingZIndex` (ex.: mapa imersivo)
- `className`, `bodyClassName`

## Import

Preferir `@/shared/components/bottom-sheet`. O caminho `@/shared/ui` reexporta o mesmo componente (compatibilidade).

## Reduced motion

Estilos em `BottomSheet.module.scss` desativam transições quando `prefers-reduced-motion: reduce`.

## Testes

- Unitários: `tests/unit/shared/components/bottom-sheet.test.ts` (snap math)
- Mapa: `tests/e2e/hydroway-map-routes.spec.ts` (`bottom-sheet-panel`, handle, drag)

## Referências

- [ADR mobile bottom sheet and map pattern](../../docs/adr/ADR-mobile-bottom-sheet-and-map-pattern.md)
- [Consolidação (auditoria)](../../docs/audits/bottom-sheet-consolidation.md)
