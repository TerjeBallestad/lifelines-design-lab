# Case: case_olsen_tiny

Title: Olsen - full case slice
Stage: 0
Deadline: day 10
Pair soft reject: "De to? Jeg ser ikke tråden mellom dem. Ennå."
Pair already set: "Det spørsmålet har vi allerede stående."

# Document: doc_bekymring

Kind: BEKYMRINGSMELDING · Register: klinisk
Title: Bekymringsmelding
Peek: Bekymringsmelding Dr. J. Haug
Meta: LEGESENTERET DR. J. HAUG, 11.02.1999

Under behandling av pasient Grete Olsen (f. 1927) for en [sykdom med kort forventet forløp](fact:f_grete_syk) kommer det frem at hun er [primær omsorgsperson](fact:f_saarbar) for sin sønn Elling Olsen (f. 14.03.1964). [Omfanget er ikke kartlagt](fact:f_grete_baerer), men han kan ha behov for støtte ved mors bortfall. 

Jørgen Haug
spes. allmennmedisin

## f_grete_syk

Label: Grete er alvorlig syk
Summary: Grete er alvorlig syk. Forventet forløp er kort.
Domain: Helse/risiko · Category: Dokument
Supports: q_grete_dor
Frank: "'Kort forventet forløp', og ikke noe mer. Så vagt skriver man bare når man vil. Haug må si det høyt før vi planlegger noe."

## f_grete_baerer
Label: Grete bærer rutiner
Summary: Grete bistår med gjøremål, økonomi og kontakt med tjenester.
Domain: Hverdag/rutine · Category: Dokument
Supports: q_grete_dor, q_okonomi
Frank: "'Omfanget er ikke kartlagt'. Hun gjør alt, og ingen vet hvor mye alt er. Det tallet finnes ikke før noen står i leiligheten og teller."

## f_saarbar

Label: Sårbar ved bortfall
Summary: Elling vurderes som sårbar ved bortfall av pårørende.
Domain: Helse/risiko · Category: Risiko
Supports: q_grete_dor
Frank: "Det er en leges inntrykk, ikke en kartlegging. Vi fatter ikke vedtak på inntrykk. Men det holder til å dra på hjemmebesøk, og det er sånn en bekymringsmelding er ment å virke."

# Document: doc_konto_grete

Kind: KONTOUTSKRIFT · Register: formell
Title: KONTOUTSKRIFT
Peek: Kontoutskrift. Grete Olsen, januar.
Meta: NR. 2/99

OLSEN GRETE
AMMERUDVEIEN 47
0958 OSLO

KONTO: 7024.31.44892
PERIODE: 01.01.99–31.01.99
UTSKR.DATO: 02.02.99

| DATO | TEKST | UT | INN | SALDO |
| --- | --- | ---: | ---: | ---: |
| 01.01 | SALDO OVERFØRT | | | 25 [icon=coin] |
| 04.01 | PENSJON RTV | | 125 [icon=coin] | 150 [icon=coin] |
| 04.01 | OVERF. E. OLSEN 7024.31.55103 | | 90 [icon=coin] | 240 [icon=coin] |
| 05.01 | [KONTANTUTTAK SKRANKE](fact:f_husleie) | 120 [icon=coin] | | 120 [icon=coin] |
| 07.01 | MATSENTRALEN AMMERUD | 10 [icon=coin] | | 110 [icon=coin] |
| 11.01 | POSTGIRO - OSLO ENERGIVERK | 17 [icon=coin] | | 93 [icon=coin] |
| 12.01 | MATSENTRALEN AMMERUD | 11 [icon=coin] | | 82 [icon=coin] |
| 14.01 | AMMERUD APOTEK | 4 [icon=coin] | | 78 [icon=coin] |
| 18.01 | MATSENTRALEN AMMERUD | 10 [icon=coin] | | 68 [icon=coin] |
| 21.01 | POSTGIRO - TELEVERKET | 5 [icon=coin] | | 63 [icon=coin] |
| 25.01 | MATSENTRALEN AMMERUD | 11 [icon=coin] | | 52 [icon=coin] |
| 28.01 | NARVESEN - UKEBLAD/AVIS | 2 [icon=coin] | | 50 [icon=coin] |
| 31.01 | SALDO | | | 50 [icon=coin] |

RENTESATS INNSKUDD 3 % P.A. - UTSKRIFTEN SENDES KVARTALSVIS
HENVENDELSER RETTES TIL DERES FILIAL. TA MED LEGITIMASJON.

## f_husleie

Label: Husleie betales av Grete
Summary: Husleien er 120 [icon=coin] og betales av Grete.
Domain: Økonomi/bolig · Category: Økonomi
Supports: q_okonomi, q_bolig

# Document: doc_konto_elling

Kind: KONTOUTSKRIFT · Register: formell
Title: KONTOUTSKRIFT
Peek: Årsutskrift. Elling Olsen.
Meta: NR. 1/99 - ÅRSUTSKRIFT

OLSEN ELLING
V/ OLSEN GRETE (VERGE)
AMMERUDVEIEN 47
0958 OSLO

KONTO: 7024.31.55103
PERIODE: 01.10.98–31.01.99
UTSKR.DATO: 02.02.99

| DATO | TEKST | UT | INN | SALDO |
| --- | --- | ---: | ---: | ---: |
| 01.10 | SALDO OVERFØRT | | | 0 [icon=coin] |
| 02.10 | [UFØRETRYGD RTV](fact:f_trygd) | | 90 [icon=coin] | 90 [icon=coin] |
| 02.10 | FAST OVERF. G. OLSEN (VERGE) | 90 [icon=coin] | | 0 [icon=coin] |
| 02.11 | UFØRETRYGD RTV | | 90 [icon=coin] | 90 [icon=coin] |
| 02.11 | FAST OVERF. G. OLSEN (VERGE) | 90 [icon=coin] | | 0 [icon=coin] |
| 02.12 | UFØRETRYGD RTV | | 90 [icon=coin] | 90 [icon=coin] |
| 02.12 | FAST OVERF. G. OLSEN (VERGE) | 90 [icon=coin] | | 0 [icon=coin] |
| 04.01 | UFØRETRYGD RTV | | 90 [icon=coin] | 90 [icon=coin] |
| 04.01 | FAST OVERF. G. OLSEN (VERGE) | 90 [icon=coin] | | 0 [icon=coin] |
| 31.01 | SALDO | | | 0 [icon=coin] |

INGEN ANDRE BEVEGELSER I PERIODEN.

[KONTOEN DISPONERES AV VERGE. KORT ER IKKE UTSTEDT.](fact:f_alt_via_grete)

## f_trygd

Label: Ellings uføretrygd
Summary: Ellings uføretrygd: 90 [icon=coin] i måneden.
Domain: Økonomi/bolig · Category: Økonomi
Supports: q_okonomi, q_bolig

## f_alt_via_grete

Label: Grete er øknomisk verge
Summary: Hele trygden går rett inn i Gretes system. Alle avtaler står i hennes navn.
Domain: Økonomi/bolig · Category: Økonomi
Supports: q_okonomi

# Document: doc_strom

Kind: REGNING · Register: formell
Title: FAKTURA NR. 99-114 872
Peek: Strømregning. 2. gangs varsel.
Meta: FAKTURADATO 20.02.1999

2. GANGS VARSEL
OLSEN GRETE
AMMERUDVEIEN 47, LEIL. 312
0958 OSLO

KUNDENR. 442 108
MÅLERNR. 08841-B
ANLEGG: AMMERUDVN. 47/312

| SPESIFIKASJON | MÅLT | BELØP |
| --- | ---: | ---: |
| Kraftforbruk 01.12.98–31.01.99 | 1 412 kWh | 12 [icon=coin] |
| Nettleie og fastavgift | - | 5 [icon=coin] |
| Purregebyr | - | 1 [icon=coin] |
| Å BETALE | | 18 [icon=coin] |

Vi kan ikke se å ha mottatt betaling for faktura 99-108 331 med forfall 15.02.1999. Ved fortsatt uteblitt betaling vil anlegget bli varslet for frakobling iht. leveringsvilkårene § 7.

BETALT AV: OLSEN GRETE, AMMERUDVEIEN 47, 0958 OSLO
BETALT TIL: OSLO ENERGIVERK, POSTBOKS 2 SENTRUM, 0101 OSLO
KONTO: 0540.08.11223 - KID: 99114872008
FORFALL: 15.03.1999 - BELØP: 18 [icon=coin]

