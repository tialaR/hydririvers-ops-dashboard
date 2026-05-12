# Fluxo de privacidade — `.mock-data` e persistência local

## Objetivo

Garantir que **dados pessoais reais** (e-mail, telefone, hash de senha, avatar em base64, etc.) **não entrem no Git** por meio de JSON mutável em `.mock-data/`, e que desenvolvedores saibam **como resetar** o ambiente com segurança.

## O que é versionado

- **Seeds determinísticos** em TypeScript: `src/features/auth/data/auth.mock.ts`, `src/features/marketplace/data/marketplace.mock.ts`, `src/shared/server/mock-scenarios.ts`.
- **Contrato** de leitura/escrita: `src/shared/server/mock-db.ts`.
- **Documentação** e scripts de reset (este arquivo, `npm run mock-data:reset`).

## O que não é versionado

- Todos os `*.json` sob `.mock-data/` (ver `.gitignore`).
- Qualquer estado produzido por cadastros manuais, `upsertUser`, troca de cenário via API ou testes exploratórios.

## Fluxo recomendado para desenvolvedores

1. Clone o repositório — a pasta `.mock-data/` pode estar vazia ou só com `README.md`.
2. Rode `npm run dev` — na primeira leitura, `readMock` cria JSON local a partir dos **seeds** do código.
3. Para **descartar** alterações locais (incluindo dados colados por engano):  
   `npm run mock-data:reset`  
   Reinicie o servidor de desenvolvimento se necessário.
4. **Antes de commitar**, confira `git status`: não deve aparecer `.mock-data/*.json`.

## Persistência no browser (cliente)

- Sessão demo: `localStorage` (`hydrorivers:session-user`) — também **não** deve ser tratada como fixture permanente; ver auditoria em `docs/audits/mock-data-privacy-audit.md`.
- Notificações mock: prefixo `hydrorivers:notifications` — apenas cliente, separado do `.mock-data`.

## Integração com Mock Mode / QA Assistant

- **Reset de cenário** (admin, POST `/api/mock-mode`) reescreve os JSON locais com um **dataset determinístico** definido em `mock-scenarios.ts`.
- O **catálogo de QA** no painel explica cada cenário; aplicar o dataset alinha o servidor ao caso de teste escolhido.

## Checklist antes de PR

- [ ] Nenhum `.mock-data/*.json` staged ou adicionado com `git add -f`.
- [ ] Nenhum e-mail/telefone real novo em arquivos versionados.
- [ ] Seeds TS continuam com domínios e nomes **claramente fictícios** de demo.
