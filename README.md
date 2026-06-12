# HydroRivers Ops Dashboard

Dashboard operacional HydroRivers — Next.js 16, React 19, feature-based architecture, mobile-first.

## Agentes e governança

- **Entrada de agentes:** [`AGENTS.md`](./AGENTS.md)
- **Task router:** [`docs/agents/AGENTS-TASK-ROUTER.md`](./docs/agents/AGENTS-TASK-ROUTER.md)
- **Operation Zero Redemoinho** (anti-duplicação, tokens, i18n, naming, labs): [`docs/agents/AGENTS-ZERO-REDEMOINHO.md`](./docs/agents/AGENTS-ZERO-REDEMOINHO.md)

## Desenvolvimento local

```bash
npm install
npm run dev
```

Preview mobile padrão: `http://localhost:3000/pt-BR/cargas`

## Validação baseline

```bash
npm run lint
npm run typecheck
npm run check:i18n
```

## Arquitetura

Ver [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) e ADRs em [`docs/adr/`](./docs/adr/).
