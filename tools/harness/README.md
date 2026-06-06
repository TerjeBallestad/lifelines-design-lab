# Lifelines Design Lab Harness Adapter

This repo uses the generic `/Users/godstemning/dev/agent-harness` package. The project owns the adapters here; the package owns only protocol/state/reporting.

## Run

```bash
/Users/godstemning/dev/agent-harness/bin/harness run "Verify current Slice A through generic harness" --config harness.config.json
```

Default mode is deterministic fallback so CI/local smoke runs do not spend agent calls. To let a role use Codex, set:

```bash
HARNESS_CODEX_LIVE=1 /Users/godstemning/dev/agent-harness/bin/harness run "..." --config harness.config.json
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
- screenshot capture for the start/call/report/finance states
- browser console error checks
- Slice A visible/source checks for required terms and banned meta-copy

It emits artifacts under `.harness/runs/RUN-*/artifacts/` for the evaluator and report.

## Current limitation

This is now a real browser clickthrough, but still a narrow Slice A verifier. Slice B should extend the same verifier style instead of broadening the generic harness package: click the new casework action, capture the resulting desk/apartment evidence, and emit claim/evidence pairs for the evaluator.
