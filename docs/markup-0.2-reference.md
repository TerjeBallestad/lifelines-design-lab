# Kildeverket markup 0.2 — reference

> Vendored from the Dialog Tree Editor handoff
> (`Dialog Tree Editor Mockups-handoff.zip` → `dialog-tree-editor-mockups/project/Markup Reference.dc.html`)
> by PLAN-003 TASK-014. Section numbering is preserved from the source.
> The Rulings section at the bottom records the ratified amendments that
> override or extend the vendored text.

One file is one case. Blocks compile to nodes; anchors and id references
compile to edges. Unresolved ids become stubs, `TODO:` lines become tracked
work — the file always saves and always compiles. Ids are snake*case with
type prefixes: `doc* f* q* h* t* d* ck*` and dotted conversation names.

## 1 · Case header

```
# Case: case_olsen_tiny
Title: Olsen — full case slice
Stage: 0
Deadline: day 10        // was «Vurdering frist day»
```

## 2 · Documents & anchors

A document is metadata lines followed by prose. Anchored spans are the
document→fact edges; an anchor to a missing id creates a stub fact.

```
# Document: doc_huseier
Kind: BREV · Register: formell
Title: Brev fra huseieren · T. Bakkerud
Peek: «Jeg hører at din mor er gått bort.»
Meta: T. BAKKERUD · HÅNDSKREVET · LEVERT I POSTKASSEN
arrives: day 6 on ck_grete   // replaces the beat's Effects line

Jeg må likevel skrive om det praktiske.
[Leien for mars er ikke kommet.](fact:f_leie_stoppet)
Trygden hans — 2 [icon=coin] i måneden.
```

## 3 · Facts

A `##` block under a document takes that document as its source; a
standalone fact declares `Source:` explicitly. Reveal-effects use `~` lines
(§7).

```
## f_leie_stoppet
Label: Husleien har stoppet
Summary: Husleien har stoppet. Betalingskjeden døde med Grete.
Domain: Økonomi/bolig · Category: Risiko
About: utleier
Supports: q_bolig, q_kollaps
Discuss: Frank
~ open q_kollaps          // was «Reveals questions:»
```

## 4 · Questions, hypotheses, tiltak

```
# Question: q_bolig
Title: Kan Elling bli boende — når husleien har stoppet?
Teaser: Det er noe med leiligheten som ikke tåler mange spørsmål.
when: f_gap and f_leie_stoppet and f_husleie
Leads: t_huseier

# Hypothesis: h_ok_gap
Title: Trygden dekker ikke boligen. 2 [icon=coin] mangler hver måned.
Question: q_okonomi
needs: f_gap
Opens: t_bostotte, t_huseier, d_konto, c_frank_okonomi [risk=okonomi]

# Tiltak: t_hjemmehjelp
Title: Hjemmehjelp 2× uke — Frank
Slot: s2 · Cost: 2 · Weight: normal
Description: Fast person, fast tid. Den eneste kanalen inn som har virket.
Sim hook: case.olsen.tiltak.channel
```

## 5 · Dispatches, clocks, beats

```
# Dispatch: d_konto
Title: Be om økonomisk oversikt
Channel: scheduled · Delay: 480m · Duration: 1h · Occupies: 3h
Reception: +1
gate: f_gap
~ deliver doc_konto_overfort in 1d on ck_overfort

# Clock: ck_bostotte
Label: Bostøtte sak
Question: Kan kommunen skape et lovlig grunnlag for husleien?
Good: Søknad komplett / 4 · Bad: Frist glipper / 4
visible when: f_gap and f_trygd

# Beat: day 5
Grete Olsen er død.
~ deliver doc_dodsfall in 0d on ck_grete
```

## 6 · Condition grammar

One grammar everywhere a gate appears: `when:`, `needs:`, `gate:`,
`visible when:`, and `{…}` in weave.

```
terms      f_gap · t_bostotte (taken) · q_bolig (open) · d_konto (done)
           ck_restanse >= 3 · day >= 5 · stage 1 · asked.gro (read count, §8)
operators  and · or · not · ( ) · n of (a, b, c)
examples   when: f_gap and (f_leie_stoppet or f_huseier_kommer)
           when: 2 of (f_bok, f_utklipp, f_matbokser)
           when: day >= 5 and not t_institusjon
```