# Document: doc_kassalapp

Kind: KASSALAPP · Register: formell
Title: MATSENTRALEN
Peek: En kassalapp fra skoesken.
Meta: 07.01.99 - KASSE 2

MATSENTRALEN
AMMERUD SENTER - OSLO
TLF 22 43 xx xx
ORG NR 934 xxx xxx

| HELMELK 1L | 1 [icon=coin] |
| KNEIPPBRØD | 1 [icon=coin] |
| KAFFE FILTERM. 250G | 2 [icon=coin] |
| POTETER 2KG | 1 [icon=coin] |
| KJØTTDEIG 400G | 3 [icon=coin] |
| GULROT PK | 1 [icon=coin] |
| HUSHOLDNINGSSAFT | 1 [icon=coin] |

| TOTALT | 10 [icon=coin] |
| [BANKKORT](fact:f_ingen_matkjop) | 10 [icon=coin] |

07.01.99  10:42  KASSE 2
OPERATØR: 014

TAKK FOR HANDELEN
VELKOMMEN IGJEN

## f_ingen_matkjop

Label: Ingen egne matkjøp
Summary: Elling har aldri betalt for mat selv. Mat skjer gjennom Grete.
Domain: Hverdag/rutine · Category: Økonomi
Supports: q_grete_dor

# Facts

## f_gap

Label: 100 [icon=coin] mangler
Summary: Uten Gretes pensjon mangler husholdet 100 [icon=coin] hver måned.
Domain: Økonomi/bolig · Category: Økonomi
Supports: q_okonomi, q_bolig
Derived: f_trygd, f_husleie

# Document: doc_huseier

Kind: BREV · Register: formell
Title: Brev fra huseieren - T. Bakkerud
Peek: "Jeg hører at din mor er gått bort."
Meta: T. BAKKERUD - HÅNDSKREVET - LEVERT I POSTKASSEN - VIDEREFORMIDLET AV 4012

Til Elling Olsen.

Jeg hører at din mor er gått bort. Kondolerer. Grete var et ordensmenneske, det har vært en glede å ha dere i oppgangen.

Jeg må likevel skrive om det praktiske. [Leien for mars er ikke kommet.](fact:f_leie_stoppet) [Din mor og jeg har holdt på siden -71 uten papirer. Det har aldri vært nødvendig.](fact:f_leie_privat) Nå vet jeg ikke hvem jeg skal forholde meg til.

Jeg vil ikke lage vanskeligheter. Men [jeg kommer innom på torsdag, så får vi snakke om veien videre.](fact:f_huseier_kommer)

Vennlig hilsen
T. Bakkerud

## f_leie_stoppet

Label: Husleien har stoppet
Summary: Husleien har stoppet. Betalingskjeden døde med Grete.
Domain: Økonomi/bolig · Category: Risiko
Supports: q_bolig, q_kollaps

## f_huseier_kommer

Label: Huseieren kommer torsdag
Summary: Huseieren varsler at han kommer innom. Torsdag.
Domain: Økonomi/bolig · Category: Risiko
Supports: q_bolig, q_baering

## f_leie_privat

Label: Privat leieforhold
Summary: Leieforholdet er privat og muntlig innarbeidet siden 1971. Ingen kontrakt å lene seg på.
Domain: Økonomi/bolig · Category: Dokument
Supports: q_bolig

# Document: doc_frank_tlf

Kind: FELTNOTAT · Register: notat
Title: Frank - telefonsamtale med Grete
Peek: "Hun tok den på andre forsøk."
Meta: FELTNOTAT - 4012 F. ÅSLI - TLF. G. OLSEN

Ringte Grete 11:40. Hun tok den på andre forsøk.

Hun visste hvorfor jeg ringte. Haug hadde sagt fra. Hun var ikke sint, men hun var klar: ["Han klarer seg. Han har alltid klart seg." Hun sa det to ganger.](fact:f_klarer_seg) Andre gangen lavere.

[Jeg spurte hvem som overtar hvis hun skulle bli innlagt. Det ble stille. Hun svarte ikke på det.](fact:f_ingen_plan)

[Jeg ba om å få hilse på Elling i telefonen. Hun sa han ikke tar telefonen. "Det er ikke noe galt med ham. Han liker bare ikke apparatet."](fact:f_elling_tlf)

Mot slutten [spurte hun om dette betydde at noen kom til å ta ham fra leiligheten](fact:f_grete_redd). Jeg sa nei. Jeg håper det var sant.

Hun gikk med på hjemmebesøk. "Hvis det må til." Det må til.

## f_klarer_seg

Label: "Han klarer seg"
Summary: Grete avviser bekymringen. Gjentar formuleringen.
Domain: Nettverk/sosialt · Category: Samtale
Supports: q_grete_dor
Reveals: call:grete

## f_ingen_plan

Label: Ingen overtakelsesplan
Summary: Det finnes ingen plan for hvem som overtar etter Grete.
Domain: Helse/risiko · Category: Samtale
Supports: q_grete_dor, q_bolig

## f_elling_tlf

Label: Elling tar ikke telefonen
Summary: Elling tar ikke telefonen. Grete normaliserer det.
Domain: Nettverk/sosialt · Category: Samtale
Supports: q_baering

## f_grete_redd

Label: Grete er redd
Summary: Grete frykter at kommunen vil ta leiligheten, eller Elling.
Domain: Nettverk/sosialt · Category: Samtale
Supports: q_bolig

# Document: doc_frank_visit

Kind: RAPPORT · Register: notat
Title: Frank - hjemmebesøk Ammerudveien 47
Peek: "Hun hadde dekket på med tre kopper."
Meta: HJEMMEBESØK - 4012 F. ÅSLI

Grete åpnet før jeg fikk ringt på. Hun hadde dekket på med tre kopper. Elling brukte ikke sin.

I gangen: [en bunke uåpnet post på skoskapet. Øverst: Trygdekontoret, sosialkontoret, Oslo Energi.](fact:f_post) Grete flyttet bunken da hun så at jeg så.

Elling satt i stuen med [en bok om polarekspedisjoner. Han noterte i margen. Systematisk, små bokstaver.](fact:f_bok) Jeg spurte om Nansen. Han svarte med tre presise setninger. Til veggen, ikke til meg.

Over skrivebordet hans: [avisutklipp, sirlig montert. Gro, landsmøter, 1. mai-tog. Årstall i hjørnene, hans håndskrift.](fact:f_utklipp) Det er ikke rot. Det er et arkiv.

[Han forlot ikke rommet, men flyttet seg slik at det alltid var et møbel mellom oss.](fact:f_avstand) Ikke demonstrativt. Bare slik det ble.

Grete fulgte meg ut. I trappen sa hun: ["Du så hvordan han er. Han er en smart gutt."](fact:f_smart_gutt) Hun er 72. Han er 35. Gutt.

## f_post

Label: Uåpnet post
Summary: Uåpnet post samler seg. Grete håndterer den - og skjuler den.
Domain: Hverdag/rutine · Category: Observasjon
Supports: q_grete_dor, q_okonomi

## f_bok

Label: Bok med notater
Summary: Elling leser krevende stoff og noterer systematisk. Konsentrasjonen er en ressurs.
Domain: Ressurser · Category: Ressurs
Supports: q_evner

## f_utklipp

Label: Avisutklipp-arkiv
Summary: Elling samler og systematiserer: utklipp av Gro og Arbeiderpartiet, datert og ordnet.
Domain: Ressurser · Category: Ressurs
Supports: q_evner

## f_avstand

Label: Holder avstand
Summary: Elling holder avstand til fremmede. Alltid et møbel mellom.
Domain: Nettverk/sosialt · Category: Observasjon
Supports: q_baering, q_evner

## f_dor_glott

Label: En dør på gløtt
Summary: Elling kastet ikke Frank ut, og svarte da Frank spurte om noe han kunne. Kontakt er mulig - forsiktig.
Domain: Nettverk/sosialt · Category: Samtale
Supports: q_baering
Quote: "han kastet meg ikke ut, og han svarte da jeg spurte om noe han kunne. Det er en dør på gløtt."

## f_smart_gutt
Label: En smart gutt
Summary: Grete omtaler Elling (35) som "gutt". Rollene er fastlåst.
Domain: Nettverk/sosialt · Category: Samtale
Supports: q_grete_dor, q_evner

# Document: doc_innleggelse

