# SB-008 Tiny Adversarial Implementation Contract

## Goal
Make pressure/state objects read as **physical evidence + non-clinical condition label + consequence**, not as diagnoses or free-floating abstractions. The player should see, for example, `Shame` clinging to unopened bills under a newspaper before any system interpretation appears.

## Touch surface
- `src/domain/types.ts` — extend/rename pressure object shape so condition labels have concrete anchors, visible signs, and consequences.
- `src/content/phonePractice.ts` — rewrite at least five `phonePressureObjects` into the paired pattern.
- `src/components/PhonePracticeLab.tsx` — render the anchor-label relation visibly on room/stage/case-desk UI.
- `src/engine/phoneResolver.ts` — keep mechanics keyed by pressure IDs, but make reports cite observed anchors before interpretation.
- `src/stores/RootStore.tsx` — adjust only if UI state needs new fields.
- `src/engine/phoneResolver.test.ts` — lock the contract with tests.

## Non-goals
- Do not add DSM/clinical labels (`Anxiety`, `Depression`, `ADHD`, `trauma response`, `executive dysfunction`, etc.).
- Do not ban abstract/emotional labels; `Shame`, `Affliction`, `Restlessness`, `Silence`, `Relief`, and `Obligation` are allowed when anchored.
- Do not make purely abstract floating mental-state tags.
- Do not diagnose Elling/client through Frank or the case file.
- Do not redesign phone-practice mechanics beyond preserving pressure IDs and consequences.

## Player decision under test
Can the player choose support/approach by reading **what object the pressure clings to** and what it mechanically threatens, rather than by optimizing abstract clinical/system labels?

## Implementation requirements
1. Each player-facing pressure object has:
   - `conditionLabel` or equivalent non-clinical label;
   - concrete `objectLabel`/`roomAnchor`/case-desk anchor;
   - `visibleSigns` explaining why the pressure is present;
   - mechanical consequence fields such as blocks/worsens/attracts/softens/transforms.
2. Rewrite at least five objects, including the current phone set (`restlessness`, `shame`, `sleep_debt`, `unpaid_bill`, `hope`) and, if surfaced, `phone_fear`/`dignity_exposure`.
3. UI must show the pairing in one glance: **anchor/object first, floating condition label attached to it**, then consequence/read.
4. Frank reports must remain cautious: observed anchor → possible pressure/situation → consequence. Never diagnosis.
5. Existing support coverage/resolver behavior may keep internal IDs, but player-facing copy must use the paired object-language.

## Verification gates
- Unit tests assert at least five pressure objects include non-empty anchor/object, condition label, visible signs, and consequence fields.
- Tests fail if player-facing pressure labels include banned clinical terms.
- Rendering/test coverage verifies each abstract label displays beside or under its concrete anchor, not alone.
- Resolver/report test asserts Frank cites concrete evidence before interpretation.
- Manual UI pass: no unanchored `Shame`/`Restlessness`/etc.; no DSM labels; Frank stays observational and cautious.

## Artifact paths
- Contract: `docs/SB-008-adversarial-implementation-contract.md`
- Issue source: `.pm/data/items/SB-008.md`
- Likely implementation files: `src/domain/types.ts`, `src/content/phonePractice.ts`, `src/components/PhonePracticeLab.tsx`, `src/engine/phoneResolver.ts`, `src/stores/RootStore.tsx`
- Likely verification file: `src/engine/phoneResolver.test.ts`
