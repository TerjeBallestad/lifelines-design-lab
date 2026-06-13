---
id: SDD-010
title: Blueprint v1 React port — parity gaps vs prototype
itemIds: []
stage: sdd
sprintId: null
comments: []
---
# Blueprint v1 React port — parity gaps vs prototype

Date: 2026-06-13
Status: Draft SDD
Reference artifact: `prototypes/blueprint_v1.html` (frozen, canonical)
Target under review: `src/` React/MobX port (SDD-009, merged in RUN-021)

## Design question

The React/MobX port (SDD-009) reproduces most of `blueprint_v1.html`, but they
diverge in behavior and feel. What is actually missing or drifted, and which gaps
break a behavioral contract vs. which are cosmetic?

## Method

Line-by-line diff of the HTML CONTENT/ENGINE/SIM/UI layers against:
`src/content/blueprint/index.ts`, `src/domain/blueprint.ts`,
`src/engine/blueprint/blueprintEngine.ts`, `src/stores/BlueprintStore.tsx`,
`src/components/blueprint/BlueprintLab.tsx`.

Verified present and at parity (no action): prologue, desk, document reader with
liftable hotspots, fact archive + fact-detail modal, questions + in-question
hypotheses, tiltak slots/cost/gating, dispatches, Frank chat (incl. the
`f_dor_glott` embedded chat hotspot), clocks, scripted days 2–8, sim coverage
model, dynamic end/status report (`doc_status` built from `endText`), reset.

## Gap map

| # | Gap | Type | Severity |
|---|-----|------|----------|
| 1 | Generated VEDTAK document never lands on the desk | Behavioral loop | **High** |
| 2 | Question-board connector lines (Blake Manor SVG) absent | Visual / SDD-005 | **Medium** |
| 3 | 10 s delayed pencil-nudge on un-lifted hotspots absent | Interaction contract | **Medium** |
| 4 | Starvation log beat (`foodBoxes <= 0`) missing | Sim content | Medium-low |
| 5 | Two FLAVOR log lines dropped (7 → 5) | Content parity | Low |
| 6 | Spyglass cursor on hotspots replaced by inline icon | Feel | Low |
| 7 | Question-state pill always gold (no blue/neutral) | Visual | Low |
| 8 | "For tidlig?" badge condition drifted | Logic | Low |
| 9 | Toasts don't auto-dismiss or deep-link on click | Interaction | Low |

---

### 1 · Generated VEDTAK document — HIGH

The prototype's core loop beat is *the decision becomes a paper on the desk*.

- HTML: `enactVedtak()` builds `DOCUMENTS['doc_vedtak_N']` — tiltak rows, one
  "Arbeidshypotese lagt til grunn: …" row per chosen hypothesis, an `IVERKSATT`
  stamp — then `receiveDoc()` puts it on the pulten. `blueprint_v1.html:2428–2457`.
- React: `enactBlueprintTiltak()` only pushes a `sim.log` line
  (`blueprintEngine.ts:242–246`); `enactTiltak()` adds a notice and jumps to
  Leiligheten (`BlueprintStore.tsx:148–157`). No document is generated.

Consequence: the player never gets a vedtak artifact to re-read, and the
hypothesis-grounding record (which working hypothesis justified which tiltak) is
lost. This is the only gap that removes a loop output, not just polish.

Fix: have the engine emit a dynamic `doc_vedtak_<n>` (like `doc_status` already
does in `BlueprintStore.documentById`) and `receiveBlueprintDocument` it on enact.

### 2 · Question-board connector lines — MEDIUM

HTML `drawLines()` draws dashed bezier paths in `#q-lines` SVG linking the *same
fact* used across multiple question cards (`blueprint_v1.html:2183–2209`, redrawn
on render + resize). The React `QuestionsBoard` has no SVG, no `data-line-fact`
anchors, no connectors (`BlueprintLab.tsx:384–478`). This is the visible "one fact
feeds several questions" signal from the SDD-005 contract.

Fix: render an absolutely-positioned SVG behind the cards; after layout, group
mini-fact nodes by factId and stroke bezier links (port `drawLines` to a
`useLayoutEffect` + `ResizeObserver`).

### 3 · 10-second pencil nudge — MEDIUM

Blueprint contract (Blåkopi panel): "~10 s forsinket blyantstrek". HTML `openDoc`
sets a 10 s timer adding `.nudged` (dotted underline) to still-un-lifted hotspots
(`blueprint_v1.html:3044–3047`). React `DocumentReader` has no timer; hotspots
carry a static lucide Search icon instead (`BlueprintLab.tsx:270–340`).

Fix: `useEffect` timer on reader open, mark un-lifted runs `nudged` after 10 s,
clear on close.

### 4 · Starvation log beat — MEDIUM-LOW

HTML logs at both `foodBoxes === 1` and `foodBoxes <= 0` (the "Kjøleskapet: lyset,
en halv pakke smør … knekkebrød stående" line) — `blueprint_v1.html:2625–2631`.
React only logs at `foodBoxes === 1` (`blueprintEngine.ts:583–586`). The empty-
fridge beat — a key "subsists, doesn't flourish" thesis line — never fires.

### 5 · FLAVOR lines dropped — LOW

HTML FLAVOR has 7 entries (`blueprint_v1.html:2558–2566`); `blueprintFlavor` has 5
(`index.ts:1022–1028`). Missing: "10:48 — naboen i vinduet …" and "NRK Kveldsnytt
…". Several other log strings were also trimmed of trailing prose (e.g. "Ikke
Franks.") — content fidelity, not behavior.

### 6 · Spyglass cursor — LOW

HTML `.ev` uses a custom magnifier-SVG cursor (`blueprint_v1.html:584–588`). React
swaps in an inline Search/Sparkles icon. Different affordance; pick one
deliberately.

### 7 · Question-state pill color — LOW

HTML colors the pill gold / blue / none by state (`blueprint_v1.html:3139–3144`).
React hardcodes `gold` (`BlueprintLab.tsx:407`).

### 8 · "For tidlig?" badge condition — LOW

HTML gates on `early && !doorOpened && ck_rutine.good === 0`
(`blueprint_v1.html:3240`). React drops the `ck_rutine.good === 0` clause
(`BlueprintLab.tsx:520`), so the warning can show even after a routine has opened
the door.

### 9 · Toast lifecycle — LOW

HTML toasts auto-fade after 5.2 s and clicking a fact/hypo toast navigates to that
surface (`blueprint_v1.html:2932–2947`). React `Notices` only dismiss on click,
with no auto-timeout and no deep-link (`BlueprintLab.tsx:988–1011`).

## Acceptance

- Gap 1: fatting a vedtak places a re-readable VEDTAK document on the pulten that
  lists the tiltak and the hypotheses laid to ground. (Behavioral — required.)
- Gaps 2–3: connector lines render on the questions board; un-lifted hotspots gain
  the pencil nudge ~10 s after a document opens. (Contract — strongly wanted.)
- Gap 4: empty-fridge log beat fires when boxes run out.
- Gaps 5–9: content + cosmetic parity, batchable.

## Out of scope

The `▦ Blåkopi` dev overlay (`blueprint_v1.html:1382–1408`) — a prototype-only
authoring panel, intentionally not ported.
