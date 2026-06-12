# Lifelines Design Lab Harness Adapter

This repo uses the generic `/Users/godstemning/dev/agent-harness` package. The project owns the adapters here; the package owns only protocol/state/reporting.

## Run

```bash
/Users/godstemning/dev/agent-harness/bin/harness run "Verify current Slice A through generic harness" --config harness.config.json
```

Live Codex is the default — a role that cannot complete a real Codex run exits non-zero and the harness records `INFRA_FAIL`. For CI/local plumbing smoke without spending agent calls, use the harness dry-run flag (the only sanctioned way to get scripted role output, and the run is visibly stamped DRY RUN):

```bash
/Users/godstemning/dev/agent-harness/bin/harness run "..." --config harness.config.json --dry-run
```

The same three roles are used throughout:

- `planner` frames the smallest sprint.
- `generator` proposes/revises the definition of done, then implements against the agreed contract.
- `evaluator` attacks the contract before implementation and reviews verifier evidence afterward.

The generator never emits the verdict.

## Evidence

`tools/harness/web-ui-smoke.mjs` is the first project-owned verifier adapter. It runs:

- `npm test`
- `npm run build`
- local Vite serving
- Playwright Chromium clickthrough:
  - `Case Desk`
  - `Ring Grete`
  - `Frank på telefon`
  - `Legg rapporten på pulten`
  - `Frankrapport · Første kontakt`
  - `Be om kontoutskrift`
  - `Kontoutskrift bestilt`
  - `Ny dag`
  - `Dokument: Kontoutskrift`
  - `Avtal sosialt besøk`
  - `Gjennomfør sosialt besøk`
  - `Sosialt besøk hos Grete`
  - `Skriv besøksnotat`
  - `Besøksnotat: Grete bærer rommet`
  - `Se på posten under avisen`
  - `Snakk lavt med Elling`
  - `Bevis fra leiligheten`
  - `Nytt skrivebordsgrep`
  - `Foreslå praktisk avlastning`
- screenshot capture for the start/call/report/finance/social-visit/observe-decision states
- browser console error checks
- visible/source checks for required terms and banned meta-copy

It emits artifacts under `.harness/runs/RUN-*/artifacts/` for the evaluator and report.

## Current limitation

This is now a real browser clickthrough through Slice D. The verifier remains intentionally narrow and project-owned. Slice E should extend the same adapter only when there is a new concrete player decision to prove; do not add generic dialogue or relationship systems unless the evidence changes a desk action.
