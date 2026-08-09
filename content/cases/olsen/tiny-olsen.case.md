# Case: case_olsen_tiny

Title: Olsen — full case slice
Stage: 0
Deadline: day 10
Pair soft reject: «De to? Jeg ser ikke tråden mellom dem. Ennå.»
Pair already set: «Det spørsmålet har vi allerede stående.»

# Document: doc_bekymring

Kind: BEKYMRINGSMELDING · Register: klinisk
Title: Bekymringsmelding
Peek: Bekymringsmelding Dr. J. Haug
Meta: LEGESENTERET DR. J. HAUG, 11.02.1999

Under behandling av pasient Grete Olsen (f. 1927) for en [sykdom med kort forventet forløp](fact:f_grete_syk) kommer det frem at hun er [primær omsorgsperson](fact:f_saarbar) for sin sønn Elling Olsen (f. 14.03.1964). [Omfanget er ikke kartlagt](fact:f_grete_baerer), men han kan ha behov for støtte ved mors bortfall. 

Med hilsen
Jørgen Haug
spes. allmennmedisin

## f_grete_syk

Label: Grete er alvorlig syk
Summary: Grete er alvorlig syk. Forventet forløp er kort.
Domain: Helse/risiko · Category: Dokument
Supports: q_grete_dor
Frank: ««Kort forventet forløp», og ikke noe mer. Så vagt skriver man bare når man vil. Haug må si det høyt før vi planlegger noe.»

## f_grete_baerer
Label: Grete bærer rutiner
Summary: Grete bistår med gjøremål, økonomi og kontakt med tjenester.
Domain: Hverdag/rutine · Category: Dokument
Supports: q_grete_dor, q_okonomi
Frank: ««Omfanget er ikke kartlagt». Hun gjør alt, og ingen vet hvor mye alt er. Det tallet finnes ikke før noen står i leiligheten og teller.»

## f_saarbar

Label: Sårbar ved bortfall
Summary: Elling vurderes som sårbar ved bortfall av pårørende.
Domain: Helse/risiko · Category: Risiko
Supports: q_grete_dor
Frank: «Det er en leges inntrykk, ikke en kartlegging. Vi fatter ikke vedtak på inntrykk. Men det holder til å dra på hjemmebesøk, og det er sånn en bekymringsmelding er ment å virke.»

# Document: doc_konto

Kind: ØKONOMISK OVERSIKT · Register: notat
Title: Frank · husholdets økonomi
Peek: «Regnestykket går opp — med henne.»
Meta: ØKONOMISK OVERSIKT · 4012 F. ÅSLI · GJENNOMGÅTT MED G. OLSEN VED KJØKKENBORDET

Grete fant frem alt. Postgiroene ligger i en skoeske, ferdig utfylt, sortert på forfall.

Inn: [trygden hans — 2 [icon=coin] i måneden. Den kommer den første, og den går rett videre.](fact:f_trygd) Pensjonen hennes: 3 [icon=coin].

Ut: [husleien — 3 [icon=coin]. Den betales kontant til huseieren, av Grete, den første.](fact:f_husleie) Strøm, mat og resten: 2 [icon=coin] til sammen.

[Alle betalinger går gjennom Grete. Alle avtaler står i hennes navn.](fact:f_alt_via_grete) Jeg spurte om Elling visste hvor skoesken sto. Hun lo, kort.

Jeg gikk gjennom kvitteringene. [Jeg fant ikke ett kjøp som var hans. Ikke ett.](fact:f_ingen_matkjop)

[Regnestykket går opp — med henne. Uten henne mangler det 2 [icon=coin]. Hver måned.](fact:f_gap)

## f_trygd

Label: Ellings uføretrygd
Summary: Ellings uføretrygd: 2 [icon=coin] i måneden.
Domain: Økonomi/bolig · Category: Økonomi
Supports: q_okonomi, q_bolig

## f_alt_via_grete

Label: Alt går via Grete
Summary: Hele trygden går rett inn i Gretes system. Alle avtaler står i hennes navn.
Domain: Økonomi/bolig · Category: Økonomi
Supports: q_okonomi

## f_husleie

