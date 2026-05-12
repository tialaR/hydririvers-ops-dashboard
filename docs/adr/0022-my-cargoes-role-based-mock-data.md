# 0022 - Minhas cargas: mock data por perfil (shipper vs carrier)

Status: accepted
Data: 2026-05-11

## Contexto

"Minhas cargas" e uma area privada. Embarcador e Transportador precisam ver dados diferentes para validar a regra de negocio.

## Problema

- O fallback deterministico cobria principalmente o embarcador.
- Para transportador, a experiencia podia ficar vazia e pouco representativa.
- O empty state podia sugerir acoes incoerentes por perfil.

## Decisao

Criar mocks privados por perfil e um service/helper testavel, mantendo:
- `/cargas` (publico) separado de `/minhas-cargas` (privado)
- vinculo privado por ownership/assignment
- fallback deterministico quando o mock-db estiver vazio

## Alternativas consideradas

1. Usar a mesma lista publica em Minhas cargas.
2. Filtrar dados diretamente no componente.
3. Criar mocks privados por perfil com service/helper. (escolhida)
4. Implementar backend real agora.

## Consequencias positivas

- QA/demonstracao ficam consistentes para shipper e carrier.
- CTAs ficam coerentes com capability (criar carga vs ver oportunidades).

## Trade-offs

- Fallback e por `userId` conhecido enquanto nao houver seed completo em `.mock-data`.

## Criterios de revisao futura

- Reduzir dependencia do fallback quando `.mock-data/cargoes.json` tiver seeds por persona.
- Manter contrato de visibilidade ao migrar para backend real.