Kind: MELDING · Register: klinisk
Title: OUS Ullevål - innleggelse
Peek: "…ber om at kommunen ser til ham."
Meta: ULLEVÅL SYKEHUS - TIL SOSIALKONTORET - 14.02.1999

MELDING OM INNLEGGELSE

Grete Olsen (f. 1927) ble [innlagt akutt 14.02](fact:f_innlagt), kl. 06:50. Tilstanden er alvorlig, men avklart. Pårørende: sønn, Elling Olsen.

[Pasienten oppgir at sønnen ikke er varslet. Hun ber om at kommunen ser til ham.](fact:f_elling_uvarslet) Hun var tydelig på dette før hun ble lagt i behandling.

SOSIALMEDISINSK ENHET - OUS

## f_innlagt

Label: Grete innlagt
Summary: Grete er akutt innlagt på Ullevål.
Domain: Helse/risiko · Category: Dokument
Supports: q_grete_dor, q_bolig

## f_elling_uvarslet

Label: Elling uvarslet
Summary: Elling vet ikke at Grete er innlagt. Hun ber kommunen se til ham.
Domain: Helse/risiko · Category: Dokument
Supports: q_baering, q_kollaps

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

## f_brevsprekken

Label: Beskjed gjennom brevsprekken
Summary: Han åpent ikke døren, men beskjeden ble levert i brevsprekken.
Domain: Nettverk/sosialt · Category: Dokument
Supports: q_baering, q_kollaps

# Document: doc_status

Kind: STATUSRAPPORT · Register: notat
Title: Frank - status dag 8
Peek: En uke siden meldingen.
Meta: STATUSRAPPORT - 4012 F. ÅSLI - DAG 8

Det foreligger ikke iverksatte tiltak som dekker bolig eller hverdag.

Restanse bygges. Posten vokser. Døren er lukket. Kommunen vet nå svært mye om Elling Olsen, og når ham ikke.

Bekymringsmeldingen var berettiget. Det er den fortsatt.

# Question: q_grete_dor

Title: Den dagen Grete ikke kommer hjem - hva stopper?
Teaser: Det er noe her om hva som faktisk stopper den dagen Grete ikke er der. Jeg har ikke ord på det ennå.
when: f_grete_syk and f_klarer_seg
Lead: "Ring Grete" -> call:grete

# Question: q_evner

Title: Hva klarer Elling selv - når ingen har gjort det for ham først?
Teaser: Jeg tror vi vet mindre om hva Elling klarer enn vi tror. Det ligger noe her.
when: f_bok and f_utklipp
Lead: "Åpne ett brev sammen med Frank" -> t_brev

# Question: q_okonomi

Title: Regnestykket Olsen: hva kommer inn, hva går ut - og gjennom hvem?
Teaser: Tallene går opp - men jeg klarer ikke helt å se gjennom hvem. Verdt å se på.
when: f_grete_baerer and f_trygd and f_husleie
Lead: "Be om økonomisk oversikt" -> d_konto
Lead: "Snakk med huseieren" -> t_huseier

# Question: q_bolig

Title: Kan Elling bli boende - når husleien har stoppet?
Teaser: Det er noe med leiligheten som ikke tåler mange spørsmål. Ta en titt når du kan.
when: f_gap and f_leie_stoppet and f_husleie
Lead: "Snakk med huseieren" -> t_huseier

# Question: q_baering

Title: Noe av det Grete gjorde må noen andre gjøre. Hvor lite kan kommunen slippe unna med - og hvor mye tåler han?
Teaser:
when: f_elling_tlf and f_avstand

# Question: q_vekst

Title: Hva kan læres - og i hvilket tempo, uten å knekke noe?
Teaser: Jeg så noe hos ham som kan bygges på. Usikker på tempoet. Vi bør snakke om det.
Card title: Hva kan læres?
when: f_bok and f_utklipp

# Question: q_kollaps
Title: Hva kollapser først nå?
Teaser: Noe her har begynt å rakne. Jeg vet ikke hva som går først.
when: f_dod
Card title:

# Question: q_liv

Title: Ikke bare berget - levd. Hva skulle til for at Elling har et liv han vil ha?
Teaser: Det ligger et større spørsmål her enn berging. Jeg klarer ikke slippe det.
when: f_dod and f_utklipp

# Hypothesis: h_gd_system

Title: Husholdet er et system med to. Med én står det stille.
Summary: Mat, avtaler, post og kontakt går gjennom arbeidsdeling som forsvinner med Grete. Det er systemet som dør, ikke bare et fravær.
Question: q_grete_dor
needs: f_smart_gutt and f_ingen_matkjop
Opens: t_matlevering

# Hypothesis: h_gd_infra
Title: Alt praktisk er usynlig infrastruktur: mat, post, kontakt.
Summary: Funksjonene er ikke dokumentert noe sted og overlever ikke bortfall uten overføring.
Question: q_grete_dor
needs: f_post and f_ingen_matkjop
Opens: t_hjemmehjelp, t_matlevering, t_dokgjennomgang

# Hypothesis: h_gd_ukjent

Title: Ingenting vi vet. Ingen har noen gang sett Elling alene.
Summary: Det finnes ikke observasjon av Elling uten Grete. Uvitenheten er selve funnet - og den må lukkes før noe annet.
Question: q_grete_dor
needs: f_ingen_plan
Opens dispatches: hjemmebesok

# Hypothesis: h_ev_kanmer

Title: Mer enn det ser ut til.
Summary: Konsentrasjon, arkiv og system er observert.
Question: q_evner
needs: f_bok and f_utklipp
Opens: t_brev

# Hypothesis: h_ev_unngaar

Title: Han forstår - men unngår. Posten ligger uåpnet, ikke ulest.
Summary: Kapasiteten til å forstå er observert. Papiret når likevel aldri frem, fordi konvolutten aldri åpnes. Problemet er kanal, ikke forståelse.
Question: q_evner
needs: f_post and f_bok
Opens: t_dokgjennomgang

# Hypothesis: h_ev_ukjent

Title: Vet ikke. Ingen har prøvd. Det er selve funnet.
Summary: Kommunen har ingen observasjon av hva Elling klarer alene. Første tiltak må være å finne det ut - forsiktig.
Question: q_evner
Needs:
Opens: t_brev, t_regning

# Hypothesis: h_ok_kjede

Title: Betalingskjeden er én person. Kjeden, ikke beløpene, er risikoen.
Summary: Husleie og faste betalinger fungerer gjennom Gretes system - skoesken, postgiroene, kontantene den første. Systemet har én operatør.
Question: q_okonomi
needs: f_husleie and f_alt_via_grete
Opens: t_forvaltning, d_konto

# Hypothesis: h_ok_gap

Title: Trygden dekker ikke husholdet. 100 [icon=coin] mangler hver måned.
Summary: Ellings trygd er 90 [icon=coin]. Husleien alene er 120 [icon=coin], og januar kostet 190. Differansen bæres i dag av Gretes pensjon. Bortfall gir umiddelbar restanserisiko.
Question: q_okonomi
needs: f_gap
Opens: t_bostotte, t_huseier, d_konto, c_frank_okonomi [type=conversation category=frank actor=frank risk=okonomi sim=case.olsen.opening.conversation.frank_okonomi]

# Hypothesis: h_b_sikres

Title: Boligen kan sikres - med bostøtte og ordnet betalingskjede.
Summary: Med bostøtte og en betalingskjede som ikke går gjennom én person kan leieforholdet overleve.
Question: q_bolig
needs: f_gap and f_trygd
Opens: t_bostotte, t_forvaltning

# Hypothesis: h_b_flytte

Title: Boligen kan ikke holdes. Flytting bør forberedes nå.
Summary: Privat, muntlig leieforhold uten kontrakt tåler ikke dødsfallet. Å vente er å velge kaos senere.
Question: q_bolig
needs: f_gap and f_leie_privat
Opens: t_huseier

# Hypothesis: h_b_uavklart

Title: Uavklart - økonomien må kartlegges først.
Summary: Å velge bolig-retning uten regnestykket er gjetning. Kartlegg først.
Question: q_bolig
Needs:
Opens: d_konto

# Hypothesis: h_ba_kanal

Title: Først en kanal. Fast person, fast tid, oppmøte - telefonen er stengt.
Summary: Elling tar ikke telefonen og holder avstand til fremmede. Uten en kanal inn er alle andre tiltak teori.
Question: q_baering
needs: f_elling_tlf and f_avstand
Opens: t_hjemmehjelp

# Hypothesis: h_ba_drift

