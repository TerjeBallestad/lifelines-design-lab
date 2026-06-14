# Case: case_olsen_tiny
Title: Olsen tiny schema slice
Scenario stage: 0

# Document: doc_bekymring
Kind: BEKYMRINGSMELDING
Title: Legesenteret · Dr. J. Haug
Register: klinisk
Peek: «…anbefaler kommunal kartlegging av funksjon, hjelpebehov og overgangstiltak.»
Meta: LEGESENTERET · 11.02.1999

Gjelder: Olsen, Elling · f. 14.03.1964.

Undertegnede er fastlege for Grete Olsen og hennes sønn Elling Olsen. Mor er under utredning for sykdom med kort forventet forløp. Hun er informert om at meldingen sendes.

Mor og sønn bor sammen i en treroms blokkleilighet. Sønnen har aldri bodd alene. Han er uføretrygdet og ikke i kontakt med øvrige tjenester.

[Mor opplyser at hun bistår med praktiske gjøremål, økonomisk oversikt og kontakt med tjenester](fact:f_grete_baerer).

Ved hjemmebesøk er det observert [uåpnet post i gangen](fact:f_manglende_post), [flere ubetalte regninger](fact:f_regninger), [lite mat i kjøleskapet](fact:f_lite_mat), og [telefonhenvendelser som ikke blir besvart](fact:f_telefon_ubesvart).

Pasienten fremstår sårbar ved bortfall av pårørende. Anbefaler kommunal kartlegging av funksjon, hjelpebehov og overgangstiltak.

# Facts

## f_grete_baerer
Label: Grete bærer rutiner
Summary: Grete bærer husholdets praktiske funksjoner.
Domain: Hverdag/rutine
Category: Dokument
Source: doc_bekymring
Supports: q_hverdag, q_okonomi
Discuss: Frank, Grete
Reveals questions: q_hverdag, q_okonomi

## f_manglende_post
Label: Uåpnet post
Summary: Post har hopet seg opp uåpnet.
Domain: Hverdag/rutine
Category: Dokument
Source: doc_bekymring
Discuss: Frank

## f_regninger
Label: Ubetalte regninger
Summary: Flere regninger er ubetalt.
Domain: Økonomi/bolig
Category: Økonomi
Source: doc_bekymring
Supports: q_okonomi
Discuss: Frank

## f_lite_mat
Label: Lite mat
Summary: Det er lite mat på kjøkkenet.
Domain: Hverdag/rutine
Category: Observasjon
Source: doc_bekymring
Discuss: Frank

## f_telefon_ubesvart
Label: Telefon ubesvart
Summary: Telefonhenvendelser blir ofte ikke besvart.
Domain: Nettverk/sosialt
Category: Observasjon
Source: doc_bekymring
Discuss: Frank, Grete

# Questions

## q_hverdag
Title: Hvor stabil er hverdagen uten Grete?
Prompt: Hvor stabil er hverdagen uten Grete?
Appears on: f_grete_baerer
Opens when: f_grete_baerer

## q_okonomi
Title: Er regningene et engangsglipp eller en løpende risiko?
Prompt: Er regningene et engangsglipp eller en løpende risiko?
Appears on: f_grete_baerer
Opens when: f_grete_baerer

# Hypotheses

## h_omsorgsbyrde
Title: Omsorgsbyrden er konsentrert
Summary: Grete bærer for mye av den daglige støtten alene.
Question: q_hverdag
Needs: f_grete_baerer, f_regninger
Opens tiltak: t_samtale_grete, t_regningshjelp
Opens dispatches: d_ring_grete

## h_okonomisk_sarbar
Title: Økonomien er sårbar
Summary: Ubetalte regninger peker på et praktisk støttebehov.
Question: q_okonomi
Needs: f_regninger
Opens dispatches: d_konto

## h_isolasjon
Title: Isolasjonen øker
Summary: Mat- og telefonmønsteret kan peke på sosial tilbaketrekning.
Question: q_hverdag
Needs: f_lite_mat, f_telefon_ubesvart
Opens tiltak: t_samtale_grete

# Tiltak

## t_samtale_grete
Title: Avklar støtte med Grete
Slot: s1
Cost: 1
Needs: f_grete_baerer
Description: Planlegg en støttesamtale med Grete.
Sim hook: case.olsen.tiltak.support_talk

## t_regningshjelp
Title: Ordne regningshjelp
Slot: s2
Cost: 1
Needs: f_regninger
Needs hypothesis: h_omsorgsbyrde
Description: Ordne praktisk hjelp med regninger.
Sim hook: case.olsen.tiltak.bill_support

# Dispatches

## d_ring_grete
Title: Ring Grete
Description: Ring Grete for å teste hypotesen om omsorgsbyrde.
Sim hook: case.olsen.dispatch.call_grete
Gate: hypothesis h_omsorgsbyrde + fact f_grete_baerer
Effects: scenario_stage 1

## d_konto
Title: Be om kontooversikt
Description: Be om kontooversikt til neste dag.
Sim hook: case.olsen.dispatch.account_overview
Gate: hypothesis h_okonomisk_sarbar + fact f_regninger
Effects: pending_doc pending_konto_overfort after 1 day on ck_overfort

# Clocks

## ck_overfort
Label: Kontooversikt til neste dag
Sim hook: case.olsen.clock.account_overview

# Day script beats

None
