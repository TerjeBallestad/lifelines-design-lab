# Blueprint v1 → Godot — 1:1 port spec

Date: 2026-06-25
Status: Implementation spec
Source of truth: `prototypes/blueprint_v1.html` (3497 lines, single file)
Target: `../lifelines-core-loop` (Godot 4.5.x)
Related: `docs/sdd/godot-port-risks.md` (the two risks), `docs/sdd/blueprint-prototype-v1.md` (design intent), `lifelines-project-map` memory (SDD-003/004/005, tone law)

This document is a **mechanical, behavior-exact** description of what the prototype does, mapped to a Godot node/autoload/resource layout. The goal is parity: same data, same numbers, same conditions, same ordering, same visual register. Where the prototype mocks the sim, this port keeps the mock (the real core-loop sim swaps in behind the same contract later — see `godot-port-risks.md`).

"1:1" means: identical visible behavior and identical state transitions. It does **not** mean a literal DOM-to-Control transliteration — replace imperative `renderAll()` with signal-driven re-render, replace HTML strings with scenes. The data layer ports almost verbatim.

---

## 0. Architecture map

The prototype already declares its own four layers (the "Blåkopi" panel, lines 1383–1408). Keep them.

| Prototype layer                        | Lines     | Godot home                                                               | Notes                                                                                                                                 |
| -------------------------------------- | --------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **CONTENT** — pure data dicts          | 1421–2281 | `Resource` classes (.tres) or a `Content` autoload of typed dictionaries | No logic. Documents, hotspots, facts, questions+hypotheses, tiltak, dispatches, chat, clocks, prologue, script, slot labels, domains. |
| **STATE** — one `state` object         | 2287–2320 | `GameState` autoload (singleton)                                         | Single source of truth. Emits `changed` after every mutation batch.                                                                   |
| **ENGINE** — pure functions over state | 2326–2538 | `CaseEngine` (static funcs or autoload)                                  | Mutate `GameState`, return result structs. No node/scene access.                                                                      |
| **SIM (mock)**                         | 2544–2709 | `Sim` autoload, `sim_tick()`                                             | Authored event pools + need drift + tiltak modifiers. Replaced by real core-loop later via `sim_tick(day, tiltak) → events + state`.  |
| **DAY / SCRIPT / END**                 | 2715–2883 | `DayDirector` (or part of `Sim`)                                         | `advance_day()`, `SCRIPT` beats, `end_game()`.                                                                                        |
| **UI** — per-surface render            | 2889–3494 | Scenes + signals                                                         | One state, six surfaces, modal overlays, toasts. Each surface re-renders on `GameState.changed`.                                      |

**Core rule that replaces `renderAll()`:** every engine mutation finishes by emitting `GameState.changed`. Every surface scene connects to `changed` and rebuilds itself. Toasts and modal navigation are separate one-shot signals (they are side effects, not state). This is the only structural deviation from the prototype, and it is mandatory in Godot.

---

## 1. CONTENT layer — Resources

Port each dictionary as a typed Resource (recommended for the authoring pipeline in `godot-port-risks.md`) or, for a fast first pass, as `Dictionary` constants on a `Content` autoload keyed by the same string ids. **The string ids are part of the contract — do not rename them.** They are referenced cross-table (facts → questions, hypotheses → tiltak, dispatches → docs).

### 1.1 Domains (line 1450)

Ordered list, drives column order in Sakens fakta and icon/color lookup:

```
["Økonomi/bolig", "Hverdag/rutine", "Helse/risiko", "Nettverk/sosialt", "Ressurser"]
```

Domain icon + color table (`DOMAIN_ICONS`, lines 2892–2898):

| Domain           | Glyph | Color var                 |
| ---------------- | ----- | ------------------------- |
| Økonomi/bolig    | ●     | `--hint-gold` `#c89a2e`   |
| Hverdag/rutine   | ⌂     | `--hint-green` `#7aa66f`  |
| Helse/risiko     | ✚     | `--hint-warn` `#c86244`   |
| Nettverk/sosialt | ☎     | `--hint-blue` `#5b7fc4`   |
| Ressurser        | ✦     | `--hint-purple` `#a57bc2` |

Glyphs render as a bordered round badge (`.dico`, lines 493–504). In Godot use the same unicode glyphs in a small `Panel`+`Label` or a custom-drawn chip; or swap for authored sprite icons later.

### 1.2 Fact (`FACTS`, lines 1459–1728) — 30 facts

```gdscript
class_name FactDef extends Resource
@export var id: StringName          # dict key, e.g. f_grete_syk
@export var domain: String          # one of DOMAINS
@export var cat: String             # Dokument | Risiko | Økonomi | Samtale | Observasjon | Ressurs
@export var text: String            # saksspråk (the case-language summary)
@export var quote: String           # original ordlyd (verbatim source phrase)
@export var supports: Array[StringName]   # question ids this fact backs
@export var discuss: Array[String]        # ["Frank"] and/or ["Grete"]
```

`supports` drives which question columns a fact appears under (`factsFor`). `discuss` drives the "KAN DRØFTES MED" block in the fact-detail modal. Port all 30 verbatim — text, quote, domain, cat, supports, discuss exactly as authored. (These are the writing; the Norwegian register is the product.)

### 1.3 Document (`DOCUMENTS`, lines 1731–1849) — 8 authored + generated

```gdscript
class_name DocDef extends Resource
@export var id: StringName
@export var kind: String            # BEKYMRINGSMELDING | ØKONOMISK OVERSIKT | BREV | FELTNOTAT | RAPPORT | MELDING | VEDTAK | STATUSRAPPORT
@export var title: String
@export var reg: String             # register class: reg-klinisk | reg-bank | reg-formell | reg-notat | reg-vedtak
@export var peek: String            # one-line teaser shown on the desk card
@export_multiline var head: String  # frame-title block
@export_multiline var body: String  # prose with embedded hotspots
@export var hotspots: Array[StringName] # fact ids embedded in body (precompute; see below)
```

