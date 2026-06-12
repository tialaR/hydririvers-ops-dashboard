# HydroRivers business rules

**Personas e valor:** fluxos novos devem declarar qual persona beneficia (embarcador, transportador/operador, operador portuário, admin) e que valor operacional entregam. Ver `docs/agents/AGENTS-ZERO-REDEMOINHO.md` → **Mocks e domínio**.

**Mock-mode:** preservar auth mock; phone number como identificador único em dev.

## Cargas por navegação

- **`/cargas` (Cargas Públicas):** vitrine/marketplace — lista `publicCargosMock` + seed público via `getPublicCargos()`. Qualquer visitante vê oferta; dados sensíveis serão travados em fase posterior.
- **`/minhas-cargas` (Minhas Cargas):** área operacional privada do embarcador/transportador logado — lista `owned-cargos.mock` via `getMyCargoesForUser()`. Copy e CTAs operacionais (acompanhar, documentos, timeline). **Fluxos aprovados (consultar antes de alterar):** [`docs/product/flows/minhas-cargas-fluxo-embarcador.md`](product/flows/minhas-cargas-fluxo-embarcador.md) (persona) e [`docs/product/flows/minhas-cargas-fluxo-tecnico-embarcador.md`](product/flows/minhas-cargas-fluxo-tecnico-embarcador.md) (técnico); padrão visual em [`docs/design/hydri-persona-flow-diagram.md`](design/hydri-persona-flow-diagram.md).
- `Dashboard` mostra apenas cargas públicas (resumo operacional, não carteira privada).

## Campos usados no mock

- `ownerId`: dono principal da carga.
- `shipperId`: embarcador registrador da carga.
- `carrierId`: operador vinculado quando existir.
- `visibility`: `public` ou `private`.
- `publishedAt`: data de publicação quando a carga é pública.

## Regras de visibilidade (policy mock)

Tiers em `src/features/cargo/domain/cargo-visibility-policy.ts`:

| Tier | Uso | Requer auth | Requer ownership |
|------|-----|-------------|------------------|
| `public` | `/cargas` vitrine | não | não |
| `authenticated` | sessão mock ativa | sim | não (privadas ainda bloqueadas) |
| `owner` | `/minhas-cargas` | sim | sim |

Funções:

- `resolveCargoVisibilityTier(cargo)`: tier mínimo da carga.
- `canAccessCargoAtTier(cargo, viewer, tier)`: gate mock por rota/intenção.
- `isPublicCargo(cargo)` (marketplace): cargas na vitrine pública.
- `getMyCargos(cargoes, user)`: carteira privada do usuário.

## Perfis

- `shipper`: vê públicas no Dashboard e próprias em `Minhas cargas`.
- `carrier`: vê públicas no Dashboard e próprias/vinculadas em `Minhas cargas`.
- `admin`: vê públicas/agregadas no Dashboard; `Minhas cargas` não é o fluxo primário.
