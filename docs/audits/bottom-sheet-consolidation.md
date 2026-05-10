# Consolidação de BottomSheet — HydroRivers

## Implementação canônica

- Componente canônico: `src/shared/components/bottom-sheet/BottomSheet.tsx`
- Hook canônico de scroll lock: `src/shared/hooks/use-lock-body-scroll.ts`

### O que a base canônica já cobre

- portal em `document.body`
- fechamento por `Escape`
- fechamento por clique no backdrop quando `closeOnOverlayClick` está habilitado
- `role="dialog"`
- `aria-modal="true"`
- foco inicial seguro e retorno de foco
- restauração de scroll ao fechar
- safe-area mobile
- `z-index` acima de mapa, sidebar e bottom nav

## Arquivos migrados

- `src/features/cargo-market/components/cargo-list/cargo-list.tsx`
  - lock manual de body/html substituído por `useLockBodyScroll(sheetVisible)`
- `src/shared/layout/app-header/app-header.tsx`
  - lock manual de body/html substituído por `useLockBodyScroll(sheetVisible)`

## Arquivos legados mantidos

- `src/shared/ui/bottom-sheet/bottom-sheet.tsx`
  - mantido como shim seguro para compatibilidade
- `src/shared/ui/bottom-sheet/index.ts`
  - mantido para exportes legados
- `src/shared/hooks/useLockBodyScroll.ts`
  - mantido como re-export do hook canônico

## Arquivos removidos

- Nenhum arquivo legado foi removido nesta etapa.

## Riscos

- Ainda existem caminhos legados de import/export por compatibilidade, mas agora todos apontam para a implementação canônica.
- O `cargo-list` e o `app-header` continuam com sheets próprios, porém o bloqueio de scroll já foi padronizado no hook comum.
- A remoção completa dos shims deve ser feita só depois de provar que não existem imports restantes.

## Comandos executados

- `rg -n "BottomSheet|useLockBodyScroll|use-lock-body-scroll|useLockBodyScroll" src tests docs -g '!**/*.map'`
- `sed -n '1,220p' src/shared/components/bottom-sheet/BottomSheet.tsx`
- `sed -n '1,120p' src/shared/ui/bottom-sheet/bottom-sheet.tsx`
- `sed -n '1,160p' src/shared/hooks/use-lock-body-scroll.ts`
- `sed -n '1,80p' src/shared/hooks/useLockBodyScroll.ts`
- `rg -n "document\\.body\\.style\\.position = 'fixed'|document\\.documentElement\\.style\\.overflow = 'hidden'|body\\.style\\.touchAction = 'none'|window\\.scrollTo\\(0, lockedScrollYRef\\.current\\)" src/shared src/features src/app -g '!**/*.map'`
- `sed -n '220,560p' src/features/cargo-market/components/cargo-list/cargo-list.tsx`
- `sed -n '240,520p' src/shared/layout/app-header/app-header.tsx`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`

## Resultados

- `typecheck`: passou.
- `lint`: passou.
- `test`: passou, `32` arquivos e `207` testes.
- `build`: travou em `Creating an optimized production build ...`.
  - Evidência: o processo `node /Users/tialarocha/Desktop/hydrorivers-dashboard-v27-sidebar-controls/node_modules/.bin/next build` permaneceu nessa etapa.
  - PID identificado: `67031`.
  - O processo foi encerrado manualmente para liberar o workspace.

## Observação final

A base está consolidada o suficiente para a maioria dos overlays móveis consumir o mesmo bloqueio de scroll e o mesmo sheet canônico. A próxima etapa segura, se o time quiser seguir reduzindo dívida, é migrar progressivamente os overlays específicos para o `BottomSheet` central quando isso não alterar comportamento nem acessibilidade.
