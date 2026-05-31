# SB-007 adversarial implementation contract

## Goal

Make the design lab stop sounding like a systems dashboard wearing a room. Visible copy should move toward the two reference notes Terje named:

- `Lifelines Social Realist 3D Life-Sim Spine`
- `Ingvar Ambjørnsen - Elling Voice for Lifelines`

The target is not more literary frosting. The target is clearer social-realist play language: the apartment shows what happened; Frank interprets cautiously; Elling's barks can be pompous, funny, and defensive, but UI labels should be plain enough to guide a player.

## Source constraints

From the social-realist spine:

- The game is a Norwegian social-realist 3D life-sim about casework.
- The Case Desk chooses where state attention goes; the apartment sim shows what attention did.
- Tone target: mundane surface, absurd self-justification, bureaucratic pressure, quiet tenderness, tiny visible change.
- Weak: `Phone practice failed. Trust -2. Knowledge +1.`
- Strong: behavior/resistance first, concise field-report interpretation after.
- Do not let the desk explain everything the apartment failed to show.
- Do not make Elling a clown; absurd defenses should be about 30% true and 70% self-protection.

From the Ambjørnsen/Elling voice note:

- High register on low subject.
- Pronouncements, not plain observations.
- Self-aware grandiosity with melancholy underneath.
- Specific concrete nouns; no floating abstraction.
- Pomp is for Elling speaking about himself; Frank and UI do not borrow that voice.
- The note itself is provisional; do not overfit into parody.

## Touch surface

Allowed files:

- `src/components/PhonePracticeLab.tsx`
- `src/content/phonePractice.ts`
- `src/engine/phoneResolver.ts`
- `src/engine/phoneResolver.test.ts`
- `docs/runs/SB-007/generator-notes.md`

Avoid schema/model churn unless a test absolutely needs a helper export.

## Non-goals

- Do not resurrect or merge the SB-008 map-overlay branch.
- Do not add new systems, new panels, or a new dashboard.
- Do not make all copy florid/Ambjørnsen. UI and Frank should get plainer, not weirder.
- Do not remove all internal technical concepts from code; only player-facing/rendered copy is in scope.
- Do not invent clinical/DSM labels.

## Player decision under test

Can a player choose what Frank brings into the room and what phone practice to try without reading words like `support topology`, `readiness`, `outcome`, `coverage`, `vulnerability topology`, `state objects`, or `carried weakness`?

## Implementation requirements

1. Replace rendered systems labels with room/caseworker language.
2. Keep Elling's barks vivid, but remove lines that feel like faux-literary AI weirdness rather than social-realist resistance.
3. Make support choice copy read like what Frank actually does in the apartment.
4. Make result/report copy say what was observed first and what Frank thinks it means second.
5. Add tests that scan rendered/source-visible player-facing copy for banned systems terms.
6. Add at least one test that preserves the useful Ambjørnsen rule: Elling barks are concrete, phone/apartment anchored, and not clinical/systemic.

## Banned rendered/system-surface terms

Outside dev/debug docs, rendered app copy should avoid:

- `support topology`
- `readiness`
- `outcome`
- `coverage`
- `vulnerability topology`
- `state objects`
- `pressure object`
- `carried weakness`
- `phone resistance room`
- `run phone attempt`

Allowed internally in variable names/tests if needed, but not in text the player sees.

## Verification gates

- `npm run format`
- `npm run lint`
- `npm test`
- `npm run build`
- Browser/visual pass: copy should read plainer and less weird than the previous version.
- Evaluator review must compare against both reference notes, not just the issue text.