## 7 · Effect lines

One `~` line per consequence. Legal in facts, beats, dispatches, event
deltas and weave branches.

```
~ pay f_dor_glott              // reveal a fact to the player
~ clock ck_selvstendighet +1   // tick a clock either way
~ deliver doc_konto in 1d      // queue a document [on ck_x]
~ open q_kollaps               // force a question open
~ stage 1                      // advance scenario stage
~ log «Grete tok imot leveringen ved døren.»
```

## 8 · Conversation weave

Flow syntax lives only inside `# Conversation:` blocks. Borrowed from ink,
trimmed to what the game needs.

```
* [spørsmål]        // once-only choice; [] text is not echoed as a reply
+ [spørsmål]        // sticky choice — never used up
{f_avstand}         // guard on a choice or a text line (full §6 grammar)
    svartekst       // indented lines under a choice = the reply
* * [oppfølging]    // nested follow-up, any depth
- (hub)             // gather — branches rejoin here; (label) is optional
-> hub              // divert; -> END closes the conversation
* ->                // fallback — chosen when nothing else is available
(gro)               // label a choice; asked.gro becomes a condition term
{først|senere}      // sequence text: 1st visit, then 2nd, sticks on last
```

## 9 · Authoring aids & validation

```
TODO: tekst          // surfaces in preview, playtest, status bar
// comment — compiler ignores
stub                 // any unresolved id; listed, never fatal
```

The compiler warns on: facts without a source anchor · questions with no
path to a tiltak · hypotheses that open nothing · conversations with no way
back to the hub (loose ends) · gates referencing undeliverable facts ·
quiet days (nothing new reaches the player) · clocks that can never become
visible.

## 10 · Migration from 0.1

- `Opens when: a, b` → reads as `when: a and b` (no edit needed)
- `Needs: a, b` → `needs: a and b`
- `Effects: pending_doc X after N day on ck` → fix-it to `~ deliver X in Nd on ck`
- `Reveals questions: q_x` → fix-it to `~ open q_x` · `Pays fact:` → `~ pay`
- Frank chat Question/Answer/Needs triples → compile as one-choice weaves; rewrite at leisure.

## Rulings

The vendored text above is amended by the ratified rulings. Where they
conflict, the rulings win. Authority order: this reference, then the SB-022
ruling comments, then the research findings (SB-020 runtime gap audit,
SB-021 drift inventory).

- **SB-022 comment 1a (RULING 1a)** — hybrid shape split: `calls` +
  `frank_chat` become `# Conversation:` weave blocks whose top-level
  branches are **card-keyed** (`* f_x:` — see TERM-001); `frank_proposals`,
  `recipes`, and the two pack-level pair-reject lines stay declarative.
- **SB-022 comment 1b (RULING 1b)** — declarative block syntax:
  `# Recipe: f_a + f_b` (unordered pair, compiler sorts for identity),
  body: optional `gate:`, `Frank:` reply lines, `~` effects. Pack-level
  `Pair soft reject:` / `Pair already set:` are §1 case-header lines.
  (Amended by SB-028 rulings A–D for proposals: proposal header is the
  handbok slug, facts live in a `Relevant:` body field.)
- **SB-022 comment 2 (RULING 2)** — emit boundary: compile exactly what the
  runtime plays today, warn on the rest, never emit speculative JSON. The
  structured warning list doubles as the engine backlog. Stubs never fatal.
- **SB-022 comment 3 (RULING 3)** — §10 addenda: fact gets `Frank: «…»`
  (frank_response), `Card: «…»` (card_line), `Reveals: call:grete`
  (reveals_event, namespaced handle kept). Question gets `Card title:` /
  `Card sub:`. Dispatch gets `Activity: «…»` (activity_title). Clock gets
  `Max: N` (omit line ⇔ omit field). Hypothesis `Opens:` bracket payload
  extends to open_conversation metadata (`c_frank_okonomi [risk=okonomi
type=… actor=… sim=…]` — keys emitted OUTSIDE args). Question reveal is
  one-way (`when:` on the question owns it; the old bidirectional
  fact↔question check is dead). Sparse-field law: the emitter omits unset
  fields; authored zero is explicit. Leads: the three-shape union dies —
  single canonical form `Lead: «label» -> target`, label mandatory, target
  any tiltak or dispatch id; bare `Leads: id` does not survive migration.
