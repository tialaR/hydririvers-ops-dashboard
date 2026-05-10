# ADR 0017 - Dashboard como cockpit operacional

## Status

Accepted

## Data

2026-05-10

## Contexto

O Dashboard do HydroRivers precisava deixar de parecer uma listagem de cargas para assumir o papel de torre de controle da operação. A aplicação já possui `Cargas` como marketplace público e `Minhas cargas` como área privada do usuário logado; portanto, a página `dashboard` precisava responder outra pergunta de produto.

## Problema

Se Dashboard e Cargas contam a mesma história, uma das duas rotas perde valor. Isso gera:

- confusão para usuários leigos;
- manutenção duplicada;
- risco de misturar contexto público e privado;
- onboarding mais difícil para novos devs.

## Decisão

Transformar o Dashboard em cockpit operacional, com foco em:

- KPIs operacionais;
- atenção agora;
- próximas janelas;
- saúde por corredor;
- atividade recente;
- atalhos para Cargas e Minhas cargas.

## Alternativas consideradas

1. Remover Dashboard.
2. Manter Dashboard como listagem de cargas.
3. Fundir Dashboard com Cargas.
4. Transformar Dashboard em cockpit operacional.

A decisão escolhida foi a alternativa 4.

## Consequências positivas

- Dashboard passa a responder “como está a operação agora?”.
- Cargas continua focada em marketplace público.
- Minhas cargas continua focada na carteira privada do usuário.
- A navegação fica mais clara para usuário leigo e para o time.
- O resumo operacional pode evoluir sem competir com a listagem pública.

## Trade-offs

- o Dashboard exige mais cuidado para não voltar a parecer uma lista;
- algumas informações continuam derivadas dos mesmos mocks de base;
- a manutenção de copy e layout precisa respeitar as fronteiras entre as três áreas.

## Critérios de revisão futura

- se o Dashboard voltar a parecer marketplace, revisar a composição da página;
- se a área operacional crescer além do resumo atual, extrair novos blocos;
- se o backend real alterar visibilidade, reavaliar as fronteiras entre Dashboard, Cargas e Minhas cargas;
- revisar a decisão quando houver telemetria e dados operacionais mais completos.

## Links relacionados

- [Decisão de produto: Dashboard, Cargas e Minhas cargas](../product/dashboard-cargas-minhas-cargas-decision.md)
- [Arquitetura do Dashboard](../architecture/dashboard-architecture.md)
- [Fronteiras entre Dashboard, Cargas e Minhas cargas](./0016-dashboard-cargas-minhas-cargas-boundaries.md)
