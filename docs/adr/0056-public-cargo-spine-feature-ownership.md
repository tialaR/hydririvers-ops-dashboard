# 0056 - Public cargo spine belongs to cargo/public

## Status
Accepted

## Decision
Anonymous/public cargo domain types, privacy projection, repository contract, mock data and read use cases belong to `src/features/cargo/public`.

`shipper-mobile-flow` may temporarily consume this slice for presentation compatibility, but `cargo/public` must not depend on the persona feature.

Public routes call `cargo/public/application` directly. Presentation migration is a separate wave so UI ownership can move without mixing business-data extraction with shell decomposition.

## Guardrails
- `cargo/public -> shipper-mobile-flow`: forbidden.
- legacy public cargo domain/repository/application files inside the persona feature: forbidden.
- public privacy safe-view semantics: preserved.
- route behavior and i18n: unchanged.