Label: Husleie betales av Grete
Summary: Husleien er 3 [icon=coin] og betales av Grete.
Domain: Økonomi/bolig · Category: Økonomi
Supports: q_okonomi, q_bolig

## f_gap

Label: 2 [icon=coin] mangler
Summary: Uten Gretes pensjon mangler husholdet 2 [icon=coin] hver måned.
Domain: Økonomi/bolig · Category: Økonomi
Supports: q_okonomi, q_bolig

## f_ingen_matkjop

Label: Ingen egne matkjøp
Summary: Elling har aldri betalt for mat selv. Mat skjer gjennom Grete.
Domain: Hverdag/rutine · Category: Økonomi
Supports: q_grete_dor

# Document: doc_papirer

Kind: ØKONOMISK OVERSIKT · Register: notat
Title: Frank · papirene i leiligheten
Peek: Skoesken sto der hun forlot den.
Meta: PAPIRGJENNOMGANG · 4012 F. ÅSLI · ETTER DØDSFALLET · MED ELLING I ROMMET

Skoesken sto der hun forlot den. Postgiroene ferdig utfylt, sortert på forfall. Den øverste gjelder mars. Den er ikke levert.

Inn: [trygden hans — 2 [icon=coin] i måneden.](fact:f_trygd) Pensjonen hennes er opphørt.

Ut: [husleien — 3 [icon=coin]. Den ble betalt kontant til huseieren, av Grete, den første.](fact:f_husleie)

[Alle avtaler står i Gretes navn.](fact:f_alt_via_grete) [Ikke ett kjøp i kvitteringene er hans.](fact:f_ingen_matkjop)

[Regnestykket gikk opp — med henne. Nå mangler det 2 [icon=coin]. Hver måned.](fact:f_gap)

Elling satt ved bordet mens jeg gikk gjennom esken. Han rettet på bunkene da jeg la dem fra meg. Han visste rekkefølgen.

# Document: doc_huseier

Kind: BREV · Register: formell
Title: Brev fra huseieren · T. Bakkerud
Peek: «Jeg hører at din mor er gått bort.»
Meta: T. BAKKERUD · HÅNDSKREVET · LEVERT I POSTKASSEN · VIDEREFORMIDLET AV 4012

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
Title: Frank · telefonsamtale med Grete
Peek: «Hun tok den på andre forsøk.»
Meta: FELTNOTAT · 4012 F. ÅSLI · TLF. G. OLSEN

Ringte Grete 11:40. Hun tok den på andre forsøk.

Hun visste hvorfor jeg ringte. Haug hadde sagt fra. Hun var ikke sint, men hun var klar: [«Han klarer seg. Han har alltid klart seg.» Hun sa det to ganger.](fact:f_klarer_seg) Andre gangen lavere.

[Jeg spurte hvem som overtar hvis hun skulle bli innlagt. Det ble stille. Hun svarte ikke på det.](fact:f_ingen_plan)

[Jeg ba om å få hilse på Elling i telefonen. Hun sa han ikke tar telefonen. «Det er ikke noe galt med ham. Han liker bare ikke apparatet.»](fact:f_elling_tlf)

Mot slutten [spurte hun om dette betydde at noen kom til å ta ham fra leiligheten](fact:f_grete_redd). Jeg sa nei. Jeg håper det var sant.

Hun gikk med på hjemmebesøk. «Hvis det må til.» Det må til.

## f_klarer_seg

Label: «Han klarer seg»
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
Summary: Grete frykter at kommunen vil ta leiligheten — eller Elling.
Domain: Nettverk/sosialt · Category: Samtale
Supports: q_bolig

# Document: doc_frank_visit

Kind: RAPPORT · Register: notat
Title: Frank · hjemmebesøk Gabels gate 14
Peek: «Hun hadde dekket på med tre kopper.»
Meta: HJEMMEBESØK · 4012 F. ÅSLI

Grete åpnet før jeg fikk ringt på. Hun hadde dekket på med tre kopper. Elling brukte ikke sin.

I gangen: [en bunke uåpnet post på skoskapet. Øverst: Trygdekontoret, sosialkontoret, Oslo Energi.](fact:f_post) Grete flyttet bunken da hun så at jeg så.

