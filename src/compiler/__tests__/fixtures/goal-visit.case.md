# Case: c_goal_fixture

Title: Full stage/goal grammar fixture (PLAN-010 TASK-049)
Stage: 0

# Question: q_evner

Title: Hva klarer Elling selv?
Teaser: Det ligger noe her.

# Visit: opp_full

Title: Klarer han seg alene?
Blurb: Se på Elling. Hva klarer han, hva klarer han ikke.
Offer: "Godt spørsmål. Vil du at jeg skal se på hva han faktisk klarer, ved neste besøk?"
Stub: yes

## Goal: nansen

plan: Se hva han leser
need: elling
yield: f_bok, open q_evner

==
- frank: goto elling
-> arrived
!> unreachable grace=2

==
- frank: say Er det Nansen du leser om?

== svar
- elling: say Nansen lot Fram fryse fast i isen. 1893. Det var planen hele tiden.

## Goal: trives

plan: Spør om han trives
need: elling, grete, f_bok
yield: f_svarer_for_ham

==
- frank: converse grete Liker du å bo her, Elling?
- elling: free
-> duration 8
-> event tea_done
!> timeout 6
!> role-lost grete grace=1

==
- grete: do make_tea
- frank: goto living_room seat=sofa
-> arrived

## Goal: avstand

plan: Se hvordan han beveger seg
need: elling, not f_avstand
yield: f_avstand

==
- frank: goto living_room seat=sofa
-> arrived

==
- frank: stay
- elling: free
-> duration 8

## Goal: observere

plan: Bare se på ham fra sofaen
need: denied nansen
yield: f_avstand

==
- frank: goto living_room seat=sofa
-> arrived

==
- frank: do observe_quietly
-> duration 6

## Call-off

==
- frank: goto entrance
- grete: stay
-> arrived
!> timeout 6
