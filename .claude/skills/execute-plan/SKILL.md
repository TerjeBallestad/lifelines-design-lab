---
description: Execute a PM plan. Default = serial single-session (one mind implements every task in order, commits per task, stops at human gates). `wave` opt-in = parallel executor subagents for mechanical bulk plans.
argument-hint: "[PLAN-NNN] [wave]"
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Agent
---

# Execute Plan

`$ARGUMENTS` — PLAN-NNN (required) + optional mode keyword `wave`. If empty, list plans with pending tasks (`pm plans`) and ask.

Two modes:

- **SERIAL (default).** YOU implement every task yourself, in dependency order, in this one session. No executor subagents. This is the house default per the PLAN-092 A/B verdict (2026-07-07): a wave fleet produced hundreds of small cross-task inconsistencies — locally-defensible micro-decisions that never cohered; a single session holding the whole surface produced the version Terje kept. One mind = accumulated taste: the decision you make in task 3 carries to task 15.
- **WAVE (opt-in, `wave` keyword).** The old parallel-orchestrator mode. Legitimate ONLY for mechanical bulk: file-disjoint migrations, test repoints, content generation with exact instructions — work where taste is irrelevant and correctness is machine-checkable. Never for plans with player-facing surface tasks.

If the plan contains UI/scene/player-facing tasks and the user asked for `wave`, push back once with the A/B evidence, then obey.

## SERIAL mode

### Stage

1. `pm health` — unreachable → tell user to run `./start-pm.sh`, stop.
2. `pm get PLAN-NNN` — read title, context/setupNotes IN FULL (they carry load-bearing constraints: verified API names, off-limits files, single-writer chains, banned patterns), and all tasks with `status`/`blockedBy`/`progressNotes`.
3. `git status` — require a clean tree on the expected branch. Dirty → stop and ask.
4. **Compute the serial order** from `blockedBy` (topological; done tasks are satisfied dependencies — the command is naturally resumable mid-plan). Within a topological layer, prefer plan numbering.
5. **Mark the human gates:** any task whose description says HUMAN / feel-gate / Terje verdict. These SEGMENT the run — you implement up to a gate, prepare it, then STOP the whole run and report. Never implement past an unpassed human gate, never self-certify one.
6. Print the run plan: ordered task list, human gates marked as hard stops.

### Per task — implement

Two task shapes exist. **D2/legacy tasks** (explicit steps): work the task exactly as written — steps + verification are the spec. **D1 requirements** (gameplay outcome + judge stanza, few or no steps): you own the how — the requirement names WHAT must become real and which judge proves it; self-organize the implementation, author whatever GATH tests you need as instruments to get hands-on with the behavior. The point is the game working gameplay-wise, never the test being green — the judge stanza (`proves` / `fake_evidence`) is the success criterion. Load the `judge-ladder` skill.

House rules that override any shortcut instinct:

- **Re-read hot files fresh** before editing — line anchors in task steps drift as earlier tasks land.
- **Visual self-verification is mandatory** for anything player-visible: render the shot (shot_runner / ui_driver), OPEN IT, look at it at 100% before calling the task done. No tiny text (floor ~0.85x), no stylebox-less Buttons, reuse existing theme variations (resources/main_theme.tres, UITokens). You own cross-task cohesion — match the established surface grammar; do not invent a new style per panel.
- **Tests:** new GATH tests get red-green verification (break production, watch it fail, restore) + `## Verified red-green: <date>` stamp. Never weaken an assertion; skip + `pm issue` instead.
- **Full suite green before every commit** (`./tests/run_tests.sh`, exit 0). Know the plan's named pre-existing flakes; a red that isn't one of them is yours.
- **Atomic commit per task**, explicit paths (`git commit -m "feat: TASK-NNN — <summary>" -- path1 path2`).
- **`pm task-done PLAN-NNN TASK-NNN "<note>"`** after each commit — the note is the handoff for a resumed session: what landed, what deviated, decisions made.
- **Deviations:** small + faithful to intent → do it, record in the task-done note. Changes design intent → STOP and surface to the user; do not guess.
- **Sim-IOU rule:** any mocked sim behavior = `pm gap` + SDD register comment, as the task specifies. Never silent.

