# PM PLAN Contract

<!-- Adapted from lifelines-core-loop plan/references/pm-plan-contract.md. GATH/Godot examples are replaced with vitest/TypeScript equivalents. -->

`/plan` outputs PM-native JSON. Do not invent a parallel schema and do not use harness sprint JSON as the planning artifact.

## D1 verification field: the judge stanza

In D1 plans, each task is a requirement (a user-visible outcome) and `verification` carries a judge stanza per the lab judge ladder in SKILL.md:

```text
judge: compiler | test | pipeline | screenshot | terje
command: <exact invocation, or playable-question for the terje rung>
proves: <what this rung actually proves>
fake_evidence: <what would look like proof but is not>
```

## Required shape

```json
{
  "title": "PLAN-NNN — Short title",
  "sddId": "SDD-NNN",
  "sprintId": "SPRINT-NNN",
  "linkedItems": ["SB-NNN", "SDD-NNN"],
  "context": {
    "setupNotes": "...",
    "relevantFiles": ["src/path/to/file.ts"],
    "designDecisions": ["DD summary or source decision"]
  },
  "tasks": [
    {
      "title": "Task 1: Specific action-oriented title",
      "description": "What this task changes and why, including boundaries.",
      "steps": ["Concrete action", "Concrete action"],
      "verification": "Command-ready checks and expected evidence.",
      "blockedBy": []
    }
  ]
}
```

PM may add `id`, `passes`, `status`, and `progressNotes`. Do not depend on unsupported fields for essential requirements.

## Plan rules

- `title` names the production goal.
- `sddId` should be set when planning from an SDD.
- `sprintId` should be set when known.
- `linkedItems` should include source PM items that matter to execution.
- `context.setupNotes` carries design summary, SDD deviations, sprint grouping, evidence strategy, and global cautions.
- `context.relevantFiles` lists common files likely needed across tasks.
- `context.designDecisions` lists compact decisions, not long essays.

## Task rules

Each task must be executable by a cold agent reading `pm next-task PLAN-NNN`.

Required qualities:

- File paths are exact.
- Steps are actions, not goals.
- Verification is mechanical and command-ready.
- Same-file edits are serialized through `blockedBy`.
- Hidden state dependencies are explicit through `blockedBy` or `description`.
- New vitest tests include red-green verification requirements.
- Designer-facing tasks name visual/manual evidence (screenshot rung or above) or explicitly state why source authority defers it.
- Case-content tasks (anything under `content/cases/` or `scripts/blueprint/`) include the `pipeline` rung: `npm run case:check`.
- Tasks stay small enough for spec and code review.

Bad task:

```json
{
  "title": "Improve the case generator",
  "steps": ["Refactor code", "Make it work"],
  "verification": "Check it works"
}
```

Good task:

```json
{
  "title": "Task 2: Move evidence-link parsing into the shared markdown pass",
  "description": "Introduce one owner for fact-link extraction so the document renderer and the generator read the same links. Renderer-specific styling stays in the renderer; the old regex in generate-tiny-olsen-case.mjs may remain only as a compatibility shim while tests migrate.",
  "steps": [
    "Add a focused vitest test proving a [text](fact:f_id) link in document prose lands in both the rendered document model and the generated fact references.",
    "Run the focused test and confirm it fails against the current split parsing.",
    "Add the minimal shared parsing pass and route both consumers through it.",
    "Run the focused test and confirm it passes.",
    "Temporarily break the shared pass, confirm the test fails, restore, and add a red-green note."
  ],
  "verification": "judge: pipeline. command: npx vitest run scripts/blueprint/generate-tiny-olsen-case.test.mjs && npm run case:check. proves: parsing is single-owner and the generated case round-trips. fake_evidence: a green renderer-only test with the generator regex untouched.",
  "blockedBy": ["Task 1"]
}
```

`blockedBy` note: the `"Task N"` ordinal form is acceptable in the draft — current pm resolves ordinals to real `TASK-NNN` ids at `pm plan create`. Always verify after filing (`pm plan PLAN-NNN` must show `TASK-NNN` ids); older pm versions left ordinals unresolved, which silently stranded every dependent task.

## SDD deviations

If the plan intentionally diverges from the SDD mechanism, write it in `context.setupNotes`:

```markdown
## SDD Deviations

1. **MECHANISM_DEVIATION:** <what changed>
   - SDD says: ...
   - Plan does: ...
   - Reason: ...
   - Requires human decision: yes/no
```

A task merely existing is not enough. The plan must cover the requirement using the approved mechanism or surface the deviation.

## Sprint/evidence grouping inside PM fields

PM does not currently have native sprint/evidence subfields. Put grouping in `context.setupNotes` and task descriptions.

Example:

```markdown
## Implementation Slices

### Slice 1 — Contract tests
Evidence: focused vitest tests with red-green.
Tasks: 1–3.

### Slice 2 — Generator seam hardening
Evidence: focused tests + npm run case:check.
Tasks: 4–6.
```

Do not put essential requirements only into comments or unsupported JSON keys that executors will ignore.
