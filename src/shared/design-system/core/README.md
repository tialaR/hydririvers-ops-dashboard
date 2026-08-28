# Design System Core

Product-agnostic reusable UI lives here.

Allowed concepts include semantic primitives and components such as:

- Button
- Surface
- Badge
- IconButton
- Sheet
- TextField
- SearchField
- SegmentedControl

Rules:

- no HydroRivers/HydriRivers/`hy` naming;
- no cargo, shipper, hydrology, negotiation, or other business semantics;
- no product palette encoded directly in component APIs;
- materials are appearance choices, not component identities;
- APIs should be portable to a future package and Storybook.
