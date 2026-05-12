# Auditoria: Dashboard (Implementacao de Humanizacao)

Data: 2026-05-11  
Branch: `feat/mock-mode-qa-assistant`

## 1. Objetivo

Tornar o Dashboard mais humano, claro e util para usuarios leigos, sem:

- virar uma lista de Cargas;
- virar uma landing page;
- criar redesign amplo.

## 2. Mudancas aplicadas

### 2.1. Topo do Dashboard (PageShell)

- Copy do topo foi reescrita para explicar "para que serve" a tela.
- Linguagem orientada a valor: snapshot do dia, pendencias e onde agir primeiro.

Arquivos:

- `src/app/[locale]/dashboard/page.tsx`
- `messages/pt-BR.json`, `messages/en-US.json`, `messages/es.json` (namespace `pages.dashboard`)

### 2.2. Remocao de redundancia (card de atalho antigo)

- O card redundante "Atalho operacional / Abrir o marketplace de cargas" foi removido do Dashboard.
- Mantivemos apenas um bloco guia (hero do overview) para CTAs.

Arquivo:

- `src/app/[locale]/dashboard/page.tsx`

### 2.3. Card guia (ponte entre entendimento e acao)

- Hero do overview foi mantido como "proximo passo" e ganhou copy mais humana.
- CTAs ficaram mais descritivos (ex.: "Explorar cargas publicas" vs "Acompanhar minhas cargas").

Arquivo:

- `src/features/dashboard/components/dashboard-overview/dashboard-overview.tsx`
- i18n: namespace `pages.dashboardOverview`

### 2.4. KPIs (microcopy)

- Labels/hints/trends foram ajustados para reduzir termos tecnicos e indicar significado pratico.
- `pendingDocuments` ganhou trend dedicado (`metricTrendPendingDocs`) para evitar reaproveito incoerente.

Arquivos:

- `src/features/dashboard/components/dashboard-overview/dashboard-overview.tsx`
- `messages/*` (namespace `pages.dashboardOverview`)

### 2.5. Documentacao e ADR

Criados:

- `docs/product/dashboard-ux-purpose.md`
- `docs/product/dashboard-information-architecture.md`
- `docs/adr/0024-dashboard-as-guided-operational-summary.md`
- `docs/audits/dashboard-humanization-audit.md`

Atualizado:

- `docs/adr/README.md`
- `docs/product/hydririvers-visual-language.md`

## 3. Testes

Atualizado:

- `tests/unit/app/dashboard-page.test.tsx` (garante ausencia do card redundante antigo)

Criado:

- `tests/unit/features/dashboard/dashboard-overview.test.tsx` (smoke do card guia + CTAs)

## 4. i18n

Atualizado nos tres idiomas:

- `pt-BR`
- `en-US`
- `es`

## 5. Quality gates executados nesta rodada

Rodados e aprovados:

- `npm run lint`
- `npm run check:i18n`
- `npm test`
- `npm run build`

Observacao do ambiente:

- alguns comandos exigiram permissao fora do sandbox para escrita de cache/artefatos (`tsbuildinfo`, `.next`, Vite temp).

## 6. Pendencias reais

- Se o produto evoluir para variacao por role (shipper vs carrier), considerar ajustar copy do hero/KPIs por role sem duplicar layout.
- Em mobile, avaliar se "Atividade recente" deve virar cards empilhados (caso tabela fique apertada) sem mudar o conteudo.

