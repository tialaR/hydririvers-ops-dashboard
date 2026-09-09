# 0038 - UI core content and feedback tsunami

## Status
Accepted

## Decision
Card, InformationalCard, InlineAlert, OtpInput, ProgressBar and PressableSurface delegate reusable semantic DOM and interaction behavior to `src/shared/design-system/core`.

Legacy/public paths remain compatibility adapters and retain current visual CSS. Product naming and product tokens are forbidden in the generic core.

BottomSheet and Liquid Glass primitives are intentionally excluded. Their interaction/runtime complexity requires a dedicated attack instead of being hidden inside this consolidation wave.
