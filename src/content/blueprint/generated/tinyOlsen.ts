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
    meta: 'LEGESENTERET · 11.02.1999',
    blocks: [
      {
        id: 'doc_bekymring_body',
        runs: [
          {
            text: 'Gjelder: Olsen, Elling · f. 14.03.1964. Undertegnede er fastlege for Grete Olsen og hennes sønn Elling Olsen. Mor er under utredning for sykdom med kort forventet forløp. Hun er informert om at meldingen sendes. Mor og sønn bor sammen i en treroms blokkleilighet. Sønnen har aldri bodd alene. Han er uføretrygdet og ikke i kontakt med øvrige tjenester.',
          },
          {
            text: 'Mor opplyser at hun bistår med praktiske gjøremål, økonomisk oversikt og kontakt med tjenester',
            factId: 'f_grete_baerer',
          },
          {
            text: '. Ved hjemmebesøk er det observert',
          },
          {
            text: 'uåpnet post i gangen',
            factId: 'f_manglende_post',
          },
          {
            text: ',',
          },
          {
            text: 'flere ubetalte regninger',
            factId: 'f_regninger',
          },
          {
            text: ',',
          },
          {
            text: 'lite mat i kjøleskapet',
            factId: 'f_lite_mat',
          },
          {
            text: ', og',
          },
          {
            text: 'telefonhenvendelser som ikke blir besvart',
            factId: 'f_telefon_ubesvart',
          },
          {
            text: '. Pasienten fremstår sårbar ved bortfall av pårørende. Anbefaler kommunal kartlegging av funksjon, hjelpebehov og overgangstiltak.',
          },
        ],
      },
    ],
  },
} satisfies Record<string, BlueprintDocument>;

export const tinyOlsenFacts = {
  f_grete_baerer: {
    id: 'f_grete_baerer',
    domain: 'Hverdag/rutine',
    category: 'Dokument',
    text: 'Grete bærer husholdets praktiske funksjoner.',
    quote:
      'Mor opplyser at hun bistår med praktiske gjøremål, økonomisk oversikt og kontakt med tjenester',
    supports: ['q_hverdag', 'q_okonomi'],
    discuss: ['Frank', 'Grete'],
  },
  f_manglende_post: {
    id: 'f_manglende_post',
    domain: 'Hverdag/rutine',
    category: 'Dokument',
    text: 'Post har hopet seg opp uåpnet.',
    quote: 'uåpnet post i gangen',
    supports: [],
    discuss: ['Frank'],
  },
  f_regninger: {
    id: 'f_regninger',
    domain: 'Økonomi/bolig',
    category: 'Økonomi',
    text: 'Flere regninger er ubetalt.',
    quote: 'flere ubetalte regninger',
    supports: ['q_okonomi'],
    discuss: ['Frank'],
  },
  f_lite_mat: {
    id: 'f_lite_mat',
    domain: 'Hverdag/rutine',
    category: 'Observasjon',
    text: 'Det er lite mat på kjøkkenet.',
    quote: 'lite mat i kjøleskapet',
    supports: [],
    discuss: ['Frank'],
  },
  f_telefon_ubesvart: {
    id: 'f_telefon_ubesvart',
    domain: 'Nettverk/sosialt',
    category: 'Observasjon',
    text: 'Telefonhenvendelser blir ofte ikke besvart.',
    quote: 'telefonhenvendelser som ikke blir besvart',
    supports: [],
    discuss: ['Frank', 'Grete'],
  },
} satisfies Record<string, BlueprintFact>;

export const tinyOlsenQuestions = {
  q_hverdag: {
    id: 'q_hverdag',
    title: 'Hvor stabil er hverdagen uten Grete?',
    appearsOn: ['f_grete_baerer'],
    hypotheses: [
      {
        id: 'h_omsorgsbyrde',
        label: 'Omsorgsbyrden er konsentrert',
        needs: ['f_grete_baerer', 'f_regninger'],
        opens: ['t_samtale_grete', 't_regningshjelp'],
        note: 'Grete bærer for mye av den daglige støtten alene.',
      },
      {
        id: 'h_isolasjon',
        label: 'Isolasjonen øker',
        needs: ['f_lite_mat', 'f_telefon_ubesvart'],
        opens: ['t_samtale_grete'],
        note: 'Mat- og telefonmønsteret kan peke på sosial tilbaketrekning.',
      },
    ],
  },
  q_okonomi: {
    id: 'q_okonomi',
    title: 'Er regningene et engangsglipp eller en løpende risiko?',
    appearsOn: ['f_grete_baerer'],
    hypotheses: [
      {
        id: 'h_okonomisk_sarbar',
        label: 'Økonomien er sårbar',
        needs: ['f_regninger'],
        opens: [],
        note: 'Ubetalte regninger peker på et praktisk støttebehov.',
      },
    ],
  },
} satisfies Record<string, BlueprintQuestion>;

