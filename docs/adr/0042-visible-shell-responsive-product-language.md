# 0042 - Visible shell and responsive product language

## Status
Accepted

## Context
The responsive foundation defines compact, medium and wide as first-class modes. The next step is to make those modes visibly useful without changing business behavior or copying a platform visual language wholesale.

## Decision
1. Mobile remains the primary interaction baseline.
2. Tablet and desktop receive purpose-built composition rather than a stretched mobile canvas.
3. Content surfaces prefer solid/tonal hierarchy; translucent material is reserved for navigation or transient controls where it improves context.
4. The existing navigation model and business rules remain unchanged.
5. Wide layouts may reinterpret the existing bottom navigation as a navigation rail using CSS only.
6. Motion is restrained, purposeful and disabled by reduced-motion preferences.
7. Cockpit and My Cargoes are the first visible product-language surfaces.

## Consequences
- visible product identity begins without domain rewrites;
- desktop/tablet gain stronger information density;
- future waves can iterate screen-by-screen while keeping one responsive contract;
- Liquid Glass is no longer the default content treatment.
