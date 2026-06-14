import type {
  BlueprintChatPrompt,
  BlueprintDispatch,
  BlueprintDocument,
  BlueprintDomain,
  BlueprintFact,
  BlueprintQuestion,
  BlueprintStoryBeat,
  BlueprintTextRun,
  BlueprintTiltak,
  BlueprintTiltakSlot,
} from '../../domain/blueprint';

function runs(...items: Array<string | BlueprintTextRun>): BlueprintTextRun[] {
  return items.map((item) => (typeof item === 'string' ? { text: item } : item));
}

export const blueprintPrologue: BlueprintStoryBeat[] = [
  { cap: 'LEGESENTERET · TIRSDAG I FEBRUAR 1999' },
  { who: 'DR. HAUG', say: 'Prøvesvarene er kommet. Det er som vi trodde.' },
  { who: 'GRETE', say: 'Ja.' },
  { dir: 'Det er stille en stund. Noen ler av noe i naborommet.' },
  { who: 'DR. HAUG', say: 'Har du noen rundt deg? Fremover, mener jeg.' },
  { who: 'GRETE', say: 'Jeg har Elling.' },
  { who: 'DR. HAUG', say: 'Grete. Det var Elling jeg ville snakke om.' },
  { who: 'GRETE', say: 'Han klarer seg. Han har alltid klart seg.' },
  { who: 'DR. HAUG', say: 'Med deg.' },
  { dir: 'Grete tar på seg hanskene. Én finger om gangen.' },
  { who: 'GRETE', say: 'Dere får gjøre det dere må.' },
  {
    dir: 'Etter at hun har gått, blir Haug sittende litt. Så skriver han. To avsnitt. Han leser dem en gang til og stryker ordet «alvorlig». Sender.',
  },
  { stamp: 'MOTTATT · SOSIALKONTORET', end: 'Meldingen ligger på pulten din.' },
];

export const blueprintDomains: BlueprintDomain[] = [
  'Økonomi/bolig',
  'Hverdag/rutine',
  'Helse/risiko',
  'Nettverk/sosialt',
  'Ressurser',
];

