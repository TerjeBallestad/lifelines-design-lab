# Ti dager

The SDD-012 probe. Ten days, one door opening. Clean spine, no Olsen pack.

## Run

```
npm run dev
open http://127.0.0.1:5173/prototypes/ti-dager/
npx vitest run prototypes/ti-dager
```

The page saves your game in the browser. "Start på nytt" wipes it.

## Files

- `case.json` is the whole case. This is the file to write in.
- `engine.js` is the pure game engine. No DOM.
- `validate.js` checks `case.json` for dangling ids, unreachable content and banned typography.
- `index.html` is the desk. It only renders what the engine says.
- `engine.test.js` runs the validator, an idle run and the golden path.

## Writing in case.json

Prose is markdown-lite: paragraphs on blank lines. A fact anchor is a link, `[visible text](f_id)`.
Clicking it lifts the fact card. Anchors work in documents, call lines and visit beats.

Conditions are one grammar everywhere (`when`, `avail`, `advance`, `setback`):
`has f_x`, `fired t_x`, `visited v_x`, `called c_x`, `door >= n`, `day >= n`, `witnessed`, `any_visit`.
Prefix with `not`, join with `and`.

The door ladder is hidden state, 0 to 4: stille, ved døren, snakker gjennom døren, døren på gløtt,
slipper Frank inn. Visits read it and may move it one step. The Elling call reads it and never moves it.

Shapes:

- `documents.<id>`: kind, from, title, text. Delivered by triggers, visits or the opening.
- `facts.<id>`: label, and `frank.line` plus `frank.unlocks.{call|brief}`.
- `calls.<id>`: to, avail, once, `unlock: "frank"` if Frank must unlock it, start and nodes with lines and replies.
  A `ladder` call has one line per door step instead of nodes.
- `visits.<id>`: brief, avail, repeat, scene, beats (with `when`), advance, setback, notat variants, delivers.
  `scene: false` means no beats, the paper lands tomorrow.
- `triggers[]`: id, when, floor, ceil, effect `{doc|report|brief|call|door|frank}`. Evaluated at Avslutt dagen.
- `case.verdicts[]`: label and pages, first matching `when` wins, last page has no `when`.

Typography: straight quotes and hyphens only. The validator rejects em dashes, guillemets, middle dots and curly quotes.

## This copy: trick-taking calls

The Grete call is a trick. She leads a claim card with a suit and a rank. You answer with one
untapped card from your hand, or say nothing. Same suit and higher rank wins the trick. Same suit
otherwise follows. Another suit is off. Each outcome is authored per claim in `calls.call_grete.claims`,
as a list of variants picked by `when` (`flag cold` is available). A played card is tapped until
tomorrow and shows sideways in the hand. Frank still takes any card, tapped or not.

Suits: helse, penger, evner, kontakt, bolig. Rank 3 is paper, 2 is Frank's notat, 1 is something said.
