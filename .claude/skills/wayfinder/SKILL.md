---
name: wayfinder
description: Chart foggy, multi-session work (an SDD cluster, an unmapped design space, a fog of gaps) as a shared map of typed tickets on the PM dashboard, then work through it one ticket per session. Use when work is too big or too foggy for one session and the shape of the work itself is unknown — NOT for settled work.
disable-model-invocation: true
---

# Wayfinder

<!-- Adapted from lifelines-core-loop .agents/skills/wayfinder. Godot-specific resolvers (gym-builder, judge-ladder) are replaced with this repo's HTML-prototype workflow. -->

Foggy work too big for one session becomes a **map**: a destination, a set of typed investigation tickets with blocking edges, and a fog-of-war frontier that graduates into new tickets as you learn. The map lives on the PM dashboard; sessions resolve one ticket at a time.

Two modes — never both in one session.

## Mode 1: Chart the map (one session, then stop)

1. **Name the destination.** Grill Terje for the *decisions* (what does arriving look like? what's explicitly out?); mine code/PM/vault/memories for the *facts* yourself — facts are lookups, not questions.
2. **Map the frontier breadth-first.** What must be known/decided/proven before the destination is reachable? Each unknown becomes a ticket. Don't resolve anything — the pull to just do the work is the signal you're at the map's edge.
3. **Create the map** as a PM **project** (`pm project create "name" --destination "what arriving looks like" --body @map.md` — id comes back as SPRINT-NNN; never chart a map as an SDD, SDDs are system design documents). Project body = `## Decisions so far` + `## Out of scope` only — membership, frontier, and progress are computed live by the dashboard from the tickets, so no hand-maintained ticket index. The map is an **index, not a store** — a decision lives in exactly one place (its ticket); the project body only gists and links. Session logs go on the project as comments (`pm comment SPRINT-NNN "..."`).
4. **Create tickets** as SB issues **with `--sprint SPRINT-NNN`** (or `pm patch SB-NNN --sprintId SPRINT-NNN` after), typed by title prefix:
   | Prefix | Kind | Session shape | Resolver (Mode 2 loads this) |
   |---|---|---|---|
   | `[research]` | facts to gather (code/vault/web) | AFK — delegable | Explore agents; `deep-research` if web-heavy |
   | `[probe]` | a design/feel question needing an HTML probe | HITL — Track F, playable question | HTML probe in `prototypes/` + `two-track` |
   | `[grill]` | a decision only Terje can make | HITL — conversation | `grill-with-docs` (PM adaptation below) |
   | `[task]` | settled V-track build work | AFK — may become a D0/D1 `plan` | `plan` skill (D0 inline or D1) |
   Each ticket body: the question, why it blocks what it blocks, links, and a `## Notes` line only for skills or context BEYOND the default routing above.
5. **Wire edges second pass** — `blockedBy` needs existing IDs; eyeball IDs after create (ordinal fragility). Unblocked tickets = the frontier.
6. Stop. Charting is one session.

## Mode 2: Work the map

1. Load the map project (`pm project SPRINT-NNN` — joined items/designs/plans; zoom into ticket bodies on demand). The dashboard's project view shows the live frontier.
2. **Claim a frontier ticket.** `pm list issue --frontier --sprint SPRINT-NNN` shows only claimable tickets (unblocked, not claimed by another live session — no need to ask Terje which to take). Claim yours with `pm claim <id> --as "wayfinder: <short label>"`; a failed claim (409) means another session got there first — pick a different frontier ticket. Closing a ticket auto-releases the claim; if you abandon one, `pm release <id>`. Stale claims expire on their own (4h). Refer to tickets by name, never bare ID.
3. **Route by type — load the resolver from the Mode 1 table before starting:**
   - `[research]` → fan out Explore agents (or `deep-research` for web-heavy); write findings comment.
   - `[probe]` → load `two-track`; build the least HTML probe in `prototypes/` that lets the question be answered; Terje plays.
   - `[grill]` → load `grill-with-docs`, with the **PM adaptation**: one question at a time with a recommended answer (never a bulk list); codebase-answerable questions get explored, not asked; but decisions/ADRs go to PM (`pm decision`, DD comments) — NOT to `CONTEXT.md`/`docs/adr/` as the skill's own text says. Keep its ADR test (hard to reverse / surprising later / real trade-off) as the bar for filing a DD vs a ticket comment.
   - `[task]` → load the `plan` skill: D0 inline for 1–2 settled tasks, D1 for anything bigger.
4. **Record:** resolution comment on the ticket → close it → append the one-line decision to the project body's `## Decisions so far` (`pm project SPRINT-NNN --body @updated.md`) and log the session as a project comment.
5. **Graduate the fog:** what the resolution revealed becomes new tickets (+ edges) or goes to `## Out of scope`. Ruling out is progress.
6. **Session pacing (upstream key constraint, research excepted):**
   - Judgment tickets (`[grill]`, `[probe]`): **one per session, hard rule.** Decisions compound between sessions — a ruling needs to settle before it reshapes the next question; batching argues ticket 2 from ticket 1's momentum.
   - Fact tickets (`[research]`, small mechanical `[task]`): 2–3 per session allowed if independent (no blocking edge between them).
   - **Never mix tiers in one session:** research findings bias a grill run minutes later. The gap between fact-gathering and judgment is where the map earns its value.

## Guardrails

- Track-gate aware: a `[probe]` ticket is Track F — never spawn a deep plan from inside one; the answer feeds the map, not a task graph.
- The map never outruns its frontier: don't pre-plan tickets deep behind fog that a nearer ticket could invalidate.
- PM is the store — no shadow markdown maps.
- Lab pinned rule applies: probes test design decisions faster than Godot; they never grow into a second game implementation.
