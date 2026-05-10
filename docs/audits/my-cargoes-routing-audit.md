# Auditoria de rotas — Minhas cargas

## Chave canônica escolhida

- A chave canônica de rota e contrato público é `myCargos`.
- Ela aparece em `intlAppPaths.cargos.myCargos` e `appRoutes.cargos.myCargos(locale)`.

## Aliases mantidos

- `src/app/[locale]/cargas/minhas-cargas/page.tsx` permanece como alias de compatibilidade e redireciona para a rota canônica.
- O alias foi mantido porque ainda serve como fallback para links antigos e não há evidência de que esteja totalmente fora de uso.
- As chaves de tradução `myCargoes` continuam por serem texto/label de interface, não rota.

## Arquivos alterados

- `src/features/cargo-market/components/my-cargoes-list/my-cargoes-list.tsx`
- `src/features/cargo-market/components/cargo-card/cargo-card.tsx`
- `docs/audits/my-cargoes-routing-audit.md`

## Rotas validadas

- `src/app/[locale]/minhas-cargas/page.tsx`
- `src/app/[locale]/cargas/minhas-cargas/page.tsx`
- `src/app/[locale]/dashboard/page.tsx`
- `src/app/[locale]/cargas/page.tsx`

## O que foi corrigido

- Alinhei o identificador interno de variante de card/lista para `myCargos`, evitando mistura entre o nome da rota e o nome do variant visual.
- Mantive a compatibilidade da rota antiga sem quebrar navegação existente.

## O que ficou pendente

- O diretório/função histórica `my-cargoes-list` ainda carrega o nome legado, mas não impacta a rota canônica.
- As chaves de tradução `myCargoes` continuam por serem labels de UI; se o time quiser padronizar esse texto também, isso deve vir em uma etapa própria de copy/i18n.

## Comandos executados

- `rg -n "myCargoes|myCargos|minhas-cargas|my-cargos|myCargo" src tests docs -g '!**/*.map'`
- `sed -n '1,220p' src/shared/routing/app-routes.ts`
- `sed -n '1,260p' src/shared/config/navigation.ts`
- `find src/app -path 'src/app/[locale]/*' -type f | sort | sed -n '1,200p'`
- `rg -n "myCargoes" src messages tests docs -g '!**/*.map'`
- `rg -n "myCargos" src tests docs messages -g '!**/*.map'`
- `sed -n '1,240p' src/features/cargo-market/components/my-cargoes-list/my-cargoes-list.tsx`
- `sed -n '1,120p' src/features/cargo-market/components/cargo-card/cargo-card.tsx`
- `sed -n '1,220p' tests/integration/api/cargas.post.test.ts`

## Resultados

- A auditoria confirmou que a rota canônica já é `myCargos`.
- A única ambiguidade prática encontrada estava na variante interna `myCargoes`, agora alinhada para `myCargos`.
- O alias de rota foi preservado por compatibilidade.