**Hotspots.** In HTML the body contains `<span class="ev" data-fact="f_xxx">…</span>`. In Godot the body is a `RichTextLabel` with BBCode; each hotspot becomes `[url=fact:f_xxx]…[/url]`. This is already the fixture mechanic in core-loop (`[url=entity:]`/`[url=phrase:]` → `meta_clicked`; see `godot-port-risks.md`). Authoring pipeline emits both HTML and bbcode from one markdown source with `{ev:f_xxx}…{/ev}` syntax.

Precompute `hotspots` (the list of fact ids in each body) so the desk card can show the `evGot/evTotal merket` counter without regex over rendered text. In the prototype this is `(body.match(/data-fact/g)).length` for total and the collected subset for got (lines 3013–3016).

Authored documents (8): `doc_bekymring`, `doc_konto`, `doc_papirer`, `doc_huseier`, `doc_frank_tlf`, `doc_frank_visit`, `doc_innleggelse`, `doc_dodsfall`. Generated at runtime: `doc_vedtak_N` (per vedtak, in `enact_vedtak`) and `doc_status` (in `end_game`).

### 1.4 Question + Hypotheses (`QUESTIONS`, lines 1852–2015) — 7 questions

```gdscript
class_name QuestionDef extends Resource
@export var id: StringName
@export var title: String
@export var appearsOn: Array[StringName]  # fact ids that REVEAL this question when first lifted
@export var hypos: Array[HypoDef]
```

```gdscript
class_name HypoDef extends Resource
@export var id: StringName
@export var label: String
@export var needs: Array[StringName]      # fact ids required to make this hypo selectable (else redacted)
@export var opens: Array[StringName]      # tiltak ids this hypo gives grounds for
@export_multiline var note: String        # the Arbeidshypotese prose shown when chosen
```

Questions: `q_okonomi`, `q_bolig`, `q_hverdag`, `q_selv`, `q_kontakt`, `q_kollaps`. (Six in `QUESTIONS`; `q_kollaps` is revealed by `f_dod` and/or forced on day 5.)

**Redacted hypotheses (Roottrees-style):** when `needs` are not all present, the hypothesis is shown as a redacted (struck) line, not readable, with `uleselig — mangler N faktum` (lines 3159–3162). It is not selectable. This is a visible-unknown, not a hidden option.

### 1.5 Tiltak (`TILTAK`, lines 2018–2113) — 10 measures

```gdscript
class_name TiltakDef extends Resource
@export var id: StringName
@export var slot: String            # s1 | s2 | s3 | press
@export var title: String
@export var cost: int               # mynter/mnd
@export var needs: Array[StringName]      # fact ids required (else blocked, "mangler grunnlag")
@export var needsHypo: Array[StringName]  # any-of hypo ids must be chosen (s1/s2 require an opinion)
@export var needsVisit: bool        # requires doc_frank_visit done
@export var early: bool             # t_telefon only — shows "for tidlig?" pill
@export_multiline var desc: String
@export var sim: String             # sim modifier key (informational; cover() reads tiltak list directly)
```

Slots and labels (`SLOT_LABELS`, lines 2115–2120):

- `s1` — BOLIG/ØKONOMI-SIKRING: `t_bostotte` (0), `t_forvaltning` (1), `t_huseier` (0)
- `s2` — ERSTATT GRETES USYNLIGE ARBEID: `t_hjemmehjelp` (2), `t_matlevering` (1), `t_dokgjennomgang` (1)
- `s3` — SKJØR SELVSTENDIG RUTINE: `t_brev` (0, needsVisit), `t_regning` (0, needsVisit), `t_telefon` (0, early)
- `press` — ALLTID TILGJENGELIG, ALDRI AUTOMATISK RIKTIG: `t_institusjon` (0)

### 1.6 Dispatch (`DISPATCHES`, lines 2123–2178) — 7 Frank missions

Each costs **1 action**. `avail` is a predicate over state (port as a method/lambda). `result` is one of: `{doc, delay}`, `{fact, log}`, or `{special}`.

| id              | avail (summary)                                                                                | result                         |
| --------------- | ---------------------------------------------------------------------------------------------- | ------------------------------ |
| `d_ring_grete`  | no `doc_frank_tlf` and `greteStage < 4`                                                        | doc `doc_frank_tlf`, delay 0   |
| `d_konto`       | no `doc_konto`, none pending, `greteStage < 4`                                                 | doc `doc_konto`, delay 1       |
| `d_besok`       | has `doc_frank_tlf`, no `doc_frank_visit`, none pending, `greteStage < 4`                      | doc `doc_frank_visit`, delay 1 |
| `d_ring_elling` | no fact `f_ubesvart`, `greteStage >= 4`                                                        | fact `f_ubesvart` + log line   |
| `d_papirer`     | `greteStage >= 5`, no `doc_konto`, no `doc_papirer`, (`sim.doorOpened` or has `t_hjemmehjelp`) | doc `doc_papirer`, delay 0     |
| `d_besok_alene` | `greteStage >= 5`                                                                              | special `visit_after`          |
| `d_bostotte_f`  | has `t_bostotte` and `!ck_bostotte.done`                                                       | special `bostotte_push`        |

### 1.7 Chat (`CHAT`, lines 2181–2236) — 9 Frank Q&A

```gdscript
{ id, needs: fact_id, q, a }   # a is bbcode-capable (c_avstand embeds a hotspot f_dor_glott)
```

Free (no action). A chat entry is askable when its `needs` fact is present and `id` not in `state.asked`. Asking pushes `{who:"DEG", text:q}` and `{who:"FRANK", text:a}` to `chatLog`. Note `c_avstand`'s answer contains a liftable hotspot (`f_dor_glott`) — facts can be lifted from chat, not just documents.

### 1.8 Clocks (`CLOCK_DEFS`, lines 2239–2281) — 5 clocks

Paired progress clocks (SDD-003). Fill only, never reverse.

