# Auditoria: Minhas cargas (empty state e mocks) — Estado Atual

Data: 2026-05-11  
Branch: `feat/mock-mode-qa-assistant`

## 1. Problema observado

A pagina `/minhas-cargas` pode exibir empty state mesmo quando a expectativa de demo/QA e ter cargas privadas por usuario/persona.

O empty state anterior falava em "cadastrar carga", mas nao explicava:

- que esta e a area privada vinculada ao perfil;
- que shipper e carrier veem coisas diferentes;
- qual e o valor pratico da pagina.

## 2. De onde os dados vem hoje

- Pagina server:
  - `src/app/[locale]/minhas-cargas/page.tsx`
  - usa `getSessionUser()` e `getCurrentUserCargos(user.id)`
- Service:
  - `src/features/cargo/services/cargo.service.ts`
  - tenta ler `cargoes` do mock-db local e, se nao houver privados, aplica seeds deterministicas.

## 3. Causas provaveis do empty state

- Usuario/persona nao estava no conjunto seed (ex.: ids fora de `u-shipper-1/2` e `u-carrier-1/2`).
- mock-db local nao tinha privadas para aquele usuario.

## 4. Riscos

- QA fica fragil e depende de "seed certa".
- Usuario leigo interpreta a pagina como erro/ausencia de funcionamento.

## 5. Recomendacao

- Manter `/cargas` como publico e compartilhado.
- Manter `/minhas-cargas` como privado por usuario/persona.
- Garantir fallback deterministico por perfil/id para evitar empty state inesperado.
- Humanizar copy e diferenciar shipper vs carrier.