export const blueprintFacts: Record<string, BlueprintFact> = {
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
    quote: 'har etter det opplyste aldri bodd alene',
    supports: ['q_hverdag', 'q_selv'],
    discuss: ['Frank', 'Grete'],
  },
  f_grete_baerer: {
    id: 'f_grete_baerer',
    domain: 'Hverdag/rutine',
    category: 'Dokument',
    text: 'Grete bistår med gjøremål, økonomi og kontakt med tjenester.',
    quote: 'mor opplyser at hun bistår med praktiske gjøremål, økonomisk oversikt og kontakt',
    supports: ['q_hverdag', 'q_okonomi'],
    discuss: ['Frank', 'Grete'],
  },
  f_saarbar: {
    id: 'f_saarbar',
    domain: 'Helse/risiko',
    category: 'Risiko',
    text: 'Elling vurderes som sårbar ved bortfall av pårørende.',
    quote: 'sårbar ved bortfall av pårørende',
    supports: ['q_hverdag', 'q_selv'],
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
  f_klarer_seg: {
    id: 'f_klarer_seg',
    domain: 'Nettverk/sosialt',
    category: 'Samtale',
    text: 'Grete avviser bekymringen. Gjentar formuleringen.',
    quote: 'Han klarer seg. Han har alltid klart seg.',
    supports: ['q_hverdag', 'q_kontakt'],
    discuss: ['Frank'],
  },
  f_ingen_plan: {
    id: 'f_ingen_plan',
    domain: 'Helse/risiko',
    category: 'Samtale',
    text: 'Det finnes ingen plan for hvem som overtar etter Grete.',
    quote: 'hvem som overtar hvis hun blir innlagt. det ble stille.',
    supports: ['q_hverdag', 'q_bolig'],
    discuss: ['Frank', 'Grete'],
  },
  f_elling_tlf: {
    id: 'f_elling_tlf',
    domain: 'Nettverk/sosialt',
    category: 'Samtale',
    text: 'Elling tar ikke telefonen. Grete normaliserer det.',
    quote: 'han liker bare ikke apparatet',
    supports: ['q_kontakt'],
    discuss: ['Frank', 'Grete'],
  },
  f_grete_redd: {
    id: 'f_grete_redd',
    domain: 'Nettverk/sosialt',
    category: 'Samtale',
    text: 'Grete frykter at kommunen vil ta leiligheten, eller Elling.',
    quote: 'ta ham fra leiligheten',
    supports: ['q_bolig'],
    discuss: ['Frank'],
  },
  f_post: {
    id: 'f_post',
    domain: 'Hverdag/rutine',
    category: 'Observasjon',
    text: 'Uåpnet post samler seg. Grete håndterer den og skjuler den.',
    quote: 'en bunke uåpnet post på skoskapet',
    supports: ['q_hverdag', 'q_okonomi', 'q_kontakt'],
    discuss: ['Frank'],
  },
  f_kalender: {
    id: 'f_kalender',
    domain: 'Hverdag/rutine',
    category: 'Observasjon',
    text: 'Kalenderen føres av Grete. Avtaler finnes bare så lenge hun fører dem.',
    quote: 'alle avtaler ført med samme håndskrift',
    supports: ['q_hverdag'],
    discuss: ['Frank'],
  },
  f_matbokser: {
    id: 'f_matbokser',
    domain: 'Hverdag/rutine',
    category: 'Observasjon',
    text: 'Maten er preppet av Grete, merket med ukedager. Elling varmer.',
    quote: 'middagsbokser merket med ukedager',
    supports: ['q_hverdag', 'q_selv', 'q_kollaps'],
    discuss: ['Frank', 'Grete'],
  },
  f_bok: {
    id: 'f_bok',
    domain: 'Ressurser',
    category: 'Ressurs',
    text: 'Elling leser krevende stoff og noterer systematisk.',
    quote: 'en bok om polarekspedisjoner. han noterte i margen',
    supports: ['q_selv', 'q_okonomi'],
    discuss: ['Frank'],
  },
  f_utklipp: {
    id: 'f_utklipp',
    domain: 'Ressurser',
    category: 'Ressurs',
    text: 'Elling samler og systematiserer Gro- og Arbeiderpartiet-utklipp.',
    quote: 'avisutklipp, sirlig montert. Gro, landsmøter, 1. mai',
    supports: ['q_selv'],
    discuss: ['Frank'],
  },
  f_avstand: {
    id: 'f_avstand',
    domain: 'Nettverk/sosialt',
    category: 'Observasjon',
    text: 'Elling holder avstand til fremmede. Alltid et møbel mellom.',
    quote: 'alltid et møbel mellom oss',
    supports: ['q_kontakt', 'q_selv'],
    discuss: ['Frank'],
  },
  f_smart_gutt: {
    id: 'f_smart_gutt',
    domain: 'Nettverk/sosialt',
    category: 'Samtale',
    text: 'Grete omtaler Elling (35) som «gutt». Rollene er fastlåst.',
    quote: 'han er en smart gutt',
    supports: ['q_hverdag', 'q_selv'],
    discuss: ['Frank'],
  },
  f_trygd: {
    id: 'f_trygd',
    domain: 'Økonomi/bolig',
    category: 'Økonomi',
    text: 'Ellings uføretrygd: to mynter i måneden.',
    quote: 'trygden hans — to mynter i måneden',
    supports: ['q_okonomi', 'q_bolig'],
    discuss: ['Frank'],
  },
  f_husleie: {
    id: 'f_husleie',
    domain: 'Økonomi/bolig',
    category: 'Økonomi',
    text: 'Husleien er tre mynter og betales av Grete.',
    quote: 'husleien — tre mynter. den betales kontant til huseieren',
    supports: ['q_okonomi', 'q_bolig'],
    discuss: ['Frank', 'Grete'],
  },
  f_alt_via_grete: {
    id: 'f_alt_via_grete',
    domain: 'Økonomi/bolig',
    category: 'Økonomi',
    text: 'Alle betalinger og avtaler går gjennom Grete.',
    quote: 'alle betalinger går gjennom Grete. alle avtaler står i hennes navn',
    supports: ['q_okonomi'],
    discuss: ['Frank', 'Grete'],
  },
  f_gap: {
    id: 'f_gap',
    domain: 'Økonomi/bolig',
    category: 'Økonomi',
    text: 'Uten Gretes pensjon mangler husholdet to mynter hver måned.',
    quote: 'uten henne mangler det to mynter. hver måned',
    supports: ['q_okonomi', 'q_bolig', 'q_kollaps'],
    discuss: ['Frank'],
  },
  f_ingen_matkjop: {
    id: 'f_ingen_matkjop',
    domain: 'Hverdag/rutine',
    category: 'Økonomi',
    text: 'Elling har aldri betalt for mat selv.',
    quote: 'ikke ett kjøp som var hans',
    supports: ['q_hverdag'],
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
    quote: 'sønnen ikke er varslet. ber om at kommunen ser til ham',
    supports: ['q_kontakt', 'q_kollaps'],
    discuss: ['Frank'],
  },
  f_dod: {
    id: 'f_dod',
    domain: 'Helse/risiko',
    category: 'Dokument',
    text: 'Grete Olsen døde 15.02 kl. 04:12.',
    quote: 'dødsfall konstatert 15.02 kl. 04:12',
    supports: ['q_kollaps'],
    discuss: ['Frank'],
  },
  f_brevsprekken: {
    id: 'f_brevsprekken',
    domain: 'Nettverk/sosialt',
    category: 'Dokument',
    text: 'Dødsbudskapet ble gitt gjennom brevsprekken. Døren forble lukket.',
    quote: 'beskjeden ble gitt gjennom brevsprekken',
    supports: ['q_kontakt', 'q_kollaps'],
    discuss: ['Frank'],
  },
  f_leie_stoppet: {
    id: 'f_leie_stoppet',
    domain: 'Økonomi/bolig',
    category: 'Risiko',
    text: 'Husleien har stoppet. Betalingskjeden døde med Grete.',
    quote: 'leien for mars er ikke kommet',
    supports: ['q_bolig', 'q_kollaps'],
    discuss: ['Frank'],
  },
  f_huseier_kommer: {
    id: 'f_huseier_kommer',
    domain: 'Økonomi/bolig',
    category: 'Risiko',
    text: 'Huseieren varsler at han kommer innom torsdag.',
    quote: 'jeg kommer innom på torsdag',
    supports: ['q_bolig', 'q_kontakt'],
    discuss: ['Frank'],
  },
  f_leie_privat: {
    id: 'f_leie_privat',
    domain: 'Økonomi/bolig',
    category: 'Dokument',
    text: 'Leieforholdet er privat og muntlig innarbeidet siden 1971.',
    quote: 'siden -71 uten papirer',
    supports: ['q_bolig'],
    discuss: ['Frank'],
  },
  f_ubesvart: {
    id: 'f_ubesvart',
    domain: 'Nettverk/sosialt',
    category: 'Observasjon',
    text: 'Elling tar ikke telefonen, heller ikke når den ringer i hans egen stue.',
    quote: 'åtte ring. fasttelefonen står to meter fra stolen hans',
    supports: ['q_kontakt'],
    discuss: ['Frank'],
  },
  f_dor_glott: {
    id: 'f_dor_glott',
    domain: 'Nettverk/sosialt',
    category: 'Samtale',
    text: 'Døren er på gløtt: kontakt er mulig i Ellings tempo, med én fast person.',
    quote: 'det er en dør på gløtt',
    supports: ['q_kontakt', 'q_selv'],
    discuss: ['Frank'],
  },
  f_tirade: {
    id: 'f_tirade',
    domain: 'Ressurser',
    category: 'Observasjon',
    text: 'Press utløser foredrag, ikke mestring. Tempoet må være hans.',
    quote: 'et kvarter langt foredrag om apparatets historie',
    supports: ['q_selv', 'q_kontakt'],
    discuss: ['Frank'],
  },
  f_egen_mappe: {
    id: 'f_egen_mappe',
    domain: 'Ressurser',
    category: 'Observasjon',
    text: 'Elling lager egne systemer når ingen krever det av ham.',
    quote: 'en mappe han hadde laget selv. den var merket. små bokstaver',
    supports: ['q_selv'],
    discuss: ['Frank'],
  },
};