- **DD-001** — flow gets weave (card-keyed branches), matching (recipes,
  proposals, pair lines) stays declarative.
- **DD-002** — the emit boundary is the runtime's actual capability;
  unplayable constructs parse, validate, and warn — never emit JSON.
- **TERM-001** — _card-keyed-branch_: a top-level weave branch whose key is
  a card id (`* f_x:`), firing when the player plays card `f_x`.

### Compiler extensions recorded by TASK-014

- `# Beat: day N` accepts an optional authored id via the bracket payload:
  `# Beat: day 5 [id=beat_grete_d5]`. Without it the compiler derives the
  stable id `beat_d<N>`. The shipped Olsen beats carry authored ids
  (`beat_grete_d2` …), which cannot be derived, so round-tripping the
  shipped case requires the authored form.
- A document `arrives: day N on ck_x` line compiles to a
  `queue_pending_document` effect (delay 0) appended to the `# Beat: day N`
  block if one exists, else to a synthesized beat `beat_d<N>` with empty
  text. `ck_x` is a bucket key for the pending-document queue, not a clock
  tick.
- `Opens:` bracket payload keys accepted: `type`, `category`, `actor`,
  `risk` (comma list → `risk_tags`), `sim` (→ `sim_hook_id`); the long
  forms `risk_tags=` and `sim_hook_id=` are also accepted.

### Compiler extensions recorded by TASK-015 (§8 weave)

- Conversation names are namespaced in the header: `# Conversation:
call:grete` compiles into the `calls` array (contact_id `grete`);
  `# Conversation: chat:frank` compiles its branches into `frank_chat`
  entries. Any other name warns `weave-unknown-kind` and skips the block.
- Card-keyed branch form (TERM-001): `* f_x: <ask text>`. The text after
  the colon is the exchange `ask` (calls) or the entry `question` (chat).
  Indented plain lines under the branch are the reply / `answer_lines`.
  `(label)` and `{guard}` tokens may sit before or after the card key.
- A trailing `[k=v …]` bracket payload on a branch line is reserved for the
  keys `id` and `answer` (anything else — e.g. `[icon=coin]` — stays text).
  `[id=c_x]` overrides the derived chat-entry id (default: key card
  `f_stem` → `c_stem`). `[answer=none]` keeps the legacy `answer` field
  empty (`answer_lines` primary); otherwise `answer` is derived by joining
  `answer_lines` with a single space, matching the shipped duplication.
- Call surface: top-level lines before the first branch are the `opening`.
  `du:` prefixes a line with speaker `who: "du"` (no prefix = the contact).
  A `[text](fact:f_x)` anchor marks the line liftable (`fact_id`). Call
  fields: `gate:` (full §6 → PredicateSpec; facts + stage have runtime
  ops), `Soft reject: «…»` (declarative — `* ->` never maps to it).
- Chat surface guards: `{…}` on a branch folds into the flat AND fact list
  `needs` (key card first). Anything beyond `f_a and f_b` warns
  (`weave-chat-guard-unsupported` or the §6 capability codes) and is
  dropped. Follow-ups (`* *`, one deep, once-only) take no guard —
  a guard there warns `weave-followup-guard`.
- `~ pay f_x` on a chat entry mints `pays_fact`. Every other `~` op in
  weave, and any `~` in a call branch, warns `weave-effect-unsupported`
  (call lifts are authored as anchors, not effects).
- DD-002 warn list, stable codes (parses, warns, never emits):
  `weave-nesting-too-deep` (`* * *`), `weave-gather-unsupported`
  (`- (hub)`), `weave-divert-unsupported` (`-> x`),
  `weave-end-unsupported` (`-> END`), `weave-fallback-unsupported`
  (`* ->`), `weave-sequence-unsupported` (`{a|b}`),
  `weave-label-unsupported` (`(label)`), `weave-line-guard-unsupported`,
  `weave-exchange-guard`, `weave-followup-guard`, `weave-call-followup`,
  `weave-choice-not-card-keyed`, `weave-chat-guard-unsupported`,
  `weave-effect-unsupported`, plus the §6 `cond-unsupported-*` codes for
  guard terms with no runtime op (incl. `n of` and `asked.*`).
