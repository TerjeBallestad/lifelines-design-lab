# Lifelines Design Lab Next Steps

> Working design notes for the Phone Resistance Room direction. Do not treat this as a fixed backlog. This is a compact SDD-style research synthesis for deciding the next slices.

## Source references

- `lifelines-tycoon` branch: `spike/vulnerability-topology-html`
- Vault note: `Rock Paper Scissors 2 - Vulnerability Topology for Lifelines`
- Vault note: `Lifelines Social Realist 3D Life-Sim Spine`
- Vault note: `Ingvar Ambjørnsen - Elling Voice for Lifelines`
- Vault note: `Cultist Simulator Guide - Onboarding and Pressure`
- Citizen Sleeper screenshot reference: clocks, dice slots, action panels, pressure cards

## Design stance

The lab should not become a dashboard that explains the design. The apartment should perform the design, and the case desk should interpret what the apartment already made visible.

The strongest current thread is:

```text
support composition
→ visible carried weakness
→ dice-backed phone practice
→ apartment resistance / small success
→ persistent case knowledge
→ next support decision
```

The player-facing question should be:

> What did Frank bring into the room, and what did that still leave exposed?

Not:

> Which support topology maximizes readiness?

## 1. Ground visible state objects as concrete room/table things

### Why

If the UI leads with abstract labels like `Skam`, `Søvngjeld`, or `Phone fear`, the design drifts back toward diagnosis language. Lifelines needs state objects, but they should first appear as concrete apartment/case-desk things.

### Shape

Each state object should have two layers:

1. **Concrete object** — what the player sees.
2. **Frank’s functional read** — what it may mean for planning.

Examples:

| Abstract pressure | Concrete object first | Functional read |
| --- | --- | --- |
| Shame | NAV envelope under the newspaper | Paperwork becomes public when Frank stands too close. |
| Sleep debt | cold coffee cup / unmade bed / drawn curtains | The bad night is still in the room. |
| Hope | Grete’s handwritten note beside the phone | Positive state is fragile if unsupported. |
| Unpaid bill | brown envelope with deadline | Bureaucracy is concrete and timed. |
| Phone fear | receiver position, script card, distance from chair | The phone is transition, improvisation, and audience. |

### Acceptance

- UI cards lead with object names, not abstract state names.
- Overlay labels attach to props, not floating mental-state tags.
- At least five pressure objects have concrete `objectLabel`, `visibleState`, `roomAnchor`, and `functionalRead` fields.

## 2. Pull visible copy back to Ambjørnsen / social-realist room language

### Why

The prototype still leaks systems language: `support topology`, `readiness`, `outcome`, `state objects`, `pressure`, `carried weakness`. Useful internally. Wrong as the main surface.

### Replace toward

| Current-ish | Better direction |
| --- | --- |
| Support topology | What Frank brings into the room |
| Readiness | What the room allowed today |
| Outcome | What happened |
| Carried weakness | What the plan left exposed |
| Run phone attempt | Try the phone practice |
| State objects on the table | Things on the table |
| Citizen clocks / phone activity | Practice paths |
| Phone fear | the phone on the side table |
| Sleep debt | the bad night still in the room |

### Acceptance

- Rendered UI avoids `support topology`, `readiness`, `outcome`, `coverage`, `vulnerability topology`, and `state objects` outside dev/debug contexts.
- Visible labels name concrete objects, room conditions, caseworker observations, or plain actions.
- Frank reports cite observed room evidence before interpretation.

## 3. Make support-pair blind spots first-class decision cards

### Why

The vulnerability-topology spike’s useful question is:

> Which weakness are we willing to carry today?

The lab currently shows carried weaknesses as badges. That is legible to us, but not yet a good player decision.

### Shape

For the selected two-support plan, show a small caseworker card:

- what the plan protects
- what the plan leaves exposed
- one behavior sentence
- one room sign to watch for

Example:

> Practical help + sidewise humor gives Elling something to hold and a way to mock the exercise. It still leaves dignity exposed: the script can start to look like an inspection.

### Acceptance

