# Services por domínio usando mocks/localStorage

## Status

Aprovado

## Contexto

O produto ainda está em estágio de mock funcional, mas precisa de persistência local e contratos claros para evoluir com segurança.

## Decisão

Cada domínio expõe services próprios sobre mocks/localStorage, com API preparada para troca futura por backend real.

## Consequências

- Fluxos funcionam hoje sem backend.
- A troca futura para API real fica menos invasiva.
- É preciso manter as regras de domínio centralizadas.

## Alternativas consideradas

- Acesso direto aos mocks pelos componentes.

## Data

2026-05-09

## Responsáveis

HydroRivers frontend/product team

