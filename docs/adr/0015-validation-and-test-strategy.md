# Estratégia de validação e testes para mudanças críticas

## Status

Aprovado

## Data

2026-05-10

## Contexto

HydroRivers combina rotas App Router, overlays móveis, formulários com validação, mocks locais e dados por domínio. Sem uma rotina clara de validação, é fácil corrigir uma tela e introduzir regressão em outra.

## Problema

Uma mudança pequena em auth, cargas, minhas cargas, notificações, mapa ou bottom sheets pode afetar navegação, i18n, responsividade e acessibilidade. Validar só manualmente não é suficiente para o ritmo de evolução atual.

## Decisão

Usar `typecheck`, `lint`, `check:i18n` e a suíte de testes como base mínima de qualidade. Quando a mudança tocar regra de negócio ou fluxo do usuário, complementar com testes unitários e de integração relevantes. Manter `build` como gate de release, mesmo que o ambiente local exija atenção especial quando ele trava.

## Alternativas consideradas

- depender apenas de QA manual;
- rodar apenas testes de unidade;
- validar somente no navegador.

Essas alternativas deixam lacunas demais para um produto com overlays móveis, i18n e fluxos críticos de carga.

## Consequências positivas

- reduz regressões em auth, formulários, overlays e rotas principais;
- cria um ritual de qualidade previsível;
- ajuda a separar problema de código de problema de ambiente;
- documenta quando uma falha é antiga e quando é nova.

## Consequências negativas ou trade-offs

- aumenta o custo de cada PR;
- o `build` ainda pode travar no ambiente local e precisa ser monitorado separadamente;
- algumas correções exigem mais contexto para definir o teste certo.

## Critérios de revisão futura

- se o `build` voltar a travar com frequência, investigar bundle, plugins e runtime;
- se os testes ficarem lentos demais, segmentar melhor por domínio;
- quando os fluxos de formulário migrarem mais para Zod/RHF, ampliar cobertura por schema e integração.

## Links relacionados

- [ADR 0014](./0014-form-validation-zod-react-hook-form.md)
- [Auditoria de implementação](../audits/implementation-status-audit.md)
- [Auditoria de formulários](../audits/forms-validation-audit.md)