- Every two-support pair shows at least one readable exposed weakness.
- No pair appears fully safe.
- A test verifies every possible two-support pair has at least one carried weakness.

## 4. Turn failure into persistent case-file knowledge

### Why

A closed bedroom door should be a paragraph, not just punishment.

The lab has immediate scene evidence, but it needs persistent case learning. Failure should often pay more knowledge than success.

### Shape

Failed or strained attempts add case-file entries such as:

- `When Frank stands near the phone, support can become an audience.`
- `A tiny ask can become enormous when the bad night is still in the room.`
- `The script helps only if the room does not turn it into an exam.`

### Acceptance

- Negative/strained outcomes add richer case-file entries than clean success.
- Entries are behavior sentences, not numeric deltas.
- Repeated attempts do not spam duplicates.
- Scene Evidence remains immediate; Case File persists across attempts.

## 5. Make phone mastery clocks advance from visible room evidence

### Why

Citizen Sleeper clocks fit Lifelines if they become practice paths, not decorative progress bars.

Phone mastery should move because Elling visibly did something in the apartment:

- stayed near the phone
- used a script
- tolerated the ring
- completed a small call window

### Evidence-to-clock sketch

| Evidence | Clock effect |
| --- | --- |
| `looked_at_phone` | tiny progress on tolerate ringtone |
| `approached_phone` | progress on active practice path |
| `partial_practice` | meaningful progress |
| `completed_call_window` | major progress |
| `script_state: used` | progress on first sentence |
| `retreated_to_bedroom` | no mastery tick; may advance pressure |

### Acceptance

- At least one activity clock can gain progress after an attempt.
- Partial practice fills less than completed practice.
- Retreat/anger does not reward generic mastery.
- Frank report can cite the specific practice path affected.

## 6. Turn dice slots into safe/risky/locked phone practice commitments

### Why

Citizen Sleeper works because the die is placed into a specific action slot with visible stakes. Lifelines should use that pattern to make the player choose what kind of phone practice today’s capacity is spent on.

### Shape

Each practice path slot defines:

- `safe`, `risky`, or `locked`
- requirement if locked
- effect on room permission / progress
- pressure side effect

Examples:

- `Tåle ringelyden`
  - safe: any die, small progress, protects dignity
  - risky: die 4+, more progress, may trigger shame if Frank is too close
- `Første setning`
  - safe: requires script placed
  - risky: more mastery, more dignity exposure on failure
- `Ringe Grete`
  - risky by default
  - safer only after trust/support conditions improve

### Acceptance

- Player chooses a specific practice path + slot before trying.
- Safe and risky slots produce different evidence/pressure effects.
- Locked slots explain what is missing in plain language.

## 7. Make pressure clocks mutable and evidence-driven

### Why

The Cultist lesson is not occult cards. It is visible pressure with timers and transformations.

If the bedroom door closes, shame/sleep debt should move. If the unopened bill stays untouched, bureaucracy should get closer.

### Evidence-to-pressure sketch

| Evidence | Pressure movement |
| --- | --- |
| `retreated_to_bedroom` | advance shame / sleep debt / phone fear |
| `anger_at_frank` | advance dignity exposure; reduce trust |
| `framed_as_pointless` | advance phone fear or hope decay |
| high `delayed_seconds` | advance restlessness |
| carried unpaid bill + no practical help | advance unopened bill |
| `completed_call_window` | soften phone fear / hope / unpaid bill |
| `script_state: used` | soften phone fear / dignity exposure |

### Acceptance

- At least three pressure clocks can change after an attempt.
- Changes come from concrete evidence, not generic outcome class only.
- Positive practice can soften or hold pressure.
- Apartment stage and case desk agree about what moved.

## Preferred implementation order

1. Concrete objects first.
2. Copy/register pass.
3. Support-pair exposed weakness cards.
4. Persistent case-file knowledge.
5. Evidence-driven mastery clocks.
6. Safe/risky/locked dice slots.
7. Mutable pressure clocks.

This order protects the work from becoming a polished systems dashboard before it becomes Lifelines.
