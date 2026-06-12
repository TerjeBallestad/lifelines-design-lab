# Godot-port: de to risikoene, kartlagt

Date: 2026-06-11
Status: Audit av `lifelines-core-loop` (to explore-agenter), før port av blueprint_v1
Decision: Blueprint går til Godot som vertical slice. HTML-laben beholdes til copy/spikes.

## Risiko 1 — «Meh» dokumenter. Diagnose: konkret og fiksbar.

Auditen fant tre årsaker, ingen av dem er «prisen for Godot»:

1. **Rasterfont overalt.** `main_theme.tres` peker ALL dokumenttekst
   (`DocQABody`, `DocBodyLabel`, `DocMentionLinkButton`) på `Caveat-400-raster.ttf`
   (`multichannel_signed_distance_field=false`) → bitmap-uskarphet under
   `canvas_items`-skalering. MSDF-varianten (`Caveat-400.ttf`, msdf=true, range 8,
   size 48) ligger allerede importert ved siden av — den brukes bare ikke.
2. **Ett font-register.** HTML-prototypen får liv av fire registre:
   Kalam (brødtekst), Caveat (annotasjoner), Architects Daughter (etiketter),
   Gloock (titler). Godot-temaet har bare Caveat 18pt. «Plain text» er fraværet
   av registersystemet, ikke motorens skyld.
3. **Flat papirstil.** `DocPaperPanel` er én farge + 1px kant. HTML-fidelity kommer fra:
   linjert-papir-bakgrunn (repeating gradient → trivielt som canvas-shader eller
   NinePatch), asymmetriske kanter (wobble-NinePatch-tekstur), stempler (rotert
   Label m/ border), tags/pills (theme variations), rotasjon + skygge på kort.

**Det viktigste funnet:** fixtures bruker allerede `[url=entity:…]` og
`[url=phrase:…]` i bbcode — RichTextLabel `meta`-tags med `meta_hover_started` /
`meta_clicked`-signaler. Det ER hotspot-mekanikken. Spyglass-cursor, forsinket
blyantstrek og gul-etter-løft er ren theme/effekt-styling oppå noe som finnes.

**Authoring-pipeline (anbefalt):** dokumenter forfattes ÉN gang i markdown/JSON
med evidence-syntaks (`{ev:f_husleie}…{/ev}`), build-script emitterer både
(a) HTML til design-laben og (b) `.tres` med bbcode (`[url=fact:f_husleie]`)
til Godot. Samme kilde, to mål — laben forblir skrivestue for innhold.

## Risiko 2 — Sim-sømmen. Diagnose: 80 % av rørene finnes.

Simen er allerede fullt instrumentert: 9 buss-autoloads med rike payloads —
`ActivityBus.character_started/finished_activity` (engagement MISERABLE→FLOW,
quality poor→excellent, struggling, duration), `NeedsBus.need_threshold_crossed`,
`VisitorBus.visitor_entered_room` (m/ threat*class) + `heart_attack*\*`,
`ConversationBus`, `SkillsBus.mastery_changed`, `SimulationBus.day_started/ended`.
`DataLogger` beviser allerede at hendelsene rekker til en hel dags-JSON.

Det som mangler er nøyaktig tre nye lag (én autoload-trio):

1. **Observer** — abonnerer på bussene, filtrerer på hva kommunen kan SE
   (visitLevel fra blueprinten: ingen innsyn / snapshot / Frank har kanal).
   Innsynsnivå som spillmekanikk er allerede designet — dette er bare filteret.
2. **Journalist** — hendelser → restrained norsk prosa. Vektede maler m/
   de-dup (82-mal-generatoren fra case_session_spike_v3 er prior art, porter
   nesten rett til GDScript). Hybrid: skriptede beats forblir håndskrevne,
   dagstekstur genereres.
3. **CaseFileWriter** — ved `day_ended`: syntetiser FrankLog/`CaseFileDoc`
   (.tres, bbcode m/ fact-anchors) → pulten.

**Tiltak-injeksjon:** RehabBus er placeholder, men `VisitorManager.spawn_visitor`
(taskkø: move_to_room/perform_action/exit) finnes — hjemmehjelp/matlevering er
visitor-tasks. Skjøre rutiner er NudgeBus-nudges. Forvaltning/bostøtte er rene
flagg i Observer-laget. Tiltaksressurs: id, slot, visitor_schedule/nudge/flagg.

## Spike-rekkefølge (risiko først)

1. **Spike A — ett dokument i full fidelity** (1–2 dager): bekymringsmeldingen
   i Godot. Kalam/Caveat/Gloock MSDF-importert, theme variations per register,
   papir-stylebox + linjeshader, `[url=fact:]`-løfting m/ cursor og gul markering.
   Pass: skjermbilde side om side med HTML-versjonen, ikke flau.
2. **Spike B — Journalist-trioen** (go/no-go for hele designet): kjør en
   eksisterende sim-dag, Observer+Journalist produserer ~5 logglinjer i Franks
   register fra EKTE hendelser. Pass: én generert linje treffer som de mockede
   («kassen ble stående i gangen»-nivå).
3. Deretter: port loop-UI fra blueprint (CONTENT → .tres er nær 1:1).

Hvis Spike B feiler på prosa-kvalitet er svaret mer authored/mindre generert —
ikke en annen arkitektur. Sømmen står uansett.