| id            | name                    | good (label,size)          | bad (label,size)     | showWhen              |
| ------------- | ----------------------- | -------------------------- | -------------------- | --------------------- |
| `ck_bostotte` | Bostøtte sak            | Søknad komplett, 4         | Frist glipper, 4     | has `t_bostotte`      |
| `ck_overfort` | Gretes arbeid overføres | Funksjoner overført, 6     | Alt går via Grete, 6 | has `doc_frank_tlf`   |
| `ck_rutine`   | Skjør rutine            | Rutine tåler støtte, 4     | Presset for hardt, 4 | any s3 tiltak enacted |
| `ck_restanse` | Husleierestanse         | —                          | Restanse bygges, 6   | has `doc_huseier`     |
| `ck_grete`    | Grete tilgjengelig      | scenario, size 5, stages[] | —                    | always                |

`ck_grete` is a **scenario clock**: it shows `greteStage` (1..5) of 5 filled segments, with `stages` labels `["Grete bærer alt","Grete blir sliten","Grete avlyser","Grete er innlagt","Grete er død"]`. Pressure without a visible countdown (stage ≤2 shows the question `q`, stage ≥3 shows `stages[stage-1] + "."`).

### 1.9 Prologue (`PROLOGUE`, lines 1421–1448) + Script (`SCRIPT`, lines 2715–2750)

`PROLOGUE` — 16 beats: `{cap}` caption, `{who,say}` line, `{dir}` stage direction, final `{stamp,end}`. `SCRIPT` — day-keyed beat functions (see §4.3).

---

## 2. STATE — `GameState` autoload

Port the `state` object (lines 2287–2320) verbatim. Use typed members or a backing `Dictionary`; either way preserve every field and its initial value.

```gdscript
extends Node   # autoload: GameState
signal changed                 # emitted after each engine mutation batch
signal toast(t: Dictionary)    # one-shot side effect
signal reflection_requested    # end-game screen

var day := 1
var actions := 2
var phase := "play"            # play | ended
var greteStage := 1            # 1..5, drives ck_grete + sim branch
var docs := {}                 # docId -> { day:int, read:bool, isNew:bool }
var pending: Array = []        # [{ day:int, doc:StringName }]
var facts := {}                # factId -> { day:int, fresh:bool }
var unread := 0                # fakta badge count
var questions := {}            # qId -> { visible:bool, hypo:StringName|null }
var chatLog: Array = []        # [{ who, text }]
var chatUnread := 0            # (declared, unused in v1)
var asked: Array = []          # chat ids asked
var dispatched: Array = []     # one-shot dispatch ids used
var draft: Array = []          # tiltak chosen in form, not yet enacted
var tiltak: Array = []         # enacted tiltak
var vedtakCount := 0
var clocks := {
    ck_bostotte = { good=0, bad=0, done=false, failed=false },
    ck_overfort = { good=0, bad=0 },
    ck_rutine   = { good=0, bad=0 },
    ck_restanse = { bad=0 },
}
var sim := {
    needs = { hunger=72, energy=64, social=30, security=55 },
    foodBoxes = 7,
    mail = 9,
    unanswered = 2,
    doorOpened = false,
    visitLevel = 0,            # 0 none · 1 snapshot · 2 ongoing
    logg = [],                 # [{ day, text, kind }]  kind: obs | tiltak | frank
    # transient flags set during sim_tick — declare with defaults:
    tiradeLogged = false,
    instLogged = false,
    forvLogged = false,
}
var activeSurface := "pulten"
var endText := {}              # { para1, para2, closing } set by end_game
```

Note: `ck_grete` is NOT in `state.clocks` — it derives entirely from `greteStage`. `endText` and the transient `sim` flags (`tiradeLogged/instLogged/forvLogged`) are created on the fly in JS; declare them up front in GDScript.

---

## 3. ENGINE — `CaseEngine` (pure over GameState)

Port each function verbatim. They mutate `GameState` and return result structs; the UI layer reads results to fire toasts and navigate. None touches a node. After a UI-driven engine call completes, the caller emits `GameState.changed`.

| Function                        | Lines | Behavior                                                                                                                                                                                                                                                                                                                              |
| ------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `receive_doc(docId)`            | 2326  | If not already present, add `docs[docId] = {day, read:false, isNew:true}`.                                                                                                                                                                                                                                                            |
| `lift_fact(factId)`             | 2331  | If already lifted, return null. Else add `facts[factId]={day,fresh:true}`, `unread++`, and for every question whose `appearsOn` includes this fact and which is not yet visible, set `questions[qId]={visible:true,hypo:null}`. Return `{fact, newQuestions:[...]}`.                                                                  |
| `facts_for(qId)`                | 2346  | All lifted fact ids whose `supports` includes qId.                                                                                                                                                                                                                                                                                    |
| `question_state(qId)`           | 2350  | `"skjult"` if not visible · `"Foreløpig arbeidssvar"` if hypo chosen · `"Delvis belyst"` if ≥2 supporting facts · else `"Åpent"`.                                                                                                                                                                                                     |
| `hypo_available(h)`             | 2357  | All of `h.needs` are lifted facts.                                                                                                                                                                                                                                                                                                    |
| `choose_hypo(qId, hypoId)`      | 2362  | Toggle: if hypo not available, false. Else set `questions[qId].hypo` to hypoId, or null if it was already that id. Hypotheses are provisional — switchable any time.                                                                                                                                                                  |
| `hypo_chosen(hId)`              | 2370  | Any question currently has this hypo chosen.                                                                                                                                                                                                                                                                                          |
| `chosen_hypos()`                | 2374  | List of `{qId, hypo}` for all chosen.                                                                                                                                                                                                                                                                                                 |
| `tiltak_available(tid)`         | 2380  | Returns `{ok, why}`. Blocked reasons in order: already enacted (`iverksatt`); missing required facts (`mangler grunnlag i sakens fakta`); `needsVisit` and no `doc_frank_visit` (`krever gjennomført hjemmebesøk`); `needsHypo` and none of them chosen (`krever arbeidshypotese under: «<first question title>»`). Else `{ok:true}`. |
| `draft_cost()` / `spent_cost()` | 2402  | Sum of `cost` over draft / enacted tiltak.                                                                                                                                                                                                                                                                                            |
| `enact_vedtak()`                | 2409  | See §3.1.                                                                                                                                                                                                                                                                                                                             |
| `run_dispatch(did)`             | 2461  | See §3.2.                                                                                                                                                                                                                                                                                                                             |
| `ask_frank(chatId)`             | 2532  | If found and not asked: push to `asked`, append DEG+FRANK lines to `chatLog`.                                                                                                                                                                                                                                                         |

