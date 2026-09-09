# 0064 - Notification capability ownership

## Status

Accepted

## Context

After SO-017 closed authentication ownership, `shipper-mobile-flow` still owned notification read data, repository composition, presentation and notification-specific selectors in the legacy shared stylesheet. A notifications feature already exists, so keeping a second notification implementation under the persona boundary preserves the Persona God Feature debt identified by ADR 0043.

## Decision

1. `src/features/notifications` owns the mobile shipper notification read model, repository contract/mock, read use case and presentation.
2. `features/notifications` must not import `features/shipper-mobile-flow`.
3. The App Router may continue composing the existing `MobileAppShell` around the notification screen until shell/navigation ownership is extracted separately.
4. Notification-specific selectors move out of `shared-ui.module.sass` into a notification-owned Sass Module.
5. Existing i18n keys, mock values, route behavior and visual declarations remain unchanged.
6. The persona repository provider no longer composes a notification repository.

## Consequences

- The Persona God Feature shrinks by one complete business capability without coupling Notifications back to the persona feature.
- The legacy shared stylesheet loses one consumer and notification-specific selectors.
- Shell/chrome debt remains explicit and can be extracted independently later.
- Future notification work lands in `features/notifications`, not under a persona namespace.
