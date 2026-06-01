# SB-013 generator notes

## Implemented

- Added explicit lab modes:
  - `Apartment clocks`
  - `Case Desk`
- Added store state for desk evidence selection and desk-to-apartment vedtak application.
- Added a first Roottrees-inspired desk surface:
  - Frank report document;
  - telephone note document;
  - selectable evidence chips;
  - claim buckets: confirmed / hypothesis / open question / contradiction;
  - a possible vedtak that returns the next justified attempt to Apartment mode.
- Added regression tests for:
  - linked Apartment ↔ Case Desk state;
  - visible evidence/vedtak language;
  - existing language guardrails.

## Deliberate shortcuts

- No graph editor.
- No drag/drop evidence board.
- No persistent case file model.
- Desk evidence is derived from latest attempt only.
- The first unlocked vedtak uses `latest.nextApproachIds[0]` rather than a richer claim solver.

## Why this is enough for the harness test

The spike proves the loop shape:

```text
Apartment attempt → Frank/evidence document → selected evidence → claim board → next vedtak back to Apartment
```

That is the harness-worthy seam. The actual Roottrees depth can come later if this feels right in use.