- §10 compat: a `# Conversation: chat:c_x` block carrying a
  `Question:`/`Answer:`/`Needs:` triple and no branches compiles as a
  one-choice weave: one entry, `answer_lines = [answer]`, no follow-ups.
- Sparse emit: a case with no conversation blocks omits the `calls` and
  `frank_chat` keys entirely.

### Compiler extensions recorded by TASK-016 (recipes + pair lines)

- `# Recipe: f_a + f_b` — the header pair is unordered; the compiler sorts
  it for identity (the emitted `pair` is the sorted pair) and reports a
  `duplicate-id` error when two recipes share a sorted pair, even when the
  second is authored in the other order. A pair of two identical facts is
  rejected (`line-unparsed`; the block is skipped).
- The recipe's target question is authored as a `~ open q_x` effect line —
  ruling 1b gives the body no `Question:` field, and `~ open` is the one §7
  op that names the crafted question. Exactly one is expected: none warns
  `field-missing` (question_id emits as `""`); a second warns
  `recipe-question-conflict` and is dropped (the first wins).
- One-owner rule: the emitted `reading` DERIVES from the target question's
  `Teaser:` — a recipe never authors it (no `Reading:` field exists). The
  shipped Olsen recipes duplicate their questions' teasers verbatim, which
  the golden fixtures prove.
- `Frank: «…»` body lines (repeatable, in order) → `frank_lines`,
  guillemets stripped.
- DD-002 boundary: the runtime `CaseRecipe` has exactly `question_id`,
  `pair`, `reading`, `frank_lines`. A `gate:` therefore parses and
  validates via the shared §6 machinery but warns
  `recipe-gate-unsupported` and emits nothing (the pair itself is the
  runtime gate). Any `~` op other than `open` warns
  `recipe-effect-unsupported` and emits nothing.
- §1 case-header pair lines: `Pair soft reject: «…»` →
  `pair_soft_reject_line`, `Pair already set: «…»` →
  `pair_already_set_line` (guillemets stripped; omit line ⇔ omit field).
- Slice key order with the new sections: … `day_script_beats`,
  `frank_chat`, `frank_proposals`, `pair_soft_reject_line`,
  `pair_already_set_line`, `recipes`, `calls` (matching the shipped file;
  `frank_proposals` landed with SB-029). All are sparse — omitted when
  unauthored.
- `# Proposal:` blocks: excluded from PLAN-003 at the time (SDD deviation
  1); since implemented by SB-029 per the SB-028 rulings — see "Compiler
  extensions recorded by SB-029" below.

### Compiler extensions recorded by TASK-017 (§9 graph lints)