export const blueprintDocuments: Record<string, BlueprintDocument> = {
  doc_bekymring: {
    id: 'doc_bekymring',
    kind: 'BEKYMRINGSMELDING',
    title: 'Legesenteret · Dr. J. Haug',
    register: 'klinisk',
    peek: '«…anbefaler kommunal kartlegging av funksjon, hjelpebehov og overgangstiltak.»',
    meta: 'LEGESENTERET · 11.02.1999',
    blocks: [
      { id: 'b1', runs: runs('Gjelder: Olsen, Elling · f. 14.03.1964.') },
      {
        id: 'b2',
        runs: runs(
          'Undertegnede er fastlege for Grete Olsen og hennes sønn Elling Olsen. Mor er under utredning for ',
          { text: 'sykdom med kort forventet forløp', factId: 'f_grete_syk' },
          '. Hun er informert om at meldingen sendes.',
        ),
      },
      {
        id: 'b3',
        runs: runs(
          'Mor og sønn bor sammen i en treroms blokkleilighet. ',
          { text: 'Sønnen har aldri bodd alene', factId: 'f_aldri_alene' },
          '. Han er uføretrygdet og ',
          { text: 'ikke i kontakt med øvrige tjenester', factId: 'f_ingen_tjenester' },
          '.',
        ),
      },
      {
        id: 'b4',
        runs: runs({
          text: 'Mor opplyser at hun bistår med praktiske gjøremål, økonomisk oversikt og kontakt med tjenester',
          factId: 'f_grete_baerer',
        }),
      },
      {
        id: 'b5',
        runs: runs(
          { text: 'Pasienten fremstår sårbar ved bortfall av pårørende', factId: 'f_saarbar' },
          '. Anbefaler kommunal kartlegging av funksjon, hjelpebehov og overgangstiltak.',
        ),
      },
    ],
  },
  doc_frank_tlf: {
    id: 'doc_frank_tlf',
    kind: 'FELTNOTAT',
    title: 'Frank · telefonsamtale med Grete',
    register: 'notat',
    peek: '«Hun tok den på andre forsøk.»',
    meta: 'TLF. G. OLSEN · 4012 F. SOLBERG',
    blocks: [
      { id: 't1', runs: runs('Ringte Grete 11:40. Hun tok den på andre forsøk.') },
      {
        id: 't2',
        runs: runs({
          text: '«Han klarer seg. Han har alltid klart seg.» Hun sa det to ganger.',
          factId: 'f_klarer_seg',
        }),
      },
      {
        id: 't3',
        runs: runs({
          text: 'Jeg spurte hvem som overtar hvis hun skulle bli innlagt. Det ble stille.',
          factId: 'f_ingen_plan',
        }),
      },
      {
        id: 't4',
        runs: runs({
          text: 'Jeg ba om å få hilse på Elling. Hun sa han ikke tar telefonen. «Han liker bare ikke apparatet.»',
          factId: 'f_elling_tlf',
        }),
      },
      {
        id: 't5',
        runs: runs(
          'Mot slutten ',
          {
            text: 'spurte hun om dette betydde at noen kom til å ta ham fra leiligheten',
            factId: 'f_grete_redd',
          },
          '. Jeg sa nei. Jeg håper det var sant.',
        ),
      },
    ],
  },
  doc_frank_visit: {
    id: 'doc_frank_visit',
    kind: 'RAPPORT',
    title: 'Frank · hjemmebesøk Gabels gate 14',
    register: 'notat',
    peek: '«Hun hadde dekket på med tre kopper.»',
    meta: 'BLOKKA · 4. ETASJE · AVTALT VIA G. OLSEN',
    blocks: [
      {
        id: 'v1',
        runs: runs('Grete åpnet før jeg fikk ringt på. Tre kopper. Elling brukte ikke sin.'),
      },
      {
        id: 'v2',
        runs: runs('I gangen: ', {
          text: 'en bunke uåpnet post på skoskapet',
          factId: 'f_post',
        }),
      },
      {
        id: 'v3',
        runs: runs('På kjøkkenveggen: ', {
          text: 'kalender. Alle avtaler ført med samme håndskrift.',
          factId: 'f_kalender',
        }),
      },
      {
        id: 'v4',
        runs: runs('I kjøleskapet: ', {
          text: 'middagsbokser merket med ukedager, mandag til søndag',
          factId: 'f_matbokser',
        }),
      },
      {
        id: 'v5',
        runs: runs('Elling satt i stuen med ', {
          text: 'en bok om polarekspedisjoner. Han noterte i margen.',
          factId: 'f_bok',
        }),
      },
      {
        id: 'v6',
        runs: runs('Over skrivebordet hans: ', {
          text: 'avisutklipp, sirlig montert. Gro, landsmøter, 1. mai-tog.',
          factId: 'f_utklipp',
        }),
      },
      {
        id: 'v7',
        runs: runs({
          text: 'Han flyttet seg slik at det alltid var et møbel mellom oss.',
          factId: 'f_avstand',
        }),
      },
      {
        id: 'v8',
        runs: runs('Grete fulgte meg ut. I trappen sa hun: ', {
          text: '«Du så hvordan han er. Han er en smart gutt.»',
          factId: 'f_smart_gutt',
        }),
      },
    ],
  },
  doc_konto: {
    id: 'doc_konto',
    kind: 'ØKONOMISK OVERSIKT',
    title: 'Frank · husholdets økonomi',
    register: 'notat',
    peek: '«Regnestykket går opp — med henne.»',
    meta: 'GJENNOMGÅTT MED G. OLSEN VED KJØKKENBORDET',
    blocks: [
      { id: 'k1', runs: runs('Grete fant frem alt. Postgiroene ligger i en skoeske.') },
      {
        id: 'k2',
        runs: runs('Inn: ', {
          text: 'trygden hans — to mynter i måneden',
          factId: 'f_trygd',
        }),
      },
      {
        id: 'k3',
        runs: runs('Ut: ', {
          text: 'husleien — tre mynter. Den betales kontant til huseieren, av Grete',
          factId: 'f_husleie',
        }),
      },
      {
        id: 'k4',
        runs: runs({
          text: 'Alle betalinger går gjennom Grete. Alle avtaler står i hennes navn.',
          factId: 'f_alt_via_grete',
        }),
      },
      {
        id: 'k5',
        runs: runs({
          text: 'Jeg fant ikke ett kjøp som var hans. Ikke ett.',
          factId: 'f_ingen_matkjop',
        }),
      },
      {
        id: 'k6',
        runs: runs({
          text: 'Regnestykket går opp — med henne. Uten henne mangler det to mynter. Hver måned.',
          factId: 'f_gap',
        }),
      },
    ],
  },
  doc_papirer: {
    id: 'doc_papirer',
    kind: 'ØKONOMISK OVERSIKT',
    title: 'Frank · papirene i leiligheten',
    register: 'notat',
    peek: '«Skoesken sto der hun forlot den.»',
    meta: 'ETTER DØDSFALLET · MED ELLING I ROMMET',
    blocks: [
      {
        id: 'p1',
        runs: runs('Skoesken sto der hun forlot den. Den øverste postgiroen gjelder mars.'),
      },
      { id: 'p2', runs: runs({ text: 'trygden hans — to mynter i måneden', factId: 'f_trygd' }) },
      {
        id: 'p3',
        runs: runs({
          text: 'husleien — tre mynter. Den ble betalt kontant til huseieren, av Grete',
          factId: 'f_husleie',
        }),
      },
      {
        id: 'p4',
        runs: runs({ text: 'Alle avtaler står i Gretes navn.', factId: 'f_alt_via_grete' }),
      },
      {
        id: 'p5',
        runs: runs({
          text: 'Regnestykket gikk opp — med henne. Nå mangler det to mynter. Hver måned.',
          factId: 'f_gap',
        }),
      },
    ],
  },
  doc_innleggelse: {
    id: 'doc_innleggelse',
    kind: 'MELDING',
    title: 'OUS Ullevål · innleggelse',
    register: 'klinisk',
    peek: '«…ber om at kommunen ser til ham.»',
    meta: 'TIL SOSIALKONTORET · 14.02.1999',
    blocks: [
      {
        id: 'i1',
        runs: runs('Grete Olsen ble ', {
          text: 'innlagt akutt 14.02',
          factId: 'f_innlagt',
        }),
      },
      {
        id: 'i2',
        runs: runs({
          text: 'Pasienten oppgir at sønnen ikke er varslet. Hun ber om at kommunen ser til ham.',
          factId: 'f_elling_uvarslet',
        }),
      },
    ],
  },
  doc_dodsfall: {
    id: 'doc_dodsfall',
    kind: 'MELDING',
    title: 'OUS Ullevål · dødsfall',
    register: 'klinisk',
    peek: '—',
    meta: 'TIL SOSIALKONTORET · 15.02.1999',
    blocks: [
      {
        id: 'd1',
        runs: runs('Grete Olsen, f. 21.09.1927. ', {
          text: 'Dødsfall konstatert 15.02 kl. 04:12.',
          factId: 'f_dod',
        }),
      },
      {
        id: 'd2',
        runs: runs('Varsling ble forsøkt per telefon uten svar. ', {
          text: 'Sønnen åpnet ikke døren. Beskjeden ble gitt gjennom brevsprekken.',
          factId: 'f_brevsprekken',
        }),
      },
    ],
  },
  doc_huseier: {
    id: 'doc_huseier',
    kind: 'BREV',
    title: 'Brev fra huseieren · T. Bakkerud',
    register: 'formell',
    peek: '«Jeg hører at din mor er gått bort.»',
    meta: 'HÅNDSKREVET · LEVERT I POSTKASSEN',
    blocks: [
      { id: 'h1', runs: runs('Til Elling Olsen.') },
      {
        id: 'h2',
        runs: runs(
          'Jeg hører at din mor er gått bort. Kondolerer. Jeg må likevel skrive om det praktiske. ',
          { text: 'Leien for mars er ikke kommet.', factId: 'f_leie_stoppet' },
        ),
      },
      {
        id: 'h3',
        runs: runs({
          text: 'Din mor og jeg har holdt på siden -71 uten papirer. Det har aldri vært nødvendig.',
          factId: 'f_leie_privat',
        }),
      },
      {
        id: 'h4',
        runs: runs('Jeg vil ikke lage vanskeligheter. Men ', {
          text: 'jeg kommer innom på torsdag, så får vi snakke om veien videre',
          factId: 'f_huseier_kommer',
        }),
      },
    ],
  },
};

