import type {
  BlueprintDispatch,
  BlueprintDocument,
  BlueprintFact,
  BlueprintQuestion,
  BlueprintTiltak,
} from '../../../domain/blueprint';

export const tinyOlsenDocuments = {
  doc_bekymring: {
    id: 'doc_bekymring',
    kind: 'BEKYMRINGSMELDING',
    title: 'Legesenteret · Dr. J. Haug',
    register: 'klinisk',
    peek: '«…anbefaler kommunal kartlegging av funksjon, hjelpebehov og overgangstiltak.»',
    meta: 'LEGESENTERET · DR. J. HAUG · 11.02.1999',
    blocks: [
      {
        id: 'doc_bekymring_body',
        runs: [
          {
            text: 'GJELDER Olsen, Elling · f. 14.03.1964 Undertegnede er fastlege for Grete Olsen (f. 1927) og hennes sønn Elling Olsen. Mor er under utredning og behandling for ',
          },
          {
            text: 'sykdom med kort forventet forløp',
            factId: 'f_grete_syk',
          },
          {
            text: '. Hun er informert om at denne meldingen sendes. Mor og sønn bor sammen i en treroms blokkleilighet, fjerde etasje. ',
          },
          {
            text: 'Sønnen har aldri bodd alene',
            factId: 'f_aldri_alene',
          },
          {
            text: '. Han er uføretrygdet og er etter det undertegnede kjenner til ',
          },
          {
            text: 'ikke i kontakt med øvrige tjenester',
            factId: 'f_ingen_tjenester',
          },
          {
            text: '. ',
          },
          {
            text: 'Mor opplyser at hun bistår med praktiske gjøremål, økonomisk oversikt og kontakt med tjenester',
            factId: 'f_grete_baerer',
          },
          {
            text: '. Omfanget er ikke kartlagt. ',
          },
          {
            text: 'Pasienten fremstår sårbar ved bortfall av pårørende',
            factId: 'f_saarbar',
          },
          {
            text: '. Anbefaler kommunal kartlegging av funksjon, hjelpebehov og overgangstiltak. Med hilsen Jørgen Haug spes. allmennmedisin',
          },
        ],
      },
    ],
  },
  doc_konto: {
    id: 'doc_konto',
    kind: 'ØKONOMISK OVERSIKT',
    title: 'Frank · husholdets økonomi',
    register: 'notat',
    peek: '«Regnestykket går opp — med henne.»',
    meta: 'ØKONOMISK OVERSIKT · 4012 F. SOLBERG · GJENNOMGÅTT MED G. OLSEN VED KJØKKENBORDET',
    blocks: [
      {
        id: 'doc_konto_body',
        runs: [
          {
            text: 'Grete fant frem alt. Postgiroene ligger i en skoeske, ferdig utfylt, sortert på forfall. Inn: ',
          },
          {
            text: 'trygden hans — to mynter i måneden. Den kommer den første, og den går rett videre.',
            factId: 'f_trygd',
          },
          {
            text: ' Pensjonen hennes: tre mynter. Ut: ',
          },
          {
            text: 'husleien — tre mynter. Den betales kontant til huseieren, av Grete, den første.',
            factId: 'f_husleie',
          },
          {
            text: ' Strøm, mat og resten: to mynter til sammen. ',
          },
          {
            text: 'Alle betalinger går gjennom Grete. Alle avtaler står i hennes navn.',
            factId: 'f_alt_via_grete',
          },
          {
            text: ' Jeg spurte om Elling visste hvor skoesken sto. Hun lo, kort. Jeg gikk gjennom kvitteringene. ',
          },
          {
            text: 'Jeg fant ikke ett kjøp som var hans. Ikke ett.',
            factId: 'f_ingen_matkjop',
          },
          {
            text: ' ',
          },
          {
            text: 'Regnestykket går opp — med henne. Uten henne mangler det to mynter. Hver måned.',
            factId: 'f_gap',
          },
        ],
      },
    ],
  },
  doc_papirer: {
    id: 'doc_papirer',
    kind: 'ØKONOMISK OVERSIKT',
    title: 'Frank · papirene i leiligheten',
    register: 'notat',
    peek: '«Skoesken sto der hun forlot den.»',
    meta: 'PAPIRGJENNOMGANG · 4012 F. SOLBERG · ETTER DØDSFALLET · MED ELLING I ROMMET',
    blocks: [
      {
        id: 'doc_papirer_body',
        runs: [
          {
            text: 'Skoesken sto der hun forlot den. Postgiroene ferdig utfylt, sortert på forfall. Den øverste gjelder mars. Den er ikke levert. Inn: ',
          },
          {
            text: 'trygden hans — to mynter i måneden.',
            factId: 'f_trygd',
          },
          {
            text: ' Pensjonen hennes er opphørt. Ut: ',
          },
          {
            text: 'husleien — tre mynter. Den ble betalt kontant til huseieren, av Grete, den første.',
            factId: 'f_husleie',
          },
          {
            text: ' ',
          },
          {
            text: 'Alle avtaler står i Gretes navn.',
            factId: 'f_alt_via_grete',
          },
          {
            text: ' ',
          },
          {
            text: 'Ikke ett kjøp i kvitteringene er hans.',
            factId: 'f_ingen_matkjop',
          },
          {
            text: ' ',
          },
          {
            text: 'Regnestykket gikk opp — med henne. Nå mangler det to mynter. Hver måned.',
            factId: 'f_gap',
          },
          {
            text: ' Elling satt ved bordet mens jeg gikk gjennom esken. Han rettet på bunkene da jeg la dem fra meg. Han visste rekkefølgen.',
          },
        ],
      },
    ],
  },
  doc_huseier: {
    id: 'doc_huseier',
    kind: 'BREV',
    title: 'Brev fra huseieren · T. Bakkerud',
    register: 'formell',
    peek: '«Jeg hører at din mor er gått bort.»',
    meta: 'T. BAKKERUD · HÅNDSKREVET · LEVERT I POSTKASSEN · VIDEREFORMIDLET AV 4012',
    blocks: [
      {
        id: 'doc_huseier_body',
        runs: [
          {
            text: 'Til Elling Olsen. Jeg hører at din mor er gått bort. Kondolerer. Grete var et ordensmenneske, det har vært en glede å ha dere i oppgangen. Jeg må likevel skrive om det praktiske. ',
          },
          {
            text: 'Leien for mars er ikke kommet.',
            factId: 'f_leie_stoppet',
          },
          {
            text: ' ',
          },
          {
            text: 'Din mor og jeg har holdt på siden -71 uten papirer. Det har aldri vært nødvendig.',
            factId: 'f_leie_privat',
          },
          {
            text: ' Nå vet jeg ikke hvem jeg skal forholde meg til. Jeg vil ikke lage vanskeligheter. Men ',
          },
          {
            text: 'jeg kommer innom på torsdag, så får vi snakke om veien videre.',
            factId: 'f_huseier_kommer',
          },
          {
            text: ' Vennlig hilsen T. Bakkerud',
          },
        ],
      },
    ],
  },
  doc_frank_tlf: {
    id: 'doc_frank_tlf',
    kind: 'FELTNOTAT',
    title: 'Frank · telefonsamtale med Grete',
    register: 'notat',
    peek: '«Hun tok den på andre forsøk.»',
    meta: 'FELTNOTAT · 4012 F. SOLBERG · TLF. G. OLSEN',
    blocks: [
      {
        id: 'doc_frank_tlf_body',
        runs: [
          {
            text: 'Ringte Grete 11:40. Hun tok den på andre forsøk. Hun visste hvorfor jeg ringte. Haug hadde sagt fra. Hun var ikke sint, men hun var klar: ',
          },
          {
            text: '«Han klarer seg. Han har alltid klart seg.» Hun sa det to ganger.',
            factId: 'f_klarer_seg',
          },
          {
            text: ' Andre gangen lavere. ',
          },
          {
            text: 'Jeg spurte hvem som overtar hvis hun skulle bli innlagt. Det ble stille. Hun svarte ikke på det.',
            factId: 'f_ingen_plan',
          },
          {
            text: ' ',
          },
          {
            text: 'Jeg ba om å få hilse på Elling i telefonen. Hun sa han ikke tar telefonen. «Det er ikke noe galt med ham. Han liker bare ikke apparatet.»',
            factId: 'f_elling_tlf',
          },
          {
            text: ' Mot slutten ',
          },
          {
            text: 'spurte hun om dette betydde at noen kom til å ta ham fra leiligheten',
            factId: 'f_grete_redd',
          },
          {
            text: '. Jeg sa nei. Jeg håper det var sant. Hun gikk med på hjemmebesøk. «Hvis det må til.» Det må til.',
          },
        ],
      },
    ],
  },
  doc_frank_visit: {
    id: 'doc_frank_visit',
    kind: 'RAPPORT',
    title: 'Frank · hjemmebesøk Gabels gate 14',
    register: 'notat',
    peek: '«Hun hadde dekket på med tre kopper.»',
    meta: 'HJEMMEBESØK · 4012 F. SOLBERG · BLOKKA · 4. ETASJE · AVTALT VIA G. OLSEN',
    blocks: [
      {
        id: 'doc_frank_visit_body',
        runs: [
          {
            text: 'Grete åpnet før jeg fikk ringt på. Hun hadde dekket på med tre kopper. Elling brukte ikke sin. I gangen: ',
          },
          {
            text: 'en bunke uåpnet post på skoskapet. Øverst: Trygdekontoret, sosialkontoret, Oslo Energi.',
            factId: 'f_post',
          },
          {
            text: ' Grete flyttet bunken da hun så at jeg så. På kjøkkenveggen: ',
          },
          {
            text: 'kalender. Alle avtaler ført med samme håndskrift. Det er ikke Ellings.',
            factId: 'f_kalender',
          },
          {
            text: ' I kjøleskapet (Grete viste meg, uoppfordret, som et bevis): ',
          },
          {
            text: 'middagsbokser merket med ukedager, mandag til søndag.',
            factId: 'f_matbokser',
          },
          {
            text: ' «Han varmer dem selv.» Det hørtes ut som et forsvar. Elling satt i stuen med ',
          },
          {
            text: 'en bok om polarekspedisjoner. Han noterte i margen. Systematisk, små bokstaver.',
            factId: 'f_bok',
          },
          {
            text: ' Jeg spurte om Nansen. Han svarte med tre presise setninger. Til veggen, ikke til meg. Over skrivebordet hans: ',
          },
          {
            text: 'avisutklipp, sirlig montert. Gro, landsmøter, 1. mai-tog. Årstall i hjørnene, hans håndskrift.',
            factId: 'f_utklipp',
          },
          {
            text: ' Det er ikke rot. Det er et arkiv. ',
          },
          {
            text: 'Han forlot ikke rommet, men flyttet seg slik at det alltid var et møbel mellom oss.',
            factId: 'f_avstand',
          },
          {
            text: ' Ikke demonstrativt. Bare slik det ble. Grete fulgte meg ut. I trappen sa hun: ',
          },
          {
            text: '«Du så hvordan han er. Han er en smart gutt.»',
            factId: 'f_smart_gutt',
          },
          {
            text: ' Hun er 72. Han er 35. Gutt.',
          },
        ],
      },
    ],
  },
  doc_innleggelse: {
    id: 'doc_innleggelse',
    kind: 'MELDING',
    title: 'OUS Ullevål · innleggelse',
    register: 'klinisk',
    peek: '«…ber om at kommunen ser til ham.»',
    meta: 'ULLEVÅL SYKEHUS · TIL SOSIALKONTORET · 14.02.1999',
    blocks: [
      {
        id: 'doc_innleggelse_body',
        runs: [
          {
            text: 'MELDING OM INNLEGGELSE Grete Olsen (f. 1927) ble ',
          },
          {
            text: 'innlagt akutt 14.02',
            factId: 'f_innlagt',
          },
          {
            text: ', kl. 06:50. Tilstanden er alvorlig, men avklart. Pårørende: sønn, Elling Olsen. ',
          },
          {
            text: 'Pasienten oppgir at sønnen ikke er varslet. Hun ber om at kommunen ser til ham.',
            factId: 'f_elling_uvarslet',
          },
          {
            text: ' Hun var tydelig på dette før hun ble lagt i behandling. SOSIALMEDISINSK ENHET · OUS',
          },
        ],
      },
    ],
  },
  doc_dodsfall: {
    id: 'doc_dodsfall',
    kind: 'MELDING',
    title: 'OUS Ullevål · dødsfall',
    register: 'klinisk',
    peek: '—',
    meta: 'ULLEVÅL SYKEHUS · TIL SOSIALKONTORET · 15.02.1999',
    blocks: [
      {
        id: 'doc_dodsfall_body',
        runs: [
          {
            text: 'MELDING OM DØDSFALL Grete Olsen, f. 21.09.1927. ',
          },
          {
            text: 'Dødsfall konstatert 15.02 kl. 04:12.',
            factId: 'f_dod',
          },
          {
            text: ' Avdødes sønn er eneste nærmeste pårørende. Varsling ble forsøkt per telefon uten svar. ',
          },
          {
            text: 'Politiet bisto ved varsling på bopel. Sønnen åpnet ikke døren. Beskjeden ble gitt gjennom brevsprekken.',
            factId: 'f_brevsprekken',
          },
          {
            text: ' Saken overføres kommunen for videre oppfølging av gjenlevende. SOSIALMEDISINSK ENHET · OUS',
          },
        ],
      },
    ],
  },
} satisfies Record<string, BlueprintDocument>;

