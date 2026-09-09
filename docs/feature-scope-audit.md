# Feature Scope Audit

Governança: **Operation Zero Redemoinho** — `docs/agents/AGENTS-ZERO-REDEMOINHO.md` → **Feature ownership**.

## Fronteiras feature / shared

| Onde | O que vai |
|------|-----------|
| `src/features/<domain>/` | UI, hooks, mocks, services, styles e testes **próprios do domínio** |
| `src/shared/` | Apenas componentes/utils com **prova de reutilização** entre domínios |
| **Proibido** | Jogar componente de feature em `shared` sem prova; `shared` importando regra específica de uma feature |

## Áreas

- **`/cargas`:** vitrine pública (marketplace/aquisição) — `src/features/cargo/mocks/publicCargos.mock.ts`, `getPublicCargos()`.
- **`/minhas-cargas`:** operação privada premium do usuário logado — `owned-cargos.mock.ts`, `getMyCargoesForUser()`, UI `owned-cargo-*` (lista + cockpit). Rebuild mobile Fases A–G concluído 2026-06-12. Fluxos: [`minhas-cargas-fluxo-embarcador.md`](product/flows/minhas-cargas-fluxo-embarcador.md), [`minhas-cargas-fluxo-tecnico-embarcador.md`](product/flows/minhas-cargas-fluxo-tecnico-embarcador.md). Auditoria: [`minhas-cargas-mobile-premium-rebuild-plan.md`](audits/minhas-cargas-mobile-premium-rebuild-plan.md). **CI pós-push (2026-06-13):** TD-01 (lab-v2 SSR × BottomNav) corrigido com mock test-only; follow-ups TD-02/TD-03 permanecem — ver §16 do plano.
- `Dashboard` exibe cargas públicas (resumo), não a carteira privada.
- `Negociações` não deve duplicar o detalhe de carga.
- `Perfil` não deve misturar regras de auth.
- `Notificações` vivem fora do header.
- `Agente de Cargas` ajuda, mas não decide sozinho.

## Mocks cargo (feature boundary)

| Dataset | Arquivo | Rota |
|---------|---------|------|
| Cargas públicas | `cargo/mocks/publicCargos.mock.ts` | `/cargas` |
| Cargas owned | `cargo/mocks/owned-cargos.mock.ts` | `/minhas-cargas` |
| Policy visibilidade | `cargo/domain/cargo-visibility-policy.ts` | gates mock public/authenticated/owner |

Shim legado: `my-cargos/mocks/myCargos.mock.ts` reexporta `owned-cargos.mock.ts` — não duplicar massa de dados.

