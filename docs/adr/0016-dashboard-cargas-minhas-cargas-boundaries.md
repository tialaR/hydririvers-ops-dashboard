# Fronteiras entre Dashboard, Cargas e Minhas cargas

## Status

Accepted

## Data

2026-05-10

## Contexto

As rotas `dashboard`, `cargas` e `minhas-cargas` precisavam comunicar intenções diferentes para não confundir a pessoa usuária nem o time de desenvolvimento. Antes desta decisão, o Dashboard ficava visualmente próximo de uma listagem de cargas, o que diminuía o valor da separação entre as três áreas.

## Problema

Quando o Dashboard e Cargas contam a mesma história, a rota adicional deixa de ter valor. Isso cria:

- confusão de navegação para usuário leigo;
- manutenção duplicada de telas parecidas;
- risco de misturar dados públicos e privados;
- dificuldade de onboarding para novos devs.

## Decisão

Manter as três rotas com papéis distintos:

- `Dashboard` = visão operacional geral;
- `Cargas` = marketplace público;
- `Minhas cargas` = área privada do usuário logado.

## Alternativas consideradas

1. Remover Dashboard.
2. Remover Cargas.
3. Manter as três sem diferenciar.
4. Manter as três com fronteiras claras.

A decisão escolhida foi a alternativa 4.

## Consequências positivas

- cada rota passa a responder uma pergunta de produto diferente;
- o shell do Dashboard pode focar em KPI, alertas e atenção operacional;
- o marketplace fica livre para busca, filtros e oportunidades públicas;
- a área privada pode mostrar responsabilização, pendências e detalhe contextual;
- o time tem uma fronteira mais clara para serviços, mocks, testes e copy.

## Trade-offs

- exige cuidado para não reutilizar a mesma listagem em mais de uma rota;
- alguns componentes continuam compartilhados, mas precisam ser adaptados ao contexto;
- o Dashboard precisa de um esforço contínuo para continuar parecendo operacional, e não um clone do marketplace.

## Critérios de revisão futura

- se o Dashboard voltar a parecer uma listagem de cargas, revisar a composição da página;
- se `Cargas` misturar itens privados, separar o service de marketplace;
- se `Minhas cargas` voltar a apontar para a rota pública, corrigir o contrato dos cards;
- revisar a decisão quando houver backend real com perfis e visibilidade mais completos.

## Links relacionados

- [0001 - Adoção de arquitetura por features com App Router, locales e `shared`](./0001-feature-based-architecture.md)
- [0009 - Dashboard exibe cargas públicas; Minhas Cargas exibe cargas do usuário logado](./0009-dashboard-public-cargos-vs-my-cargos.md)
- [dashboard-cargas-minhas-cargas-routing-audit](../audits/dashboard-cargas-minhas-cargas-routing-audit.md)

