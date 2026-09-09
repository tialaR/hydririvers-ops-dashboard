# Shipper mobile flow - decomposition map

This audit records the first migration map for the contained `shipper-mobile-flow` God Feature. It does not change product behavior.

| Current responsibility | Target ownership | Migration rule |
|---|---|---|
| owned cargo list, cargo detail, documents, cargo map | `features/cargo` + existing `features/waterway-map` where appropriate | preserve cargo visibility and owner rules |
| offers / negotiation screens and application calls | `features/negotiations` | do not duplicate cargo detail |
| hydrology summaries/charts | `features/hydrology` | domain data stays behind repository/application boundary |
| impact summaries/charts | `features/impact` | preserve current i18n and public/private behavior |
| notifications | `features/notifications` | keep notification ownership outside header chrome |
| profile | `features/profile` | auth/session rules remain in auth |
| login/register/OTP journey | `features/auth` | preserve existing session/mock-mode contracts |
| app header, navigation, shell composition | `shared/layout` / `shared/navigation` only after reuse proof | shell composes capabilities; it does not own business rules |
| persona provider orchestration | App Router composition or narrowly-scoped provider | do not create another persona-wide feature namespace |

## Extraction order

1. **Cargo spine first** because it is the portfolio-critical journey: Minhas Cargas -> detalhe -> mapa/timeline/documentos/riscos.
2. **Negotiations** because it currently hangs from cargo detail but is a separate capability.
3. **Hydrology + impact** because both provide operational context but should not live under the persona feature.
4. **Notifications + profile/auth** to finish capability ownership.
5. **Shell/navigation** last, once the screens no longer depend on the persona namespace.

## Non-goals

- no route rename;
- no visual redesign;
- no business-rule rewrite;
- no mock-data replacement;
- no API/provider replacement;
- no mass rename of Hydri/Hydro in this wave.
