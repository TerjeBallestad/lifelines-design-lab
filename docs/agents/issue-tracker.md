# Issue Tracker: PM CLI

Issues, SDDs, plans, comments, and triage state for this repo live in the local `pm` project-management system.

Use the `pm` CLI from the repo root. The PM server normally runs at the URL configured by `PM_URL`, defaulting to `http://localhost:3334`.

## Codex Sandbox Note

The Codex filesystem sandbox can block loopback server access even when `pm health` works in the user's normal shell. If a PM command fails with:

```text
Failed: fetch failed
Is the PM server running? Start it with: pm serve
```

do not assume PM is down. Rerun the same command with approval outside the sandbox.

For routine read-only work, request a narrow persisted approval for PM read commands instead of maintaining a second PM adapter:

```sh
pm health
pm list issue --all
pm list sdd --all
pm get SB-001
```

Good persisted approval prefixes:

- `pm health`
- `pm list`
- `pm get`

For mutations, use the real `pm` CLI with explicit approval outside the sandbox. Do not edit `.pm/data/` by hand for create/patch/comment/archive operations: the running PM server keeps an in-memory store and can miss or overwrite out-of-band writes.

## Repository Workflow

- Work starts as `SB-*` PM issues.
- Product/design specification work is represented as `SDD-*` PM designs.
- In this repo, when a skill says "PRD", treat that as an SDD: a system design document or software design document.
- Implementation planning is represented as `PLAN-*` PM plans.
- PM stages are configured in `pm.config.json`.

Current configured stages:

```text
inbox -> exploring -> sdd -> planned -> done
```

## Common Commands

Check PM server health:

```sh
pm health
```

List work:

```sh
pm list issue --all
pm list issue --all --json
pm list sdd --all
pm list sdd --all --json
```

Get one item:

```sh
pm get SB-001
pm get SDD-001
```

Create an issue:

```sh
pm create issue "Title" --priority P2 --body "Problem statement"
```

Create or fetch through shorthand:

```sh
pm issue "Title"
pm issue SB-001
```

Create an SDD:

```sh
pm sdd create "Title" --body @file.md --items SB-001,SB-002
```

Patch stage or other fields:

```sh
pm patch SB-001 --stage exploring
pm patch SB-001 --priority P1
pm patch SDD-001 --stage planned
```

Add a comment:

```sh
pm comment SB-001 "Comment text" --author codex
```

Archive items:

```sh
pm archive SB-001
```

## When A Skill Says "Publish To The Issue Tracker"

Create or update a PM item rather than a GitHub issue.

- For raw work intake, create an `issue`.
- For PRD/spec/design output, create an `sdd`.
- For implementation breakdowns, create or update a `plan`.
- For review notes or discussion, add a PM comment.

Prefer command output from `pm --help` and `pm get <id>` over guessing field names. Unknown fields are rejected by the PM server.

## When A Skill Says "Fetch The Relevant Ticket"

Use the PM item ID the user gives you, normally `SB-*`, `SDD-*`, or `PLAN-*`.

```sh
pm get SB-001
pm get SDD-001
pm get PLAN-001
```

If the PM server is unreachable from the sandbox, use approved real `pm` commands rather than direct `.pm/data/` edits. Direct file reads are acceptable only as a last-resort inspection fallback, not as a parallel tool or mutation path.
