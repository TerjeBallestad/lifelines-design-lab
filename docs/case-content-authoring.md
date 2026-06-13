# Case content authoring guide

This is the current SB-281 / SDD-086 authoring path for the tiny Olsen case slice.

The important rule: **author content in `lifelines-design-lab`; treat Godot resources in `lifelines-core-loop` as generated runtime artifacts.**

```text
lifelines-design-lab/content/cases/olsen/*.case.md
lifelines-design-lab/content/cases/olsen/*.case.yaml
        ↓ npm run gen:olsen
lifelines-design-lab/src/content/blueprint/generated/tinyOlsen.ts
lifelines-core-loop/resources/cases/olsen/source/tiny_olsen_slice.json
        ↓ Godot headless generator
lifelines-core-loop/resources/cases/olsen/generated/tiny_olsen_case_pack.tres
```

## What to edit

Edit these files:

```text
content/cases/olsen/tiny-olsen.case.md
content/cases/olsen/tiny-olsen.case.yaml
```

Do **not** hand-edit these unless you are debugging the generator:

```text
src/content/blueprint/generated/tinyOlsen.ts
../lifelines-core-loop/resources/cases/olsen/source/tiny_olsen_slice.json
../lifelines-core-loop/resources/cases/olsen/generated/tiny_olsen_case_pack.tres
```

The generated TypeScript is for design-lab inspection. The generated JSON is the source Godot reads. The `.tres` is Godot's serialized runtime resource.

## Current limitation

This first slice supports exactly one authored document. The generator deliberately fails if `documents:` contains more than one item.

That is not a design ideal. It is a scope guard for the tiny Olsen schema slice. Expand the generator before authoring multi-document cases.

## Markdown: prose and evidence spans

The Markdown file carries the document prose. Evidence spans use this marker:

```md
{ev:f_grete_baerer}Grete carries most routines.{/ev}
```

Each evidence span becomes two things:

1. A design-lab document run:

```ts
{ text: 'Grete carries most routines.', factId: 'f_grete_baerer' }
```

2. A Godot BBCode hotspot:

```bbcode
[url=fact:f_grete_baerer]Grete carries most routines.[/url]
```

Rules:

- Every `{ev:fact_id}` must have a matching entry under `facts:` in the YAML sidecar.
- Keep one factual claim per evidence span.
- Do not put mechanical IDs in visible copy except through the marker.
- Whitespace inside a span is collapsed by the generator.

Good:

```md
{ev:f_post}A stack of unopened letters sits on the shoe cabinet.{/ev}
```

Bad:

```md
{ev:f_post}There is mail, unpaid bills, no food, and Elling never answers the phone.{/ev}
```

That is four facts pretending to be one. The player loses the decision surface.

## YAML sidecar: the case graph

The YAML file describes the mechanical graph around the prose.

Top-level sections:

```yaml
case:
documents:
facts:
questions:
hypotheses:
tiltak:
dispatches:
clocks:
day_script_beats:
```

### `case`

```yaml
case:
  id: case_olsen_tiny
  title: Olsen tiny schema slice
  scenario_stage: 0
```

- `id`: stable case pack id.
- `title`: human-readable title.
- `scenario_stage`: starting stage for stage-gated predicates.

### `documents`

Current slice supports one document:

```yaml
documents:
  - id: doc_bekymring
    kind: letter
    title: Bekymringsmelding
    register: klinisk
    peek: Bekymringsmelding with five generated fact markers for the tiny Olsen schema slice.
    meta: Oslo kommune · sosialkontoret · meldt av Dr. J. Haug · februar 1999
    markdown: tiny-olsen.case.md
```

Fields used by design-lab:

- `register`
- `peek`
- `meta`

Fields used by Godot:

- `id`
- `kind`
- `title`
- generated `body_bbcode`
- generated `runs`

`body_bbcode` in the YAML is currently legacy/no-op for generation. The generator builds BBCode from Markdown evidence spans.

### `facts`

Facts are the atomic claims the player can lift from document runs.

