---
name: two-track
description: The two-track production doctrine (V/F) as a reusable classification — decide whether work is agent-verifiable (Track V) or feel-judged (Track F) before planning or building anything. Load at the start of any planning, brainstorming, or build-routing step. Canonical long form in lifelines-core-loop docs/TWO-TRACK.md.
---

# Two-Track Gate

<!-- Adapted from lifelines-core-loop .agents/skills/two-track. Gym/Godot references are replaced with this repo's HTML-prototype equivalents. -->

**Agents can verify; only play can validate.** Route every piece of work to the cheapest judge that can actually validate it, and never let a plan outrun its judge.

## The classification question

> Can an agent tell whether this work succeeded?

- **Yes → Track V (verifiable):** infrastructure, ports, migrations, schema/pipeline work, hygiene, seam mechanics, bug fixes with reproducible symptoms. Plan normally; judges are the compiler, `npm test`, and `npm run lint`.
- **No — the criterion is feel → Track F (feelable):** new verbs, pacing, UI interaction shapes, consequence legibility, tuning, tone.
- **Mixed (most gameplay SDDs): split it.** The substrate is V; the feel is F. Plan only the substrate; name the feel surface as playable questions.

## Track F rules

1. Greybox first — abstract game language or an HTML toy, readable in ~30 seconds. If it doesn't read greyboxed, no build saves it.
2. Then the smallest playable thing (an HTML probe in `prototypes/` or the thinnest slice) — whatever lets Terje touch it soonest.
3. **Terje plays. That's the review.** No reviewer artifact substitutes. Feel-gates are human-only.
4. Tune as a phase (playtest → config knob → playtest).
5. **Hard rule: Track F plans never run deeper than the next play session.** Light plans (PM comments, 1–3 tasks) are the ceiling.
6. Once the question is answered, the settled remainder reclassifies as Track V.

## The unit of Track F work: a playable question

> **Question:** does X feel like agency or like a loading screen?
> **Least build:** thinnest thing that lets the question be answered (fake the rest).
> **Play session:** Terje, ≤5 minutes, in the production surface where possible.
> **Answer feeds:** the next design decision — file it as a PM comment on the owning SDD.
