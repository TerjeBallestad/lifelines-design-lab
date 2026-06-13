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
    kind: 'letter',
    title: 'Bekymringsmelding',
    register: 'klinisk',
    peek: 'Bekymringsmelding with five generated fact markers for the tiny Olsen schema slice.',
    meta: 'Oslo kommune · sosialkontoret · meldt av Dr. J. Haug · februar 1999',
    blocks: [
      {
        id: 'doc_bekymring_body',
        runs: [
          {
            text: 'Grete carries most routines.',
            factId: 'f_grete_baerer',
          },
          {
            text: 'Mail has stacked up unopened.',
            factId: 'f_manglende_post',
          },
          {
            text: 'Several bills are unpaid.',
            factId: 'f_regninger',
          },
          {
            text: 'There is little food in the kitchen.',
            factId: 'f_lite_mat',
          },
          {
            text: 'Phone calls often go unanswered.',
            factId: 'f_telefon_ubesvart',
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
    text: 'The concern letter points to Grete carrying most daily routines.',
    quote: 'Grete carries most routines.',
    supports: ['q_hverdag', 'q_okonomi'],
    discuss: ['Frank', 'Grete'],
  },
  f_manglende_post: {
    id: 'f_manglende_post',
    domain: 'Hverdag/rutine',
    category: 'Dokument',
    text: 'Mail has stacked up unopened.',
    quote: 'Mail has stacked up unopened.',
    supports: [],
    discuss: ['Frank'],
  },
  f_regninger: {
    id: 'f_regninger',
    domain: 'Økonomi/bolig',
    category: 'Økonomi',
    text: 'Several bills are unpaid.',
    quote: 'Several bills are unpaid.',
    supports: ['q_okonomi'],
    discuss: ['Frank'],
  },
  f_lite_mat: {
    id: 'f_lite_mat',
    domain: 'Hverdag/rutine',
    category: 'Observasjon',
    text: 'The kitchen has little food available.',
    quote: 'There is little food in the kitchen.',
    supports: [],
    discuss: ['Frank'],
  },
  f_telefon_ubesvart: {
    id: 'f_telefon_ubesvart',
    domain: 'Nettverk/sosialt',
    category: 'Observasjon',
    text: 'Phone calls often go unanswered.',
    quote: 'Phone calls often go unanswered.',
    supports: [],
    discuss: ['Frank', 'Grete'],
  },
} satisfies Record<string, BlueprintFact>;

export const tinyOlsenQuestions = {
  q_hverdag: {
    id: 'q_hverdag',
    title: 'How stable are the daily routines without Grete carrying them?',
    appearsOn: ['f_grete_baerer'],
    hypotheses: [
      {
        id: 'h_omsorgsbyrde',
        label: 'Care burden is concentrated',
        needs: ['f_grete_baerer', 'f_regninger'],
        opens: ['t_samtale_grete', 't_regningshjelp'],
        note: 'Grete carries too much of the everyday support load.',
      },
      {
        id: 'h_isolasjon',
        label: 'Isolation is increasing',
        needs: ['f_lite_mat', 'f_telefon_ubesvart'],
        opens: ['t_samtale_grete'],
        note: 'Food and phone patterns may indicate social withdrawal.',
      },
    ],
  },
  q_okonomi: {
    id: 'q_okonomi',
    title: 'Are the unpaid bills a temporary slip or an ongoing risk?',
    appearsOn: ['f_grete_baerer'],
    hypotheses: [
      {
        id: 'h_okonomisk_sarbar',
        label: 'Economic vulnerability',
        needs: ['f_regninger'],
        opens: [],
        note: 'Unpaid bills point to a practical support gap.',
      },
    ],
  },
} satisfies Record<string, BlueprintQuestion>;

export const tinyOlsenTiltak = {
  t_samtale_grete: {
    id: 't_samtale_grete',
    slot: 's1',
    title: 'Plan support talk',
    cost: 1,
    needs: ['f_grete_baerer'],
    description: 'Plan a support talk with Grete.',
    sim: 'case.olsen.tiltak.support_talk',
  },
  t_regningshjelp: {
    id: 't_regningshjelp',
    slot: 's2',
    title: 'Arrange bill support',
    cost: 1,
    needs: ['f_regninger'],
    needsHypothesis: ['h_omsorgsbyrde'],
    description: 'Arrange practical support for bills.',
    sim: 'case.olsen.tiltak.bill_support',
  },
} satisfies Record<string, BlueprintTiltak>;

export const tinyOlsenDispatches = {
  d_ring_grete: {
    id: 'd_ring_grete',
    title: 'Call Grete',
    description: 'Call Grete to test the care burden hypothesis.',
  },
  d_konto: {
    id: 'd_konto',
    title: 'Request account overview',
    description: 'Request account overview for next day.',
  },
} satisfies Record<string, BlueprintDispatch>;

export const tinyOlsenGodotSource = {
  id: 'case_olsen_tiny',
  title: 'Olsen tiny schema slice',
  scenario_stage: 0,
  documents: [
    {
      id: 'doc_bekymring',
      kind: 'letter',
      title: 'Bekymringsmelding',
      body_bbcode:
        '[url=fact:f_grete_baerer]Grete carries most routines.[/url]\n\n[url=fact:f_manglende_post]Mail has stacked up unopened.[/url]\n\n[url=fact:f_regninger]Several bills are unpaid.[/url]\n\n[url=fact:f_lite_mat]There is little food in the kitchen.[/url]\n\n[url=fact:f_telefon_ubesvart]Phone calls often go unanswered.[/url]',
      runs: [
        {
          id: 'run_grete_baerer',
          text: 'Grete carries most routines.',
          fact_id: 'f_grete_baerer',
        },
        {
          id: 'run_manglende_post',
          text: 'Mail has stacked up unopened.',
          fact_id: 'f_manglende_post',
        },
        {
          id: 'run_regninger',
          text: 'Several bills are unpaid.',
          fact_id: 'f_regninger',
        },
        {
          id: 'run_lite_mat',
          text: 'There is little food in the kitchen.',
          fact_id: 'f_lite_mat',
        },
        {
          id: 'run_telefon_ubesvart',
          text: 'Phone calls often go unanswered.',
          fact_id: 'f_telefon_ubesvart',
        },
      ],
    },
  ],
  facts: [
    {
      id: 'f_grete_baerer',
      label: 'Grete carries routines',
      summary: 'The concern letter points to Grete carrying most daily routines.',
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
      label: 'Unopened mail',
      summary: 'Mail has stacked up unopened.',
      source_document_id: 'doc_bekymring',
      lift_effects: [],
    },
    {
      id: 'f_regninger',
      label: 'Unpaid bills',
      summary: 'Several bills are unpaid.',
      source_document_id: 'doc_bekymring',
      lift_effects: [],
    },
    {
      id: 'f_lite_mat',
      label: 'Little food',
      summary: 'The kitchen has little food available.',
      source_document_id: 'doc_bekymring',
      lift_effects: [],
    },
    {
      id: 'f_telefon_ubesvart',
      label: 'Unanswered phone',
      summary: 'Phone calls often go unanswered.',
      source_document_id: 'doc_bekymring',
      lift_effects: [],
    },
  ],
  questions: [
    {
      id: 'q_hverdag',
      prompt: 'How stable are the daily routines without Grete carrying them?',
      reveal_when: {
        op: 'fact_lifted',
        args: {
          fact_id: 'f_grete_baerer',
        },
      },
    },
    {
      id: 'q_okonomi',
      prompt: 'Are the unpaid bills a temporary slip or an ongoing risk?',
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
      title: 'Care burden is concentrated',
      summary: 'Grete carries too much of the everyday support load.',
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
      title: 'Economic vulnerability',
      summary: 'Unpaid bills point to a practical support gap.',
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
      title: 'Isolation is increasing',
      summary: 'Food and phone patterns may indicate social withdrawal.',
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
      title: 'Plan support talk',
      sim_hook_id: 'case.olsen.tiltak.support_talk',
    },
    {
      id: 't_regningshjelp',
      title: 'Arrange bill support',
      sim_hook_id: 'case.olsen.tiltak.bill_support',
    },
  ],
  dispatches: [
    {
      id: 'd_ring_grete',
      title: 'Call Grete',
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
      title: 'Request account overview',
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
      label: 'Next-day account overview clock',
      sim_hook_id: 'case.olsen.clock.account_overview',
    },
  ],
  day_script_beats: [],
} as const;