```yaml
facts:
  - id: f_grete_baerer
    label: Grete carries routines
    summary: The concern letter points to Grete carrying most daily routines.
    domain: Hverdag/rutine
    category: Dokument
    source_document_id: doc_bekymring
    supports: [q_hverdag, q_okonomi]
    discuss: [Frank, Grete]
    lift_effects:
      - op: reveal_questions
        args:
          question_ids: [q_hverdag, q_okonomi]
```

Fields used by both paths:

- `id`
- `label`
- `summary`
- `source_document_id`
- `lift_effects`

Fields mainly for design-lab:

- `domain`
- `category`
- `supports`
- `discuss`

Authoring rule: a fact should be a claim, not a conclusion. “Unopened mail is stacking up” is a fact. “Elling cannot live alone” is a hypothesis.

### `questions`

Questions are the caseworker's open questions.

```yaml
questions:
  - id: q_hverdag
    prompt: How stable are the daily routines without Grete carrying them?
    title: How stable are the daily routines without Grete carrying them?
    appears_on: [f_grete_baerer]
    reveal_when:
      op: fact_lifted
      args:
        fact_id: f_grete_baerer
```

- `prompt`: exported to Godot.
- `title`: exported to design-lab.
- `appears_on`: design-lab relation from fact to question.
- `reveal_when`: Godot predicate AST.

### `hypotheses`

Hypotheses are provisional interpretations. They should create a decision, not merely summarize facts.

```yaml
hypotheses:
  - id: h_omsorgsbyrde
    title: Care burden is concentrated
    summary: Grete carries too much of the everyday support load.
    label: Care burden is concentrated
    note: Grete carries too much of the everyday support load.
    question_id: q_hverdag
    opens: [t_samtale_grete, t_regningshjelp]
    availability:
      op: all
      children:
        - op: fact_lifted
          args:
            fact_id: f_grete_baerer
        - op: fact_lifted
          args:
            fact_id: f_regninger
    chosen_effects:
      - op: unlock_tiltak
        args:
          tiltak_ids: [t_samtale_grete, t_regningshjelp]
```

- `availability`: when the hypothesis can be chosen.
- `chosen_effects`: what choosing it unlocks.
- `question_id`: which design-lab question owns it.
- `opens`: design-lab shorthand for which tiltak it opens.

Authoring rule: if two hypotheses unlock the same next move and ask the same question, one of them is probably decoration. Cut or sharpen it.

### `tiltak`

Tiltak are possible interventions.

```yaml
tiltak:
  - id: t_regningshjelp
    title: Arrange bill support
    slot: s2
    cost: 1
    needs: [f_regninger]
    needs_hypothesis: [h_omsorgsbyrde]
    description: Arrange practical support for bills.
    sim_hook_id: case.olsen.tiltak.bill_support
```

- `sim_hook_id` is the runtime bridge point. Keep it stable and case-scoped.
- `slot`, `cost`, `needs`, `needs_hypothesis`, and `description` are design-lab-facing in this slice.
- Godot currently stores only `id`, `title`, and `sim_hook_id`.

### `dispatches`

Dispatches are authored actions that can be gated and can apply effects.

```yaml
dispatches:
  - id: d_konto
    title: Request account overview
    description: Request account overview for next day.
    sim_hook_id: case.olsen.dispatch.account_overview
    gate:
      op: all
      children:
        - op: hypothesis_chosen
          args:
            hypothesis_id: h_okonomisk_sarbar
        - op: fact_lifted
          args:
            fact_id: f_regninger
    effects:
      - op: queue_pending_document
        args:
          clock_id: ck_overfort
          document_id: pending_konto_overfort
          delay_days: 1
```

A dispatch should be a move the player understands. “Request account overview” is clear. “Advance stage” is implementation leakage.

### `clocks`

```yaml
clocks:
  - id: ck_overfort
    label: Next-day account overview clock
    sim_hook_id: case.olsen.clock.account_overview
```

Clocks are named delayed processes. If a dispatch queues a pending document, the `clock_id` must exist here.

### `day_script_beats`

Currently empty in the tiny slice:

```yaml
day_script_beats: []
```

Use this later for authored day-bound effects. Do not use it as a dumping ground for prose.

## Predicate AST

Godot does not parse strings. It walks serialized predicate objects:

```yaml
op: all
children:
  - op: fact_lifted
    args:
      fact_id: f_grete_baerer
  - op: scenario_stage_at_least
    args:
      stage: 1
```

