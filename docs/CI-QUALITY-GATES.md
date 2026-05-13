# CI — Quality gates (GitHub Actions)

## 1. Objetivo

Garantir que cada alteração enviada ao repositório e cada pull request passe por um conjunto mínimo e reproduzível de verificações de qualidade (onboarding, auditoria de documentação, estilo/análise estática, TypeScript, chaves i18n, testes automatizados e, no fluxo principal de CI, build de produção) antes da revisão ou do merge.

## 2. Quando os workflows rodam

### [`ci.yml`](../.github/workflows/ci.yml)

- **push**: em qualquer branch, após cada push.
- **pull_request**: quando um PR é aberto ou atualizado.

Há **cancelamento entre execuções** do mesmo fluxo (`concurrency`) para não acumular jobs duplicados quando há vários pushes seguidos no mesmo branch ou PR.

### [`pr-quality.yml`](../.github/workflows/pr-quality.yml)

- **pull_request** apenas.
- Executa `npm run verify` após onboarding e auditoria de docs (ver secção 3).

## 3. Quais checks executam

### Pipeline `ci.yml` (job `quality`)

| Etapa | Comando |
|-------|---------|
| Instalação | `npm ci` |
| Progresso onboarding | `npm run check:onboarding` |
| Auditoria de documentação | `npm run audit:docs` |
| ESLint | `npm run lint` |
| TypeScript | `npm run typecheck` |
| Consistência i18n | `npm run check:i18n` |
| Testes (Vitest, suíte completa) | `npm run test` |
| Regressão Mock Mode / QA | `npm run test:mock-mode` |
| Build Next.js | `npm run build` |

Ambiente: **Node.js 22** (compatível com o stack do projeto, por exemplo `@types/node` na faixa 22).

### Pipeline `pr-quality.yml` (job `validate`)

| Etapa | Comando |
|-------|---------|
| Instalação | `npm ci` |
| Progresso onboarding | `npm run check:onboarding` |
| Auditoria de documentação | `npm run audit:docs` |
| Verificação agregada | `npm run verify` |

O script **`verify`** no `package.json` corresponde a:

`lint` → `typecheck` → `check:i18n` → `test` → **`test:mock-mode`**

**Nota:** o job de PR **não** executa `npm run build` (o push/CI principal sim). Para validar build antes de abrir PR, rode localmente `npm run build`.

## 4. Por que cada check existe

- **`npm ci`**: instala dependências a partir do `package-lock.json` de forma determinística, reproduzindo o ambiente local e de CI.
- **`check:onboarding`**: valida requisitos ou progresso definidos pelo projeto (`scripts/check-onboarding-progress.mjs`).
- **`audit:docs`**: executa `scripts/audit-docs.mjs` para manter a documentação mínima alinhada ao repositório.
- **`lint`**: mantém padrões de código e captura problemas comuns sem executar a aplicação.
- **`typecheck`**: garante que o TypeScript compila semanticamente (`tsc --noEmit`).
- **`check:i18n`**: verifica consistência das traduções entre locales (`pt-BR`, `en-US`, `es`).
- **`test`**: executa a suíte Vitest completa.
- **`test:mock-mode`**: executa subconjunto crítico de testes ligados a mock mode, cenários mock e APIs relacionadas (definido em `package.json`).
- **`build`**: valida o bundle Next.js em modo produção (apenas no `ci.yml`).

## 5. Como rodar localmente

Espelho próximo do **CI principal**:

```bash
npm ci
npm run check:onboarding
npm run audit:docs
npm run lint
npm run typecheck
npm run check:i18n
npm test
npm run test:mock-mode
npm run build
```

Espelho do **PR quality** (sem build):

```bash
npm ci
npm run check:onboarding
npm run audit:docs
npm run verify
```

Para desenvolvimento iterativo, `npm install` costuma ser suficiente; para espelhar o CI, prefira `npm ci`.

## 6. Como investigar falhas

1. Abra a aba **Actions** no GitHub e selecione o run que falhou (`CI` ou `PR Quality`).
2. Expanda o job e o step em vermelho.
3. Leia a saída do comando: ESLint, `tsc`, relatório i18n, Vitest, `audit:docs` ou build.
4. Reproduza localmente (secção 5) no mesmo commit.

## 7. Próximos passos opcionais

Ideias quando o time quiser ampliar a pipeline (não obrigatórias hoje):

- **E2E no CI**: job com `npm run test:e2e` (Playwright), com `npx playwright install --with-deps` e artefatos em falha.
- **Build também em PR**: adicionar step `npm run build` em `pr-quality.yml` se o tempo de job for aceitável.
- **Proteção de branch**: exigir status verde dos workflows obrigatórios antes do merge.

Mudanças futuras devem preservar os scripts existentes no `package.json` e alinhar novos jobs à mesma versão de Node, salvo decisão explícita de atualizar o projeto.

## 8. Scripts referenciados em documentação mas inexistentes

No `package.json` atual **não** existem, por exemplo, `verify:qa` ou `check:mock-data`. Qualquer documentação ou workflow que os cite deve ser corrigida ou os scripts devem ser adicionados explicitamente ao `package.json` antes de usados no CI.
