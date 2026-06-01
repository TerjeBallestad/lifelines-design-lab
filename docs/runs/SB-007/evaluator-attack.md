# SB-007 evaluator attack

## Pre-implementation verdict

The contract is necessary because the lab is drifting into bad middle language: neither playable UI nor good prose. The biggest danger is that a language sprint becomes _more_ writerly. That would fail.

## Reject if

1. The implementation merely swaps English systems terms for Norwegian abstractions.
   - Bad: `support topology` → `omsorgsarkitektur`.
   - Better: `Hva Frank tar med inn`.
2. The UI borrows Elling's pomp voice.
   - Elling may pronounce.
   - Frank observes.
   - UI guides.
3. Frank becomes omniscient or therapeutic.
   - He should say what he saw, then a cautious read.
4. The room remains secondary to report text.
   - If the report carries the whole payoff, SB-007 failed.
5. The copy becomes cute.
   - Ambjørnsen is not whimsy. There is embarrassment, pride, and loss under the comedy.
6. The tests only scan one file or only assert that a few strings disappeared.
   - Player-facing copy lives in content, component labels, and resolver reports.

## Hard questions for the generator

- What would this label mean to a player who has not read our design notes?
- Is this Frank's language, Elling's language, UI language, or internal code language?
- Does the sentence name a thing in the room, an action, or an observed behavior?
- If it is poetic, is it still attached to a kettle/phone/door/chair/letter/person?
- Did we make the game clearer, or just more atmospheric?

## Minimum PASS

- The obvious bad strings are gone from rendered/player-facing copy.
- The main loop reads roughly as: choose Frank's setup → choose what to try → spend a die → try it → read what happened.
- Result copy starts with visible behavior, then interpretation.
- Elling barks keep high-register resistance but are concrete and not parody.
- Tests prevent the worst regression: systems dashboard language returning as visible copy.

## Preferred replacement direction

- `Phone Resistance Room` → `Phone practice in the sitting room`
- `Setup support` → `Where Frank stands`
- `Compose support topology` → `What Frank brings into the room`
- `Pick activity framing` → `What to try today`
- `Assign one daily die` → `Spend today's attention`
- `Run phone attempt` → `Try the phone practice`
- `Carried weakness` → `What the plan leaves exposed`
- `State objects on the table` → `Things Frank is watching`
- `Citizen clocks / phone activity` → `Practice paths`
- `Readiness` → `What the room allowed today`
- `Outcome` → `What happened`
