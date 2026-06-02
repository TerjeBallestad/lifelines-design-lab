# SB-013 adversarial implementation contract

## Goal

Test the design-lab harness on the first issue that should shape the next generation of the lab:

> Apartment = Citizen Sleeper clocks. Desk = Roottrees board.

The implementation should not solve the full final game. It should prove the two-interface loop in the cheapest believable way:

```text
Apartment clock attempt → evidence document → desk claim → next vedtak/tiltak option
```

## Source issue

`SB-013 — Two-interface lab: Apartment clocks + Roottrees desk`

## Player decision under test

Can the player understand that there are two linked modes of play?

1. **Apartment:** spend a die on a concrete life-practice clock.
2. **Desk:** read evidence from what happened, select/claim what matters, and unlock the next practical step.

## Touch surface

Allowed files:

- `src/components/PhonePracticeLab.tsx`
- `src/stores/RootStore.tsx`
- `src/domain/types.ts`
- `src/content/phonePractice.ts`
- `src/engine/phoneResolver.ts`
- `src/engine/phoneResolver.test.ts`
- `docs/runs/SB-013/*`

Prefer UI/state additions over resolver churn unless evidence needs a small typed helper.

## Minimum implementation shape

1. Add two visible lab surfaces or tabs:
   - `Apartment`
   - `Case Desk`
2. Apartment mode centers the current phone room attempt and practice clocks.
3. Case Desk mode shows at least:
   - one Frank report / evidence document from the latest attempt;
   - selectable evidence phrases/chips;
   - a small claim board with confirmed/hypothesis/open question/contradiction style buckets;
   - one justified next vedtak/tiltak option unlocked by selected evidence.
4. Attempt results must feed the desk. The desk must feed back into the next apartment choice, even if the first implementation is hardcoded.
5. Add tests that protect the two-interface model and evidence→claim→tiltak loop.

## Non-goals

- No full Roottrees clone.
- No graph editor.
- No content authoring tool.
- No multi-client desk.
- No final visual design.
- No broad architecture screen that only explains the loop without making it clickable.

## Lifelines pressure

The spike must keep the three pillars visible:

- **Empatisk nysgjerrighet:** evidence should make Elling more understandable, not diagnosed.
- **Tilfredsstillende vekst:** the apartment clock should show a small concrete practice gain.
- **Humoristisk kontrast:** progress should preserve the possibility of a ridiculous/inconvenient complication.

## Verification gates

- `npm run format`
- `npm run lint`
- `npm test`
- `npm run build`
- Browser pass: switch Apartment/Desk, run one attempt, verify evidence appears on desk and can justify a next step.

## PASS condition

PASS if the lab no longer reads as one large dashboard and instead clearly demonstrates:

```text
Apartment clocks produce evidence.
Desk evidence produces a sharper next tiltak.
```

## REVISE condition

REVISE if the tabs exist but the desk is decorative, the Apartment side still owns all decisions, or the evidence does not affect anything.

## DISCARD condition

DISCARD if the implementation is just a static architecture diagram, an omniscient diagnosis screen, or a generic quest log.
