# ADR 0013: Feature Mocks and Business Scope

## Status
Aceito

## Contexto
O HydroRivers usa mocks para acelerar a entrega, mas alguns domínios precisavam de contratos mais claros para evitar vazamento de regra de negócio entre Dashboard, Minhas Cargas e componentes reutilizáveis.

## Decisão
Manter mocks por domínio com contratos estruturados, derivando dados operacionais quando necessário e evitando que a UI leia mocks diretamente sem passar por service ou hook da feature.

## Consequências
- separa melhor dados públicos e dados do usuário;
- reduz acoplamento entre UI e mock;
- facilita futura troca por API real;
- melhora rastreabilidade de regras por feature.

## Alternativas consideradas
- concentrar todos os mocks em um arquivo global;
- deixar cada componente buscar seu mock diretamente;
- duplicar estruturas por tela.

## Data
2026-05-09

## Responsáveis
Time HydroRivers
