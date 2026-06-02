# SB-013 evaluator attack

## Pre-implementation verdict

The contract is pointed enough to test the harness, but the issue is risky because it can easily become a UI reorganization instead of a gameplay proof.

The evaluator should be hostile to fake integration.

## Reject if

1. **Tabs exist but nothing flows.**
   - Bad: Apartment tab and Desk tab share no state except both reading `latestAttempt`.
   - Better: an attempt creates desk evidence; a desk claim unlocks or recommends a next apartment move.

2. **Desk becomes a quest log.**
   - Bad: checklist of `Phone practice complete` / `Open next task`.
   - Better: evidence phrases become claims with uncertainty.

3. **Desk becomes diagnosis.**
   - Bad: `Elling has phone anxiety`.
   - Better: `Frank has seen that dummy practice works better than direct real calls.`

4. **Apartment clocks are decorative.**
   - Bad: progress bars that do not reflect the attempt.
   - Better: one staged phone practice clock visibly advances from the latest attempt.

5. **No humorous contradiction.**
   - If progress cannot also create a new problem, SB-013 dodges the real design lesson.

6. **The implementation overbuilds.**
   - A Roottrees-inspired board is enough. A draggable graph editor is swamp behavior.

## Hard questions for the generator

- What did the player learn on the Desk that was not already obvious in the Apartment?
- What can the player do next because they selected/confirmed evidence?
- Is the output a vedtak/tiltak, or just a “recommended action” in generic app language?
- Does the Desk preserve uncertainty?
- Does the Apartment still feel like a life-sim surface rather than a form?

## Minimum PASS

- Apartment/Desk modes exist.
- Running a phone attempt creates at least one desk evidence document/chip.
- Selecting evidence changes a claim board.
- The claim board unlocks or visibly justifies at least one next practical step.
- Tests cover the state flow.
- UI copy avoids omniscient diagnosis and generic dashboard terms.

## Preferred first desk content

Use the phone sequence, not a new content universe:

- evidence document: Frank report from latest attempt;
- selectable chips: `dummy practice tolerated`, `hangs up quickly`, `Frank can call from next room`, `bill risk not yet handled`;
- claim: `Phone contact is becoming possible, but contact boundaries are not established`;
- justified next steps: continue dummy practice, real call from another room, open phone bill, set phone boundary.
