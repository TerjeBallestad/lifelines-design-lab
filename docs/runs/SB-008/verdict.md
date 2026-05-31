# SB-008 verdict

## Verdict: PASS

The slice does what the issue asked after one evaluator-driven revision.

## What changed

- Pressure/state objects now pair:
  - concrete room/case anchor;
  - non-clinical condition label;
  - visible signs;
  - mechanical consequence text.
- Player-facing labels keep the Cultist-like abstraction: `Skam`, `Rastløshet`, `Tåke`, `Forpliktelse`, `Lettelse`, `Terskel`, `Blottstillelse`.
- The app avoids obvious DSM/clinical labels in the scanned player-facing design-lab corpus.
- The apartment stage now shows more concrete anchor objects and places condition labels beside them.
- Frank reports cite observation before cautious pressure interpretation.

## Verification

- `npm run format` — pass
- `npm run lint` — pass
- `npm test` — pass, 10/10
- `npm run build` — pass
- Browser preview loads and shows the anchor-label overlays.
- Visual pass: labels are readable enough for a spike; map is dense but not blocked.

## Design lesson

The useful rule is not “avoid abstract labels.” It is:

> physical evidence + atmospheric condition label + mechanical pressure

A pile of unopened bills under the newspaper with `Skam` floating on it is stronger than either a mundane object label or a clinical diagnosis.

## Remaining risk

The room map is crowded. If this grows, labels need leader lines, filtering, or a stronger spatial overlay system. Do not keep adding labels to the current map indefinitely.