### 3.1 `enact_vedtak()` (lines 2409–2459)

1. If `draft` empty, return null.
2. Move all draft → `tiltak`, clear draft, `vedtakCount++`.
3. **Clock movement on enact**, per enacted tiltak:
   - `t_bostotte` → `ck_bostotte.good += (doc_konto present ? 2 : 1)`.
   - any `slot==s2` → `ck_overfort.good += (tid==t_hjemmehjelp ? 2 : 1)`.
   - `t_telefon` AND `ck_rutine.good==0` AND `!sim.doorOpened` → `ck_rutine.bad += 2` (pressed too early).
4. Generate `doc_vedtak_<N>`: kind VEDTAK, reg `reg-vedtak`, body lists each tiltak (with coin tag if cost>0), the chosen working hypotheses ("Arbeidshypotese lagt til grunn: …" or "Ingen arbeidshypotese lagt til grunn."), an "iverksettes fra dag N+1" line, and an `IVERKSATT` gold stamp. `receive_doc(docId)`.
5. Return the enacted list.

### 3.2 `run_dispatch(did)` (lines 2461–2530)

1. If `actions < 1` or `!avail(state)`, return null.
2. `actions--`, push to `dispatched`. Build `out = {toasts:[]}`.
3. If `did in [d_ring_grete, d_konto, d_besok]` → `ck_overfort.bad++` (effective, but everything still routes through Grete — the clock notes it).
4. `result.doc`: delay 0 → `receive_doc` now + toast "NYTT DOKUMENT PÅ PULTEN / <title>"; delay>0 → push `{day:day+delay, doc}` to pending + toast "FRANK ER I GANG / Svar ventes i morgen."
5. `result.fact`: `lift_fact`, `sim.unanswered++`, toast "FAKTUM LAGT TIL · <domain> / <text>" (kind fact); if `result.log`, push log line (kind frank).
6. `special == bostotte_push`: `ck_bostotte.good++`, toast "BOSTØTTE SAK / Søknaden rykker frem."
7. `special == visit_after`: `opened = has t_hjemmehjelp OR ck_rutine.good>0`.
   - opened: `sim.doorOpened=true`, `sim.visitLevel=2`, `social = min(100, social+8)`, push two frank log lines ("Frank ringte på. Det tok fire minutter. Så gikk låsen." / "De sa ingenting om Grete…"), toast "FELTNOTAT / Døren gikk opp…".
   - not opened: `ck_rutine.bad = min(4, bad+1)`, push one frank log line ("Frank ringte på. Ingen lyd…"), toast "FELTNOTAT / Ingen åpnet…".
8. Return `out` (UI fires the toasts).

---

## 4. SIM (mock) + DAY loop

### 4.1 `cover()` (lines 2544–2556) — what the vedtak currently covers

```
channel    = has t_hjemmehjelp OR ck_rutine.good>0 OR sim.doorOpened
money      = has t_forvaltning OR ck_bostotte.done OR has t_huseier
food       = has t_matlevering
dok        = has t_dokgjennomgang
routine    = any enacted tiltak with slot==s3
institusjon= has t_institusjon
```

### 4.2 `sim_tick()` (lines 2572–2709) — runs at end of each `advance_day`

Branch on `greteStage`. `log(text, kind="obs")` appends `{day, text, kind}` to `sim.logg`. `flavor()` cycles the 7-line `FLAVOR` pool (lines 2558–2567) by a module-level index.