Title: Deler av driften: mat og papir kan erstattes uten å erstatte Grete.
Summary: Matlevering og dokumentgjennomgang dekker de kritiske funksjonene uten å institusjonalisere noe som helst.
Question: q_baering
needs: f_post and f_ingen_matkjop
Opens: t_matlevering, t_dokgjennomgang

# Hypothesis: h_ba_alt

Title: Alt. Fullt omsorgsansvar - institusjon eller omsorgsbolig.
Summary: Sårbarheten vurderes som for stor for hjemmeboende støtte. Tyngste ende av skalaen - og den kan alltid utløses.
Question: q_baering
needs: f_saarbar
Opens: t_institusjon

# Hypothesis: h_ve_rutine

Title: Én rutine om gangen. Konsentrasjonen er der; tempoet må være hans.
Summary: Kapasitet til fordypning og system er observert. Avgrensede rutiner kan bygges med støtte - lavt tempo, fast person, hans eget arkivspråk.
Question: q_vekst
needs: f_bok
Opens: t_brev, t_regning

# Hypothesis: h_ve_formell

Title: Ferdighetene er der ikke. Støtte må bære - læring er ikke planen nå.
Summary: Funksjonsnivået vurderes som for lavt for egenmestring. Tjenestene må dimensjoneres for full kompensasjon.
Question: q_vekst
needs: f_saarbar
Opens: t_hjemmehjelp

# Hypothesis: h_ve_interesser

Title: Vokse i det han alt gjør: arkivet, systemene, interessene.
Summary: Identitet over progresjon: bygg videre på Gro-arkivet og systemene han allerede driver, ikke på manglene.
Question: q_vekst
needs: f_utklipp
Opens: t_brev

# Hypothesis: h_c_penger

Title: Økonomien. Husleien stopper denne måneden.
Summary: Betalingskjeden døde med Grete. Restansen begynner å løpe nå.
Question: q_kollaps
needs: f_gap
Opens: t_forvaltning, t_bostotte

# Hypothesis: h_c_mat

Title: Maten. Ingen matkjøp står i hans navn.
Summary: Grete handlet inn. Kontoutskriften hans viser ikke ett matkjøp.
Question: q_kollaps
needs: f_ingen_matkjop
Opens: t_matlevering

# Hypothesis: h_c_kontakt

Title: Kontakten. Uten kanal inn er alt annet teori.
Summary: Dødsbudskapet gikk gjennom brevsprekken. Døren er fortsatt lukket.
Question: q_kollaps
needs: f_brevsprekken
Opens: t_hjemmehjelp

# Hypothesis: h_liv_interesser

Title: Deltakelse via interessene. Arkivet er en dør ut, ikke et symptom.
Summary: Gro-arkivet og systematikken er en identitet det går an å delta gjennom - i hans tempo.
Question: q_liv
needs: f_utklipp and f_bok
Opens:

# Hypothesis: h_liv_trygghet

Title: Trygghet først. Verden i hans tempo, med møbel imellom - og det er greit.
Summary: Avstanden er ikke et problem som skal fikses, men et premiss tjenestene må respektere.
Question: q_liv
needs: f_avstand

# Hypothesis: h_liv_sporre

Title: Det vet bare Elling. Noen må spørre ham - og noen må kunne få svar.
Summary: Ingen har spurt Elling hva han vil. Svaret krever en kanal som virker.
Question: q_liv
needs: f_elling_tlf

# Tiltak: t_bostotte

Title: Søk bostøtte
Slot: s1 · Cost: 0
Description: Husbanken. Krever dokumentert inntekt og husleie. Saksbehandlingstid.
Sim hook: case.olsen.tiltak.bostotte

# Tiltak: t_forvaltning

Title: Frivillig forvaltning av faste betalinger
Slot: s1 · Cost: 1
Description: Kommunen overtar skoesken. Trygt. Bygger ingenting.
Sim hook: case.olsen.tiltak.forvaltning

# Tiltak: t_huseier

Title: Snakk med huseieren
Slot: s1 · Cost: 0
Description: Bakkerud vil vite hvem han skal forholde seg til. La det bli Frank - ikke torsdagsbesøket.
Sim hook: case.olsen.tiltak.garanti

# Tiltak: t_hjemmehjelp

Title: Hjemmehjelp 2× uke - Frank
Slot: s2 · Cost: 2
Description: Fast person, fast tid. Den eneste kanalen inn som har virket hittil.
Sim hook: case.olsen.tiltak.channel

# Tiltak: t_matlevering

Title: Matombringing
Slot: s2 · Cost: 1
Description: Bokser på døren, tre dager i uken. Forutsetter at døren er en kanal.
Sim hook: case.olsen.tiltak.food

# Tiltak: t_dokgjennomgang

Title: Fast dokumentgjennomgang
Slot: s2 · Cost: 1
Description: Frank går gjennom posten ukentlig. Papiret når frem til en vurdering.
Sim hook: case.olsen.tiltak.dok

# Tiltak: t_brev

Title: Åpne ett brev sammen med Frank
Slot: s3 · Cost: 0
Description: Ett brev. Ikke bunken. Frank legger det på bordet og venter.
Sim hook: case.olsen.tiltak.brev

# Tiltak: t_regning

Title: Betal én regning med støtte
Slot: s3 · Cost: 0
Description: Én regning, én gang. Målet er at det har skjedd, ikke at det er lært.
Sim hook: case.olsen.tiltak.regning

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

# Clock: ck_selvstendighet

Label: Skjør rutine
Sim hook: case.olsen.clock.rutine
Question: Tåler én rutine å bli båret av Elling, med stillas?
Good: Tar imot og håndterer / 4 · Bad: Presset for hardt / 4

# Clock: ck_omsorgssvikt

Label: Omsorgen svikter
Sim hook: case.olsen.clock.neglect
Question: Blir leveringene stående urørt utenfor døren?
Good: / 4 · Bad: Levering blir stående / 4

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

# Event deltas

## grete_received

Log: Grete tok imot leveringen ved døren.

## delivery_taken_in

Log: Elling åpnet selv og tok leveringen inn.
Clock: ck_selvstendighet +1

## delivery_unanswered

Log: Leveringen ble stående urørt utenfor døren.
Clock: ck_omsorgssvikt +1

# Beat: day 2 [id=beat_grete_d2]

Grete blir sliten.

# Beat: day 3 [id=beat_grete_d3]

Grete skulle ringe tilbake om papirene. Hun ringte ikke.

# Beat: day 4 [id=beat_grete_d4]

Grete er innlagt.
~ deliver doc_innleggelse in 0d on ck_grete

# Beat: day 5 [id=beat_grete_d5]

Grete Olsen er død.
~ deliver doc_dodsfall in 0d on ck_grete

# Beat: day 6 [id=beat_grete_d6]

Håndskrevet brev - T. Bakkerud
~ deliver doc_huseier in 0d on ck_grete

# Beat: day 7 [id=beat_grete_d7]

Posten kommer. En regning stilet til Grete. I skoesken: en kassalapp.
~ deliver doc_strom in 0d on ck_grete
~ deliver doc_kassalapp in 0d on ck_grete

# Beat: day 8 [id=beat_grete_d8]

En uke siden meldingen.
~ deliver doc_status in 0d on ck_grete

# Conversation: chat:frank

* f_post: Posten, den lar han bare ligge.
    Kan hende det. Jeg tror nok han vet nøyaktig hva som ligger der. Han la merke til at jeg så på bunken, jeg la merke til at han ble urolig av det.
    Så det er ikke likegyldighet. Det er noe som ligner mer på engstelighet.
    * * Engstelighet for hva?
        Hvert brev er en beskjed om at noen venter på noe han ikke får til.
        Jeg tror ikke det har vært hans oppgave å åpne posten.
    * * Er det noe vi må håndtere?
        Ikke ta den fra ham. Da tar du det siste han har kontroll på.
        Åpne ett brev. Sammen. Det ufarligste først - strømregningen, ikke sosialkontoret. La ham se at et åpnet brev ikke eksploderer.

* f_smart_gutt: "En smart gutt" - hva la du i det? [id=c_smart]
    Hun sa det i trappen, lavt, som om det var en hemmelighet. Hun har båret ham så lenge at jeg tror hun ikke lenger vet hva som er ham og hva som er henne.
    Det er det vi egentlig skal kartlegge.
    * * Kartlegge - hva da, egentlig?
        Hvor Grete slutter og Elling begynner.
        Alt hun gjør ligner omsorg. Noe av det er det. Resten er femti år med vane som ingen har turt å forstyrre.

