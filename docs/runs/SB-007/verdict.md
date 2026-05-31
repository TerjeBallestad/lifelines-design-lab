# SB-007 verdict

## Verdict: PASS

The SB-007 language sprint passes after one evaluator-driven revision.

## What changed

- Closed the rejected SB-008 overlay PR instead of merging a version Terje did not think was better.
- Recentered the lab on language and scene readability.
- Replaced the visible dashboard/process layer with plainer room/casework language.
- Removed obvious player-facing terms such as:
  - `support topology`
  - `phone resistance room`
  - `run phone attempt`
  - `carried weakness`
  - `state objects`
- Prevented raw internal values from leaking into the UI:
  - anchors such as `phone`, `chair`, `desk` now render as room objects;
  - actors such as `Room` now render as `Stua`;
  - outcome/script/friction values now render through copy maps.
- Tightened Frank reports so they observe the room before interpreting.
- Kept Elling's barks concrete and phone/apartment anchored.

## Verification

- `npm run format` passed.
- `npm run lint` passed.
- `npm test` passed: 8/8.
- `npm run build` passed.
- Browser preview loaded with no console errors.

## Harness lesson

The adversarial loop worked here.

The first generator pass looked acceptable by static tests but failed evaluator review because raw runtime values still leaked into rendered copy. The revision forced the harness to test a sharper rule: not just “bad strings absent,” but “internal state does not become player-facing language.”

That is exactly the kind of lesson worth migrating into `pm` later.