export const blueprintQuestions: Record<string, BlueprintQuestion> = {
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
        note: 'Husleie og faste betalinger fungerer gjennom Gretes system: skoesken, postgiroene, kontantene den første.',
      },
      {
        id: 'h_ok_unngaar',
        label: 'Elling forstår økonomien, men unngår post.',
        needs: ['f_post', 'f_bok'],
        opens: ['t_dokgjennomgang'],
        note: 'Kapasiteten til å forstå er observert. Papiret når likevel aldri frem til en vurdering.',
      },
      {
        id: 'h_ok_gap',
        label: 'Trygden dekker ikke boligen uten Gretes pensjon.',
        needs: ['f_gap'],
        opens: ['t_bostotte'],
        note: 'Ellings trygd er to mynter. Boligen koster tre. Differansen bæres av Gretes pensjon.',
      },
    ],
  },
  q_bolig: {
    id: 'q_bolig',
    title: 'Kan Elling bli boende når Grete ikke lenger bærer hverdagen?',
    appearsOn: ['f_gap', 'f_leie_stoppet', 'f_husleie', 'f_ingen_plan'],
    hypotheses: [
      {
        id: 'h_b_sikres',
        label: 'Boligen kan sikres med bostøtte og ordnet betalingskjede.',
        needs: ['f_gap', 'f_trygd'],
        opens: ['t_bostotte', 't_forvaltning'],
        note: 'Leieforholdet kan videreføres hvis saken ordner betaling før restansen blir en egen sak.',
      },
      {
        id: 'h_b_flytte',
        label: 'Boligen kan ikke holdes. Flytting bør forberedes nå.',
        needs: ['f_gap', 'f_leie_privat'],
        opens: ['t_huseier'],
        note: 'Leieforholdet er privat, muntlig og uten kontrakt å lene seg på.',
      },
      {
        id: 'h_b_uavklart',
        label: 'Uavklart: økonomien må kartlegges først.',
        needs: [],
        opens: [],
        note: 'Saken mangler økonomisk grunnlag for en boligvurdering.',
      },
    ],
  },
  q_hverdag: {
    id: 'q_hverdag',
    title: 'Hva bærer Grete i hverdagen, og hva skjer når hun ikke kan?',
    appearsOn: ['f_grete_baerer', 'f_klarer_seg', 'f_grete_syk'],
    hypotheses: [
      {
        id: 'h_h_infra',
        label: 'Grete er usynlig infrastruktur: mat, kalender, post, kontakt.',
        needs: ['f_kalender', 'f_matbokser'],
        opens: ['t_hjemmehjelp', 't_matlevering'],
        note: 'Husholdets funksjoner er ikke dokumentert noe sted og overlever ikke bortfall uten overføring.',
      },
      {
        id: 'h_h_kanmer',
        label: 'Elling klarer mer enn det ser ut. Grete har alltid gjort det først.',
        needs: ['f_bok', 'f_utklipp'],
        opens: ['t_brev'],
        note: 'Observert kapasitet tilsier at funksjoner er trenbare, men bare i lavt tempo.',
      },
      {
        id: 'h_h_system',
        label: 'Husholdet fungerer bare som system med to.',
        needs: ['f_matbokser', 'f_ingen_matkjop'],
        opens: ['t_hjemmehjelp'],
        note: 'Husholdet er bygget som ett system med to roller. Den ene rollen faller bort.',
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
        label: 'Konsentrasjonen er sterk. Rutiner kan trenes, én om gangen.',
        needs: ['f_bok'],
        opens: ['t_brev', 't_regning'],
        note: 'Kapasitet til fordypning og system er observert. Avgrensede rutiner kan bygges med støtte.',
      },
      {
        id: 'h_s_formell',
        label: 'Ferdighetene er der ikke. Formell støtte må bære alt.',
        needs: ['f_saarbar'],
        opens: ['t_institusjon'],
        note: 'Funksjonsnivået vurderes som for lavt for egenmestring. Tjenestene må kompensere fullt.',
      },
      {
        id: 'h_s_ukjent',
        label: 'Vet ikke, før noe er prøvd med støtte.',
        needs: [],
        opens: ['t_brev'],
        note: 'Kommunen har ingen observasjon av Elling i en mestringssituasjon.',
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
        note: 'Kontakt bør bygges gjennom én fast person med forutsigbart oppmøte.',
      },
      {
        id: 'h_k_skriftlig',
        label: 'All kontakt må gå skriftlig.',
        needs: ['f_post'],
        opens: ['t_dokgjennomgang'],
        note: 'Skriftlig kanal forutsetter at post åpnes. I dag er den like stengt som telefonen.',
      },
      {
        id: 'h_k_via_grete',
        label: 'Kontakt må gå via Grete så lenge hun lever.',
        needs: ['f_klarer_seg'],
        opens: [],
        note: 'Grete er eneste fungerende kanal inn, men den kanalen har kort forventet varighet.',
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
        note: 'Betalingskjeden lå i Gretes skoeske og hukommelse. Den opphørte 15.02.',
      },
      {
        id: 'h_c_mat',
        label: 'Maten. Boksene i kjøleskapet tar slutt om dager.',
        needs: ['f_matbokser'],
        opens: ['t_matlevering'],
        note: 'Matforsyningen var preppet uke for uke. Det finnes ingen neste.',
      },
      {
        id: 'h_c_kontakt',
        label: 'Kontakten. Uten kanal inn er alt annet teori.',
        needs: ['f_brevsprekken'],
        opens: ['t_hjemmehjelp'],
        note: 'Kommunen har per i dag ingen bekreftet kanal til Elling.',
      },
    ],
  },
};