* f_klarer_seg: Tror du på "han klarer seg"? [id=c_klarer]
    Folk sier det på to måter. Som en vurdering, eller som et håp. Hun sa det to ganger. Andre gangen var det et håp.

* f_bok: Boken og notatene - hva sier det deg?
    Tre setninger om Nansen, presise, til veggen. Det er ikke en som mangler evner. Det er en som mangler trening i å ha noen i rommet.
    Det er to forskjellige problemer. Og de har to forskjellige løsninger.
    * * To løsninger - hvilke?
        Evnene trenger ingenting av oss. De er der. Rommet trenger trening.
        Én person. Samme person, samme tid, hver uke - til det slutter å være farlig å ha noen der. Alt annet er støy.
    * * Kan han bo alene, mener du?
        Feil spørsmål. Han har aldri fått prøvd.
        Ingen har noen gang sett ham gjøre noe alene. Ikke fordi han ikke kan - fordi ingen har sluppet ham til. Vi vet ikke hva han klarer. Det burde uroe deg mer enn posten.
        Tanke: "VURDERING - "Vet ikke" er ikke et hull i saken. Det ER saken."

* f_avstand: Møbelet mellom dere - hvor lang vei er det inn?
    ~ pay f_dor_glott
    Lang. Men han kastet meg ikke ut, og han svarte da jeg spurte om noe han kunne.
    Det er en dør på gløtt. Den lukkes hvis vi river i den.
    * * Hva var det som åpnet den?
        At jeg spurte om noe han kunne svare på. Ikke omsorg. Kunnskap.
        Det er kanalen inn: la ham være den som vet. Alle andre i livet hans har vært den som ordner.
    * * Og hvis vi river i den?
        Da lukkes den. Og jeg tror ikke den åpner for den neste som ringer på.
        Vi har én sjanse til å være de som ikke rev.

* f_utklipp: Utklippene av Gro - hva gjør vi med det? [id=c_gro]
    Jeg spurte om valget i -97. Han snakket i fire minutter uten pause - årstall, navn, partilandsmøter. Ikke til meg. Men det var nesten.
    Det arkivet er det mest levende i den leiligheten. Hvis vi noen gang skal bygge noe med ham, begynner det der.
    * * Begynne der - hvordan, konkret?
        Spør ham om ting han vet. Politikk, årstall, fakta. Aldri om følelser, aldri om Grete.
        Han snakker når han er den som kan noe og du er den som spør. Snu rollene, og døren er igjen.

* f_brevsprekken: Brevsprekken. Hørte han det, tror du? [id=c_brevsprekk]
    Han sto rett innenfor. Politiet hørte ham puste. Han hørte hvert ord, og han klarte ikke å åpne. Det er det vi jobber med nå. Ikke sorgen. Døren.

* f_dor_glott: Døren på gløtt - hva holder den åpen? [answer=none]
    At noen spør ham om noe han kan svare på. Det er hele mekanikken.
    Den tåler ikke omsorg ennå. Den tåler spørsmål.

# Proposal: matlevering

Relevant: f_ingen_matkjop, f_dor_glott
Line: "Matlevering, kanskje. Ingen matkjøp står i hans navn - middag på døra tre dager i uken kan overta. Forutsetter at døren er en kanal."

# Proposal: hjemmehjelp

Relevant: f_avstand, f_elling_tlf, f_dor_glott
Line: "Praktisk bistand. Én fast person, én fast tid - det er den eneste kanalen inn som har virket hittil."

# Proposal: bostotte

Relevant: f_gap, f_trygd, f_husleie
Categories: Økonomi
Line: "Søk bostøtte. Trygden dekker ikke husleien - tilskuddet kan tette gapet. Papirarbeid, men det haster."

# Proposal: forvaltning

Relevant: f_alt_via_grete, f_husleie, f_gap
Line: "Frivillig forvaltning, kanskje. Skoesken trenger en ny operatør - kommunen kan betale de faste utgiftene direkte. Trygt. Bygger ingenting."

# Proposal: mekling

Relevant: f_huseier_kommer, f_leie_stoppet, f_leie_privat
Line: "Utleier-mekling. Bakkerud vil vite hvem han skal forholde seg til - en betalingsplan kan roe det før torsdagsbesøket."

# Proposal: boopp

Relevant: f_leie_stoppet, f_post
Line: "Booppfølging, muligens. En miljøarbeider ukentlig kan holde boligdriften samlet - hvis han tåler en ny person i rommet."

# Proposal: radgivning

Relevant: f_gap, f_post
Categories: Økonomi
Line: "Økonomisk rådgivning. Time hos gjeldsrådgiver - på kontoret. Jeg er usikker på om han kommer seg dit."

# Proposal: innkjop

Relevant: f_ingen_matkjop, f_alt_via_grete
Line: "Innkjøpsordning. Ingen har handlet for ham siden Grete - varer levert én gang i uken er det minste som kan virke."

# Proposal: maltidsvenn

Relevant: f_avstand, f_ingen_matkjop
Line: "Måltidsvenn, forsiktig. Noen som spiser middag MED ham - men det er en fremmed ved bordet. Usikker."

# Proposal: kartlegging

Relevant: f_ingen_plan
Line: "Funksjonskartlegging. Ingen har noen gang sett Elling alene - et strukturert besøk kan lukke det hullet."

# Proposal: oppfolging

Relevant: f_ingen_plan
Line: "Oppfølgingsvedtak, kanskje. To timer ekstra per dag i saken - hvis dette skal bæres, må noen få tid til å bære."

# Proposal: samtaler

Relevant: f_brevsprekken, f_avstand
Line: "Støttesamtaler, på sikt. Fast samtalekontakt én gang i uken - men kanalen inn må finnes først."

# Proposal: stottekontakt

Relevant: f_utklipp, f_bok
Line: "Støttekontakt. Tre timer i uken rundt det han allerede bryr seg om - arkivet er et sted å begynne."

# Proposal: tilsyn

Relevant: f_saarbar, f_brevsprekken
Line: "Tilsynsbesøk daglig. Hjemmetjenesten innom hver dag - det er mye trykk på en lukket dør. Tyngre enn jeg liker."

# Proposal: besoksvenn

Relevant: f_avstand
Line: "Besøksvenn, kanskje. Frivillig én gang i uken - mildere enn tjenester, men fortsatt en fremmed i stuen."

# Proposal: dagsenter

Relevant: f_avstand
Line: "Dagsenter er langt unna der han er nå. To dager i uken ute blant folk - jeg tror ikke han går dit ennå."

# Proposal: folgetjeneste

Relevant: f_elling_tlf
Line: "Følgetjeneste. Følge til avtaler utenfor hjemmet - hvis det noen gang blir avtaler."

# Proposal: hverdagsrehab

Relevant: f_bok, f_avstand
Line: "Hverdagsrehabilitering, muligens. Fire uker trening i egen bolig - men et tverrfaglig lag i leiligheten er mye på én gang."

# Proposal: parorende

Relevant: f_grete_baerer, f_grete_syk
Line: "Pårørendestøtte. Grete bar alt - avlastning og veiledning kunne lettet henne mens hun ennå bærer."

# Proposal: tt

Relevant: f_avstand
Line: "TT-kort. Subsidiert transport, åtte turer i måneden - men han har ingen steder han skal ennå."

# Proposal: alarm

Relevant: f_saarbar
Line: "Trygghetsalarm, tja. Utrykning ved fall - jeg er usikker på om det treffer det som er skjørt her."

# Proposal: depositum

Relevant: f_leie_privat, f_leie_stoppet
Line: "Depositumsgaranti. Bare aktuelt hvis det blir flytting - garanti for et nytt leieforhold."

# Proposal: kbolig

Relevant: f_leie_stoppet, f_gap
Line: "Kommunal bolig, hvis leiligheten ikke kan holdes. Men å flytte ham er å flytte alt han er."

# Proposal: startlan

Relevant: f_trygd, f_gap
Line: "Startlån. Lån til kjøp av egen bolig - det er langt fra der denne saken står."

# Recipe: f_bok + f_utklipp

~ open q_vekst
Frank: "Boken og utklippene. Ja. Jeg har tenkt på dem sammen, men jeg fikk det ikke sagt."
Frank: "Han holder krevende stoff i hodet og noterer systematisk. Og han klipper ut, daterer og ordner. Begge deler er hans egne."
Frank: "Så spørsmålet er ikke om han kan lære. Det er hva som kan læres - og i hvilket tempo, uten å knekke noe."

