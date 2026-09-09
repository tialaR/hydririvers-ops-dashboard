# Implementacao: dados mock de "Minhas cargas" por perfil

Data: 2026-05-11

## Decisao aplicada

- "Minhas cargas" exibe dados privados coerentes com o perfil.
- Marketplace (`/cargas`) continua exibindo apenas cargas publicas.
- "Minhas cargas" usa vinculo por usuario:
  - shipper: `ownerId/shipperId`
  - carrier: `carrierId`

## O que mudou

1. Massa deterministica por perfil (fallback)
- Shipper: `userCargosMock`
- Carrier: `carrierCargosMock`

2. Service com fallback por userId conhecido
- `getCurrentUserCargos('u-shipper-1')` -> `userCargosMock` quando o mock-db nao retorna itens.
- `getCurrentUserCargos('u-carrier-1')` -> `carrierCargosMock` quando o mock-db nao retorna itens.

3. Empty state por perfil
- Shipper: CTA para criar/publicar carga.
- Carrier: CTA para voltar ao marketplace (oportunidades publicas).

4. QA Assistant
- Cenarios de "Minhas cargas" declaram `personaGroup` e `expectedCargoCount`.

## Arquivos principais

- `src/features/my-cargos/mocks/myCargos.mock.ts`
- `src/features/cargo/services/cargo.service.ts`
- `src/app/[locale]/minhas-cargas/page.tsx`
- `src/features/cargo-market/components/my-cargoes-list/my-cargoes-list.tsx`
- `src/shared/ui/mock-mode/mock-qa-scenarios.ts`
- `messages/pt-BR.json`, `messages/en-US.json`, `messages/es.json`

## Testes

- `tests/unit/features/cargo.service.test.ts`
- `tests/unit/shared/ui/mock-qa-scenarios.test.ts`

## Pendencias

- `npm run build` continua travando neste ambiente (comportamento recorrente fora do escopo de mocks).