export const blueprintTiltak: Record<string, BlueprintTiltak> = {
  t_bostotte: {
    id: 't_bostotte',
    slot: 's1',
    title: 'Søk bostøtte',
    cost: 0,
    needs: ['f_trygd', 'f_husleie'],
    needsHypothesis: ['h_ok_gap', 'h_b_sikres'],
    description: 'Husbanken. Krever dokumentert inntekt og husleie. Saksbehandlingstid.',
    sim: 'bostotte',
  },
  t_forvaltning: {
    id: 't_forvaltning',
    slot: 's1',
    title: 'Frivillig forvaltning av faste betalinger',
    cost: 1,
    needs: ['f_alt_via_grete'],
    needsHypothesis: ['h_ok_grete', 'h_b_sikres', 'h_c_penger'],
    description: 'Kommunen overtar skoesken. Trygt. Bygger ingenting.',
    sim: 'forvaltning',
  },
  t_huseier: {
    id: 't_huseier',
    slot: 's1',
    title: 'Snakk med huseieren',
    cost: 0,
    needs: ['f_huseier_kommer'],
    needsHypothesis: ['h_b_sikres', 'h_b_flytte', 'h_c_penger'],
    description: 'Bakkerud vil vite hvem han skal forholde seg til. La det bli Frank.',
    sim: 'garanti',
  },
  t_hjemmehjelp: {
    id: 't_hjemmehjelp',
    slot: 's2',
    title: 'Hjemmehjelp 2x uke — Frank',
    cost: 2,
    needs: ['f_grete_baerer'],
    needsHypothesis: ['h_h_infra', 'h_h_system', 'h_k_oppmote', 'h_c_kontakt'],
    description: 'Fast person, fast tid. Den eneste kanalen inn som har virket hittil.',
    sim: 'hjemmehjelp',
  },
  t_matlevering: {
    id: 't_matlevering',
    slot: 's2',
    title: 'Matombringing',
    cost: 1,
    needs: ['f_matbokser'],
    needsHypothesis: ['h_h_infra', 'h_c_mat'],
    description: 'Bokser på døren, tre dager i uken. Forutsetter at døren er en kanal.',
    sim: 'mat',
  },
  t_dokgjennomgang: {
    id: 't_dokgjennomgang',
    slot: 's2',
    title: 'Fast dokumentgjennomgang',
    cost: 1,
    needs: ['f_post'],
    needsHypothesis: ['h_ok_unngaar', 'h_k_skriftlig', 'h_h_infra'],
    description: 'Frank går gjennom posten ukentlig. Papiret når frem til en vurdering.',
    sim: 'dok',
  },
  t_brev: {
    id: 't_brev',
    slot: 's3',
    title: 'Åpne ett brev sammen med Frank',
    cost: 0,
    needs: ['f_post'],
    needsHypothesis: ['h_h_kanmer', 'h_s_trenbar', 'h_s_ukjent'],
    needsVisit: true,
    description: 'Ett brev. Ikke bunken. Frank legger det på bordet og venter.',
    sim: 'brev',
  },
  t_regning: {
    id: 't_regning',
    slot: 's3',
    title: 'Betal én regning med støtte',
    cost: 0,
    needs: ['f_gap'],
    needsHypothesis: ['h_s_trenbar'],
    needsVisit: true,
    description: 'Én regning, én gang. Målet er at det har skjedd, ikke at det er lært.',
    sim: 'regning',
  },
  t_telefon: {
    id: 't_telefon',
    slot: 's3',
    title: 'Telefontrening med manus',
    cost: 0,
    needs: ['f_elling_tlf'],
    early: true,
    description: 'Manus ved apparatet i stuen. Krever trygghet som kanskje ikke finnes ennå.',
    sim: 'telefon',
  },
  t_institusjon: {
    id: 't_institusjon',
    slot: 'press',
    title: 'Institusjonsvurdering / omsorgsbolig',
    cost: 0,
    needs: ['f_saarbar'],
    description: 'Bureaukratisk lesbart. Trygt på papiret. Leiligheten blir et avsluttet kapittel.',
    sim: 'institusjon',
  },
};

