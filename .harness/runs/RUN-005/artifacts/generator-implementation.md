# Generator implementation note

No gameplay code was changed in this adapter smoke. The implementation phase delegates evidence gathering to the configured project verifier and expects the evaluator to judge that evidence.

Agreed contract:

```json
{
  "title": "Slice A generic harness adapter definition of done",
  "summary": "The adapter run is done when the generic harness shows an agreed contract, project-owned verifier evidence, and an evaluator judgment over the existing Slice A player flow.",
  "deterministicChecks": [
    "npm test passes",
    "npm run build passes",
    "Local Vite web UI serves index.html",
    "Visible/source evidence contains bekymringsmelding, Ring Grete, Frankrapport, kontoutskrift, sosialt besøk, and avoids banned meta copy"
  ],
  "qualitativeChecks": [
    "Slice A remains narrow: desk → Grete call → Frank report → next actions",
    "The report and next actions are game-world surfaces, not design explanation",
    "The harness report exposes what planner/generator/evaluator/verifier did"
  ],
  "evidence": [
    "web-ui-smoke verifier",
    "report.html raw IO drilldown",
    "report.json normalized summary"
  ],
  "nonGoalsAccepted": [
    "Do not implement Slice B gameplay in the adapter smoke",
    "Do not introduce a fourth implementor role",
    "Do not let generator emit final verdicts",
    "Do not use project-specific logic inside the generic agent-harness package"
  ]
}
```
