# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

This is a single-context repo.

## Before Exploring, Read These

If present, read:

- `CONTEXT.md` at the repo root.
- Relevant ADRs in `docs/adr/`.

These files are created lazily. If they do not exist, proceed silently and use the existing project docs below.

Current context sources:

- `README.md` for the project purpose, stack, commands, and pinned rule.
- `docs/architecture.md` for the core architecture seams and domain concept names.
- `docs/ui-tooling.md` for Tailwind/daisyUI UI rules.
- `docs/sdd/` for design notes.
- PM `SDD-*` designs for active product/design decisions.
- `docs/runs/` for prior harness-lite run contracts, reviews, and verdicts.

## File Structure

Expected single-context shape:

```text
/
|-- CONTEXT.md
|-- docs/
|   |-- adr/
|   |-- agents/
|   |-- architecture.md
|   |-- sdd/
|   `-- runs/
`-- src/
```

## Use The Project Vocabulary

When output names a domain concept in an issue, SDD, refactor proposal, hypothesis, or test name, use the vocabulary from the repo's docs and PM SDDs.

Current load-bearing terms include:

- Lifelines Design Lab
- PM as project backbone
- SDD, meaning system design document or software design document
- content data -> pure resolver -> observable stores -> UI presentation
- State object
- Approach
- Die
- Vignette beat
- Evidence fact
- Frank report
- Case Desk
- Apartment clocks
- Roottrees desk / evidence board
- `Hva mangler Elling?` case board
- Tiltak

Avoid drifting to generic synonyms when the repo already has a sharper term.

## Flag ADR Conflicts

If output contradicts an existing ADR, surface it explicitly rather than silently overriding it:

> Contradicts ADR-0007 because ..., but worth reopening because ...

If no ADR exists for the decision, proceed from the current docs and PM SDDs.