# Recipe: f_grete_syk + f_klarer_seg

~ open q_grete_dor
Frank: "Haug skriver kort forventet forløp. Grete sier han klarer seg. Begge kan ikke ha rett."
Frank: "Hun har båret alt så lenge at hun ikke ser det selv. Den dagen hun ikke kommer hjem, stopper noe - og vi vet ikke hva."
Frank: "Jeg tror ikke vi finner det med spørsmål. Jeg tror vi finner det ved å være der."

# Conversation: call:grete

gate: f_grete_baerer
Soft reject: "… Jeg vet ikke hva du mener med det."

Ja, hallo?
du: Det gjelder Elling. Dr. Haug har meldt bekymring.
[Han klarer seg. Han har alltid klart seg.](fact:f_klarer_seg)

* f_grete_baerer: Hvem overtar hvis du skulle bli innlagt?
    [… (det blir stille i den andre enden)](fact:f_ingen_plan)

* f_klarer_seg: Kan jeg få hilse på Elling?
    [Han tar ikke telefonen. Det er ikke noe galt med ham. Han liker bare ikke apparatet.](fact:f_elling_tlf)

* f_saarbar: Vi vil gjerne komme på hjemmebesøk.
    [Betyr dette at noen kommer til å ta ham fra leiligheten?](fact:f_grete_redd)
    … Hvis det må til.

// SB-072 migration (PLAN-009 Task 3): the SocialVisitDirector Oppdrag catalog
// (OPPDRAG_TITLES, OPPDRAG_OFFER_LINES, OPPDRAG_UNLOCK_QUESTIONS,
// OPPDRAG_BEATS) and the hosting-spine LINE_* literals live here now,
// verbatim modulo the typography convention (straight quotes, hyphens).

# Visit: oppdrag_alene

Title: Klarer han seg alene?
Blurb: Se på Elling. Hva klarer han, hva klarer han ikke.
Offer: "Godt spørsmål. Vil du at jeg skal se på hva han faktisk klarer, ved neste besøk?"
Unlocks: q_evner
Stub: yes

- ! grete: blir i stua @ living_room [id=opp_a_hold duration=18 no_wait]
- ? elling @ living_room [id=opp_a6 beat=a6 duration=8]
- frank: "Er det Nansen du leser om?" [id=opp_a2 beat=a2 dwell=4]
- elling: "Nansen lot Fram fryse fast i isen. 1893. Det var planen hele tiden." [id=opp_a3 beat=a3 dwell=4]
- frank: "Liker du å bo her, Elling?" [id=opp_a4 beat=a4 dwell=4]
- grete: "Han har det fint her. Han har alt han trenger." [id=opp_a5 beat=a5 dwell=4]

# Visit: oppdrag_okonomi

Title: Se på økonomien
Blurb: Papirene. Hvem betaler hva, og hvem vet hvordan.
Offer: "Tallene, ja. Vil du at jeg skal se på økonomien ved neste besøk?"
Unlocks: q_okonomi
Stub: yes

- ! grete: finner frem esken @ kitchen [id=opp_p1a duration=3]
- ! grete: blir ved bordet @ kitchen [id=opp_p_hold duration=24 no_wait]
- ? elling @ kitchen [id=opp_p6 beat=p6 duration=6]
- ! frank: ser på papirene @ kitchen [id=opp_p1b duration=3]
- grete: "Alt ligger i esken. Ferdig utfylt, sortert på forfall." [id=opp_p2 beat=p2 dwell=4]
- frank: "Vet Elling hvor esken står?" [id=opp_p3 beat=p3 dwell=4]
- grete: "Elling? Nei da." [id=opp_p4 beat=p4 dwell=4]

# Visit: oppdrag_tillit

Title: Ikke press. Bygg tillit.
Blurb: Sitt. Ta kaffen. La henne snakke.
Offer: "Skjønner. Ikke press. Vil du at jeg skal bygge tillit ved neste besøk?"
Unlocks: q_grete_dor
Stub: yes

- ! grete: blir sittende @ living_room [id=opp_t_hold duration=17 no_wait]
- grete: "Legen sier det er kort tid. Elling vet ikke." [id=opp_t3 beat=t3 dwell=5]
- grete: "Han var ikke sånn før. Han var på skolen, han hadde venner." [id=opp_t4 beat=t4 dwell=5]
- grete: "Jeg tenker på hva som skjer. Hele tiden." [id=opp_t5 beat=t5 dwell=5]

# Strings: visit

Stub: yes
hallway_announced: "du ringte i sted - kom inn."
hallway_unannounced: "frank? nå? ...vent litt, jeg rydder en stol."
greet: "hei, Elling."
sofa_talk: "han spiser lite om dagen."
escort: "Du så hvordan han er. Han er en smart gutt."
gang_rydde: "Jeg har ikke rukket å rydde."
rope_elling: "Elling! Frank er her."
venter_elling: "Han kommer. Han liker ikke uventet besøk."
sette_seg: "Jeg må bare sette meg litt."

// SB-072 migration (PLAN-009 Task 4): notat glue (notat_composer consts +
// doc header), the notat-fragment run texts, and the prologue scene copy
// live here now, verbatim modulo the typography convention. Fact couplings,
// beat keys, observable keys and run ids stay engine data in core-loop -
// only the TEXT migrated.

# Strings: notat

Stub: yes
opener_arrival_1: "Grete åpnet før jeg fikk ringt på. Hun hadde dekket på med tre kopper. Elling brukte ikke sin."
opener_arrival_2: "I gangen: en bunke uåpnet post på skoskapet. Øverst: Trygdekontoret, sosialkontoret, Oslo Energi. Grete flyttet bunken da hun så at jeg så."
line_a2: "Elling satt i stuen med en bok om polarekspedisjoner. Han noterte i margen. Systematisk, små bokstaver."
line_a3: "Jeg spurte om Nansen. Han svarte med tre presise setninger. Til veggen, ikke til meg."
line_a5: "Jeg spurte Elling om han liker å bo her. Grete svarte for ham."
line_a6: "Han forlot ikke rommet, men flyttet seg slik at det alltid var et møbel mellom oss. Ikke demonstrativt. Bare slik det ble."
line_p2: "Grete fant frem alt. Postgiroene ligger i en skoeske, ferdig utfylt, sortert på forfall. Alle avtaler står i hennes navn."
line_p4: "Jeg spurte om Elling visste hvor skoesken sto. Hun lo, kort."
line_p6: "Elling satt ved bordet mens jeg gikk gjennom esken. Han rettet på bunkene da jeg la dem fra meg. Han visste rekkefølgen."
line_t3: "Hun sa at legen har gitt henne kort tid, og at Elling ikke vet det."
line_t4: "Hun snakket om ham før. Skolen, venner. Hun snakket lenge."
line_t5: "\"Jeg tenker på hva som skjer. Hele tiden.\""
unseen_alene: "ham selv"
unseen_okonomi: "papirene"
unseen_tillit: "å bli sittende lenge nok til at hun snakket fritt"
unseen_prefix: "Ikke undersøkt denne gangen: %s."
closer: "I trappen sa hun: \"Du så hvordan han er. Han er en smart gutt.\" Hun er 72. Han er 35. Gutt."
doc_kind: "HJEMMEBESØK"
doc_title: "Frank - hjemmebesøk"
doc_meta: "HJEMMEBESØK-NOTAT - 4012 F. ÅSLI - DAG %d"

# Strings: notat_fragments

Stub: yes
nf_mess_tidy.run_0: "Over skrivebordet: "
nf_mess_tidy.run_utklipp: "avisutklipp, sirlig montert. Det er ikke rot. Det er et arkiv."
nf_mess_messy.run_0: "I gangen: "
nf_mess_messy.run_post: "en bunke uåpnet post på skoskapet."
nf_mess_decaying.run_post: "Posten vokser. Døren er lukket."
nf_grete_present.run_0: "Grete var der. "
nf_grete_present.run_smart_gutt: "\"Du så hvordan han er. Han er en smart gutt.\""
nf_grete_absent.run_brevsprekken: "Sønnen åpnet ikke døren. Beskjeden ble gitt gjennom brevsprekken."
nf_tea_accepted.run_0: "Hun hadde dekket på med tre kopper. "
nf_tea_accepted.run_smart_gutt: "\"Du så hvordan han er. Han er en smart gutt.\""
nf_tea_declined.run_0: "Elling brukte ikke sin kopp. "
nf_tea_declined.run_avstand: "Han flyttet seg slik at det alltid var et møbel mellom oss."
nf_elling_withdrawn.run_avstand: "Han forlot ikke rommet, men flyttet seg slik at det alltid var et møbel mellom oss."
nf_elling_engaged.run_0: "Elling satt med "
nf_elling_engaged.run_bok: "en bok om polarekspedisjoner. Han noterte i margen. Systematisk."
nf_elling_engaged_b.run_0: "Over skrivebordet hans: "
nf_elling_engaged_b.run_utklipp: "avisutklipp, sirlig montert. Årstall i hjørnene, hans håndskrift."

