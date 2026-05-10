# Workflow de observabilidade

## Objetivo

Preparar o projeto para medir experiência, erros e qualidade sem prometer telemetria que ainda não está implementada.

## O que faz sentido observar

- eventos de login, cadastro, publicação de carga e negociação;
- erros de validação e falhas de rota;
- tempo de carregamento e navegação;
- Web Vitals e experiência mobile;
- impacto de overlays, mapa e bottom sheets;
- uso de tema e idioma.

## GA4 e telemetria

- usar apenas quando houver decisão explícita de produto e privacidade;
- documentar consentimento e escopo de eventos;
- não capturar dados sensíveis;
- não rastrear conteúdo privado de negociação ou credenciais.

## Privacidade

- registrar apenas métricas e eventos necessários;
- evitar IDs pessoais desnecessários;
- manter o escopo de analytics mínimo e claro.

## Recomendação atual

Neste momento, o projeto deve manter a observabilidade como documentação e preparação arquitetural. Integrações reais com GA4, Sentry ou dashboards externos devem ser adicionadas apenas quando houver definição de escopo e necessidade de operação.
