# Case: case_olsen_tiny

Title: Olsen - full case slice
Stage: 0
Deadline: day 10 // was "Vurdering frist day"
Pair soft reject: "De to? Jeg ser ikke tråden mellom dem. Ennå."
Pair already set: "Det spørsmålet har vi allerede stående."

# Document: doc_bekymring

Kind: BEKYMRINGSMELDING · Register: klinisk
Title: Legesenteret - Dr. J. Haug
Peek: "…anbefaler kommunal kartlegging av funksjon, hjelpebehov og overgangstiltak."
Meta: LEGESENTERET - DR. J. HAUG - 11.02.1999

Mor er under utredning og behandling for [sykdom med kort forventet forløp](fact:f_grete_syk).

## f_grete_syk

Label: Grete er alvorlig syk
Summary: Grete er alvorlig syk. Forventet forløp er kort.
Domain: Helse/risiko · Category: Dokument
Supports: q_grete_dor
Frank: "'Kort forventet forløp', og ikke noe mer. Så vagt skriver man bare når man vil. Haug må si det høyt før vi planlegger noe."

# Document: doc_frank_tlf

Kind: FELTNOTAT · Register: notat
Title: Frank - telefonsamtale med Grete
Peek: "Hun tok den på andre forsøk."
Meta: FELTNOTAT - 4012 F. ÅSLI - TLF. G. OLSEN

Hun var klar: ["Han klarer seg. Han har alltid klart seg." Hun sa det to ganger.](fact:f_klarer_seg) Andre gangen lavere.

## f_klarer_seg

Label: "Han klarer seg"
Summary: Grete avviser bekymringen. Gjentar formuleringen.
Domain: Nettverk/sosialt · Category: Samtale
Supports: q_grete_dor
Reveals: call:grete

# Document: doc_frank_visit

Kind: RAPPORT · Register: notat
Title: Frank - hjemmebesøk Ammerudveien 47
Peek: "Hun hadde dekket på med tre kopper."
Meta: HJEMMEBESØK - 4012 F. ÅSLI - BLOKKA - 4. ETASJE

Men [han kastet meg ikke ut, og han svarte da jeg spurte om noe han kunne. Det er en dør på gløtt.](fact:f_dor_glott)

## f_dor_glott

Label: En dør på gløtt
Summary: Elling kastet ikke Frank ut, og svarte da Frank spurte om noe han kunne. Kontakt er mulig - forsiktig.
Domain: Nettverk/sosialt · Category: Samtale
Supports: q_baering

# Document: doc_huseier

Kind: BREV · Register: formell
Title: Brev fra huseieren - T. Bakkerud
Peek: "Jeg hører at din mor er gått bort."
Meta: T. BAKKERUD - HÅNDSKREVET - LEVERT I POSTKASSEN
arrives: day 6 on ck_grete

Jeg må likevel skrive om det praktiske. [Leien for mars er ikke kommet.](fact:f_leie_stoppet)

## f_leie_stoppet

Label: Husleien har stoppet
Summary: Husleien har stoppet. Betalingskjeden døde med Grete.
Domain: Økonomi/bolig · Category: Risiko
Supports: q_bolig, q_kollaps

# Document: doc_dodsfall

Kind: MELDING · Register: klinisk
Title: OUS Ullevål - dødsfall
Peek: -
Meta: ULLEVÅL SYKEHUS - TIL SOSIALKONTORET - 15.02.1999

MELDING OM DØDSFALL

Grete Olsen, f. 21.09.1927. [Dødsfall konstatert 15.02 kl. 04:12.](fact:f_dod)

Avdødes sønn er eneste nærmeste pårørende. Varsling ble forsøkt per telefon uten svar. Politiet bisto ved varsling på bopel. Sønnen åpnet ikke døren. [Beskjeden ble gitt gjennom brevsprekken.](fact:f_brevsprekken)

Saken overføres kommunen for videre oppfølging av gjenlevende.

SOSIALMEDISINSK ENHET - OUS

## f_dod

Label: Grete er død
Summary: Grete Olsen døde 15.02 kl. 04:12.
Domain: Helse/risiko · Category: Dokument
Supports: q_kollaps
~ open q_kollaps

# Document: doc_tabell

Kind: KONTOUTSKRIFT · Register: formell
Title: Sparebanken - kontoutskrift
Peek: -
Meta: SPAREBANKEN - JANUAR 1999

Utskrift for perioden 01.01–31.01.

| DATO | TEKST | UT [icon=coin] |
| --- | --- | ---: |
| 05.01 | [KONTANTUTTAK SKRANKE](fact:f_uttak_golden) | 30,00 |
| 07.01 | MATSENTRALEN AMMERUD | 2,35 |

KONTOEN DISPONERES AV VERGE.

## f_uttak_golden

Label: Kontantuttak i skranken
Summary: Fast kontantuttak den 5. hver måned.
Domain: Økonomi/bolig · Category: Dokument

# Question: q_grete_dor

Title: Den dagen Grete ikke kommer hjem - hva stopper?
Teaser: Det er noe her om hva som faktisk stopper den dagen Grete ikke er der. Jeg har ikke ord på det ennå.
when: f_grete_syk and f_klarer_seg

# Question: q_okonomi

Title: Regnestykket Olsen: hva kommer inn, hva går ut - og gjennom hvem?
when: f_gap
Lead: "Be om økonomisk oversikt" -> d_konto

# Question: q_bolig

Title: Kan Elling bli boende - når husleien har stoppet?
when: f_gap and f_leie_stoppet

# Question: q_vekst

Title: Hva kan læres - og i hvilket tempo, uten å knekke noe?
Teaser: Jeg så noe hos ham som kan bygges på. Usikker på tempoet. Vi bør snakke om det.
Card title: Hva kan læres?
when: f_bok and f_utklipp

