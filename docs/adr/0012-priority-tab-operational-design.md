# ADR 0012: Priority Tab Operational Design

## Status
Aceito

## Contexto
A tab de Prioridade da carga existia, mas tinha pouco valor operacional e repetia mensagens genéricas. Isso dificultava a leitura do risco, das próximas ações e do impacto operacional para usuários leigos e operadores.

## Decisão
Transformar a tab em uma área operacional com score, cards-resumo, prioridades acionáveis, checklist e impactos, mantendo a mesma linguagem do Design System e usando i18n para todo texto visível.

## Consequências
- melhora a compreensão do que exige atenção primeiro;
- reduz texto solto e cards genéricos;
- mantém consistência com o dashboard;
- cria uma base clara para evolução via API.

## Alternativas consideradas
- manter a lista textual simples;
- mover as prioridades para uma área separada;
- mostrar apenas alerts sem contexto.

## Data
2026-05-09

## Responsáveis
Time HydroRivers
