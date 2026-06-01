# SB-013 evaluator review

## Verdict

PASS for harness-readiness, with taste caveats.

The issue was a good test target for the new thin harness because it forced a real interface seam instead of only copy work. The implementation now has a concrete two-surface loop:

```text
Apartment clocks create evidence.
Case Desk evidence justifies a next vedtak.
Vedtak returns to Apartment.
```

## What passed

- The lab no longer reads as one undifferentiated dashboard.
- The Case Desk is not merely static architecture text; it receives the latest attempt.
- Evidence selection changes the desk state and unlocks a possible vedtak.
- The desk language stays mostly casework/evidence-shaped rather than DSM/diagnosis-shaped.
- Tests protect the new state flow.

## Caveats

- The desk is still thin. It is Roottrees-inspired, not Roottrees-good.
- Claim buckets are hardcoded and always visible; a later spike should make claims emerge from selected evidence more sharply.
- The phone clock itself still inherits old generic approach options. SB-004/SB-005 should rewrite that toward the actual `ring ring` sequence.
- Browser interaction worked on `127.0.0.1:8792`; the browser console tool reported anonymous stale exceptions from earlier HMR, but the app rendered and interaction flow completed.

## Next evaluator attack

For SB-004/SB-005, reject anything that keeps phone practice as generic support/friction variables. The next spike should make the apartment side explicitly staged:

```text
Frank says ring ring
Elling picks up / blurts / hangs up
Frank calls while present
Frank calls from another room
Phone ability opens bill/sex-line risk
```
