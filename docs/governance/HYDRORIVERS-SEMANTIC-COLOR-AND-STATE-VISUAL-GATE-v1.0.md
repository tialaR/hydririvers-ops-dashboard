# HYDRORIVERS — Semantic Color & State Visual Gate v1.0

**Status:** ACTIVE / GOVERNING  
**Scope:** desktop + mobile, dark + light, components and composed product surfaces  
**Applies to:** Storybook, Page 62, map controls, alerts, timelines, documents/evidence, status chips, mobile derivations and all future HydroRivers visual work

## 1. Rule

> **COLOR COMMUNICATES STATE. IT MUST NOT BECOME DECORATION.**

> **SELECTED / CURRENT / ACTIVE STATES MUST BE VISUALLY CLEAR WITHOUT TURNING THE INTERFACE INTO A COLOR MAP.**

> **NEUTRAL INFORMATION STAYS IN THE NEUTRAL PALETTE UNTIL SEMANTICS REQUIRE COLOR.**

This rule is cross-device. Desktop may show more information simultaneously and mobile may sequence it, but semantic color meaning does not change by viewport.

## 2. Decision sources

This gate consolidates:
- Apple Human Interface Guidelines principles for color, feedback, selection/current state and accessibility;
- the HydroRivers visual grammar;
- the Page 62 shipper domain contract;
- DNIT / ANA / ANTAQ / CHM domain evidence already tracked in `PAGE-62-SHIPPER-DOMAIN-RESEARCH-AND-JOURNEY-v1.0.md`.

Official Apple references:
- https://developer.apple.com/design/human-interface-guidelines/color
- https://developer.apple.com/design/human-interface-guidelines/feedback
- https://developer.apple.com/design/human-interface-guidelines/icons

Domain consequence:
- hydrological, navigation, documentary and operational states can carry semantic color when the color helps distinguish meaning;
- neutral labels, icons, container chrome, separators and data that are not states remain graphite / gray / white / black;
- source/freshness is contextual information unless stale/offline/critical;
- warning, critical, success and current-state styling must remain distinguishable by more than color alone.

## 3. Semantic palette contract

Baseline meanings:
- **success**: completed / valid / active / healthy;
- **warning**: attention / deadline / operational caution;
- **danger / critical**: blocking, rejected, overdue or confirmed critical impact;
- **info**: contextual information that changes understanding but is not itself a warning;
- **current / selected**: current operational focus or selected object; use subtle neutral or controlled informational highlight;
- **future / inactive / unavailable**: neutral and visually quieter, never falsely disabled if still readable/actionable.

Different labels with different operational meanings must not collapse into the same visual encoding when they are shown together and the distinction matters to the task.

## 4. Neutral-first rule

The following are neutral by default:
- title icons;
- navigation/control icons that do not carry a status;
- borders;
- separators;
- backgrounds;
- passive metadata;
- ordinary labels;
- document/folder icons;
- map-control chrome.

Color on those elements requires a documented semantic reason.

## 5. Selection and current state

Selected/current elements need a deliberate visual delta using one or more of:
- border;
- background;
- inset marker;
- weight;
- contrast;
- icon/check indicator;
- position/focus affordance.

Color alone is insufficient.

A future item may be quieter, but must remain legible. A past item may be neutralized, but completion status can still be expressed semantically.

## 6. Strong regression conditions

Automatic or human visual FAIL when a surface strongly breaks any of these:

1. semantic colors are used as decoration across non-status controls;
2. several different statuses share an identical visual encoding where the distinction is operationally relevant;
3. selected/current state is not visually distinguishable from siblings;
4. neutral icons become status-colored without carrying status;
5. critical state is encoded only by color with no label/icon/text cue;
6. future or secondary content is dimmed below practical readability;
7. dark/light or desktop/mobile changes the meaning of a semantic color;
8. a component invents local status colors instead of using shared semantic tokens/patterns;
9. a reference implementation contains richer state communication and the HydroRivers candidate removes it without a domain reason.

## 7. Reusable component contract

Reusable components that expose state should prefer explicit props/attributes such as:
- `tone`;
- `statusLabel`;
- `selected`;
- `aria-current`;
- `aria-pressed`;
- `data-semantic-status`;
- `data-semantic-role="neutral-icon"`.

The same component can change copy/action/icon while preserving semantic anatomy.

## 8. Automated gate

Current automation verifies representative Storybook surfaces and shared components. It must at minimum check:
- current/selected visual differentiation;
- status-color diversity when distinct statuses coexist;
- neutral icon treatment;
- no hidden horizontal overflow;
- status text/aria remains present;
- documents/evidence and timeline retain semantic state richness.

The automated gate is intentionally conservative. It catches strong regressions; it does not replace screenshot review.

## 9. Human visual review

Before promotion:
- inspect full frame;
- inspect status-heavy regions at critical zoom;
- compare dark/light when available;
- compare desktop/mobile when the corresponding surface exists;
- confirm color has meaning, not decoration;
- confirm neutral-first hierarchy;
- confirm current/selected state is obvious in a few seconds.

## 10. Result

**PASS:** semantic state is clear, neutral-first, cross-device consistent and no strong regression is detected.  
**FAIL:** restore semantic hierarchy before continuing visual polish.

> **COLOR IS A SIGNAL, NOT CONFETTI.**
