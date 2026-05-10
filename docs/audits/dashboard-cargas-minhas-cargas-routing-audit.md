# Auditoria de roteamento: Dashboard, Cargas e Minhas cargas

## Diferença objetiva

| Área | Propósito | Rotas principais | Dados | Acesso |
| --- | --- | --- | --- | --- |
| Dashboard | Visão geral operacional, indicadores, mapa, alertas e status | `/[locale]/dashboard` | operações agregadas e painéis operacionais | usuários autenticados conforme shell/role |
| Cargas | Marketplace / listagem pública de cargas disponíveis | `/[locale]/cargas`, `/[locale]/cargas/[id]` | cargas públicas e oferta de mercado | público autenticado e fluxo de navegação geral |
| Minhas cargas | Área privada do usuário logado, com cargas próprias/atribuídas | `/[locale]/minhas-cargas`, `/[locale]/minhas-cargas/[id]` | cargas do usuário atual via `getCurrentUserCargos(user.id)` | somente usuário logado compatível com a carga |

## Rotas públicas e privadas

- Públicas/mercado:
  - `/[locale]/cargas`
  - `/[locale]/cargas/[id]`
- Privadas:
  - `/[locale]/minhas-cargas`
  - `/[locale]/minhas-cargas/[id]`

## Componentes reutilizados

- `src/features/cargo-market/components/cargo-card/cargo-card.tsx`
- `src/features/cargo-market/components/cargo-detail/cargo-detail.tsx`
- `src/features/cargo-market/components/cargo-detail/cargo-detail-loader.tsx`
- `src/shared/ui/page-shell/page-shell.tsx`
- `src/shared/ui/breadcrumb/breadcrumb.tsx`

## Services usados

- `src/features/cargo/services/cargo.service.ts`
  - `getPublicCargos()`
  - `getCargoById(id)`
  - `getCurrentUserCargos(userId)`
  - `getCurrentUserCargoById(userId, cargoId)`

## O que cada área pode mostrar

- Dashboard:
  - indicadores agregados;
  - mapa operacional;
  - alertas;
  - visão executiva.
- Cargas:
  - listagem pública;
  - detalhe público;
  - contexto de mercado.
- Minhas cargas:
  - lista privada do usuário;
  - detalhe privado da carga;
  - estado seguro quando a carga não pertence ao usuário.

## Usuários

- Embarcador: enxerga suas cargas privadas e as públicas relevantes.
- Operador / carrier: enxerga cargas atribuídas ou em operação conforme o mock/role.
- Admin: enxerga o shell expandido e áreas de governança.

## Nomenclatura recomendada na UI

- “Dashboard”
- “Cargas”
- “Minhas cargas”

Evitar misturar “Minhas cargas” dentro de “Cargas” ou tratar a área privada como alias simples do marketplace.