### At a human gate

1. Finish everything the gate blocks on; verify the gate's prep steps (gyms boot, drivers pass, shots taken).
2. Write the gate a briefing in its progress note: how to drive it, the concrete play-questions (never designer-frame abstractions).
3. STOP the run. Report: tasks done (commits), the gate that's waiting, how Terje starts it. The next `/execute-plan PLAN-NNN` resumes after the verdict is recorded.

### Close out

1. **End-gate review** (the maker≠checker seam — this is where adversarial review lives now, and where refactoring belongs; it is NOT part of the red-green loop). For any non-trivial plan, spawn two parallel review sub-agents over the full run diff, and do not merge or rerank their findings across axes:
   - **Spec axis:** does the diff deliver each requirement via the approved mechanism? Judge stanzas honest (gate ran / can fail / passed)? Any silent MECHANISM_DEVIATION?
   - **Standards axis:** repo conventions (buses, `*_requested` seams, ui-conventions) plus the Fowler smell baseline — Feature Envy, Primitive Obsession, Shotgun Surgery, Divergent Change, Speculative Generality, Message Chains, Middle Man, Data Clumps, Long Parameter List, Large Class/Long Function, Refused Bequest, Inappropriate Intimacy. Named smells are judgement calls ("possible Feature Envy"), not verdicts; skip anything tooling already enforces.
   Apply the fixes that survive your triage; commit as its own review commit.
2. **Post-run reconciliation** (done-marks are proxies, not the goal): full suite green (`./tests/run_tests.sh` exit 0) · tree clean (no stray `.uid`/`.tres`/pm-data churn) · every gate actually ran and can fail · player-visible requirements have their above-`gath` evidence rendered and LOOKED AT.
3. All tasks done → `pm patch PLAN-NNN --stage done` (leave the owning SDD's stage to the user unless the plan was its last work).
4. Final report: task list with commits, review findings applied/skipped, final suite result, shots taken, issues/gaps/concerns filed, deviations accepted, anything awaiting human review.
5. Partial run → report exactly where you stopped and why; PM state carries the resume point.

## WAVE mode (opt-in)

You orchestrate; `plan-task-executor` subagents implement. Use only for mechanical bulk (see above).

1. Stage as in serial mode, then **compute waves** from `blockedBy` (topological layers) and **serialize same-wave tasks that plausibly touch the same file**.
2. **Model per task:** default `opus`; `sonnet` for mechanical work. Pass `model` explicitly per Agent call (the executor definition pins opus). Print the wave table before dispatching.
3. **Dispatch** a wave in ONE message (parallel Agent calls). Each prompt carries: the full task inline, the plan's setupNotes, dependency progress notes, `PARALLEL`/`SOLO` flag, the plan id.
4. **Verify per wave** (your most important job): parse `DONE:`/`DEVIATED:`/`BLOCKED:`; run the full suite ONCE (orchestrator-only — concurrent full runs corrupt the shared summary); diff-review every commit (no weakened assertions, fresh red-green stamps, only plausible files, task-done recorded, no leftover scaffolding).
5. **Line-stop:** suite red without an obvious culprit or after one redo; any weakened assertion / fake red-green; a BLOCKED task gating the next wave; two failures on one task. One redo per task max. Never dispatch wave N+1 before wave N's review is done.
6. **Self-resume:** executor completions re-invoke you via task-notification — verify and dispatch the next wave yourself; never leave "continue" pumping to the user. If context resets mid-run, PM task state + progress notes are the resume point.
7. Close out as in serial mode.

## Ground rules (both modes)

- Never `git reset --hard` / revert commits; a bad commit gets a forward fix or a stop.
- Escalations you can't resolve from the plan/SDD are the user's: stop and ask rather than guessing design intent.
- Never edit `lifelines-pm/data/` directly; the `*.tests.json` sidecars regenerate on every suite run — leave them uncommitted.
