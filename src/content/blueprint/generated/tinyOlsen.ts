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
    title: 'Bekymringsmelding',
    register: 'klinisk',
    peek: 'Bekymringsmelding Dr. J. Haug',
    meta: 'LEGESENTERET DR. J. HAUG, 11.02.1999',
    blocks: [
      {
        id: 'doc_bekymring_p1',
        runs: [
          {
            text: 'Under behandling av pasient Grete Olsen (f. 1927) for en ',
          },
          {
            text: 'sykdom med kort forventet forløp',
            factId: 'f_grete_syk',
          },
          {
            text: ' kommer det frem at hun er ',
          },
          {
            text: 'primær omsorgsperson',
            factId: 'f_saarbar',
          },
          {
            text: ' for sin sønn Elling Olsen (f. 14.03.1964). Omfanget er ikke kartlagt, men han kan ha behov for støtte ved mors bortfall. ',
          },
        ],
      },
      {
        id: 'doc_bekymring_p2',
        runs: [
          {
            text: 'Med hilsen\nJørgen Haug\nspes. allmennmedisin',
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
    meta: 'ØKONOMISK OVERSIKT · 4012 F. ÅSLI · GJENNOMGÅTT MED G. OLSEN VED KJØKKENBORDET',
    blocks: [
      {
        id: 'doc_konto_p1',
        runs: [
          {
            text: 'Grete fant frem alt. Postgiroene ligger i en skoeske, ferdig utfylt, sortert på forfall.',
          },
        ],
      },
      {
        id: 'doc_konto_p2',
        runs: [
          {
            text: 'Inn: ',
          },
          {
            text: 'trygden hans — 2 [icon=coin] i måneden. Den kommer den første, og den går rett videre.',
            factId: 'f_trygd',
          },
          {
            text: ' Pensjonen hennes: 3 [icon=coin].',
          },
        ],
      },
      {
        id: 'doc_konto_p3',
        runs: [
          {
            text: 'Ut: ',
          },
          {
            text: 'husleien — 3 [icon=coin]. Den betales kontant til huseieren, av Grete, den første.',
            factId: 'f_husleie',
          },
          {
            text: ' Strøm, mat og resten: 2 [icon=coin] til sammen.',
          },
        ],
      },
      {
        id: 'doc_konto_p4',
        runs: [
          {
            text: 'Alle betalinger går gjennom Grete. Alle avtaler står i hennes navn.',
            factId: 'f_alt_via_grete',
          },
          {
            text: ' Jeg spurte om Elling visste hvor skoesken sto. Hun lo, kort.',
          },
        ],
      },
      {
        id: 'doc_konto_p5',
        runs: [
          {
            text: 'Jeg gikk gjennom kvitteringene. ',
          },
          {
            text: 'Jeg fant ikke ett kjøp som var hans. Ikke ett.',
            factId: 'f_ingen_matkjop',
          },
        ],
      },
      {
        id: 'doc_konto_p6',
        runs: [
          {
            text: 'Regnestykket går opp — med henne. Uten henne mangler det 2 [icon=coin]. Hver måned.',
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
    meta: 'PAPIRGJENNOMGANG · 4012 F. ÅSLI · ETTER DØDSFALLET · MED ELLING I ROMMET',
    blocks: [
      {
        id: 'doc_papirer_p1',
        runs: [
          {
            text: 'Skoesken sto der hun forlot den. Postgiroene ferdig utfylt, sortert på forfall. Den øverste gjelder mars. Den er ikke levert.',
          },
        ],
      },
      {
        id: 'doc_papirer_p2',
        runs: [
          {
            text: 'Inn: ',
          },
          {
            text: 'trygden hans — 2 [icon=coin] i måneden.',
            factId: 'f_trygd',
          },
          {
            text: ' Pensjonen hennes er opphørt.',
          },
        ],
      },
      {
        id: 'doc_papirer_p3',
        runs: [
          {
            text: 'Ut: ',
          },
          {
            text: 'husleien — 3 [icon=coin]. Den ble betalt kontant til huseieren, av Grete, den første.',
            factId: 'f_husleie',
          },
        ],
      },
      {
        id: 'doc_papirer_p4',
        runs: [
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
        ],
      },
      {
        id: 'doc_papirer_p5',
        runs: [
          {
            text: 'Regnestykket gikk opp — med henne. Nå mangler det 2 [icon=coin]. Hver måned.',
            factId: 'f_gap',
          },
        ],
      },
      {
        id: 'doc_papirer_p6',
        runs: [
          {
            text: 'Elling satt ved bordet mens jeg gikk gjennom esken. Han rettet på bunkene da jeg la dem fra meg. Han visste rekkefølgen.',
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
        id: 'doc_huseier_p1',
        runs: [
          {
            text: 'Til Elling Olsen.',
          },
        ],
      },
      {
        id: 'doc_huseier_p2',
        runs: [
          {
            text: 'Jeg hører at din mor er gått bort. Kondolerer. Grete var et ordensmenneske, det har vært en glede å ha dere i oppgangen.',
          },
        ],
      },
      {
        id: 'doc_huseier_p3',
        runs: [
          {
            text: 'Jeg må likevel skrive om det praktiske. ',
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
            text: ' Nå vet jeg ikke hvem jeg skal forholde meg til.',
          },
        ],
      },
      {
        id: 'doc_huseier_p4',
        runs: [
          {
            text: 'Jeg vil ikke lage vanskeligheter. Men ',
          },
          {
            text: 'jeg kommer innom på torsdag, så får vi snakke om veien videre.',
            factId: 'f_huseier_kommer',
          },
        ],
      },
      {
        id: 'doc_huseier_p5',
        runs: [
          {
            text: 'Vennlig hilsen\nT. Bakkerud',
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
    meta: 'FELTNOTAT · 4012 F. ÅSLI · TLF. G. OLSEN',
    blocks: [
      {
        id: 'doc_frank_tlf_p1',
        runs: [
          {
            text: 'Ringte Grete 11:40. Hun tok den på andre forsøk.',
          },
        ],
      },
      {
        id: 'doc_frank_tlf_p2',
        runs: [
          {
            text: 'Hun visste hvorfor jeg ringte. Haug hadde sagt fra. Hun var ikke sint, men hun var klar: ',
          },
          {
            text: '«Han klarer seg. Han har alltid klart seg.» Hun sa det to ganger.',
            factId: 'f_klarer_seg',
          },
          {
            text: ' Andre gangen lavere.',
          },
        ],
      },
      {
        id: 'doc_frank_tlf_p3',
        runs: [
          {
            text: 'Jeg spurte hvem som overtar hvis hun skulle bli innlagt. Det ble stille. Hun svarte ikke på det.',
            factId: 'f_ingen_plan',
          },
        ],
      },
      {
        id: 'doc_frank_tlf_p4',
        runs: [
          {
            text: 'Jeg ba om å få hilse på Elling i telefonen. Hun sa han ikke tar telefonen. «Det er ikke noe galt med ham. Han liker bare ikke apparatet.»',
            factId: 'f_elling_tlf',
          },
        ],
      },
      {
        id: 'doc_frank_tlf_p5',
        runs: [
          {
            text: 'Mot slutten ',
          },
          {
            text: 'spurte hun om dette betydde at noen kom til å ta ham fra leiligheten',
            factId: 'f_grete_redd',
          },
          {
            text: '. Jeg sa nei. Jeg håper det var sant.',
          },
        ],
      },
      {
        id: 'doc_frank_tlf_p6',
        runs: [
          {
            text: 'Hun gikk med på hjemmebesøk. «Hvis det må til.» Det må til.',
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
    meta: 'HJEMMEBESØK · 4012 F. ÅSLI',
    blocks: [
      {
        id: 'doc_frank_visit_p1',
        runs: [
          {
            text: 'Grete åpnet før jeg fikk ringt på. Hun hadde dekket på med tre kopper. Elling brukte ikke sin.',
          },
        ],
      },
      {
        id: 'doc_frank_visit_p2',
        runs: [
          {
            text: 'I gangen: ',
          },
          {
            text: 'en bunke uåpnet post på skoskapet. Øverst: Trygdekontoret, sosialkontoret, Oslo Energi.',
            factId: 'f_post',
          },
          {
            text: ' Grete flyttet bunken da hun så at jeg så.',
          },
        ],
      },
      {
        id: 'doc_frank_visit_p3',
        runs: [
          {
            text: 'Elling satt i stuen med ',
          },
          {
            text: 'en bok om polarekspedisjoner. Han noterte i margen. Systematisk, små bokstaver.',
            factId: 'f_bok',
          },
          {
            text: ' Jeg spurte om Nansen. Han svarte med tre presise setninger. Til veggen, ikke til meg.',
          },
        ],
      },
      {
        id: 'doc_frank_visit_p4',
        runs: [
          {
            text: 'Over skrivebordet hans: ',
          },
          {
            text: 'avisutklipp, sirlig montert. Gro, landsmøter, 1. mai-tog. Årstall i hjørnene, hans håndskrift.',
            factId: 'f_utklipp',
          },
          {
            text: ' Det er ikke rot. Det er et arkiv.',
          },
        ],
      },
      {
        id: 'doc_frank_visit_p5',
        runs: [
          {
            text: 'Han forlot ikke rommet, men flyttet seg slik at det alltid var et møbel mellom oss.',
            factId: 'f_avstand',
          },
          {
            text: ' Ikke demonstrativt. Bare slik det ble.',
          },
        ],
      },
      {
        id: 'doc_frank_visit_p6',
        runs: [
          {
            text: 'Grete fulgte meg ut. I trappen sa hun: ',
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
        id: 'doc_innleggelse_p1',
        runs: [
          {
            text: 'MELDING OM INNLEGGELSE',
          },
        ],
      },
      {
        id: 'doc_innleggelse_p2',
        runs: [
          {
            text: 'Grete Olsen (f. 1927) ble ',
          },
          {
            text: 'innlagt akutt 14.02',
            factId: 'f_innlagt',
          },
          {
            text: ', kl. 06:50. Tilstanden er alvorlig, men avklart. Pårørende: sønn, Elling Olsen.',
          },
        ],
      },
      {
        id: 'doc_innleggelse_p3',
        runs: [
          {
            text: 'Pasienten oppgir at sønnen ikke er varslet. Hun ber om at kommunen ser til ham.',
            factId: 'f_elling_uvarslet',
          },
          {
            text: ' Hun var tydelig på dette før hun ble lagt i behandling.',
          },
        ],
      },
      {
        id: 'doc_innleggelse_p4',
        runs: [
          {
            text: 'SOSIALMEDISINSK ENHET · OUS',
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
        id: 'doc_dodsfall_p1',
        runs: [
          {
            text: 'MELDING OM DØDSFALL',
          },
        ],
      },
      {
        id: 'doc_dodsfall_p2',
        runs: [
          {
            text: 'Grete Olsen, f. 21.09.1927. ',
          },
          {
            text: 'Dødsfall konstatert 15.02 kl. 04:12.',
            factId: 'f_dod',
          },
        ],
      },
      {
        id: 'doc_dodsfall_p3',
        runs: [
          {
            text: 'Avdødes sønn er eneste nærmeste pårørende. Varsling ble forsøkt per telefon uten svar. ',
          },
          {
            text: 'Politiet bisto ved varsling på bopel. Sønnen åpnet ikke døren. Beskjeden ble gitt gjennom brevsprekken.',
            factId: 'f_brevsprekken',
          },
        ],
      },
      {
        id: 'doc_dodsfall_p4',
        runs: [
          {
            text: 'Saken overføres kommunen for videre oppfølging av gjenlevende.',
          },
        ],
      },
      {
        id: 'doc_dodsfall_p5',
        runs: [
          {
            text: 'SOSIALMEDISINSK ENHET · OUS',
          },
        ],
      },
    ],
  },
  doc_status: {
    id: 'doc_status',
    kind: 'STATUSRAPPORT',
    title: 'Frank · status dag 8',
    register: 'notat',
    peek: 'En uke siden meldingen.',
    meta: 'STATUSRAPPORT · 4012 F. ÅSLI · DAG 8',
    blocks: [
      {
        id: 'doc_status_p1',
        runs: [
          {
            text: 'Det foreligger ikke iverksatte tiltak som dekker bolig eller hverdag.',
          },
        ],
      },
      {
        id: 'doc_status_p2',
        runs: [
          {
            text: 'Restanse bygges. Posten vokser. Døren er lukket. Kommunen vet nå svært mye om Elling Olsen, og når ham ikke.',
          },
        ],
      },
      {
        id: 'doc_status_p3',
        runs: [
          {
            text: 'Bekymringsmeldingen var berettiget. Det er den fortsatt.',
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
    supports: ['q_grete_dor'],
    discuss: ['Frank'],
  },
  f_aldri_alene: {
    id: 'f_aldri_alene',
    domain: 'Hverdag/rutine',
    category: 'Dokument',
    text: 'Elling (35) har aldri bodd alene.',
    quote: '',
    supports: ['q_grete_dor', 'q_evner'],
    discuss: ['Frank', 'Grete'],
  },
  f_grete_baerer: {
    id: 'f_grete_baerer',
    domain: 'Hverdag/rutine',
    category: 'Dokument',
    text: 'Grete bistår med gjøremål, økonomi og kontakt med tjenester.',
    quote: '',
    supports: ['q_grete_dor', 'q_okonomi'],
    discuss: ['Frank', 'Grete'],
  },
  f_saarbar: {
    id: 'f_saarbar',
    domain: 'Helse/risiko',
    category: 'Risiko',
    text: 'Elling vurderes som sårbar ved bortfall av pårørende.',
    quote: 'primær omsorgsperson',
    supports: ['q_grete_dor'],
    discuss: ['Frank'],
  },
  f_ingen_tjenester: {
    id: 'f_ingen_tjenester',
    domain: 'Nettverk/sosialt',
    category: 'Dokument',
    text: 'Elling har ingen kontakt med øvrige tjenester.',
    quote: '',
    supports: ['q_baering'],
    discuss: ['Frank'],
  },
  f_trygd: {
    id: 'f_trygd',
    domain: 'Økonomi/bolig',
    category: 'Økonomi',
    text: 'Ellings uføretrygd: 2 [icon=coin] i måneden.',
    quote: 'trygden hans — 2 [icon=coin] i måneden. Den kommer den første, og den går rett videre.',
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
    text: 'Husleien er 3 [icon=coin] og betales av Grete.',
    quote: 'husleien — 3 [icon=coin]. Den betales kontant til huseieren, av Grete, den første.',
    supports: ['q_okonomi', 'q_bolig'],
    discuss: ['Frank', 'Grete'],
  },
  f_gap: {
    id: 'f_gap',
    domain: 'Økonomi/bolig',
    category: 'Økonomi',
    text: 'Uten Gretes pensjon mangler husholdet 2 [icon=coin] hver måned.',
    quote: 'Regnestykket går opp — med henne. Uten henne mangler det 2 [icon=coin]. Hver måned.',
    supports: ['q_okonomi', 'q_bolig'],
    discuss: ['Frank'],
  },
  f_ingen_matkjop: {
    id: 'f_ingen_matkjop',
    domain: 'Hverdag/rutine',
    category: 'Økonomi',
    text: 'Elling har aldri betalt for mat selv. Mat skjer gjennom Grete.',
    quote: 'Jeg fant ikke ett kjøp som var hans. Ikke ett.',
    supports: ['q_grete_dor'],
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
    supports: ['q_bolig', 'q_baering'],
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
    supports: ['q_grete_dor'],
    discuss: ['Frank'],
  },
  f_ingen_plan: {
    id: 'f_ingen_plan',
    domain: 'Helse/risiko',
    category: 'Samtale',
    text: 'Det finnes ingen plan for hvem som overtar etter Grete.',
    quote:
      'Jeg spurte hvem som overtar hvis hun skulle bli innlagt. Det ble stille. Hun svarte ikke på det.',
    supports: ['q_grete_dor', 'q_bolig'],
    discuss: ['Frank', 'Grete'],
  },
  f_elling_tlf: {
    id: 'f_elling_tlf',
    domain: 'Nettverk/sosialt',
    category: 'Samtale',
    text: 'Elling tar ikke telefonen. Grete normaliserer det.',
    quote:
      'Jeg ba om å få hilse på Elling i telefonen. Hun sa han ikke tar telefonen. «Det er ikke noe galt med ham. Han liker bare ikke apparatet.»',
    supports: ['q_baering'],
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
    supports: ['q_grete_dor', 'q_okonomi'],
    discuss: ['Frank'],
  },
  f_bok: {
    id: 'f_bok',
    domain: 'Ressurser',
    category: 'Ressurs',
    text: 'Elling leser krevende stoff og noterer systematisk. Konsentrasjonen er en ressurs.',
    quote: 'en bok om polarekspedisjoner. Han noterte i margen. Systematisk, små bokstaver.',
    supports: ['q_evner'],
    discuss: ['Frank'],
  },
  f_utklipp: {
    id: 'f_utklipp',
    domain: 'Ressurser',
    category: 'Ressurs',
    text: 'Elling samler og systematiserer: utklipp av Gro og Arbeiderpartiet, datert og ordnet.',
    quote:
      'avisutklipp, sirlig montert. Gro, landsmøter, 1. mai-tog. Årstall i hjørnene, hans håndskrift.',
    supports: ['q_evner'],
    discuss: ['Frank'],
  },
  f_avstand: {
    id: 'f_avstand',
    domain: 'Nettverk/sosialt',
    category: 'Observasjon',
    text: 'Elling holder avstand til fremmede. Alltid et møbel mellom.',
    quote: 'Han forlot ikke rommet, men flyttet seg slik at det alltid var et møbel mellom oss.',
    supports: ['q_baering', 'q_evner'],
    discuss: ['Frank'],
  },
  f_dor_glott: {
    id: 'f_dor_glott',
    domain: 'Nettverk/sosialt',
    category: 'Samtale',
    text: 'Elling kastet ikke Frank ut, og svarte da Frank spurte om noe han kunne. Kontakt er mulig — forsiktig.',
    quote:
      'han kastet meg ikke ut, og han svarte da jeg spurte om noe han kunne. Det er en dør på gløtt.',
    supports: ['q_baering'],
    discuss: ['Frank'],
  },
  f_smart_gutt: {
    id: 'f_smart_gutt',
    domain: 'Nettverk/sosialt',
    category: 'Samtale',
    text: 'Grete omtaler Elling (35) som «gutt». Rollene er fastlåst.',
    quote: '«Du så hvordan han er. Han er en smart gutt.»',
    supports: ['q_grete_dor', 'q_evner'],
    discuss: ['Frank'],
  },
  f_innlagt: {
    id: 'f_innlagt',
    domain: 'Helse/risiko',
    category: 'Dokument',
    text: 'Grete er akutt innlagt på Ullevål.',
    quote: 'innlagt akutt 14.02',
    supports: ['q_grete_dor', 'q_bolig'],
    discuss: ['Frank'],
  },
  f_elling_uvarslet: {
    id: 'f_elling_uvarslet',
    domain: 'Helse/risiko',
    category: 'Dokument',
    text: 'Elling vet ikke at Grete er innlagt. Hun ber kommunen se til ham.',
    quote: 'Pasienten oppgir at sønnen ikke er varslet. Hun ber om at kommunen ser til ham.',
    supports: ['q_baering', 'q_kollaps'],
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
    supports: ['q_baering', 'q_kollaps'],
    discuss: ['Frank'],
  },
} satisfies Record<string, BlueprintFact>;

export const tinyOlsenQuestions = {
  q_grete_dor: {
    id: 'q_grete_dor',
    title: 'Den dagen Grete ikke kommer hjem — hva stopper?',
    appearsOn: ['f_grete_syk', 'f_klarer_seg'],
    hypotheses: [
      {
        id: 'h_gd_system',
        label: 'Husholdet er et system med to. Med én står det stille.',
        needs: ['f_smart_gutt', 'f_ingen_matkjop'],
        opens: ['t_matlevering'],
        note: 'Mat, avtaler, post og kontakt går gjennom arbeidsdeling som forsvinner med Grete. Det er systemet som dør, ikke bare et fravær.',
      },
      {
        id: 'h_gd_infra',
        label: 'Alt praktisk er usynlig infrastruktur: mat, post, kontakt.',
        needs: ['f_post', 'f_ingen_matkjop'],
        opens: ['t_hjemmehjelp', 't_matlevering', 't_dokgjennomgang'],
        note: 'Funksjonene er ikke dokumentert noe sted og overlever ikke bortfall uten overføring.',
      },
      {
        id: 'h_gd_ukjent',
        label: 'Ingenting vi vet. Ingen har noen gang sett Elling alene.',
        needs: ['f_aldri_alene', 'f_ingen_plan'],
        opens: [],
        note: 'Det finnes ikke observasjon av Elling uten Grete. Uvitenheten er selve funnet — og den må lukkes før noe annet.',
      },
    ],
  },
  q_evner: {
    id: 'q_evner',
    title: 'Hva klarer Elling selv — når ingen har gjort det for ham først?',
    appearsOn: ['f_bok', 'f_utklipp', 'f_aldri_alene'],
    hypotheses: [
      {
        id: 'h_ev_kanmer',
        label: 'Mer enn det ser ut til.',
        needs: ['f_bok', 'f_utklipp'],
        opens: ['t_brev'],
        note: 'Konsentrasjon, arkiv og system er observert.',
      },
      {
        id: 'h_ev_unngaar',
        label: 'Han forstår — men unngår. Posten ligger uåpnet, ikke ulest.',
        needs: ['f_post', 'f_bok'],
        opens: ['t_dokgjennomgang'],
        note: 'Kapasiteten til å forstå er observert. Papiret når likevel aldri frem, fordi konvolutten aldri åpnes. Problemet er kanal, ikke forståelse.',
      },
      {
        id: 'h_ev_ukjent',
        label: 'Vet ikke. Ingen har prøvd. Det er selve funnet.',
        needs: [],
        opens: ['t_brev', 't_regning'],
        note: 'Kommunen har ingen observasjon av hva Elling klarer alene. Første tiltak må være å finne det ut — forsiktig.',
      },
    ],
  },
  q_okonomi: {
    id: 'q_okonomi',
    title: 'Regnestykket Olsen: hva kommer inn, hva går ut — og gjennom hvem?',
    appearsOn: ['f_grete_baerer', 'f_trygd', 'f_husleie'],
    hypotheses: [
      {
        id: 'h_ok_kjede',
        label: 'Betalingskjeden er én person. Kjeden, ikke beløpene, er risikoen.',
        needs: ['f_husleie', 'f_alt_via_grete'],
        opens: ['t_forvaltning'],
        note: 'Husleie og faste betalinger fungerer gjennom Gretes system — skoesken, postgiroene, kontantene den første. Systemet har én operatør.',
      },
      {
        id: 'h_ok_gap',
        label: 'Trygden dekker ikke boligen. 2 [icon=coin] mangler hver måned.',
        needs: ['f_gap'],
        opens: ['t_bostotte', 't_huseier'],
        note: 'Ellings trygd er 2 [icon=coin]. Boligen koster 3 [icon=coin]. Differansen bæres i dag av Gretes pensjon. Bortfall gir umiddelbar restanserisiko.',
      },
    ],
  },
  q_bolig: {
    id: 'q_bolig',
    title: 'Kan Elling bli boende — når husleien har stoppet?',
    appearsOn: ['f_gap', 'f_leie_stoppet', 'f_husleie'],
    hypotheses: [
      {
        id: 'h_b_sikres',
        label: 'Boligen kan sikres — med bostøtte og ordnet betalingskjede.',
        needs: ['f_gap', 'f_trygd'],
        opens: ['t_bostotte', 't_forvaltning'],
        note: 'Med bostøtte og en betalingskjede som ikke går gjennom én person kan leieforholdet overleve.',
      },
      {
        id: 'h_b_flytte',
        label: 'Boligen kan ikke holdes. Flytting bør forberedes nå.',
        needs: ['f_gap', 'f_leie_privat'],
        opens: ['t_huseier'],
        note: 'Privat, muntlig leieforhold uten kontrakt tåler ikke dødsfallet. Å vente er å velge kaos senere.',
      },
      {
        id: 'h_b_uavklart',
        label: 'Uavklart — økonomien må kartlegges først.',
        needs: [],
        opens: [],
        note: 'Å velge bolig-retning uten regnestykket er gjetning. Kartlegg først.',
      },
    ],
  },
  q_baering: {
    id: 'q_baering',
    title:
      'Noe av det Grete gjorde må noen andre gjøre. Hvor lite kan kommunen slippe unna med — og hvor mye tåler han?',
    appearsOn: ['f_elling_tlf', 'f_avstand', 'f_ingen_tjenester'],
    hypotheses: [
      {
        id: 'h_ba_kanal',
        label: 'Først en kanal. Fast person, fast tid, oppmøte — telefonen er stengt.',
        needs: ['f_elling_tlf', 'f_avstand'],
        opens: ['t_hjemmehjelp'],
        note: 'Elling tar ikke telefonen og holder avstand til fremmede. Uten en kanal inn er alle andre tiltak teori.',
      },
      {
        id: 'h_ba_drift',
        label: 'Deler av driften: mat og papir kan erstattes uten å erstatte Grete.',
        needs: ['f_post', 'f_ingen_matkjop'],
        opens: ['t_matlevering', 't_dokgjennomgang'],
        note: 'Matlevering og dokumentgjennomgang dekker de kritiske funksjonene uten å institusjonalisere noe som helst.',
      },
      {
        id: 'h_ba_alt',
        label: 'Alt. Fullt omsorgsansvar — institusjon eller omsorgsbolig.',
        needs: ['f_saarbar'],
        opens: ['t_institusjon'],
        note: 'Sårbarheten vurderes som for stor for hjemmeboende støtte. Tyngste ende av skalaen — og den kan alltid utløses.',
      },
    ],
  },
  q_vekst: {
    id: 'q_vekst',
    title: 'Hva kan læres — og i hvilket tempo, uten å knekke noe?',
    appearsOn: ['f_bok', 'f_utklipp'],
    hypotheses: [
      {
        id: 'h_ve_rutine',
        label: 'Én rutine om gangen. Konsentrasjonen er der; tempoet må være hans.',
        needs: ['f_bok'],
        opens: ['t_brev', 't_regning'],
        note: 'Kapasitet til fordypning og system er observert. Avgrensede rutiner kan bygges med støtte — lavt tempo, fast person, hans eget arkivspråk.',
      },
      {
        id: 'h_ve_formell',
        label: 'Ferdighetene er der ikke. Støtte må bære — læring er ikke planen nå.',
        needs: ['f_saarbar'],
        opens: ['t_hjemmehjelp'],
        note: 'Funksjonsnivået vurderes som for lavt for egenmestring. Tjenestene må dimensjoneres for full kompensasjon.',
      },
      {
        id: 'h_ve_interesser',
        label: 'Vokse i det han alt gjør: arkivet, systemene, interessene.',
        needs: ['f_utklipp'],
        opens: ['t_brev'],
        note: 'Identitet over progresjon: bygg videre på Gro-arkivet og systemene han allerede driver, ikke på manglene.',
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
        opens: ['t_forvaltning', 't_bostotte'],
        note: 'Betalingskjeden døde med Grete. Restansen begynner å løpe nå.',
      },
      {
        id: 'h_c_mat',
        label: 'Maten. Ingen matkjøp står i hans navn.',
        needs: ['f_ingen_matkjop'],
        opens: ['t_matlevering'],
        note: 'Grete handlet inn. Kontoutskriften hans viser ikke ett matkjøp.',
      },
      {
        id: 'h_c_kontakt',
        label: 'Kontakten. Uten kanal inn er alt annet teori.',
        needs: ['f_brevsprekken'],
        opens: ['t_hjemmehjelp'],
        note: 'Dødsbudskapet gikk gjennom brevsprekken. Døren er fortsatt lukket.',
      },
    ],
  },
  q_liv: {
    id: 'q_liv',
    title: 'Ikke bare berget — levd. Hva skulle til for at Elling har et liv han vil ha?',
    appearsOn: ['f_dod', 'f_utklipp'],
    hypotheses: [
      {
        id: 'h_liv_interesser',
        label: 'Deltakelse via interessene. Arkivet er en dør ut, ikke et symptom.',
        needs: ['f_utklipp', 'f_bok'],
        opens: [],
        note: 'Gro-arkivet og systematikken er en identitet det går an å delta gjennom — i hans tempo.',
      },
      {
        id: 'h_liv_trygghet',
        label: 'Trygghet først. Verden i hans tempo, med møbel imellom — og det er greit.',
        needs: ['f_avstand'],
        opens: [],
        note: 'Avstanden er ikke et problem som skal fikses, men et premiss tjenestene må respektere.',
      },
      {
        id: 'h_liv_sporre',
        label: 'Det vet bare Elling. Noen må spørre ham — og noen må kunne få svar.',
        needs: ['f_elling_tlf'],
        opens: [],
        note: 'Ingen har spurt Elling hva han vil. Svaret krever en kanal som virker.',
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
    needsHypothesis: ['h_ok_kjede', 'h_b_sikres', 'h_c_penger'],
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
    needsHypothesis: ['h_gd_infra', 'h_gd_system', 'h_ba_kanal', 'h_c_kontakt'],
    description: 'Fast person, fast tid. Den eneste kanalen inn som har virket hittil.',
    sim: 'case.olsen.tiltak.channel',
  },
  t_matlevering: {
    id: 't_matlevering',
    slot: 's2',
    title: 'Matombringing',
    cost: 1,
    needs: ['f_ingen_matkjop'],
    needsHypothesis: ['h_gd_infra', 'h_c_mat'],
    description: 'Bokser på døren, tre dager i uken. Forutsetter at døren er en kanal.',
    sim: 'case.olsen.tiltak.food',
  },
  t_dokgjennomgang: {
    id: 't_dokgjennomgang',
    slot: 's2',
    title: 'Fast dokumentgjennomgang',
    cost: 1,
    needs: ['f_post'],
    needsHypothesis: ['h_ev_unngaar', 'h_gd_infra', 'h_ba_drift'],
    description: 'Frank går gjennom posten ukentlig. Papiret når frem til en vurdering.',
    sim: 'case.olsen.tiltak.dok',
  },
  t_brev: {
    id: 't_brev',
    slot: 's3',
    title: 'Åpne ett brev sammen med Frank',
    cost: 0,
    needs: ['f_post'],
    needsHypothesis: ['h_ev_kanmer', 'h_ve_rutine', 'h_ev_ukjent'],
    description: 'Ett brev. Ikke bunken. Frank legger det på bordet og venter.',
    sim: 'case.olsen.tiltak.brev',
  },
  t_regning: {
    id: 't_regning',
    slot: 's3',
    title: 'Betal én regning med støtte',
    cost: 0,
    needs: ['f_gap'],
    needsHypothesis: ['h_ve_rutine'],
    description: 'Én regning, én gang. Målet er at det har skjedd, ikke at det er lært.',
    sim: 'case.olsen.tiltak.regning',
  },
  t_institusjon: {
    id: 't_institusjon',
    slot: 'press',
    title: 'Institusjonsvurdering / omsorgsbolig',
    cost: 0,
    needs: ['f_saarbar'],
    needsHypothesis: ['h_ve_formell', 'h_ba_alt'],
    description:
      'Bureaukratisk lesbart. Trygt på papiret. Leiligheten blir i så fall et avsluttet kapittel.',
    sim: 'case.olsen.tiltak.institusjon',
  },
} satisfies Record<string, BlueprintTiltak>;

export const tinyOlsenDispatches = {
  d_konto: {
    id: 'd_konto',
    title: 'Be om økonomisk oversikt',
    description:
      'Frank ringer til Grete og spør om hun kan skaffe en bankutskrift. Utskriften kommer i morgen.',
  },
  hjemmebesok: {
    id: 'hjemmebesok',
    title: 'Hjemmebesøk',
    description: 'Frank drar på uanmeldt besøk til leiligheten.',
  },
} satisfies Record<string, BlueprintDispatch>;

export const tinyOlsenGodotSource = {
  id: 'case_olsen_tiny',
  title: 'Olsen — full case slice',
  scenario_stage: 0,
  vurdering_frist_day: 10,
  documents: [
    {
      id: 'doc_bekymring',
      kind: 'BEKYMRINGSMELDING',
      title: 'Bekymringsmelding',
      register: 'klinisk',
      peek: 'Bekymringsmelding Dr. J. Haug',
      meta: 'LEGESENTERET DR. J. HAUG, 11.02.1999',
      body_bbcode:
        'Under behandling av pasient Grete Olsen (f. 1927) for en [url=fact:f_grete_syk]sykdom med kort forventet forløp[/url] kommer det frem at hun er [url=fact:f_saarbar]primær omsorgsperson[/url] for sin sønn Elling Olsen (f. 14.03.1964). Omfanget er ikke kartlagt, men han kan ha behov for støtte ved mors bortfall. \n\nMed hilsen\nJørgen Haug\nspes. allmennmedisin',
      runs: [
        {
          id: 'run_text_0',
          text: 'Under behandling av pasient Grete Olsen (f. 1927) for en ',
          fact_id: '',
        },
        {
          id: 'run_grete_syk',
          text: 'sykdom med kort forventet forløp',
          fact_id: 'f_grete_syk',
        },
        {
          id: 'run_text_1',
          text: ' kommer det frem at hun er ',
          fact_id: '',
        },
        {
          id: 'run_saarbar',
          text: 'primær omsorgsperson',
          fact_id: 'f_saarbar',
        },
        {
          id: 'run_text_2',
          text: ' for sin sønn Elling Olsen (f. 14.03.1964). Omfanget er ikke kartlagt, men han kan ha behov for støtte ved mors bortfall. Med hilsen Jørgen Haug spes. allmennmedisin',
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
      meta: 'ØKONOMISK OVERSIKT · 4012 F. ÅSLI · GJENNOMGÅTT MED G. OLSEN VED KJØKKENBORDET',
      body_bbcode:
        'Grete fant frem alt. Postgiroene ligger i en skoeske, ferdig utfylt, sortert på forfall.\n\nInn: [url=fact:f_trygd]trygden hans — 2 [icon=coin] i måneden. Den kommer den første, og den går rett videre.[/url] Pensjonen hennes: 3 [icon=coin].\n\nUt: [url=fact:f_husleie]husleien — 3 [icon=coin]. Den betales kontant til huseieren, av Grete, den første.[/url] Strøm, mat og resten: 2 [icon=coin] til sammen.\n\n[url=fact:f_alt_via_grete]Alle betalinger går gjennom Grete. Alle avtaler står i hennes navn.[/url] Jeg spurte om Elling visste hvor skoesken sto. Hun lo, kort.\n\nJeg gikk gjennom kvitteringene. [url=fact:f_ingen_matkjop]Jeg fant ikke ett kjøp som var hans. Ikke ett.[/url]\n\n[url=fact:f_gap]Regnestykket går opp — med henne. Uten henne mangler det 2 [icon=coin]. Hver måned.[/url]',
      runs: [
        {
          id: 'run_text_0',
          text: 'Grete fant frem alt. Postgiroene ligger i en skoeske, ferdig utfylt, sortert på forfall. Inn: ',
          fact_id: '',
        },
        {
          id: 'run_trygd',
          text: 'trygden hans — 2 [icon=coin] i måneden. Den kommer den første, og den går rett videre.',
          fact_id: 'f_trygd',
        },
        {
          id: 'run_text_1',
          text: ' Pensjonen hennes: 3 [icon=coin]. Ut: ',
          fact_id: '',
        },
        {
          id: 'run_husleie',
          text: 'husleien — 3 [icon=coin]. Den betales kontant til huseieren, av Grete, den første.',
          fact_id: 'f_husleie',
        },
        {
          id: 'run_text_2',
          text: ' Strøm, mat og resten: 2 [icon=coin] til sammen. ',
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
          text: 'Regnestykket går opp — med henne. Uten henne mangler det 2 [icon=coin]. Hver måned.',
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
      meta: 'PAPIRGJENNOMGANG · 4012 F. ÅSLI · ETTER DØDSFALLET · MED ELLING I ROMMET',
      body_bbcode:
        'Skoesken sto der hun forlot den. Postgiroene ferdig utfylt, sortert på forfall. Den øverste gjelder mars. Den er ikke levert.\n\nInn: [url=fact:f_trygd]trygden hans — 2 [icon=coin] i måneden.[/url] Pensjonen hennes er opphørt.\n\nUt: [url=fact:f_husleie]husleien — 3 [icon=coin]. Den ble betalt kontant til huseieren, av Grete, den første.[/url]\n\n[url=fact:f_alt_via_grete]Alle avtaler står i Gretes navn.[/url] [url=fact:f_ingen_matkjop]Ikke ett kjøp i kvitteringene er hans.[/url]\n\n[url=fact:f_gap]Regnestykket gikk opp — med henne. Nå mangler det 2 [icon=coin]. Hver måned.[/url]\n\nElling satt ved bordet mens jeg gikk gjennom esken. Han rettet på bunkene da jeg la dem fra meg. Han visste rekkefølgen.',
      runs: [
        {
          id: 'run_text_0',
          text: 'Skoesken sto der hun forlot den. Postgiroene ferdig utfylt, sortert på forfall. Den øverste gjelder mars. Den er ikke levert. Inn: ',
          fact_id: '',
        },
        {
          id: 'run_trygd',
          text: 'trygden hans — 2 [icon=coin] i måneden.',
          fact_id: 'f_trygd',
        },
        {
          id: 'run_text_1',
          text: ' Pensjonen hennes er opphørt. Ut: ',
          fact_id: '',
        },
        {
          id: 'run_husleie',
          text: 'husleien — 3 [icon=coin]. Den ble betalt kontant til huseieren, av Grete, den første.',
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
          text: 'Regnestykket gikk opp — med henne. Nå mangler det 2 [icon=coin]. Hver måned.',
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
      meta: 'FELTNOTAT · 4012 F. ÅSLI · TLF. G. OLSEN',
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
      meta: 'HJEMMEBESØK · 4012 F. ÅSLI',
      body_bbcode:
        'Grete åpnet før jeg fikk ringt på. Hun hadde dekket på med tre kopper. Elling brukte ikke sin.\n\nI gangen: [url=fact:f_post]en bunke uåpnet post på skoskapet. Øverst: Trygdekontoret, sosialkontoret, Oslo Energi.[/url] Grete flyttet bunken da hun så at jeg så.\n\nElling satt i stuen med [url=fact:f_bok]en bok om polarekspedisjoner. Han noterte i margen. Systematisk, små bokstaver.[/url] Jeg spurte om Nansen. Han svarte med tre presise setninger. Til veggen, ikke til meg.\n\nOver skrivebordet hans: [url=fact:f_utklipp]avisutklipp, sirlig montert. Gro, landsmøter, 1. mai-tog. Årstall i hjørnene, hans håndskrift.[/url] Det er ikke rot. Det er et arkiv.\n\n[url=fact:f_avstand]Han forlot ikke rommet, men flyttet seg slik at det alltid var et møbel mellom oss.[/url] Ikke demonstrativt. Bare slik det ble.\n\nGrete fulgte meg ut. I trappen sa hun: [url=fact:f_smart_gutt]«Du så hvordan han er. Han er en smart gutt.»[/url] Hun er 72. Han er 35. Gutt.',
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
          text: ' Grete flyttet bunken da hun så at jeg så. Elling satt i stuen med ',
          fact_id: '',
        },
        {
          id: 'run_bok',
          text: 'en bok om polarekspedisjoner. Han noterte i margen. Systematisk, små bokstaver.',
          fact_id: 'f_bok',
        },
        {
          id: 'run_text_2',
          text: ' Jeg spurte om Nansen. Han svarte med tre presise setninger. Til veggen, ikke til meg. Over skrivebordet hans: ',
          fact_id: '',
        },
        {
          id: 'run_utklipp',
          text: 'avisutklipp, sirlig montert. Gro, landsmøter, 1. mai-tog. Årstall i hjørnene, hans håndskrift.',
          fact_id: 'f_utklipp',
        },
        {
          id: 'run_text_3',
          text: ' Det er ikke rot. Det er et arkiv. ',
          fact_id: '',
        },
        {
          id: 'run_avstand',
          text: 'Han forlot ikke rommet, men flyttet seg slik at det alltid var et møbel mellom oss.',
          fact_id: 'f_avstand',
        },
        {
          id: 'run_text_4',
          text: ' Ikke demonstrativt. Bare slik det ble. Grete fulgte meg ut. I trappen sa hun: ',
          fact_id: '',
        },
        {
          id: 'run_smart_gutt',
          text: '«Du så hvordan han er. Han er en smart gutt.»',
          fact_id: 'f_smart_gutt',
        },
        {
          id: 'run_text_5',
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
    {
      id: 'doc_status',
      kind: 'STATUSRAPPORT',
      title: 'Frank · status dag 8',
      register: 'notat',
      peek: 'En uke siden meldingen.',
      meta: 'STATUSRAPPORT · 4012 F. ÅSLI · DAG 8',
      body_bbcode:
        'Det foreligger ikke iverksatte tiltak som dekker bolig eller hverdag.\n\nRestanse bygges. Posten vokser. Døren er lukket. Kommunen vet nå svært mye om Elling Olsen, og når ham ikke.\n\nBekymringsmeldingen var berettiget. Det er den fortsatt.',
      runs: [
        {
          id: 'run_text_0',
          text: 'Det foreligger ikke iverksatte tiltak som dekker bolig eller hverdag. Restanse bygges. Posten vokser. Døren er lukket. Kommunen vet nå svært mye om Elling Olsen, og når ham ikke. Bekymringsmeldingen var berettiget. Det er den fortsatt.',
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
      about: 'grete',
      quote: 'sykdom med kort forventet forløp',
      frank_response:
        '«Kort forventet forløp», og ikke noe mer. Så vagt skriver man bare når man vil. Haug må si det høyt før vi planlegger noe.',
      discuss: ['Frank'],
      supports_questions: ['q_grete_dor'],
      lift_effects: [],
    },
    {
      id: 'f_aldri_alene',
      label: 'Aldri bodd alene',
      summary: 'Elling (35) har aldri bodd alene.',
      source_document_id: 'doc_bekymring',
      domain: 'Hverdag/rutine',
      category: 'Dokument',
      quote: '',
      frank_response:
        'Han er trettifem og har aldri bodd alene. Det sier ikke hva han kan. Det sier at ingen har sett ham prøve.',
      discuss: ['Frank', 'Grete'],
      supports_questions: ['q_grete_dor', 'q_evner'],
      lift_effects: [],
    },
    {
      id: 'f_grete_baerer',
      label: 'Grete bærer rutiner',
      summary: 'Grete bistår med gjøremål, økonomi og kontakt med tjenester.',
      source_document_id: 'doc_bekymring',
      domain: 'Hverdag/rutine',
      category: 'Dokument',
      about: 'grete',
      quote: '',
      frank_response:
        '«Omfanget er ikke kartlagt». Hun gjør alt, og ingen vet hvor mye alt er. Det tallet finnes ikke før noen står i leiligheten og teller.',
      discuss: ['Frank', 'Grete'],
      supports_questions: ['q_grete_dor', 'q_okonomi'],
      lift_effects: [],
    },
    {
      id: 'f_saarbar',
      label: 'Sårbar ved bortfall',
      summary: 'Elling vurderes som sårbar ved bortfall av pårørende.',
      source_document_id: 'doc_bekymring',
      domain: 'Helse/risiko',
      category: 'Risiko',
      about: 'elling',
      quote: 'primær omsorgsperson',
      frank_response:
        'Det er en leges inntrykk, ikke en kartlegging. Vi fatter ikke vedtak på inntrykk. Men det holder til å dra på hjemmebesøk, og det er sånn en bekymringsmelding er ment å virke.',
      discuss: ['Frank'],
      supports_questions: ['q_grete_dor'],
      lift_effects: [],
    },
    {
      id: 'f_ingen_tjenester',
      label: 'Ingen tjenester',
      summary: 'Elling har ingen kontakt med øvrige tjenester.',
      source_document_id: 'doc_bekymring',
      domain: 'Nettverk/sosialt',
      category: 'Dokument',
      quote: '',
      frank_response:
        'Ingen. Ikke hjemmetjeneste, ikke dagsenter, ikke oss. Det finnes ingen mappe å slå opp i. Alt vi skal vite, må noen hente.',
      discuss: ['Frank'],
      supports_questions: ['q_baering'],
      lift_effects: [],
    },
    {
      id: 'f_trygd',
      label: 'Ellings uføretrygd',
      summary: 'Ellings uføretrygd: 2 [icon=coin] i måneden.',
      source_document_id: 'doc_konto',
      domain: 'Økonomi/bolig',
      category: 'Økonomi',
      quote:
        'trygden hans — 2 [icon=coin] i måneden. Den kommer den første, og den går rett videre.',
      discuss: ['Frank'],
      supports_questions: ['q_okonomi', 'q_bolig'],
      lift_effects: [],
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
      summary: 'Husleien er 3 [icon=coin] og betales av Grete.',
      source_document_id: 'doc_konto',
      domain: 'Økonomi/bolig',
      category: 'Økonomi',
      about: 'utleier',
      quote: 'husleien — 3 [icon=coin]. Den betales kontant til huseieren, av Grete, den første.',
      discuss: ['Frank', 'Grete'],
      supports_questions: ['q_okonomi', 'q_bolig'],
      lift_effects: [],
    },
    {
      id: 'f_gap',
      label: '2 [icon=coin] mangler',
      summary: 'Uten Gretes pensjon mangler husholdet 2 [icon=coin] hver måned.',
      source_document_id: 'doc_konto',
      domain: 'Økonomi/bolig',
      category: 'Økonomi',
      about: 'utleier',
      quote: 'Regnestykket går opp — med henne. Uten henne mangler det 2 [icon=coin]. Hver måned.',
      discuss: ['Frank'],
      supports_questions: ['q_okonomi', 'q_bolig'],
      lift_effects: [],
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
      supports_questions: ['q_grete_dor'],
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
      lift_effects: [],
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
      supports_questions: ['q_bolig', 'q_baering'],
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
      about: 'elling',
      quote: '«Han klarer seg. Han har alltid klart seg.» Hun sa det to ganger.',
      discuss: ['Frank'],
      supports_questions: ['q_grete_dor'],
      reveals_event: 'call:grete',
      lift_effects: [],
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
      supports_questions: ['q_grete_dor', 'q_bolig'],
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
      supports_questions: ['q_baering'],
      lift_effects: [],
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
      about: 'elling',
      quote:
        'en bunke uåpnet post på skoskapet. Øverst: Trygdekontoret, sosialkontoret, Oslo Energi.',
      card_line: 'Trygdekontoret øverst. Uåpnet.',
      discuss: ['Frank'],
      supports_questions: ['q_grete_dor', 'q_okonomi'],
      lift_effects: [],
    },
    {
      id: 'f_bok',
      label: 'Bok med notater',
      summary: 'Elling leser krevende stoff og noterer systematisk. Konsentrasjonen er en ressurs.',
      source_document_id: 'doc_frank_visit',
      domain: 'Ressurser',
      category: 'Ressurs',
      about: 'elling',
      quote: 'en bok om polarekspedisjoner. Han noterte i margen. Systematisk, små bokstaver.',
      card_line: 'Margnotater. Systematisk.',
      discuss: ['Frank'],
      supports_questions: ['q_evner'],
      lift_effects: [],
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
      card_line: 'Gro. Årstall i hjørnene.',
      discuss: ['Frank'],
      supports_questions: ['q_evner'],
      lift_effects: [],
    },
    {
      id: 'f_avstand',
      label: 'Holder avstand',
      summary: 'Elling holder avstand til fremmede. Alltid et møbel mellom.',
      source_document_id: 'doc_frank_visit',
      domain: 'Nettverk/sosialt',
      category: 'Observasjon',
      quote: 'Han forlot ikke rommet, men flyttet seg slik at det alltid var et møbel mellom oss.',
      card_line: 'Alltid et møbel imellom.',
      discuss: ['Frank'],
      supports_questions: ['q_baering', 'q_evner'],
      lift_effects: [],
    },
    {
      id: 'f_dor_glott',
      label: 'En dør på gløtt',
      summary:
        'Elling kastet ikke Frank ut, og svarte da Frank spurte om noe han kunne. Kontakt er mulig — forsiktig.',
      source_document_id: 'doc_frank_visit',
      domain: 'Nettverk/sosialt',
      category: 'Samtale',
      about: 'elling',
      quote:
        'han kastet meg ikke ut, og han svarte da jeg spurte om noe han kunne. Det er en dør på gløtt.',
      card_line: 'Han svarte da jeg spurte om Nansen.',
      discuss: ['Frank'],
      supports_questions: ['q_baering'],
      lift_effects: [],
    },
    {
      id: 'f_smart_gutt',
      label: '«En smart gutt»',
      summary: 'Grete omtaler Elling (35) som «gutt». Rollene er fastlåst.',
      source_document_id: 'doc_frank_visit',
      domain: 'Nettverk/sosialt',
      category: 'Samtale',
      quote: '«Du så hvordan han er. Han er en smart gutt.»',
      card_line: 'Sagt lavt, i trappen.',
      discuss: ['Frank'],
      supports_questions: ['q_grete_dor', 'q_evner'],
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
      supports_questions: ['q_grete_dor', 'q_bolig'],
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
      supports_questions: ['q_baering', 'q_kollaps'],
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
      supports_questions: ['q_baering', 'q_kollaps'],
      lift_effects: [],
    },
  ],
  questions: [
    {
      id: 'q_grete_dor',
      prompt: 'Den dagen Grete ikke kommer hjem — hva stopper?',
      teaser:
        'Det er noe her om hva som faktisk stopper den dagen Grete ikke er der. Jeg har ikke ord på det ennå.',
      reveal_when: {
        op: 'all',
        children: [
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_grete_syk',
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
      leads: [
        {
          label: 'Ring Grete',
          target: 'call:grete',
        },
      ],
    },
    {
      id: 'q_evner',
      prompt: 'Hva klarer Elling selv — når ingen har gjort det for ham først?',
      teaser: 'Jeg tror vi vet mindre om hva Elling klarer enn vi tror. Det ligger noe her.',
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
              fact_id: 'f_aldri_alene',
            },
          },
        ],
      },
      leads: [
        {
          label: 'Åpne ett brev sammen med Frank',
          target: 't_brev',
        },
      ],
    },
    {
      id: 'q_okonomi',
      prompt: 'Regnestykket Olsen: hva kommer inn, hva går ut — og gjennom hvem?',
      teaser: 'Tallene går opp — men jeg klarer ikke helt å se gjennom hvem. Verdt å se på.',
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
      leads: [
        {
          label: 'Be om økonomisk oversikt',
          target: 'd_konto',
        },
        {
          label: 'Snakk med huseieren',
          target: 't_huseier',
        },
      ],
    },
    {
      id: 'q_bolig',
      prompt: 'Kan Elling bli boende — når husleien har stoppet?',
      teaser: 'Det er noe med leiligheten som ikke tåler mange spørsmål. Ta en titt når du kan.',
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
      leads: [
        {
          label: 'Snakk med huseieren',
          target: 't_huseier',
        },
      ],
    },
    {
      id: 'q_baering',
      prompt:
        'Noe av det Grete gjorde må noen andre gjøre. Hvor lite kan kommunen slippe unna med — og hvor mye tåler han?',
      teaser: '',
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
      id: 'q_vekst',
      prompt: 'Hva kan læres — og i hvilket tempo, uten å knekke noe?',
      teaser: 'Jeg så noe hos ham som kan bygges på. Usikker på tempoet. Vi bør snakke om det.',
      card_title: 'Hva kan læres?',
      card_sub: '— og i hvilket tempo, uten å knekke noe?',
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
        ],
      },
    },
    {
      id: 'q_kollaps',
      prompt: 'Hva kollapser først nå?',
      teaser: 'Noe her har begynt å rakne. Jeg vet ikke hva som går først.',
      reveal_when: {
        op: 'fact_lifted',
        args: {
          fact_id: 'f_dod',
        },
      },
    },
    {
      id: 'q_liv',
      prompt: 'Ikke bare berget — levd. Hva skulle til for at Elling har et liv han vil ha?',
      teaser: 'Det ligger et større spørsmål her enn berging. Jeg klarer ikke slippe det.',
      reveal_when: {
        op: 'all',
        children: [
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_dod',
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
    },
  ],
  hypotheses: [
    {
      id: 'h_gd_system',
      title: 'Husholdet er et system med to. Med én står det stille.',
      summary:
        'Mat, avtaler, post og kontakt går gjennom arbeidsdeling som forsvinner med Grete. Det er systemet som dør, ikke bare et fravær.',
      question_id: 'q_grete_dor',
      availability: {
        op: 'all',
        children: [
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_smart_gutt',
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
            tiltak_ids: ['t_matlevering'],
          },
        },
      ],
    },
    {
      id: 'h_gd_infra',
      title: 'Alt praktisk er usynlig infrastruktur: mat, post, kontakt.',
      summary:
        'Funksjonene er ikke dokumentert noe sted og overlever ikke bortfall uten overføring.',
      question_id: 'q_grete_dor',
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
              fact_id: 'f_ingen_matkjop',
            },
          },
        ],
      },
      opening_sources: [
        {
          op: 'open_tiltak',
          args: {
            tiltak_ids: ['t_hjemmehjelp', 't_matlevering', 't_dokgjennomgang'],
          },
        },
      ],
    },
    {
      id: 'h_gd_ukjent',
      title: 'Ingenting vi vet. Ingen har noen gang sett Elling alene.',
      summary:
        'Det finnes ikke observasjon av Elling uten Grete. Uvitenheten er selve funnet — og den må lukkes før noe annet.',
      question_id: 'q_grete_dor',
      availability: {
        op: 'all',
        children: [
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_aldri_alene',
            },
          },
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_ingen_plan',
            },
          },
        ],
      },
      opening_sources: [
        {
          op: 'open_dispatches',
          args: {
            dispatch_ids: ['hjemmebesok'],
          },
        },
      ],
    },
    {
      id: 'h_ev_kanmer',
      title: 'Mer enn det ser ut til.',
      summary: 'Konsentrasjon, arkiv og system er observert.',
      question_id: 'q_evner',
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
      id: 'h_ev_unngaar',
      title: 'Han forstår — men unngår. Posten ligger uåpnet, ikke ulest.',
      summary:
        'Kapasiteten til å forstå er observert. Papiret når likevel aldri frem, fordi konvolutten aldri åpnes. Problemet er kanal, ikke forståelse.',
      question_id: 'q_evner',
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
      id: 'h_ev_ukjent',
      title: 'Vet ikke. Ingen har prøvd. Det er selve funnet.',
      summary:
        'Kommunen har ingen observasjon av hva Elling klarer alene. Første tiltak må være å finne det ut — forsiktig.',
      question_id: 'q_evner',
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
      id: 'h_ok_kjede',
      title: 'Betalingskjeden er én person. Kjeden, ikke beløpene, er risikoen.',
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
        {
          op: 'open_dispatches',
          args: {
            dispatch_ids: ['d_konto'],
          },
        },
      ],
    },
    {
      id: 'h_ok_gap',
      title: 'Trygden dekker ikke boligen. 2 [icon=coin] mangler hver måned.',
      summary:
        'Ellings trygd er 2 [icon=coin]. Boligen koster 3 [icon=coin]. Differansen bæres i dag av Gretes pensjon. Bortfall gir umiddelbar restanserisiko.',
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
            tiltak_ids: ['t_bostotte', 't_huseier'],
          },
        },
        {
          op: 'open_dispatches',
          args: {
            dispatch_ids: ['d_konto'],
          },
        },
        {
          op: 'open_conversation',
          args: {
            conversation_id: 'c_frank_okonomi',
          },
          type: 'conversation',
          category: 'frank',
          actor: 'frank',
          risk_tags: ['okonomi'],
          sim_hook_id: 'case.olsen.opening.conversation.frank_okonomi',
        },
      ],
    },
    {
      id: 'h_b_sikres',
      title: 'Boligen kan sikres — med bostøtte og ordnet betalingskjede.',
      summary:
        'Med bostøtte og en betalingskjede som ikke går gjennom én person kan leieforholdet overleve.',
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
        'Privat, muntlig leieforhold uten kontrakt tåler ikke dødsfallet. Å vente er å velge kaos senere.',
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
      summary: 'Å velge bolig-retning uten regnestykket er gjetning. Kartlegg først.',
      question_id: 'q_bolig',
      opening_sources: [
        {
          op: 'open_dispatches',
          args: {
            dispatch_ids: ['d_konto'],
          },
        },
      ],
    },
    {
      id: 'h_ba_kanal',
      title: 'Først en kanal. Fast person, fast tid, oppmøte — telefonen er stengt.',
      summary:
        'Elling tar ikke telefonen og holder avstand til fremmede. Uten en kanal inn er alle andre tiltak teori.',
      question_id: 'q_baering',
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
      id: 'h_ba_drift',
      title: 'Deler av driften: mat og papir kan erstattes uten å erstatte Grete.',
      summary:
        'Matlevering og dokumentgjennomgang dekker de kritiske funksjonene uten å institusjonalisere noe som helst.',
      question_id: 'q_baering',
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
              fact_id: 'f_ingen_matkjop',
            },
          },
        ],
      },
      opening_sources: [
        {
          op: 'open_tiltak',
          args: {
            tiltak_ids: ['t_matlevering', 't_dokgjennomgang'],
          },
        },
      ],
    },
    {
      id: 'h_ba_alt',
      title: 'Alt. Fullt omsorgsansvar — institusjon eller omsorgsbolig.',
      summary:
        'Sårbarheten vurderes som for stor for hjemmeboende støtte. Tyngste ende av skalaen — og den kan alltid utløses.',
      question_id: 'q_baering',
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
      id: 'h_ve_rutine',
      title: 'Én rutine om gangen. Konsentrasjonen er der; tempoet må være hans.',
      summary:
        'Kapasitet til fordypning og system er observert. Avgrensede rutiner kan bygges med støtte — lavt tempo, fast person, hans eget arkivspråk.',
      question_id: 'q_vekst',
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
      id: 'h_ve_formell',
      title: 'Ferdighetene er der ikke. Støtte må bære — læring er ikke planen nå.',
      summary:
        'Funksjonsnivået vurderes som for lavt for egenmestring. Tjenestene må dimensjoneres for full kompensasjon.',
      question_id: 'q_vekst',
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
            tiltak_ids: ['t_hjemmehjelp'],
          },
        },
      ],
    },
    {
      id: 'h_ve_interesser',
      title: 'Vokse i det han alt gjør: arkivet, systemene, interessene.',
      summary:
        'Identitet over progresjon: bygg videre på Gro-arkivet og systemene han allerede driver, ikke på manglene.',
      question_id: 'q_vekst',
      availability: {
        op: 'fact_lifted',
        args: {
          fact_id: 'f_utklipp',
        },
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
      id: 'h_c_penger',
      title: 'Økonomien. Husleien stopper denne måneden.',
      summary: 'Betalingskjeden døde med Grete. Restansen begynner å løpe nå.',
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
            tiltak_ids: ['t_forvaltning', 't_bostotte'],
          },
        },
      ],
    },
    {
      id: 'h_c_mat',
      title: 'Maten. Ingen matkjøp står i hans navn.',
      summary: 'Grete handlet inn. Kontoutskriften hans viser ikke ett matkjøp.',
      question_id: 'q_kollaps',
      availability: {
        op: 'fact_lifted',
        args: {
          fact_id: 'f_ingen_matkjop',
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
      summary: 'Dødsbudskapet gikk gjennom brevsprekken. Døren er fortsatt lukket.',
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
      id: 'h_liv_interesser',
      title: 'Deltakelse via interessene. Arkivet er en dør ut, ikke et symptom.',
      summary:
        'Gro-arkivet og systematikken er en identitet det går an å delta gjennom — i hans tempo.',
      question_id: 'q_liv',
      availability: {
        op: 'all',
        children: [
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_utklipp',
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
      opening_sources: [],
    },
    {
      id: 'h_liv_trygghet',
      title: 'Trygghet først. Verden i hans tempo, med møbel imellom — og det er greit.',
      summary:
        'Avstanden er ikke et problem som skal fikses, men et premiss tjenestene må respektere.',
      question_id: 'q_liv',
      availability: {
        op: 'fact_lifted',
        args: {
          fact_id: 'f_avstand',
        },
      },
      opening_sources: [],
    },
    {
      id: 'h_liv_sporre',
      title: 'Det vet bare Elling. Noen må spørre ham — og noen må kunne få svar.',
      summary: 'Ingen har spurt Elling hva han vil. Svaret krever en kanal som virker.',
      question_id: 'q_liv',
      availability: {
        op: 'fact_lifted',
        args: {
          fact_id: 'f_elling_tlf',
        },
      },
      opening_sources: [],
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
      weight: 'heavy',
    },
  ],
  dispatches: [
    {
      id: 'd_konto',
      title: 'Be om økonomisk oversikt',
      sim_hook_id: 'case.olsen.dispatch.account_overview',
      description:
        'Frank ringer til Grete og spør om hun kan skaffe en bankutskrift. Utskriften kommer i morgen.',
      activity_title: 'BE OM BANKUTSKRIFT',
      duration_h: 1,
      occupies_hours: 3,
      channel: 'scheduled',
      channel_delay_minutes: 480,
      reception_modifier: 1,
      gate: {
        op: 'fact_lifted',
        args: {
          fact_id: 'f_gap',
        },
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
    {
      id: 'hjemmebesok',
      title: 'Hjemmebesøk',
      sim_hook_id: 'case.olsen.dispatch.hjemmebesok',
      description: 'Frank drar på uanmeldt besøk til leiligheten.',
      activity_title: 'HJEMMEBESØK',
      duration_h: 2,
      occupies_hours: 2,
      channel: 'now',
      channel_delay_minutes: 0,
      reception_modifier: -1,
      gate: {
        op: 'fact_lifted',
        args: {
          fact_id: 'f_saarbar',
        },
      },
      effects: [],
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
    },
    {
      id: 'ck_restanse',
      label: 'Husleierestanse',
      sim_hook_id: 'case.olsen.clock.restanse',
      question: 'Blir leieproblemet en aktiv sak før støtten er på plass?',
      good_segment_label: '',
      good_segment_size: 0,
      bad_segment_label: 'Restanse bygges',
      bad_segment_size: 6,
      max_value: 6,
    },
    {
      id: 'ck_grete',
      label: 'Grete tilgjengelig',
      sim_hook_id: 'case.olsen.clock.grete',
      question: 'Hvor lenge bærer hun?',
      good_segment_label: '',
      good_segment_size: 0,
      bad_segment_label: 'Grete er død',
      bad_segment_size: 5,
      max_value: 5,
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
  day_script_beats: [
    {
      id: 'beat_grete_d2',
      day: 2,
      text: 'Grete blir sliten.',
      effects: [],
    },
    {
      id: 'beat_grete_d3',
      day: 3,
      text: 'Grete skulle ringe tilbake om papirene. Hun ringte ikke.',
      effects: [],
    },
    {
      id: 'beat_grete_d4',
      day: 4,
      text: 'Grete er innlagt.',
      effects: [
        {
          op: 'queue_pending_document',
          args: {
            clock_id: 'ck_grete',
            document_id: 'doc_innleggelse',
            delay_days: 0,
          },
        },
      ],
    },
    {
      id: 'beat_grete_d5',
      day: 5,
      text: 'Grete Olsen er død.',
      effects: [
        {
          op: 'queue_pending_document',
          args: {
            clock_id: 'ck_grete',
            document_id: 'doc_dodsfall',
            delay_days: 0,
          },
        },
      ],
    },
    {
      id: 'beat_grete_d6',
      day: 6,
      text: 'Håndskrevet brev · T. Bakkerud',
      effects: [
        {
          op: 'queue_pending_document',
          args: {
            clock_id: 'ck_grete',
            document_id: 'doc_huseier',
            delay_days: 0,
          },
        },
      ],
    },
    {
      id: 'beat_grete_d8',
      day: 8,
      text: 'En uke siden meldingen.',
      effects: [
        {
          op: 'queue_pending_document',
          args: {
            clock_id: 'ck_grete',
            document_id: 'doc_status',
            delay_days: 0,
          },
        },
      ],
    },
  ],
  frank_chat: [
    {
      id: 'c_post',
      question: 'Posten i gangen — likegyldighet?',
      answer:
        'Nei. Han vet nøyaktig hva som ligger der. Han la merke til at jeg så på bunken, og han ble urolig av det. Det er ikke likegyldighet. Det er noe som ligner mer på frykt for hva papiret krever av svar.',
      needs: ['f_post'],
      answer_lines: [
        'Nei. Han vet nøyaktig hva som ligger der. Han la merke til at jeg så på bunken, og han ble urolig av det.',
        'Det er ikke likegyldighet. Det er noe som ligner mer på frykt for hva papiret krever av svar.',
      ],
      followups: [
        {
          label: 'Frykt for hva, helt konkret?',
          lines: [
            'For hva svaret koster. Hvert brev er en beskjed om at noen venter på noe han ikke får til.',
            'Jeg tror han sluttet å åpne den dagen han sluttet å kunne svare. De to tingene henger sammen.',
          ],
        },
        {
          label: 'Hva gjør vi med bunken?',
          lines: [
            'Ikke ta den fra ham. Da tar du det siste han har kontroll på.',
            'Åpne ett brev. Sammen. Det ufarligste først — strømregningen, ikke sosialkontoret. La ham se at et åpnet brev ikke eksploderer.',
          ],
        },
      ],
    },
    {
      id: 'c_smart',
      question: '«En smart gutt» — hva la du i det?',
      answer:
        'Hun sa det i trappen, lavt, som om det var en hemmelighet. Hun har båret ham så lenge at jeg tror hun ikke lenger vet hva som er ham og hva som er henne. Det er det vi egentlig skal kartlegge.',
      needs: ['f_smart_gutt'],
      answer_lines: [
        'Hun sa det i trappen, lavt, som om det var en hemmelighet. Hun har båret ham så lenge at jeg tror hun ikke lenger vet hva som er ham og hva som er henne.',
        'Det er det vi egentlig skal kartlegge.',
      ],
      followups: [
        {
          label: 'Kartlegge — hva da, egentlig?',
          lines: [
            'Hvor Grete slutter og Elling begynner.',
            'Alt hun gjør ligner omsorg. Noe av det er det. Resten er femti år med vane som ingen har turt å forstyrre.',
          ],
        },
      ],
    },
    {
      id: 'c_klarer',
      question: 'Tror du på «han klarer seg»?',
      answer:
        'Folk sier det på to måter. Som en vurdering, eller som et håp. Hun sa det to ganger. Andre gangen var det et håp.',
      needs: ['f_klarer_seg'],
      answer_lines: [
        'Folk sier det på to måter. Som en vurdering, eller som et håp. Hun sa det to ganger. Andre gangen var det et håp.',
      ],
      followups: [],
    },
    {
      id: 'c_bok',
      question: 'Boken og notatene — hva sier det deg?',
      answer:
        'Tre setninger om Nansen, presise, til veggen. Det er ikke en som mangler evner. Det er en som mangler trening i å ha noen i rommet. Det er to forskjellige problemer. Og de har to forskjellige løsninger.',
      needs: ['f_bok'],
      answer_lines: [
        'Tre setninger om Nansen, presise, til veggen. Det er ikke en som mangler evner. Det er en som mangler trening i å ha noen i rommet.',
        'Det er to forskjellige problemer. Og de har to forskjellige løsninger.',
      ],
      followups: [
        {
          label: 'To løsninger — hvilke?',
          lines: [
            'Evnene trenger ingenting av oss. De er der. Rommet trenger trening.',
            'Én person. Samme person, samme tid, hver uke — til det slutter å være farlig å ha noen der. Alt annet er støy.',
          ],
        },
        {
          label: 'Kan han bo alene, mener du?',
          lines: [
            'Feil spørsmål. Han har aldri fått prøvd.',
            'Ingen har noen gang sett ham gjøre noe alene. Ikke fordi han ikke kan — fordi ingen har sluppet ham til. Vi vet ikke hva han klarer. Det burde uroe deg mer enn posten.',
          ],
          tanke: 'VURDERING — «Vet ikke» er ikke et hull i saken. Det ER saken.',
        },
      ],
    },
    {
      id: 'c_avstand',
      question: 'Møbelet mellom dere — hvor lang vei er det inn?',
      answer:
        'Lang. Men han kastet meg ikke ut, og han svarte da jeg spurte om noe han kunne. Det er en dør på gløtt. Den lukkes hvis vi river i den.',
      needs: ['f_avstand'],
      answer_lines: [
        'Lang. Men han kastet meg ikke ut, og han svarte da jeg spurte om noe han kunne.',
        'Det er en dør på gløtt. Den lukkes hvis vi river i den.',
      ],
      followups: [
        {
          label: 'Hva var det som åpnet den?',
          lines: [
            'At jeg spurte om noe han kunne svare på. Ikke omsorg. Kunnskap.',
            'Det er kanalen inn: la ham være den som vet. Alle andre i livet hans har vært den som ordner.',
          ],
        },
        {
          label: 'Og hvis vi river i den?',
          lines: [
            'Da lukkes den. Og jeg tror ikke den åpner for den neste som ringer på.',
            'Vi har én sjanse til å være de som ikke rev.',
          ],
        },
      ],
      pays_fact: 'f_dor_glott',
    },
    {
      id: 'c_gro',
      question: 'Utklippene av Gro — hva gjør vi med det?',
      answer:
        'Jeg spurte om valget i -97. Han snakket i fire minutter uten pause — årstall, navn, partilandsmøter. Ikke til meg. Men det var nesten. Det arkivet er det mest levende i den leiligheten. Hvis vi noen gang skal bygge noe med ham, begynner det der.',
      needs: ['f_utklipp'],
      answer_lines: [
        'Jeg spurte om valget i -97. Han snakket i fire minutter uten pause — årstall, navn, partilandsmøter. Ikke til meg. Men det var nesten.',
        'Det arkivet er det mest levende i den leiligheten. Hvis vi noen gang skal bygge noe med ham, begynner det der.',
      ],
      followups: [
        {
          label: 'Begynne der — hvordan, konkret?',
          lines: [
            'Spør ham om ting han vet. Politikk, årstall, fakta. Aldri om følelser, aldri om Grete.',
            'Han snakker når han er den som kan noe og du er den som spør. Snu rollene, og døren er igjen.',
          ],
        },
      ],
    },
    {
      id: 'c_brevsprekk',
      question: 'Brevsprekken. Hørte han det, tror du?',
      answer:
        'Han sto rett innenfor. Politiet hørte ham puste. Han hørte hvert ord, og han klarte ikke å åpne. Det er det vi jobber med nå. Ikke sorgen. Døren.',
      needs: ['f_brevsprekken'],
      answer_lines: [
        'Han sto rett innenfor. Politiet hørte ham puste. Han hørte hvert ord, og han klarte ikke å åpne. Det er det vi jobber med nå. Ikke sorgen. Døren.',
      ],
      followups: [],
    },
    {
      id: 'c_dor_glott',
      question: 'Døren på gløtt — hva holder den åpen?',
      answer: '',
      needs: ['f_dor_glott'],
      answer_lines: [
        'At noen spør ham om noe han kan svare på. Det er hele mekanikken.',
        'Den tåler ikke omsorg ennå. Den tåler spørsmål.',
      ],
      followups: [],
    },
  ],
  frank_proposals: [
    {
      handbok_id: 'matlevering',
      line: 'Matlevering, kanskje. Ingen matkjøp står i hans navn — middag på døra tre dager i uken kan overta. Forutsetter at døren er en kanal.',
      relevant_fact_ids: ['f_ingen_matkjop', 'f_dor_glott'],
      order: 0,
    },
    {
      handbok_id: 'hjemmehjelp',
      line: 'Praktisk bistand. Én fast person, én fast tid — det er den eneste kanalen inn som har virket hittil.',
      relevant_fact_ids: ['f_avstand', 'f_elling_tlf', 'f_dor_glott'],
      order: 1,
    },
    {
      handbok_id: 'bostotte',
      line: 'Søk bostøtte. Trygden dekker ikke husleien — tilskuddet kan tette gapet. Papirarbeid, men det haster.',
      relevant_fact_ids: ['f_gap', 'f_trygd', 'f_husleie'],
      relevant_categories: ['Økonomi'],
      order: 2,
    },
    {
      handbok_id: 'forvaltning',
      line: 'Frivillig forvaltning, kanskje. Skoesken trenger en ny operatør — kommunen kan betale de faste utgiftene direkte. Trygt. Bygger ingenting.',
      relevant_fact_ids: ['f_alt_via_grete', 'f_husleie', 'f_gap'],
      order: 3,
    },
    {
      handbok_id: 'mekling',
      line: 'Utleier-mekling. Bakkerud vil vite hvem han skal forholde seg til — en betalingsplan kan roe det før torsdagsbesøket.',
      relevant_fact_ids: ['f_huseier_kommer', 'f_leie_stoppet', 'f_leie_privat'],
      order: 4,
    },
    {
      handbok_id: 'boopp',
      line: 'Booppfølging, muligens. En miljøarbeider ukentlig kan holde boligdriften samlet — hvis han tåler en ny person i rommet.',
      relevant_fact_ids: ['f_leie_stoppet', 'f_post'],
      order: 5,
    },
    {
      handbok_id: 'radgivning',
      line: 'Økonomisk rådgivning. Time hos gjeldsrådgiver — på kontoret. Jeg er usikker på om han kommer seg dit.',
      relevant_fact_ids: ['f_gap', 'f_post'],
      relevant_categories: ['Økonomi'],
      order: 6,
    },
    {
      handbok_id: 'innkjop',
      line: 'Innkjøpsordning. Ingen har handlet for ham siden Grete — varer levert én gang i uken er det minste som kan virke.',
      relevant_fact_ids: ['f_ingen_matkjop', 'f_alt_via_grete'],
      order: 7,
    },
    {
      handbok_id: 'maltidsvenn',
      line: 'Måltidsvenn, forsiktig. Noen som spiser middag MED ham — men det er en fremmed ved bordet. Usikker.',
      relevant_fact_ids: ['f_avstand', 'f_ingen_matkjop'],
      order: 8,
    },
    {
      handbok_id: 'kartlegging',
      line: 'Funksjonskartlegging. Ingen har noen gang sett Elling alene — et strukturert besøk kan lukke det hullet.',
      relevant_fact_ids: ['f_aldri_alene', 'f_ingen_plan'],
      order: 9,
    },
    {
      handbok_id: 'oppfolging',
      line: 'Oppfølgingsvedtak, kanskje. To timer ekstra per dag i saken — hvis dette skal bæres, må noen få tid til å bære.',
      relevant_fact_ids: ['f_ingen_tjenester', 'f_ingen_plan'],
      order: 10,
    },
    {
      handbok_id: 'samtaler',
      line: 'Støttesamtaler, på sikt. Fast samtalekontakt én gang i uken — men kanalen inn må finnes først.',
      relevant_fact_ids: ['f_brevsprekken', 'f_avstand'],
      order: 11,
    },
    {
      handbok_id: 'stottekontakt',
      line: 'Støttekontakt. Tre timer i uken rundt det han allerede bryr seg om — arkivet er et sted å begynne.',
      relevant_fact_ids: ['f_utklipp', 'f_bok'],
      order: 12,
    },
    {
      handbok_id: 'tilsyn',
      line: 'Tilsynsbesøk daglig. Hjemmetjenesten innom hver dag — det er mye trykk på en lukket dør. Tyngre enn jeg liker.',
      relevant_fact_ids: ['f_saarbar', 'f_brevsprekken'],
      order: 13,
    },
    {
      handbok_id: 'besoksvenn',
      line: 'Besøksvenn, kanskje. Frivillig én gang i uken — mildere enn tjenester, men fortsatt en fremmed i stuen.',
      relevant_fact_ids: ['f_avstand', 'f_aldri_alene'],
      order: 14,
    },
    {
      handbok_id: 'dagsenter',
      line: 'Dagsenter er langt unna der han er nå. To dager i uken ute blant folk — jeg tror ikke han går dit ennå.',
      relevant_fact_ids: ['f_avstand', 'f_ingen_tjenester'],
      order: 15,
    },
    {
      handbok_id: 'folgetjeneste',
      line: 'Følgetjeneste. Følge til avtaler utenfor hjemmet — hvis det noen gang blir avtaler.',
      relevant_fact_ids: ['f_elling_tlf', 'f_ingen_tjenester'],
      order: 16,
    },
    {
      handbok_id: 'hverdagsrehab',
      line: 'Hverdagsrehabilitering, muligens. Fire uker trening i egen bolig — men et tverrfaglig lag i leiligheten er mye på én gang.',
      relevant_fact_ids: ['f_bok', 'f_avstand'],
      order: 17,
    },
    {
      handbok_id: 'parorende',
      line: 'Pårørendestøtte. Grete bar alt — avlastning og veiledning kunne lettet henne mens hun ennå bærer.',
      relevant_fact_ids: ['f_grete_baerer', 'f_grete_syk'],
      order: 18,
    },
    {
      handbok_id: 'tt',
      line: 'TT-kort. Subsidiert transport, åtte turer i måneden — men han har ingen steder han skal ennå.',
      relevant_fact_ids: ['f_avstand', 'f_ingen_tjenester'],
      order: 19,
    },
    {
      handbok_id: 'alarm',
      line: 'Trygghetsalarm, tja. Utrykning ved fall — jeg er usikker på om det treffer det som er skjørt her.',
      relevant_fact_ids: ['f_saarbar'],
      order: 20,
    },
    {
      handbok_id: 'depositum',
      line: 'Depositumsgaranti. Bare aktuelt hvis det blir flytting — garanti for et nytt leieforhold.',
      relevant_fact_ids: ['f_leie_privat', 'f_leie_stoppet'],
      order: 21,
    },
    {
      handbok_id: 'kbolig',
      line: 'Kommunal bolig, hvis leiligheten ikke kan holdes. Men å flytte ham er å flytte alt han er.',
      relevant_fact_ids: ['f_leie_stoppet', 'f_gap'],
      order: 22,
    },
    {
      handbok_id: 'startlan',
      line: 'Startlån. Lån til kjøp av egen bolig — det er langt fra der denne saken står.',
      relevant_fact_ids: ['f_trygd', 'f_gap'],
      order: 23,
    },
  ],
  pair_soft_reject_line: 'De to? Jeg ser ikke tråden mellom dem. Ennå.',
  pair_already_set_line: 'Det spørsmålet har vi allerede stående.',
  recipes: [
    {
      question_id: 'q_vekst',
      pair: ['f_bok', 'f_utklipp'],
      reading: 'Jeg så noe hos ham som kan bygges på. Usikker på tempoet. Vi bør snakke om det.',
      frank_lines: [
        'Boken og utklippene. Ja. Jeg har tenkt på dem sammen, men jeg fikk det ikke sagt.',
        'Han holder krevende stoff i hodet og noterer systematisk. Og han klipper ut, daterer og ordner. Begge deler er hans egne.',
        'Så spørsmålet er ikke om han kan lære. Det er hva som kan læres — og i hvilket tempo, uten å knekke noe.',
      ],
    },
    {
      question_id: 'q_grete_dor',
      pair: ['f_grete_syk', 'f_klarer_seg'],
      reading:
        'Det er noe her om hva som faktisk stopper den dagen Grete ikke er der. Jeg har ikke ord på det ennå.',
      frank_lines: [
        'Haug skriver kort forventet forløp. Grete sier han klarer seg. Begge kan ikke ha rett.',
        'Hun har båret alt så lenge at hun ikke ser det selv. Den dagen hun ikke kommer hjem, stopper noe — og vi vet ikke hva.',
        'Jeg tror ikke vi finner det med spørsmål. Jeg tror vi finner det ved å være der.',
      ],
    },
  ],
  calls: [
    {
      contact_id: 'grete',
      gate: {
        op: 'fact_lifted',
        args: {
          fact_id: 'f_grete_baerer',
        },
      },
      opening: [
        {
          text: 'Ja, hallo?',
        },
        {
          who: 'du',
          text: 'Det gjelder Elling. Dr. Haug har meldt bekymring.',
        },
        {
          text: 'Han klarer seg. Han har alltid klart seg.',
          fact_id: 'f_klarer_seg',
        },
      ],
      soft_reject: '… Jeg vet ikke hva du mener med det.',
      exchanges: [
        {
          card_id: 'f_grete_baerer',
          ask: 'Hvem overtar hvis du skulle bli innlagt?',
          reply: [
            {
              text: '… (det blir stille i den andre enden)',
              fact_id: 'f_ingen_plan',
            },
          ],
        },
        {
          card_id: 'f_aldri_alene',
          ask: 'Kan jeg få hilse på Elling?',
          reply: [
            {
              text: 'Han tar ikke telefonen. Det er ikke noe galt med ham. Han liker bare ikke apparatet.',
              fact_id: 'f_elling_tlf',
            },
          ],
        },
        {
          card_id: 'f_saarbar',
          ask: 'Vi vil gjerne komme på hjemmebesøk.',
          reply: [
            {
              text: 'Betyr dette at noen kommer til å ta ham fra leiligheten?',
              fact_id: 'f_grete_redd',
            },
            {
              text: '… Hvis det må til.',
            },
          ],
        },
      ],
    },
  ],
} as const;
