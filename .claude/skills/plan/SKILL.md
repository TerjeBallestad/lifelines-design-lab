---
name: plan
description: Plan design-lab production work from SDDs, PM items, concerns, gaps, or task descriptions into a PM-native plan. Classifies work per two-track, then picks a scaffold dial — D0 inline or D1 requirements+gates (default). Use after an SDD is approved, or for any bounded rewrite too big to just start.
disable-model-invocation: true
---

# Plan

<!-- Trimmed from lifelines-core-loop .agents/skills/plan. Dropped: D2 diamond ceremony, role briefs/dispatch, macro-architecture reference. The Godot judge ladder is replaced with the lab ladder below. -->

Turn a source (SDD, SB, gap, concern, bounded description) into a PM-native plan. Planning only — never implement here. Fetch source via `pm get <ID>`; never edit PM data files directly.

**Source authority precedence:** current PM item body → linked current PM decisions/concerns/gaps/plans → repo docs (`README.md`, `docs/`) → current code/tests → prior plans/artifacts → older notes. Older artifacts explain intent; they never overrule current scope.

## 1. Track gate first

Load the `two-track` skill and classify: can an agent tell whether this work succeeded?
- **Track F** (feel): do NOT plan deep. Output = a playable question + least build (HTML probe in `prototypes/`), never deeper than the next play session — filed as a `[grill]` or `[probe]` gate ticket (see §3.4), never as a plan. Stop here.
- **Mixed:** plan only the verifiable substrate; name the feel surface as playable questions.
- **Track V:** continue to the dial.

## 2. Pick the dial

| Dial | When | Machinery |
|---|---|---|
| **D0** | 1–2 tasks, settled design | No plan artifact — plan inline as PM comments on the source item |
| **D1** (default) | settled-enough design; fits one session or one serial execution run | This skill alone. No researchers, no plan-reviewers. |

**Escalation rule:** the moment D1 hits a real unknown — vague source, unclear mechanism, unproven player-visible beat — route the question to Terje as a gate ticket, or send the foggy part back to `wayfinder`. Never guess. (This repo has no D2 ceremony; scope that needs one probably belongs in core-loop.)

## 3. The lab judge ladder

Route every requirement to the **cheapest judge that can actually validate it**, and never claim a higher rung's verdict from a lower rung's evidence.

| Rung | Invocation | Proves | Cannot prove |
|---|---|---|---|
| `compiler` | `npm run lint` (tsc + prettier) | types line up, code is well-formed | any behavior |
| `test` | `npx vitest run <file>` then `npm test` | asserted logic behavior | rendering, layout, feel |
| `pipeline` | `npm run case:check` (and `npm run test:harness` when the core-loop side changed) | the generated case round-trips and matches the checked-in output | that the content reads well |
| `screenshot` | dev server + browser screenshot (claude-in-chrome / `run` skill) | it renders, layout is plausible | interaction feel, pacing |
| `terje` | playable question, filed as a gate ticket | feel, tone, legibility | nothing an agent can claim for it |

**Case-content note:** work that touches `content/cases/` or `scripts/blueprint/` needs the `pipeline` rung as a floor — a green `vitest` run alone does not prove the generated `tinyOlsen.ts` and the core-loop JSON stayed in sync.

## 4. D1 protocol — requirements + gates

The point is the **game**, not the plan artifact. The executor gets freedom and responsibility to make the feature actually work.

1. **Read the code yourself.** Trace the paths the work touches (facts-before-writing, no researcher fleet). Verify the source's code assumptions; note discrepancies.
2. **Write requirements, not task+test pairs.** Each requirement is a *user-visible outcome*: what the designer (or pipeline) visibly does/reads afterwards — "the editor shows the dialog tree with branch conditions readable without opening a node" — never "implement `handleX()` and make test Y green."
3. **Chunk big.** Prefer few, large requirements — each as big as fits one executor context window.
4. **Bind every requirement to a judge.** Per requirement write a judge stanza in `verification`:
   ```
   judge: compiler | test | pipeline | screenshot | terje
   command: <exact invocation, or playable-question for the terje rung>
   proves: <what this rung actually proves>
   fake_evidence: <what would look like proof but is not>
   ```
   Anything the designer sees needs a rung above `test`.

   **Terje rungs never live as plan tasks.** Plans are AFK agent machinery — Terje does not read task lists, and a task "waiting on Terje" is invisible to him. Any `judge: terje` requirement is delivered as a **gate ticket** on the board instead: the last agent task preps the gate (build runnable, playable question written), then files it and stops —
   ```
   pm create issue "[grill] <the judgment question>"     # ruling/design-tension gates
   pm create issue "[probe] feel-gate: <the question>"   # play-session/feel gates
   pm patch SB-NNN --related <PLAN-ID> --body "Question / Least build / how to start / answer feeds"
   ```
   Gate tickets surface on the project frontier and the dashboard's "Needs you" rail; Terje's answer lands as a PM comment on that ticket. Follow-up work behind the ruling is its own ticket(s) with `blockedBy: [SB-NNN]`, never a resumed task inside this plan. The plan itself ends when its agent-judged tasks are done and the gate ticket is filed.
5. **Tests are the executor's instrument, not the deliverable.** The executor authors its own vitest tests to get hands-on with the system; red-green and honest-tests rules apply, but a green test is never the success criterion — the judge stanza is. Refactoring belongs to the end-gate review, not the red-green loop.
6. **Executor-aware prescription.** Strong executor (Fable/Opus): destination + constraints + judges, near-zero steps — over-prescription reduces quality. Weaker executor: same requirements plus a *suggested* decomposition — still outcomes, never step scripts.
7. **Self-check before filing** (run as a checklist):
   - *User-visible:* does the lab get more usable? Every visible beat has a requirement; evidence is not just tests/logs. If designer-facing and all judges are `test` → fix or justify.
   - *Mechanism fidelity:* the user approved the source's approach, not an alternative. Any deviation → `## SDD Deviations` in `setupNotes` (MECHANISM_DEVIATION: what/source-says/plan-does/reason). Ambiguity → route to Terje, never resolve by guessing.
   - *Split smell:* a requirement mixing >1 ownership boundary, migration+wiring, or broad verbs (integrate/migrate/wire/cleanup) hiding several seams — split it or justify. Prose never fixes a bundled seam.
   - *Cross-repo IOU:* work that changes what lands in core-loop (`resources/cases/...`) without regenerating/verifying there = named debt (task step + `pm gap`).
8. **File** per `references/pm-plan-contract.md`. Essential requirements live ONLY in PM-supported fields (`setupNotes`, `relevantFiles`, `designDecisions`, task `description/steps/verification/blockedBy`) — executors cannot read anything else. File autonomously; ask only for NEEDS_DECISION-grade ambiguity, scope change without source support, or risk of clobbering others' PM records. Verify `blockedBy` resolved to TASK-NNN after create.

## 5. Non-goals

- No implementation. No full ceremony for tiny changes — and no D1 plan for a Track F question.
- Do not accept a plan merely because artifacts exist; a done-mark is a proxy, not evidence.
