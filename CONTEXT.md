# Lifelines Design Lab

Lifelines Design Lab explores playable systems for humane municipal casework around Elling. The language here names domain concepts used across design notes, SDDs, and implementation discussions.

## Language

**Case Desk**:
The player-facing municipal work surface that gathers evidence, forms hypotheses, and chooses tiltak while Frank acts as a field/interpreter role inside the case.
_Avoid_: single caseworker, abstract municipality, optimization dashboard

**Hva mangler Elling? board**:
The default Case Desk surface revealed by the bekymringsmelding, showing fixed life-domain categories whose evidence and functional status start as unknown. Sub-questions and hypotheses emerge under those categories as the case develops.
_Avoid_: hidden unlockable checklist, diagnosis board, service scoring grid

**Functional gap**:
A life function that is missing, unreliable, or currently carried by Grete rather than by Elling, a scaffold, or a service. Functional gaps describe what fails in everyday life, not what diagnosis Elling has.
_Avoid_: diagnosis, deficit, symptom

**Tiltak**:
A humane municipal support action chosen to bridge a functional gap while preserving as much agency and skill-building as the situation allows.
_Avoid_: prescription, treatment, solution tier

**Brittle tiltak**:
A plausible support action based on a wrong or partial working hypothesis that may stabilize the immediate situation while preserving dependency, increasing burden, or failing to build capacity. Brittle tiltak can be chosen before the player understands a whole functional chain, but brittleness is shown through consequences and Frank's plain-language reports rather than as a player-facing label.
_Avoid_: failed option, trap choice

**Working hypothesis**:
A player-authored guess about a life-domain status on the `Hva mangler Elling?` board. A working hypothesis gives Frank something to investigate with Elling and Grete, but evidence is required before it becomes confirmed case knowledge.
_Avoid_: player-set truth, final answer

**Confirmed status**:
The board's evidence-backed assessment of a life-domain category. Confirmed status changes because concrete evidence supports it, not because the player manually picks a value.
_Avoid_: manual category value, answer key

**Life-domain status**:
A functional label on the `Hva mangler Elling?` board, such as unknown, independent, can with reminder, can with practice, Grete does this now, needs formal support, or acute risk. A life domain can hold conflicting or partial status claims during investigation before the case settles on a primary confirmed status.
_Avoid_: diagnosis label, score

**Grete-carried function**:
An everyday life function that currently works because Grete carries, prompts, repairs, or translates it. A Grete-carried function is not inherently bad, but it is fragile when Grete becomes tired, unavailable, or gone.
_Avoid_: bad status, overprotection flag

**Grete collapse branch**:
The rare branch where Elling has enough emergency-response capacity to get help when Grete collapses. It is foreshadowed through crisis work rather than announced as a save path, and can move Grete from immediate death to hospitalization without making the apartment verdict easier or restoring her as Elling's everyday infrastructure.
_Avoid_: save Grete ending, illness cure, hidden rescue quest

**Institution verdict**:
The player's likely/canonical municipal verdict that Elling should leave the apartment for an institution-like setting because keeping the apartment no longer looks humane or viable after Grete is gone. The demo does not explore that setting, while the final game may continue into Broynes Behandlingssenter.
_Avoid_: critical failure, automatic failure state, automatic heavy-service win

**Apartment retention**:
The high-skill case outcome where Elling keeps the apartment after Grete is gone because enough routines, services, scripts, and relationships now carry what Grete used to carry. Apartment retention still includes support and ongoing fragility; it is not unsupported independence.
_Avoid_: pure victory, normal independence

**Apartment viability**:
The final Case Desk synthesis of whether Elling can keep living in the apartment after Grete is gone. Apartment viability emerges from separate domain pressures such as money, benefits administration, bill payment, household routines, and appointments; it is not a single meter to optimize directly.
_Avoid_: house, housing score, independence score

**Appointment chain**:
The first playable routine for the `Hva mangler Elling?` board: why Elling cannot get to an appointment without Grete. The canonical hypothesis is assembled from smaller working hypotheses showing that Elling understands the appointment, but Grete normally builds and repairs the chain across letter opening, date translation, calendar writing, route checking, phone scripting, morning start, and recovery after contact.
_Avoid_: tutorial quest, appointment score

**Knowledge card**:
A casework excerpt that tells the player whether a working hypothesis was confirmed, refuted, or complicated by Frank's investigation. A complicated result is valuable case knowledge: evidence changed the shape of the question rather than cleanly proving or disproving it.
_Avoid_: notification, reward popup, abstract tag, gamer summary

**Frank report**:
A simple Norwegian casework report that cites what Frank observed before naming what it may mean for the case. It can lean toward official letter-writing and Ambjornsen-like plainness, but should not read as a game hint guide or meta-description.
_Avoid_: gamer hint, clinical diagnosis prose, poetic explanation

**Action die**:
A one-use capacity face with a global visible outcome-class contract across action contexts. The die affects access, friction, trust, and evidence quality; it does not randomize the underlying truth of a functional gap.
_Avoid_: truth roll, deterministic branch selector
