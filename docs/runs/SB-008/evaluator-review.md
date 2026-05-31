# SB-008 evaluator review

## Initial verdict: REVISE

The first generator pass was directionally good, but not ready to pass. It rewrote seven pressure objects into the intended pattern and avoided the earlier object-only mistake, but the evaluator found three real gaps:

1. The rendering test only inspected component source, so it could not prove every condition label was rendered next to its concrete anchor.
2. The apartment map still lacked several visible physical objects, making some labels feel text-floating rather than attached to room evidence.
3. `telefonAversjon` remained as an older `StateObject` shape and could appear as a player-facing state outside the new anchor-label model.

Important follow-ups:

- Broaden player-facing clinical-label guardrails beyond the new pressure fields.
- Remove meta language like “not a diagnosis” from Frank’s report copy.
- Increase map-label readability enough for a spike.

## Revision applied

- Migrated `telefonAversjon` into the same anchored condition-object model.
- Added physical stage objects for receiver, manuscript/sofa cushion, bill/newspaper, Grete note, Frank’s chair, and reading chair.
- Replaced the raw-source render test with a `renderToStaticMarkup` test that checks every pressure/state object renders object label and condition label together.
- Broadened player-facing text scanning across pressure objects, `telefonAversjon`, approaches, supports, and activity clocks.
- Removed “diagnosis” wording from player-facing report/design-purpose copy.
- Increased apartment-map label contrast.

## Final evaluator stance

PASS for this spike.

This is not final UI. The map is still dense, and later slices should consider callout lines or better spatial grouping. But SB-008’s contract is satisfied: the design lab now models state objects as concrete anchor + non-clinical condition label + visible signs + consequence, with guardrail tests against DSM-ish player-facing drift.
