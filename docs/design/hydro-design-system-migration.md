# Hydro Design System Migration

## Prefixos legados

- `--ds-*`
- `--hx-*`
- `--surface-*`
- `--color-*`
- `--radius-*`
- `--space-*`

## Diretriz

Todo novo desenvolvimento deve usar somente:

- `--hydro-kit-*` (brutos)
- `--hydro-*` (semanticos)

## Estado atual

- `--hx-*` segue em uso em estilos globais legados do app.
- Tokens `--ds-*` permanecem em componentes legados do design-system/components.
- Nao foi criada bridge global nova nesta rodada para evitar mapear tokens sem necessidade real.

## Como migrar

1. Identificar componente com token legado.
2. Substituir token por equivalente `--hydro-*`.
3. Validar visualmente o contexto mobile/desktop afetado.
4. Remover fallback legado do componente.
5. Rodar `npm run ds:check`.

## Plano de remocao

- Curto prazo: bloquear novos `--ios-*` e backups via guard.
- Medio prazo: migrar `design-system/components` de `--ds-*` para `--hydro-*`.
- Longo prazo: retirar dependencia de `--hx-*` em `globals.scss` com plano dedicado por dominio.
