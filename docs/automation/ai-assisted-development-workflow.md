# Workflow de desenvolvimento assistido por IA

## Objetivo

Usar IA como apoio de análise, documentação e refatoração, sem terceirizar entendimento nem aceitar código sem validação.

## Como pedir auditorias

- delimitar escopo e arquivos;
- pedir verificação no código real;
- exigir evidência e estado atual;
- separar “implementado”, “parcial”, “pendente” e “risco”.

## Como revisar saída de IA

- conferir se a mudança respeita as rotas e os mocks existentes;
- checar se o texto não afirma versões ou integrações que o `package.json` não confirma;
- validar acessibilidade, i18n e mobile antes de aprovar;
- rodar `typecheck`, `lint`, `check:i18n`, testes e build quando aplicável.

## Como evitar aceitar código sem entender

- ler o diff completo;
- pedir motivo de cada mudança relevante;
- verificar se o código resolve a causa raiz, não só o sintoma;
- evitar commits grandes sem revisão humana.

## Boas práticas

- usar IA para mapear, resumir e propor;
- usar o time para decidir e validar;
- documentar decisões em ADR quando houver mudança arquitetural;
- nunca inserir secrets, tokens ou deploy destrutivo por sugestão de modelo.