Elling satt i stuen med [en bok om polarekspedisjoner. Han noterte i margen. Systematisk, små bokstaver.](fact:f_bok) Jeg spurte om Nansen. Han svarte med tre presise setninger. Til veggen, ikke til meg.

Over skrivebordet hans: [avisutklipp, sirlig montert. Gro, landsmøter, 1. mai-tog. Årstall i hjørnene, hans håndskrift.](fact:f_utklipp) Det er ikke rot. Det er et arkiv.

[Han forlot ikke rommet, men flyttet seg slik at det alltid var et møbel mellom oss.](fact:f_avstand) Ikke demonstrativt. Bare slik det ble.

Grete fulgte meg ut. I trappen sa hun: [«Du så hvordan han er. Han er en smart gutt.»](fact:f_smart_gutt) Hun er 72. Han er 35. Gutt.

## f_post

Label: Uåpnet post
Summary: Uåpnet post samler seg. Grete håndterer den — og skjuler den.
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
Summary: Elling kastet ikke Frank ut, og svarte da Frank spurte om noe han kunne. Kontakt er mulig — forsiktig.
Domain: Nettverk/sosialt · Category: Samtale
Supports: q_baering
Quote: «han kastet meg ikke ut, og han svarte da jeg spurte om noe han kunne. Det er en dør på gløtt.»

## f_smart_gutt
Label: En smart gutt
Summary: Grete omtaler Elling (35) som «gutt». Rollene er fastlåst.
Domain: Nettverk/sosialt · Category: Samtale
Supports: q_grete_dor, q_evner

# Document: doc_innleggelse

Kind: MELDING · Register: klinisk
Title: OUS Ullevål · innleggelse
Peek: «…ber om at kommunen ser til ham.»
Meta: ULLEVÅL SYKEHUS · TIL SOSIALKONTORET · 14.02.1999

MELDING OM INNLEGGELSE

Grete Olsen (f. 1927) ble [innlagt akutt 14.02](fact:f_innlagt), kl. 06:50. Tilstanden er alvorlig, men avklart. Pårørende: sønn, Elling Olsen.

[Pasienten oppgir at sønnen ikke er varslet. Hun ber om at kommunen ser til ham.](fact:f_elling_uvarslet) Hun var tydelig på dette før hun ble lagt i behandling.

SOSIALMEDISINSK ENHET · OUS

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
Title: OUS Ullevål · dødsfall
Peek: —
Meta: ULLEVÅL SYKEHUS · TIL SOSIALKONTORET · 15.02.1999

MELDING OM DØDSFALL

Grete Olsen, f. 21.09.1927. [Dødsfall konstatert 15.02 kl. 04:12.](fact:f_dod)

Avdødes sønn er eneste nærmeste pårørende. Varsling ble forsøkt per telefon uten svar. Politiet bisto ved varsling på bopel. Sønnen åpnet ikke døren. [Beskjeden ble gitt gjennom brevsprekken.](fact:f_brevsprekken)

Saken overføres kommunen for videre oppfølging av gjenlevende.

SOSIALMEDISINSK ENHET · OUS

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
Title: Frank · status dag 8
Peek: En uke siden meldingen.
Meta: STATUSRAPPORT · 4012 F. ÅSLI · DAG 8

Det foreligger ikke iverksatte tiltak som dekker bolig eller hverdag.

Restanse bygges. Posten vokser. Døren er lukket. Kommunen vet nå svært mye om Elling Olsen, og når ham ikke.

Bekymringsmeldingen var berettiget. Det er den fortsatt.

# Question: q_grete_dor

Title: Den dagen Grete ikke kommer hjem — hva stopper?
Teaser: Det er noe her om hva som faktisk stopper den dagen Grete ikke er der. Jeg har ikke ord på det ennå.
when: f_grete_syk and f_klarer_seg
Lead: «Ring Grete» -> call:grete

# Question: q_evner

Title: Hva klarer Elling selv — når ingen har gjort det for ham først?
Teaser: Jeg tror vi vet mindre om hva Elling klarer enn vi tror. Det ligger noe her.
when: f_bok and f_utklipp
Lead: «Åpne ett brev sammen med Frank» -> t_brev