**greteStage < 4 (Grete bears it — stable, that's the point):**

- `security = 55`; `hunger = max(hunger, 70)`.
- if `visitLevel>0 and day>=3` → log a flavor line.
- if `day==3 and visitLevel>0` → log the "Grete var på kjøkkenet… kjøttkaker… fire nye bokser" line.
- return.

**greteStage == 4 (innlagt — apartment alone for the first time):**

- `security = 38`; `foodBoxes--`; `mail++`.
- if `visitLevel>0` → log "Ingen kom kl. 16…" and "Telefonen ringte to ganger (Ullevål)…", `unanswered += 2`.
- return.

**greteStage >= 5 (after death — the vedtak is now tested):**

- `mail++`; `security = max(12, security-7)`; `energy = max(20, energy-4)`.
- **Food:** `c.food && c.channel` → boxes `max(boxes,4)`, log "Matlevering 11:00… tatt inn", `hunger=65`. `c.food && !c.channel` → `boxes--`, log "Kassen ble stående i gangen…", `hunger=max(15,hunger-12)`. else → `boxes--`, `hunger = boxes>0 ? max(40,hunger-6) : max(10,hunger-15)`; box-count flavor logs at `boxes==1` and `boxes<=0`.
- **Mail/dok:** `c.dok` → `mail=max(0,mail-3)`, log "Dokumentgjennomgang…". else if `mail>12` → log "Postbunken har veltet…".
- **Channel/hjemmehjelp:** `c.channel && has t_hjemmehjelp` → log "Frank 14:00, fast tid…", `social=min(45,social+4)`. else if `!c.channel` → log "Banking på døren (nabo)… E. frøs…", `unanswered++`.
- **Brevrutine:** `c.routine && has t_brev && c.channel` and `ck_rutine.good<4` → `ck_rutine.good++`, log the step at index `good-1` from the 4-line `steps` array (the 4th step embeds hotspot `f_egen_mappe`). `c.routine && has t_brev && !c.channel` → log "Brevrutinen forutsetter at noen kommer inn…".
- **Telefon tirade:** `has t_telefon && ck_rutine.bad>=2 && !sim.tiradeLogged` → set flag, log the tirade line (embeds hotspot `f_tirade`).
- **Institusjon:** `c.institusjon && !sim.instLogged` → set flag, log "Kartleggingsskjema for omsorgsbolig…".
- **Penger:** `!c.money` → `ck_restanse.bad=min(6,bad+1)`; at `bad==3` log "Ny lapp fra Bakkerud…". else if `has t_forvaltning && !sim.forvLogged` → set flag, log "Forvaltningskontoret har overtatt…".
- finally log a flavor line.

Logs that embed `[url=fact:…]` (`f_egen_mappe`, `f_tirade`) make those facts liftable from the Leiligheten logg — preserve the hotspot decoration there.

### 4.3 `SCRIPT` beats (lines 2715–2750)

| Day | Effect                                                                          | Toast(s) (kind day)                                                |
| --- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 2   | `greteStage=2`                                                                  | —                                                                  |
| 3   | `greteStage=3`                                                                  | "BESKJED FRA FRANK / Grete skulle ringe tilbake… Hun ringte ikke." |
| 4   | `receive_doc(doc_innleggelse)`, `greteStage=4`                                  | "MELDING FRA ULLEVÅL / Grete er innlagt."                          |
| 5   | `receive_doc(doc_dodsfall)`, `greteStage=5`, force-reveal `q_kollaps` if absent | "MELDING FRA ULLEVÅL / Grete Olsen er død."                        |
| 6   | `receive_doc(doc_huseier)`                                                      | "NY POST PÅ PULTEN / Håndskrevet brev · T. Bakkerud"               |
| 8   | `end_game()`                                                                    | —                                                                  |

### 4.4 `advance_day()` (lines 2752–2798)

1. If `phase != "play"`, return [].
2. `day++`; `actions = 2`; start toasts with `{tag:"DAG "+day, text:dayName(day), kind:day}`.
3. **Deliveries:** for each pending whose `day <= state.day`, `receive_doc`; if doc is `doc_frank_visit`, `sim.visitLevel = max(visitLevel, 1)`; toast "NY POST PÅ PULTEN / <title>". Remove delivered from pending.
4. **Bostøtte clock:** if `has t_bostotte and !done and !failed`: if `good>=4` → `done=true`, toast "Søknad komplett. Under behandling."; else if `greteStage>=4` → `bad++`, and if `bad>=4` → `failed=true`, toast "Fristen glapp…".
5. **Script:** run `SCRIPT[day]` if present, append its returned beats.
6. `sim_tick()`.
7. Return toasts.

`dayName(d)` (lines 2800–2812): 1 Torsdag…, 2 Fredag, 3 Lørdag…, 4 Søndag, 5 Mandag, 6 Tirsdag, 7 Onsdag, 8 Torsdag. En uke. (else "Dag "+d).

### 4.5 `end_game()` (lines 2818–2883)

Sets `phase="ended"`. Picks `para1/para2/closing` from `cover()` + clock state, in this priority order:

1. `c.institusjon` → institution ending.
2. `c.money && (c.channel || ck_rutine.good>0)` → housing secured + a channel/routine.
3. `c.money` only → "Vedtaket var riktig utfylt. Det var ikke nok." (interpolates remaining foodBoxes + unanswered).
4. `c.channel || c.food || c.dok` → "Hverdagen har fått stillas. Grunnmuren har ingen." (interpolates restanse `bad`/6).
5. else → "Bekymringsmeldingen var berettiget. Det er den fortsatt."

Then build `doc_status` (kind STATUSRAPPORT, reg `reg-notat`, body = the three paragraphs), `receive_doc(doc_status)`, store `endText`. UI then shows the reflection screen. **No win state** — the ending is a question, per tone law.

---

## 5. UI — scenes & signals

One `Main` scene; six surfaces; modal overlays on a `CanvasLayer`. Each surface connects to `GameState.changed` and rebuilds. `GameState.toast` → toast spawner. `GameState.reflection_requested` (or check `phase=="ended"` after next-day) → reflection overlay.

### 5.1 Scene tree

```
Main (Control, full rect, bg = --desk-dark)
├─ Prologue (Control overlay)              # story-overlay, shown first
├─ App (Control, hidden until startGame)
│  ├─ Topbar (HBox)
│  │  ├─ CaseHead   # SAK 99/0412 · OLSEN, ELLING + sub + tiltaksramme/disponert
│  │  ├─ Resource(day)        # res-day
│  │  ├─ Resource(actions)    # res-actions
│  │  └─ NextDay (button)     # btn-next-day "→ neste dag"
│  ├─ Tabs (HBox of 6 TabButton, each with optional Badge)
│  └─ Surfaces (one child visible at a time)
│     ├─ Pulten        # desk-docs flow + desk-note
│     ├─ Fakta         # 5 domain columns
│     ├─ Sporsmal      # QuestionBoard: LineLayer (_draw) + QCards (VBox)
│     ├─ Vedtak        # VedtakForm (slots) + Clocks
│     ├─ Frank         # Dispatch list + Chat (log + ask buttons)
│     └─ Leiligheten   # apt-state (needs + objects) + apt-logg
└─ Overlays (CanvasLayer)
   ├─ ReaderOverlay    # document modal
   ├─ FactOverlay      # fact-detail modal
   ├─ Toasts (VBox, bottom-right)
   └─ Reflection (Control overlay)
```

`Blåkopi` dev panel (lines 1382–1408, 3480–3481) is a documentation artifact, not gameplay — port as an optional debug overlay or drop.

### 5.2 Surface-by-surface render contracts

**Topbar / badges** (`renderBadges`, lines 3419–3439):

- `res-day` = day, `res-actions` = actions.
- DISPONERT = spent coins (or —).
- Badge fakta = `unread`. Badge sporsmal = count of visible questions with no hypo chosen AND at least one available hypo. Badge frank = count of askable chat (fact present, not asked). Hide badge when 0.

**Tabs** (lines 1304–1335, `showSurface` 2985–3001): six tabs — Pulten, Sakens fakta, Åpne spørsmål, Vedtak og tiltak, Frank, Leiligheten. Clicking a tab sets `activeSurface` and switches visible surface. Switching to **fakta** sets `unread=0` and clears every fact's `fresh` flag (after a 50 ms tick, so the "fresh" gold border shows once then settles).

**Pulten** (`renderDesk`, lines 3005–3032): one card per doc in `state.docs` (insertion order). Card shows NY stamp if `isNew`, `<kind> · DAG <day>`, title, peek, and `evGot/evTotal merket` if the doc has hotspots. `read-done` dims read cards. Each card has a deterministic rotation `(((i*137)%50)-25)/10` degrees (cache per id in `DOC_ROT`). Clicking opens the reader. `desk-note`: greteStage≥5 → "Mappen er tyngre…"; day==1 → "Én melding. Én pult. Begynn der."; else empty.

**Document reader** (`openDoc`/`closeDoc`, lines 3036–3059): modal. On open, mark `read=true, isNew=false`. Apply the `reg-*` register style. Render `head` + `body` bbcode in a `RichTextLabel`. Decorate hotspots (see §6). Start a 10 s nudge timer: after 10 s, uncollected anchors get a faint dotted underline (`nudged`). Clicking the dim backdrop or LUKK closes. On close, re-render desk + badges.

**Sakens fakta** (`renderFakta`, lines 3098–3122): 5 columns in DOMAINS order. Each column header shows domain name + count (or —). Each fact → a `fact-chip` (alternating ±rotation): domain icon + text, italic quote, "<cat> · dag <day> · kan drøftes med: <discuss>". `fresh` facts get a gold border. Click → fact-detail modal.

**Fact-detail modal** (`openFact`, lines 3062–3089): domain icon + `<domain> · <cat> · DAG <day>`, text, quote. "HENGER SAMMEN MED" → the fact's `supports` questions that are currently visible (click → go to Sporsmal). "KAN DRØFTES MED" → Frank (clickable → Frank surface) and/or Grete (non-clickable: `✝ — ikke lenger mulig` if greteStage≥5, else `○ — i en senere utgave`). "KILDE" → the source document (find the doc whose body contains this fact's anchor; click → open it).

