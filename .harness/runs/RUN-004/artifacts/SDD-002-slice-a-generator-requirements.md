# SDD-002 Slice A — Generator goals and verifiable requirements

Sprint: Desk start and Grete call

## Player decision under test

Does the player understand that the bekymringsmelding creates one concrete first action, Ring Grete, and that Frank contact produces a report which unlocks the next casework options?

## Generator interpretation

The build should not optimize for architecture first. It should create a playable player-facing seam:

```text
Bekymringsmelding → click Frank → Ring Grete → obscured Frank phone scene → Frankrapport · Første kontakt → next casework actions
```

## Verifiable requirements

- [x] **desk_start** — Start at Case Desk with Bekymringsmelding and Etabler kontakt med Grete.
- [x] **distinct_call_scene** — Ring Grete enters a distinct Frank phone scene rather than jumping straight to Apartment.
- [x] **obscured_contact** — The phone scene uses obscured bubbles/symbols/fragments, not a transcript.
- [x] **first_report** — Completing the scene creates Frankrapport · Første kontakt.
- [x] **next_actions** — Report unlocks Be om kontoutskrift and Avtal sosialt besøk.
- [x] **grete_contact_content** — The call/report shows concrete contact facts: Grete answers or leads the conversation, and Elling does not come to the phone.
- [x] **no_meta_player_explanation** — Visible copy avoids meta-describing the intended player conclusion or experience.

## Missing before evaluator happiness

- None detected by source scan.

## Generator stance

If missing items remain, build them before claiming PASS. Keep the first slice narrow: no resources resolution, no day advance, no apartment social visit.