# Question: q_okonomi

Title: Regnestykket Olsen: hva kommer inn, hva går ut — og gjennom hvem?
Teaser: Tallene går opp — men jeg klarer ikke helt å se gjennom hvem. Verdt å se på.
when: f_grete_baerer and f_trygd and f_husleie
Lead: «Be om økonomisk oversikt» -> d_konto
Lead: «Snakk med huseieren» -> t_huseier

# Question: q_bolig

Title: Kan Elling bli boende — når husleien har stoppet?
Teaser: Det er noe med leiligheten som ikke tåler mange spørsmål. Ta en titt når du kan.
when: f_gap and f_leie_stoppet and f_husleie
Lead: «Snakk med huseieren» -> t_huseier

# Question: q_baering

Title: Noe av det Grete gjorde må noen andre gjøre. Hvor lite kan kommunen slippe unna med — og hvor mye tåler han?
Teaser:
when: f_elling_tlf and f_avstand

# Question: q_vekst

Title: Hva kan læres — og i hvilket tempo, uten å knekke noe?
Teaser: Jeg så noe hos ham som kan bygges på. Usikker på tempoet. Vi bør snakke om det.
Card title: Hva kan læres?
when: f_bok and f_utklipp

# Question: q_kollaps
Title: Hva kollapser først nå?
Teaser: Noe her har begynt å rakne. Jeg vet ikke hva som går først.
when: f_dod
Card title:

# Question: q_liv

Title: Ikke bare berget — levd. Hva skulle til for at Elling har et liv han vil ha?
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
Summary: Det finnes ikke observasjon av Elling uten Grete. Uvitenheten er selve funnet — og den må lukkes før noe annet.
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

Title: Han forstår — men unngår. Posten ligger uåpnet, ikke ulest.
Summary: Kapasiteten til å forstå er observert. Papiret når likevel aldri frem, fordi konvolutten aldri åpnes. Problemet er kanal, ikke forståelse.
Question: q_evner
needs: f_post and f_bok
Opens: t_dokgjennomgang

# Hypothesis: h_ev_ukjent

Title: Vet ikke. Ingen har prøvd. Det er selve funnet.
Summary: Kommunen har ingen observasjon av hva Elling klarer alene. Første tiltak må være å finne det ut — forsiktig.
Question: q_evner
Needs:
Opens: t_brev, t_regning

# Hypothesis: h_ok_kjede

Title: Betalingskjeden er én person. Kjeden, ikke beløpene, er risikoen.
Summary: Husleie og faste betalinger fungerer gjennom Gretes system — skoesken, postgiroene, kontantene den første. Systemet har én operatør.
Question: q_okonomi
needs: f_husleie and f_alt_via_grete
Opens: t_forvaltning, d_konto

# Hypothesis: h_ok_gap

Title: Trygden dekker ikke boligen. 2 [icon=coin] mangler hver måned.
Summary: Ellings trygd er 2 [icon=coin]. Boligen koster 3 [icon=coin]. Differansen bæres i dag av Gretes pensjon. Bortfall gir umiddelbar restanserisiko.
Question: q_okonomi
needs: f_gap
Opens: t_bostotte, t_huseier, d_konto, c_frank_okonomi [type=conversation category=frank actor=frank risk=okonomi sim=case.olsen.opening.conversation.frank_okonomi]

# Hypothesis: h_b_sikres

Title: Boligen kan sikres — med bostøtte og ordnet betalingskjede.
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

Title: Uavklart — økonomien må kartlegges først.
Summary: Å velge bolig-retning uten regnestykket er gjetning. Kartlegg først.
Question: q_bolig
Needs:
Opens: d_konto

# Hypothesis: h_ba_kanal

Title: Først en kanal. Fast person, fast tid, oppmøte — telefonen er stengt.
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

Title: Alt. Fullt omsorgsansvar — institusjon eller omsorgsbolig.
Summary: Sårbarheten vurderes som for stor for hjemmeboende støtte. Tyngste ende av skalaen — og den kan alltid utløses.
Question: q_baering
needs: f_saarbar
Opens: t_institusjon

# Hypothesis: h_ve_rutine