# Strings: prologue

Stub: yes
beat_01: "LEGESENTERET - TIRSDAG I FEBRUAR 1999"
beat_02: "Prøvesvarene er kommet. Det er som vi trodde."
beat_03: "Ja."
beat_04: "Det er stille en stund. Noen ler av noe i naborommet."
beat_05: "Har du noen rundt deg? Fremover, mener jeg."
beat_06: "Jeg har Elling."
beat_07: "Grete. Det var Elling jeg ville snakke om."
beat_08: "Han klarer seg. Han har alltid klart seg."
beat_09: "Med deg."
beat_10: "Grete ser ut vinduet. Det har begynt å snø - tunge, våte flak som ikke blir liggende."
beat_11: "Jeg har ikke fortalt ham noe ennå. Han skal få vite det når jeg vet hvordan det skal sies."
beat_12: "Hvis du vil, melder jeg fra til bydelen. Ikke noe mer enn det. Bare så noen vet."
beat_13: "Grete tar på seg hanskene. Én finger om gangen."
beat_14: "Dere får gjøre det dere må."
beat_15: "Etter at hun har gått, blir Haug sittende litt. Så skriver han. To avsnitt. Han leser dem en gang til og stryker ordet \"alvorlig\". Sender."
beat_16: "MOTTATT - SOSIALKONTORET"
stamp_end: "Meldingen ligger på pulten din."

// SB-072 migration (PLAN-009 Task 5): the håndbok family. handbok_state
// log/slip templates (interpolation slots intact), tiltak text fields
// (navn/ytelse/dawn/krav display), frank-action navn/gate_note. The .tres
// keep data (costs, krav predicates, ids); text overlays at catalog load.

# Strings: handbok_tiltak

Stub: yes
alarm.navn: "TRYGGHETSALARM"
alarm.ytelse: "alarm ved fall; utrykning."
alarm.dawn: "alarm montert. [ligger i skuffen]."
alarm.krav.0: "bruker bærer alarmen"
besoksvenn.navn: "BESØKSVENN"
besoksvenn.ytelse: "frivillig besøker i hjemmet, 1×/uke."
besoksvenn.dawn: "[besøksvenn] tildelt fra frivilligsentralen."
besoksvenn.krav.0: "bruker tar imot besøk - dokumentert"
boopp.navn: "BOOPPFØLGING"
boopp.ytelse: "miljøarbeider hjemme ukentlig; struktur i boligdrift."
boopp.dawn: "oppstart neste uke. [miljøarbeider tildelt]."
boopp.krav.0: "kartlagt funksjonstap i boligførsel"
boopp.krav.1: "samtykke fra bruker"
bostotte.navn: "BOSTØTTE"
bostotte.ytelse: "statlig tilskudd til husleie, månedlig."
bostotte.dawn: "søknad sendt. svar om [3 uker]."
bostotte.krav.0: "inntekt under sats"
bostotte.krav.1: "søknad m/ dokumentasjon"
dagsenter.navn: "DAGSENTER"
dagsenter.ytelse: "dagtilbud m/ måltid, 2 dager/uke."
dagsenter.dawn: "plass reservert. [ingen oppmøte]."
dagsenter.krav.0: "kommer seg til senteret / transport ordnet"
depositum.navn: "DEPOSITUMSGARANTI"
depositum.ytelse: "garanti for depositum ved nytt leieforhold."
depositum.dawn: "[ingen flytting aktuell]."
depositum.krav.0: "nytt leieforhold inngås"
folgetjeneste.navn: "FØLGETJENESTE"
folgetjeneste.ytelse: "følge til avtaler utenfor hjemmet."
folgetjeneste.dawn: "[ingen avtale å følge til]."
folgetjeneste.krav.0: "avtale foreligger"
forvaltning.navn: "FRIVILLIG FORVALTNING"
forvaltning.ytelse: "kommunen betaler faste utgifter direkte fra trygden."
forvaltning.dawn: "trekk til husleie er opprettet. [utleier bekreftet]."
forvaltning.krav.0: "dokumentert betalingssvikt ×2"
forvaltning.krav.1: "samtykke fra bruker"
hjemmehjelp.navn: "PRAKTISK BISTAND"
hjemmehjelp.ytelse: "rengjøring og handling, 1×/uke."
hjemmehjelp.dawn: "hjemmehjelp satt opp. [første besøk onsdag]."
hjemmehjelp.krav.0: "kartlagt funksjonstap"
hverdagsrehab.navn: "HVERDAGSREHABILITERING"
hverdagsrehab.ytelse: "tverrfaglig trening i egen bolig, 4 uker."
hverdagsrehab.dawn: "oppstart planlagt. [teamet tar kontakt]."
hverdagsrehab.krav.0: "kartlagt funksjonstap"
hverdagsrehab.krav.1: "mål formulert med bruker"
innkjop.navn: "INNKJØPSORDNING"
innkjop.ytelse: "varer handles og leveres, 1×/uke."
innkjop.dawn: "ordning satt opp. [leveres fredager]."
innkjop.krav.0: "kan ikke handle selv - dokumentert"
kartlegging.navn: "FUNKSJONSKARTLEGGING"
kartlegging.ytelse: "strukturert kartleggingsbesøk i hjemmet."
kartlegging.dawn: "KARTLEGG FUNKSJON lagt til Franks handlinger."
kbolig.navn: "KOMMUNAL BOLIG"
kbolig.ytelse: "tildeling av kommunal utleiebolig."
kbolig.dawn: "[søknad avvist - bor i egen leilighet]."
kbolig.krav.0: "dokumentert tap av bolig"
maltidsvenn.navn: "MÅLTIDSVENN"
maltidsvenn.ytelse: "frivillig spiser middag MED bruker, 2×/uke."
maltidsvenn.dawn: "[måltidsvenn] tildelt. første besøk i morgen - Frank kan følge."
maltidsvenn.krav.0: "ernæringsrisiko"
maltidsvenn.krav.1: "mat tilgjengelig, men inntak svikter"
matlevering.navn: "MATLEVERING"
matlevering.ytelse: "middag levert på døra 3×/uke."
matlevering.dawn: "ny kasse levert. [den står urørt]."
matlevering.krav.0: "dokumentert ernæringsrisiko"
matlevering.krav.1: "kan ikke tilberede selv"
mekling.navn: "UTLEIER-MEKLING"
mekling.ytelse: "kommunen kontakter utleier; betalingsplan avtales."
mekling.dawn: "sak opprettet. RING UTLEIER lagt til Franks handlinger."
mekling.krav.0: "purring/varsel foreligger"
oppfolging.navn: "OPPFØLGINGSVEDTAK"
oppfolging.ytelse: "formalisert oppfølging: Frank får to timer ekstra per dag i saken."
oppfolging.dawn: "oppfølging formalisert. Frank: +2 timer per dag."
oppfolging.krav.0: "aktiv sak"
parorende.navn: "PÅRØRENDESTØTTE"
parorende.ytelse: "avlastning og veiledning til pårørende i omsorgsrolle."
parorende.dawn: "-"
parorende.krav.0: "pårørende i aktiv omsorgsrolle"
radgivning.navn: "ØKONOMISK RÅDGIVNING"
radgivning.ytelse: "time hos gjeldsrådgiver - på kontoret."
radgivning.dawn: "time satt opp. [ingen møtte]."
radgivning.krav.0: "bruker møter selv"
samtaler.navn: "STØTTESAMTALER"
samtaler.ytelse: "fast samtalekontakt, 1×/uke."
samtaler.dawn: "samtalekontakt tildelt. [første forsøk torsdag]."
samtaler.krav.0: "bruker samtykker"
samtaler.krav.1: "bruker møter / tar imot"
startlan.navn: "STARTLÅN"
startlan.ytelse: "lån til kjøp av egen bolig."
startlan.dawn: "[avslag - vilkår ikke oppfylt]."
startlan.krav.0: "betjeningsevne dokumentert"
stottekontakt.navn: "STØTTEKONTAKT"
stottekontakt.ytelse: "fast person; aktivitet 3t/uke."
stottekontakt.dawn: "støttekontakt søkes. [ventetid 2 uker]."
stottekontakt.krav.0: "kartlagt isolasjon"
stottekontakt.krav.1: "samtykke fra bruker"
tilsyn.navn: "TILSYNSBESØK DAGLIG"
tilsyn.ytelse: "hjemmetjenesten innom hver dag."
tilsyn.dawn: "tilsyn iverksatt. [Elling låser ikke opp]."
tilsyn.krav.0: "akutt risiko dokumentert"
tt.navn: "TT-KORT"
tt.ytelse: "subsidiert transport, 8 turer/mnd."
tt.dawn: "kort utstedt. [ligger i posten - uåpnet?]"
tt.krav.0: "varig forflytningsvansker - dokumentert"

