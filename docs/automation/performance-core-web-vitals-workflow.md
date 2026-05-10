# Workflow de performance e Core Web Vitals

## Objetivo

Dar um caminho claro para medir e melhorar performance sem prometer uma automação que ainda não foi configurada no projeto.

## O que deve ser medido

- Lighthouse;
- Core Web Vitals;
- tamanho de bundle;
- imagens e CLS;
- comportamento de mapa e overlays;
- tempo de carregamento de rotas principais.

## Estado atual

O repositório ainda não traz um conjunto dedicado de dependências ou scripts para Lighthouse CI ou bundle analysis automatizado. Por isso, nesta etapa a decisão mais segura é documentar o fluxo recomendado e manter a execução manual/observacional.

## Setup recomendado no futuro

- adicionar tooling de Lighthouse CI quando houver decisão explícita de monitoramento;
- criar script de bundle analysis se o time quiser comparar impacto de features pesadas;
- conectar os resultados a um workflow de release ou PR quality apenas depois de provar que o comando roda de forma estável.

## Riscos

- criar um workflow de performance sem dependências ou segredos necessários;
- tratar um relatório pontual como monitoramento real;
- bloquear PR por métrica não calibrada.

## Próximo passo sugerido

Quando o time decidir operacionalizar performance, a implementação deve nascer pequena: um script local, um README de execução e só depois um job de CI.