Title: Én rutine om gangen. Konsentrasjonen er der; tempoet må være hans.
Summary: Kapasitet til fordypning og system er observert. Avgrensede rutiner kan bygges med støtte — lavt tempo, fast person, hans eget arkivspråk.
Question: q_vekst
needs: f_bok
Opens: t_brev, t_regning

# Hypothesis: h_ve_formell

Title: Ferdighetene er der ikke. Støtte må bære — læring er ikke planen nå.
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
Summary: Gro-arkivet og systematikken er en identitet det går an å delta gjennom — i hans tempo.
Question: q_liv
needs: f_utklipp and f_bok
Opens:

# Hypothesis: h_liv_trygghet

Title: Trygghet først. Verden i hans tempo, med møbel imellom — og det er greit.
Summary: Avstanden er ikke et problem som skal fikses, men et premiss tjenestene må respektere.
Question: q_liv
needs: f_avstand

# Hypothesis: h_liv_sporre

Title: Det vet bare Elling. Noen må spørre ham — og noen må kunne få svar.
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
Description: Bakkerud vil vite hvem han skal forholde seg til. La det bli Frank — ikke torsdagsbesøket.
Sim hook: case.olsen.tiltak.garanti

# Tiltak: t_hjemmehjelp

Title: Hjemmehjelp 2× uke — Frank
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
Activity: «BE OM BANKUTSKRIFT»
Channel: scheduled · Delay: 480m · Duration: 1h · Occupies: 3h
Reception: +1
gate: f_gap
~ deliver pending_konto_overfort in 1d on ck_overfort

# Dispatch: hjemmebesok

Title: Hjemmebesøk
Sim hook: case.olsen.dispatch.hjemmebesok
Description: Frank drar på uanmeldt besøk til leiligheten.
Activity: «HJEMMEBESØK»
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

Håndskrevet brev · T. Bakkerud
~ deliver doc_huseier in 0d on ck_grete

# Beat: day 8 [id=beat_grete_d8]

En uke siden meldingen.
~ deliver doc_status in 0d on ck_grete

# Conversation: chat:frank

* f_post: Posten i gangen — likegyldighet?
    Nei. Han vet nøyaktig hva som ligger der. Han la merke til at jeg så på bunken, og han ble urolig av det.
    Det er ikke likegyldighet. Det er noe som ligner mer på frykt for hva papiret krever av svar.
    * * Frykt for hva, helt konkret?
        For hva svaret koster. Hvert brev er en beskjed om at noen venter på noe han ikke får til.
        Jeg tror han sluttet å åpne den dagen han sluttet å kunne svare. De to tingene henger sammen.
    * * Hva gjør vi med bunken?
        Ikke ta den fra ham. Da tar du det siste han har kontroll på.
        Åpne ett brev. Sammen. Det ufarligste først — strømregningen, ikke sosialkontoret. La ham se at et åpnet brev ikke eksploderer.

* f_smart_gutt: «En smart gutt» — hva la du i det? [id=c_smart]
    Hun sa det i trappen, lavt, som om det var en hemmelighet. Hun har båret ham så lenge at jeg tror hun ikke lenger vet hva som er ham og hva som er henne.
    Det er det vi egentlig skal kartlegge.
    * * Kartlegge — hva da, egentlig?
        Hvor Grete slutter og Elling begynner.
        Alt hun gjør ligner omsorg. Noe av det er det. Resten er femti år med vane som ingen har turt å forstyrre.

* f_klarer_seg: Tror du på «han klarer seg»? [id=c_klarer]
    Folk sier det på to måter. Som en vurdering, eller som et håp. Hun sa det to ganger. Andre gangen var det et håp.

* f_bok: Boken og notatene — hva sier det deg?
    Tre setninger om Nansen, presise, til veggen. Det er ikke en som mangler evner. Det er en som mangler trening i å ha noen i rommet.
    Det er to forskjellige problemer. Og de har to forskjellige løsninger.
    * * To løsninger — hvilke?
        Evnene trenger ingenting av oss. De er der. Rommet trenger trening.
        Én person. Samme person, samme tid, hver uke — til det slutter å være farlig å ha noen der. Alt annet er støy.
    * * Kan han bo alene, mener du?
        Feil spørsmål. Han har aldri fått prøvd.
        Ingen har noen gang sett ham gjøre noe alene. Ikke fordi han ikke kan — fordi ingen har sluppet ham til. Vi vet ikke hva han klarer. Det burde uroe deg mer enn posten.
        Tanke: «VURDERING — «Vet ikke» er ikke et hull i saken. Det ER saken.»

