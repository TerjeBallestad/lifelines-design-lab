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
        type: 'para',
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
            text: ' for sin sønn Elling Olsen (f. 14.03.1964). ',
          },
          {
            text: 'Omfanget er ikke kartlagt',
            factId: 'f_grete_baerer',
          },
          {
            text: ', men han kan ha behov for støtte ved mors bortfall. ',
          },
        ],
      },
      {
        id: 'doc_bekymring_p2',
        type: 'para',
        runs: [
          {
            text: 'Jørgen Haug\nspes. allmennmedisin ',
          },
        ],
      },
    ],
  },
  doc_konto_grete: {
    id: 'doc_konto_grete',
    kind: 'KONTOUTSKRIFT',
    title: 'KONTOUTSKRIFT',
    register: 'formell',
    peek: 'Kontoutskrift. Grete Olsen, januar.',
    meta: 'NR. 2/99',
    blocks: [
      {
        id: 'doc_konto_grete_p1',
        type: 'para',
        runs: [
          {
            text: 'OLSEN GRETE\nAMMERUDVEIEN 47\n0958 OSLO',
          },
        ],
      },
      {
        id: 'doc_konto_grete_p2',
        type: 'para',
        runs: [
          {
            text: 'KONTO: 7024.31.44892\nPERIODE: 01.01.99–31.01.99\nUTSKR.DATO: 02.02.99 ',
          },
        ],
      },
      {
        id: 'doc_konto_grete_p3',
        type: 'table',
        align: ['left', 'left', 'right', 'right', 'right'],
        header: [
          [
            {
              text: 'DATO',
            },
          ],
          [
            {
              text: 'TEKST',
            },
          ],
          [
            {
              text: 'UT',
            },
          ],
          [
            {
              text: 'INN',
            },
          ],
          [
            {
              text: 'SALDO',
            },
          ],
        ],
        rows: [
          [
            [
              {
                text: '01.01',
              },
            ],
            [
              {
                text: 'SALDO OVERFØRT',
              },
            ],
            [],
            [],
            [
              {
                text: '25 [icon=coin]',
              },
            ],
          ],
          [
            [
              {
                text: '04.01',
              },
            ],
            [
              {
                text: 'PENSJON RTV',
              },
            ],
            [],
            [
              {
                text: '125 [icon=coin]',
              },
            ],
            [
              {
                text: '150 [icon=coin]',
              },
            ],
          ],
          [
            [
              {
                text: '04.01',
              },
            ],
            [
              {
                text: 'OVERF. E. OLSEN 7024.31.55103',
              },
            ],
            [],
            [
              {
                text: '90 [icon=coin]',
              },
            ],
            [
              {
                text: '240 [icon=coin]',
              },
            ],
          ],
          [
            [
              {
                text: '05.01',
              },
            ],
            [
              {
                text: 'KONTANTUTTAK SKRANKE',
                factId: 'f_husleie',
              },
            ],
            [
              {
                text: '120 [icon=coin]',
              },
            ],
            [],
            [
              {
                text: '120 [icon=coin]',
              },
            ],
          ],
          [
            [
              {
                text: '07.01',
              },
            ],
            [
              {
                text: 'MATSENTRALEN AMMERUD',
              },
            ],
            [
              {
                text: '10 [icon=coin]',
              },
            ],
            [],
            [
              {
                text: '110 [icon=coin]',
              },
            ],
          ],
          [
            [
              {
                text: '11.01',
              },
            ],
            [
              {
                text: 'POSTGIRO - OSLO ENERGIVERK',
              },
            ],
            [
              {
                text: '17 [icon=coin]',
              },
            ],
            [],
            [
              {
                text: '93 [icon=coin]',
              },
            ],
          ],
          [
            [
              {
                text: '12.01',
              },
            ],
            [
              {
                text: 'MATSENTRALEN AMMERUD',
              },
            ],
            [
              {
                text: '11 [icon=coin]',
              },
            ],
            [],
            [
              {
                text: '82 [icon=coin]',
              },
            ],
          ],
          [
            [
              {
                text: '14.01',
              },
            ],
            [
              {
                text: 'AMMERUD APOTEK',
              },
            ],
            [
              {
                text: '4 [icon=coin]',
              },
            ],
            [],
            [
              {
                text: '78 [icon=coin]',
              },
            ],
          ],
          [
            [
              {
                text: '18.01',
              },
            ],
            [
              {
                text: 'MATSENTRALEN AMMERUD',
              },
            ],
            [
              {
                text: '10 [icon=coin]',
              },
            ],
            [],
            [
              {
                text: '68 [icon=coin]',
              },
            ],
          ],
          [
            [
              {
                text: '21.01',
              },
            ],
            [
              {
                text: 'POSTGIRO - TELEVERKET',
              },
            ],
            [
              {
                text: '5 [icon=coin]',
              },
            ],
            [],
            [
              {
                text: '63 [icon=coin]',
              },
            ],
          ],
          [
            [
              {
                text: '25.01',
              },
            ],
            [
              {
                text: 'MATSENTRALEN AMMERUD',
              },
            ],
            [
              {
                text: '11 [icon=coin]',
              },
            ],
            [],
            [
              {
                text: '52 [icon=coin]',
              },
            ],
          ],
          [
            [
              {
                text: '28.01',
              },
            ],
            [
              {
                text: 'NARVESEN - UKEBLAD/AVIS',
              },
            ],
            [
              {
                text: '2 [icon=coin]',
              },
            ],
            [],
            [
              {
                text: '50 [icon=coin]',
              },
            ],
          ],
          [
            [
              {
                text: '31.01',
              },
            ],
            [
              {
                text: 'SALDO',
              },
            ],
            [],
            [],
            [
              {
                text: '50 [icon=coin]',
              },
            ],
          ],
        ],
      },
      {
        id: 'doc_konto_grete_p4',
        type: 'para',
        runs: [
          {
            text: ' RENTESATS INNSKUDD 3 % P.A. - UTSKRIFTEN SENDES KVARTALSVIS\nHENVENDELSER RETTES TIL DERES FILIAL. TA MED LEGITIMASJON. ',
          },
        ],
      },
    ],
  },
  doc_konto_elling: {
    id: 'doc_konto_elling',
    kind: 'KONTOUTSKRIFT',
    title: 'KONTOUTSKRIFT',
    register: 'formell',
    peek: 'Årsutskrift. Elling Olsen.',
    meta: 'NR. 1/99 - ÅRSUTSKRIFT',
    blocks: [
      {
        id: 'doc_konto_elling_p1',
        type: 'para',
        runs: [
          {
            text: 'OLSEN ELLING\nV/ OLSEN GRETE (VERGE)\nAMMERUDVEIEN 47\n0958 OSLO',
          },
        ],
      },
      {
        id: 'doc_konto_elling_p2',
        type: 'para',
        runs: [
          {
            text: 'KONTO: 7024.31.55103\nPERIODE: 01.10.98–31.01.99\nUTSKR.DATO: 02.02.99 ',
          },
        ],
      },
      {
        id: 'doc_konto_elling_p3',
        type: 'table',
        align: ['left', 'left', 'right', 'right', 'right'],
        header: [
          [
            {
              text: 'DATO',
            },
          ],
          [
            {
              text: 'TEKST',
            },
          ],
          [
            {
              text: 'UT',
            },
          ],
          [
            {
              text: 'INN',
            },
          ],
          [
            {
              text: 'SALDO',
            },
          ],
        ],
        rows: [
          [
            [
              {
                text: '01.10',
              },
            ],
            [
              {
                text: 'SALDO OVERFØRT',
              },
            ],
            [],
            [],
            [
              {
                text: '0 [icon=coin]',
              },
            ],
          ],
          [
            [
              {
                text: '02.10',
              },
            ],
            [
              {
                text: 'UFØRETRYGD RTV',
                factId: 'f_trygd',
              },
            ],
            [],
            [
              {
                text: '90 [icon=coin]',
              },
            ],
            [
              {
                text: '90 [icon=coin]',
              },
            ],
          ],
          [
            [
              {
                text: '02.10',
              },
            ],
            [
              {
                text: 'FAST OVERF. G. OLSEN (VERGE)',
              },
            ],
            [
              {
                text: '90 [icon=coin]',
              },
            ],
            [],
            [
              {
                text: '0 [icon=coin]',
              },
            ],
          ],
          [
            [
              {
                text: '02.11',
              },
            ],
            [
              {
                text: 'UFØRETRYGD RTV',
              },
            ],
            [],
            [
              {
                text: '90 [icon=coin]',
              },
            ],
            [
              {
                text: '90 [icon=coin]',
              },
            ],
          ],
          [
            [
              {
                text: '02.11',
              },
            ],
            [
              {
                text: 'FAST OVERF. G. OLSEN (VERGE)',
              },
            ],
            [
              {
                text: '90 [icon=coin]',
              },
            ],
            [],
            [
              {
                text: '0 [icon=coin]',
              },
            ],
          ],
          [
            [
              {
                text: '02.12',
              },
            ],
            [
              {
                text: 'UFØRETRYGD RTV',
              },
            ],
            [],
            [
              {
                text: '90 [icon=coin]',
              },
            ],
            [
              {
                text: '90 [icon=coin]',
              },
            ],
          ],
          [
            [
              {
                text: '02.12',
              },
            ],
            [
              {
                text: 'FAST OVERF. G. OLSEN (VERGE)',
              },
            ],
            [
              {
                text: '90 [icon=coin]',
              },
            ],
            [],
            [
              {
                text: '0 [icon=coin]',
              },
            ],
          ],
          [
            [
              {
                text: '04.01',
              },
            ],
            [
              {
                text: 'UFØRETRYGD RTV',
              },
            ],
            [],
            [
              {
                text: '90 [icon=coin]',
              },
            ],
            [
              {
                text: '90 [icon=coin]',
              },
            ],
          ],
          [
            [
              {
                text: '04.01',
              },
            ],
            [
              {
                text: 'FAST OVERF. G. OLSEN (VERGE)',
              },
            ],
            [
              {
                text: '90 [icon=coin]',
              },
            ],
            [],
            [
              {
                text: '0 [icon=coin]',
              },
            ],
          ],
          [
            [
              {
                text: '31.01',
              },
            ],
            [
              {
                text: 'SALDO',
              },
            ],
            [],
            [],
            [
              {
                text: '0 [icon=coin]',
              },
            ],
          ],
        ],
      },
      {
        id: 'doc_konto_elling_p4',
        type: 'para',
        runs: [
          {
            text: ' INGEN ANDRE BEVEGELSER I PERIODEN.',
          },
        ],
      },
      {
        id: 'doc_konto_elling_p5',
        type: 'para',
        runs: [
          {
            text: 'KONTOEN DISPONERES AV VERGE. KORT ER IKKE UTSTEDT.',
            factId: 'f_alt_via_grete',
          },
          {
            text: ' ',
          },
        ],
      },
    ],
  },
  doc_strom: {
    id: 'doc_strom',
    kind: 'REGNING',
    title: 'FAKTURA NR. 99-114 872',
    register: 'formell',
    peek: 'Strømregning. 2. gangs varsel.',
    meta: 'FAKTURADATO 20.02.1999',
    blocks: [
      {
        id: 'doc_strom_p1',
        type: 'para',
        runs: [
          {
            text: '2. GANGS VARSEL\nOLSEN GRETE\nAMMERUDVEIEN 47, LEIL. 312\n0958 OSLO',
          },
        ],
      },
      {
        id: 'doc_strom_p2',
        type: 'para',
        runs: [
          {
            text: 'KUNDENR. 442 108\nMÅLERNR. 08841-B\nANLEGG: AMMERUDVN. 47/312 ',
          },
        ],
      },
      {
        id: 'doc_strom_p3',
        type: 'table',
        align: ['left', 'right', 'right'],
        header: [
          [
            {
              text: 'SPESIFIKASJON',
            },
          ],
          [
            {
              text: 'MÅLT',
            },
          ],
          [
            {
              text: 'BELØP',
            },
          ],
        ],
        rows: [
          [
            [
              {
                text: 'Kraftforbruk 01.12.98–31.01.99',
              },
            ],
            [
              {
                text: '1 412 kWh',
              },
            ],
            [
              {
                text: '12 [icon=coin]',
              },
            ],
          ],
          [
            [
              {
                text: 'Nettleie og fastavgift',
              },
            ],
            [
              {
                text: '-',
              },
            ],
            [
              {
                text: '5 [icon=coin]',
              },
            ],
          ],
          [
            [
              {
                text: 'Purregebyr',
              },
            ],
            [
              {
                text: '-',
              },
            ],
            [
              {
                text: '1 [icon=coin]',
              },
            ],
          ],
          [
            [
              {
                text: 'Å BETALE',
              },
            ],
            [],
            [
              {
                text: '18 [icon=coin]',
              },
            ],
          ],
        ],
      },
      {
        id: 'doc_strom_p4',
        type: 'para',
        runs: [
          {
            text: ' Vi kan ikke se å ha mottatt betaling for faktura 99-108 331 med forfall 15.02.1999. Ved fortsatt uteblitt betaling vil anlegget bli varslet for frakobling iht. leveringsvilkårene § 7.',
          },
        ],
      },
      {
        id: 'doc_strom_p5',
        type: 'para',
        runs: [
          {
            text: 'BETALT AV: OLSEN GRETE, AMMERUDVEIEN 47, 0958 OSLO\nBETALT TIL: OSLO ENERGIVERK, POSTBOKS 2 SENTRUM, 0101 OSLO\nKONTO: 0540.08.11223 - KID: 99114872008\nFORFALL: 15.03.1999 - BELØP: 18 [icon=coin] ',
          },
        ],
      },
    ],
  },
  doc_kassalapp: {
    id: 'doc_kassalapp',
    kind: 'KASSALAPP',
    title: 'MATSENTRALEN',
    register: 'formell',
    peek: 'En kassalapp fra skoesken.',
    meta: '07.01.99 - KASSE 2',
    blocks: [
      {
        id: 'doc_kassalapp_p1',
        type: 'para',
        runs: [
          {
            text: 'MATSENTRALEN\nAMMERUD SENTER - OSLO\nTLF 22 43 xx xx\nORG NR 934 xxx xxx ',
          },
        ],
      },
      {
        id: 'doc_kassalapp_p2',
        type: 'table',
        align: ['left', 'left'],
        header: [],
        rows: [
          [
            [
              {
                text: 'HELMELK 1L',
              },
            ],
            [
              {
                text: '1 [icon=coin]',
              },
            ],
          ],
          [
            [
              {
                text: 'KNEIPPBRØD',
              },
            ],
            [
              {
                text: '1 [icon=coin]',
              },
            ],
          ],
          [
            [
              {
                text: 'KAFFE FILTERM. 250G',
              },
            ],
            [
              {
                text: '2 [icon=coin]',
              },
            ],
          ],
          [
            [
              {
                text: 'POTETER 2KG',
              },
            ],
            [
              {
                text: '1 [icon=coin]',
              },
            ],
          ],
          [
            [
              {
                text: 'KJØTTDEIG 400G',
              },
            ],
            [
              {
                text: '3 [icon=coin]',
              },
            ],
          ],
          [
            [
              {
                text: 'GULROT PK',
              },
            ],
            [
              {
                text: '1 [icon=coin]',
              },
            ],
          ],
          [
            [
              {
                text: 'HUSHOLDNINGSSAFT',
              },
            ],
            [
              {
                text: '1 [icon=coin]',
              },
            ],
          ],
        ],
      },
      {
        id: 'doc_kassalapp_p3',
        type: 'table',
        align: ['left', 'left'],
        header: [],
        rows: [
          [
            [
              {
                text: 'TOTALT',
              },
            ],
            [
              {
                text: '10 [icon=coin]',
              },
            ],
          ],
          [
            [
              {
                text: 'BANKKORT',
                factId: 'f_ingen_matkjop',
              },
            ],
            [
              {
                text: '10 [icon=coin]',
              },
            ],
          ],
        ],
      },
      {
        id: 'doc_kassalapp_p4',
        type: 'para',
        runs: [
          {
            text: ' 07.01.99 10:42 KASSE 2\nOPERATØR: 014',
          },
        ],
      },
      {
        id: 'doc_kassalapp_p5',
        type: 'para',
        runs: [
          {
            text: 'TAKK FOR HANDELEN\nVELKOMMEN IGJEN ',
          },
        ],
      },
    ],
  },
  doc_huseier: {
    id: 'doc_huseier',
    kind: 'BREV',
    title: 'Brev fra huseieren - T. Bakkerud',
    register: 'formell',
    peek: '"Jeg hører at din mor er gått bort."',
    meta: 'T. BAKKERUD - HÅNDSKREVET - LEVERT I POSTKASSEN - VIDEREFORMIDLET AV 4012',
    blocks: [
      {
        id: 'doc_huseier_p1',
        type: 'para',
        runs: [
          {
            text: 'Til Elling Olsen.',
          },
        ],
      },
      {
        id: 'doc_huseier_p2',
        type: 'para',
        runs: [
          {
            text: 'Jeg hører at din mor er gått bort. Kondolerer. Grete var et ordensmenneske, det har vært en glede å ha dere i oppgangen.',
          },
        ],
      },
      {
        id: 'doc_huseier_p3',
        type: 'para',
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
        type: 'para',
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
        type: 'para',
        runs: [
          {
            text: 'Vennlig hilsen\nT. Bakkerud ',
          },
        ],
      },
    ],
  },
  doc_frank_tlf: {
    id: 'doc_frank_tlf',
    kind: 'FELTNOTAT',
    title: 'Frank - telefonsamtale med Grete',
    register: 'notat',
    peek: '"Hun tok den på andre forsøk."',
    meta: 'FELTNOTAT - 4012 F. ÅSLI - TLF. G. OLSEN',
    blocks: [
      {
        id: 'doc_frank_tlf_p1',
        type: 'para',
        runs: [
          {
            text: 'Ringte Grete 11:40. Hun tok den på andre forsøk.',
          },
        ],
      },
      {
        id: 'doc_frank_tlf_p2',
        type: 'para',
        runs: [
          {
            text: 'Hun visste hvorfor jeg ringte. Haug hadde sagt fra. Hun var ikke sint, men hun var klar: ',
          },
          {
            text: '"Han klarer seg. Han har alltid klart seg." Hun sa det to ganger.',
            factId: 'f_klarer_seg',
          },
          {
            text: ' Andre gangen lavere.',
          },
        ],
      },
      {
        id: 'doc_frank_tlf_p3',
        type: 'para',
        runs: [
          {
            text: 'Jeg spurte hvem som overtar hvis hun skulle bli innlagt. Det ble stille. Hun svarte ikke på det.',
            factId: 'f_ingen_plan',
          },
        ],
      },
      {
        id: 'doc_frank_tlf_p4',
        type: 'para',
        runs: [
          {
            text: 'Jeg ba om å få hilse på Elling i telefonen. Hun sa han ikke tar telefonen. "Det er ikke noe galt med ham. Han liker bare ikke apparatet."',
            factId: 'f_elling_tlf',
          },
        ],
      },
      {
        id: 'doc_frank_tlf_p5',
        type: 'para',
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
        type: 'para',
        runs: [
          {
            text: 'Hun gikk med på hjemmebesøk. "Hvis det må til." Det må til. ',
          },
        ],
      },
    ],
  },
  doc_frank_visit: {
    id: 'doc_frank_visit',
    kind: 'RAPPORT',
    title: 'Frank - hjemmebesøk Ammerudveien 47',
    register: 'notat',
    peek: '"Hun hadde dekket på med tre kopper."',
    meta: 'HJEMMEBESØK - 4012 F. ÅSLI',
    blocks: [
      {
        id: 'doc_frank_visit_p1',
        type: 'para',
        runs: [
          {
            text: 'Grete åpnet før jeg fikk ringt på. Hun hadde dekket på med tre kopper. Elling brukte ikke sin.',
          },
        ],
      },
      {
        id: 'doc_frank_visit_p2',
        type: 'para',
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
        type: 'para',
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
        type: 'para',
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
        type: 'para',
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
        type: 'para',
        runs: [
          {
            text: 'Grete fulgte meg ut. I trappen sa hun: ',
          },
          {
            text: '"Du så hvordan han er. Han er en smart gutt."',
            factId: 'f_smart_gutt',
          },
          {
            text: ' Hun er 72. Han er 35. Gutt. ',
          },
        ],
      },
    ],
  },
  doc_innleggelse: {
    id: 'doc_innleggelse',
    kind: 'MELDING',
    title: 'OUS Ullevål - innleggelse',
    register: 'klinisk',
    peek: '"…ber om at kommunen ser til ham."',
    meta: 'ULLEVÅL SYKEHUS - TIL SOSIALKONTORET - 14.02.1999',
    blocks: [
      {
        id: 'doc_innleggelse_p1',
        type: 'para',
        runs: [
          {
            text: 'MELDING OM INNLEGGELSE',
          },
        ],
      },
      {
        id: 'doc_innleggelse_p2',
        type: 'para',
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
        type: 'para',
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
        type: 'para',
        runs: [
          {
            text: 'SOSIALMEDISINSK ENHET - OUS ',
          },
        ],
      },
    ],
  },
  doc_dodsfall: {
    id: 'doc_dodsfall',
    kind: 'MELDING',
    title: 'OUS Ullevål - dødsfall',
    register: 'klinisk',
    peek: '-',
    meta: 'ULLEVÅL SYKEHUS - TIL SOSIALKONTORET - 15.02.1999',
    blocks: [
      {
        id: 'doc_dodsfall_p1',
        type: 'para',
        runs: [
          {
            text: 'MELDING OM DØDSFALL',
          },
        ],
      },
      {
        id: 'doc_dodsfall_p2',
        type: 'para',
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
        type: 'para',
        runs: [
          {
            text: 'Avdødes sønn er eneste nærmeste pårørende. Varsling ble forsøkt per telefon uten svar. Politiet bisto ved varsling på bopel. Sønnen åpnet ikke døren. ',
          },
          {
            text: 'Beskjeden ble gitt gjennom brevsprekken.',
            factId: 'f_brevsprekken',
          },
        ],
      },
      {
        id: 'doc_dodsfall_p4',
        type: 'para',
        runs: [
          {
            text: 'Saken overføres kommunen for videre oppfølging av gjenlevende.',
          },
        ],
      },
      {
        id: 'doc_dodsfall_p5',
        type: 'para',
        runs: [
          {
            text: 'SOSIALMEDISINSK ENHET - OUS ',
          },
        ],
      },
    ],
  },
  doc_status: {
    id: 'doc_status',
    kind: 'STATUSRAPPORT',
    title: 'Frank - status dag 8',
    register: 'notat',
    peek: 'En uke siden meldingen.',
    meta: 'STATUSRAPPORT - 4012 F. ÅSLI - DAG 8',
    blocks: [
      {
        id: 'doc_status_p1',
        type: 'para',
        runs: [
          {
            text: 'Det foreligger ikke iverksatte tiltak som dekker bolig eller hverdag.',
          },
        ],
      },
      {
        id: 'doc_status_p2',
        type: 'para',
        runs: [
          {
            text: 'Restanse bygges. Posten vokser. Døren er lukket. Kommunen vet nå svært mye om Elling Olsen, og når ham ikke.',
          },
        ],
      },
      {
        id: 'doc_status_p3',
        type: 'para',
        runs: [
          {
            text: 'Bekymringsmeldingen var berettiget. Det er den fortsatt. ',
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
  },
  f_grete_baerer: {
    id: 'f_grete_baerer',
    domain: 'Hverdag/rutine',
    category: 'Dokument',
    text: 'Grete bistår med gjøremål, økonomi og kontakt med tjenester.',
    quote: 'Omfanget er ikke kartlagt',
    supports: ['q_grete_dor', 'q_okonomi'],
  },
  f_saarbar: {
    id: 'f_saarbar',
    domain: 'Helse/risiko',
    category: 'Risiko',
    text: 'Elling vurderes som sårbar ved bortfall av pårørende.',
    quote: 'primær omsorgsperson',
    supports: ['q_grete_dor'],
  },
  f_husleie: {
    id: 'f_husleie',
    domain: 'Økonomi/bolig',
    category: 'Økonomi',
    text: 'Husleien er 120 [icon=coin] og betales av Grete.',
    quote: 'KONTANTUTTAK SKRANKE',
    supports: ['q_okonomi', 'q_bolig'],
  },
  f_trygd: {
    id: 'f_trygd',
    domain: 'Økonomi/bolig',
    category: 'Økonomi',
    text: 'Ellings uføretrygd: 90 [icon=coin] i måneden.',
    quote: 'UFØRETRYGD RTV',
    supports: ['q_okonomi', 'q_bolig'],
  },
  f_alt_via_grete: {
    id: 'f_alt_via_grete',
    domain: 'Økonomi/bolig',
    category: 'Økonomi',
    text: 'Hele trygden går rett inn i Gretes system. Alle avtaler står i hennes navn.',
    quote: 'KONTOEN DISPONERES AV VERGE. KORT ER IKKE UTSTEDT.',
    supports: ['q_okonomi'],
  },
  f_ingen_matkjop: {
    id: 'f_ingen_matkjop',
    domain: 'Hverdag/rutine',
    category: 'Økonomi',
    text: 'Elling har aldri betalt for mat selv. Mat skjer gjennom Grete.',
    quote: 'BANKKORT',
    supports: ['q_grete_dor'],
  },
  f_gap: {
    id: 'f_gap',
    domain: 'Økonomi/bolig',
    category: 'Økonomi',
    text: 'Uten Gretes pensjon mangler husholdet 100 [icon=coin] hver måned.',
    quote: '',
    supports: ['q_okonomi', 'q_bolig'],
  },
  f_leie_stoppet: {
    id: 'f_leie_stoppet',
    domain: 'Økonomi/bolig',
    category: 'Risiko',
    text: 'Husleien har stoppet. Betalingskjeden døde med Grete.',
    quote: 'Leien for mars er ikke kommet.',
    supports: ['q_bolig', 'q_kollaps'],
  },
  f_huseier_kommer: {
    id: 'f_huseier_kommer',
    domain: 'Økonomi/bolig',
    category: 'Risiko',
    text: 'Huseieren varsler at han kommer innom. Torsdag.',
    quote: 'jeg kommer innom på torsdag, så får vi snakke om veien videre.',
    supports: ['q_bolig', 'q_baering'],
  },
  f_leie_privat: {
    id: 'f_leie_privat',
    domain: 'Økonomi/bolig',
    category: 'Dokument',
    text: 'Leieforholdet er privat og muntlig innarbeidet siden 1971. Ingen kontrakt å lene seg på.',
    quote: 'Din mor og jeg har holdt på siden -71 uten papirer. Det har aldri vært nødvendig.',
    supports: ['q_bolig'],
  },
  f_klarer_seg: {
    id: 'f_klarer_seg',
    domain: 'Nettverk/sosialt',
    category: 'Samtale',
    text: 'Grete avviser bekymringen. Gjentar formuleringen.',
    quote: '"Han klarer seg. Han har alltid klart seg." Hun sa det to ganger.',
    supports: ['q_grete_dor'],
  },
  f_ingen_plan: {
    id: 'f_ingen_plan',
    domain: 'Helse/risiko',
    category: 'Samtale',
    text: 'Det finnes ingen plan for hvem som overtar etter Grete.',
    quote:
      'Jeg spurte hvem som overtar hvis hun skulle bli innlagt. Det ble stille. Hun svarte ikke på det.',
    supports: ['q_grete_dor', 'q_bolig'],
  },
  f_elling_tlf: {
    id: 'f_elling_tlf',
    domain: 'Nettverk/sosialt',
    category: 'Samtale',
    text: 'Elling tar ikke telefonen. Grete normaliserer det.',
    quote:
      'Jeg ba om å få hilse på Elling i telefonen. Hun sa han ikke tar telefonen. "Det er ikke noe galt med ham. Han liker bare ikke apparatet."',
    supports: ['q_baering'],
  },
  f_grete_redd: {
    id: 'f_grete_redd',
    domain: 'Nettverk/sosialt',
    category: 'Samtale',
    text: 'Grete frykter at kommunen vil ta leiligheten, eller Elling.',
    quote: 'spurte hun om dette betydde at noen kom til å ta ham fra leiligheten',
    supports: ['q_bolig'],
  },
  f_post: {
    id: 'f_post',
    domain: 'Hverdag/rutine',
    category: 'Observasjon',
    text: 'Uåpnet post samler seg. Grete håndterer den - og skjuler den.',
    quote:
      'en bunke uåpnet post på skoskapet. Øverst: Trygdekontoret, sosialkontoret, Oslo Energi.',
    supports: ['q_grete_dor', 'q_okonomi'],
  },
  f_bok: {
    id: 'f_bok',
    domain: 'Ressurser',
    category: 'Ressurs',
    text: 'Elling leser krevende stoff og noterer systematisk. Konsentrasjonen er en ressurs.',
    quote: 'en bok om polarekspedisjoner. Han noterte i margen. Systematisk, små bokstaver.',
    supports: ['q_evner'],
  },
  f_utklipp: {
    id: 'f_utklipp',
    domain: 'Ressurser',
    category: 'Ressurs',
    text: 'Elling samler og systematiserer: utklipp av Gro og Arbeiderpartiet, datert og ordnet.',
    quote:
      'avisutklipp, sirlig montert. Gro, landsmøter, 1. mai-tog. Årstall i hjørnene, hans håndskrift.',
    supports: ['q_evner'],
  },
  f_avstand: {
    id: 'f_avstand',
    domain: 'Nettverk/sosialt',
    category: 'Observasjon',
    text: 'Elling holder avstand til fremmede. Alltid et møbel mellom.',
    quote: 'Han forlot ikke rommet, men flyttet seg slik at det alltid var et møbel mellom oss.',
    supports: ['q_baering', 'q_evner'],
  },
  f_dor_glott: {
    id: 'f_dor_glott',
    domain: 'Nettverk/sosialt',
    category: 'Samtale',
    text: 'Elling kastet ikke Frank ut, og svarte da Frank spurte om noe han kunne. Kontakt er mulig - forsiktig.',
    quote:
      'han kastet meg ikke ut, og han svarte da jeg spurte om noe han kunne. Det er en dør på gløtt.',
    supports: ['q_baering'],
  },
  f_smart_gutt: {
    id: 'f_smart_gutt',
    domain: 'Nettverk/sosialt',
    category: 'Samtale',
    text: 'Grete omtaler Elling (35) som "gutt". Rollene er fastlåst.',
    quote: '"Du så hvordan han er. Han er en smart gutt."',
    supports: ['q_grete_dor', 'q_evner'],
  },
  f_innlagt: {
    id: 'f_innlagt',
    domain: 'Helse/risiko',
    category: 'Dokument',
    text: 'Grete er akutt innlagt på Ullevål.',
    quote: 'innlagt akutt 14.02',
    supports: ['q_grete_dor', 'q_bolig'],
  },
  f_elling_uvarslet: {
    id: 'f_elling_uvarslet',
    domain: 'Helse/risiko',
    category: 'Dokument',
    text: 'Elling vet ikke at Grete er innlagt. Hun ber kommunen se til ham.',
    quote: 'Pasienten oppgir at sønnen ikke er varslet. Hun ber om at kommunen ser til ham.',
    supports: ['q_baering', 'q_kollaps'],
  },
  f_dod: {
    id: 'f_dod',
    domain: 'Helse/risiko',
    category: 'Dokument',
    text: 'Grete Olsen døde 15.02 kl. 04:12.',
    quote: 'Dødsfall konstatert 15.02 kl. 04:12.',
    supports: ['q_kollaps'],
  },
  f_brevsprekken: {
    id: 'f_brevsprekken',
    domain: 'Nettverk/sosialt',
    category: 'Dokument',
    text: 'Han åpent ikke døren, men beskjeden ble levert i brevsprekken.',
    quote: 'Beskjeden ble gitt gjennom brevsprekken.',
    supports: ['q_baering', 'q_kollaps'],
  },
} satisfies Record<string, BlueprintFact>;

export const tinyOlsenQuestions = {
  q_grete_dor: {
    id: 'q_grete_dor',
    title: 'Den dagen Grete ikke kommer hjem - hva stopper?',
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
        needs: ['f_ingen_plan'],
        opens: [],
        note: 'Det finnes ikke observasjon av Elling uten Grete. Uvitenheten er selve funnet - og den må lukkes før noe annet.',
      },
    ],
  },
  q_evner: {
    id: 'q_evner',
    title: 'Hva klarer Elling selv - når ingen har gjort det for ham først?',
    appearsOn: ['f_bok', 'f_utklipp'],
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
        label: 'Han forstår - men unngår. Posten ligger uåpnet, ikke ulest.',
        needs: ['f_post', 'f_bok'],
        opens: ['t_dokgjennomgang'],
        note: 'Kapasiteten til å forstå er observert. Papiret når likevel aldri frem, fordi konvolutten aldri åpnes. Problemet er kanal, ikke forståelse.',
      },
      {
        id: 'h_ev_ukjent',
        label: 'Vet ikke. Ingen har prøvd. Det er selve funnet.',
        needs: [],
        opens: ['t_brev', 't_regning'],
        note: 'Kommunen har ingen observasjon av hva Elling klarer alene. Første tiltak må være å finne det ut - forsiktig.',
      },
    ],
  },
  q_okonomi: {
    id: 'q_okonomi',
    title: 'Regnestykket Olsen: hva kommer inn, hva går ut - og gjennom hvem?',
    appearsOn: ['f_grete_baerer', 'f_trygd', 'f_husleie'],
    hypotheses: [
      {
        id: 'h_ok_kjede',
        label: 'Betalingskjeden er én person. Kjeden, ikke beløpene, er risikoen.',
        needs: ['f_husleie', 'f_alt_via_grete'],
        opens: ['t_forvaltning'],
        note: 'Husleie og faste betalinger fungerer gjennom Gretes system - skoesken, postgiroene, kontantene den første. Systemet har én operatør.',
      },
      {
        id: 'h_ok_gap',
        label: 'Trygden dekker ikke husholdet. 100 [icon=coin] mangler hver måned.',
        needs: ['f_gap'],
        opens: ['t_bostotte', 't_huseier'],
        note: 'Ellings trygd er 90 [icon=coin]. Husleien alene er 120 [icon=coin], og januar kostet 190. Differansen bæres i dag av Gretes pensjon. Bortfall gir umiddelbar restanserisiko.',
      },
    ],
  },
  q_bolig: {
    id: 'q_bolig',
    title: 'Kan Elling bli boende - når husleien har stoppet?',
    appearsOn: ['f_gap', 'f_leie_stoppet', 'f_husleie'],
    hypotheses: [
      {
        id: 'h_b_sikres',
        label: 'Boligen kan sikres - med bostøtte og ordnet betalingskjede.',
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
        label: 'Uavklart - økonomien må kartlegges først.',
        needs: [],
        opens: [],
        note: 'Å velge bolig-retning uten regnestykket er gjetning. Kartlegg først.',
      },
    ],
  },
  q_baering: {
    id: 'q_baering',
    title:
      'Noe av det Grete gjorde må noen andre gjøre. Hvor lite kan kommunen slippe unna med - og hvor mye tåler han?',
    appearsOn: ['f_elling_tlf', 'f_avstand'],
    hypotheses: [
      {
        id: 'h_ba_kanal',
        label: 'Først en kanal. Fast person, fast tid, oppmøte - telefonen er stengt.',
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
        label: 'Alt. Fullt omsorgsansvar - institusjon eller omsorgsbolig.',
        needs: ['f_saarbar'],
        opens: ['t_institusjon'],
        note: 'Sårbarheten vurderes som for stor for hjemmeboende støtte. Tyngste ende av skalaen - og den kan alltid utløses.',
      },
    ],
  },
  q_vekst: {
    id: 'q_vekst',
    title: 'Hva kan læres - og i hvilket tempo, uten å knekke noe?',
    appearsOn: ['f_bok', 'f_utklipp'],
    hypotheses: [
      {
        id: 'h_ve_rutine',
        label: 'Én rutine om gangen. Konsentrasjonen er der; tempoet må være hans.',
        needs: ['f_bok'],
        opens: ['t_brev', 't_regning'],
        note: 'Kapasitet til fordypning og system er observert. Avgrensede rutiner kan bygges med støtte - lavt tempo, fast person, hans eget arkivspråk.',
      },
      {
        id: 'h_ve_formell',
        label: 'Ferdighetene er der ikke. Støtte må bære - læring er ikke planen nå.',
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
    title: 'Ikke bare berget - levd. Hva skulle til for at Elling har et liv han vil ha?',
    appearsOn: ['f_dod', 'f_utklipp'],
    hypotheses: [
      {
        id: 'h_liv_interesser',
        label: 'Deltakelse via interessene. Arkivet er en dør ut, ikke et symptom.',
        needs: ['f_utklipp', 'f_bok'],
        opens: [],
        note: 'Gro-arkivet og systematikken er en identitet det går an å delta gjennom - i hans tempo.',
      },
      {
        id: 'h_liv_trygghet',
        label: 'Trygghet først. Verden i hans tempo, med møbel imellom - og det er greit.',
        needs: ['f_avstand'],
        opens: [],
        note: 'Avstanden er ikke et problem som skal fikses, men et premiss tjenestene må respektere.',
      },
      {
        id: 'h_liv_sporre',
        label: 'Det vet bare Elling. Noen må spørre ham - og noen må kunne få svar.',
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
    description: 'Husbanken. Krever dokumentert inntekt og husleie. Saksbehandlingstid.',
    sim: 'case.olsen.tiltak.bostotte',
  },
  t_forvaltning: {
    id: 't_forvaltning',
    slot: 's1',
    title: 'Frivillig forvaltning av faste betalinger',
    cost: 1,
    description: 'Kommunen overtar skoesken. Trygt. Bygger ingenting.',
    sim: 'case.olsen.tiltak.forvaltning',
  },
  t_huseier: {
    id: 't_huseier',
    slot: 's1',
    title: 'Snakk med huseieren',
    cost: 0,
    description:
      'Bakkerud vil vite hvem han skal forholde seg til. La det bli Frank - ikke torsdagsbesøket.',
    sim: 'case.olsen.tiltak.garanti',
  },
  t_hjemmehjelp: {
    id: 't_hjemmehjelp',
    slot: 's2',
    title: 'Hjemmehjelp 2× uke - Frank',
    cost: 2,
    description: 'Fast person, fast tid. Den eneste kanalen inn som har virket hittil.',
    sim: 'case.olsen.tiltak.channel',
  },
  t_matlevering: {
    id: 't_matlevering',
    slot: 's2',
    title: 'Matombringing',
    cost: 1,
    description: 'Bokser på døren, tre dager i uken. Forutsetter at døren er en kanal.',
    sim: 'case.olsen.tiltak.food',
  },
  t_dokgjennomgang: {
    id: 't_dokgjennomgang',
    slot: 's2',
    title: 'Fast dokumentgjennomgang',
    cost: 1,
    description: 'Frank går gjennom posten ukentlig. Papiret når frem til en vurdering.',
    sim: 'case.olsen.tiltak.dok',
  },
  t_brev: {
    id: 't_brev',
    slot: 's3',
    title: 'Åpne ett brev sammen med Frank',
    cost: 0,
    description: 'Ett brev. Ikke bunken. Frank legger det på bordet og venter.',
    sim: 'case.olsen.tiltak.brev',
  },
  t_regning: {
    id: 't_regning',
    slot: 's3',
    title: 'Betal én regning med støtte',
    cost: 0,
    description: 'Én regning, én gang. Målet er at det har skjedd, ikke at det er lært.',
    sim: 'case.olsen.tiltak.regning',
  },
  t_institusjon: {
    id: 't_institusjon',
    slot: 'press',
    title: 'Institusjonsvurdering / omsorgsbolig',
    cost: 0,
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
  title: 'Olsen - full case slice',
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
        'Under behandling av pasient Grete Olsen (f. 1927) for en [url=fact:f_grete_syk]sykdom med kort forventet forløp[/url] kommer det frem at hun er [url=fact:f_saarbar]primær omsorgsperson[/url] for sin sønn Elling Olsen (f. 14.03.1964). [url=fact:f_grete_baerer]Omfanget er ikke kartlagt[/url], men han kan ha behov for støtte ved mors bortfall. \n\nJørgen Haug\nspes. allmennmedisin',
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
          text: ' for sin sønn Elling Olsen (f. 14.03.1964). ',
          fact_id: '',
        },
        {
          id: 'run_grete_baerer',
          text: 'Omfanget er ikke kartlagt',
          fact_id: 'f_grete_baerer',
        },
        {
          id: 'run_text_3',
          text: ', men han kan ha behov for støtte ved mors bortfall. Jørgen Haug spes. allmennmedisin',
          fact_id: '',
        },
      ],
    },
    {
      id: 'doc_konto_grete',
      kind: 'KONTOUTSKRIFT',
      title: 'KONTOUTSKRIFT',
      register: 'formell',
      peek: 'Kontoutskrift. Grete Olsen, januar.',
      meta: 'NR. 2/99',
      body_bbcode:
        'OLSEN GRETE\nAMMERUDVEIEN 47\n0958 OSLO\n\nKONTO: 7024.31.44892\nPERIODE: 01.01.99–31.01.99\nUTSKR.DATO: 02.02.99\n\n[table=5][cell]DATO[/cell][cell]TEKST[/cell][cell]UT[/cell][cell]INN[/cell][cell]SALDO[/cell][cell]01.01[/cell][cell]SALDO OVERFØRT[/cell][cell][/cell][cell][/cell][cell]25 [icon=coin][/cell][cell]04.01[/cell][cell]PENSJON RTV[/cell][cell][/cell][cell]125 [icon=coin][/cell][cell]150 [icon=coin][/cell][cell]04.01[/cell][cell]OVERF. E. OLSEN 7024.31.55103[/cell][cell][/cell][cell]90 [icon=coin][/cell][cell]240 [icon=coin][/cell][cell]05.01[/cell][cell][url=fact:f_husleie]KONTANTUTTAK SKRANKE[/url][/cell][cell]120 [icon=coin][/cell][cell][/cell][cell]120 [icon=coin][/cell][cell]07.01[/cell][cell]MATSENTRALEN AMMERUD[/cell][cell]10 [icon=coin][/cell][cell][/cell][cell]110 [icon=coin][/cell][cell]11.01[/cell][cell]POSTGIRO - OSLO ENERGIVERK[/cell][cell]17 [icon=coin][/cell][cell][/cell][cell]93 [icon=coin][/cell][cell]12.01[/cell][cell]MATSENTRALEN AMMERUD[/cell][cell]11 [icon=coin][/cell][cell][/cell][cell]82 [icon=coin][/cell][cell]14.01[/cell][cell]AMMERUD APOTEK[/cell][cell]4 [icon=coin][/cell][cell][/cell][cell]78 [icon=coin][/cell][cell]18.01[/cell][cell]MATSENTRALEN AMMERUD[/cell][cell]10 [icon=coin][/cell][cell][/cell][cell]68 [icon=coin][/cell][cell]21.01[/cell][cell]POSTGIRO - TELEVERKET[/cell][cell]5 [icon=coin][/cell][cell][/cell][cell]63 [icon=coin][/cell][cell]25.01[/cell][cell]MATSENTRALEN AMMERUD[/cell][cell]11 [icon=coin][/cell][cell][/cell][cell]52 [icon=coin][/cell][cell]28.01[/cell][cell]NARVESEN - UKEBLAD/AVIS[/cell][cell]2 [icon=coin][/cell][cell][/cell][cell]50 [icon=coin][/cell][cell]31.01[/cell][cell]SALDO[/cell][cell][/cell][cell][/cell][cell]50 [icon=coin][/cell][/table]\n\nRENTESATS INNSKUDD 3 % P.A. - UTSKRIFTEN SENDES KVARTALSVIS\nHENVENDELSER RETTES TIL DERES FILIAL. TA MED LEGITIMASJON.',
      runs: [
        {
          id: 'run_text_0',
          text: 'OLSEN GRETE AMMERUDVEIEN 47 0958 OSLO KONTO: 7024.31.44892 PERIODE: 01.01.99–31.01.99 UTSKR.DATO: 02.02.99 DATO TEKST UT INN SALDO 01.01 SALDO OVERFØRT 25 [icon=coin] 04.01 PENSJON RTV 125 [icon=coin] 150 [icon=coin] 04.01 OVERF. E. OLSEN 7024.31.55103 90 [icon=coin] 240 [icon=coin] 05.01 ',
          fact_id: '',
        },
        {
          id: 'run_husleie',
          text: 'KONTANTUTTAK SKRANKE',
          fact_id: 'f_husleie',
        },
        {
          id: 'run_text_1',
          text: ' 120 [icon=coin] 120 [icon=coin] 07.01 MATSENTRALEN AMMERUD 10 [icon=coin] 110 [icon=coin] 11.01 POSTGIRO - OSLO ENERGIVERK 17 [icon=coin] 93 [icon=coin] 12.01 MATSENTRALEN AMMERUD 11 [icon=coin] 82 [icon=coin] 14.01 AMMERUD APOTEK 4 [icon=coin] 78 [icon=coin] 18.01 MATSENTRALEN AMMERUD 10 [icon=coin] 68 [icon=coin] 21.01 POSTGIRO - TELEVERKET 5 [icon=coin] 63 [icon=coin] 25.01 MATSENTRALEN AMMERUD 11 [icon=coin] 52 [icon=coin] 28.01 NARVESEN - UKEBLAD/AVIS 2 [icon=coin] 50 [icon=coin] 31.01 SALDO 50 [icon=coin] RENTESATS INNSKUDD 3 % P.A. - UTSKRIFTEN SENDES KVARTALSVIS HENVENDELSER RETTES TIL DERES FILIAL. TA MED LEGITIMASJON.',
          fact_id: '',
        },
      ],
    },
    {
      id: 'doc_konto_elling',
      kind: 'KONTOUTSKRIFT',
      title: 'KONTOUTSKRIFT',
      register: 'formell',
      peek: 'Årsutskrift. Elling Olsen.',
      meta: 'NR. 1/99 - ÅRSUTSKRIFT',
      body_bbcode:
        'OLSEN ELLING\nV/ OLSEN GRETE (VERGE)\nAMMERUDVEIEN 47\n0958 OSLO\n\nKONTO: 7024.31.55103\nPERIODE: 01.10.98–31.01.99\nUTSKR.DATO: 02.02.99\n\n[table=5][cell]DATO[/cell][cell]TEKST[/cell][cell]UT[/cell][cell]INN[/cell][cell]SALDO[/cell][cell]01.10[/cell][cell]SALDO OVERFØRT[/cell][cell][/cell][cell][/cell][cell]0 [icon=coin][/cell][cell]02.10[/cell][cell][url=fact:f_trygd]UFØRETRYGD RTV[/url][/cell][cell][/cell][cell]90 [icon=coin][/cell][cell]90 [icon=coin][/cell][cell]02.10[/cell][cell]FAST OVERF. G. OLSEN (VERGE)[/cell][cell]90 [icon=coin][/cell][cell][/cell][cell]0 [icon=coin][/cell][cell]02.11[/cell][cell]UFØRETRYGD RTV[/cell][cell][/cell][cell]90 [icon=coin][/cell][cell]90 [icon=coin][/cell][cell]02.11[/cell][cell]FAST OVERF. G. OLSEN (VERGE)[/cell][cell]90 [icon=coin][/cell][cell][/cell][cell]0 [icon=coin][/cell][cell]02.12[/cell][cell]UFØRETRYGD RTV[/cell][cell][/cell][cell]90 [icon=coin][/cell][cell]90 [icon=coin][/cell][cell]02.12[/cell][cell]FAST OVERF. G. OLSEN (VERGE)[/cell][cell]90 [icon=coin][/cell][cell][/cell][cell]0 [icon=coin][/cell][cell]04.01[/cell][cell]UFØRETRYGD RTV[/cell][cell][/cell][cell]90 [icon=coin][/cell][cell]90 [icon=coin][/cell][cell]04.01[/cell][cell]FAST OVERF. G. OLSEN (VERGE)[/cell][cell]90 [icon=coin][/cell][cell][/cell][cell]0 [icon=coin][/cell][cell]31.01[/cell][cell]SALDO[/cell][cell][/cell][cell][/cell][cell]0 [icon=coin][/cell][/table]\n\nINGEN ANDRE BEVEGELSER I PERIODEN.\n\n[url=fact:f_alt_via_grete]KONTOEN DISPONERES AV VERGE. KORT ER IKKE UTSTEDT.[/url]',
      runs: [
        {
          id: 'run_text_0',
          text: 'OLSEN ELLING V/ OLSEN GRETE (VERGE) AMMERUDVEIEN 47 0958 OSLO KONTO: 7024.31.55103 PERIODE: 01.10.98–31.01.99 UTSKR.DATO: 02.02.99 DATO TEKST UT INN SALDO 01.10 SALDO OVERFØRT 0 [icon=coin] 02.10 ',
          fact_id: '',
        },
        {
          id: 'run_trygd',
          text: 'UFØRETRYGD RTV',
          fact_id: 'f_trygd',
        },
        {
          id: 'run_text_1',
          text: ' 90 [icon=coin] 90 [icon=coin] 02.10 FAST OVERF. G. OLSEN (VERGE) 90 [icon=coin] 0 [icon=coin] 02.11 UFØRETRYGD RTV 90 [icon=coin] 90 [icon=coin] 02.11 FAST OVERF. G. OLSEN (VERGE) 90 [icon=coin] 0 [icon=coin] 02.12 UFØRETRYGD RTV 90 [icon=coin] 90 [icon=coin] 02.12 FAST OVERF. G. OLSEN (VERGE) 90 [icon=coin] 0 [icon=coin] 04.01 UFØRETRYGD RTV 90 [icon=coin] 90 [icon=coin] 04.01 FAST OVERF. G. OLSEN (VERGE) 90 [icon=coin] 0 [icon=coin] 31.01 SALDO 0 [icon=coin] INGEN ANDRE BEVEGELSER I PERIODEN. ',
          fact_id: '',
        },
        {
          id: 'run_alt_via_grete',
          text: 'KONTOEN DISPONERES AV VERGE. KORT ER IKKE UTSTEDT.',
          fact_id: 'f_alt_via_grete',
        },
      ],
    },
    {
      id: 'doc_strom',
      kind: 'REGNING',
      title: 'FAKTURA NR. 99-114 872',
      register: 'formell',
      peek: 'Strømregning. 2. gangs varsel.',
      meta: 'FAKTURADATO 20.02.1999',
      body_bbcode:
        '2. GANGS VARSEL\nOLSEN GRETE\nAMMERUDVEIEN 47, LEIL. 312\n0958 OSLO\n\nKUNDENR. 442 108\nMÅLERNR. 08841-B\nANLEGG: AMMERUDVN. 47/312\n\n[table=3][cell]SPESIFIKASJON[/cell][cell]MÅLT[/cell][cell]BELØP[/cell][cell]Kraftforbruk 01.12.98–31.01.99[/cell][cell]1 412 kWh[/cell][cell]12 [icon=coin][/cell][cell]Nettleie og fastavgift[/cell][cell]-[/cell][cell]5 [icon=coin][/cell][cell]Purregebyr[/cell][cell]-[/cell][cell]1 [icon=coin][/cell][cell]Å BETALE[/cell][cell][/cell][cell]18 [icon=coin][/cell][/table]\n\nVi kan ikke se å ha mottatt betaling for faktura 99-108 331 med forfall 15.02.1999. Ved fortsatt uteblitt betaling vil anlegget bli varslet for frakobling iht. leveringsvilkårene § 7.\n\nBETALT AV: OLSEN GRETE, AMMERUDVEIEN 47, 0958 OSLO\nBETALT TIL: OSLO ENERGIVERK, POSTBOKS 2 SENTRUM, 0101 OSLO\nKONTO: 0540.08.11223 - KID: 99114872008\nFORFALL: 15.03.1999 - BELØP: 18 [icon=coin]',
      runs: [
        {
          id: 'run_text_0',
          text: '2. GANGS VARSEL OLSEN GRETE AMMERUDVEIEN 47, LEIL. 312 0958 OSLO KUNDENR. 442 108 MÅLERNR. 08841-B ANLEGG: AMMERUDVN. 47/312 SPESIFIKASJON MÅLT BELØP Kraftforbruk 01.12.98–31.01.99 1 412 kWh 12 [icon=coin] Nettleie og fastavgift - 5 [icon=coin] Purregebyr - 1 [icon=coin] Å BETALE 18 [icon=coin] Vi kan ikke se å ha mottatt betaling for faktura 99-108 331 med forfall 15.02.1999. Ved fortsatt uteblitt betaling vil anlegget bli varslet for frakobling iht. leveringsvilkårene § 7. BETALT AV: OLSEN GRETE, AMMERUDVEIEN 47, 0958 OSLO BETALT TIL: OSLO ENERGIVERK, POSTBOKS 2 SENTRUM, 0101 OSLO KONTO: 0540.08.11223 - KID: 99114872008 FORFALL: 15.03.1999 - BELØP: 18 [icon=coin]',
          fact_id: '',
        },
      ],
    },
    {
      id: 'doc_kassalapp',
      kind: 'KASSALAPP',
      title: 'MATSENTRALEN',
      register: 'formell',
      peek: 'En kassalapp fra skoesken.',
      meta: '07.01.99 - KASSE 2',
      body_bbcode:
        'MATSENTRALEN\nAMMERUD SENTER - OSLO\nTLF 22 43 xx xx\nORG NR 934 xxx xxx\n\n[table=2][cell]HELMELK 1L[/cell][cell]1 [icon=coin][/cell][cell]KNEIPPBRØD[/cell][cell]1 [icon=coin][/cell][cell]KAFFE FILTERM. 250G[/cell][cell]2 [icon=coin][/cell][cell]POTETER 2KG[/cell][cell]1 [icon=coin][/cell][cell]KJØTTDEIG 400G[/cell][cell]3 [icon=coin][/cell][cell]GULROT PK[/cell][cell]1 [icon=coin][/cell][cell]HUSHOLDNINGSSAFT[/cell][cell]1 [icon=coin][/cell][/table]\n\n[table=2][cell]TOTALT[/cell][cell]10 [icon=coin][/cell][cell][url=fact:f_ingen_matkjop]BANKKORT[/url][/cell][cell]10 [icon=coin][/cell][/table]\n\n07.01.99  10:42  KASSE 2\nOPERATØR: 014\n\nTAKK FOR HANDELEN\nVELKOMMEN IGJEN',
      runs: [
        {
          id: 'run_text_0',
          text: 'MATSENTRALEN AMMERUD SENTER - OSLO TLF 22 43 xx xx ORG NR 934 xxx xxx HELMELK 1L 1 [icon=coin] KNEIPPBRØD 1 [icon=coin] KAFFE FILTERM. 250G 2 [icon=coin] POTETER 2KG 1 [icon=coin] KJØTTDEIG 400G 3 [icon=coin] GULROT PK 1 [icon=coin] HUSHOLDNINGSSAFT 1 [icon=coin] TOTALT 10 [icon=coin] ',
          fact_id: '',
        },
        {
          id: 'run_ingen_matkjop',
          text: 'BANKKORT',
          fact_id: 'f_ingen_matkjop',
        },
        {
          id: 'run_text_1',
          text: ' 10 [icon=coin] 07.01.99 10:42 KASSE 2 OPERATØR: 014 TAKK FOR HANDELEN VELKOMMEN IGJEN',
          fact_id: '',
        },
      ],
    },
    {
      id: 'doc_huseier',
      kind: 'BREV',
      title: 'Brev fra huseieren - T. Bakkerud',
      register: 'formell',
      peek: '"Jeg hører at din mor er gått bort."',
      meta: 'T. BAKKERUD - HÅNDSKREVET - LEVERT I POSTKASSEN - VIDEREFORMIDLET AV 4012',
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
      title: 'Frank - telefonsamtale med Grete',
      register: 'notat',
      peek: '"Hun tok den på andre forsøk."',
      meta: 'FELTNOTAT - 4012 F. ÅSLI - TLF. G. OLSEN',
      body_bbcode:
        'Ringte Grete 11:40. Hun tok den på andre forsøk.\n\nHun visste hvorfor jeg ringte. Haug hadde sagt fra. Hun var ikke sint, men hun var klar: [url=fact:f_klarer_seg]"Han klarer seg. Han har alltid klart seg." Hun sa det to ganger.[/url] Andre gangen lavere.\n\n[url=fact:f_ingen_plan]Jeg spurte hvem som overtar hvis hun skulle bli innlagt. Det ble stille. Hun svarte ikke på det.[/url]\n\n[url=fact:f_elling_tlf]Jeg ba om å få hilse på Elling i telefonen. Hun sa han ikke tar telefonen. "Det er ikke noe galt med ham. Han liker bare ikke apparatet."[/url]\n\nMot slutten [url=fact:f_grete_redd]spurte hun om dette betydde at noen kom til å ta ham fra leiligheten[/url]. Jeg sa nei. Jeg håper det var sant.\n\nHun gikk med på hjemmebesøk. "Hvis det må til." Det må til.',
      runs: [
        {
          id: 'run_text_0',
          text: 'Ringte Grete 11:40. Hun tok den på andre forsøk. Hun visste hvorfor jeg ringte. Haug hadde sagt fra. Hun var ikke sint, men hun var klar: ',
          fact_id: '',
        },
        {
          id: 'run_klarer_seg',
          text: '"Han klarer seg. Han har alltid klart seg." Hun sa det to ganger.',
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
          text: 'Jeg ba om å få hilse på Elling i telefonen. Hun sa han ikke tar telefonen. "Det er ikke noe galt med ham. Han liker bare ikke apparatet."',
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
          text: '. Jeg sa nei. Jeg håper det var sant. Hun gikk med på hjemmebesøk. "Hvis det må til." Det må til.',
          fact_id: '',
        },
      ],
    },
    {
      id: 'doc_frank_visit',
      kind: 'RAPPORT',
      title: 'Frank - hjemmebesøk Ammerudveien 47',
      register: 'notat',
      peek: '"Hun hadde dekket på med tre kopper."',
      meta: 'HJEMMEBESØK - 4012 F. ÅSLI',
      body_bbcode:
        'Grete åpnet før jeg fikk ringt på. Hun hadde dekket på med tre kopper. Elling brukte ikke sin.\n\nI gangen: [url=fact:f_post]en bunke uåpnet post på skoskapet. Øverst: Trygdekontoret, sosialkontoret, Oslo Energi.[/url] Grete flyttet bunken da hun så at jeg så.\n\nElling satt i stuen med [url=fact:f_bok]en bok om polarekspedisjoner. Han noterte i margen. Systematisk, små bokstaver.[/url] Jeg spurte om Nansen. Han svarte med tre presise setninger. Til veggen, ikke til meg.\n\nOver skrivebordet hans: [url=fact:f_utklipp]avisutklipp, sirlig montert. Gro, landsmøter, 1. mai-tog. Årstall i hjørnene, hans håndskrift.[/url] Det er ikke rot. Det er et arkiv.\n\n[url=fact:f_avstand]Han forlot ikke rommet, men flyttet seg slik at det alltid var et møbel mellom oss.[/url] Ikke demonstrativt. Bare slik det ble.\n\nGrete fulgte meg ut. I trappen sa hun: [url=fact:f_smart_gutt]"Du så hvordan han er. Han er en smart gutt."[/url] Hun er 72. Han er 35. Gutt.',
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
          text: '"Du så hvordan han er. Han er en smart gutt."',
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
      title: 'OUS Ullevål - innleggelse',
      register: 'klinisk',
      peek: '"…ber om at kommunen ser til ham."',
      meta: 'ULLEVÅL SYKEHUS - TIL SOSIALKONTORET - 14.02.1999',
      body_bbcode:
        'MELDING OM INNLEGGELSE\n\nGrete Olsen (f. 1927) ble [url=fact:f_innlagt]innlagt akutt 14.02[/url], kl. 06:50. Tilstanden er alvorlig, men avklart. Pårørende: sønn, Elling Olsen.\n\n[url=fact:f_elling_uvarslet]Pasienten oppgir at sønnen ikke er varslet. Hun ber om at kommunen ser til ham.[/url] Hun var tydelig på dette før hun ble lagt i behandling.\n\nSOSIALMEDISINSK ENHET - OUS',
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
          text: ' Hun var tydelig på dette før hun ble lagt i behandling. SOSIALMEDISINSK ENHET - OUS',
          fact_id: '',
        },
      ],
    },
    {
      id: 'doc_dodsfall',
      kind: 'MELDING',
      title: 'OUS Ullevål - dødsfall',
      register: 'klinisk',
      peek: '-',
      meta: 'ULLEVÅL SYKEHUS - TIL SOSIALKONTORET - 15.02.1999',
      body_bbcode:
        'MELDING OM DØDSFALL\n\nGrete Olsen, f. 21.09.1927. [url=fact:f_dod]Dødsfall konstatert 15.02 kl. 04:12.[/url]\n\nAvdødes sønn er eneste nærmeste pårørende. Varsling ble forsøkt per telefon uten svar. Politiet bisto ved varsling på bopel. Sønnen åpnet ikke døren. [url=fact:f_brevsprekken]Beskjeden ble gitt gjennom brevsprekken.[/url]\n\nSaken overføres kommunen for videre oppfølging av gjenlevende.\n\nSOSIALMEDISINSK ENHET - OUS',
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
          text: ' Avdødes sønn er eneste nærmeste pårørende. Varsling ble forsøkt per telefon uten svar. Politiet bisto ved varsling på bopel. Sønnen åpnet ikke døren. ',
          fact_id: '',
        },
        {
          id: 'run_brevsprekken',
          text: 'Beskjeden ble gitt gjennom brevsprekken.',
          fact_id: 'f_brevsprekken',
        },
        {
          id: 'run_text_2',
          text: ' Saken overføres kommunen for videre oppfølging av gjenlevende. SOSIALMEDISINSK ENHET - OUS',
          fact_id: '',
        },
      ],
    },
    {
      id: 'doc_status',
      kind: 'STATUSRAPPORT',
      title: 'Frank - status dag 8',
      register: 'notat',
      peek: 'En uke siden meldingen.',
      meta: 'STATUSRAPPORT - 4012 F. ÅSLI - DAG 8',
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
      quote: 'sykdom med kort forventet forløp',
      frank_response:
        "'Kort forventet forløp', og ikke noe mer. Så vagt skriver man bare når man vil. Haug må si det høyt før vi planlegger noe.",
      supports_questions: ['q_grete_dor'],
      lift_effects: [],
    },
    {
      id: 'f_grete_baerer',
      label: 'Grete bærer rutiner',
      summary: 'Grete bistår med gjøremål, økonomi og kontakt med tjenester.',
      source_document_id: 'doc_bekymring',
      domain: 'Hverdag/rutine',
      category: 'Dokument',
      quote: 'Omfanget er ikke kartlagt',
      frank_response:
        "'Omfanget er ikke kartlagt'. Hun gjør alt, og ingen vet hvor mye alt er. Det tallet finnes ikke før noen står i leiligheten og teller.",
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
      quote: 'primær omsorgsperson',
      frank_response:
        'Det er en leges inntrykk, ikke en kartlegging. Vi fatter ikke vedtak på inntrykk. Men det holder til å dra på hjemmebesøk, og det er sånn en bekymringsmelding er ment å virke.',
      supports_questions: ['q_grete_dor'],
      lift_effects: [],
    },
    {
      id: 'f_husleie',
      label: 'Husleie betales av Grete',
      summary: 'Husleien er 120 [icon=coin] og betales av Grete.',
      source_document_id: 'doc_konto_grete',
      domain: 'Økonomi/bolig',
      category: 'Økonomi',
      quote: 'KONTANTUTTAK SKRANKE',
      supports_questions: ['q_okonomi', 'q_bolig'],
      lift_effects: [],
    },
    {
      id: 'f_trygd',
      label: 'Ellings uføretrygd',
      summary: 'Ellings uføretrygd: 90 [icon=coin] i måneden.',
      source_document_id: 'doc_konto_elling',
      domain: 'Økonomi/bolig',
      category: 'Økonomi',
      quote: 'UFØRETRYGD RTV',
      supports_questions: ['q_okonomi', 'q_bolig'],
      lift_effects: [],
    },
    {
      id: 'f_alt_via_grete',
      label: 'Grete er øknomisk verge',
      summary: 'Hele trygden går rett inn i Gretes system. Alle avtaler står i hennes navn.',
      source_document_id: 'doc_konto_elling',
      domain: 'Økonomi/bolig',
      category: 'Økonomi',
      quote: 'KONTOEN DISPONERES AV VERGE. KORT ER IKKE UTSTEDT.',
      supports_questions: ['q_okonomi'],
      lift_effects: [],
    },
    {
      id: 'f_ingen_matkjop',
      label: 'Ingen egne matkjøp',
      summary: 'Elling har aldri betalt for mat selv. Mat skjer gjennom Grete.',
      source_document_id: 'doc_kassalapp',
      domain: 'Hverdag/rutine',
      category: 'Økonomi',
      quote: 'BANKKORT',
      supports_questions: ['q_grete_dor'],
      lift_effects: [],
    },
    {
      id: 'f_gap',
      label: '100 [icon=coin] mangler',
      summary: 'Uten Gretes pensjon mangler husholdet 100 [icon=coin] hver måned.',
      source_document_id: '',
      domain: 'Økonomi/bolig',
      category: 'Økonomi',
      quote: '',
      supports_questions: ['q_okonomi', 'q_bolig'],
      lift_effects: [],
      derived_from: ['f_trygd', 'f_husleie'],
    },
    {
      id: 'f_leie_stoppet',
      label: 'Husleien har stoppet',
      summary: 'Husleien har stoppet. Betalingskjeden døde med Grete.',
      source_document_id: 'doc_huseier',
      domain: 'Økonomi/bolig',
      category: 'Risiko',
      quote: 'Leien for mars er ikke kommet.',
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
      supports_questions: ['q_bolig'],
      lift_effects: [],
    },
    {
      id: 'f_klarer_seg',
      label: '"Han klarer seg"',
      summary: 'Grete avviser bekymringen. Gjentar formuleringen.',
      source_document_id: 'doc_frank_tlf',
      domain: 'Nettverk/sosialt',
      category: 'Samtale',
      quote: '"Han klarer seg. Han har alltid klart seg." Hun sa det to ganger.',
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
        'Jeg ba om å få hilse på Elling i telefonen. Hun sa han ikke tar telefonen. "Det er ikke noe galt med ham. Han liker bare ikke apparatet."',
      supports_questions: ['q_baering'],
      lift_effects: [],
    },
    {
      id: 'f_grete_redd',
      label: 'Grete er redd',
      summary: 'Grete frykter at kommunen vil ta leiligheten, eller Elling.',
      source_document_id: 'doc_frank_tlf',
      domain: 'Nettverk/sosialt',
      category: 'Samtale',
      quote: 'spurte hun om dette betydde at noen kom til å ta ham fra leiligheten',
      supports_questions: ['q_bolig'],
      lift_effects: [],
    },
    {
      id: 'f_post',
      label: 'Uåpnet post',
      summary: 'Uåpnet post samler seg. Grete håndterer den - og skjuler den.',
      source_document_id: 'doc_frank_visit',
      domain: 'Hverdag/rutine',
      category: 'Observasjon',
      quote:
        'en bunke uåpnet post på skoskapet. Øverst: Trygdekontoret, sosialkontoret, Oslo Energi.',
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
      quote: 'en bok om polarekspedisjoner. Han noterte i margen. Systematisk, små bokstaver.',
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
      supports_questions: ['q_baering', 'q_evner'],
      lift_effects: [],
    },
    {
      id: 'f_dor_glott',
      label: 'En dør på gløtt',
      summary:
        'Elling kastet ikke Frank ut, og svarte da Frank spurte om noe han kunne. Kontakt er mulig - forsiktig.',
      source_document_id: 'doc_frank_visit',
      domain: 'Nettverk/sosialt',
      category: 'Samtale',
      quote:
        'han kastet meg ikke ut, og han svarte da jeg spurte om noe han kunne. Det er en dør på gløtt.',
      supports_questions: ['q_baering'],
      lift_effects: [],
    },
    {
      id: 'f_smart_gutt',
      label: 'En smart gutt',
      summary: 'Grete omtaler Elling (35) som "gutt". Rollene er fastlåst.',
      source_document_id: 'doc_frank_visit',
      domain: 'Nettverk/sosialt',
      category: 'Samtale',
      quote: '"Du så hvordan han er. Han er en smart gutt."',
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
      summary: 'Han åpent ikke døren, men beskjeden ble levert i brevsprekken.',
      source_document_id: 'doc_dodsfall',
      domain: 'Nettverk/sosialt',
      category: 'Dokument',
      quote: 'Beskjeden ble gitt gjennom brevsprekken.',
      supports_questions: ['q_baering', 'q_kollaps'],
      lift_effects: [],
    },
  ],
  questions: [
    {
      id: 'q_grete_dor',
      prompt: 'Den dagen Grete ikke kommer hjem - hva stopper?',
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
      prompt: 'Hva klarer Elling selv - når ingen har gjort det for ham først?',
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
      prompt: 'Regnestykket Olsen: hva kommer inn, hva går ut - og gjennom hvem?',
      teaser: 'Tallene går opp - men jeg klarer ikke helt å se gjennom hvem. Verdt å se på.',
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
      prompt: 'Kan Elling bli boende - når husleien har stoppet?',
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
        'Noe av det Grete gjorde må noen andre gjøre. Hvor lite kan kommunen slippe unna med - og hvor mye tåler han?',
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
        ],
      },
    },
    {
      id: 'q_vekst',
      prompt: 'Hva kan læres - og i hvilket tempo, uten å knekke noe?',
      teaser: 'Jeg så noe hos ham som kan bygges på. Usikker på tempoet. Vi bør snakke om det.',
      card_title: 'Hva kan læres?',
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
      card_title: '',
      reveal_when: {
        op: 'fact_lifted',
        args: {
          fact_id: 'f_dod',
        },
      },
    },
    {
      id: 'q_liv',
      prompt: 'Ikke bare berget - levd. Hva skulle til for at Elling har et liv han vil ha?',
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
        'Det finnes ikke observasjon av Elling uten Grete. Uvitenheten er selve funnet - og den må lukkes før noe annet.',
      question_id: 'q_grete_dor',
      availability: {
        op: 'fact_lifted',
        args: {
          fact_id: 'f_ingen_plan',
        },
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
      title: 'Han forstår - men unngår. Posten ligger uåpnet, ikke ulest.',
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
        'Kommunen har ingen observasjon av hva Elling klarer alene. Første tiltak må være å finne det ut - forsiktig.',
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
        'Husleie og faste betalinger fungerer gjennom Gretes system - skoesken, postgiroene, kontantene den første. Systemet har én operatør.',
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
      title: 'Trygden dekker ikke husholdet. 100 [icon=coin] mangler hver måned.',
      summary:
        'Ellings trygd er 90 [icon=coin]. Husleien alene er 120 [icon=coin], og januar kostet 190. Differansen bæres i dag av Gretes pensjon. Bortfall gir umiddelbar restanserisiko.',
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
      title: 'Boligen kan sikres - med bostøtte og ordnet betalingskjede.',
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
      title: 'Uavklart - økonomien må kartlegges først.',
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
      title: 'Først en kanal. Fast person, fast tid, oppmøte - telefonen er stengt.',
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
      title: 'Alt. Fullt omsorgsansvar - institusjon eller omsorgsbolig.',
      summary:
        'Sårbarheten vurderes som for stor for hjemmeboende støtte. Tyngste ende av skalaen - og den kan alltid utløses.',
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
        'Kapasitet til fordypning og system er observert. Avgrensede rutiner kan bygges med støtte - lavt tempo, fast person, hans eget arkivspråk.',
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
      title: 'Ferdighetene er der ikke. Støtte må bære - læring er ikke planen nå.',
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
        'Gro-arkivet og systematikken er en identitet det går an å delta gjennom - i hans tempo.',
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
      title: 'Trygghet først. Verden i hans tempo, med møbel imellom - og det er greit.',
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
      title: 'Det vet bare Elling. Noen må spørre ham - og noen må kunne få svar.',
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
        'Bakkerud vil vite hvem han skal forholde seg til. La det bli Frank - ikke torsdagsbesøket.',
    },
    {
      id: 't_hjemmehjelp',
      title: 'Hjemmehjelp 2× uke - Frank',
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
          fact_id: 'f_grete_baerer',
        },
      },
      effects: [
        {
          op: 'queue_pending_document',
          args: {
            clock_id: 'ck_overfort',
            document_id: 'doc_konto_grete',
            delay_days: 1,
          },
        },
        {
          op: 'queue_pending_document',
          args: {
            clock_id: 'ck_overfort',
            document_id: 'doc_konto_elling',
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
      text: 'Håndskrevet brev - T. Bakkerud',
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
      id: 'beat_grete_d7',
      day: 7,
      text: 'Posten kommer. En regning stilet til Grete. I skoesken: en kassalapp.',
      effects: [
        {
          op: 'queue_pending_document',
          args: {
            clock_id: 'ck_grete',
            document_id: 'doc_strom',
            delay_days: 0,
          },
        },
        {
          op: 'queue_pending_document',
          args: {
            clock_id: 'ck_grete',
            document_id: 'doc_kassalapp',
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
      question: 'Posten, den lar han bare ligge.',
      answer:
        'Kan hende det. Jeg tror nok han vet nøyaktig hva som ligger der. Han la merke til at jeg så på bunken, jeg la merke til at han ble urolig av det. Så det er ikke likegyldighet. Det er noe som ligner mer på engstelighet.',
      needs: ['f_post'],
      answer_lines: [
        'Kan hende det. Jeg tror nok han vet nøyaktig hva som ligger der. Han la merke til at jeg så på bunken, jeg la merke til at han ble urolig av det.',
        'Så det er ikke likegyldighet. Det er noe som ligner mer på engstelighet.',
      ],
      followups: [
        {
          label: 'Engstelighet for hva?',
          lines: [
            'Hvert brev er en beskjed om at noen venter på noe han ikke får til.',
            'Jeg tror ikke det har vært hans oppgave å åpne posten.',
          ],
        },
        {
          label: 'Er det noe vi må håndtere?',
          lines: [
            'Ikke ta den fra ham. Da tar du det siste han har kontroll på.',
            'Åpne ett brev. Sammen. Det ufarligste først - strømregningen, ikke sosialkontoret. La ham se at et åpnet brev ikke eksploderer.',
          ],
        },
      ],
    },
    {
      id: 'c_smart',
      question: '"En smart gutt" - hva la du i det?',
      answer:
        'Hun sa det i trappen, lavt, som om det var en hemmelighet. Hun har båret ham så lenge at jeg tror hun ikke lenger vet hva som er ham og hva som er henne. Det er det vi egentlig skal kartlegge.',
      needs: ['f_smart_gutt'],
      answer_lines: [
        'Hun sa det i trappen, lavt, som om det var en hemmelighet. Hun har båret ham så lenge at jeg tror hun ikke lenger vet hva som er ham og hva som er henne.',
        'Det er det vi egentlig skal kartlegge.',
      ],
      followups: [
        {
          label: 'Kartlegge - hva da, egentlig?',
          lines: [
            'Hvor Grete slutter og Elling begynner.',
            'Alt hun gjør ligner omsorg. Noe av det er det. Resten er femti år med vane som ingen har turt å forstyrre.',
          ],
        },
      ],
    },
    {
      id: 'c_klarer',
      question: 'Tror du på "han klarer seg"?',
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
      question: 'Boken og notatene - hva sier det deg?',
      answer:
        'Tre setninger om Nansen, presise, til veggen. Det er ikke en som mangler evner. Det er en som mangler trening i å ha noen i rommet. Det er to forskjellige problemer. Og de har to forskjellige løsninger.',
      needs: ['f_bok'],
      answer_lines: [
        'Tre setninger om Nansen, presise, til veggen. Det er ikke en som mangler evner. Det er en som mangler trening i å ha noen i rommet.',
        'Det er to forskjellige problemer. Og de har to forskjellige løsninger.',
      ],
      followups: [
        {
          label: 'To løsninger - hvilke?',
          lines: [
            'Evnene trenger ingenting av oss. De er der. Rommet trenger trening.',
            'Én person. Samme person, samme tid, hver uke - til det slutter å være farlig å ha noen der. Alt annet er støy.',
          ],
        },
        {
          label: 'Kan han bo alene, mener du?',
          lines: [
            'Feil spørsmål. Han har aldri fått prøvd.',
            'Ingen har noen gang sett ham gjøre noe alene. Ikke fordi han ikke kan - fordi ingen har sluppet ham til. Vi vet ikke hva han klarer. Det burde uroe deg mer enn posten.',
          ],
          tanke: 'VURDERING - "Vet ikke" er ikke et hull i saken. Det ER saken.',
        },
      ],
    },
    {
      id: 'c_avstand',
      question: 'Møbelet mellom dere - hvor lang vei er det inn?',
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
      question: 'Utklippene av Gro - hva gjør vi med det?',
      answer:
        'Jeg spurte om valget i -97. Han snakket i fire minutter uten pause - årstall, navn, partilandsmøter. Ikke til meg. Men det var nesten. Det arkivet er det mest levende i den leiligheten. Hvis vi noen gang skal bygge noe med ham, begynner det der.',
      needs: ['f_utklipp'],
      answer_lines: [
        'Jeg spurte om valget i -97. Han snakket i fire minutter uten pause - årstall, navn, partilandsmøter. Ikke til meg. Men det var nesten.',
        'Det arkivet er det mest levende i den leiligheten. Hvis vi noen gang skal bygge noe med ham, begynner det der.',
      ],
      followups: [
        {
          label: 'Begynne der - hvordan, konkret?',
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
      question: 'Døren på gløtt - hva holder den åpen?',
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
      line: 'Matlevering, kanskje. Ingen matkjøp står i hans navn - middag på døra tre dager i uken kan overta. Forutsetter at døren er en kanal.',
      relevant_fact_ids: ['f_ingen_matkjop', 'f_dor_glott'],
      order: 0,
    },
    {
      handbok_id: 'hjemmehjelp',
      line: 'Praktisk bistand. Én fast person, én fast tid - det er den eneste kanalen inn som har virket hittil.',
      relevant_fact_ids: ['f_avstand', 'f_elling_tlf', 'f_dor_glott'],
      order: 1,
    },
    {
      handbok_id: 'bostotte',
      line: 'Søk bostøtte. Trygden dekker ikke husleien - tilskuddet kan tette gapet. Papirarbeid, men det haster.',
      relevant_fact_ids: ['f_gap', 'f_trygd', 'f_husleie'],
      relevant_categories: ['Økonomi'],
      order: 2,
    },
    {
      handbok_id: 'forvaltning',
      line: 'Frivillig forvaltning, kanskje. Skoesken trenger en ny operatør - kommunen kan betale de faste utgiftene direkte. Trygt. Bygger ingenting.',
      relevant_fact_ids: ['f_alt_via_grete', 'f_husleie', 'f_gap'],
      order: 3,
    },
    {
      handbok_id: 'mekling',
      line: 'Utleier-mekling. Bakkerud vil vite hvem han skal forholde seg til - en betalingsplan kan roe det før torsdagsbesøket.',
      relevant_fact_ids: ['f_huseier_kommer', 'f_leie_stoppet', 'f_leie_privat'],
      order: 4,
    },
    {
      handbok_id: 'boopp',
      line: 'Booppfølging, muligens. En miljøarbeider ukentlig kan holde boligdriften samlet - hvis han tåler en ny person i rommet.',
      relevant_fact_ids: ['f_leie_stoppet', 'f_post'],
      order: 5,
    },
    {
      handbok_id: 'radgivning',
      line: 'Økonomisk rådgivning. Time hos gjeldsrådgiver - på kontoret. Jeg er usikker på om han kommer seg dit.',
      relevant_fact_ids: ['f_gap', 'f_post'],
      relevant_categories: ['Økonomi'],
      order: 6,
    },
    {
      handbok_id: 'innkjop',
      line: 'Innkjøpsordning. Ingen har handlet for ham siden Grete - varer levert én gang i uken er det minste som kan virke.',
      relevant_fact_ids: ['f_ingen_matkjop', 'f_alt_via_grete'],
      order: 7,
    },
    {
      handbok_id: 'maltidsvenn',
      line: 'Måltidsvenn, forsiktig. Noen som spiser middag MED ham - men det er en fremmed ved bordet. Usikker.',
      relevant_fact_ids: ['f_avstand', 'f_ingen_matkjop'],
      order: 8,
    },
    {
      handbok_id: 'kartlegging',
      line: 'Funksjonskartlegging. Ingen har noen gang sett Elling alene - et strukturert besøk kan lukke det hullet.',
      relevant_fact_ids: ['f_ingen_plan'],
      order: 9,
    },
    {
      handbok_id: 'oppfolging',
      line: 'Oppfølgingsvedtak, kanskje. To timer ekstra per dag i saken - hvis dette skal bæres, må noen få tid til å bære.',
      relevant_fact_ids: ['f_ingen_plan'],
      order: 10,
    },
    {
      handbok_id: 'samtaler',
      line: 'Støttesamtaler, på sikt. Fast samtalekontakt én gang i uken - men kanalen inn må finnes først.',
      relevant_fact_ids: ['f_brevsprekken', 'f_avstand'],
      order: 11,
    },
    {
      handbok_id: 'stottekontakt',
      line: 'Støttekontakt. Tre timer i uken rundt det han allerede bryr seg om - arkivet er et sted å begynne.',
      relevant_fact_ids: ['f_utklipp', 'f_bok'],
      order: 12,
    },
    {
      handbok_id: 'tilsyn',
      line: 'Tilsynsbesøk daglig. Hjemmetjenesten innom hver dag - det er mye trykk på en lukket dør. Tyngre enn jeg liker.',
      relevant_fact_ids: ['f_saarbar', 'f_brevsprekken'],
      order: 13,
    },
    {
      handbok_id: 'besoksvenn',
      line: 'Besøksvenn, kanskje. Frivillig én gang i uken - mildere enn tjenester, men fortsatt en fremmed i stuen.',
      relevant_fact_ids: ['f_avstand'],
      order: 14,
    },
    {
      handbok_id: 'dagsenter',
      line: 'Dagsenter er langt unna der han er nå. To dager i uken ute blant folk - jeg tror ikke han går dit ennå.',
      relevant_fact_ids: ['f_avstand'],
      order: 15,
    },
    {
      handbok_id: 'folgetjeneste',
      line: 'Følgetjeneste. Følge til avtaler utenfor hjemmet - hvis det noen gang blir avtaler.',
      relevant_fact_ids: ['f_elling_tlf'],
      order: 16,
    },
    {
      handbok_id: 'hverdagsrehab',
      line: 'Hverdagsrehabilitering, muligens. Fire uker trening i egen bolig - men et tverrfaglig lag i leiligheten er mye på én gang.',
      relevant_fact_ids: ['f_bok', 'f_avstand'],
      order: 17,
    },
    {
      handbok_id: 'parorende',
      line: 'Pårørendestøtte. Grete bar alt - avlastning og veiledning kunne lettet henne mens hun ennå bærer.',
      relevant_fact_ids: ['f_grete_baerer', 'f_grete_syk'],
      order: 18,
    },
    {
      handbok_id: 'tt',
      line: 'TT-kort. Subsidiert transport, åtte turer i måneden - men han har ingen steder han skal ennå.',
      relevant_fact_ids: ['f_avstand'],
      order: 19,
    },
    {
      handbok_id: 'alarm',
      line: 'Trygghetsalarm, tja. Utrykning ved fall - jeg er usikker på om det treffer det som er skjørt her.',
      relevant_fact_ids: ['f_saarbar'],
      order: 20,
    },
    {
      handbok_id: 'depositum',
      line: 'Depositumsgaranti. Bare aktuelt hvis det blir flytting - garanti for et nytt leieforhold.',
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
      line: 'Startlån. Lån til kjøp av egen bolig - det er langt fra der denne saken står.',
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
        'Så spørsmålet er ikke om han kan lære. Det er hva som kan læres - og i hvilket tempo, uten å knekke noe.',
      ],
    },
    {
      question_id: 'q_grete_dor',
      pair: ['f_grete_syk', 'f_klarer_seg'],
      reading:
        'Det er noe her om hva som faktisk stopper den dagen Grete ikke er der. Jeg har ikke ord på det ennå.',
      frank_lines: [
        'Haug skriver kort forventet forløp. Grete sier han klarer seg. Begge kan ikke ha rett.',
        'Hun har båret alt så lenge at hun ikke ser det selv. Den dagen hun ikke kommer hjem, stopper noe - og vi vet ikke hva.',
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
      soft_reject: 'Jeg vet ikke hva du mener med det.',
      exchanges: [
        {
          card_id: 'f_grete_baerer',
          ask: 'Hvem overtar hvis du skulle bli innlagt?',
          reply: [
            {
              text: '(det blir stille i den andre enden)',
              fact_id: 'f_ingen_plan',
            },
          ],
        },
        {
          card_id: 'f_klarer_seg',
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
              text: 'Hvis det må til.',
            },
          ],
        },
      ],
    },
  ],
  visits: [
    {
      id: 'oppdrag_alene',
      name: 'Klarer han seg alene?',
      blurb: 'Se på Elling. Hva klarer han, hva klarer han ikke.',
      offer_line:
        'Godt spørsmål. Vil du at jeg skal se på hva han faktisk klarer, ved neste besøk?',
      unlocks_question: 'q_evner',
      steps: [
        {
          id: 'opp_a_hold',
          kind: 'urgent',
          actor: 'grete',
          label: 'blir i stua',
          room: 'living_room',
          duration: 18,
          no_wait: true,
        },
        {
          id: 'opp_a6',
          kind: 'queue_elling',
          room: 'living_room',
          duration: 8,
          beat: 'a6',
        },
        {
          id: 'opp_a2',
          kind: 'line',
          speaker: 'frank',
          line: 'Er det Nansen du leser om?',
          dwell: 4,
          beat: 'a2',
        },
        {
          id: 'opp_a3',
          kind: 'line',
          speaker: 'elling',
          line: 'Nansen lot Fram fryse fast i isen. 1893. Det var planen hele tiden.',
          dwell: 4,
          beat: 'a3',
        },
        {
          id: 'opp_a4',
          kind: 'line',
          speaker: 'frank',
          line: 'Liker du å bo her, Elling?',
          dwell: 4,
          beat: 'a4',
        },
        {
          id: 'opp_a5',
          kind: 'line',
          speaker: 'grete',
          line: 'Han har det fint her. Han har alt han trenger.',
          dwell: 4,
          beat: 'a5',
        },
      ],
      stub: true,
    },
    {
      id: 'oppdrag_okonomi',
      name: 'Se på økonomien',
      blurb: 'Papirene. Hvem betaler hva, og hvem vet hvordan.',
      offer_line: 'Tallene, ja. Vil du at jeg skal se på økonomien ved neste besøk?',
      unlocks_question: 'q_okonomi',
      steps: [
        {
          id: 'opp_p1a',
          kind: 'urgent',
          actor: 'grete',
          label: 'finner frem esken',
          room: 'kitchen',
          duration: 3,
        },
        {
          id: 'opp_p_hold',
          kind: 'urgent',
          actor: 'grete',
          label: 'blir ved bordet',
          room: 'kitchen',
          duration: 24,
          no_wait: true,
        },
        {
          id: 'opp_p6',
          kind: 'queue_elling',
          room: 'kitchen',
          duration: 6,
          beat: 'p6',
        },
        {
          id: 'opp_p1b',
          kind: 'urgent',
          actor: 'frank',
          label: 'ser på papirene',
          room: 'kitchen',
          duration: 3,
        },
        {
          id: 'opp_p2',
          kind: 'line',
          speaker: 'grete',
          line: 'Alt ligger i esken. Ferdig utfylt, sortert på forfall.',
          dwell: 4,
          beat: 'p2',
        },
        {
          id: 'opp_p3',
          kind: 'line',
          speaker: 'frank',
          line: 'Vet Elling hvor esken står?',
          dwell: 4,
          beat: 'p3',
        },
        {
          id: 'opp_p4',
          kind: 'line',
          speaker: 'grete',
          line: 'Elling? Nei da.',
          dwell: 4,
          beat: 'p4',
        },
      ],
      stub: true,
    },
    {
      id: 'oppdrag_tillit',
      name: 'Ikke press. Bygg tillit.',
      blurb: 'Sitt. Ta kaffen. La henne snakke.',
      offer_line: 'Skjønner. Ikke press. Vil du at jeg skal bygge tillit ved neste besøk?',
      unlocks_question: 'q_grete_dor',
      steps: [
        {
          id: 'opp_t_hold',
          kind: 'urgent',
          actor: 'grete',
          label: 'blir sittende',
          room: 'living_room',
          duration: 17,
          no_wait: true,
        },
        {
          id: 'opp_t3',
          kind: 'line',
          speaker: 'grete',
          line: 'Legen sier det er kort tid. Elling vet ikke.',
          dwell: 5,
          beat: 't3',
        },
        {
          id: 'opp_t4',
          kind: 'line',
          speaker: 'grete',
          line: 'Han var ikke sånn før. Han var på skolen, han hadde venner.',
          dwell: 5,
          beat: 't4',
        },
        {
          id: 'opp_t5',
          kind: 'line',
          speaker: 'grete',
          line: 'Jeg tenker på hva som skjer. Hele tiden.',
          dwell: 5,
          beat: 't5',
        },
      ],
      stub: true,
    },
  ],
  strings: [
    {
      id: 'visit',
      entries: {
        hallway_announced: 'du ringte i sted - kom inn.',
        hallway_unannounced: 'frank? nå? ...vent litt, jeg rydder en stol.',
        greet: 'hei, Elling.',
        sofa_talk: 'han spiser lite om dagen.',
        escort: 'Du så hvordan han er. Han er en smart gutt.',
        gang_rydde: 'Jeg har ikke rukket å rydde.',
        rope_elling: 'Elling! Frank er her.',
        venter_elling: 'Han kommer. Han liker ikke uventet besøk.',
        sette_seg: 'Jeg må bare sette meg litt.',
      },
      stub: true,
    },
    {
      id: 'notat',
      entries: {
        opener_arrival_1:
          'Grete åpnet før jeg fikk ringt på. Hun hadde dekket på med tre kopper. Elling brukte ikke sin.',
        opener_arrival_2:
          'I gangen: en bunke uåpnet post på skoskapet. Øverst: Trygdekontoret, sosialkontoret, Oslo Energi. Grete flyttet bunken da hun så at jeg så.',
        line_a2:
          'Elling satt i stuen med en bok om polarekspedisjoner. Han noterte i margen. Systematisk, små bokstaver.',
        line_a3:
          'Jeg spurte om Nansen. Han svarte med tre presise setninger. Til veggen, ikke til meg.',
        line_a5: 'Jeg spurte Elling om han liker å bo her. Grete svarte for ham.',
        line_a6:
          'Han forlot ikke rommet, men flyttet seg slik at det alltid var et møbel mellom oss. Ikke demonstrativt. Bare slik det ble.',
        line_p2:
          'Grete fant frem alt. Postgiroene ligger i en skoeske, ferdig utfylt, sortert på forfall. Alle avtaler står i hennes navn.',
        line_p4: 'Jeg spurte om Elling visste hvor skoesken sto. Hun lo, kort.',
        line_p6:
          'Elling satt ved bordet mens jeg gikk gjennom esken. Han rettet på bunkene da jeg la dem fra meg. Han visste rekkefølgen.',
        line_t3: 'Hun sa at legen har gitt henne kort tid, og at Elling ikke vet det.',
        line_t4: 'Hun snakket om ham før. Skolen, venner. Hun snakket lenge.',
        line_t5: '"Jeg tenker på hva som skjer. Hele tiden."',
        unseen_alene: 'ham selv',
        unseen_okonomi: 'papirene',
        unseen_tillit: 'å bli sittende lenge nok til at hun snakket fritt',
        unseen_prefix: 'Ikke undersøkt denne gangen: %s.',
        closer:
          'I trappen sa hun: "Du så hvordan han er. Han er en smart gutt." Hun er 72. Han er 35. Gutt.',
        doc_kind: 'HJEMMEBESØK',
        doc_title: 'Frank - hjemmebesøk',
        doc_meta: 'HJEMMEBESØK-NOTAT - 4012 F. ÅSLI - DAG %d',
      },
      stub: true,
    },
    {
      id: 'notat_fragments',
      entries: {
        'nf_mess_tidy.run_0': 'Over skrivebordet: ',
        'nf_mess_tidy.run_utklipp':
          'avisutklipp, sirlig montert. Det er ikke rot. Det er et arkiv.',
        'nf_mess_messy.run_0': 'I gangen: ',
        'nf_mess_messy.run_post': 'en bunke uåpnet post på skoskapet.',
        'nf_mess_decaying.run_post': 'Posten vokser. Døren er lukket.',
        'nf_grete_present.run_0': 'Grete var der. ',
        'nf_grete_present.run_smart_gutt': '"Du så hvordan han er. Han er en smart gutt."',
        'nf_grete_absent.run_brevsprekken':
          'Sønnen åpnet ikke døren. Beskjeden ble gitt gjennom brevsprekken.',
        'nf_tea_accepted.run_0': 'Hun hadde dekket på med tre kopper. ',
        'nf_tea_accepted.run_smart_gutt': '"Du så hvordan han er. Han er en smart gutt."',
        'nf_tea_declined.run_0': 'Elling brukte ikke sin kopp. ',
        'nf_tea_declined.run_avstand':
          'Han flyttet seg slik at det alltid var et møbel mellom oss.',
        'nf_elling_withdrawn.run_avstand':
          'Han forlot ikke rommet, men flyttet seg slik at det alltid var et møbel mellom oss.',
        'nf_elling_engaged.run_0': 'Elling satt med ',
        'nf_elling_engaged.run_bok':
          'en bok om polarekspedisjoner. Han noterte i margen. Systematisk.',
        'nf_elling_engaged_b.run_0': 'Over skrivebordet hans: ',
        'nf_elling_engaged_b.run_utklipp':
          'avisutklipp, sirlig montert. Årstall i hjørnene, hans håndskrift.',
      },
      stub: true,
    },
    {
      id: 'prologue',
      entries: {
        beat_01: 'LEGESENTERET - TIRSDAG I FEBRUAR 1999',
        beat_02: 'Prøvesvarene er kommet. Det er som vi trodde.',
        beat_03: 'Ja.',
        beat_04: 'Det er stille en stund. Noen ler av noe i naborommet.',
        beat_05: 'Har du noen rundt deg? Fremover, mener jeg.',
        beat_06: 'Jeg har Elling.',
        beat_07: 'Grete. Det var Elling jeg ville snakke om.',
        beat_08: 'Han klarer seg. Han har alltid klart seg.',
        beat_09: 'Med deg.',
        beat_10:
          'Grete ser ut vinduet. Det har begynt å snø - tunge, våte flak som ikke blir liggende.',
        beat_11:
          'Jeg har ikke fortalt ham noe ennå. Han skal få vite det når jeg vet hvordan det skal sies.',
        beat_12: 'Hvis du vil, melder jeg fra til bydelen. Ikke noe mer enn det. Bare så noen vet.',
        beat_13: 'Grete tar på seg hanskene. Én finger om gangen.',
        beat_14: 'Dere får gjøre det dere må.',
        beat_15:
          'Etter at hun har gått, blir Haug sittende litt. Så skriver han. To avsnitt. Han leser dem en gang til og stryker ordet "alvorlig". Sender.',
        beat_16: 'MOTTATT - SOSIALKONTORET',
        stamp_end: 'Meldingen ligger på pulten din.',
      },
      stub: true,
    },
    {
      id: 'handbok_tiltak',
      entries: {
        'alarm.navn': 'TRYGGHETSALARM',
        'alarm.ytelse': 'alarm ved fall; utrykning.',
        'alarm.dawn': 'alarm montert. [ligger i skuffen].',
        'alarm.krav.0': 'bruker bærer alarmen',
        'besoksvenn.navn': 'BESØKSVENN',
        'besoksvenn.ytelse': 'frivillig besøker i hjemmet, 1×/uke.',
        'besoksvenn.dawn': '[besøksvenn] tildelt fra frivilligsentralen.',
        'besoksvenn.krav.0': 'bruker tar imot besøk - dokumentert',
        'boopp.navn': 'BOOPPFØLGING',
        'boopp.ytelse': 'miljøarbeider hjemme ukentlig; struktur i boligdrift.',
        'boopp.dawn': 'oppstart neste uke. [miljøarbeider tildelt].',
        'boopp.krav.0': 'kartlagt funksjonstap i boligførsel',
        'boopp.krav.1': 'samtykke fra bruker',
        'bostotte.navn': 'BOSTØTTE',
        'bostotte.ytelse': 'statlig tilskudd til husleie, månedlig.',
        'bostotte.dawn': 'søknad sendt. svar om [3 uker].',
        'bostotte.krav.0': 'inntekt under sats',
        'bostotte.krav.1': 'søknad m/ dokumentasjon',
        'dagsenter.navn': 'DAGSENTER',
        'dagsenter.ytelse': 'dagtilbud m/ måltid, 2 dager/uke.',
        'dagsenter.dawn': 'plass reservert. [ingen oppmøte].',
        'dagsenter.krav.0': 'kommer seg til senteret / transport ordnet',
        'depositum.navn': 'DEPOSITUMSGARANTI',
        'depositum.ytelse': 'garanti for depositum ved nytt leieforhold.',
        'depositum.dawn': '[ingen flytting aktuell].',
        'depositum.krav.0': 'nytt leieforhold inngås',
        'folgetjeneste.navn': 'FØLGETJENESTE',
        'folgetjeneste.ytelse': 'følge til avtaler utenfor hjemmet.',
        'folgetjeneste.dawn': '[ingen avtale å følge til].',
        'folgetjeneste.krav.0': 'avtale foreligger',
        'forvaltning.navn': 'FRIVILLIG FORVALTNING',
        'forvaltning.ytelse': 'kommunen betaler faste utgifter direkte fra trygden.',
        'forvaltning.dawn': 'trekk til husleie er opprettet. [utleier bekreftet].',
        'forvaltning.krav.0': 'dokumentert betalingssvikt ×2',
        'forvaltning.krav.1': 'samtykke fra bruker',
        'hjemmehjelp.navn': 'PRAKTISK BISTAND',
        'hjemmehjelp.ytelse': 'rengjøring og handling, 1×/uke.',
        'hjemmehjelp.dawn': 'hjemmehjelp satt opp. [første besøk onsdag].',
        'hjemmehjelp.krav.0': 'kartlagt funksjonstap',
        'hverdagsrehab.navn': 'HVERDAGSREHABILITERING',
        'hverdagsrehab.ytelse': 'tverrfaglig trening i egen bolig, 4 uker.',
        'hverdagsrehab.dawn': 'oppstart planlagt. [teamet tar kontakt].',
        'hverdagsrehab.krav.0': 'kartlagt funksjonstap',
        'hverdagsrehab.krav.1': 'mål formulert med bruker',
        'innkjop.navn': 'INNKJØPSORDNING',
        'innkjop.ytelse': 'varer handles og leveres, 1×/uke.',
        'innkjop.dawn': 'ordning satt opp. [leveres fredager].',
        'innkjop.krav.0': 'kan ikke handle selv - dokumentert',
        'kartlegging.navn': 'FUNKSJONSKARTLEGGING',
        'kartlegging.ytelse': 'strukturert kartleggingsbesøk i hjemmet.',
        'kartlegging.dawn': 'KARTLEGG FUNKSJON lagt til Franks handlinger.',
        'kbolig.navn': 'KOMMUNAL BOLIG',
        'kbolig.ytelse': 'tildeling av kommunal utleiebolig.',
        'kbolig.dawn': '[søknad avvist - bor i egen leilighet].',
        'kbolig.krav.0': 'dokumentert tap av bolig',
        'maltidsvenn.navn': 'MÅLTIDSVENN',
        'maltidsvenn.ytelse': 'frivillig spiser middag MED bruker, 2×/uke.',
        'maltidsvenn.dawn': '[måltidsvenn] tildelt. første besøk i morgen - Frank kan følge.',
        'maltidsvenn.krav.0': 'ernæringsrisiko',
        'maltidsvenn.krav.1': 'mat tilgjengelig, men inntak svikter',
        'matlevering.navn': 'MATLEVERING',
        'matlevering.ytelse': 'middag levert på døra 3×/uke.',
        'matlevering.dawn': 'ny kasse levert. [den står urørt].',
        'matlevering.krav.0': 'dokumentert ernæringsrisiko',
        'matlevering.krav.1': 'kan ikke tilberede selv',
        'mekling.navn': 'UTLEIER-MEKLING',
        'mekling.ytelse': 'kommunen kontakter utleier; betalingsplan avtales.',
        'mekling.dawn': 'sak opprettet. RING UTLEIER lagt til Franks handlinger.',
        'mekling.krav.0': 'purring/varsel foreligger',
        'oppfolging.navn': 'OPPFØLGINGSVEDTAK',
        'oppfolging.ytelse': 'formalisert oppfølging: Frank får to timer ekstra per dag i saken.',
        'oppfolging.dawn': 'oppfølging formalisert. Frank: +2 timer per dag.',
        'oppfolging.krav.0': 'aktiv sak',
        'parorende.navn': 'PÅRØRENDESTØTTE',
        'parorende.ytelse': 'avlastning og veiledning til pårørende i omsorgsrolle.',
        'parorende.dawn': '-',
        'parorende.krav.0': 'pårørende i aktiv omsorgsrolle',
        'radgivning.navn': 'ØKONOMISK RÅDGIVNING',
        'radgivning.ytelse': 'time hos gjeldsrådgiver - på kontoret.',
        'radgivning.dawn': 'time satt opp. [ingen møtte].',
        'radgivning.krav.0': 'bruker møter selv',
        'samtaler.navn': 'STØTTESAMTALER',
        'samtaler.ytelse': 'fast samtalekontakt, 1×/uke.',
        'samtaler.dawn': 'samtalekontakt tildelt. [første forsøk torsdag].',
        'samtaler.krav.0': 'bruker samtykker',
        'samtaler.krav.1': 'bruker møter / tar imot',
        'startlan.navn': 'STARTLÅN',
        'startlan.ytelse': 'lån til kjøp av egen bolig.',
        'startlan.dawn': '[avslag - vilkår ikke oppfylt].',
        'startlan.krav.0': 'betjeningsevne dokumentert',
        'stottekontakt.navn': 'STØTTEKONTAKT',
        'stottekontakt.ytelse': 'fast person; aktivitet 3t/uke.',
        'stottekontakt.dawn': 'støttekontakt søkes. [ventetid 2 uker].',
        'stottekontakt.krav.0': 'kartlagt isolasjon',
        'stottekontakt.krav.1': 'samtykke fra bruker',
        'tilsyn.navn': 'TILSYNSBESØK DAGLIG',
        'tilsyn.ytelse': 'hjemmetjenesten innom hver dag.',
        'tilsyn.dawn': 'tilsyn iverksatt. [Elling låser ikke opp].',
        'tilsyn.krav.0': 'akutt risiko dokumentert',
        'tt.navn': 'TT-KORT',
        'tt.ytelse': 'subsidiert transport, 8 turer/mnd.',
        'tt.dawn': 'kort utstedt. [ligger i posten - uåpnet?]',
        'tt.krav.0': 'varig forflytningsvansker - dokumentert',
      },
      stub: true,
    },
    {
      id: 'frank_actions',
      entries: {
        'besok.navn': 'BESØK ELLING',
        'folg_maltid.navn': 'FØLG MÅLTIDSVENN',
        'kartlegg.navn': 'KARTLEGG FUNKSJON',
        'ring.navn': 'RING ELLING',
        'ring_utleier.navn': 'RING UTLEIER',
        'telefontrening.navn': 'TELEFONTRENING',
        'telefontrening.gate_note': 'krever tillit ▮▮ - Frank må ha kommet innenfor døra først',
      },
      stub: true,
    },
    {
      id: 'handbok',
      entries: {
        src_tillit: 'TILLIT',
        src_vedtak: 'VEDTAK',
        src_frank: 'FRANK',
        src_matlevering: 'MATLEVERING',
        tillit_band: 'Elling ser nå på Frank som %s.',
        vedtak_stamped: 'stemplet: %s - iverksettes i morgen. (vilkår %d/%d dokumentert)',
        mission_samtykke: 'HENT SAMTYKKE',
        mission_kartlagt: 'FÅ KARTLAGT FUNKSJON',
        mission_telefon: 'FÅ TELEFONKONTAKT',
        mission_telefon_why: 'oppfølging uten oppmøte',
        reason_unknown_action: 'ukjent handling',
        reason_krever_tillit: 'krever tillit',
        reason_no_hours: 'dagen strekker ikke til - [i morgen]',
        ring_who_fallback: 'noen',
        ring_ok: '%s tok den. "hallo?" - kort. men noen tok den.',
        ring_fail: 'ingen svar. telefonen ringte der inne.',
        ring_slip: 'telefonen ligger framme - han lar den ringe',
        ring_failforward: '"da får vi ta telefontrening, da." - nytt oppdrag (fail-forward)',
        utleier_ok: 'utleier stiller med nøkkel. neste besøk går inn - uansett svar.',
        utleier_price: 'en dør som åpnes utenfra har en pris.',
        entry_ok: 'ingen åpning - men utleiers nøkkel gikk i låsen. Frank er innenfor.',
        entry_price: 'døra åpnet UTENFRA. det glemmer han ikke. (tillit −%d)',
        besok_fail: 'ingen åpning. radioen sto på der inne.',
        besok_slip: 'ingen svar på døra - hvem er hjemme, og tør de åpne?',
        besok_ok_samtykke: 'døra åpnet. [kaffe på kjøkkenet]. han skrev under - samtykke.',
        samtykke_boxes: 'samtykke dokumentert → nye krav-bokser i håndboka',
        besok_ok_no_samtykke:
          'døra åpnet. ikke lett å snakke med. ikke samtykke - ennå. (tillit +1)',
        kartlegg_ok: 'kartleggeren gjennomførte hele runden. skjema fylt.',
        kartlegg_boxes: 'funksjonstap dokumentert → nye krav-bokser i håndboka',
        kartlegg_fail: 'kartlegging avbrutt - %d av %d. kartleggeren dro.',
        kartlegg_slip: 'skjemaet ligger igjen halvfylt - nytt besøk dekker resten',
        maltid_ok: 'Frank ble med [måltidsvennen] inn. Elling dekket på til tre.',
        maltid_ok_samtykke: 'over bordet skrev han under - samtykke.',
        maltid_fail: 'måltidet ble avbrutt - %d av %d.',
        maltid_slip: 'måltidsvennen kom, men måltidet glapp - prøv igjen',
        trening_ok: '"vi later som det ringer. ring, ring." - han tok røret. sa hallo.',
        trening_fail: 'treningen avbrutt - %d av %d. røret ble lagt på.',
        trening_slip: 'øvelsen stoppet halvveis - ny økt dekker resten',
        visit_generic_ok: 'besøket gjennomført.',
        visit_generic_fail: 'besøket avbrutt - %d av %d.',
        dawn_hours_left: '%dt til overs - [papirarbeid på de ti andre]',
        mat_ok: 'kassen kom inn - det ble mat i dag.',
        mat_fail_prev: 'ny kasse levert kl 11. den forrige står der fortsatt.',
        mat_blocked: 'ingen ny levering - kassen fra sist står fortsatt ute.',
      },
      stub: true,
    },
    {
      id: 'sim_text',
      entries: {
        kartlegg_stopped: 'han ble taus halvveis. skjemaet ligger igjen hos ham.',
        kartlegg_stopped_slip: 'stoppet ved spørsmålet om [matlaging] - hvorfor akkurat der?',
        kartlegg_no_answer: 'ingen åpning for kartleggeren. skjemaet ble med tilbake.',
        kartlegg_no_answer_slip: 'ingen svar på døra - kartleggeren kom aldri inn',
        kartlegg_start: 'kartleggeren er innenfor - Frank blir ved pulten.',
        maltid_no_answer: 'ingen åpnet for [måltidsvennen]. kassen med middag gikk tilbake.',
        maltid_no_answer_slip: 'ingen svar på døra - måltidsvennen kom aldri innenfor',
        maltid_toomany: 'Elling åpnet, så de to, og lukket igjen.',
        maltid_toomany_slip: 'én gjest går kanskje - to var for mange',
        maltid_start: 'måltidsvennen er innenfor - Frank følger til kjøkkenet.',
        trening_start: 'telefontreneren er innenfor - øvelsen starter ved telefonen.',
        visit_not_started: 'besøket kom ikke i gang - %s.',
        reason_sim_unavailable: 'sim utilgjengelig',
        reason_visit_running: 'et besøk pågår allerede',
        reason_nobody_home: 'ingen deltaker hjemme',
        reason_unknown_visit: 'ukjent besøkstype',
        dawn_in_day: 'iverksatt - løses i løpet av dagen.',
        dawn_mekling: 'sak opprettet hos forliksrådet - RING UTLEIER lagt til Franks handlinger.',
        proposal_vet_ikke: 'Vet ikke nok ennå. Vis meg flere funn først.',
        npc_maltidsvenn: 'Måltidsvenn',
        npc_kartlegger: 'Kartlegger',
        npc_telefontrener: 'Telefontrener',
      },
      stub: true,
    },
    {
      id: 'dagsrapport',
      entries: {
        sec_vedtak: 'VEDTAK I VERK',
        vedtak_row: '• %s - i verk siden dag %d. [ingen endring observert]',
        vedtak_none: '• [ingen vedtak i verk]',
        sec_klokker: 'KLOKKER RYKKET',
        clock_row: '• %s: %d → %d',
        sec_kanaler: 'KANALER',
        channel_row: '• %s - kl %s',
        sec_observert: 'OBSERVERT',
        observert_none: '• [intet å melde]',
        observert_row: '• %s',
        doc_title: 'DAGSRAPPORT - DAG %d',
        doc_peek: '[kontorets samlerapport for dag %d]',
        doc_meta: 'KONTORET - morgenen dag %d',
      },
      stub: true,
    },
    {
      id: 'tiltak_visits',
      entries: {
        'kartlegging.spesialist_inn': 'kartleggeren kommer inn',
        'kartlegging.samtale': 'innledende samtale',
        'kartlegging.spesialist_kjokken': 'kartleggeren følger til kjøkkenet',
        'kartlegging.adl_skjema': 'ADL-skjema del 1',
        'kartlegging.kjokken_runde': 'funksjon på kjøkkenet',
        'kartlegging.spesialist_oppsummering': 'kartleggeren finner fram skjemaet',
        'kartlegging.oppsummering': 'oppsummering og signatur',
        'maltidsvenn.dekke_bord': 'måltidsvennen dekker på',
        'maltidsvenn.felles_maltid': 'felles måltid',
        'telefontrening.trener_inn': 'treneren kommer inn',
        'telefontrening.instruksjon': 'instruksjon ved telefonen',
        'telefontrening.ovelsesring': 'øvelsesring - ring, ring',
        'telefontrening.svar_ovelse': 'ta røret og si hallo',
      },
      stub: true,
    },
  ],
} as const;