export const tinyOlsenTiltak = {
  t_samtale_grete: {
    id: 't_samtale_grete',
    slot: 's1',
    title: 'Avklar støtte med Grete',
    cost: 1,
    needs: ['f_grete_baerer'],
    description: 'Planlegg en støttesamtale med Grete.',
    sim: 'case.olsen.tiltak.support_talk',
  },
  t_regningshjelp: {
    id: 't_regningshjelp',
    slot: 's2',
    title: 'Ordne regningshjelp',
    cost: 1,
    needs: ['f_regninger'],
    needsHypothesis: ['h_omsorgsbyrde'],
    description: 'Ordne praktisk hjelp med regninger.',
    sim: 'case.olsen.tiltak.bill_support',
  },
} satisfies Record<string, BlueprintTiltak>;

export const tinyOlsenDispatches = {
  d_ring_grete: {
    id: 'd_ring_grete',
    title: 'Ring Grete',
    description: 'Ring Grete for å teste hypotesen om omsorgsbyrde.',
  },
  d_konto: {
    id: 'd_konto',
    title: 'Be om kontooversikt',
    description: 'Be om kontooversikt til neste dag.',
  },
} satisfies Record<string, BlueprintDispatch>;

export const tinyOlsenGodotSource = {
  id: 'case_olsen_tiny',
  title: 'Olsen tiny schema slice',
  scenario_stage: 0,
  documents: [
    {
      id: 'doc_bekymring',
      kind: 'BEKYMRINGSMELDING',
      title: 'Legesenteret · Dr. J. Haug',
      body_bbcode:
        'Gjelder: Olsen, Elling · f. 14.03.1964.\n\nUndertegnede er fastlege for Grete Olsen og hennes sønn Elling Olsen. Mor er under utredning for sykdom med kort forventet forløp. Hun er informert om at meldingen sendes.\n\nMor og sønn bor sammen i en treroms blokkleilighet. Sønnen har aldri bodd alene. Han er uføretrygdet og ikke i kontakt med øvrige tjenester.\n\n[url=fact:f_grete_baerer]Mor opplyser at hun bistår med praktiske gjøremål, økonomisk oversikt og kontakt med tjenester[/url].\n\nVed hjemmebesøk er det observert [url=fact:f_manglende_post]uåpnet post i gangen[/url], [url=fact:f_regninger]flere ubetalte regninger[/url], [url=fact:f_lite_mat]lite mat i kjøleskapet[/url], og [url=fact:f_telefon_ubesvart]telefonhenvendelser som ikke blir besvart[/url].\n\nPasienten fremstår sårbar ved bortfall av pårørende. Anbefaler kommunal kartlegging av funksjon, hjelpebehov og overgangstiltak.',
      runs: [
        {
          id: 'run_text_0',
          text: 'Gjelder: Olsen, Elling · f. 14.03.1964. Undertegnede er fastlege for Grete Olsen og hennes sønn Elling Olsen. Mor er under utredning for sykdom med kort forventet forløp. Hun er informert om at meldingen sendes. Mor og sønn bor sammen i en treroms blokkleilighet. Sønnen har aldri bodd alene. Han er uføretrygdet og ikke i kontakt med øvrige tjenester.',
          fact_id: '',
        },
        {
          id: 'run_grete_baerer',
          text: 'Mor opplyser at hun bistår med praktiske gjøremål, økonomisk oversikt og kontakt med tjenester',
          fact_id: 'f_grete_baerer',
        },
        {
          id: 'run_text_1',
          text: '. Ved hjemmebesøk er det observert',
          fact_id: '',
        },
        {
          id: 'run_manglende_post',
          text: 'uåpnet post i gangen',
          fact_id: 'f_manglende_post',
        },
        {
          id: 'run_text_2',
          text: ',',
          fact_id: '',
        },
        {
          id: 'run_regninger',
          text: 'flere ubetalte regninger',
          fact_id: 'f_regninger',
        },
        {
          id: 'run_text_3',
          text: ',',
          fact_id: '',
        },
        {
          id: 'run_lite_mat',
          text: 'lite mat i kjøleskapet',
          fact_id: 'f_lite_mat',
        },
        {
          id: 'run_text_4',
          text: ', og',
          fact_id: '',
        },
        {
          id: 'run_telefon_ubesvart',
          text: 'telefonhenvendelser som ikke blir besvart',
          fact_id: 'f_telefon_ubesvart',
        },
        {
          id: 'run_text_5',
          text: '. Pasienten fremstår sårbar ved bortfall av pårørende. Anbefaler kommunal kartlegging av funksjon, hjelpebehov og overgangstiltak.',
          fact_id: '',
        },
      ],
    },
  ],
  facts: [
    {
      id: 'f_grete_baerer',
      label: 'Grete bærer rutiner',
      summary: 'Grete bærer husholdets praktiske funksjoner.',
      source_document_id: 'doc_bekymring',
      lift_effects: [
        {
          op: 'reveal_questions',
          args: {
            question_ids: ['q_hverdag', 'q_okonomi'],
          },
        },
      ],
    },
    {
      id: 'f_manglende_post',
      label: 'Uåpnet post',
      summary: 'Post har hopet seg opp uåpnet.',
      source_document_id: 'doc_bekymring',
      lift_effects: [],
    },
    {
      id: 'f_regninger',
      label: 'Ubetalte regninger',
      summary: 'Flere regninger er ubetalt.',
      source_document_id: 'doc_bekymring',
      lift_effects: [],
    },
    {
      id: 'f_lite_mat',
      label: 'Lite mat',
      summary: 'Det er lite mat på kjøkkenet.',
      source_document_id: 'doc_bekymring',
      lift_effects: [],
    },
    {
      id: 'f_telefon_ubesvart',
      label: 'Telefon ubesvart',
      summary: 'Telefonhenvendelser blir ofte ikke besvart.',
      source_document_id: 'doc_bekymring',
      lift_effects: [],
    },
  ],
  questions: [
    {
      id: 'q_hverdag',
      prompt: 'Hvor stabil er hverdagen uten Grete?',
      reveal_when: {
        op: 'fact_lifted',
        args: {
          fact_id: 'f_grete_baerer',
        },
      },
    },
    {
      id: 'q_okonomi',
      prompt: 'Er regningene et engangsglipp eller en løpende risiko?',
      reveal_when: {
        op: 'fact_lifted',
        args: {
          fact_id: 'f_grete_baerer',
        },
      },
    },
  ],
  hypotheses: [
    {
      id: 'h_omsorgsbyrde',
      title: 'Omsorgsbyrden er konsentrert',
      summary: 'Grete bærer for mye av den daglige støtten alene.',
      availability: {
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
              fact_id: 'f_regninger',
            },
          },
        ],
      },
      chosen_effects: [
        {
          op: 'unlock_tiltak',
          args: {
            tiltak_ids: ['t_samtale_grete', 't_regningshjelp'],
          },
        },
        {
          op: 'unlock_dispatches',
          args: {
            dispatch_ids: ['d_ring_grete'],
          },
        },
      ],
    },
    {
      id: 'h_okonomisk_sarbar',
      title: 'Økonomien er sårbar',
      summary: 'Ubetalte regninger peker på et praktisk støttebehov.',
      availability: {
        op: 'fact_lifted',
        args: {
          fact_id: 'f_regninger',
        },
      },
      chosen_effects: [
        {
          op: 'unlock_dispatches',
          args: {
            dispatch_ids: ['d_konto'],
          },
        },
      ],
    },
    {
      id: 'h_isolasjon',
      title: 'Isolasjonen øker',
      summary: 'Mat- og telefonmønsteret kan peke på sosial tilbaketrekning.',
      availability: {
        op: 'all',
        children: [
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_lite_mat',
            },
          },
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_telefon_ubesvart',
            },
          },
        ],
      },
      chosen_effects: [
        {
          op: 'unlock_tiltak',
          args: {
            tiltak_ids: ['t_samtale_grete'],
          },
        },
      ],
    },
  ],
  tiltak: [
    {
      id: 't_samtale_grete',
      title: 'Avklar støtte med Grete',
      sim_hook_id: 'case.olsen.tiltak.support_talk',
    },
    {
      id: 't_regningshjelp',
      title: 'Ordne regningshjelp',
      sim_hook_id: 'case.olsen.tiltak.bill_support',
    },
  ],
  dispatches: [
    {
      id: 'd_ring_grete',
      title: 'Ring Grete',
      sim_hook_id: 'case.olsen.dispatch.call_grete',
      gate: {
        op: 'all',
        children: [
          {
            op: 'hypothesis_chosen',
            args: {
              hypothesis_id: 'h_omsorgsbyrde',
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
      title: 'Be om kontooversikt',
      sim_hook_id: 'case.olsen.dispatch.account_overview',
      gate: {
        op: 'all',
        children: [
          {
            op: 'hypothesis_chosen',
            args: {
              hypothesis_id: 'h_okonomisk_sarbar',
            },
          },
          {
            op: 'fact_lifted',
            args: {
              fact_id: 'f_regninger',
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
    },
  ],
  day_script_beats: [],
} as const;