* f_avstand: Møbelet mellom dere — hvor lang vei er det inn?
    ~ pay f_dor_glott
    Lang. Men han kastet meg ikke ut, og han svarte da jeg spurte om noe han kunne.
    Det er en dør på gløtt. Den lukkes hvis vi river i den.
    * * Hva var det som åpnet den?
        At jeg spurte om noe han kunne svare på. Ikke omsorg. Kunnskap.
        Det er kanalen inn: la ham være den som vet. Alle andre i livet hans har vært den som ordner.
    * * Og hvis vi river i den?
        Da lukkes den. Og jeg tror ikke den åpner for den neste som ringer på.
        Vi har én sjanse til å være de som ikke rev.

* f_utklipp: Utklippene av Gro — hva gjør vi med det? [id=c_gro]
    Jeg spurte om valget i -97. Han snakket i fire minutter uten pause — årstall, navn, partilandsmøter. Ikke til meg. Men det var nesten.
    Det arkivet er det mest levende i den leiligheten. Hvis vi noen gang skal bygge noe med ham, begynner det der.
    * * Begynne der — hvordan, konkret?
        Spør ham om ting han vet. Politikk, årstall, fakta. Aldri om følelser, aldri om Grete.
        Han snakker når han er den som kan noe og du er den som spør. Snu rollene, og døren er igjen.

* f_brevsprekken: Brevsprekken. Hørte han det, tror du? [id=c_brevsprekk]
    Han sto rett innenfor. Politiet hørte ham puste. Han hørte hvert ord, og han klarte ikke å åpne. Det er det vi jobber med nå. Ikke sorgen. Døren.

* f_dor_glott: Døren på gløtt — hva holder den åpen? [answer=none]
    At noen spør ham om noe han kan svare på. Det er hele mekanikken.
    Den tåler ikke omsorg ennå. Den tåler spørsmål.

# Proposal: matlevering

Relevant: f_ingen_matkjop, f_dor_glott
Line: «Matlevering, kanskje. Ingen matkjøp står i hans navn — middag på døra tre dager i uken kan overta. Forutsetter at døren er en kanal.»

# Proposal: hjemmehjelp

Relevant: f_avstand, f_elling_tlf, f_dor_glott
Line: «Praktisk bistand. Én fast person, én fast tid — det er den eneste kanalen inn som har virket hittil.»

# Proposal: bostotte

Relevant: f_gap, f_trygd, f_husleie
Categories: Økonomi
Line: «Søk bostøtte. Trygden dekker ikke husleien — tilskuddet kan tette gapet. Papirarbeid, men det haster.»

# Proposal: forvaltning

Relevant: f_alt_via_grete, f_husleie, f_gap
Line: «Frivillig forvaltning, kanskje. Skoesken trenger en ny operatør — kommunen kan betale de faste utgiftene direkte. Trygt. Bygger ingenting.»

# Proposal: mekling

Relevant: f_huseier_kommer, f_leie_stoppet, f_leie_privat
Line: «Utleier-mekling. Bakkerud vil vite hvem han skal forholde seg til — en betalingsplan kan roe det før torsdagsbesøket.»

# Proposal: boopp

Relevant: f_leie_stoppet, f_post
Line: «Booppfølging, muligens. En miljøarbeider ukentlig kan holde boligdriften samlet — hvis han tåler en ny person i rommet.»

# Proposal: radgivning

Relevant: f_gap, f_post
Categories: Økonomi
Line: «Økonomisk rådgivning. Time hos gjeldsrådgiver — på kontoret. Jeg er usikker på om han kommer seg dit.»

# Proposal: innkjop

Relevant: f_ingen_matkjop, f_alt_via_grete
Line: «Innkjøpsordning. Ingen har handlet for ham siden Grete — varer levert én gang i uken er det minste som kan virke.»

