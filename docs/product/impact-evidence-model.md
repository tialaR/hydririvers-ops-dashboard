# Impacto — Modelo de Evidências Públicas

## Objetivo

Registrar **fontes públicas** de forma estática (sem fetch em runtime) para contextualizar claims e evitar números inventados.

## Onde fica no código

- `src/features/impact/domain/impact-evidence.ts`

## Campos principais

- `id`: identificador estável
- `title`: título curto
- `summary`: resumo em linguagem simples (sem colar texto longo)
- `sourceName`: órgão/entidade
- `sourceType`: `government | public-agency | policy | research | mock-estimate`
- `regionScope`: `Brazil | North Region | Amazon | ...`
- `year`
- `url`
- `relatedImpactIds`
- `confidenceLabel`: “Fonte pública”, “Evidência institucional”, “Policy”, “Estimativa demonstrativa”
- `disclaimer`: quando necessário

## Regras

- A UI deve mostrar evidência como **contexto**, não como “prova de desempenho do produto”.
- Se um percentual ou número específico for exibido, ele deve:
  - ter fonte específica; ou
  - ser marcado como estimativa demonstrativa + limites/metodologia.

