# Feature Scope Audit

Governança: **Operation Zero Redemoinho** — `docs/agents/AGENTS-ZERO-REDEMOINHO.md` → **Feature ownership**.

## Fronteiras feature / shared

| Onde | O que vai |
|------|-----------|
| `src/features/<domain>/` | UI, hooks, mocks, services, styles e testes **próprios do domínio** |
| `src/shared/` | Apenas componentes/utils com **prova de reutilização** entre domínios |
| **Proibido** | Jogar componente de feature em `shared` sem prova; `shared` importando regra específica de uma feature |

## Áreas

- `Dashboard` exibe cargas públicas.
- `Minhas cargas` exibe cargas do usuário logado.
- `Negociações` não deve duplicar o detalhe de carga.
- `Perfil` não deve misturar regras de auth.
- `Notificações` vivem fora do header.
- `Agente de Cargas` ajuda, mas não decide sozinho.

