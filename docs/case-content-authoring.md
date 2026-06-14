# Case content authoring guide

Current SB-281 / SDD-086 direction: **one humane `.case.md` source file first; generated JSON/TypeScript/Godot Resources are machinery.**

```text
content/cases/olsen/tiny-olsen.case.md
        ↓ npm run gen:olsen
src/content/blueprint/generated/tinyOlsen.ts
../lifelines-core-loop/resources/cases/olsen/source/tiny_olsen_slice.json
        ↓ Godot headless generator
../lifelines-core-loop/resources/cases/olsen/generated/tiny_olsen_case_pack.tres
```

## What humans edit

Edit only:

```text
content/cases/olsen/tiny-olsen.case.md
```

Do not hand-edit:

```text
src/content/blueprint/generated/tinyOlsen.ts
../lifelines-core-loop/resources/cases/olsen/source/tiny_olsen_slice.json
../lifelines-core-loop/resources/cases/olsen/generated/tiny_olsen_case_pack.tres
```

The old YAML sidecar was removed because it exposed the runtime graph too directly. The generator now compiles readable case sections into PredicateSpec/EffectSpec-style data.

## Shape of the file

The file has readable sections:

```md
# Case: case_olsen_tiny
Title: Olsen tiny schema slice
Scenario stage: 0

# Document: doc_bekymring
Kind: BEKYMRINGSMELDING
Title: Legesenteret · Dr. J. Haug
Register: klinisk
Peek: «…»
Meta: LEGESENTERET · 11.02.1999

Document prose goes here. Evidence is marked with normal Markdown links:
[visible text](fact:f_grete_baerer)

# Facts

## f_grete_baerer
Label: Grete bærer rutiner
Summary: Grete bærer husholdets praktiske funksjoner.
Domain: Hverdag/rutine
Category: Dokument
Source: doc_bekymring
Supports: q_hverdag, q_okonomi
Discuss: Frank, Grete
Reveals questions: q_hverdag, q_okonomi
```

Then similar sections for:

```text
# Questions
# Hypotheses
# Tiltak
# Dispatches
# Clocks
# Day script beats
```

## Evidence links

Use ordinary Markdown links with a `fact:` target:

```md
[Mor opplyser at hun bistår med praktiske gjøremål](fact:f_grete_baerer)
```

The generator turns that into:

- a design-lab run with `factId`
- Godot BBCode: `[url=fact:f_grete_baerer]...[/url]`
- a Godot `DocumentRun` with `fact_id`

If the fact ID does not exist in `# Facts`, generation fails.

## Gate syntax for now

This is intentionally small. Authors should not write AST objects.

Questions:

```md
Opens when: f_grete_baerer
```

Hypotheses:

```md
Needs: f_grete_baerer, f_regninger
Opens tiltak: t_samtale_grete, t_regningshjelp
Opens dispatches: d_ring_grete
```

Dispatches:

```md
Gate: hypothesis h_omsorgsbyrde + fact f_grete_baerer
Effects: scenario_stage 1
```

or:

```md
Effects: pending_doc pending_konto_overfort after 1 day on ck_overfort
```

The generator compiles these into the ugly `op/args/children` data. Humans should not have to write that.

## Check command

From `lifelines-design-lab`:

```sh
npm run case:check
```

This runs:

1. generated artifact freshness check
2. generator tests

To regenerate after editing:

```sh
npm run gen:olsen
```

Then regenerate/verify Godot from `lifelines-core-loop`:

```sh
HOME=/tmp/lifelines-home /Applications/Godot.app/Contents/MacOS/Godot \
  --headless --path . \
  --script res://scripts/case_files/generate_tiny_olsen_pack.gd

HOME=/tmp/lifelines-home GODOT_BIN='/Applications/Godot.app/Contents/MacOS/Godot' \
  ./tests/run_tests.sh -- --filter case_content_schema
```

## Current limitation

This is still a tiny slice:

- one document
- five fact hotspots
- two questions
- three hypotheses
- two dispatches
- one clock

It proves the humane text format can feed both design-lab and Godot. It is not the final authoring tool yet.
