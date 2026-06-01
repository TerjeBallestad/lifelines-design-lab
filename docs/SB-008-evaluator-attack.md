# SB-008 Evaluator Attack

## Verdict before implementation

The contract is directionally right, but it must not allow a cosmetic rename pass. This slice only matters if the anchor-label pairing changes what the player can read and what the system can do.

## Failure modes to reject

1. **DSM laundering** — `Anxiety` becomes `Restlessness`, but the system still behaves like a clinical taxonomy underneath.
2. **Static dashboard** — a table shows `room | label | description`, but no resolver/report/UI behavior depends on the pairing.
3. **Free-floating moods** — `Shame` appears without a visible object/routine/case anchor.
4. **Object-only flattening** — the implementation overcorrects and removes the Cultist-like condition labels. `Shame` is allowed. That was the whole point.
5. **Frank diagnoses** — case-file text appoints Elling with a condition instead of cautiously reading a pressure around evidence.
6. **No future guardrail** — a later author can add `Depression` or an unanchored `Affliction` without tests failing.

## Hard gates

- At least five pressure/state objects use the pattern: concrete anchor + non-clinical condition label + visible signs + mechanical consequence.
- Obvious DSM/clinical labels fail validation/tests.
- Allowed labels include abstract/emotional terms such as `Shame`, `Affliction`, `Restlessness`, `Silence`, `Relief`, `Obligation`.
- UI shows the anchor-label relationship in one glance.
- Resolver/report copy cites concrete evidence before interpretation.
- There is at least one test that would fail if labels were rendered without anchors.
- There is at least one test that would fail if obvious clinical labels entered player-facing state objects.

## What would make this PASS

A player can look at the room overlay and understand: “this thing in the room carries this pressure, and that pressure changes what I should try next.”

Example target image:

> unopened bills under the newspaper — `Shame` — makes admin/phone work brittle until softened or transformed.

That is Lifelines-shaped. A mood table is not.
