# Auditoria: dados mock de "Minhas cargas" (estado atual)

Data: 2026-05-11

## O que foi observado

- A rota `Minhas cargas` consome dados via service (`getCurrentUserCargos`).
- O mock-db local (`.mock-data/cargoes.json`) pode estar vazio em setups novos, o que exige fallback deterministico.
- Historicamente, o fallback cobria principalmente o embarcador, deixando o transportador sem massa rica para QA/demonstracao.

## Fonte dos dados

- Page: `src/app/[locale]/minhas-cargas/page.tsx`
- Service: `src/features/cargo/services/cargo.service.ts`
- Mock DB local: `src/shared/server/mock-db.ts` (arquivos `.mock-data/*.json`)
- Fallback TS: `src/features/my-cargos/mocks/myCargos.mock.ts`

## Lacunas e riscos

- Transportador sem massa deterministica: QA nao consegue validar "cargas atribuidas".
- Empty state com CTA incoerente por perfil (ex.: sugerir publicar carga para transportador).
- Risco de confusao com marketplace: "Minhas cargas" precisa permanecer privada e separada de `Cargas publicas`.

## Recomendacao

- Manter massa mock privada por perfil (shipper vs carrier) como fallback deterministico.
- Fazer empty state consciente do perfil/capability (criar carga vs voltar ao marketplace).
- Adicionar cenarios no QA Assistant com `expectedCargoCount` por persona.