# Question: q_baering

Title: Noe av det Grete gjorde må noen andre gjøre. Hvor lite kan kommunen slippe unna med - og hvor mye tåler han?
Teaser:
when: f_elling_tlf and f_avstand

# Question: q_kollaps

Title: Hva kollapser først nå?
Teaser: Noe her har begynt å rakne. Jeg vet ikke hva som går først.
when: f_dod
Card title:

# Hypothesis: h_ok_gap

Title: Trygden dekker ikke husholdet. 100 [icon=coin] mangler hver måned.
Summary: Ellings trygd er 90 [icon=coin]. Husleien alene er 120 [icon=coin], og januar kostet 190. Differansen bæres i dag av Gretes pensjon. Bortfall gir umiddelbar restanserisiko.
Question: q_okonomi
needs: f_gap
Opens: t_bostotte, t_huseier, d_konto, c_frank_okonomi [type=conversation category=frank actor=frank risk=okonomi sim=case.olsen.opening.conversation.frank_okonomi]

# Hypothesis: h_gd_system

Title: Husholdet er et system med to. Med én står det stille.
Summary: Mat, avtaler, post og kontakt går gjennom arbeidsdeling som forsvinner med Grete. Det er systemet som dør, ikke bare et fravær.
Question: q_grete_dor
needs: f_smart_gutt and f_ingen_matkjop
Opens: t_matlevering

# Tiltak: t_bostotte

Title: Søk bostøtte
Slot: s1 · Cost: 0
Description: Husbanken. Krever dokumentert inntekt og husleie. Saksbehandlingstid.
Sim hook: case.olsen.tiltak.bostotte

# Tiltak: t_huseier

Title: Snakk med huseieren
Slot: s1 · Cost: 0
Description: Bakkerud vil vite hvem han skal forholde seg til.
Sim hook: case.olsen.tiltak.garanti

# Tiltak: t_matlevering

Title: Matombringing
Slot: s2 · Cost: 1
Description: Bokser på døren, tre dager i uken.
Sim hook: case.olsen.tiltak.food

# Tiltak: t_institusjon

Title: Institusjonsvurdering / omsorgsbolig
Slot: press · Cost: 0 · Weight: heavy
Description: Bureaukratisk lesbart. Trygt på papiret. Leiligheten blir i så fall et avsluttet kapittel.
Sim hook: case.olsen.tiltak.institusjon

# Dispatch: d_konto

Title: Be om økonomisk oversikt
Sim hook: case.olsen.dispatch.account_overview
Description: Frank ringer til Grete og spør om hun kan skaffe en bankutskrift. Utskriften kommer i morgen.
Activity: "BE OM BANKUTSKRIFT"
Channel: scheduled · Delay: 480m · Duration: 1h · Occupies: 3h
Reception: +1
gate: f_grete_baerer
~ deliver doc_konto_grete in 1d on ck_overfort
~ deliver doc_konto_elling in 1d on ck_overfort

# Dispatch: hjemmebesok

Title: Hjemmebesøk
Sim hook: case.olsen.dispatch.hjemmebesok
Description: Frank drar på uanmeldt besøk til leiligheten.
Activity: "HJEMMEBESØK"
Channel: now · Delay: 0m · Duration: 2h · Occupies: 2h
Reception: -1
gate: f_saarbar

# Clock: ck_overfort

Label: Kontooversikt til neste dag
Sim hook: case.olsen.clock.account_overview
Question: Er funksjonene hun bar identifisert og flyttet?
Good: Funksjoner overført / 6 · Bad: Alt går via Grete / 6

# Clock: ck_bostotte

Label: Bostøtte sak
Sim hook: case.olsen.clock.bostotte
Question: Kan kommunen skape et lovlig grunnlag for at husleien kan betales?
Good: Søknad komplett / 4 · Bad: Frist glipper / 4
visible when: f_gap and f_trygd

# Clock: ck_restanse

Label: Husleierestanse
Sim hook: case.olsen.clock.restanse
Question: Blir leieproblemet en aktiv sak før støtten er på plass?
Good: / 0 · Bad: Restanse bygges / 6
Max: 6

# Clock: ck_grete

Label: Grete tilgjengelig
Sim hook: case.olsen.clock.grete
Question: Hvor lenge bærer hun?
Good: / 0 · Bad: Grete er død / 5
Max: 5

# Beat: day 2 [id=beat_grete_d2]

Grete blir sliten.

# Beat: day 5 [id=beat_grete_d5]

Grete Olsen er død.
~ deliver doc_dodsfall in 0d on ck_grete

# Beat: day 6 [id=beat_grete_d6]

Håndskrevet brev - T. Bakkerud

# Recipe: f_utklipp + f_bok

~ open q_vekst
Frank: "Boken og utklippene. Ja. Jeg har tenkt på dem sammen, men jeg fikk det ikke sagt."
Frank: "Han holder krevende stoff i hodet og noterer systematisk. Og han klipper ut, daterer og ordner. Begge deler er hans egne."
Frank: "Så spørsmålet er ikke om han kan lære. Det er hva som kan læres - og i hvilket tempo, uten å knekke noe."

# Recipe: f_grete_syk + f_klarer_seg

~ open q_grete_dor
Frank: "Haug skriver kort forventet forløp. Grete sier han klarer seg. Begge kan ikke ha rett."
Frank: "Hun har båret alt så lenge at hun ikke ser det selv. Den dagen hun ikke kommer hjem, stopper noe - og vi vet ikke hva."
Frank: "Jeg tror ikke vi finner det med spørsmål. Jeg tror vi finner det ved å være der."
