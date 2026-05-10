# Onboarding do HydroRivers

Este guia resume o essencial para começar com segurança no projeto.

## Como instalar

```bash
npm ci
```

## Como rodar

```bash
npm run dev
```

## Comandos principais

- `npm run lint`
- `npm run typecheck`
- `npm run check:i18n`
- `npm run audit:docs`
- `npm run verify`
- `npm test`
- `npm run build`

## Estrutura de pastas

- `src/app`: rotas, layouts e APIs;
- `src/features`: domínio por feature;
- `src/shared`: UI e utilitários reutilizáveis;
- `docs`: documentação, ADRs e auditorias;
- `.mock-data`: dados locais e cenários.

## Como criar uma nova página

1. criar a rota em `src/app/[locale]/...`;
2. compor com componentes de `features` e `shared`;
3. traduzir textos;
4. validar acessibilidade e mobile.

## Como criar um novo componente

1. decidir se é `shared` ou `feature`;
2. manter responsabilidade única;
3. tipar as props;
4. documentar estados relevantes;
5. adicionar teste quando a lógica justificar.

## Como criar um novo service

1. colocá-lo na feature correspondente;
2. deixar a UI fora da camada de dados;
3. retornar tipos explícitos;
4. validar entradas externas quando necessário.

## Como criar um novo hook

1. manter responsabilidade pequena;
2. não duplicar regra de negócio da service;
3. usar para orquestrar estado e efeitos do domínio.

## Como adicionar tradução

1. atualizar `messages/pt-BR.json`, `messages/en-US.json` e `messages/es.json`;
2. verificar `npm run check:i18n`;
3. evitar strings hardcoded visíveis.

## Como rodar testes

```bash
npm test
npm run test:unit
npm run test:integration
npm run test:e2e
```

## Como abrir PR

- manter o escopo pequeno;
- descrever risco e impacto;
- anexar validações;
- citar docs/ADRs alterados.

## Como consultar ADRs

- começar por `docs/adr/README.md`;
- ler a ADR mais próxima do domínio que você vai mexer;
- atualizar ADR se a decisão mudar.

## Como usar automações

- `npm run verify` para checks rápidos;
- `npm run audit:docs` para docs;
- ler `docs/automation/*` antes de criar workflows novos;
- usar IA como apoio, não como substituto de revisão.