export const tinyOlsenFacts = {
  f_grete_syk: {
    id: 'f_grete_syk',
    domain: 'Helse/risiko',
    category: 'Dokument',
    text: 'Grete er alvorlig syk. Forventet forløp er kort.',
    quote: 'sykdom med kort forventet forløp',
    supports: ['q_hverdag'],
    discuss: ['Frank'],
  },
  f_aldri_alene: {
    id: 'f_aldri_alene',
    domain: 'Hverdag/rutine',
    category: 'Dokument',
    text: 'Elling (35) har aldri bodd alene.',
    quote: 'Sønnen har aldri bodd alene',
    supports: ['q_hverdag', 'q_selv'],
    discuss: ['Frank', 'Grete'],
  },
  f_grete_baerer: {
    id: 'f_grete_baerer',
    domain: 'Hverdag/rutine',
    category: 'Dokument',
    text: 'Grete bistår med gjøremål, økonomi og kontakt med tjenester.',
    quote:
      'Mor opplyser at hun bistår med praktiske gjøremål, økonomisk oversikt og kontakt med tjenester',
    supports: ['q_hverdag', 'q_okonomi'],
    discuss: ['Frank', 'Grete'],
  },
  f_saarbar: {
    id: 'f_saarbar',
    domain: 'Helse/risiko',
    category: 'Risiko',
    text: 'Elling vurderes som sårbar ved bortfall av pårørende.',
    quote: 'Pasienten fremstår sårbar ved bortfall av pårørende',
    supports: ['q_hverdag'],
    discuss: ['Frank'],
  },
  f_ingen_tjenester: {
    id: 'f_ingen_tjenester',
    domain: 'Nettverk/sosialt',
    category: 'Dokument',
    text: 'Elling har ingen kontakt med øvrige tjenester.',
    quote: 'ikke i kontakt med øvrige tjenester',
    supports: ['q_kontakt'],
    discuss: ['Frank'],
  },
  f_trygd: {
    id: 'f_trygd',
    domain: 'Økonomi/bolig',
    category: 'Økonomi',
    text: 'Ellings uføretrygd: to mynter i måneden.',
    quote: 'trygden hans — to mynter i måneden. Den kommer den første, og den går rett videre.',
    supports: ['q_okonomi', 'q_bolig'],
    discuss: ['Frank'],
  },
  f_alt_via_grete: {
    id: 'f_alt_via_grete',
    domain: 'Økonomi/bolig',
    category: 'Økonomi',
    text: 'Hele trygden går rett inn i Gretes system. Alle avtaler står i hennes navn.',
    quote: 'Alle betalinger går gjennom Grete. Alle avtaler står i hennes navn.',
    supports: ['q_okonomi'],
    discuss: ['Frank', 'Grete'],
  },
  f_husleie: {
    id: 'f_husleie',
    domain: 'Økonomi/bolig',
    category: 'Økonomi',
    text: 'Husleien er tre mynter og betales av Grete.',
    quote: 'husleien — tre mynter. Den betales kontant til huseieren, av Grete, den første.',
    supports: ['q_okonomi', 'q_bolig'],
    discuss: ['Frank', 'Grete'],
  },
  f_gap: {
    id: 'f_gap',
    domain: 'Økonomi/bolig',
    category: 'Økonomi',
    text: 'Uten Gretes pensjon mangler husholdet to mynter hver måned.',
    quote: 'Regnestykket går opp — med henne. Uten henne mangler det to mynter. Hver måned.',
    supports: ['q_okonomi', 'q_bolig'],
    discuss: ['Frank'],
  },
  f_ingen_matkjop: {
    id: 'f_ingen_matkjop',
    domain: 'Hverdag/rutine',
    category: 'Økonomi',
    text: 'Elling har aldri betalt for mat selv. Mat skjer gjennom Grete.',
    quote: 'Jeg fant ikke ett kjøp som var hans. Ikke ett.',
    supports: ['q_hverdag'],
    discuss: ['Frank'],
  },
  f_leie_stoppet: {
    id: 'f_leie_stoppet',
    domain: 'Økonomi/bolig',
    category: 'Risiko',
    text: 'Husleien har stoppet. Betalingskjeden døde med Grete.',
    quote: 'Leien for mars er ikke kommet.',
    supports: ['q_bolig', 'q_kollaps'],
    discuss: ['Frank'],
  },
  f_huseier_kommer: {
    id: 'f_huseier_kommer',
    domain: 'Økonomi/bolig',
    category: 'Risiko',
    text: 'Huseieren varsler at han kommer innom. Torsdag.',
    quote: 'jeg kommer innom på torsdag, så får vi snakke om veien videre.',
    supports: ['q_bolig', 'q_kontakt'],
    discuss: ['Frank'],
  },
  f_leie_privat: {
    id: 'f_leie_privat',
    domain: 'Økonomi/bolig',
    category: 'Dokument',
    text: 'Leieforholdet er privat og muntlig innarbeidet siden 1971. Ingen kontrakt å lene seg på.',
    quote: 'Din mor og jeg har holdt på siden -71 uten papirer. Det har aldri vært nødvendig.',
    supports: ['q_bolig'],
    discuss: ['Frank'],
  },
  f_klarer_seg: {
    id: 'f_klarer_seg',
    domain: 'Nettverk/sosialt',
    category: 'Samtale',
    text: 'Grete avviser bekymringen. Gjentar formuleringen.',
    quote: '«Han klarer seg. Han har alltid klart seg.» Hun sa det to ganger.',
    supports: ['q_hverdag'],
    discuss: ['Frank'],
  },
  f_ingen_plan: {
    id: 'f_ingen_plan',
    domain: 'Helse/risiko',
    category: 'Samtale',
    text: 'Det finnes ingen plan for hvem som overtar etter Grete.',
    quote:
      'Jeg spurte hvem som overtar hvis hun skulle bli innlagt. Det ble stille. Hun svarte ikke på det.',
    supports: ['q_hverdag', 'q_bolig'],
    discuss: ['Frank', 'Grete'],
  },
  f_elling_tlf: {
    id: 'f_elling_tlf',
    domain: 'Nettverk/sosialt',
    category: 'Samtale',
    text: 'Elling tar ikke telefonen. Grete normaliserer det.',
    quote:
      'Jeg ba om å få hilse på Elling i telefonen. Hun sa han ikke tar telefonen. «Det er ikke noe galt med ham. Han liker bare ikke apparatet.»',
    supports: ['q_kontakt'],
    discuss: ['Frank', 'Grete'],
  },
  f_grete_redd: {
    id: 'f_grete_redd',
    domain: 'Nettverk/sosialt',
    category: 'Samtale',
    text: 'Grete frykter at kommunen vil ta leiligheten — eller Elling.',
    quote: 'spurte hun om dette betydde at noen kom til å ta ham fra leiligheten',
    supports: ['q_bolig'],
    discuss: ['Frank'],
  },
  f_post: {
    id: 'f_post',
    domain: 'Hverdag/rutine',
    category: 'Observasjon',
    text: 'Uåpnet post samler seg. Grete håndterer den — og skjuler den.',
    quote:
      'en bunke uåpnet post på skoskapet. Øverst: Trygdekontoret, sosialkontoret, Oslo Energi.',
    supports: ['q_hverdag', 'q_okonomi'],
    discuss: ['Frank'],
  },
  f_kalender: {
    id: 'f_kalender',
    domain: 'Hverdag/rutine',
    category: 'Observasjon',
    text: 'Kalenderen føres av Grete. Avtaler finnes bare så lenge hun fører dem.',
    quote: 'kalender. Alle avtaler ført med samme håndskrift. Det er ikke Ellings.',
    supports: ['q_hverdag'],
    discuss: ['Frank'],
  },
  f_matbokser: {
    id: 'f_matbokser',
    domain: 'Hverdag/rutine',
    category: 'Observasjon',
    text: 'Maten er preppet av Grete, merket med ukedager. Elling varmer.',
    quote: 'middagsbokser merket med ukedager, mandag til søndag.',
    supports: ['q_hverdag', 'q_selv'],
    discuss: ['Frank', 'Grete'],
  },
  f_bok: {
    id: 'f_bok',
    domain: 'Ressurser',
    category: 'Ressurs',
    text: 'Elling leser krevende stoff og noterer systematisk. Konsentrasjonen er en ressurs.',
    quote: 'en bok om polarekspedisjoner. Han noterte i margen. Systematisk, små bokstaver.',
    supports: ['q_selv'],
    discuss: ['Frank'],
  },
  f_utklipp: {
    id: 'f_utklipp',
    domain: 'Ressurser',
    category: 'Ressurs',
    text: 'Elling samler og systematiserer: utklipp av Gro og Arbeiderpartiet, datert og ordnet.',
    quote:
      'avisutklipp, sirlig montert. Gro, landsmøter, 1. mai-tog. Årstall i hjørnene, hans håndskrift.',
    supports: ['q_selv'],
    discuss: ['Frank'],
  },
  f_avstand: {
    id: 'f_avstand',
    domain: 'Nettverk/sosialt',
    category: 'Observasjon',
    text: 'Elling holder avstand til fremmede. Alltid et møbel mellom.',
    quote: 'Han forlot ikke rommet, men flyttet seg slik at det alltid var et møbel mellom oss.',
    supports: ['q_kontakt', 'q_selv'],
    discuss: ['Frank'],
  },
  f_smart_gutt: {
    id: 'f_smart_gutt',
    domain: 'Nettverk/sosialt',
    category: 'Samtale',
    text: 'Grete omtaler Elling (35) som «gutt». Rollene er fastlåst.',
    quote: '«Du så hvordan han er. Han er en smart gutt.»',
    supports: ['q_hverdag', 'q_selv'],
    discuss: ['Frank'],
  },
  f_innlagt: {
    id: 'f_innlagt',
    domain: 'Helse/risiko',
    category: 'Dokument',
    text: 'Grete er akutt innlagt på Ullevål.',
    quote: 'innlagt akutt 14.02',
    supports: ['q_hverdag', 'q_bolig'],
    discuss: ['Frank'],
  },
  f_elling_uvarslet: {
    id: 'f_elling_uvarslet',
    domain: 'Helse/risiko',
    category: 'Dokument',
    text: 'Elling vet ikke at Grete er innlagt. Hun ber kommunen se til ham.',
    quote: 'Pasienten oppgir at sønnen ikke er varslet. Hun ber om at kommunen ser til ham.',
    supports: ['q_kontakt', 'q_kollaps'],
    discuss: ['Frank'],
  },
  f_dod: {
    id: 'f_dod',
    domain: 'Helse/risiko',
    category: 'Dokument',
    text: 'Grete Olsen døde 15.02 kl. 04:12.',
    quote: 'Dødsfall konstatert 15.02 kl. 04:12.',
    supports: ['q_kollaps'],
    discuss: ['Frank'],
  },
  f_brevsprekken: {
    id: 'f_brevsprekken',
    domain: 'Nettverk/sosialt',
    category: 'Dokument',
    text: 'Dødsbudskapet ble gitt gjennom brevsprekken. Døren forble lukket.',
    quote:
      'Politiet bisto ved varsling på bopel. Sønnen åpnet ikke døren. Beskjeden ble gitt gjennom brevsprekken.',
    supports: ['q_kontakt', 'q_kollaps'],
    discuss: ['Frank'],
  },
} satisfies Record<string, BlueprintFact>;