export const blueprintSlotLabels: Record<BlueprintTiltakSlot, string> = {
  s1: 'Bolig/økonomi-sikring',
  s2: 'Erstatt Gretes usynlige arbeid',
  s3: 'Skjør selvstendig rutine',
  press: 'Press: alltid tilgjengelig, aldri automatisk riktig',
};

export const blueprintDispatches: Record<string, BlueprintDispatch> = {
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
  d_besok: {
    id: 'd_besok',
    title: 'Avtal hjemmebesøk',
    description: 'Gjennom Grete. Rapport i morgen tidlig.',
  },
  d_ring_elling: {
    id: 'd_ring_elling',
    title: 'Ring leiligheten',
    description: 'Grete tar den ikke lenger. Spørsmålet er om noen gjør det.',
  },
  d_papirer: {
    id: 'd_papirer',
    title: 'Gå gjennom papirene i leiligheten',
    description: 'Skoesken står der fortsatt. Noen må åpne den.',
  },
  d_besok_alene: {
    id: 'd_besok_alene',
    title: 'Hjemmebesøk uten avtale',
    description: 'Ingen Grete å avtale med lenger. Frank stiller på døren.',
  },
  d_bostotte_f: {
    id: 'd_bostotte_f',
    title: 'Følg opp bostøttesøknaden',
    description: 'Purr Husbanken. Sjekk at dokumentene er komplette.',
  },
};

