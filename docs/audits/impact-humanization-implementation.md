# Auditoria / implementação — humanização da área Impacto

## Problema observado

- A listagem `/impacto` repetia o título da página no cartão introdutório e pouco explicava **limites** de números e mocks.
- Cartões misturavam rótulos genéricos (“Econômico”, “Policy”) sem alinhar à taxonomia pedida (valor econômico / ambiental / operacional / institucional).
- O detalhe `/impacto/[id]` já tinha blocos de significado e limites, mas indicadores **sem** evidência pública cadastrada em `impact-evidence.ts` caíam em mensagem genérica de ausência, sem orientar “a validar com fonte pública”.
- Bullets em `details.sustainability` ainda sugeriam “CO₂ evitado por carga” de forma que podia soar como medição.

## Como os claims foram tratados

- **Sem novos números**: nenhum percentual inventado; métricas dos cartões permanecem qualitativas ou explicitamente “estimativa demonstrativa”.
- **Ambiental**: copy reforça **potencial**, variabilidade por rota/modal e distinção entre **cenário de produto** e **medição de campo**. Evidências reais (MPor, DNIT, etc.) continuam em `src/features/impact/domain/impact-evidence.ts` com disclaimers.
- **Econômico / operacional sem fonte**: `evidenceStubs` nos três idiomas descrevem placeholders com `sourceName` “A validar com fonte pública” e disclaimer claro; badge de lista `evidenceStubBadge` = “Cenário mockado” (pt), equivalente en/es.
- **BR do Mar / política**: mantidas entradas reais com URLs `.gov.br`; texto do produto não afirma execução do programa nem validação oficial.

## O que é estimativa / mock

| Indicador   | Lista (cartão)              | Detalhe — evidência                                      |
|------------|-----------------------------|-----------------------------------------------------------|
| cost       | Estimativa demonstrativa    | Stub “a validar” (sem série pública vinculada)            |
| sustainability | Fonte pública + cenário | Evidências reais + limites explícitos                     |
| regional   | Fonte pública               | Evidências reais onde aplicável                           |
| automation | Mock demonstrativo          | Stub explicando UX demo                                   |
| brdomar    | Fonte pública (lei)       | Evidências policy + governo                               |
| compliance | Mock demonstrativo        | Stub                                                       |
| connectivity | Hipótese de produto     | Stub                                                       |
| government | Mock demonstrativo        | Evidências conceituais regionais + agregados demo         |

## Valor e limites na UI

- **Lista**: `introTitle`, `intro`, `introFootnote`; cartão ambiental com `metricSubline` opcional (cenário).
- **Detalhe**: `ImpactDetailBody` — seções fixas; evidências reais quando existem; caso contrário **stubs** a partir de `pages.impactDetail.evidenceStubs.*`.
- **Mobile**: padding inferior na grade da lista (`impact-story.module.scss`) e no detalhe (`impact-detail-body.module.scss`) para não ficar sob a bottom nav.

## Fontes a validar

- Stubs de custo, automação, conformidade e conectividade: **sem URL** até definir série ou documento público acordado.

## Testes

- `tests/unit/app/impact-page.test.ts` — topo humanizado (mensagens pt-BR reais).
- `tests/unit/features/impact/impact-story.test.ts` — intro + categoria + `metricSubline`.
- `tests/unit/features/impact/impact-detail-body.test.ts` — seções + stub vs evidência real.

## QA Assistant

- Cenários adicionados em `mock-qa-scenarios.ts`: visão leiga, ambiental com estimativa, detalhe com limites, contexto público a validar.

## Pendências

- Opcional: vincular stubs a fontes públicas concretas (ex. séries de transporte) quando o produto tiver curadoria jurídica.
- Opcional: teste e2e dedicado à rolagem do detalhe no mobile com bottom nav.