export const tinyOlsenQuestions = {
  q_okonomi: {
    id: 'q_okonomi',
    title: 'Hvem holder økonomien i gang?',
    appearsOn: ['f_grete_baerer', 'f_trygd', 'f_husleie'],
    hypotheses: [
      {
        id: 'h_ok_grete',
        label: 'Grete bærer betalingskjeden.',
        needs: ['f_husleie', 'f_alt_via_grete'],
        opens: ['t_forvaltning'],
        note: 'Husleie og faste betalinger fungerer gjennom Gretes system — skoesken, postgiroene, kontantene den første. Systemet har én operatør.',
      },
      {
        id: 'h_ok_unngaar',
        label: 'Elling forstår økonomien, men unngår post.',
        needs: ['f_post', 'f_bok'],
        opens: ['t_dokgjennomgang'],
        note: 'Kapasiteten til å forstå er observert. Papiret når likevel aldri frem til en vurdering, fordi konvolutten aldri åpnes. Problemet er kanal, ikke forståelse.',
      },
      {
        id: 'h_ok_gap',
        label: 'Trygden dekker ikke boligen uten Gretes pensjon.',
        needs: ['f_gap'],
        opens: ['t_bostotte'],
        note: 'Ellings trygd er to mynter. Boligen koster tre. Differansen bæres i dag av Gretes pensjon. Bortfall gir umiddelbar restanserisiko.',
      },
    ],
  },
  q_bolig: {
    id: 'q_bolig',
    title: 'Kan Elling bli boende når Grete ikke lenger bærer hverdagen?',
    appearsOn: ['f_gap', 'f_leie_stoppet', 'f_husleie'],
    hypotheses: [
      {
        id: 'h_b_sikres',
        label: 'Boligen kan sikres — med bostøtte og ordnet betalingskjede.',
        needs: ['f_gap', 'f_trygd'],
        opens: ['t_bostotte', 't_forvaltning'],
        note: 'Med bostøtte og en ordnet betalingskjede kan leieforholdet videreføres. Forutsetter at søknaden fremmes før restansen blir en sak.',
      },
      {
        id: 'h_b_flytte',
        label: 'Boligen kan ikke holdes. Flytting bør forberedes nå.',
        needs: ['f_gap', 'f_leie_privat'],
        opens: ['t_huseier'],
        note: 'Leieforholdet er privat, muntlig og uten vern. Vurderingen er at alternativ bolig bør kartlegges før huseieren tvinger frem en akutt løsning.',
      },
      {
        id: 'h_b_uavklart',
        label: 'Uavklart — økonomien må kartlegges først.',
        needs: [],
        opens: [],
        note: 'Saken mangler økonomisk grunnlag for en boligvurdering. Be Frank lage en økonomisk oversikt.',
      },
    ],
  },
  q_hverdag: {
    id: 'q_hverdag',
    title: 'Hva bærer Grete i hverdagen — og hva skjer når hun ikke kan?',
    appearsOn: ['f_grete_baerer', 'f_klarer_seg'],
    hypotheses: [
      {
        id: 'h_h_infra',
        label: 'Grete er usynlig infrastruktur: mat, kalender, post, kontakt.',
        needs: ['f_kalender', 'f_matbokser'],
        opens: ['t_hjemmehjelp', 't_matlevering'],
        note: 'Husholdets funksjoner — mat, avtaler, post, kontakt med tjenester — utføres i dag av mor. Funksjonene er ikke dokumentert noe sted og overlever ikke bortfall uten overføring.',
      },
      {
        id: 'h_h_kanmer',
        label: 'Elling klarer mer enn det ser ut. Grete har bare alltid gjort det først.',
        needs: ['f_bok', 'f_utklipp'],
        opens: ['t_brev'],
        note: 'Observert kapasitet — konsentrasjon, arkiv, system — tilsier at funksjoner er trenbare. Ikke testet. Grete har aldri latt det bli testet.',
      },
      {
        id: 'h_h_system',
        label: 'Husholdet fungerer bare som system med to.',
        needs: ['f_matbokser', 'f_ingen_matkjop'],
        opens: ['t_hjemmehjelp'],
        note: 'Husholdet er bygget som ett system med to roller. Den ene rollen faller bort. Systemet er ikke vurdert for én.',
      },
    ],
  },
  q_selv: {
    id: 'q_selv',
    title: 'Hva kan Elling lære seg, med riktig stillas?',
    appearsOn: ['f_bok', 'f_utklipp', 'f_matbokser', 'f_aldri_alene'],
    hypotheses: [
      {
        id: 'h_s_trenbar',
        label: 'Konsentrasjonen er sterk. Rutiner kan trenes — én om gangen.',
        needs: ['f_bok'],
        opens: ['t_brev', 't_regning'],
        note: 'Kapasitet til fordypning og system er observert. Avgrensede rutiner kan bygges med støtte — lavt tempo, fast person, hans eget arkivspråk.',
      },
      {
        id: 'h_s_formell',
        label: 'Ferdighetene er der ikke. Formell støtte må bære alt.',
        needs: ['f_saarbar'],
        opens: ['t_institusjon'],
        note: 'Funksjonsnivået vurderes som for lavt for egenmestring. Tjenestene må dimensjoneres for full kompensasjon.',
      },
      {
        id: 'h_s_ukjent',
        label: 'Vet ikke — før noe er prøvd med støtte.',
        needs: [],
        opens: ['t_brev'],
        note: 'Kommunen har ingen observasjon av Elling i en mestringssituasjon. Vurdering uten utprøving vil være gjetning.',
      },
      {
        id: 'h_press_institusjon',
        label: 'Press: institusjonsvurdering kan alltid utløses.',
        needs: ['f_saarbar'],
        opens: ['t_institusjon'],
        note: 'Pseudo-hypotese som gir institusjonsvurderingen et hjem. Pressmiddelet er alltid tilgjengelig — sårbarheten alene er nok til å vurdere det — men det er aldri automatisk riktig.',
      },
    ],
  },
  q_kontakt: {
    id: 'q_kontakt',
    title: 'Hvordan når kommunen Elling uten Grete?',
    appearsOn: ['f_elling_tlf', 'f_avstand', 'f_ingen_tjenester'],
    hypotheses: [
      {
        id: 'h_k_oppmote',
        label: 'Telefonen er stengt kanal. Fast person og oppmøte kan virke.',
        needs: ['f_elling_tlf', 'f_avstand'],
        opens: ['t_hjemmehjelp'],
        note: 'Fasttelefonen vurderes som uegnet kanal. Kontakt bør bygges gjennom én fast person med forutsigbart oppmøte. Tempoet settes av Elling.',
      },
      {
        id: 'h_k_skriftlig',
        label: 'All kontakt må gå skriftlig.',
        needs: ['f_post'],
        opens: ['t_dokgjennomgang'],
        note: 'Skriftlig kanal forutsetter at post åpnes. Det er ikke sannsynliggjort. Kanalen kan være riktig på sikt, men er i dag like stengt som telefonen.',
      },
      {
        id: 'h_k_via_grete',
        label: 'Kontakt må gå via Grete så lenge hun lever.',
        needs: ['f_klarer_seg'],
        opens: [],
        note: 'Grete er i dag eneste fungerende kanal inn. Vedtaket bør merke seg at denne kanalen har kort forventet varighet.',
      },
    ],
  },
  q_kollaps: {
    id: 'q_kollaps',
    title: 'Hva kollapser først nå?',
    appearsOn: ['f_dod'],
    hypotheses: [
      {
        id: 'h_c_penger',
        label: 'Økonomien. Husleien stopper denne måneden.',
        needs: ['f_gap'],
        opens: ['t_forvaltning', 't_huseier'],
        note: 'Betalingskjeden lå i Gretes skoeske og hukommelse. Den opphørte 15.02. Restanse løper fra første forfall.',
      },
      {
        id: 'h_c_mat',
        label: 'Maten. Boksene i kjøleskapet tar slutt om dager.',
        needs: ['f_matbokser'],
        opens: ['t_matlevering'],
        note: 'Matforsyningen var preppet uke for uke. Siste leveranse skjedde før innleggelsen. Det finnes ingen neste.',
      },
      {
        id: 'h_c_kontakt',
        label: 'Kontakten. Uten kanal inn er alt annet teori.',
        needs: ['f_brevsprekken'],
        opens: ['t_hjemmehjelp'],
        note: 'Kommunen har per i dag ingen bekreftet kanal til Elling. Tiltak uten kanal er vedtak på papir.',
      },
    ],
  },
} satisfies Record<string, BlueprintQuestion>;

export const tinyOlsenTiltak = {
  t_bostotte: {
    id: 't_bostotte',
    slot: 's1',
    title: 'Søk bostøtte',
    cost: 0,
    needs: ['f_trygd', 'f_husleie'],
    needsHypothesis: ['h_ok_gap', 'h_b_sikres'],
    description: 'Husbanken. Krever dokumentert inntekt og husleie. Saksbehandlingstid.',
    sim: 'case.olsen.tiltak.bostotte',
  },
  t_forvaltning: {
    id: 't_forvaltning',
    slot: 's1',
    title: 'Frivillig forvaltning av faste betalinger',
    cost: 1,
    needs: ['f_alt_via_grete'],
    needsHypothesis: ['h_ok_grete', 'h_b_sikres', 'h_c_penger'],
    description: 'Kommunen overtar skoesken. Trygt. Bygger ingenting.',
    sim: 'case.olsen.tiltak.forvaltning',
  },
  t_huseier: {
    id: 't_huseier',
    slot: 's1',
    title: 'Snakk med huseieren',
    cost: 0,
    needs: ['f_huseier_kommer'],
    needsHypothesis: ['h_b_sikres', 'h_b_flytte', 'h_c_penger'],
    description:
      'Bakkerud vil vite hvem han skal forholde seg til. La det bli Frank — ikke torsdagsbesøket.',
    sim: 'case.olsen.tiltak.garanti',
  },
  t_hjemmehjelp: {
    id: 't_hjemmehjelp',
    slot: 's2',
    title: 'Hjemmehjelp 2× uke — Frank',
    cost: 2,
    needs: ['f_grete_baerer'],
    needsHypothesis: ['h_h_infra', 'h_h_system', 'h_k_oppmote', 'h_c_kontakt'],
    description: 'Fast person, fast tid. Den eneste kanalen inn som har virket hittil.',
    sim: 'case.olsen.tiltak.channel',
  },
  t_matlevering: {
    id: 't_matlevering',
    slot: 's2',
    title: 'Matombringing',
    cost: 1,
    needs: ['f_matbokser'],
    needsHypothesis: ['h_h_infra', 'h_c_mat'],
    description: 'Bokser på døren, tre dager i uken. Forutsetter at døren er en kanal.',
    sim: 'case.olsen.tiltak.food',
  },
  t_dokgjennomgang: {
    id: 't_dokgjennomgang',
    slot: 's2',
    title: 'Fast dokumentgjennomgang',
    cost: 1,
    needs: ['f_post'],
    needsHypothesis: ['h_ok_unngaar', 'h_k_skriftlig', 'h_h_infra'],
    description: 'Frank går gjennom posten ukentlig. Papiret når frem til en vurdering.',
    sim: 'case.olsen.tiltak.dok',
  },
  t_brev: {
    id: 't_brev',
    slot: 's3',
    title: 'Åpne ett brev sammen med Frank',
    cost: 0,
    needs: ['f_post'],
    needsHypothesis: ['h_h_kanmer', 'h_s_trenbar', 'h_s_ukjent'],
    description: 'Ett brev. Ikke bunken. Frank legger det på bordet og venter.',
    sim: 'case.olsen.tiltak.brev',
  },
  t_regning: {
    id: 't_regning',
    slot: 's3',
    title: 'Betal én regning med støtte',
    cost: 0,
    needs: ['f_gap'],
    needsHypothesis: ['h_s_trenbar'],
    description: 'Én regning, én gang. Målet er at det har skjedd, ikke at det er lært.',
    sim: 'case.olsen.tiltak.regning',
  },
  t_institusjon: {
    id: 't_institusjon',
    slot: 'press',
    title: 'Institusjonsvurdering / omsorgsbolig',
    cost: 0,
    needs: ['f_saarbar'],
    needsHypothesis: ['h_s_formell', 'h_press_institusjon'],
    description:
      'Bureaukratisk lesbart. Trygt på papiret. Leiligheten blir i så fall et avsluttet kapittel.',
    sim: 'case.olsen.tiltak.institusjon',
  },
} satisfies Record<string, BlueprintTiltak>;

