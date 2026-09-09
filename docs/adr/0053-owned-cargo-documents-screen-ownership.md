# 0053 - Owned Cargo Documents Screen Ownership

## Status
Accepted

## Context
The authenticated documents experience still rendered its complete presentation inside `shipper-mobile-flow`, despite cargo domain data and use cases already belonging to `features/cargo/owned`.

## Decision
Move document list presentation and blocker CTA ownership to `features/cargo/owned/screens/owned-cargo-documents-screen.tsx`.

The legacy `DocumentsScreen` remains temporarily as a compatibility adapter for two persona-scoped concerns that are not yet neutralized:

- `MobileAppShell`;
- the confirmation bridge exposed by `ShipperFlowProvider`.

These dependencies are injected into the canonical screen as behavior/components. The canonical owned-cargo screen must not import `shipper-mobile-flow`.

## Consequences
- owned cargo documents presentation gains explicit feature ownership;
- legacy persona debt shrinks again;
- route, translations, confirmation behavior and success navigation remain unchanged;
- confirmation/shell neutralization can happen in a later dedicated wave without blocking domain ownership now.
