# Lifelines Design Lab

Lifelines Design Lab explores playable systems for humane municipal casework around Elling. The language here names domain concepts used across design notes, SDDs, and implementation discussions.

## Language

**Case Desk**:
The player-facing municipal work surface that gathers evidence, forms hypotheses, and chooses tiltak while Frank acts as a field/interpreter role inside the case.
_Avoid_: single caseworker, abstract municipality, optimization dashboard

**Hva mangler Elling? board**:
The default Case Desk surface revealed by the bekymringsmelding, showing fixed life-domain categories whose evidence and functional status start as unknown. Sub-questions and hypotheses emerge under those categories as the case develops. It may be presented with deliberately RPG-like stat-sheet framing when the framing makes functional life skills legible and dryly funny, but evidence and case consequences must remain concrete.
_Avoid_: hidden unlockable checklist, diagnosis board, service scoring grid, generic optimization dashboard

**Functional gap**:
A life function that is missing, unreliable, undertrained, or currently carried by Grete rather than by Elling, a scaffold, or a service. Functional gaps describe what fails in everyday life and what can be trained or supported, not what diagnosis Elling has.
_Avoid_: diagnosis, symptom, permanent deficit

**Skill level**:
A deliberately RPG-like casework estimate of a broad capability such as Cooking, Planning, Social Courage, or Reflection. Skill levels use the same 3-domain / 12-skill taxonomy as `lifelines-core-loop` so Elling, Grete, and other characters can be compared cleanly. Skills are broader than activity-specific Mastery: a skill describes general capability, while Mastery describes proficiency built by repeating one concrete activity. Elling's skill levels can be probed by sending Frank into action-dice situations that test what he can do, what he avoids, and what kind of support changes the result. Skill levels are playable and trainable, but they remain evidence-backed case estimates rather than clinical measurements.
_Avoid_: diagnosis score, personality stat, hidden truth meter, bespoke moral labels

**Mastery**:
Activity-specific proficiency built by doing a concrete activity repeatedly. Mastery answers "how practiced is this character at this activity?" while Skill level answers "what broad capability does this character have?" A character can have high Mastery in a narrow activity, such as reading or looking through a telescope, without having high Skill levels across the related domain.
_Avoid_: broad skill, diagnosis, personality trait

**Skill probe**:
A Frank-mediated action that uses an action die to test a suspected skill gap and produce concrete evidence for the Case Desk. The die does not randomize whether Elling has the skill; it tests the quality, safety, and pressure of the situation Frank creates. A bad probe can trigger Elling's defensive tirade or retreat instead of compliance, and still produce evidence about conditions, trust, and failure shape. Probes primarily update case knowledge about broad Skill levels; training and repeated activities primarily build activity-specific Mastery, which may later justify raising a broad Skill level. This split is provisional and should be explored in the design lab.
_Avoid_: exam minigame, abstract stat check, diagnosis test, obedience check

**Defensive tirade**:
Elling's funny, face-saving refusal pattern when a probe or training attempt corners him too directly. A defensive tirade can end or damage the current attempt, move trust/pressure, and reveal a specific defense style such as pompous logic, grievance, shame, absurd dignity, or principled objection. It should produce useful evidence for a better next probe rather than function as pure flavor failure.
_Avoid_: random bark, comedy-only failure, proof that Elling is impossible

**Tiltak**:
A humane municipal support action chosen to bridge a functional gap while preserving as much agency and skill-building as the situation allows.
_Avoid_: prescription, treatment, solution tier

**Tiltak package**:
A linked set of municipal support actions chosen after evidence has established both the immediate risk and the functional barriers behind it. For Elling's apartment case, a good package must usually combine housing/economy stabilisation, replacement of Grete-carried functions, and one fragile independence scaffold. A package is not a generic upgrade bundle; each part should answer a concrete piece of evidence.
_Avoid_: single magic solution, service bundle tier, treatment plan, stat build

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
A later tiltak/practice routine for the `Hva mangler Elling?` board: why Elling cannot get to an appointment without Grete. The canonical hypothesis is assembled from smaller working hypotheses showing that Elling understands the appointment, but Grete normally builds and repairs the chain across letter opening, date translation, calendar writing, route checking, phone scripting, morning start, and recovery after contact. It should not carry the opening slice before the player understands Grete's load-bearing role.
_Avoid_: opening tutorial quest, appointment score

**Knowledge card**:
A casework excerpt that tells the player whether a working hypothesis was confirmed, refuted, or complicated by Frank's investigation. A complicated result is valuable case knowledge: evidence changed the shape of the question rather than cleanly proving or disproving it.
_Avoid_: notification, reward popup, abstract tag, gamer summary

**Frank report**:
A simple Norwegian casework report that cites what Frank observed before naming what it may mean for the case. It can lean toward official letter-writing and Ambjornsen-like plainness, but should not read as a game hint guide or meta-description.
_Avoid_: gamer hint, clinical diagnosis prose, poetic explanation

**Action die**:
A one-use capacity face with a global visible outcome-class contract across action contexts. The die affects access, friction, trust, and evidence quality; it does not randomize the underlying truth of a functional gap.
_Avoid_: truth roll, deterministic branch selector

**Clock**:
A Citizen Sleeper-style visible progress track toward a concrete story beat, payout, complication, or verdict. A clock is not a generic meter that goes up and down. Actions add segments to one or more clocks; when a clock fills, something happens in the fiction. Paired clocks can represent competing possible outcomes, such as `Bostøtte innvilget` versus `Husleierestanse`.
_Avoid_: abstract risk meter, stat bar, reversible mood gauge, hidden score