export const tinyOlsenDispatches = {
  d_ring_grete: {
    id: 'd_ring_grete',
    title: 'Ring Grete',
    description: 'Førstekontakt. Hun vet hvorfor du ringer.',
  },
  d_konto: {
    id: 'd_konto',
    title: 'Be om økonomisk oversikt',
    description: 'Frank setter seg ved kjøkkenbordet med Grete og skoesken. Tar en dag.',
  },
} satisfies Record<string, BlueprintDispatch>;

export const tinyOlsenGodotSource = {
  id: 'case_olsen_tiny',
  title: 'Olsen — full case slice',
  scenario_stage: 0,
  documents: [
    {
      id: 'doc_bekymring',
      kind: 'BEKYMRINGSMELDING',
      title: 'Legesenteret · Dr. J. Haug',
      register: 'klinisk',
      peek: '«…anbefaler kommunal kartlegging av funksjon, hjelpebehov og overgangstiltak.»',
      meta: 'LEGESENTERET · DR. J. HAUG · 11.02.1999',
      body_bbcode:
        'GJELDER\nOlsen, Elling · f. 14.03.1964\n\nUndertegnede er fastlege for Grete Olsen (f. 1927) og hennes sønn Elling Olsen. Mor er under utredning og behandling for [url=fact:f_grete_syk]sykdom med kort forventet forløp[/url]. Hun er informert om at denne meldingen sendes.\n\nMor og sønn bor sammen i en treroms blokkleilighet, fjerde etasje. [url=fact:f_aldri_alene]Sønnen har aldri bodd alene[/url]. Han er uføretrygdet og er etter det undertegnede kjenner til [url=fact:f_ingen_tjenester]ikke i kontakt med øvrige tjenester[/url].\n\n[url=fact:f_grete_baerer]Mor opplyser at hun bistår med praktiske gjøremål, økonomisk oversikt og kontakt med tjenester[/url]. Omfanget er ikke kartlagt.\n\n[url=fact:f_saarbar]Pasienten fremstår sårbar ved bortfall av pårørende[/url]. Anbefaler kommunal kartlegging av funksjon, hjelpebehov og overgangstiltak.\n\nMed hilsen\nJørgen Haug\nspes. allmennmedisin',
      runs: [
        {
          id: 'run_text_0',
          text: 'GJELDER Olsen, Elling · f. 14.03.1964 Undertegnede er fastlege for Grete Olsen (f. 1927) og hennes sønn Elling Olsen. Mor er under utredning og behandling for ',
          fact_id: '',
        },
        {
          id: 'run_grete_syk',
          text: 'sykdom med kort forventet forløp',
          fact_id: 'f_grete_syk',
        },
        {
          id: 'run_text_1',
          text: '. Hun er informert om at denne meldingen sendes. Mor og sønn bor sammen i en treroms blokkleilighet, fjerde etasje. ',
          fact_id: '',
        },
        {
          id: 'run_aldri_alene',
          text: 'Sønnen har aldri bodd alene',
          fact_id: 'f_aldri_alene',
        },
        {
          id: 'run_text_2',
          text: '. Han er uføretrygdet og er etter det undertegnede kjenner til ',
          fact_id: '',
        },
        {
          id: 'run_ingen_tjenester',
          text: 'ikke i kontakt med øvrige tjenester',
          fact_id: 'f_ingen_tjenester',
        },
        {
          id: 'run_text_3',
          text: '. ',
          fact_id: '',
        },
        {
          id: 'run_grete_baerer',
          text: 'Mor opplyser at hun bistår med praktiske gjøremål, økonomisk oversikt og kontakt med tjenester',
          fact_id: 'f_grete_baerer',
        },
        {
          id: 'run_text_4',
          text: '. Omfanget er ikke kartlagt. ',
          fact_id: '',
        },
        {
          id: 'run_saarbar',
          text: 'Pasienten fremstår sårbar ved bortfall av pårørende',
          fact_id: 'f_saarbar',
        },
        {
          id: 'run_text_5',
          text: '. Anbefaler kommunal kartlegging av funksjon, hjelpebehov og overgangstiltak. Med hilsen Jørgen Haug spes. allmennmedisin',
          fact_id: '',
        },
      ],
    },
    {
      id: 'doc_konto',
      kind: 'ØKONOMISK OVERSIKT',
      title: 'Frank · husholdets økonomi',
      register: 'notat',
      peek: '«Regnestykket går opp — med henne.»',
      meta: 'ØKONOMISK OVERSIKT · 4012 F. SOLBERG · GJENNOMGÅTT MED G. OLSEN VED KJØKKENBORDET',
      body_bbcode:
        'Grete fant frem alt. Postgiroene ligger i en skoeske, ferdig utfylt, sortert på forfall.\n\nInn: [url=fact:f_trygd]trygden hans — to mynter i måneden. Den kommer den første, og den går rett videre.[/url] Pensjonen hennes: tre mynter.\n\nUt: [url=fact:f_husleie]husleien — tre mynter. Den betales kontant til huseieren, av Grete, den første.[/url] Strøm, mat og resten: to mynter til sammen.\n\n[url=fact:f_alt_via_grete]Alle betalinger går gjennom Grete. Alle avtaler står i hennes navn.[/url] Jeg spurte om Elling visste hvor skoesken sto. Hun lo, kort.\n\nJeg gikk gjennom kvitteringene. [url=fact:f_ingen_matkjop]Jeg fant ikke ett kjøp som var hans. Ikke ett.[/url]\n\n[url=fact:f_gap]Regnestykket går opp — med henne. Uten henne mangler det to mynter. Hver måned.[/url]',
      runs: [
        {
          id: 'run_text_0',
          text: 'Grete fant frem alt. Postgiroene ligger i en skoeske, ferdig utfylt, sortert på forfall. Inn: ',
          fact_id: '',
        },
        {
          id: 'run_trygd',
          text: 'trygden hans — to mynter i måneden. Den kommer den første, og den går rett videre.',
          fact_id: 'f_trygd',
        },
        {
          id: 'run_text_1',
          text: ' Pensjonen hennes: tre mynter. Ut: ',
          fact_id: '',
        },
        {
          id: 'run_husleie',
          text: 'husleien — tre mynter. Den betales kontant til huseieren, av Grete, den første.',
          fact_id: 'f_husleie',
        },
        {
          id: 'run_text_2',
          text: ' Strøm, mat og resten: to mynter til sammen. ',
          fact_id: '',
        },
        {
          id: 'run_alt_via_grete',
          text: 'Alle betalinger går gjennom Grete. Alle avtaler står i hennes navn.',
          fact_id: 'f_alt_via_grete',
        },
        {
          id: 'run_text_3',
          text: ' Jeg spurte om Elling visste hvor skoesken sto. Hun lo, kort. Jeg gikk gjennom kvitteringene. ',
          fact_id: '',
        },
        {
          id: 'run_ingen_matkjop',
          text: 'Jeg fant ikke ett kjøp som var hans. Ikke ett.',
          fact_id: 'f_ingen_matkjop',
        },
        {
          id: 'run_text_4',
          text: ' ',
          fact_id: '',
        },
        {
          id: 'run_gap',
          text: 'Regnestykket går opp — med henne. Uten henne mangler det to mynter. Hver måned.',
          fact_id: 'f_gap',
        },
      ],
    },
    {
      id: 'doc_papirer',
      kind: 'ØKONOMISK OVERSIKT',
      title: 'Frank · papirene i leiligheten',
      register: 'notat',
      peek: '«Skoesken sto der hun forlot den.»',
      meta: 'PAPIRGJENNOMGANG · 4012 F. SOLBERG · ETTER DØDSFALLET · MED ELLING I ROMMET',
      body_bbcode:
        'Skoesken sto der hun forlot den. Postgiroene ferdig utfylt, sortert på forfall. Den øverste gjelder mars. Den er ikke levert.\n\nInn: [url=fact:f_trygd]trygden hans — to mynter i måneden.[/url] Pensjonen hennes er opphørt.\n\nUt: [url=fact:f_husleie]husleien — tre mynter. Den ble betalt kontant til huseieren, av Grete, den første.[/url]\n\n[url=fact:f_alt_via_grete]Alle avtaler står i Gretes navn.[/url] [url=fact:f_ingen_matkjop]Ikke ett kjøp i kvitteringene er hans.[/url]\n\n[url=fact:f_gap]Regnestykket gikk opp — med henne. Nå mangler det to mynter. Hver måned.[/url]\n\nElling satt ved bordet mens jeg gikk gjennom esken. Han rettet på bunkene da jeg la dem fra meg. Han visste rekkefølgen.',
      runs: [
        {
          id: 'run_text_0',
          text: 'Skoesken sto der hun forlot den. Postgiroene ferdig utfylt, sortert på forfall. Den øverste gjelder mars. Den er ikke levert. Inn: ',
          fact_id: '',
        },
        {
          id: 'run_trygd',
          text: 'trygden hans — to mynter i måneden.',
          fact_id: 'f_trygd',
        },
        {
          id: 'run_text_1',
          text: ' Pensjonen hennes er opphørt. Ut: ',
          fact_id: '',
        },
        {
          id: 'run_husleie',
          text: 'husleien — tre mynter. Den ble betalt kontant til huseieren, av Grete, den første.',
          fact_id: 'f_husleie',
        },
        {
          id: 'run_text_2',
          text: ' ',
          fact_id: '',
        },
        {
          id: 'run_alt_via_grete',
          text: 'Alle avtaler står i Gretes navn.',
          fact_id: 'f_alt_via_grete',
        },
        {
          id: 'run_text_3',
          text: ' ',
          fact_id: '',
        },
        {
          id: 'run_ingen_matkjop',
          text: 'Ikke ett kjøp i kvitteringene er hans.',
          fact_id: 'f_ingen_matkjop',
        },
        {
          id: 'run_text_4',
          text: ' ',
          fact_id: '',
        },
        {
          id: 'run_gap',
          text: 'Regnestykket gikk opp — med henne. Nå mangler det to mynter. Hver måned.',
          fact_id: 'f_gap',
        },
        {
          id: 'run_text_5',
          text: ' Elling satt ved bordet mens jeg gikk gjennom esken. Han rettet på bunkene da jeg la dem fra meg. Han visste rekkefølgen.',
          fact_id: '',
        },
      ],
    },
    {
      id: 'doc_huseier',
      kind: 'BREV',
      title: 'Brev fra huseieren · T. Bakkerud',
      register: 'formell',
      peek: '«Jeg hører at din mor er gått bort.»',
      meta: 'T. BAKKERUD · HÅNDSKREVET · LEVERT I POSTKASSEN · VIDEREFORMIDLET AV 4012',
      body_bbcode:
        'Til Elling Olsen.\n\nJeg hører at din mor er gått bort. Kondolerer. Grete var et ordensmenneske, det har vært en glede å ha dere i oppgangen.\n\nJeg må likevel skrive om det praktiske. [url=fact:f_leie_stoppet]Leien for mars er ikke kommet.[/url] [url=fact:f_leie_privat]Din mor og jeg har holdt på siden -71 uten papirer. Det har aldri vært nødvendig.[/url] Nå vet jeg ikke hvem jeg skal forholde meg til.\n\nJeg vil ikke lage vanskeligheter. Men [url=fact:f_huseier_kommer]jeg kommer innom på torsdag, så får vi snakke om veien videre.[/url]\n\nVennlig hilsen\nT. Bakkerud',
      runs: [
        {
          id: 'run_text_0',
          text: 'Til Elling Olsen. Jeg hører at din mor er gått bort. Kondolerer. Grete var et ordensmenneske, det har vært en glede å ha dere i oppgangen. Jeg må likevel skrive om det praktiske. ',
          fact_id: '',
        },
        {
          id: 'run_leie_stoppet',
          text: 'Leien for mars er ikke kommet.',
          fact_id: 'f_leie_stoppet',
        },
        {
          id: 'run_text_1',
          text: ' ',
          fact_id: '',
        },
        {
          id: 'run_leie_privat',
          text: 'Din mor og jeg har holdt på siden -71 uten papirer. Det har aldri vært nødvendig.',
          fact_id: 'f_leie_privat',
        },
        {
          id: 'run_text_2',
          text: ' Nå vet jeg ikke hvem jeg skal forholde meg til. Jeg vil ikke lage vanskeligheter. Men ',
          fact_id: '',
        },
        {
          id: 'run_huseier_kommer',
          text: 'jeg kommer innom på torsdag, så får vi snakke om veien videre.',
          fact_id: 'f_huseier_kommer',
        },
        {
          id: 'run_text_3',
          text: ' Vennlig hilsen T. Bakkerud',
          fact_id: '',
        },
      ],
    },
    {
      id: 'doc_frank_tlf',
      kind: 'FELTNOTAT',
      title: 'Frank · telefonsamtale med Grete',
      register: 'notat',
      peek: '«Hun tok den på andre forsøk.»',
      meta: 'FELTNOTAT · 4012 F. SOLBERG · TLF. G. OLSEN',
      body_bbcode:
        'Ringte Grete 11:40. Hun tok den på andre forsøk.\n\nHun visste hvorfor jeg ringte. Haug hadde sagt fra. Hun var ikke sint, men hun var klar: [url=fact:f_klarer_seg]«Han klarer seg. Han har alltid klart seg.» Hun sa det to ganger.[/url] Andre gangen lavere.\n\n[url=fact:f_ingen_plan]Jeg spurte hvem som overtar hvis hun skulle bli innlagt. Det ble stille. Hun svarte ikke på det.[/url]\n\n[url=fact:f_elling_tlf]Jeg ba om å få hilse på Elling i telefonen. Hun sa han ikke tar telefonen. «Det er ikke noe galt med ham. Han liker bare ikke apparatet.»[/url]\n\nMot slutten [url=fact:f_grete_redd]spurte hun om dette betydde at noen kom til å ta ham fra leiligheten[/url]. Jeg sa nei. Jeg håper det var sant.\n\nHun gikk med på hjemmebesøk. «Hvis det må til.» Det må til.',
      runs: [
        {
          id: 'run_text_0',
          text: 'Ringte Grete 11:40. Hun tok den på andre forsøk. Hun visste hvorfor jeg ringte. Haug hadde sagt fra. Hun var ikke sint, men hun var klar: ',
          fact_id: '',
        },
        {
          id: 'run_klarer_seg',
          text: '«Han klarer seg. Han har alltid klart seg.» Hun sa det to ganger.',
          fact_id: 'f_klarer_seg',
        },
        {
          id: 'run_text_1',
          text: ' Andre gangen lavere. ',
          fact_id: '',
        },
        {
          id: 'run_ingen_plan',
          text: 'Jeg spurte hvem som overtar hvis hun skulle bli innlagt. Det ble stille. Hun svarte ikke på det.',
          fact_id: 'f_ingen_plan',
        },
        {
          id: 'run_text_2',
          text: ' ',
          fact_id: '',
        },
        {
          id: 'run_elling_tlf',
          text: 'Jeg ba om å få hilse på Elling i telefonen. Hun sa han ikke tar telefonen. «Det er ikke noe galt med ham. Han liker bare ikke apparatet.»',
          fact_id: 'f_elling_tlf',
        },
        {
          id: 'run_text_3',
          text: ' Mot slutten ',
          fact_id: '',
        },
        {
          id: 'run_grete_redd',
          text: 'spurte hun om dette betydde at noen kom til å ta ham fra leiligheten',
          fact_id: 'f_grete_redd',
        },
        {
          id: 'run_text_4',
          text: '. Jeg sa nei. Jeg håper det var sant. Hun gikk med på hjemmebesøk. «Hvis det må til.» Det må til.',
          fact_id: '',
        },
      ],
    },
    {
      id: 'doc_frank_visit',
      kind: 'RAPPORT',
      title: 'Frank · hjemmebesøk Gabels gate 14',
      register: 'notat',
      peek: '«Hun hadde dekket på med tre kopper.»',
      meta: 'HJEMMEBESØK · 4012 F. SOLBERG · BLOKKA · 4. ETASJE · AVTALT VIA G. OLSEN',
      body_bbcode:
        'Grete åpnet før jeg fikk ringt på. Hun hadde dekket på med tre kopper. Elling brukte ikke sin.\n\nI gangen: [url=fact:f_post]en bunke uåpnet post på skoskapet. Øverst: Trygdekontoret, sosialkontoret, Oslo Energi.[/url] Grete flyttet bunken da hun så at jeg så.\n\nPå kjøkkenveggen: [url=fact:f_kalender]kalender. Alle avtaler ført med samme håndskrift. Det er ikke Ellings.[/url]\n\nI kjøleskapet (Grete viste meg, uoppfordret, som et bevis): [url=fact:f_matbokser]middagsbokser merket med ukedager, mandag til søndag.[/url] «Han varmer dem selv.» Det hørtes ut som et forsvar.\n\nElling satt i stuen med [url=fact:f_bok]en bok om polarekspedisjoner. Han noterte i margen. Systematisk, små bokstaver.[/url] Jeg spurte om Nansen. Han svarte med tre presise setninger. Til veggen, ikke til meg.\n\nOver skrivebordet hans: [url=fact:f_utklipp]avisutklipp, sirlig montert. Gro, landsmøter, 1. mai-tog. Årstall i hjørnene, hans håndskrift.[/url] Det er ikke rot. Det er et arkiv.\n\n[url=fact:f_avstand]Han forlot ikke rommet, men flyttet seg slik at det alltid var et møbel mellom oss.[/url] Ikke demonstrativt. Bare slik det ble.\n\nGrete fulgte meg ut. I trappen sa hun: [url=fact:f_smart_gutt]«Du så hvordan han er. Han er en smart gutt.»[/url] Hun er 72. Han er 35. Gutt.',
      runs: [
        {
          id: 'run_text_0',
          text: 'Grete åpnet før jeg fikk ringt på. Hun hadde dekket på med tre kopper. Elling brukte ikke sin. I gangen: ',
          fact_id: '',
        },
        {
          id: 'run_post',
          text: 'en bunke uåpnet post på skoskapet. Øverst: Trygdekontoret, sosialkontoret, Oslo Energi.',
          fact_id: 'f_post',
        },
        {
          id: 'run_text_1',
          text: ' Grete flyttet bunken da hun så at jeg så. På kjøkkenveggen: ',
          fact_id: '',
        },
        {
          id: 'run_kalender',
          text: 'kalender. Alle avtaler ført med samme håndskrift. Det er ikke Ellings.',
          fact_id: 'f_kalender',
        },
        {
          id: 'run_text_2',
          text: ' I kjøleskapet (Grete viste meg, uoppfordret, som et bevis): ',
          fact_id: '',
        },
        {
          id: 'run_matbokser',
          text: 'middagsbokser merket med ukedager, mandag til søndag.',
          fact_id: 'f_matbokser',
        },
        {
          id: 'run_text_3',
          text: ' «Han varmer dem selv.» Det hørtes ut som et forsvar. Elling satt i stuen med ',
          fact_id: '',
        },
        {
          id: 'run_bok',
          text: 'en bok om polarekspedisjoner. Han noterte i margen. Systematisk, små bokstaver.',
          fact_id: 'f_bok',
        },
        {
          id: 'run_text_4',
          text: ' Jeg spurte om Nansen. Han svarte med tre presise setninger. Til veggen, ikke til meg. Over skrivebordet hans: ',
          fact_id: '',
        },
        {
          id: 'run_utklipp',
          text: 'avisutklipp, sirlig montert. Gro, landsmøter, 1. mai-tog. Årstall i hjørnene, hans håndskrift.',
          fact_id: 'f_utklipp',
        },
        {
          id: 'run_text_5',
          text: ' Det er ikke rot. Det er et arkiv. ',
          fact_id: '',
        },
        {
          id: 'run_avstand',
          text: 'Han forlot ikke rommet, men flyttet seg slik at det alltid var et møbel mellom oss.',
          fact_id: 'f_avstand',
        },
        {
          id: 'run_text_6',
          text: ' Ikke demonstrativt. Bare slik det ble. Grete fulgte meg ut. I trappen sa hun: ',
          fact_id: '',
        },
        {
          id: 'run_smart_gutt',
          text: '«Du så hvordan han er. Han er en smart gutt.»',
          fact_id: 'f_smart_gutt',
        },
        {
          id: 'run_text_7',
          text: ' Hun er 72. Han er 35. Gutt.',
          fact_id: '',
        },
      ],
    },
    {
      id: 'doc_innleggelse',
      kind: 'MELDING',
      title: 'OUS Ullevål · innleggelse',
      register: 'klinisk',
      peek: '«…ber om at kommunen ser til ham.»',
      meta: 'ULLEVÅL SYKEHUS · TIL SOSIALKONTORET · 14.02.1999',
      body_bbcode:
        'MELDING OM INNLEGGELSE\n\nGrete Olsen (f. 1927) ble [url=fact:f_innlagt]innlagt akutt 14.02[/url], kl. 06:50. Tilstanden er alvorlig, men avklart. Pårørende: sønn, Elling Olsen.\n\n[url=fact:f_elling_uvarslet]Pasienten oppgir at sønnen ikke er varslet. Hun ber om at kommunen ser til ham.[/url] Hun var tydelig på dette før hun ble lagt i behandling.\n\nSOSIALMEDISINSK ENHET · OUS',
      runs: [
        {
          id: 'run_text_0',
          text: 'MELDING OM INNLEGGELSE Grete Olsen (f. 1927) ble ',
          fact_id: '',
        },
        {
          id: 'run_innlagt',
          text: 'innlagt akutt 14.02',
          fact_id: 'f_innlagt',
        },
        {
          id: 'run_text_1',
          text: ', kl. 06:50. Tilstanden er alvorlig, men avklart. Pårørende: sønn, Elling Olsen. ',
          fact_id: '',
        },
        {
          id: 'run_elling_uvarslet',
          text: 'Pasienten oppgir at sønnen ikke er varslet. Hun ber om at kommunen ser til ham.',
          fact_id: 'f_elling_uvarslet',
        },
        {
          id: 'run_text_2',
          text: ' Hun var tydelig på dette før hun ble lagt i behandling. SOSIALMEDISINSK ENHET · OUS',
          fact_id: '',
        },
      ],
    },
    {
      id: 'doc_dodsfall',
      kind: 'MELDING',
      title: 'OUS Ullevål · dødsfall',
      register: 'klinisk',
      peek: '—',
      meta: 'ULLEVÅL SYKEHUS · TIL SOSIALKONTORET · 15.02.1999',
      body_bbcode:
        'MELDING OM DØDSFALL\n\nGrete Olsen, f. 21.09.1927. [url=fact:f_dod]Dødsfall konstatert 15.02 kl. 04:12.[/url]\n\nAvdødes sønn er eneste nærmeste pårørende. Varsling ble forsøkt per telefon uten svar. [url=fact:f_brevsprekken]Politiet bisto ved varsling på bopel. Sønnen åpnet ikke døren. Beskjeden ble gitt gjennom brevsprekken.[/url]\n\nSaken overføres kommunen for videre oppfølging av gjenlevende.\n\nSOSIALMEDISINSK ENHET · OUS',
      runs: [
        {
          id: 'run_text_0',
          text: 'MELDING OM DØDSFALL Grete Olsen, f. 21.09.1927. ',
          fact_id: '',
        },
        {
          id: 'run_dod',
          text: 'Dødsfall konstatert 15.02 kl. 04:12.',
          fact_id: 'f_dod',
        },
        {
          id: 'run_text_1',
          text: ' Avdødes sønn er eneste nærmeste pårørende. Varsling ble forsøkt per telefon uten svar. ',
          fact_id: '',
        },
        {
          id: 'run_brevsprekken',
          text: 'Politiet bisto ved varsling på bopel. Sønnen åpnet ikke døren. Beskjeden ble gitt gjennom brevsprekken.',
          fact_id: 'f_brevsprekken',
        },
        {
          id: 'run_text_2',
          text: ' Saken overføres kommunen for videre oppfølging av gjenlevende. SOSIALMEDISINSK ENHET · OUS',
          fact_id: '',
        },
      ],
    },
  ],
  facts: [
    {
      id: 'f_grete_syk',
      label: 'Grete er alvorlig syk',
      summary: 'Grete er alvorlig syk. Forventet forløp er kort.',
      source_document_id: 'doc_bekymring',
      domain: 'Helse/risiko',
      category: 'Dokument',
      quote: 'sykdom med kort forventet forløp',
      discuss: ['Frank'],
      supports_questions: ['q_hverdag'],
      lift_effects: [],
    },
    {
      id: 'f_aldri_alene',
      label: 'Aldri bodd alene',
      summary: 'Elling (35) har aldri bodd alene.',
      source_document_id: 'doc_bekymring',
      domain: 'Hverdag/rutine',
      category: 'Dokument',
      quote: 'Sønnen har aldri bodd alene',
      discuss: ['Frank', 'Grete'],
      supports_questions: ['q_hverdag', 'q_selv'],
      lift_effects: [
        {
          op: 'reveal_questions',
          args: {
            question_ids: ['q_selv'],
          },
        },
      ],
    },
    {
      id: 'f_grete_baerer',
      label: 'Grete bærer rutiner',
      summary: 'Grete bistår med gjøremål, økonomi og kontakt med tjenester.',
      source_document_id: 'doc_bekymring',
      domain: 'Hverdag/rutine',
      category: 'Dokument',
      quote:
        'Mor opplyser at hun bistår med praktiske gjøremål, økonomisk oversikt og kontakt med tjenester',
      discuss: ['Frank', 'Grete'],
      supports_questions: ['q_hverdag', 'q_okonomi'],
      lift_effects: [
        {
          op: 'reveal_questions',
          args: {
            question_ids: ['q_okonomi', 'q_hverdag'],
          },
        },
      ],
    },
    {
      id: 'f_saarbar',
      label: 'Sårbar ved bortfall',
      summary: 'Elling vurderes som sårbar ved bortfall av pårørende.',
      source_document_id: 'doc_bekymring',
      domain: 'Helse/risiko',
      category: 'Risiko',
      quote: 'Pasienten fremstår sårbar ved bortfall av pårørende',
      discuss: ['Frank'],
      supports_questions: ['q_hverdag'],
      lift_effects: [],
    },
    {
      id: 'f_ingen_tjenester',
      label: 'Ingen tjenester',
      summary: 'Elling har ingen kontakt med øvrige tjenester.',
      source_document_id: 'doc_bekymring',
      domain: 'Nettverk/sosialt',
      category: 'Dokument',
      quote: 'ikke i kontakt med øvrige tjenester',
      discuss: ['Frank'],
      supports_questions: ['q_kontakt'],
      lift_effects: [
        {
          op: 'reveal_questions',
          args: {
            question_ids: ['q_kontakt'],
          },
        },
      ],
    },
    {
      id: 'f_trygd',
      label: 'Ellings uføretrygd',
      summary: 'Ellings uføretrygd: to mynter i måneden.',
      source_document_id: 'doc_konto',
      domain: 'Økonomi/bolig',
      category: 'Økonomi',
      quote: 'trygden hans — to mynter i måneden. Den kommer den første, og den går rett videre.',
      discuss: ['Frank'],
      supports_questions: ['q_okonomi', 'q_bolig'],
      lift_effects: [
        {
          op: 'reveal_questions',
          args: {
            question_ids: ['q_okonomi'],
          },
        },
      ],
    },
    {
      id: 'f_alt_via_grete',
      label: 'Alt går via Grete',
      summary: 'Hele trygden går rett inn i Gretes system. Alle avtaler står i hennes navn.',
      source_document_id: 'doc_konto',
      domain: 'Økonomi/bolig',
      category: 'Økonomi',
      quote: 'Alle betalinger går gjennom Grete. Alle avtaler står i hennes navn.',
      discuss: ['Frank', 'Grete'],
      supports_questions: ['q_okonomi'],
      lift_effects: [],
    },
    {
      id: 'f_husleie',
      label: 'Husleie betales av Grete',
      summary: 'Husleien er tre mynter og betales av Grete.',
      source_document_id: 'doc_konto',
      domain: 'Økonomi/bolig',
      category: 'Økonomi',
      quote: 'husleien — tre mynter. Den betales kontant til huseieren, av Grete, den første.',
      discuss: ['Frank', 'Grete'],
      supports_questions: ['q_okonomi', 'q_bolig'],
      lift_effects: [
        {
          op: 'reveal_questions',
          args: {
            question_ids: ['q_okonomi', 'q_bolig'],
          },
        },
      ],
    },
    {
      id: 'f_gap',
      label: 'To mynter mangler',
      summary: 'Uten Gretes pensjon mangler husholdet to mynter hver måned.',
      source_document_id: 'doc_konto',
      domain: 'Økonomi/bolig',
      category: 'Økonomi',
      quote: 'Regnestykket går opp — med henne. Uten henne mangler det to mynter. Hver måned.',
      discuss: ['Frank'],
      supports_questions: ['q_okonomi', 'q_bolig'],
      lift_effects: [
        {
          op: 'reveal_questions',
          args: {
            question_ids: ['q_bolig'],
          },
        },
      ],
    },
    {
      id: 'f_ingen_matkjop',
      label: 'Ingen egne matkjøp',
      summary: 'Elling har aldri betalt for mat selv. Mat skjer gjennom Grete.',
      source_document_id: 'doc_konto',
      domain: 'Hverdag/rutine',
      category: 'Økonomi',
      quote: 'Jeg fant ikke ett kjøp som var hans. Ikke ett.',
      discuss: ['Frank'],
      supports_questions: ['q_hverdag'],
      lift_effects: [],
    },
    {
      id: 'f_leie_stoppet',
      label: 'Husleien har stoppet',
      summary: 'Husleien har stoppet. Betalingskjeden døde med Grete.',
      source_document_id: 'doc_huseier',
      domain: 'Økonomi/bolig',
      category: 'Risiko',
      quote: 'Leien for mars er ikke kommet.',
      discuss: ['Frank'],
      supports_questions: ['q_bolig', 'q_kollaps'],
      lift_effects: [
        {
          op: 'reveal_questions',
          args: {
            question_ids: ['q_bolig'],
          },
        },
      ],
    },
    {
      id: 'f_huseier_kommer',
      label: 'Huseieren kommer torsdag',
      summary: 'Huseieren varsler at han kommer innom. Torsdag.',
      source_document_id: 'doc_huseier',
      domain: 'Økonomi/bolig',
      category: 'Risiko',
      quote: 'jeg kommer innom på torsdag, så får vi snakke om veien videre.',
      discuss: ['Frank'],
      supports_questions: ['q_bolig', 'q_kontakt'],
      lift_effects: [],
    },
    {
      id: 'f_leie_privat',
      label: 'Privat leieforhold',
      summary:
        'Leieforholdet er privat og muntlig innarbeidet siden 1971. Ingen kontrakt å lene seg på.',
      source_document_id: 'doc_huseier',
      domain: 'Økonomi/bolig',
      category: 'Dokument',
      quote: 'Din mor og jeg har holdt på siden -71 uten papirer. Det har aldri vært nødvendig.',
      discuss: ['Frank'],
      supports_questions: ['q_bolig'],
      lift_effects: [],
    },
    {
      id: 'f_klarer_seg',
      label: '«Han klarer seg»',
      summary: 'Grete avviser bekymringen. Gjentar formuleringen.',
      source_document_id: 'doc_frank_tlf',
      domain: 'Nettverk/sosialt',
      category: 'Samtale',
      quote: '«Han klarer seg. Han har alltid klart seg.» Hun sa det to ganger.',
      discuss: ['Frank'],
      supports_questions: ['q_hverdag'],
      lift_effects: [
        {
          op: 'reveal_questions',
          args: {
            question_ids: ['q_hverdag'],
          },
        },
      ],
    },
    {
      id: 'f_ingen_plan',
      label: 'Ingen overtakelsesplan',
      summary: 'Det finnes ingen plan for hvem som overtar etter Grete.',
      source_document_id: 'doc_frank_tlf',
      domain: 'Helse/risiko',
      category: 'Samtale',
      quote:
        'Jeg spurte hvem som overtar hvis hun skulle bli innlagt. Det ble stille. Hun svarte ikke på det.',
      discuss: ['Frank', 'Grete'],
      supports_questions: ['q_hverdag', 'q_bolig'],
      lift_effects: [],
    },
    {
      id: 'f_elling_tlf',
      label: 'Elling tar ikke telefonen',
      summary: 'Elling tar ikke telefonen. Grete normaliserer det.',
      source_document_id: 'doc_frank_tlf',
      domain: 'Nettverk/sosialt',
      category: 'Samtale',
      quote:
        'Jeg ba om å få hilse på Elling i telefonen. Hun sa han ikke tar telefonen. «Det er ikke noe galt med ham. Han liker bare ikke apparatet.»',
      discuss: ['Frank', 'Grete'],
      supports_questions: ['q_kontakt'],
      lift_effects: [
        {
          op: 'reveal_questions',
          args: {
            question_ids: ['q_kontakt'],
          },
        },
      ],
    },
    {
      id: 'f_grete_redd',
      label: 'Grete er redd',
      summary: 'Grete frykter at kommunen vil ta leiligheten — eller Elling.',
      source_document_id: 'doc_frank_tlf',
      domain: 'Nettverk/sosialt',
      category: 'Samtale',
      quote: 'spurte hun om dette betydde at noen kom til å ta ham fra leiligheten',
      discuss: ['Frank'],
      supports_questions: ['q_bolig'],
      lift_effects: [],
    },
    {
      id: 'f_post',
      label: 'Uåpnet post',
      summary: 'Uåpnet post samler seg. Grete håndterer den — og skjuler den.',
      source_document_id: 'doc_frank_visit',
      domain: 'Hverdag/rutine',
      category: 'Observasjon',
      quote:
        'en bunke uåpnet post på skoskapet. Øverst: Trygdekontoret, sosialkontoret, Oslo Energi.',
      discuss: ['Frank'],
      supports_questions: ['q_hverdag', 'q_okonomi'],
      lift_effects: [],
    },
    {
      id: 'f_kalender',
      label: 'Gretes kalender',
      summary: 'Kalenderen føres av Grete. Avtaler finnes bare så lenge hun fører dem.',
      source_document_id: 'doc_frank_visit',
      domain: 'Hverdag/rutine',
      category: 'Observasjon',
      quote: 'kalender. Alle avtaler ført med samme håndskrift. Det er ikke Ellings.',
      discuss: ['Frank'],
      supports_questions: ['q_hverdag'],
      lift_effects: [],
    },
    {
      id: 'f_matbokser',
      label: 'Preppede matbokser',
      summary: 'Maten er preppet av Grete, merket med ukedager. Elling varmer.',
      source_document_id: 'doc_frank_visit',
      domain: 'Hverdag/rutine',
      category: 'Observasjon',
      quote: 'middagsbokser merket med ukedager, mandag til søndag.',
      discuss: ['Frank', 'Grete'],
      supports_questions: ['q_hverdag', 'q_selv'],
      lift_effects: [
        {
          op: 'reveal_questions',
          args: {
            question_ids: ['q_selv'],
          },
        },
      ],
    },
    {
      id: 'f_bok',
      label: 'Bok med notater',
      summary: 'Elling leser krevende stoff og noterer systematisk. Konsentrasjonen er en ressurs.',
      source_document_id: 'doc_frank_visit',
      domain: 'Ressurser',
      category: 'Ressurs',
      quote: 'en bok om polarekspedisjoner. Han noterte i margen. Systematisk, små bokstaver.',
      discuss: ['Frank'],
      supports_questions: ['q_selv'],
      lift_effects: [
        {
          op: 'reveal_questions',
          args: {
            question_ids: ['q_selv'],
          },
        },
      ],
    },
    {
      id: 'f_utklipp',
      label: 'Avisutklipp-arkiv',
      summary:
        'Elling samler og systematiserer: utklipp av Gro og Arbeiderpartiet, datert og ordnet.',
      source_document_id: 'doc_frank_visit',
      domain: 'Ressurser',
      category: 'Ressurs',
      quote:
        'avisutklipp, sirlig montert. Gro, landsmøter, 1. mai-tog. Årstall i hjørnene, hans håndskrift.',
      discuss: ['Frank'],
      supports_questions: ['q_selv'],
      lift_effects: [
        {
          op: 'reveal_questions',
          args: {
            question_ids: ['q_selv'],
          },
        },
      ],
    },
    {
      id: 'f_avstand',
      label: 'Holder avstand',
      summary: 'Elling holder avstand til fremmede. Alltid et møbel mellom.',
      source_document_id: 'doc_frank_visit',
      domain: 'Nettverk/sosialt',
      category: 'Observasjon',
      quote: 'Han forlot ikke rommet, men flyttet seg slik at det alltid var et møbel mellom oss.',
      discuss: ['Frank'],
      supports_questions: ['q_kontakt', 'q_selv'],
      lift_effects: [
        {
          op: 'reveal_questions',
          args: {
            question_ids: ['q_kontakt'],
          },
        },
      ],
    },
    {
      id: 'f_smart_gutt',
      label: '«En smart gutt»',
      summary: 'Grete omtaler Elling (35) som «gutt». Rollene er fastlåst.',
      source_document_id: 'doc_frank_visit',
      domain: 'Nettverk/sosialt',
      category: 'Samtale',
      quote: '«Du så hvordan han er. Han er en smart gutt.»',
      discuss: ['Frank'],
      supports_questions: ['q_hverdag', 'q_selv'],
      lift_effects: [],
    },
    {
      id: 'f_innlagt',
      label: 'Grete innlagt',
      summary: 'Grete er akutt innlagt på Ullevål.',
      source_document_id: 'doc_innleggelse',
      domain: 'Helse/risiko',
      category: 'Dokument',
      quote: 'innlagt akutt 14.02',
      discuss: ['Frank'],
      supports_questions: ['q_hverdag', 'q_bolig'],
      lift_effects: [],
    },
    {
      id: 'f_elling_uvarslet',
      label: 'Elling uvarslet',
      summary: 'Elling vet ikke at Grete er innlagt. Hun ber kommunen se til ham.',
      source_document_id: 'doc_innleggelse',
      domain: 'Helse/risiko',
      category: 'Dokument',
      quote: 'Pasienten oppgir at sønnen ikke er varslet. Hun ber om at kommunen ser til ham.',
      discuss: ['Frank'],
      supports_questions: ['q_kontakt', 'q_kollaps'],
      lift_effects: [],
    },
    {
      id: 'f_dod',
      label: 'Grete er død',
      summary: 'Grete Olsen døde 15.02 kl. 04:12.',
      source_document_id: 'doc_dodsfall',
      domain: 'Helse/risiko',
      category: 'Dokument',
      quote: 'Dødsfall konstatert 15.02 kl. 04:12.',
      discuss: ['Frank'],
      supports_questions: ['q_kollaps'],
      lift_effects: [
        {
          op: 'reveal_questions',
          args: {
            question_ids: ['q_kollaps'],
          },
        },
      ],
    },
    {
      id: 'f_brevsprekken',
      label: 'Beskjed gjennom brevsprekken',
      summary: 'Dødsbudskapet ble gitt gjennom brevsprekken. Døren forble lukket.',
      source_document_id: 'doc_dodsfall',
      domain: 'Nettverk/sosialt',
      category: 'Dokument',
      quote:
        'Politiet bisto ved varsling på bopel. Sønnen åpnet ikke døren. Beskjeden ble gitt gjennom brevsprekken.',
      discuss: ['Frank'],
      supports_questions: ['q_kontakt', 'q_kollaps'],
      lift_effects: [],
    },
  ],
  questions: [
    {
      id: 'q_okonomi',
      prompt: 'Hvem holder økonomien i gang?',
      reveal_when: {
        op: 'all',
        children: [
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_grete_baerer',
            },
          },
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_trygd',
            },
          },
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_husleie',
            },
          },
        ],
      },
    },
    {
      id: 'q_bolig',
      prompt: 'Kan Elling bli boende når Grete ikke lenger bærer hverdagen?',
      reveal_when: {
        op: 'all',
        children: [
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_gap',
            },
          },
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_leie_stoppet',
            },
          },
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_husleie',
            },
          },
        ],
      },
    },
    {
      id: 'q_hverdag',
      prompt: 'Hva bærer Grete i hverdagen — og hva skjer når hun ikke kan?',
      reveal_when: {
        op: 'all',
        children: [
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_grete_baerer',
            },
          },
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_klarer_seg',
            },
          },
        ],
      },
    },
    {
      id: 'q_selv',
      prompt: 'Hva kan Elling lære seg, med riktig stillas?',
      reveal_when: {
        op: 'all',
        children: [
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_bok',
            },
          },
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_utklipp',
            },
          },
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_matbokser',
            },
          },
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_aldri_alene',
            },
          },
        ],
      },
    },
    {
      id: 'q_kontakt',
      prompt: 'Hvordan når kommunen Elling uten Grete?',
      reveal_when: {
        op: 'all',
        children: [
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_elling_tlf',
            },
          },
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_avstand',
            },
          },
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_ingen_tjenester',
            },
          },
        ],
      },
    },
    {
      id: 'q_kollaps',
      prompt: 'Hva kollapser først nå?',
      reveal_when: {
        op: 'fact_lifted',
        args: {
          fact_id: 'f_dod',
        },
      },
    },
  ],
  hypotheses: [
    {
      id: 'h_ok_grete',
      title: 'Grete bærer betalingskjeden.',
      summary:
        'Husleie og faste betalinger fungerer gjennom Gretes system — skoesken, postgiroene, kontantene den første. Systemet har én operatør.',
      question_id: 'q_okonomi',
      availability: {
        op: 'all',
        children: [
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_husleie',
            },
          },
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_alt_via_grete',
            },
          },
        ],
      },
      opening_sources: [
        {
          op: 'open_tiltak',
          args: {
            tiltak_ids: ['t_forvaltning'],
          },
        },
      ],
    },
    {
      id: 'h_ok_unngaar',
      title: 'Elling forstår økonomien, men unngår post.',
      summary:
        'Kapasiteten til å forstå er observert. Papiret når likevel aldri frem til en vurdering, fordi konvolutten aldri åpnes. Problemet er kanal, ikke forståelse.',
      question_id: 'q_okonomi',
      availability: {
        op: 'all',
        children: [
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_post',
            },
          },
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_bok',
            },
          },
        ],
      },
      opening_sources: [
        {
          op: 'open_tiltak',
          args: {
            tiltak_ids: ['t_dokgjennomgang'],
          },
        },
      ],
    },
    {
      id: 'h_ok_gap',
      title: 'Trygden dekker ikke boligen uten Gretes pensjon.',
      summary:
        'Ellings trygd er to mynter. Boligen koster tre. Differansen bæres i dag av Gretes pensjon. Bortfall gir umiddelbar restanserisiko.',
      question_id: 'q_okonomi',
      availability: {
        op: 'fact_lifted',
        args: {
          fact_id: 'f_gap',
        },
      },
      opening_sources: [
        {
          op: 'open_tiltak',
          args: {
            tiltak_ids: ['t_bostotte'],
          },
        },
        {
          op: 'open_dispatches',
          args: {
            dispatch_ids: ['d_konto'],
          },
        },
      ],
    },
    {
      id: 'h_b_sikres',
      title: 'Boligen kan sikres — med bostøtte og ordnet betalingskjede.',
      summary:
        'Med bostøtte og en ordnet betalingskjede kan leieforholdet videreføres. Forutsetter at søknaden fremmes før restansen blir en sak.',
      question_id: 'q_bolig',
      availability: {
        op: 'all',
        children: [
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_gap',
            },
          },
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_trygd',
            },
          },
        ],
      },
      opening_sources: [
        {
          op: 'open_tiltak',
          args: {
            tiltak_ids: ['t_bostotte', 't_forvaltning'],
          },
        },
      ],
    },
    {
      id: 'h_b_flytte',
      title: 'Boligen kan ikke holdes. Flytting bør forberedes nå.',
      summary:
        'Leieforholdet er privat, muntlig og uten vern. Vurderingen er at alternativ bolig bør kartlegges før huseieren tvinger frem en akutt løsning.',
      question_id: 'q_bolig',
      availability: {
        op: 'all',
        children: [
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_gap',
            },
          },
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_leie_privat',
            },
          },
        ],
      },
      opening_sources: [
        {
          op: 'open_tiltak',
          args: {
            tiltak_ids: ['t_huseier'],
          },
        },
      ],
    },
    {
      id: 'h_b_uavklart',
      title: 'Uavklart — økonomien må kartlegges først.',
      summary:
        'Saken mangler økonomisk grunnlag for en boligvurdering. Be Frank lage en økonomisk oversikt.',
      question_id: 'q_bolig',
      availability: {
        op: 'all',
        children: [],
      },
      opening_sources: [],
    },
    {
      id: 'h_h_infra',
      title: 'Grete er usynlig infrastruktur: mat, kalender, post, kontakt.',
      summary:
        'Husholdets funksjoner — mat, avtaler, post, kontakt med tjenester — utføres i dag av mor. Funksjonene er ikke dokumentert noe sted og overlever ikke bortfall uten overføring.',
      question_id: 'q_hverdag',
      availability: {
        op: 'all',
        children: [
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_kalender',
            },
          },
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_matbokser',
            },
          },
        ],
      },
      opening_sources: [
        {
          op: 'open_tiltak',
          args: {
            tiltak_ids: ['t_hjemmehjelp', 't_matlevering'],
          },
        },
        {
          op: 'open_dispatches',
          args: {
            dispatch_ids: ['d_ring_grete'],
          },
        },
      ],
    },
    {
      id: 'h_h_kanmer',
      title: 'Elling klarer mer enn det ser ut. Grete har bare alltid gjort det først.',
      summary:
        'Observert kapasitet — konsentrasjon, arkiv, system — tilsier at funksjoner er trenbare. Ikke testet. Grete har aldri latt det bli testet.',
      question_id: 'q_hverdag',
      availability: {
        op: 'all',
        children: [
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_bok',
            },
          },
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_utklipp',
            },
          },
        ],
      },
      opening_sources: [
        {
          op: 'open_tiltak',
          args: {
            tiltak_ids: ['t_brev'],
          },
        },
      ],
    },
    {
      id: 'h_h_system',
      title: 'Husholdet fungerer bare som system med to.',
      summary:
        'Husholdet er bygget som ett system med to roller. Den ene rollen faller bort. Systemet er ikke vurdert for én.',
      question_id: 'q_hverdag',
      availability: {
        op: 'all',
        children: [
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_matbokser',
            },
          },
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_ingen_matkjop',
            },
          },
        ],
      },
      opening_sources: [
        {
          op: 'open_tiltak',
          args: {
            tiltak_ids: ['t_hjemmehjelp'],
          },
        },
      ],
    },
    {
      id: 'h_s_trenbar',
      title: 'Konsentrasjonen er sterk. Rutiner kan trenes — én om gangen.',
      summary:
        'Kapasitet til fordypning og system er observert. Avgrensede rutiner kan bygges med støtte — lavt tempo, fast person, hans eget arkivspråk.',
      question_id: 'q_selv',
      availability: {
        op: 'fact_lifted',
        args: {
          fact_id: 'f_bok',
        },
      },
      opening_sources: [
        {
          op: 'open_tiltak',
          args: {
            tiltak_ids: ['t_brev', 't_regning'],
          },
        },
      ],
    },
    {
      id: 'h_s_formell',
      title: 'Ferdighetene er der ikke. Formell støtte må bære alt.',
      summary:
        'Funksjonsnivået vurderes som for lavt for egenmestring. Tjenestene må dimensjoneres for full kompensasjon.',
      question_id: 'q_selv',
      availability: {
        op: 'fact_lifted',
        args: {
          fact_id: 'f_saarbar',
        },
      },
      opening_sources: [
        {
          op: 'open_tiltak',
          args: {
            tiltak_ids: ['t_institusjon'],
          },
        },
      ],
    },
    {
      id: 'h_s_ukjent',
      title: 'Vet ikke — før noe er prøvd med støtte.',
      summary:
        'Kommunen har ingen observasjon av Elling i en mestringssituasjon. Vurdering uten utprøving vil være gjetning.',
      question_id: 'q_selv',
      availability: {
        op: 'all',
        children: [],
      },
      opening_sources: [
        {
          op: 'open_tiltak',
          args: {
            tiltak_ids: ['t_brev'],
          },
        },
      ],
    },
    {
      id: 'h_k_oppmote',
      title: 'Telefonen er stengt kanal. Fast person og oppmøte kan virke.',
      summary:
        'Fasttelefonen vurderes som uegnet kanal. Kontakt bør bygges gjennom én fast person med forutsigbart oppmøte. Tempoet settes av Elling.',
      question_id: 'q_kontakt',
      availability: {
        op: 'all',
        children: [
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_elling_tlf',
            },
          },
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_avstand',
            },
          },
        ],
      },
      opening_sources: [
        {
          op: 'open_tiltak',
          args: {
            tiltak_ids: ['t_hjemmehjelp'],
          },
        },
      ],
    },
    {
      id: 'h_k_skriftlig',
      title: 'All kontakt må gå skriftlig.',
      summary:
        'Skriftlig kanal forutsetter at post åpnes. Det er ikke sannsynliggjort. Kanalen kan være riktig på sikt, men er i dag like stengt som telefonen.',
      question_id: 'q_kontakt',
      availability: {
        op: 'fact_lifted',
        args: {
          fact_id: 'f_post',
        },
      },
      opening_sources: [
        {
          op: 'open_tiltak',
          args: {
            tiltak_ids: ['t_dokgjennomgang'],
          },
        },
      ],
    },
    {
      id: 'h_k_via_grete',
      title: 'Kontakt må gå via Grete så lenge hun lever.',
      summary:
        'Grete er i dag eneste fungerende kanal inn. Vedtaket bør merke seg at denne kanalen har kort forventet varighet.',
      question_id: 'q_kontakt',
      availability: {
        op: 'fact_lifted',
        args: {
          fact_id: 'f_klarer_seg',
        },
      },
      opening_sources: [],
    },
    {
      id: 'h_c_penger',
      title: 'Økonomien. Husleien stopper denne måneden.',
      summary:
        'Betalingskjeden lå i Gretes skoeske og hukommelse. Den opphørte 15.02. Restanse løper fra første forfall.',
      question_id: 'q_kollaps',
      availability: {
        op: 'fact_lifted',
        args: {
          fact_id: 'f_gap',
        },
      },
      opening_sources: [
        {
          op: 'open_tiltak',
          args: {
            tiltak_ids: ['t_forvaltning', 't_huseier'],
          },
        },
      ],
    },
    {
      id: 'h_c_mat',
      title: 'Maten. Boksene i kjøleskapet tar slutt om dager.',
      summary:
        'Matforsyningen var preppet uke for uke. Siste leveranse skjedde før innleggelsen. Det finnes ingen neste.',
      question_id: 'q_kollaps',
      availability: {
        op: 'fact_lifted',
        args: {
          fact_id: 'f_matbokser',
        },
      },
      opening_sources: [
        {
          op: 'open_tiltak',
          args: {
            tiltak_ids: ['t_matlevering'],
          },
        },
      ],
    },
    {
      id: 'h_c_kontakt',
      title: 'Kontakten. Uten kanal inn er alt annet teori.',
      summary:
        'Kommunen har per i dag ingen bekreftet kanal til Elling. Tiltak uten kanal er vedtak på papir.',
      question_id: 'q_kollaps',
      availability: {
        op: 'fact_lifted',
        args: {
          fact_id: 'f_brevsprekken',
        },
      },
      opening_sources: [
        {
          op: 'open_tiltak',
          args: {
            tiltak_ids: ['t_hjemmehjelp'],
          },
        },
      ],
    },
    {
      id: 'h_press_institusjon',
      title: 'Press: institusjonsvurdering kan alltid utløses.',
      summary:
        'Pseudo-hypotese som gir institusjonsvurderingen et hjem. Pressmiddelet er alltid tilgjengelig — sårbarheten alene er nok til å vurdere det — men det er aldri automatisk riktig.',
      question_id: 'q_selv',
      availability: {
        op: 'fact_lifted',
        args: {
          fact_id: 'f_saarbar',
        },
      },
      opening_sources: [
        {
          op: 'open_tiltak',
          args: {
            tiltak_ids: ['t_institusjon'],
          },
        },
      ],
    },
  ],
  tiltak: [
    {
      id: 't_bostotte',
      title: 'Søk bostøtte',
      sim_hook_id: 'case.olsen.tiltak.bostotte',
      slot: 's1',
      cost: 0,
      description: 'Husbanken. Krever dokumentert inntekt og husleie. Saksbehandlingstid.',
    },
    {
      id: 't_forvaltning',
      title: 'Frivillig forvaltning av faste betalinger',
      sim_hook_id: 'case.olsen.tiltak.forvaltning',
      slot: 's1',
      cost: 1,
      description: 'Kommunen overtar skoesken. Trygt. Bygger ingenting.',
    },
    {
      id: 't_huseier',
      title: 'Snakk med huseieren',
      sim_hook_id: 'case.olsen.tiltak.garanti',
      slot: 's1',
      cost: 0,
      description:
        'Bakkerud vil vite hvem han skal forholde seg til. La det bli Frank — ikke torsdagsbesøket.',
    },
    {
      id: 't_hjemmehjelp',
      title: 'Hjemmehjelp 2× uke — Frank',
      sim_hook_id: 'case.olsen.tiltak.channel',
      slot: 's2',
      cost: 2,
      description: 'Fast person, fast tid. Den eneste kanalen inn som har virket hittil.',
    },
    {
      id: 't_matlevering',
      title: 'Matombringing',
      sim_hook_id: 'case.olsen.tiltak.food',
      slot: 's2',
      cost: 1,
      description: 'Bokser på døren, tre dager i uken. Forutsetter at døren er en kanal.',
    },
    {
      id: 't_dokgjennomgang',
      title: 'Fast dokumentgjennomgang',
      sim_hook_id: 'case.olsen.tiltak.dok',
      slot: 's2',
      cost: 1,
      description: 'Frank går gjennom posten ukentlig. Papiret når frem til en vurdering.',
    },
    {
      id: 't_brev',
      title: 'Åpne ett brev sammen med Frank',
      sim_hook_id: 'case.olsen.tiltak.brev',
      slot: 's3',
      cost: 0,
      description: 'Ett brev. Ikke bunken. Frank legger det på bordet og venter.',
    },
    {
      id: 't_regning',
      title: 'Betal én regning med støtte',
      sim_hook_id: 'case.olsen.tiltak.regning',
      slot: 's3',
      cost: 0,
      description: 'Én regning, én gang. Målet er at det har skjedd, ikke at det er lært.',
    },
    {
      id: 't_institusjon',
      title: 'Institusjonsvurdering / omsorgsbolig',
      sim_hook_id: 'case.olsen.tiltak.institusjon',
      slot: 'press',
      cost: 0,
      description:
        'Bureaukratisk lesbart. Trygt på papiret. Leiligheten blir i så fall et avsluttet kapittel.',
    },
  ],
  dispatches: [
    {
      id: 'd_ring_grete',
      title: 'Ring Grete',
      sim_hook_id: 'case.olsen.dispatch.call_grete',
      description: 'Førstekontakt. Hun vet hvorfor du ringer.',
      gate: {
        op: 'all',
        children: [
          {
            op: 'hypothesis_chosen',
            args: {
              hypothesis_id: 'h_h_infra',
            },
          },
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_grete_baerer',
            },
          },
        ],
      },
      effects: [
        {
          op: 'set_scenario_stage',
          args: {
            stage: 1,
          },
        },
      ],
    },
    {
      id: 'd_konto',
      title: 'Be om økonomisk oversikt',
      sim_hook_id: 'case.olsen.dispatch.account_overview',
      description: 'Frank setter seg ved kjøkkenbordet med Grete og skoesken. Tar en dag.',
      gate: {
        op: 'all',
        children: [
          {
            op: 'hypothesis_chosen',
            args: {
              hypothesis_id: 'h_ok_gap',
            },
          },
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_gap',
            },
          },
        ],
      },
      effects: [
        {
          op: 'queue_pending_document',
          args: {
            clock_id: 'ck_overfort',
            document_id: 'pending_konto_overfort',
            delay_days: 1,
          },
        },
      ],
    },
  ],
  clocks: [
    {
      id: 'ck_overfort',
      label: 'Kontooversikt til neste dag',
      sim_hook_id: 'case.olsen.clock.account_overview',
      question: 'Er funksjonene hun bar identifisert og flyttet?',
      good_segment_label: 'Funksjoner overført',
      good_segment_size: 6,
      bad_segment_label: 'Alt går via Grete',
      bad_segment_size: 6,
    },
    {
      id: 'ck_selvstendighet',
      label: 'Skjør rutine',
      sim_hook_id: 'case.olsen.clock.rutine',
      question: 'Tåler én rutine å bli båret av Elling, med stillas?',
      good_segment_label: 'Tar imot og håndterer',
      good_segment_size: 4,
      bad_segment_label: 'Presset for hardt',
      bad_segment_size: 4,
    },
    {
      id: 'ck_omsorgssvikt',
      label: 'Omsorgen svikter',
      sim_hook_id: 'case.olsen.clock.neglect',
      question: 'Blir leveringene stående urørt utenfor døren?',
      good_segment_label: '',
      good_segment_size: 4,
      bad_segment_label: 'Levering blir stående',
      bad_segment_size: 4,
    },
    {
      id: 'ck_bostotte',
      label: 'Bostøtte sak',
      sim_hook_id: 'case.olsen.clock.bostotte',
      question: 'Kan kommunen skape et lovlig grunnlag for at husleien kan betales?',
      good_segment_label: 'Søknad komplett',
      good_segment_size: 4,
      bad_segment_label: 'Frist glipper',
      bad_segment_size: 4,
      visibility: {
        op: 'hypothesis_chosen',
        args: {
          hypothesis_id: 'h_b_sikres',
        },
      },
    },
  ],
  event_delta_specs: [
    {
      event_type: 'grete_received',
      log_text: 'Grete tok imot leveringen ved døren.',
      clock_id: '',
      clock_direction: 0,
      reveal_fact_id: '',
    },
    {
      event_type: 'delivery_taken_in',
      log_text: 'Elling åpnet selv og tok leveringen inn.',
      clock_id: 'ck_selvstendighet',
      clock_direction: 1,
      reveal_fact_id: '',
    },
    {
      event_type: 'delivery_unanswered',
      log_text: 'Leveringen ble stående urørt utenfor døren.',
      clock_id: 'ck_omsorgssvikt',
      clock_direction: 1,
      reveal_fact_id: '',
    },
  ],
  day_script_beats: [],
} as const;