export const blueprintChat: BlueprintChatPrompt[] = [
  {
    id: 'c_post',
    needs: 'f_post',
    question: 'Posten i gangen — likegyldighet?',
    answer: runs(
      'Nei. Han vet nøyaktig hva som ligger der. Det er ikke likegyldighet. Det ligner mer på frykt for hva papiret krever av svar.',
    ),
  },
  {
    id: 'c_klarer',
    needs: 'f_klarer_seg',
    question: 'Tror du på «han klarer seg»?',
    answer: runs(
      'Folk sier det på to måter. Som en vurdering, eller som et håp. Hun sa det to ganger. Andre gangen var det et håp.',
    ),
  },
  {
    id: 'c_bok',
    needs: 'f_bok',
    question: 'Boken og notatene — hva sier det deg?',
    answer: runs(
      'Tre setninger om Nansen, presise, til veggen. Det er ikke en som mangler evner. Det er en som mangler trening i å ha noen i rommet.',
    ),
  },
  {
    id: 'c_avstand',
    needs: 'f_avstand',
    question: 'Møbelet mellom dere — hvor lang vei er det inn?',
    answer: runs(
      'Lang. Men ',
      {
        text: 'han kastet meg ikke ut, og han svarte da jeg spurte om noe han kunne. Det er en dør på gløtt.',
        factId: 'f_dor_glott',
      },
      ' Den lukkes hvis vi river i den.',
    ),
  },
  {
    id: 'c_brevsprekk',
    needs: 'f_brevsprekken',
    question: 'Brevsprekken. Hørte han det, tror du?',
    answer: runs(
      'Han sto rett innenfor. Politiet hørte ham puste. Han hørte hvert ord, og han klarte ikke å åpne. Det er det vi jobber med nå. Ikke sorgen. Døren.',
    ),
  },
  {
    id: 'c_videre',
    needs: 'f_dod',
    question: 'Hva gjør vi nå, Frank?',
    answer: runs(
      'Det vi burde gjort for ti år siden, bare fortere. Penger først. Så én kanal inn. Så én rutine. I den rekkefølgen.',
    ),
  },
];

export const blueprintFlavor = [
  '21:10 — teleskopet ved vinduet. 40 min. Himmelen var overskyet.',
  '10:48 — naboen i vinduet. Gardinet beveget seg først i tredje etasje, så hos ham.',
  'Kryssordet fra lørdagsavisen. Tre ord fylt inn, alle riktige.',
  'Boken om Maud-ekspedisjonen. Margnotater, små bokstaver.',
  'NRK Kveldsnytt sto på uten lyd. Teksten ble lest helt til værkartet.',
  'Utklippsboken: nytt utklipp limt inn under «1994». Limstift, linjal, årstall i hjørnet.',
  'Han brettet pleddet på Gretes stol. La det tilbake nøyaktig slik det lå.',
];

export function blueprintDayName(day: number): string {
  const names: Record<number, string> = {
    1: 'Torsdag. Meldingen ligger der.',
    2: 'Fredag.',
    3: 'Lørdag. Posten kom likevel.',
    4: 'Søndag.',
    5: 'Mandag.',
    6: 'Tirsdag.',
    7: 'Onsdag.',
    8: 'Torsdag. En uke.',
  };
  return names[day] ?? `Dag ${day}.`;
}
