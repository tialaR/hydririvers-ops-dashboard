# Auditoria: Documentação, ADRs e Workflows (Estado Atual)

Data: 2026-05-11  
Branch: `feat/mock-mode-qa-assistant`  
Escopo desta auditoria: **documentação, ADRs e workflows/checklists** (sem implementar funcionalidades novas).

## 1. Objetivo

Mapear:

- quais documentos e ADRs existem no repositório;
- quais workflows/checks existem de verdade (GitHub Actions + scripts);
- lacunas e inconsistências;
- recomendações de atualização **sem prometer implementação inexistente**.

## 2. Documentos (visão geral)

O diretório `docs/` contém um conjunto amplo de documentos, incluindo:

- `docs/product/`: decisões de produto, fronteiras entre rotas e user cases.
- `docs/architecture/`: decisões de arquitetura e limites técnicos (auth, mocks, mobile UI, etc.).
- `docs/automation/`: checklists e workflows humanos (QA, filtros, mobile, privacidade de mock-data).
- `docs/audits/`: auditorias e relatórios de implementação.
- `docs/adr/`: ADRs numerados com decisões arquiteturais.

Observação: existe também `docs/README.md` e diversos documentos “históricos/roadmap” em `docs/`.

## 3. ADRs (inventário e consistência)

Pasta: `docs/adr/`

- Existe um índice em `docs/adr/README.md`.
- ADRs fundamentais (0001–0017) e decisões de produto (0016/0017/0019) já existem.
- ADRs recentes citados no índice:
  - `0020-roles-permissions-access-control.md`
  - `0022-my-cargoes-role-based-mock-data.md`
  - `0023-mobile-layout-and-bottom-navigation-pattern.md`

### 3.1. Inconsistência encontrada

- O índice (`docs/adr/README.md`) referenciava **ADR 0021** (“Role-based access e QA personas”), mas **o arquivo não estava presente** no repositório.

Recomendação: criar o ADR 0021 (se a decisão for real e já estiver refletida no código/fluxo) ou remover a referência do índice. Nesta fase, preferimos **corrigir o índice para apontar apenas para arquivos existentes**.

## 4. Workflows reais (GitHub Actions)

Diretório: `.github/workflows/`

Workflows encontrados:

- `ci.yml`: roda `npm ci`, `npm run check:onboarding`, `npm run audit:docs`, `npm run lint`, `npm run typecheck`, `npm run check:i18n`, `npm run test`, `npm run build`.
- `pr-quality.yml`: roda `npm ci`, `npm run check:onboarding`, `npm run audit:docs`, `npm run verify`.

Risco: qualquer documentação que liste gates precisa refletir **scripts reais** do `package.json` (sem inventar comandos).

## 5. Scripts e gates (fonte de verdade)

Fonte de verdade: `package.json`.

Documentos que citam quality gates devem se alinhar aos scripts existentes (ex.: `check:onboarding`, `audit:docs`, `verify`, `check:i18n`, etc.).

## 6. Lacunas de documentação (decisões recentes)

Decisões que precisam estar claramente documentadas (e rotuladas como implementado/em evolução/futuro):

- Regras guiadas por **negócio/personas/capabilities**, não por “tela solta”.
- `/cargas` (marketplace público) vs `/minhas-cargas` (privado por usuário/persona).
- Embarcador vs Transportador: visões/dados/ações diferentes.
- Mock Mode como **QA Assistant para humanos** (persona, jornada, risco; cenários com expectativa).
- Mobile: bottom nav, safe area, scroll lock, BottomSheet, z-index e filtros.
- UI: “Cargas como referência visual” sem copiar função para outras rotas.
- Notificações: badge conta **unreadCount derivado da lista**, não total/hardcoded.
- Perfil: display name compacto (primeiro + último sobrenome) e layout resiliente.
- Sidebar: theme toggle compacto (sem container redundante).
- Privacidade de mock-data: nunca commitar PII real; `.mock-data/*.json` é estado local e deve ficar em `.gitignore`.
- Storybook e monorepo: **futuro**, com pré-requisitos explícitos.

## 7. Recomendações (ação)

- Atualizar o `README.md` para ficar curto e referenciar docs fonte de verdade (produto/arquitetura/automação/ADRs).
- Garantir que `docs/adr/README.md` não referencie ADR inexistente.
- Criar/atualizar docs em `docs/product/`, `docs/architecture/` e `docs/automation/` para registrar decisões recentes, sem afirmar implementação inexistente.
- Manter uma auditoria de “o que foi atualizado” para rastreabilidade (`docs/audits/product-refinement-documentation-update.md`).