# Proposal: maltidsvenn

Relevant: f_avstand, f_ingen_matkjop
Line: «Måltidsvenn, forsiktig. Noen som spiser middag MED ham — men det er en fremmed ved bordet. Usikker.»

# Proposal: kartlegging

Relevant: f_ingen_plan
Line: «Funksjonskartlegging. Ingen har noen gang sett Elling alene — et strukturert besøk kan lukke det hullet.»

# Proposal: oppfolging

Relevant: f_ingen_plan
Line: «Oppfølgingsvedtak, kanskje. To timer ekstra per dag i saken — hvis dette skal bæres, må noen få tid til å bære.»

# Proposal: samtaler

Relevant: f_brevsprekken, f_avstand
Line: «Støttesamtaler, på sikt. Fast samtalekontakt én gang i uken — men kanalen inn må finnes først.»

# Proposal: stottekontakt

Relevant: f_utklipp, f_bok
Line: «Støttekontakt. Tre timer i uken rundt det han allerede bryr seg om — arkivet er et sted å begynne.»

# Proposal: tilsyn

Relevant: f_saarbar, f_brevsprekken
Line: «Tilsynsbesøk daglig. Hjemmetjenesten innom hver dag — det er mye trykk på en lukket dør. Tyngre enn jeg liker.»

# Proposal: besoksvenn

Relevant: f_avstand
Line: «Besøksvenn, kanskje. Frivillig én gang i uken — mildere enn tjenester, men fortsatt en fremmed i stuen.»

# Proposal: dagsenter

Relevant: f_avstand
Line: «Dagsenter er langt unna der han er nå. To dager i uken ute blant folk — jeg tror ikke han går dit ennå.»

# Proposal: folgetjeneste

Relevant: f_elling_tlf
Line: «Følgetjeneste. Følge til avtaler utenfor hjemmet — hvis det noen gang blir avtaler.»

# Proposal: hverdagsrehab

Relevant: f_bok, f_avstand
Line: «Hverdagsrehabilitering, muligens. Fire uker trening i egen bolig — men et tverrfaglig lag i leiligheten er mye på én gang.»

# Proposal: parorende

Relevant: f_grete_baerer, f_grete_syk
Line: «Pårørendestøtte. Grete bar alt — avlastning og veiledning kunne lettet henne mens hun ennå bærer.»

# Proposal: tt

Relevant: f_avstand
Line: «TT-kort. Subsidiert transport, åtte turer i måneden — men han har ingen steder han skal ennå.»

# Proposal: alarm

Relevant: f_saarbar
Line: «Trygghetsalarm, tja. Utrykning ved fall — jeg er usikker på om det treffer det som er skjørt her.»

# Proposal: kbolig

Relevant: f_leie_stoppet, f_gap
Line: «Kommunal bolig, hvis leiligheten ikke kan holdes. Men å flytte ham er å flytte alt han er.»

# Proposal: startlan

Relevant: f_trygd, f_gap
Line: «Startlån. Lån til kjøp av egen bolig — det er langt fra der denne saken står.»

# Recipe: f_bok + f_utklipp

~ open q_vekst
Frank: «Boken og utklippene. Ja. Jeg har tenkt på dem sammen, men jeg fikk det ikke sagt.»
Frank: «Han holder krevende stoff i hodet og noterer systematisk. Og han klipper ut, daterer og ordner. Begge deler er hans egne.»
Frank: «Så spørsmålet er ikke om han kan lære. Det er hva som kan læres — og i hvilket tempo, uten å knekke noe.»

# Recipe: f_grete_syk + f_klarer_seg

~ open q_grete_dor
Frank: «Haug skriver kort forventet forløp. Grete sier han klarer seg. Begge kan ikke ha rett.»
Frank: «Hun har båret alt så lenge at hun ikke ser det selv. Den dagen hun ikke kommer hjem, stopper noe — og vi vet ikke hva.»
Frank: «Jeg tror ikke vi finner det med spørsmål. Jeg tror vi finner det ved å være der.»

# Conversation: call:grete

gate: f_grete_baerer
Soft reject: «… Jeg vet ikke hva du mener med det.»

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
