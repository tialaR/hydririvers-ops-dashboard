# Instruções de Agentes — HydroRivers

## Contexto do projeto

HydroRivers é uma plataforma em Next.js/React para operações logísticas hidroviárias.

Domínios principais:
- cargas
- embarcações
- negociações
- rastreamento
- impacto
- governo
- admin
- perfil de usuário

## Stack do projeto

- Next.js App Router
- React 19
- TypeScript
- next-intl
- Sass Modules
- dados mock em `.mock-data`
- rotas protegidas
- i18n: `pt-BR`, `en`, `es`

## Dados mock e privacidade

- Usar apenas **dados fictícios e determinísticos** em mocks, fixtures e `.mock-data`.
- Não introduzir e-mails, telefones, documentos ou credenciais reais em código, testes ou documentação versionada.
- Preferir domínios claramente fictícios (ex.: `example.com`) e identificadores estáveis para testes.

## SSR, hidratação e render

- Evitar `Date.now()`, `Math.random()` e outros valores **não determinísticos** em componentes que renderizam no servidor e no cliente sem isolamento (risco de mismatch de hidratação).
- Preservar semântica e atributos de acessibilidade ao alterar layout compartilhado (shell).

## Commits, branches e artefatos

- Um PR por escopo; evitar misturar documentação ampla com correção pontual sem necessidade.
- Não versionar: `node_modules/`, `.next/`, `dist/`, `build/`, `coverage/`, `test-results/`, `playwright-report/`, ficheiros `.env*` com segredos.
- Dados persistidos em `.mock-data/*.json` são **dev-only** e estão no `.gitignore`; não commitar alterações manuais de QA com PII.

## Regras globais

1. Fazer mudanças pequenas e incrementais.
2. Preservar a arquitetura existente.
3. Manter acessibilidade e responsividade.
4. Não adicionar dependências sem justificativa.
5. Sempre explicar o plano antes de editar.
6. Rodar validações após mudanças.

## Política de testes

Antes de concluir qualquer tarefa, validar no mínimo:

```bash
npm run lint
npm run typecheck
npm run check:i18n
```

Quando a mudança tocar regras de negócio, fluxos de usuário ou integrações, também executar:

```bash
npm test
npm run test:mock-mode
npm run test:unit
npm run test:integration
npm run test:e2e
```

Antes de merge ou release, validar também o bundle:

```bash
npm run build
```

## Política de PR

- PRs devem ser pequenos e focados.
- Descrever objetivo, escopo e riscos.
- Incluir evidências de validação (lint, typecheck e testes relevantes).
- Destacar impacto em i18n, segurança, permissões e acessibilidade.
- Evitar misturar refatoração ampla com correção funcional no mesmo PR.

## Comandos recomendados

```bash
npm run lint
npm run typecheck
npm run check:i18n
npm run check:i18n:hardcoded
npm test
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:mock-mode
npm run build
```

O script `npm run verify` agrega lint, typecheck, i18n, testes completos e `test:mock-mode` (não inclui `build`).

## Proibições importantes

- Não reescrever o projeto do zero.
- Não remover i18n.
- Não remover mocks sem fase própria.
- Não adicionar IA antes de segurança, validação e testes.
- Sempre explicar plano antes de editar.
