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
- local Vite serving smoke
- Slice A visible/source checks for required terms and banned meta-copy

It emits artifacts under `.harness/runs/RUN-*/artifacts/` for the evaluator and report.

## Current limitation

The web verifier proves local serving and source/visible-term constraints, but it is not yet a real browser clickthrough. The next upgrade should swap this verifier for Playwright or another browser driver that clicks `Ring Grete`, completes the Frank call, and captures screenshots.
