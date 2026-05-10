# Auditoria de correção: detalhe privado de carga

## Causa raiz do 404

O card exibido em **Minhas cargas** apontava para a rota pública `/[locale]/cargas/[id]`, mas os IDs privados (`MY-CARGO-*`) vivem no conjunto de dados do usuário. Isso fazia o usuário sair do fluxo privado e cair em uma página que não encontrava o recurso esperado.

## Rota clicada antes da correção

- Antes: `/[locale]/cargas/MY-CARGO-001`

## Rota correta após a correção

- Agora: `/[locale]/minhas-cargas/MY-CARGO-001`

## Arquivos alterados

- `src/features/cargo-market/components/cargo-card/cargo-card.tsx`
- `src/shared/config/navigation.ts`
- `src/shared/layout/admin-chrome/admin-chrome.tsx`
- `src/shared/layout/app-header/app-header.tsx`
- `src/shared/routing/app-routes.ts`
- `src/features/cargo/services/cargo.service.ts`
- `src/app/[locale]/minhas-cargas/[id]/page.tsx`
- `src/app/[locale]/cargas/minhas-cargas/[id]/page.tsx`
- `tests/unit/shared/config/navigation.test.ts`
- `tests/unit/features/cargo.service.test.ts`
- `tests/unit/features/cargo-market/cargo-card.test.tsx`
- `tests/unit/app/minhas-cargas-detail-page.test.tsx`

## Componentes reutilizados

- `CargoDetailLoader`
- `PageShell`
- `Breadcrumb`
- `CargoCard`

## Services usados

- `getCurrentUserCargos(user.id)`
- `getCurrentUserCargoById(user.id, cargoId)`
- `getCargoById(id)` continua para a rota pública

## Comportamento para carga inexistente

- `notFound()` na rota privada quando o cargo não pertence ao usuário ou não existe.

## Comportamento para carga de outro usuário

- A rota privada não renderiza detalhe de recurso alheio.
- O fallback seguro é `notFound()`, seguindo o padrão existente.

## Estado ativo da sidebar

- `/minhas-cargas` e `/minhas-cargas/[id]` agora marcam **Minhas cargas**.
- `/cargas` e `/cargas/[id]` continuam marcando **Cargas**.

## Testes criados

- rota privada abre detalhe corretamente;
- rota privada segura em caso de recurso ausente;
- navegação ativa respeita subrotas;
- card privado aponta para o href correto;
- service privado retorna apenas cargas do usuário.

## Resultados

- `npm run typecheck` — passou.
- `npm run lint` — passou.
- `npm run check:i18n` — passou.
- `npm test` — passou.
- `npm run build` — travou no ponto recorrente de otimização do Next; o processo foi encerrado manualmente.
