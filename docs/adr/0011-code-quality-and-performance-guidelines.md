# ADR 0011: Code quality and performance guidelines

## Status
Aceito

## Contexto

HydroRivers cresceu com várias features, componentes compartilhados e painéis pesados. Sem uma disciplina de estrutura e performance, o custo de manutenção e de bundle tende a aumentar.

## Decisão

- manter arquitetura feature-first com `shared` estritamente reutilizável;
- criar barrels públicos por módulo para reduzir imports frágeis;
- centralizar helpers compartilhados reais, como formatação monetária;
- preparar componentes base para futura cobertura de Storybook;
- tratar mapa, gráficos e painéis pesados como candidatos a lazy loading quando a interação permitir.

## Consequências

- melhora na legibilidade e na manutenção;
- redução de duplicação;
- contratos públicos mais claros;
- caminho mais limpo para testes e documentação;
- necessidade de disciplina para evitar barrel exports circulares.

## Alternativas consideradas

- manter imports relativos diretos em toda a codebase;
- criar uma camada shared ampla demais;
- adiar a documentação estrutural para depois.

Essas alternativas foram rejeitadas porque aumentariam acoplamento e dívida técnica sem ganho proporcional.
