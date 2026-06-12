# HydroRivers business rules

**Personas e valor:** fluxos novos devem declarar qual persona beneficia (embarcador, transportador/operador, operador portuário, admin) e que valor operacional entregam. Ver `docs/agents/AGENTS-ZERO-REDEMOINHO.md` → **Mocks e domínio**.

**Mock-mode:** preservar auth mock; phone number como identificador único em dev.

## Cargas por navegação

- `Dashboard` mostra apenas cargas públicas.
- `Minhas cargas` mostra apenas cargas do usuário logado.
- `Cargas` mostra a lista operacional acessível ao perfil atual.

## Campos usados no mock

- `ownerId`: dono principal da carga.
- `shipperId`: embarcador registrador da carga.
- `carrierId`: operador vinculado quando existir.
- `visibility`: `public` ou `private`.
- `publishedAt`: data de publicação quando a carga é pública.

## Regras de visibilidade

- `isPublicCargo(cargo)`: considera públicas as cargas com `visibility === "public"`.
- `isCargoOwnedByUser(cargo, user)`: considera ownership por `ownerId`, `shipperId`, `carrierId` e vínculos mock de negociação.
- `getDashboardCargos(cargoes, user)`: retorna apenas cargas públicas.
- `getMyCargos(cargoes, user, negotiations)`: retorna apenas cargas do usuário atual.
- `getOperationalCargoes(cargoes, user, negotiations)`: retorna a lista acessível ao perfil.

## Perfis

- `shipper`: vê públicas no Dashboard e próprias em `Minhas cargas`.
- `carrier`: vê públicas no Dashboard e próprias/vinculadas em `Minhas cargas`.
- `admin`: vê públicas/agregadas no Dashboard; `Minhas cargas` não é o fluxo primário.
