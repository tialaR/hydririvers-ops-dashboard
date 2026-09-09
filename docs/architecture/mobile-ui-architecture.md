# Arquitetura: UI Mobile (Bottom Nav, Safe Area, Z-Index e BottomSheet)

Data: 2026-05-11

## 1. Objetivo

Padronizar a experiência mobile sem redesign amplo de desktop, garantindo:

- conteúdo não fica atrás da bottom navigation;
- safe-area respeitada;
- z-index consistente (header, bottom nav, popovers, dropdowns, sheets);
- BottomSheets e filtros previsíveis (scroll interno, lock de body, ações visíveis).

## 2. Componentes e tokens (fonte de verdade)

Implementado (quando existir no repositório):

- Z-index/tokens: `src/shared/constants/z-index.ts`
- BottomSheet: `src/shared/components/bottom-sheet/*` e/ou `src/shared/ui/bottom-sheet/*`
- Shell/layout: `src/shared/layout/*`

## 3. Regras de layout mobile

Regras:

- Páginas com bottom nav precisam de `padding-bottom` suficiente (incluindo safe-area).
- Cards e listas precisam de “respiro” no fim do scroll para não ficarem cobertos.
- Floating actions devem respeitar bottom nav e não cobrir ação primária.
- Headers (título + badge + ação) devem usar `flex-wrap` e `min-width: 0` para evitar quebra “palavra por linha”.

## 4. BottomSheet: comportamento esperado

Requisitos mínimos:

- `role="dialog"` / `aria-modal` quando aplicável;
- botão de fechar com `aria-label`;
- scroll interno no conteúdo;
- lock do scroll de body ao abrir;
- footer de ações acima da bottom nav (com safe-area).

Drag/snap:

- se implementado, documentar estados e snap points;
- se não implementado, não “fingir drag”: oferecer comportamento controlado e estável.

## 5. Dropdown/select dentro de BottomSheet

Risco comum:

- dropdown atravessa camadas por z-index/portal.

Diretrizes:

- preferir dropdown que respeite tokens de z-index;
- quando necessário, usar alternativa mobile (lista inline no sheet, modal interno ou select nativo).

## 6. Testes recomendados

- BottomSheet abre/fecha e mantém acessibilidade mínima.
- Ações do footer continuam clicáveis (não ficam atrás da bottom nav).
- Não há overflow horizontal em estruturas testáveis.

## 7. Referências

- `docs/product/mobile-layout-guidelines.md`
- `docs/automation/mobile-ui-quality-workflow.md`