The seven §9 warnings are computed on the compiled case graph and emitted
through the shared diagnostics contract at **advisory** severity — a fourth
severity below `info`, purely editorial, never blocking ("the file always
compiles"). Codes are stable `lint-*` strings; spans point at the source
block (or the conversation block for weave subjects).

**Deliverability** (shared by lints 1, 5 and 7): a fact is _payable_ when at
least one game surface can hand it to the player — a document run anchors it
(`[…](fact:f_x)`), a call line lifts it (`fact_id` on an opening or reply
line), a chat entry pays it (`~ pay` → `pays_fact`), or an event delta
reveals it (`reveal_fact_id`). Card-keyed branches _consume_ facts and never
pay them.

1. `lint-fact-no-source-anchor` — a **declared** fact that is not payable.
   Subject: the fact id.
2. `lint-question-no-tiltak-path` — a question with no _direct_ path to a
   tiltak: no `Lead:` targeting a tiltak (declared, or any `t_` id), no
   hypothesis on the question whose opening sources include `open_tiltak`,
   and no tiltak whose 0.1 `Needs hypothesis:` names one of the question's
   hypotheses. A recipe's `~ open q_x` is a path INTO the question, never
   out of it, and does not count. Transitive paths through dispatches are
   not followed.
3. `lint-hypothesis-opens-nothing` — a hypothesis whose emitted
   `opening_sources` is empty (no tiltak, dispatch, or conversation).
4. `lint-conversation-loose-end` — a weave node that gives the player
   nothing back: a call with zero exchanges, an exchange with an empty
   reply, a chat entry with no answer lines, no followups and no
   `pays_fact` (a `~ pay` alone counts as a return — the paid card is the
   reply), or a followup with no lines. Runtime surfaces return to their
   hub automatically, so "no way back to the hub" reduces to these
   nothing-comes-back nodes (diverts/gathers already warn under DD-002).
5. `lint-gate-undeliverable-fact` — a gate position referencing a fact that
   is not payable. Gate positions: question `when:`, hypothesis `needs:`,
   dispatch `gate:`, clock `visible when:`, 0.1 tiltak `Needs:`, a recipe's
   pair, a call `gate:`, a call exchange's key card, and a chat entry's
   `needs` list (key card included — playing the card requires holding it).
   Fires per (owner, fact) pair, even inside `or`. Subjects:
   `[ownerId, factId]`.
6. `lint-quiet-day` — runs only when the case has a `Deadline: day N`. An
   _event_ lands on day `d` when a beat has `day == d`, a
   `queue_pending_document` effect arrives then (`beat day + delay_days`),
   or a `day >= d` gate term becomes newly satisfiable. Day 1 always
   counts: the initial document set (documents without an arrival effect)
   is on the desk at case start. One diagnostic lists every day in
   `1..deadline` with no event. Span: the `Deadline:` line.
7. `lint-clock-never-visible` — a clock whose emitted `visibility`
   predicate is unsatisfiable under best-case evaluation: unpayable facts
   and undeclared hypotheses are false; everything else (`not` subtrees,
   stage terms, future ops) is assumed true. A clock without
   `visible when:` is visible from the start and never fires; a
   `visible when:` whose terms were all dropped as unsupported emits no
   predicate and likewise never fires.

### Compiler extensions recorded by TASK-018 (§10 compat close-out + CLI)

1. `Pays fact: f_x` on a §10 chat triple (`# Conversation: chat:c_x` with
   `Question:`/`Answer:`/`Needs:` and no branches) is a compat read: it
   emits `pays_fact` on the one-choice entry and a `fixit-pays-fact`
   (info) diagnostic naming the `~ pay f_x` replacement — matching the
   existing `fixit-effects-line` and `fixit-reveals-questions` fix-its.
2. One-way reveal (ruling 3) is now the live path: the old generator's
   bidirectional `Reveals questions:` ↔ `Opens when:` validation was a
   parse-layer check and died with it. `~ open q_x` (or the compat
   `Reveals questions:`) on a fact is advisory-checked only through the
   normal stub machinery; the question's `when:` owns its reveal.
3. Canonical core-JSON serialization is TAB indentation with a trailing
   newline (`JSON.stringify(slice, null, '\t')` — SB-313/SB-486 law),
   implemented in `scripts/blueprint/compile-olsen-case.mjs`
   (`serializeSliceJson`). `gen:olsen` / `gen:olsen:check` / `case:check`
   keep their names but run the 0.2 compiler; the 0.1 generator
   (`generate-tiny-olsen-case.mjs`) survives solely as the
   legacy-equivalence oracle until SB-024 retires it.
4. Sparse-field law applied to hypotheses: an authored-empty `Needs:` is
   an unset availability — the field is omitted, where the 0.1 generator
   emitted the vacuous `{ "op": "all", "children": [] }`.

### Compiler extensions recorded by SB-029 (proposals — SB-028 rulings A–D)

The `# Proposal:` half of ruling 1b is dead; SB-028 ratified the real
syntax in four rulings, implemented here. The full ratified shape:

```
# Proposal: matlevering
Relevant: f_ingen_matkjop, f_dor_glott
Line: «Matlevering, kanskje. …»
```

1. **Ruling A — slug header.** The header key is the handbok slug
   (`handbok_id`, the join key to the handbook): `# Proposal: matlevering`.
   The slug is one token; a header with spaces warns `line-unparsed` and
   the block is skipped. Facts live in the body field
   `Relevant: f_a, f_b[, f_c]` (arity 1–3 in the corpus; the compiler does
   not cap it). Recipes keep their pair header — true arity-2 matches.
2. **Ruling B — `Categories:` additive.** Optional comma list, additive to
   `Relevant:`, never a standalone key. `Categories:` without `Relevant:`
   warns `proposal-categories-without-relevant` (shape unproven at
   runtime) but still emits. Sparse-field law: `relevant_fact_ids` and
   `relevant_categories` are each omitted when unset.
3. **Ruling C — order = file order.** No `Order:` field exists; the
   compiler assigns the emitted `order` index (0-based) from block
   sequence at emit. Proposal block order in the source is load-bearing —
   move the block to rerank the proposal.
4. **Ruling D — validation.** `Line: «…»` is mandatory, exactly one per
   block (a second `Line:` is an unknown-field leftover). Compiler ERRORS
   (never fatal — the file always compiles, and the block still emits so
   later file-order indices hold): duplicate slug header (`duplicate-id`),
   missing `Line:` (`proposal-missing-line`, emits `line: ""`), missing
   `Relevant:` (`proposal-missing-relevant`) except the ruling-B warn
   case. Everything else stubs-never-fatal — unresolved `Relevant:` facts
   are `stub-unresolved-id` warnings.
5. Emit: the `frank_proposals` slice key, slotted between `frank_chat` and
   `pair_soft_reject_line` (shipped key order), omitted when the case
   authors no proposals. Entry key order matches the shipped file:
   `handbok_id`, `line` (guillemets stripped), `relevant_fact_ids`,
   `relevant_categories`, `order`.
6. Diagnostic code lifecycle: `proposal-not-ratified` is RETIRED — nothing
   fires it anymore; the constant stays in `diagnostics.ts` per the
   stable-codes law (never rename or reuse).

### Compiler extensions recorded by SB-024 (content back-port)

The healed `tiny-olsen.case.md` carries four shipped shapes the compiler
could not author. Each extension is minimal; tests live in
`src/compiler/__tests__/sb024-extensions.test.ts`.

1. **Fact `Quote: «…»` fallback.** A fact paid outside any document (chat
   `~ pay`, e.g. `f_dor_glott`) has no run to derive its quote from — an
   explicit `Quote:` line fills it. An anchored document run always wins
   over the field.
2. **Followup `Tanke: «…»` line.** Inside a chat followup, a `Tanke:` line
   sets the followup's `tanke` sting (the shipped `c_bok` VURDERING) instead
   of joining its lines.
3. **Lead target `call:<contact>`.** A `Lead: «…» -> call:grete` resolves
   without a stub when that call is authored — the same namespaced handle
   ruling 3 kept for `Reveals: call:grete`. (Shipped "Ring Grete" lead.)
4. **Nested brackets in anchor text.** `ANCHOR_RE` accepts one level of
   nested brackets so `[icon=coin]` tokens survive inside anchored spans
   (26 occurrences in the Olsen documents).

Ruled emit deltas vs the pre-back-port shipped JSON (all
semantically identical at runtime, recorded on SB-024): leads emit the
canonical `{label, target}` object (ruling 3 — the string forms die; the
Godot reader is an untyped passthrough and renders `label`);
vacuous `availability {all, []}` is omitted (sparse-field law); legacy flat
chat entries gain `answer_lines`/`followups` (the Godot model treats
`answer_lines` as primary); the legacy `answer` field derives from joining
`answer_lines` (the two shipped entries whose hand-written `answer` had
drifted from their own lines now match the lines).

### Compiler extension recorded by SB-057 (question `Frank:`)

A question block accepts `Frank: «…»` → `frank_response`, mirroring the
§10 fact field. The reader already exists: `case_engine.card_frank_response`
falls through fact → question when a card is played, and
`tiny_olsen_pack_generator` reads `frank_response` on both kinds. Sparse-field
law applies — no `Frank:` line, no emitted field. The shipped slice authors
none, so emitted JSON is unchanged until a question authors one.

Also: `.case.md` files are prettier-ignored — §8 weave indentation and `*`
branch sigils are semantic, and prettier rewrites them into `-` lists.

## Appendix A · SDD-130 sim-content blocks (PLAN-006)

Two source families, one language. The case file gains `# Visit:` and
`# Strings:`; character files (`content/characters/<id>.sim.md`, opened by a
`# Character: <id>` header) carry `# Thoughts:`, `# Barks:`, `# Phone:`.
`npm run gen:content` compiles all of it: the case artifacts as before, plus
`../lifelines-core-loop/resources/characters/source/<id>_sim_content.json`
per character (tab-JSON, `_generated` stamp, cross-repo write guard). The
sparse-field law holds throughout; `Stub: yes` on any block emits
`stub: true` on its Out shape (omitted otherwise). `.sim.md` files are
prettier-ignored for the same reason as `.case.md` (the wildcard `*` in a
thoughts header is not markdown-normalizable).

### Character family

```
# Character: elling

# Thoughts: elling/need/Hunger        ← <char>/<key_type>/<key>, `*` = wildcard key

Icon: icon_hunger                     ← optional; ThoughtLine icon_key
Stub: yes

- Sulten. Kjøleskapet er langt unna.  ← one bullet per text variant
- Burde spise noe snart.

# Barks: elling                       ← ambient pool (BARK_TEXTS successor)

- Fint vær i dag.

# Phone: elling                       ← in-sim answer/close lines

Answer: «hallo? ... ja. det er her.»
Close: «ja. nei. jo. — ha det.»
```

Emitted shapes → `ThoughtPoolOut { character, key_type, key, lines[], icon_key?, stub? }`
(key_type ∈ need/activity/aversion/want/relational/dagsform, mirroring
ThoughtLine), `BarkPoolOut { character, lines[], stub? }`,
`PhoneLinesOut { character, answer, close, stub? }`, gathered into
`CharacterContent { id, thoughts[], barks?, phone? }`. A
`# Thoughts: frank/...` block warns (advisory `thoughts-frank-excluded`,
SDD-110 #10) and emits nothing. A block naming another character than the
file's own warns and emits nothing — the sibling file owns it.

### Case-file additions

```
# Visit: opp_alene                    ← the Oppdrag catalog entry + choreography

Title: Klarer han seg alene?          ← → name
Blurb: Se på Elling.                  ← → blurb
Offer: «Vil du at jeg skal se…»       ← → offer_line (Frank's in-call offer)
Unlocks: q_evner                      ← → unlocks_question (dangling id warns)

- ! grete: blir i stua @ living_room [duration=18 no_wait id=opp_a_hold]
- ? elling @ living_room [duration=8 beat=a6 id=opp_a6]
- frank: «Er det Nansen du leser om?» [dwell=4 beat=a2 id=opp_a2]
- {f_klarer} grete: «Han har det fint her.» [dwell=4 beat=a5 id=opp_a5]

# Strings: notat_glue                 ← flat id-keyed table (DD-004 scopes families)

Stub: yes
notat_intro: Frank noterer.
```

Visit steps are ordered `- ` bullets, kept verbatim by the parser and bound
by the emitter. Three step kinds, payloads verbatim per the OPPDRAG_BEATS
tables (`social_visit_director.gd`):

- **line** — `speaker: «text» [dwell=N beat=x id=s]` →
  `{ id, kind: 'line', speaker, line, dwell?, beat?, when? }`
- **urgent** — `! actor: label @ room [duration=N no_wait id=s]` →
  `{ id, kind: 'urgent', actor, label, room, duration, no_wait?, when? }`
  (`no_wait` is a bare payload flag)
- **queue** — `? elling @ room [duration=N beat=x id=s]` →
  `{ id, kind: 'queue_elling', room, duration, beat?, when? }` (DD-120:
  elling only; any other actor warns and the step is skipped)

A `{condition}` prefix on a step reuses the §6 grammar through condition.ts
unchanged and emits a sparse `when` PredicateSpec. A step without `[id=…]`
gets a stable positional id (`<visit_id>_sN`). Duplicate step ids and
duplicate string keys are `duplicate-id` errors (first wins).

Emit destinations: `VisitSceneOut[]` as a sparse `visits` key and
`StringTableOut[]` (`{ id, entries, stub? }`) as a sparse `strings` key on
CaseSlice — both omitted when the case authors none, so the shipped slice is
byte-stable. The patch layer (SB-031) speaks all five kinds: appendBlock
templates, field patches (strings keys are id-shaped, no `·` composite
split), and `bulletAdd`/`bulletEdit`/`bulletRemove` for variants and visit
steps; a shared character id (`# Barks: elling` vs `# Phone: elling`) is
disambiguated by the optional `kind` argument.
