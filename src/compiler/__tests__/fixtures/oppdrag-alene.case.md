# Case: c_oppdrag_fixture

Title: Oppdrag fixture
Stage: 0

# Document: doc_seed

Kind: NOTAT · Register: notat
Title: Seed
Peek: p
Meta: M

Et anker. [Han klarer seg.](fact:f_klarer)

## f_klarer

Label: Klarer seg
Summary: S
Domain: D · Category: C

# Questions

## q_evner

Prompt: Klarer han seg alene?

# Visit: opp_alene

Title: Klarer han seg alene?
Blurb: Se på Elling. Hva klarer han, hva klarer han ikke.
Offer: «Godt spørsmål. Vil du at jeg skal se på hva han faktisk klarer, ved neste besøk?»
Unlocks: q_evner

- ! grete: blir i stua @ living_room [duration=18 no_wait id=opp_a_hold]
- ? elling @ living_room [duration=8 beat=a6 id=opp_a6]
- frank: «Er det Nansen du leser om?» [dwell=4 beat=a2 id=opp_a2]
- elling: «Nansen lot Fram fryse fast i isen. 1893. Det var planen hele tiden.» [dwell=4 beat=a3 id=opp_a3]
- frank: «Liker du å bo her, Elling?» [dwell=4 beat=a4 id=opp_a4]
- grete: «Han har det fint her. Han har alt han trenger.» [dwell=4 beat=a5 id=opp_a5]

# Strings: notat_glue

Stub: yes
notat_intro: Frank noterer.
notat_outro: Det var det.
