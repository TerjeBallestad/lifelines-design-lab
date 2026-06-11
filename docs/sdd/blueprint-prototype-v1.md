# Blueprint prototype v1 — the caseworker game, whole loop

Date: 2026-06-11
Status: Built (prototype artifact: `prototypes/blueprint_v1.html`)
Surface: All — this is the foundational gameplay blueprint for the Godot build

## What this is

A single-file HTML prototype that lays out the **entire caseworker loop** end to end,
with the simulation mocked. It deliberately spans SDD-003 (case board / tiltak package),
SDD-004 (evidence desk loop) and SDD-005 (Åpne spørsmål), plus the vedtak/tiltak →
simulation → observation cycle those SDDs scoped out. It is a blueprint, not a slice:
every system is present in its smallest honest form so the shape of the whole game
can be judged.

## The loop

```text
Prologue (legekontoret — bekymringsmelding sendes)
→ Pulten: dokument på bordet
→ Lese → authored hotspots → spyglass → faktum løftes
→ Sakens fakta (eget vindu, auto-arkivert på domene)
→ Åpne spørsmål (spørsmål ↔ fakta med synlige linjer, hypotesevalg → Arbeidshypotese)
→ Frank: dispatch (ring, be om dokument, hjemmebesøk) + samtale
→ Vedtak og tiltak: tiltakspakke i tre slots + presskort
→ Simulering (mocket): tiltak endrer økologien, logg + klokker beveger seg
→ Nye dokumenter på pulten → loopen strammes
→ Grete dør (dag 5, skriptet) → samme loop, nå på alvor
→ Statusrapport → refleksjonsskjerm (et spørsmål å sitte igjen med, ikke en seier)
```

## Architecture (maps to Godot)

| Layer      | In prototype                                                                                                                                                  | In Godot later                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| CONTENT    | plain JS data: documents, hotspots, facts, questions, hypotheses, tiltak, dispatches, clocks, script                                                          | Resources (.tres), authored content |
| SIM (mock) | character state from core-loop values (Elling Blue/Green, attention 20; Grete White/Green, attention 117), daily tick, tiltak modifiers, authored event pools | the real core-loop simulation       |
| ENGINE     | pure functions: liftFact, refreshQuestions, chooseHypothesis, dispatch, enactVedtak, advanceDay, clock movement                                               | resolver autoloads                  |
| STORE/UI   | one state object, per-surface render                                                                                                                          | scenes + signals                    |

## Contracts honored from the SDDs

- Hotspots: normal text → hover spyglass → click-to-lift → highlighter-yellow only
  after lift; delayed faint pencil underline (~10 s) on uncollected anchors. No glow.
- Facts auto-file to domain/question; player's first meaningful move is interpretation.
- Arbeidshypotese lives **inside** an Åpent spørsmål, chosen from authored options,
  rendered in restrained Case Desk voice, backed by facts.
- No right/wrong at selection time. The simulation answers brittleness downstream
  (logg, Frank reports, clock movement, document changes). Mismatches are named
  concretely ("Dette forklarer ikke husleierestansen"), never graded.
- Tiltakspakke has three slots (Bolig/økonomi-sikring, Erstatt Gretes usynlige arbeid,
  Skjør selvstendig rutine) plus Institusjonsvurdering as legible pressure, not a win.
- Paired clocks per SDD-003. No abstract meters.
- Grete tilgjengelig is a scenario clock; day 5 is fixed. Pressure without a visible timer.

## Writing register

Norwegian social realism, Ambjørnsen restraint: subtraction over addition, two
unintended syllables over a monologue. Registers per document type (clinical,
bank, landlord, Frank's sparse field log, Grete's resigned deflection). The logg
never speculates psychologically — behavior only.

## Out of scope / faked

- Real simulation (event pools + need drift are authored).
- Dice. SDD-002's action dice are deliberately absent here; the blueprint tests the
  fact→question→vedtak spine first. Dice re-enter when probes return.
- Freeform canvas editing — lines are drawn for the player, Blake Manor style,
  but nodes are not draggable in v1.
- Save/load, audio, localization.

## v2 (samme dag, etter Terjes gjennomspilling)

- 1999, drabantby-blokk, mor og sønn bor sammen. Trygdekontoret, fasttelefon, kontant husleie.
- Privat huseier (T. Bakkerud, muntlig avtale fra -71). Husleieproblemet oppstår ETTER dødsfallet —
  brevet hans er story-beat-kroken («jeg kommer innom på torsdag»).
- Kroner ute, mynter inn: tiltaksramme 6 mynter/mnd, husleie tre, trygd to. Gamey ressurser,
  sosialrealistisk overflate.
- Arbeidshypoteser kan byttes (de er foreløpige). Hver hypotese viser hva den gir grunnlag for,
  og tiltak i slot 1/2 krever en hypotese — det er konsekvensen av å mene noe.
- Låste hypoteser er nå Roottrees-style synlige ukjente: sladdede linjer, ikke leselige svaralternativer.
- Fakta kan løftes fra Frank-samtalen og loggen, ikke bare dokumenter (delegert .ev-håndtering).
- Faktum-detalj (Blake Manor): klikk en brikke → hva den henger sammen med, hvem den kan drøftes
  med, kilden. Domeneikoner på alle brikker.
- Trygghetsalarm fjernet. «Ring Elling direkte» → «Ring leiligheten», kun når Grete er borte.
- Gro/Arbeiderpartiet-arkivet inn som ressurs-faktum, samtale og logg-flavor.

## Verdict question

> Does gathering facts, holding open questions, and committing to a vedtak feel like
> being the welfare state — and does watching the mocked simulation answer the vedtak
> feel like the loop worth building in Godot?