**Åpne spørsmål** (`renderQuestions`, lines 3125–3171): one `q-card` per visible question. State pill (gold "Foreløpig arbeidssvar" / blue "Delvis belyst" / plain "Åpent"). Title. Supporting fact chips (`q-fact-min`, yellow `--mark` background, clickable → fact modal; carry `data-line-fact` for line drawing); if <2 facts, append a dashed "… saken mangler grunnlag" chip. Hypothesis list: each hypo is `chosen` (☒, gold) / available (☐) / blocked (redacted struck label + "uleselig — mangler N faktum", not clickable). Selecting an available hypo toggles it; when chosen, render the `arbeidshypo` block (note prose + "→ GIR GRUNNLAG FOR: <tiltak titles>" if `opens` non-empty). Choosing fires toast "ARBEIDSHYPOTESE NOTERT / <label>" (only when selecting, not deselecting).

**Connection lines** (`drawLines`, lines 3183–3209): facts used in ≥2 questions are linked with dashed bezier curves (Blake Manor style), color-cycled through `[#c89a2e,#5b7fc4,#a57bc2,#7aa66f,#c86244]`. In Godot: a `Control` behind the cards overriding `_draw()`, collecting the rects of all `q-fact-min` nodes grouped by fact id, drawing a cubic bezier (`draw_polyline` over sampled `_b()` points, or `draw_bezier`) between consecutive same-fact chips. Recompute on layout change / resize / re-render (defer one frame so rects are laid out — `await get_tree().process_frame`). Nodes are NOT draggable in v1.

**Vedtak og tiltak** (`renderVedtak`, lines 3215–3267): title "VEDTAK <N+1> · UTKAST". Four slot sections in order s1,s2,s3,press, each with its `SLOT_LABELS` header. Each tiltak → a `tiltak-card`: checkbox state (☒ enacted/`active-now` green, ☒ draft/`chosen` gold, ☐ blocked/available), title + "iverksatt" pill if enacted + "for tidlig?" warn pill if `early && !doorOpened && ck_rutine.good==0`, desc, blocked reason "▸ <why>" if blocked, coin cost. Clicking an available non-enacted card toggles draft (`toggleDraft`). Footer: "FATT VEDTAK (<n> tiltak)" button (enabled iff draft non-empty and phase play) + "RAMME:" showing spent (`spent` coins) + remaining of 6. `toggleDraft` enforces `spent+draft+cost <= 6` (else toast "TILTAKSRAMME / Seks mynter i måneden. Noe må ut."). `uiEnact` → `enact_vedtak` → toast "VEDTAK FATTET / <n> tiltak iverksettes fra i morgen."

**Clocks** (`renderClocks`, lines 3287–3308): for each clock with `showWhen` true. Scenario clock (`ck_grete`): `greteStage` filled / 5 (unfilled = dashed "unknown"); caption = `q` if stage≤2 else `stages[stage-1]+"."`. Other clocks: name, question, and a `segRow` for good (green fill) and/or bad (warn fill), each `min(value,size)` of `size` segments. Footer note "En klokke er ikke et måltall…".