# Strings: frank_actions

Stub: yes
besok.navn: "BESØK ELLING"
folg_maltid.navn: "FØLG MÅLTIDSVENN"
kartlegg.navn: "KARTLEGG FUNKSJON"
ring.navn: "RING ELLING"
ring_utleier.navn: "RING UTLEIER"
telefontrening.navn: "TELEFONTRENING"
telefontrening.gate_note: "krever tillit ▮▮ - Frank må ha kommet innenfor døra først"

# Strings: handbok

Stub: yes
src_tillit: "TILLIT"
src_vedtak: "VEDTAK"
src_frank: "FRANK"
src_matlevering: "MATLEVERING"
tillit_band: "Elling ser nå på Frank som %s."
vedtak_stamped: "stemplet: %s - iverksettes i morgen. (vilkår %d/%d dokumentert)"
mission_samtykke: "HENT SAMTYKKE"
mission_kartlagt: "FÅ KARTLAGT FUNKSJON"
mission_telefon: "FÅ TELEFONKONTAKT"
mission_telefon_why: "oppfølging uten oppmøte"
reason_unknown_action: "ukjent handling"
reason_krever_tillit: "krever tillit"
reason_no_hours: "dagen strekker ikke til - [i morgen]"
ring_who_fallback: "noen"
ring_ok: "%s tok den. \"hallo?\" - kort. men noen tok den."
ring_fail: "ingen svar. telefonen ringte der inne."
ring_slip: "telefonen ligger framme - han lar den ringe"
ring_failforward: "\"da får vi ta telefontrening, da.\" - nytt oppdrag (fail-forward)"
utleier_ok: "utleier stiller med nøkkel. neste besøk går inn - uansett svar."
utleier_price: "en dør som åpnes utenfra har en pris."
entry_ok: "ingen åpning - men utleiers nøkkel gikk i låsen. Frank er innenfor."
entry_price: "døra åpnet UTENFRA. det glemmer han ikke. (tillit −%d)"
besok_fail: "ingen åpning. radioen sto på der inne."
besok_slip: "ingen svar på døra - hvem er hjemme, og tør de åpne?"
besok_ok_samtykke: "døra åpnet. [kaffe på kjøkkenet]. han skrev under - samtykke."
samtykke_boxes: "samtykke dokumentert → nye krav-bokser i håndboka"
besok_ok_no_samtykke: "døra åpnet. ikke lett å snakke med. ikke samtykke - ennå. (tillit +1)"
kartlegg_ok: "kartleggeren gjennomførte hele runden. skjema fylt."
kartlegg_boxes: "funksjonstap dokumentert → nye krav-bokser i håndboka"
kartlegg_fail: "kartlegging avbrutt - %d av %d. kartleggeren dro."
kartlegg_slip: "skjemaet ligger igjen halvfylt - nytt besøk dekker resten"
maltid_ok: "Frank ble med [måltidsvennen] inn. Elling dekket på til tre."
maltid_ok_samtykke: "over bordet skrev han under - samtykke."
maltid_fail: "måltidet ble avbrutt - %d av %d."
maltid_slip: "måltidsvennen kom, men måltidet glapp - prøv igjen"
trening_ok: "\"vi later som det ringer. ring, ring.\" - han tok røret. sa hallo."
trening_fail: "treningen avbrutt - %d av %d. røret ble lagt på."
trening_slip: "øvelsen stoppet halvveis - ny økt dekker resten"
visit_generic_ok: "besøket gjennomført."
visit_generic_fail: "besøket avbrutt - %d av %d."
dawn_hours_left: "%dt til overs - [papirarbeid på de ti andre]"
mat_ok: "kassen kom inn - det ble mat i dag."
mat_fail_prev: "ny kasse levert kl 11. den forrige står der fortsatt."
mat_blocked: "ingen ny levering - kassen fra sist står fortsatt ute."

// SB-072 migration (PLAN-009 Task 6): sibling handlers - frank_action_handlers,
// tiltak_dawn_handlers, report_composer, tiltak_visit_director step labels,
// case_engine/case_host strays. DD-004 duplicate kill rides the same step:
// raw frank-action navn literals resolve from frank_actions.<id>.navn.

# Strings: sim_text

Stub: yes
kartlegg_stopped: "han ble taus halvveis. skjemaet ligger igjen hos ham."
kartlegg_stopped_slip: "stoppet ved spørsmålet om [matlaging] - hvorfor akkurat der?"
kartlegg_no_answer: "ingen åpning for kartleggeren. skjemaet ble med tilbake."
kartlegg_no_answer_slip: "ingen svar på døra - kartleggeren kom aldri inn"
kartlegg_start: "kartleggeren er innenfor - Frank blir ved pulten."
maltid_no_answer: "ingen åpnet for [måltidsvennen]. kassen med middag gikk tilbake."
maltid_no_answer_slip: "ingen svar på døra - måltidsvennen kom aldri innenfor"
maltid_toomany: "Elling åpnet, så de to, og lukket igjen."
maltid_toomany_slip: "én gjest går kanskje - to var for mange"
maltid_start: "måltidsvennen er innenfor - Frank følger til kjøkkenet."
trening_start: "telefontreneren er innenfor - øvelsen starter ved telefonen."
visit_not_started: "besøket kom ikke i gang - %s."
reason_sim_unavailable: "sim utilgjengelig"
reason_visit_running: "et besøk pågår allerede"
reason_nobody_home: "ingen deltaker hjemme"
reason_unknown_visit: "ukjent besøkstype"
dawn_in_day: "iverksatt - løses i løpet av dagen."
dawn_mekling: "sak opprettet hos forliksrådet - RING UTLEIER lagt til Franks handlinger."
proposal_vet_ikke: "Vet ikke nok ennå. Vis meg flere funn først."
npc_maltidsvenn: "Måltidsvenn"
npc_kartlegger: "Kartlegger"
npc_telefontrener: "Telefontrener"

# Strings: dagsrapport

Stub: yes
sec_vedtak: "VEDTAK I VERK"
vedtak_row: "• %s - i verk siden dag %d. [ingen endring observert]"
vedtak_none: "• [ingen vedtak i verk]"
sec_klokker: "KLOKKER RYKKET"
clock_row: "• %s: %d → %d"
sec_kanaler: "KANALER"
channel_row: "• %s - kl %s"
sec_observert: "OBSERVERT"
observert_none: "• [intet å melde]"
observert_row: "• %s"
doc_title: "DAGSRAPPORT - DAG %d"
doc_peek: "[kontorets samlerapport for dag %d]"
doc_meta: "KONTORET - morgenen dag %d"

# Strings: tiltak_visits

Stub: yes
kartlegging.spesialist_inn: "kartleggeren kommer inn"
kartlegging.samtale: "innledende samtale"
kartlegging.spesialist_kjokken: "kartleggeren følger til kjøkkenet"
kartlegging.adl_skjema: "ADL-skjema del 1"
kartlegging.kjokken_runde: "funksjon på kjøkkenet"
kartlegging.spesialist_oppsummering: "kartleggeren finner fram skjemaet"
kartlegging.oppsummering: "oppsummering og signatur"
maltidsvenn.dekke_bord: "måltidsvennen dekker på"
maltidsvenn.felles_maltid: "felles måltid"
telefontrening.trener_inn: "treneren kommer inn"
telefontrening.instruksjon: "instruksjon ved telefonen"
telefontrening.ovelsesring: "øvelsesring - ring, ring"
telefontrening.svar_ovelse: "ta røret og si hallo"
