# Auditoria — privacidade de `.mock-data` e persistência local

**Data:** 2026-05-10  
**Escopo:** `.mock-data/*.json`, `mock-db.ts`, `auth.client` / `localStorage`, Mock Mode, QA Assistant.

## Problema observado

- Os arquivos JSON em `.mock-data/` são **estado local mutável** e podem acumular dados de **testes manuais**, incluindo identificadores reais (ex.: e-mail pessoal, telefone, hash de senha, avatar em base64).
- Embora estejam **gitignored**, ainda existe risco humano de `git add -f`, cópia indevida ou uso do conteúdo local como se fosse fixture segura.
- Isso viola a política de **não commitar PII** e mistura **fixture** com **estado mutável** de desenvolvimento.

## Causa raiz

1. **Merge em runtime:** `readMock` faz merge de arrays por `id`, preservando entradas criadas localmente junto com seeds.
2. **Estado local persistente:** os JSON em `.mock-data/` podem ser modificados em testes manuais e mantidos entre sessões de dev.
3. **Cadastro / upsert** gravam no mesmo diretório que o time poderia assumir como “dados de exemplo” fixos.

## Mitigações aplicadas

| Mitigação | Detalhe |
|-----------|---------|
| `.gitignore` | `.mock-data/*.json` — estado local nunca entra no repositório por padrão. |
| Documentação | `docs/automation/mock-data-privacy-workflow.md`, `.mock-data/README.md`. |
| Reset explícito | `npm run mock-data:reset` remove JSON mutável. |
| Comentário em `mock-db.ts` | Deixa explícito que JSON é dev-only e gitignored. |
| QA Assistant | Catálogo de cenários + texto explicativo; admin pode aplicar dataset determinístico via API. |

## Persistência local (fora de `.mock-data`)

| Armazenamento | Chave / módulo | Risco | Nota |
|---------------|----------------|-------|------|
| `localStorage` | `hydrorivers:session-user` | Cache de sessão demo no cliente | Não versionar; limpar no browser se necessário. |
| `localStorage` | `hydrorivers:notifications:*` | Dados de UI | Determinístico por `userId`; não é commit. |
| `sessionStorage` | prefill login QA | Temporário | Só para fluxo de login em dev. |

## Seeds versionados (TypeScript)

- Usuários demo usam domínio **`@hydrorivers.com`**, telefones **fictícios** e hashes **apenas para testes** — não são contas reais.
- **Não** copiar perfis reais para `auth.mock.ts` ou para mensagens i18n.

## JSON local mutável

- `users.json`, `cargoes.json`, `negotiations.json`, `trackingEvents.json` e `vessels.json` em `.mock-data/` são **somente para desenvolvimento local**.
- Esses arquivos podem existir no disco para simular persistência entre execuções, mas **não devem** ser tratados como fonte versionada de verdade.
- Se alguém precisar revisar conteúdo local, o checklist deve sempre começar por `git status` e pelo script `npm run mock-data:reset`.

## Arquivos alterados nesta iniciativa

- `.gitignore`
- `.mock-data/README.md`
- `scripts/reset-mock-data.mjs`
- `package.json` (script `mock-data:reset`)
- `src/shared/server/mock-db.ts` (comentário)
- `src/shared/qa/mock-scenario-catalog.ts`
- UI: `mock-scenario-control.tsx`, `mock-qa-assistant.tsx`, `mock-mode.tsx`
- `messages/*.json` (catálogo de cenários + strings do assistente)
- Documentação: este arquivo e `docs/automation/mock-data-privacy-workflow.md`

## Testes

- `tests/unit/shared/qa/mock-scenario-catalog.test.ts` — alinhamento de ids do catálogo com `mockScenarioIds`.
- Suíte existente de `mock-db`, APIs `mock-mode`, `mock-qa-scenarios` permanece válida.

## Pendências / riscos residuais

- Desenvolvedores podem **forçar** add de arquivos ignorados (`git add -f`); o code review deve barrar.
- Ambientes **CI** devem usar diretório limpo ou só seeds TS (sem depender de JSON pré-gerado no repo).