Allowed predicate ops:

| op                        | args              | Meaning                               |
| ------------------------- | ----------------- | ------------------------------------- |
| `true`                    | none              | Always passes.                        |
| `false`                   | none              | Never passes.                         |
| `all`                     | `children`        | Every child must pass.                |
| `any`                     | `children`        | At least one child must pass.         |
| `not`                     | exactly one child | Inverts one child.                    |
| `fact_lifted`             | `fact_id`         | Fact has been lifted.                 |
| `hypothesis_chosen`       | `hypothesis_id`   | Hypothesis has been chosen.           |
| `scenario_stage_at_least` | `stage`           | Current scenario stage is `>= stage`. |
| `scenario_stage_before`   | `stage`           | Current scenario stage is `< stage`.  |
| `slot_filled`             | `slot_id`         | A slot has been filled.               |

Keep ops case-agnostic. Do not invent `grete_stage_at_least` or `elling_called`. Use generic state plus IDs.

## Effect AST

Effects are also serialized objects:

```yaml
op: unlock_dispatches
args:
  dispatch_ids: [d_ring_grete]
```

Allowed effect ops:

| op                       | args                                    | Meaning                               |
| ------------------------ | --------------------------------------- | ------------------------------------- |
| `all`                    | `children`                              | Applies child effects.                |
| `reveal_questions`       | `question_ids`                          | Reveals questions.                    |
| `reveal_hypotheses`      | `hypothesis_ids`                        | Reveals hypotheses.                   |
| `unlock_tiltak`          | `tiltak_ids`                            | Unlocks tiltak.                       |
| `unlock_dispatches`      | `dispatch_ids`                          | Unlocks dispatches.                   |
| `queue_pending_document` | `clock_id`, `document_id`, `delay_days` | Queues delayed document availability. |
| `set_scenario_stage`     | `stage`                                 | Sets scenario stage.                  |

## Authoring workflow

From `lifelines-design-lab`:

```sh
npm run gen:olsen
npm run test:olsen
npm run gen:olsen:check
npm test
npm run build
```

Then from `lifelines-core-loop` regenerate the Godot resource:

```sh
HOME=/tmp/lifelines-home /Applications/Godot.app/Contents/MacOS/Godot \
  --headless --path . \
  --script res://scripts/case_files/generate_tiny_olsen_pack.gd
```

Then verify Godot:

```sh
HOME=/tmp/lifelines-home GODOT_BIN='/Applications/Godot.app/Contents/MacOS/Godot' \
  ./tests/run_tests.sh -- --filter case_content_schema
```

Before committing core-loop, check that test sidecars did not churn:

```sh
git status --short
```

If you see `lifelines-pm/**/*.tests.json` changes, stop and inspect. They are usually test-catalogue churn, not content work.

## What the tests catch

Design-lab tests catch:

- Markdown evidence spans parse into document runs.
- Evidence spans reference known facts.
- Generated Godot JSON matches the committed core-loop source JSON.
- Generated design-lab TypeScript contains the expected content exports.
- Generated artifacts are not stale.

Core-loop GATH catches:

- committed `.tres` loads
- validator accepts valid pack
- unresolved fact IDs fail
- unknown predicate/effect ops fail
- document runs expose fact hotspots
- predicates/effects walk correctly at runtime
- delayed dispatch queues pending document output
- source JSON regeneration matches committed `.tres`

## A good authoring pass

For each new bit of content, ask:

1. What does the player literally read or observe?
2. Which exact words become liftable facts?
3. Which open question does each fact support?
4. Which hypotheses become available from those facts?
5. What new action does choosing a hypothesis unlock?
6. What delayed or visible consequence proves the action mattered?

If you cannot answer 4–6, the content may be good prose but it is not yet playable case content.

## Current rough edges

- Multi-document authoring is not implemented yet.
- The generator name is Olsen-specific.
- Design-lab generated content is exported but not yet deeply integrated as a selectable case pack.
- Godot stores a smaller subset of the YAML than design-lab does.
- The copy in the tiny slice is scaffolding, not final Norwegian case prose.

Those are acceptable for SB-281. The next sensible deepening is multi-document support, not more hand-authored `.tres` editing.
