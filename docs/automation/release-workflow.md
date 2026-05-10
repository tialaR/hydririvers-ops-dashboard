# Workflow de release

## Objetivo

Fazer releases previsíveis, auditáveis e seguras.

## Pré-checks

- `npm run verify`;
- `npm run audit:docs`;
- `npm run check:onboarding`;
- validação visual das rotas críticas;
- revisão de riscos em docs/audits.

## Etapas recomendadas

1. conferir branch e escopo do PR;
2. rodar checks locais;
3. revisar diffs de UI, i18n e acessibilidade;
4. validar build;
5. executar QA visual em desktop e mobile;
6. publicar release notes ou changelog;
7. monitorar pós-release.

## Rollback conceitual

- manter o histórico do PR claro;
- reverter a mudança pequena quando houver regressão;
- evitar pacotes de correções gigantes em um único deploy.

## O que não automatizar às cegas

- deploy destrutivo;
- reescrita de dados mock sem revisão;
- automações que dependem de secrets ainda não definidos.