**Frank** (`renderFrank`, lines 3311–3345): left = dispatch list. Header "SEND FRANK · 1 HANDLING PER OPPDRAG · <actions> IGJEN I DAG". One `dispatch-card` per `avail` dispatch (title, desc, "SEND · 1 HANDLING" button disabled if `actions==0` or phase≠play). If none available, "Ingen oppdrag akkurat nå…". Right = chat: header, scrollable `chat-log` (DEG right-aligned, FRANK left), then ask buttons for each askable chat entry. Decorate hotspots inside chat (the `f_dor_glott` anchor). Auto-scroll log to bottom.

**Leiligheten** (`renderApt`, lines 3359–3416): if `visitLevel==0` → locked panel ("Kommunen har ikke innsyn… Et hjemmebesøk er den eneste veien inn…"). Else two columns:

- apt-state: "ELLING · ANSLAG" frame (header meta = "LØPENDE — FRANK HAR KANAL INN" if visitLevel==2 else "SIST OBSERVERT VED BESØK — TALL ER ANSLAG"), 4 need bars (Mat/hunger, Krefter/energy, Kontakt/social, Trygghet/security) with fill color crit `<25` / low `<45` / else green, value `~round(v)`; plus "SIMULERINGEN ER MOCKET…" footnote. "LEILIGHETEN · AMMERUDVEIEN 47 · 4. ETG" frame: Postbunken (`mail` brev, warn if >11), Middagsbokser (`max(0,foodBoxes)`, warn if ≤1), Ubesvarte anrop (`unanswered`, warn if >4), Døren ("går opp for Frank" / "lukket"), Gretes stol ("pleddet brettet").
- apt-logg: "Logg · det kommunen vet" (meta DAGLIG if visitLevel==2 else FRAGMENTARISK), entries grouped by day (`DAG <d> · <WEEKDAY>`), tiltak-kind lines tinted. Decorate hotspots in logg.

**Prologue** (`renderPrologue`/`nextBeat`/`startGame`, lines 2949–2982): show `PROLOGUE` beats up to `prologueIdx` (starts at 1 — caption + first line together). VIDERE › advances; HOPP OVER skips to game. Final beat (stamp) shows "TIL PULTEN" → `startGame`: hide prologue, show app, `receive_doc(doc_bekymring)`, render. Auto-scroll to newest line.

**Reflection** (`showReflection`, lines 3450–3478): on phase ended after next-day. Caption "DAG 8 · SAKEN FORTSETTER", para1, para2, a clock summary (filled/empty squares for the 7 numeric clock tracks), the closing line large, "SE PÅ SAKEN" (dismiss, keep inspecting) + "START PÅ NYTT" (reload/restart).

### 5.3 Coins & shared widgets

- `coins(n, cls)` (lines 2903–2907): n round gold coin glyphs (or — if 0); `spent` class = faded. Render as small textured circles or a custom-drawn chip row.
- `dico(domain)`: the bordered domain glyph.
- Pills / tags / stamps: theme variations (see §7).

---

## 6. Hotspot lift mechanic (the heart — SDD-004)

This is the one interaction that must feel identical. In HTML it's a single delegated click listener (lines 2910–2923) over any `.ev` span anywhere (documents, chat, logg).

Godot implementation:

