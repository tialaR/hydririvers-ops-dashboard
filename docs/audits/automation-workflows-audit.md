# Auditoria de automação e workflows

## Resumo executivo

O projeto já possui uma base sólida de scripts de qualidade, auditorias e documentação. O que mais se repete hoje é validação de código, i18n, onboarding e testes. Ainda há tarefas manuais relevantes em release, QA visual, observabilidade real e performance de web vitals.

## Tarefas repetitivas atuais

- validar `lint`, `typecheck`, `check:i18n` e testes;
- conferir docs de onboarding e ADRs;
- revisar consistência de i18n;
- acompanhar build que pode travar no ambiente local;
- checar rotas, overlays e mobile manualmente;
- revisar decisões arquiteturais em docs/audits antes de implementar mudanças grandes.

## Tarefas que já têm script

- `npm run lint`;
- `npm run typecheck`;
- `npm run check:i18n`;
- `npm run check:i18n:hardcoded`;
- `npm run audit:i18n`;
- `npm run audit:i18n:rendered`;
- `npm run check:onboarding`;
- `npm run test`;
- `npm run test:unit`;
- `npm run test:integration`;
- `npm run test:e2e`;
- `npm run verify` e aliases de auditoria criados nesta etapa.

## Tarefas ainda manuais

- QA visual em browser real;
- revisão de mobile/landscape com mapas e bottom sheets;
- avaliação de release e rollback;
- análise de performance com Lighthouse/Core Web Vitals;
- telemetria e observabilidade reais;
- revisão de ADRs quando há mudança de arquitetura;
- inspeção de impacto em rotas antigas e shims.

## Oportunidades de automação

- consolidar `verify` como atalho local para checks essenciais;
- usar `audit:docs` para detectar documentação faltante;
- manter CI com `lint`, `typecheck`, `check:i18n`, testes e build;
- adicionar perf tooling no futuro quando houver decisão explícita de bundle analyzer/Lighthouse;
- automatizar checklists de release e onboarding como etapas documentadas.

## Riscos de automação excessiva

- criar workflows que falham por depender de secrets ou tooling não instalado;
- prometer performance real sem medição válida;
- duplicar validações em scripts e workflows sem ganho;
- mascarar build travado com “passos verdes” sem evidência;
- automatizar regras de negócio que ainda estão em transição.

## Recomendações priorizadas

1. Manter `verify` como baseline local antes de PR.
2. Usar CI para `lint`, `typecheck`, `check:i18n`, testes e build.
3. Automatizar documentação mínima com `audit:docs`.
4. Tratar perf/observability como próximos passos documentados, não como falsa conclusão.
5. Evitar adicionar secrets ou deploy automation até haver política de release mais estável.