1. Hotspots are bbcode `[url=fact:<id>]text[/url]` inside `RichTextLabel`s with `meta_clicked` connected.
2. On `meta_clicked("fact:<id>")`: if fact already lifted, ignore. Else `lift_fact(id)`; mark that anchor `collected`; fire toast "FAKTUM LAGT TIL · <domain> / <text>" (kind fact); for each newly-revealed question, fire toast "ÅPENT SPØRSMÅL / <title>" (kind hypo); emit `changed`.
3. **Decoration** (`decorateEvs`, lines 2925–2929; re-applied on each render): an anchor whose fact is already lifted renders as highlighter-yellow `[bgcolor=#fff8b0]` **and is no longer a link** (no spyglass, not clickable). Yellow appears ONLY after lift — never before.
4. **Spyglass cursor:** on `meta_hover_started` over an uncollected anchor, set the magnifier cursor (the prototype's inline SVG, lines 586–588 — a circle + handle; bake to a small PNG/SVG and `Input.set_custom_mouse_cursor` with hotspot at the lens center). Restore on `meta_hover_ended`.
5. **Nudge:** 10 s after a document opens, uncollected anchors get a faint dotted underline (`nudged`). In bbcode, re-render those anchors with `[u]` + dim color, or overlay. No glow, ever (SDD-004 law).

Because bbcode anchor styling is global-ish, the cleanest port is: build each body by walking authored segments and emitting per-anchor bbcode based on `(lifted? yellow+plain : link)` and `(nudge elapsed? underline)`. Re-render the open document on `changed` and on the nudge timer firing.

---

## 7. Visual register (port-risk §1 — "meh documents" is fixable)

The paper-and-ink look is not decoration; it's the product. Replicate the CSS `:root` exactly.

**Palette** (lines 10–30):

| var           | hex     | use                   |
| ------------- | ------- | --------------------- |
| --paper       | #f5f1e8 | document/card base    |
| --paper-shade | #ece7d8 | secondary panels      |
| --paper-fold  | #dcd5c2 | inactive tab          |
| --ink         | #2a2520 | text, borders         |
| --ink-dim     | #6b6259 | secondary text        |
| --ink-faint   | #a49a8c | tertiary / dashed     |
| --desk        | #463c31 | desk wood             |
| --desk-dark   | #382f26 | body bg               |
| --hint-gold   | #c89a2e | primary accent, coins |
| --hint-warn   | #c86244 | risk / bad clocks     |
| --hint-green  | #7aa66f | good clocks, needs ok |
| --hint-blue   | #5b7fc4 | day toasts, partial   |
| --hint-purple | #a57bc2 | Ressurser             |
| --hint-lock   | #9b9387 | disabled / locked     |
| --mark        | #fff8b0 | highlighter yellow    |

**Fonts — four registers** (the single most important fidelity fix, port-risk §1.2):

| Role                            | Family              | Godot                                              |
| ------------------------------- | ------------------- | -------------------------------------------------- |
| hand-1 (body)                   | Kalam               | import MSDF (msdf=true), theme variation `DocBody` |
| hand-2 (annotation/handwriting) | Caveat              | **MSDF variant** (the raster one is the blur bug)  |
| hand-3 (labels/pills/tags/meta) | Architects Daughter | small caps look via letter-spacing + uppercase     |
| hand-title (titles/kind)        | Gloock (serif)      | titles, doc `kind`, case head                      |

Core-loop currently ships only Caveat raster at one size — that's why documents read flat. Import all four as MSDF, build theme type variations per register.

**Paper styling** (port-risk §1.3): asymmetric wobble borders (e.g. `border-radius: 4px 7px 5px 8px` — fake with a wobble NinePatch or a hand-drawn border texture), 2–3px ink stroke, offset drop shadow (`box-shadow: 2px 3px 0`), slight card rotation (±0.x°). `reg-notat` = ruled-paper repeating gradient + red left margin line (canvas shader or NinePatch). Stamps = rotated bordered Labels (`IVERKSATT`, `NY`, `MOTTATT`). Pills/tags = theme variations with colored borders.

**Register styles** (`reg-*`, lines 421–474): `reg-klinisk` Kalam body; `reg-bank` shaded bg + Architects Daughter + tables; `reg-formell` Kalam + letter-spacing; `reg-notat` ruled paper + Caveat 18.5px + red margin; `reg-vedtak` Kalam.

---

## 8. Numbers & ordering that must port exactly

- Resources: 2 actions/day, reset each day. Dispatch = 1 action. Hypo-choice, ask-Frank, enact-vedtak, lift-fact = free.
- Tiltaksramme: 6 mynter/mnd cap. Costs: forvaltning 1, hjemmehjelp 2, matlevering 1, dokgjennomgang 1, all others 0.
- Day arc fixed: 1 start, 2 stage2, 3 stage3, 4 innleggelse, 5 dødsfall, 6 huseier brev, 8 end. `ck_grete` size 5.
- Clock sizes: bostøtte 4/4, overført 6/6, rutine 4/4, restanse —/6, grete scenario 5.
- enact clock bumps: bostøtte +2 if doc_konto else +1; s2 +2 if hjemmehjelp else +1; telefon-too-early bad +2.
- Initial sim needs: hunger 72, energy 64, social 30, security 55. foodBoxes 7, mail 9, unanswered 2.
- DOC_ROT formula `(((i*137)%50)-25)/10` deg (deterministic). Line colors `[#c89a2e,#5b7fc4,#a57bc2,#7aa66f,#c86244]`. Nudge delay 10000 ms. Toast lifetime ~5200 ms + 600 ms fade.
- `question_state` threshold: ≥2 supporting facts → "Delvis belyst".
- Reflection priority order (§4.5) — keep exact, it's the whole authorial point.

---

## 9. Out of scope (same as prototype)

- Real simulation (sim is mocked; swap behind `sim_tick(day, tiltak) → events+state` later).
- Action dice (SDD-002) — deliberately absent; the fact→question→vedtak spine is tested first.
- Freeform draggable canvas — lines are drawn for the player, nodes fixed in v1.
- Save/load, audio, localization. (Norwegian is hardcoded — it's the writing.)

---

## 10. Build order (risk-first, from `godot-port-risks.md`)

1. **Spike A** — one document (bekymringsmeldingen) at full fidelity: 4 MSDF registers, paper stylebox + ruled shader, `[url=fact:]` lift with spyglass cursor + yellow-after-lift + 10 s nudge. Pass = side-by-side with HTML, not embarrassing. (Built 2026-06-11, `spike/doc-fidelity-gym`.)
2. **Spike B** — Observer→Journalist→CaseFileWriter trio: real sim day → ~5 restrained Norwegian logg lines. Go/no-go for the whole design. (Built 2026-06-11.)
3. **Port the loop UI** from this spec: CONTENT → .tres is near 1:1; STATE → GameState autoload; ENGINE → CaseEngine; SIM mock → Sim; six surfaces + modals + toasts, all driven by `GameState.changed`.

When the real sim is ready it replaces the mock `sim_tick` behind the same contract; everything above the seam (CONTENT/STATE/ENGINE/UI) stays.

---

## Appendix — id inventory (do not rename)

- **Facts (30):** f_grete_syk, f_aldri_alene, f_grete_baerer, f_saarbar, f_ingen_tjenester, f_trygd, f_alt_via_grete, f_husleie, f_gap, f_ingen_matkjop, f_leie_stoppet, f_huseier_kommer, f_leie_privat, f_klarer_seg, f_ingen_plan, f_elling_tlf, f_grete_redd, f_post, f_kalender, f_matbokser, f_bok, f_utklipp, f_avstand, f_smart_gutt, f_ubesvart, f_dor_glott, f_tirade, f_egen_mappe, f_innlagt, f_elling_uvarslet, f_dod, f_brevsprekken
- **Documents (authored 8):** doc_bekymring, doc_konto, doc_papirer, doc_huseier, doc_frank_tlf, doc_frank_visit, doc_innleggelse, doc_dodsfall (generated: doc_vedtak_N, doc_status)
- **Questions (6):** q_okonomi, q_bolig, q_hverdag, q_selv, q_kontakt, q_kollaps
- **Tiltak (10):** t_bostotte, t_forvaltning, t_huseier, t_hjemmehjelp, t_matlevering, t_dokgjennomgang, t_brev, t_regning, t_telefon, t_institusjon
- **Dispatches (7):** d_ring_grete, d_konto, d_besok, d_ring_elling, d_papirer, d_besok_alene, d_bostotte_f
- **Chat (9):** c_kalender, c_post, c_smart, c_klarer, c_bok, c_avstand, c_gro, c_brevsprekk, c_videre
- **Clocks (5):** ck_bostotte, ck_overfort, ck_rutine, ck_restanse, ck_grete
  </content>
  </invoke>
