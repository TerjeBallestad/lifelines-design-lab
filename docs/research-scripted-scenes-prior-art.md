# Prior art: scripted scenes over autonomy (SB-105)

Research for SB-105, feeding SB-098 Q2 (visit authoring vocabulary, per-character command queues with meeting points). Three parallel web-research agents ran on 2026-08-13. Their full reports follow verbatim. The synthesis lives on SB-105 as the resolution comment.

---

## Report 1: The Sims (1-4)

# The Sims (1–4): how authored multi-character scenes run on top of autonomous sims — research findings

## 1. Authoring model: what is the unit of authored behavior?

**Sims 1/2 (SimAntics era): the unit is an _interaction on an object_, defined in a Tree Table (TTAB).** All behavior logic lives in objects, not in sims ("Smart Objects"). Each object is a VM thread with local state; an interaction entry pairs a **check tree** (is this available/visible in the pie menu, and eligible for autonomous selection?) with an **action tree** (the BHAV script that runs), plus **advertisement data** (which motives it satisfies, min/max strength, personality scaling, attenuation by distance). Critically, when a sim chooses a behavior, _the object's action tree runs on the sim's own thread_, giving the script access to both the sim's and the object's state. Sims themselves are "just a somewhat more elaborate object."

- Sources: Forbus & Wright, "Some notes on programming objects in The Sims" (https://www.qrg.northwestern.edu/papers/Files/Programming_Objects_in_The_Sims.pdf); Rhys Simpson, "Volcanic: an Open Source SimAntics IDE" (http://freeso.org/stuff/Volcanic.pdf) — "interactions are defined by a 'Tree Table', or 'TTAB'... These can be queued on a given object thread (generally a sim), either by the SimAntics primitive 'Push Interaction' or by the player... via a 'Pie Menu'."

**Social interactions (Sims 1) are implemented as a dynamically created intermediate object, not a paired script per se.** Forbus/Wright: "Social Interaction is an object that is created and used when two Sims interact... When SimSam decides to run the kiss behavior (which is in SimMary) an invisible social interaction object is created. The execution of SimSam's thread is then passed into this object (as is SimMary's if she's not busy)." So a two-sim scene is a transient coordinator object that both sims' threads enter. Sims 2 socials are similar TTAB interactions on the target sim, gated by "social - X - test" guardian BHAVs and global social constants (Pick'N'Mix, https://www.picknmixmods.com/Sims2/Notes/SocialRequirements/SocialRequirements.html via search).

**Multi-sim scripted events (Sims 1/2/TSO) are "controller objects."** Volcanic: "Much of the gameplay is built around 'controller' objects which run persistent scripts in the background." Weddings, parties, visitors, even weather and conversations are invisible virtual objects (Bourse survey: "visiting neighbours, but also weather and conversations are virtual objects," https://yo252yo.com/old/ens/sims-rapport.pdf). These controllers own the event and inject behavior into individual sims via the **Push Interaction** primitive — i.e., authored events do NOT take over sims; they push interactions into each sim's normal queue and let the sim's own loop execute them.

**Sims 3: interactions are C# classes (Interaction<TActor,TTarget>) plus data-driven ITUN/social data; hundreds of socials and thousands of production rules were data-authored** (Richard Evans, "Modeling Individual Personalities in The Sims 3," GDC 2010, https://www.gdcvault.com/play/1012450/Modeling-Individual-Personalities-in-The; NRaas Retuner exposes the ITUN autonomous/user-directed flags, https://www.nraas.net/community/chatterbox). Conversations are governed by a large specificity-ranked production-rule system (GMTK, https://gmtk.substack.com/p/the-genius-ai-behind-the-sims).

**Sims 4: two-layer authoring.** (a) Interactions: data-driven "superinteractions" with constraints, plus "mixers" chosen inside a running social (Ingebretson GDC 2014, below). (b) **Situations** own multi-sim events: "Any NPC Sim that is spawned in the world is controlled by a Situation that tells them what to do, and where they can go. Situations are also used to control how a party functions, when an invited Sim leaves... Situations have **Situation Jobs** that are filled by Sims and can transition between different **Role States**." Role states control buffs, restrict autonomy to areas/commodities (`autonomy_ping`, `only_scored_static_commodities`, affordance whitelist/blacklist filters, anchor buffs). So a Sims 4 situation is role assignment + autonomy shaping, not a frame-by-frame script: the sim keeps running its own autonomy loop, but inside a fenced affordance space, with the situation occasionally pushing specific interactions. (Lot 51 Game Concepts, https://lot51.cc/simdex/game-concepts; Sims 4 Modding Wiki Key Terminology, https://sims-4-modding.fandom.com/wiki/Key_Terminology — both retrieved via search snippets, pages themselves are bot-gated.)

## 2. Sync points: how a rendezvous is coordinated

- **Sims 1: the initiator routes; the joint scene starts only when the initiator's thread enters the shared Social Interaction object, and the target's thread is pulled in "if she's not busy"** (Forbus & Wright, URL above). If the target is busy, only one thread enters (inference from the quoted parenthetical: the interaction proceeds degenerately or waits/aborts depending on the script).
- **Positioning is done with "routing slots"** — named offset points on an object that a sim routes to and snaps into; even a shower works by adding the sim to a routing slot rather than "entering" the object (Forbus & Wright). Person objects run a special **Routing Frame** stack frame invoked by `Goto Relative` / `Goto Routing Slot` primitives; routing yields via "Continue on Next Tick" until arrival (Volcanic).
- **Waiting is a script-level wait, not an engine state:** SimAntics is cooperative multitasking; a waiting sim sits in a loop on a primitive that returns "Continue on Next Tick," and there is a stock `Global: Wait for Notify` tree used for cross-object synchronization (Forbus & Wright warn modders not to edit it). So "who waits" is authored: typically the target keeps idling/continuing its current action while the initiator routes, then both threads run the paired animation from inside the social object.
- **Sims 3: paired socials use "jigs" — invisible objects auto-placed on the ground that reserve floor space and define the two sims' exact positions** (e.g. conversation, slow dance). "A jig is an invisible object that's auto placed on the ground while, for example, two sims are talking to each other" (Fix: Sims Need Less Space mod docs, https://modthesims.info/d/683612/fix-sims-need-less-space.html). The rendezvous = both sims route to slots on the shared jig object — i.e., reservation of a synthetic shared object.
- **Sims 4: the rendezvous is constraint intersection, not a jig.** Interactions are defined by constraints (posture, carrying, surface, geometry+orientation, line of sight); "two interactions are compatible when the intersection of their constraints is non-empty." Sims in a conversation join a social group whose geometry is the intersection of everyone's constraints; a sim can keep eating while chatting because the queue processor only starts an interaction when its constraints are satisfiable, and it "Wait[s] in Queue" otherwise. Waiting is thus represented as a pending queue entry whose constraints aren't yet satisfiable. (Peter Ingebretson, "Concurrent Interactions in The Sims 4," GDC 2014 — slides: https://www.slideshare.net/slideshow/concurrent-interactions-in-sims4-by-peter-ingebretson/34106153, video: https://gdcvault.com/play/1020413/Concurrent-Interactions-in-The-Sims.)
- **Sims 2: acceptance is a test, not a negotiation over time** — the target runs a guardian "social - X - test" BHAV (relationship/personality/mood thresholds in global BCON "Global Social Constants") that decides accept/reject before the paired animation plays (Pick'N'Mix Social Requirements, URL above).

## 3. Failure / unreachable / busy

- **Sims 1: failure = the action tree returns false and the interaction simply ends.** The canonical authored pattern (Forbus & Wright's Joy Booth walkthrough): "we first try to go to the front of the shower, facing it. If that fails, we exit. (It can fail because someone else could be in it, or blocking our route to it.)" No automatic re-queue; robustness is the script author's job. SimAntics also has an "Error" return value as its exception mechanism (Volcanic).
- **Sims 2: routes are fully planned up-front, but sims deliberately attempt doomed routes.** Jake Simpson: "We actually planned out the entire route once a Sim decided to go use an object, so we could know 'No, there are obstacles in the way, you can't get there', but we'd still let the Sims try, because otherwise they just looked precognitive." (Jake Simpson dev thread, https://www.tumblr.com/l-1-z-a/680264373506326528/the-sims-2-dev-twitter-thread-part-1-by-jake; his GDC 2005 talk "Scripting and Sims2" is at https://www.gdcvault.com/play/1020311/Scripting-and-Sims2-Coding-the / https://archive.org/details/GDC2005Simpson.) The failure is then _performed_ (foot-stomp/wave) — failure is diegetic feedback, not silent.
- **Sims 3: enqueueing a higher-priority interaction cancels all lower-priority queued interactions** — so a busy target gets preempted rather than negotiated with, when the pusher uses high priority ("When the game adds an interaction to a Sim's queue, all lower-priority interactions already in the queue are automatically canceled" — MTS Code Snippet Jar / NRaas discussions, https://modthesims.info/showthread.php?t=632115, https://www.nraas.net/community/chatterbox/topic2759).
- **Sims 4: route failure plays the "route fail" animation (wave + whine/stomp) and the interaction is dropped from the queue**; a whole mod genre exists just to replace the animation with "no reaction" (https://modthesims.info/d/657650/no-route-fail-animation.html). No teleport fallback in normal play in any generation I found; the Forbus shower example shows teleporting is what you see when scripts _break_ slot discipline, not a designed fallback. (Inference: teleportation exists only as debug/edge-case behavior.)
- Original-game postmortem note: pathfinding was the most-criticized part — "sims would get stuck/lost" (Bourse survey, URL above).

## 4. Autonomy yield: interleaving free will with directed actions

- **Sims 1/TSO: autonomy is what runs when the queue is idle.** The sim's own main BHAV loop calls "**idle for input with allow push**", which pops and runs the first queued interaction (Volcanic). Free will = when nothing is queued, the sim scores all advertised interactions (motive-weighted, distance-attenuated, personality-scaled), picks among the top few (top 4 in Sims 1, top ~10 randomized in Sims 2 — "if they took the best interaction, you ended up with the world's greatest screen saver," Jake Simpson) and queues it. Player commands and autonomous choices land in the _same_ queue; interaction flags modify queue behavior ("run immediately, leapfrog to front of queue," Volcanic). Whether an interaction is even a candidate for autonomy is the check tree + an autonomy-threshold field on the TTAB entry (Volcanic: "Motive Advertisements, Attenuation and Autonomy threshold... drove Free Will").
- **Sims 3: explicit priority tiers on queue entries** (`InteractionPriority` / `InteractionPriorityLevel.High` etc.); user-directed interactions are high priority, autonomous ones low; higher-priority pushes cancel lower ones, and per-interaction ITUN flags say whether it is available autonomously and/or user-directed (MTS + NRaas, URLs above). So autonomy "yields" structurally: an autonomous action is always cancelable by a user command, and autonomy re-fills the queue when it empties.
- **Sims 4: three named priority tiers in the queue — "High: user directed, Low: autonomous, Idle: finished but still running"** — and the queue processor cancels incompatible active interactions before starting the next one; compatible ones (per constraint intersection) run concurrently via cooperative context switching with weighted-random sub-action selection (Ingebretson GDC 2014 slides, URL above). The "Idle" tier is notable: a finished interaction lingers at lowest priority (a sim keeps sitting/holding a drink) until something needs its resources — resumption of free will is just the queue draining back down to autonomy-priority content.
- **Situations shape rather than suppress autonomy (Sims 4):** role states fence autonomy with affordance filters and commodity whitelists (`only_scored_static_commodities`), and a role without an `autonomy_ping` degenerates to "a completely random interaction" (Lot 51, URL above). Richard Evans' Sims 3 equivalent for context: situational/temporary motives are _added_ to sims (host gets a "welcome guest" need; a restaurant grants an "eat outside" motive) so the normal utility loop produces the scene behavior (GMTK; Evans GDC 2010, URLs above).

## Transferable lessons for a small narrative sim with per-character command queues and meeting points

- **One queue per character, one priority axis, and events that _push into_ queues rather than seize control.** Every generation converged on: directed content enters the same queue autonomy uses, at a higher tier; autonomy is simply "what fills the queue when it's empty/low." A wedding is a controller that pushes interactions, not a cutscene mode. This keeps failure handling and animation uniform for scripted and free behavior.
- **Model the meeting as a thing, not a handshake.** Sims 1 made the conversation an invisible object both threads enter; Sims 3 made it a jig with routing slots; Sims 4 made it a constraint set to intersect. All three reify the rendezvous into a shared entity with reservable positions — the initiator routes to it, the target is pulled in "if not busy." For a small sim: spawn a "scene" entity with named seats; a character's queue entry is "route to my seat in scene X, then wait-for-notify until all seats filled."
- **Waiting is a polled script state ("continue next tick"), not a blocking lock** — cooperative multitasking with per-character threads that yield, plus an explicit wait-for-notify, is the whole synchronization toolkit. Cheap to implement, easy to time out.
- **Failure is dropped-and-performed, never silently repaired.** Route/precondition failure exits the interaction (returns false), the queue moves on, and the character visibly reacts (Sims 2 even lets them attempt routes known to be doomed so they don't look precognitive). Scripted events must therefore be written to tolerate any participant dropping out — guard tests before the payoff, no assumption that a pushed interaction completed.
- **Direct roles by shrinking the autonomy space, not by puppeteering** (Sims 4's most modern lesson): assign a character a role state = a buff + an affordance filter + an area anchor, and let their normal decision loop generate the scene's texture, with only key beats explicitly pushed. Far fewer authored failure paths than fully scripting every participant.

Sources: [Forbus & Wright — Programming Objects in The Sims](https://www.qrg.northwestern.edu/papers/Files/Programming_Objects_in_The_Sims.pdf) · [Volcanic: an Open Source SimAntics IDE (FreeSO)](http://freeso.org/stuff/Volcanic.pdf) · [Ingebretson — Concurrent Interactions in The Sims 4, GDC 2014 slides](https://www.slideshare.net/slideshow/concurrent-interactions-in-sims4-by-peter-ingebretson/34106153) / [GDC Vault](https://gdcvault.com/play/1020413/Concurrent-Interactions-in-The-Sims) · [Jake Simpson Sims 2 dev thread](https://www.tumblr.com/l-1-z-a/680264373506326528/the-sims-2-dev-twitter-thread-part-1-by-jake) / [GDC 2005 talk](https://www.gdcvault.com/play/1020311/Scripting-and-Sims2-Coding-the) · [Evans — Modeling Individual Personalities in The Sims 3, GDC 2010](https://www.gdcvault.com/play/1012450/Modeling-Individual-Personalities-in-The) · [GMTK — The Genius AI Behind The Sims](https://gmtk.substack.com/p/the-genius-ai-behind-the-sims) · [Bourse — AI in The Sims series](https://yo252yo.com/old/ens/sims-rapport.pdf) · [Lot 51 Game Concepts](https://lot51.cc/simdex/game-concepts) · [Sims 4 Modding Wiki — Key Terminology](https://sims-4-modding.fandom.com/wiki/Key_Terminology) · [MTS Code Snippet Jar (Sims 3 InteractionPriority)](https://modthesims.info/showthread.php?t=632115) · [NRaas — pushing high-priority interactions](https://www.nraas.net/community/chatterbox/topic2759) · [MTS — Fix: Sims Need Less Space (jigs)](https://modthesims.info/d/683612/fix-sims-need-less-space.html) · [MTS — No Route Fail Animation](https://modthesims.info/d/657650/no-route-fail-animation.html) · [Pick'N'Mix — Sims 2 Social Requirements](https://www.picknmixmods.com/Sims2/Notes/SocialRequirements/SocialRequirements.html)

---

## Report 2: RimWorld Lord / LordJob / LordToil / Duty system

Sources are decompiled game source (community GitHub mirrors), the core game def XML (mirrored in RimTrans), the RimWorld modding wiki, and community AI tutorials. Decompile quotes are from B18-era code (`josh-m/RW-Decompile`) and 1.3-era code (`Chillu1/RimWorldDecompiled`); the architecture is stable across versions.

### 1. Authoring model

**Three layers: Lord (runtime FSM host) → LordJob (authored scene) → LordToil (state) → Duty (per-pawn behavior).**

- A **Lord** owns a list of pawns (`ownedPawns`), a current `LordJob`, and a `StateGraph`. A pawn can belong to at most one lord ("Pawns can't be members of more than one lord at the same time" — error in `Lord.AddPawn`). Source: [Lord.cs](https://github.com/josh-m/RW-Decompile/blob/master/Verse.AI.Group/Lord.cs).
- A **LordJob** is the authored scene: its single required method is `CreateGraph()`, which builds a `StateGraph` of **LordToils** (states) and **Transitions** (edges). Everything else — raid, party, wedding, caravan — is one subclass each. Source: [LordJob.cs](https://github.com/josh-m/RW-Decompile/blob/master/Verse.AI.Group/LordJob.cs).
- A **LordToil** is a group-level state. Its one required method is `UpdateAllDuties()`: it loops over `lord.ownedPawns` and assigns each pawn a `PawnDuty` object on `pawn.mindState.duty`. Example (`LordToil_MarriageCeremony.UpdateAllDuties`): fiances get `DutyDefOf.MarryPawn` with a per-pawn standing cell; everyone else gets `DutyDefOf.Spectate` with a computed `spectateRect`. `UpdateAllDuties` is re-run whenever a toil becomes active or a pawn joins/leaves. Sources: [LordToil.cs](https://github.com/josh-m/RW-Decompile/blob/master/Verse.AI.Group/LordToil.cs), [LordToil_MarriageCeremony.cs](https://github.com/josh-m/RW-Decompile/blob/master/RimWorld/LordToil_MarriageCeremony.cs).
- A **PawnDuty** is a data blob: `DutyDef def`, `focus` / `focusSecond` (targets/cells), `radius`, `locomotion` urgency, `maxDanger`, `spectateRect`. A **DutyDef** carries a `thinkNode` (a whole mini think-tree in XML) plus a `constantThinkNode`, and a `hook` (`HighPriority` / `MediumPriority`) saying where in the pawn's think tree it activates. Sources: [PawnDuty.cs](https://github.com/josh-m/RW-Decompile/blob/master/Verse.AI/PawnDuty.cs), [DutyDef.cs](https://github.com/josh-m/RW-Decompile/blob/master/Verse.AI/DutyDef.cs).
- **Transitions** connect one-or-more source toils to a target toil, hold a list of `Trigger`s, plus `preActions`/`postActions` (`TransitionAction_Message`, `TransitionAction_EndAllJobs`, `TransitionAction_WakeAll`, `TransitionAction_Custom(delegate)`, `TransitionAction_CheckForJobOverride`). Any trigger firing executes the transition. Source: [Transition.cs](https://github.com/josh-m/RW-Decompile/blob/master/Verse.AI.Group/Transition.cs).
- Graphs compose: `stateGraph.AttachSubgraph(new LordJob_Kidnap().CreateGraph())` lets an assault raid embed the whole "kidnap someone and leave" scene as a sub-graph reachable by a trigger (`Trigger_KidnapVictimPresent`). Source: [LordJob_AssaultColony.cs](https://github.com/josh-m/RW-Decompile/blob/master/RimWorld/LordJob_AssaultColony.cs).

**Rituals (Ideology) are the data-driven authoring layer on top.** A `RitualPatternDef` points at a `RitualBehaviorDef`; the behavior def declares `roles` (id, label, required, `allowDowned`) and an ordered list of `stages`. `LordJob_Ritual.CreateGraph()` mechanically converts each `RitualStage` into a `LordToil_Ritual` and wires stage `endTriggers` as the toil-to-next-toil transition — so scene authoring is pure XML, no hand-built state machine. Each stage has: `defaultDuty`, per-role `roleBehaviors` (each `<roleId>` + `<dutyDef>` + optional `customPositions`), `endTriggers`, `failTriggers`, `preAction`/`postAction`/`interruptedAction`/`pawnLeaveAction`, visual effects, `essential` flag. `RitualStage.GetDuty(pawn)` resolves role → duty, falling back to `defaultDuty`. Sources: [RitualBehaviorDef.cs / RitualStage.cs / LordJob_Ritual.cs (Chillu1/RimWorldDecompiled)](https://github.com/Chillu1/RimWorldDecompiled), [Modding Tutorials/Rituals — RimWorld Wiki](https://rimworldwiki.com/wiki/Modding_Tutorials/Rituals). Real-world XML shape (PrisonLabor mod's interrogation ritual, [InterrogationPatterns.xml](https://github.com/Aviuz/PrisonLabor/blob/master/1.5/Defs/Interrogation/InterrogationPatterns.xml)):

```xml
<RitualBehaviorDef>
  <roles> <li Class="RitualRoleWarden"><id>warden</id>...</li> ... </roles>
  <stages>
    <li>
      <failTriggers>
        <li Class="StageFailTrigger_TargetPawnUnreachable">
          <takerId>warden</takerId><takeeId>prisoner</takeeId>
        </li>
      </failTriggers>
      <endTriggers>
        <li Class="StageEndTrigger_RolesArrived"><roleIds><li>prisoner</li></roleIds></li>
      </endTriggers>
      <roleBehaviors>
        <li><roleId>warden</roleId><dutyDef>PL_DeliverPawnToCell</dutyDef></li>
      </roleBehaviors>
    </li>
    <li>
      <endTriggers><li Class="StageEndTrigger_DurationPercentage"><percentage>1</percentage></li></endTriggers>
      ...
    </li>
  </stages>
</RitualBehaviorDef>
```

Ritual _quality/outcomes_ are separately authored via `RitualOutcomeEffectDef` (how participation scores quality) and `RitualAttachableOutcomeEffectDef` (pluggable rewards); wholly new rewards or behaviors need C# workers ([wiki](https://rimworldwiki.com/wiki/Modding_Tutorials/Rituals)).

### 2. Sync points ("wait until everyone…")

Two complementary mechanisms:

**a) Toil polls, then emits a memo.** A toil's `LordToilTick()` checks a group condition on a coarse interval and calls `lord.ReceiveMemo("...")`; a `Trigger_Memo` on the outgoing transition consumes it. Concrete examples:

- `LordToil_Travel.LordToilTick()` — every 205 ticks, checks every pawn is within 10 cells of the destination _and_ can still path to it; if so `ReceiveMemo("TravelArrived")`.
- `LordToil_PrepareCaravan_GatherItems` — every 120 ticks, checks every colonist's `mindState.lastJobTag == JobTag.WaitingForOthersToFinishGatheringItems` and no gather-job is still running, then `ReceiveMemo("AllItemsGathered")`. The caravan LordJob chains stages purely on memos: `AllAnimalsGathered → AllItemsGathered → AllSlavesGathered → AllDownedPawnsGathered → ReadyToExitMap` ([LordJob_FormAndSendCaravan.cs](https://github.com/josh-m/RW-Decompile/blob/master/RimWorld/LordJob_FormAndSendCaravan.cs)).

**b) Transition triggers evaluate conditions directly.** The trigger menagerie in `Verse.AI.Group` includes: `Trigger_TicksPassed` (timeout, counts ticks while the source toil is active, resets on re-entry), `Trigger_TickCondition(lambda)` (arbitrary predicate polled per tick), `Trigger_Memo`, `Trigger_PawnLost` / `Trigger_PawnKilled` / `Trigger_PawnHarmed` / `Trigger_FractionPawnsLost`, `Trigger_MentalState` / `Trigger_NoMentalState`, `Trigger_NoPawnsVeryTiredAndSleeping` (caravan "everyone rested enough" gate), `Trigger_PawnCannotReachMapEdge`, `Trigger_UrgentlyHungry`, chance-per-interval variants. All triggers are fed a `TriggerSignal` stream: one `Tick` signal per tick plus event signals (memo, pawn lost, pawn damaged, faction relations changed) pushed by `Lord.Notify_*` methods — an event-driven FSM with a tick heartbeat. Sources: file listing + [Trigger_TicksPassed.cs, Trigger_PawnHarmed.cs](https://github.com/josh-m/RW-Decompile/tree/master/Verse.AI.Group), [Lord.cs `CheckTransitionOnSignal`](https://github.com/josh-m/RW-Decompile/blob/master/Verse.AI.Group/Lord.cs).

The wedding shows the composite pattern: pre-party → ceremony fires on `Trigger_TickCondition(() => lord.ticksInToil >= 5000 && AreFiancesInPartyArea())` — i.e. "minimum mingle time AND both key actors physically present in the area." ([LordJob_Joinable_MarriageCeremony.cs](https://github.com/josh-m/RW-Decompile/blob/master/RimWorld/LordJob_Joinable_MarriageCeremony.cs))

Rituals declare sync points in XML as `StageEndTrigger`s: `StageEndTrigger_RolesArrived` (waits until the named roles' pawns have the per-pawn tag `"Arrived"` set — duties tag pawns when they reach their assigned ritual position), `StageEndTrigger_DurationPercentage`, `StageEndTrigger_Instant`, `StageEndTrigger_PawnDead/PawnDown`, `StageEndTrigger_Indefinite`. `RitualBehaviorDef.ConfigErrors` rejects any stage with no endTrigger. Source: [StageEndTrigger\_\* in Chillu1/RimWorldDecompiled](https://github.com/Chillu1/RimWorldDecompiled).

Debugging aid worth knowing: the dev setting "Log Lord Toil Transitions" prints every transition + trigger ([Testing Mods wiki](https://rimworldwiki.com/wiki/Modding_Tutorials/Testing_mods)).

### 3. Failure / unreachable / degradation

- **Losing a pawn is a first-class event.** `Lord.Notify_PawnLost(pawn, PawnLostCondition, dinfo)` fires with a rich reason enum: `Vanished, IncappedOrKilled, MadePrisoner, ChangedFaction, ExitedMap, LeftVoluntarily, Drafted, ForcedToJoinOtherLord, ForcedByPlayerAction`. The lord removes the pawn, nulls its duty, notifies the job and toil, and pushes a `PawnLost` signal through the transitions. **If `ownedPawns` hits zero, the lord destroys itself** (unless it's a voluntarily-joinable social lord). Source: [Lord.cs](https://github.com/josh-m/RW-Decompile/blob/master/Verse.AI.Group/Lord.cs), [PawnLostCondition.cs](https://github.com/josh-m/RW-Decompile/blob/master/Verse.AI.Group/PawnLostCondition.cs).
- **Degradation is authored as extra transitions, not exception handling.** Raids: `Lord.SetJob` auto-injects a `LordToil_PanicFlee` reachable from _every_ toil via `Trigger_FractionPawnsLost(0.5f)` (half the raid dies → rout); assaults also time out (`Trigger_TicksPassed` "raiders gave up"), leave when satisfied (`Trigger_FractionColonyDamageTaken`), and switch to kidnap/steal subgraphs opportunistically. Caravan forming _pauses_ (dedicated `_pause` twin toil per stage) on `Trigger_MentalState` and resumes on `Trigger_NoMentalState`. Weddings are called off if a fiance is downed/destroyed, the spot becomes dangerous, or 120000 ticks pass with a fiance absent/drafted. Parties end on `Trigger_PawnKilled` or weather (`ShouldBeCalledOff`). Sources: Lord.cs, LordJob_AssaultColony.cs, LordJob_FormAndSendCaravan.cs, LordJob_Joinable_MarriageCeremony.cs, [LordJob_Joinable_Party.cs](https://github.com/josh-m/RW-Decompile/blob/master/RimWorld/LordJob_Joinable_Party.cs).
- **Rituals separate "end", "fail", and "cancel"** per stage in XML: `failTriggers` (e.g. `StageFailTrigger_TargetPawnUnreachable` — literally a pathfinding `CanReach` check between two role pawns, with an `allowanceTicks` grace period; also `_PawnAsleep`, `_TargetNotLit`, `_NoPoweredLoudspeakers`), plus job-level `CallOffTriggers()` (organizer downed, required-role pawn no longer owned by the lord, required pawn fleeing danger, zero pawns). Interruption applies partial outcome: `ApplyOutcome(Progress())` where progress = ticks passed / expected duration — an interrupted ritual isn't void, it's scored pro-rata; a `cancelled` path applies 0. Stages have `interruptedAction` and `pawnLeaveAction` hooks for narrative cleanup. Roles can declare `allowDowned` so a downed pawn keeps its role (childbirth). Source: [LordJob*Ritual.cs, StageFailTrigger*\*.cs (Chillu1)](https://github.com/Chillu1/RimWorldDecompiled).
- **Per-toil fail conditions**: `LordToil.AddFailCondition(Func<bool>)` / `ShouldFail` gives a state-local abort predicate. Source: LordToil.cs.
- **Duty-level fallback**: if a pawn has a duty but the duty's think tree yields no job (e.g. can't do the task), the LordDuty think tree falls through to `JobGiver_WanderNearFallbackLocation` / `JobGiver_WanderAnywhere` — pawns visibly mill around rather than freeze, and the group condition (poll/memo) simply never fires until the situation resolves or a timeout/fail transition rescues the scene. Source: RimTrans mirror of [Core/Defs/ThinkTreeDefs/SubTrees_Duty.xml](https://github.com/RimWorld-zh/RimTrans/blob/master/Core/Defs/ThinkTreeDefs/SubTrees_Duty.xml).

### 4. Autonomy yield — where the duty sits in the ThinkTree

The pawn is never puppeted; the lord only writes `pawn.mindState.duty`, and the pawn's own think tree decides when to obey. From the vanilla Humanlike ThinkTreeDef ([Core/Defs/ThinkTreeDefs/Humanlike.xml](https://github.com/RimWorld-zh/RimTrans/blob/master/Core/Defs/ThinkTreeDefs/Humanlike.xml), a `ThinkNode_Priority` root — first node to return a job wins):

1. Forced-lying-down handling, **Downed**, BurningResponse, **MentalStateCritical** (berserk etc.)
2. React to close melee threat, **MentalStateNonCritical**
3. Queued jobs, **drafted player orders**
4. **LordDuty (HighPriority hook)** → `ThinkNode_Duty` dispatches into the DutyDef's own thinkNode subtree
5. Prisoner behavior; colonist emergency block: allowed-area, safe temperature, **emergency work (firefighting), get food only if starving**
6. **LordDuty (MediumPriority hook)** — e.g. `Spectate` and `Party` duties declare `<hook>MediumPriority</hook>`
7. Normal work, joy, wander, idle.

So: mental breaks, being downed, drafting, and _starvation-level_ hunger always outrank duties; ordinary hunger/rest/joy do **not** outrank a HighPriority duty. Two nuances make it graceful:

- **Duties opt in to need satisfaction.** Duty think trees commonly embed the shared `SatisfyBasicNeeds` subtree inside a leash node — e.g. `ThinkNode_ForbidOutsideFlagRadius (maxDistToSquadFlag 16) → Subtree SatisfyBasicNeeds`: "eat and rest, but stay within 16 cells of the duty flag" ([Duties_NonPlayerHome.xml](https://github.com/RimWorld-zh/RimTrans/blob/master/Core/Defs/DutyDefs/Duties_NonPlayerHome.xml)). The toil side gates this too: `LordToil.AllowSatisfyLongNeeds`, `AllowRestingInBed`, `CustomWakeThreshold` (caravan-forming wakes pawns at 50% rest instead of full).
- **Social lords are voluntary.** Parties/weddings use `ThinkNode_JoinVoluntarilyJoinableLord`; many mainline nodes carry `leaveJoinableLordIfIssuesJob=true`, so the moment a colonist's own AI issues a work/food/apparel job, the pawn simply leaves the party lord. Attendance is re-scored per pawn via `VoluntaryJoinPriorityFor(p)` (fiance ≫ guest; 0 = leave).
- **A constant think tree** (evaluated frequently, alongside the main tree) carries reflexes — flee explosion, hostility response — plus `LordDutyConstant` (`ThinkNode_DutyConstant` dispatches the duty's `constantThinkNode`), which is how a duty can _interrupt_ a current job rather than wait for it to end. Interrupt-on-change is otherwise explicit: transitions add `TransitionAction_EndAllJobs` / `TransitionAction_CheckForJobOverride` to force pawns to re-evaluate immediately. Sources: Humanlike.xml (`HumanlikeConstant` tree), SubTrees_Duty.xml, TransitionAction_CheckForJobOverride.cs, [CBornholdt AI tutorial](https://github.com/CBornholdt/RimWorld-AI-Tutorial/wiki/Part-1---Introduction), [roxxploxx SHORTTUTORIAL: How Pawns Think](https://github.com/roxxploxx/RimWorldModGuide/wiki/SHORTTUTORIAL:-How-Pawns-Think).
- **Release is trivially clean**: `Lord.Cleanup()` / `RemovePawn` set `mindState.duty = null` and force-end the current job (`EndCurrentJob(InterruptForced)`); with no duty and no lord, the pawn's next think-tree evaluation falls through to normal work/idle behavior. No restore-state needed because the lord never stored pawn state — it only ever contributed one input (the duty) that priority arbitration consumed. Source: Lord.cs.

### Transferable lessons (for a small narrative sim with authored multi-character scenes)

- **Don't queue commands per character — publish one declarative "duty" per character per scene-state, and let each character's own priority stack decide when to obey it.** RimWorld's whole trick is that the scene layer writes a single field (`mindState.duty`) and personal interrupts (collapse, panic, starvation) win by construction, at a fixed, authored priority rung. Autonomy yield and scene control stop being a conflict; they're just adjacent rows in one priority list.
- **Model the scene as a tiny FSM whose states assign duties and whose edges are triggers: timeout, predicate-poll, and memo.** The memo pattern (state polls a group condition cheaply on an interval, then fires a named signal consumed by an edge) cleanly expresses "wait until everyone has arrived/finished X" without per-character callbacks — the wedding's gate is literally `minTimeElapsed && bothActorsInArea`.
- **Author failure as edges, not error handling — and give every stage an escape.** Every RimWorld scene ships with call-off transitions (key actor lost, timeout, danger, mental break), a pause/resume twin-state pattern, an auto-injected rout state, and duty-level wander fallback so a blocked character mills about instead of freezing. Rituals go further: per-stage `failTriggers` (including an explicit reachability check with a grace period) and pro-rata outcomes for interrupted scenes — partial completion still means something narratively.
- **Split role → stage → duty in data.** The Ideology format (roles with ids; ordered stages; per-stage per-role duty + position + endTrigger/failTrigger; pre/post/interrupted/pawnLeave hooks) is a proven schema for authoring scenes in pure data with code only in reusable trigger/duty workers — a good template for a content-file format.
- **Make joining voluntary and leaving legal for social scenes.** Guests join a gathering because a join-priority function scores it, and leave the moment their own needs issue a job (`leaveJoinableLordIfIssuesJob`); only role-critical characters are hard-required. This is what makes RimWorld parties feel alive rather than staged. (Inference for Lifelines: distinguish "required cast" from "ambient attendance" in any scene schema.)

Key sources: [Lord/Transition/LordToil decompile (josh-m/RW-Decompile)](https://github.com/josh-m/RW-Decompile), [1.3 ritual decompile (Chillu1/RimWorldDecompiled)](https://github.com/Chillu1/RimWorldDecompiled), [core ThinkTree/Duty XML (RimWorld-zh/RimTrans Core/Defs)](https://github.com/RimWorld-zh/RimTrans), [Modding Tutorials/Rituals — rimworldwiki](https://rimworldwiki.com/wiki/Modding_Tutorials/Rituals), [CBornholdt RimWorld-AI-Tutorial](https://github.com/CBornholdt/RimWorld-AI-Tutorial/wiki/Part-1---Introduction), [roxxploxx How Pawns Think](https://github.com/roxxploxx/RimWorldModGuide/wiki/SHORTTUTORIAL:-How-Pawns-Think), [PrisonLabor ritual XML example](https://github.com/Aviuz/PrisonLabor/blob/master/1.5/Defs/Interrogation/InterrogationPatterns.xml). The agent did not find Tynan Sylvester writing/talks specifically on the Lord system; everything above is from source and modding docs.

---

## Report 3: Survey — staging authored multi-character beats over autonomy-driven agents

Sims/RimWorld excluded per brief. Strongest primary material: Final Fantasy XV's smart-location interaction scripts (Game AI Pro 3), Versu's social practices, and Hitman's situation system. Shadows of Doubt turned out to be a counter-example to the brief's premise.

### 1. Shadows of Doubt (ColePowered / Cole Jefferies)

Sources:

- https://colepowered.com/shadows-of-doubt-devblog-10-gameplay-loop/
- https://colepowered.com/shadows-of-doubt-devblog-8-simulating-a-city/
- https://colepowered.com/shadows-of-doubt-devblog-7-theres-been-a-procedurally-generated-murder/

Correction to the brief's premise: per Jefferies' own devblogs, murders are explicitly **not** scheduled scripted events — "all of this needs to happen using completely non-scripted game systems." The authored part is the killer _goal_, not a staged scene.

- **(a) Unit of authored behavior:** a goal injected into one agent — the killer AI "picks an acquaintance to kill," then hides the weapon in their apartment. Case breadcrumbs (diaries, letters, emails) are authored templates "mailmerged" against the generated mystery.
- **(b) Multi-character sync:** none authored. The killer synchronizes with the victim opportunistically: "The killer essentially tails their victim until they are alone and then does the deed." The city fast-forwards at ~x60 sim speed until the murder happens — sync by waiting, not by command.
- **(c) Failure handling:** layered discovery failsafes rather than scene guarantees — citizens investigate forced entry and suspicious sounds (murder screams), and as a last resort "the body begins to smell," so someone in the building eventually finds it.
- **(d) Autonomy yield/resume:** routines are precomputed per day (4-10 journeys per citizen) but "they can deviate from this if the situation calls for it, and their altered routine can be calculated by the game in real time" — e.g., discovering a body deprioritizes work; the discoverer holds at the scene ~2 in-game hours, then routines resume.

### 2. Dwarf Fortress (Tarn Adams / Bay 12)

Sources:

- https://www.gamedeveloper.com/design/q-a-dissecting-the-development-of-i-dwarf-fortress-i-with-creator-tarn-adams (Gamasutra Q&A)
- https://dwarffortresswiki.org/index.php/DF2014:Tavern

- **(a) Unit:** the _activity_ attached to a _location_ (tavern, temple, library). Adams: "Every fifty ticks, staggered from other updates, all of the taverns, temples, libraries, etc. get their information updated" — the location periodically recruits from whoever is present. Performance content itself (musical/dance/poetic forms) is procedurally authored per world, with min/max performer counts per form.
- **(b) Sync:** presence-based escalation, not assignment: "so long as there are at least two characters in the tavern, they may socialize," and socializing can evolve into perform/listen and perform/watch pairings. Roles emerge from who is idle at the location; explicitly assigned Performer roles "do not appear to actually perform more often than unassigned dwarves."
- **(c) Failure handling:** graceful degradation — "performers will simply improvise the sound of any missing instruments"; a form that can't be staffed simply isn't performed.
- **(d) Autonomy yield/resume:** need-driven. Dwarves attend because eat/drink/social needs route them there; the known failure mode is over-yielding — dwarves fixated on tavern needs "stop doing regular jobs you assign them until satisfied." Design intent per Adams: player is "the official will of the fortress" while dwarves keep autonomy "outside of their official duties." No hard scene control exists at all — this is the fully emergent end of the spectrum.

### 3. Versu (Evans & Short) — social practices

Source: https://www.cs.uky.edu/~sgware/reading/papers/evans2014versu.pdf (IEEE TCIAIG 2014, "Versu — A Simulationist Storytelling System")

The cleanest theoretical statement of the whole problem.

- **(a) Unit:** the _social practice_ — a reusable template of a recurring social situation ("a successor to the Schankian script"), implemented as a **reactive joint plan** with entry conditions, roles, and exit criteria.
- **(b) Sync:** role assignment plus turn structure inside the practice; agents don't negotiate — the practice sequences contributions. Crucially, practices "never control the agents directly; they merely provide suggestions" (affordances); each agent picks among them with utility-based reactive action selection.
- **(c) Failure handling:** an agent can decline; refusal dissolves the coordinating structure rather than forcing compliance.
- **(d) Autonomy yield/resume:** autonomy persists _through_ practices (the practice only offers affordances) and fully between them: autonomous behavior → practice coordination → autonomous behavior.

### 4. Final Fantasy XV — Smart Locations (Game AI Pro 3, ch. 35, Hendrik Skubch)

Source: http://www.gameaipro.com/GameAIPro3/GameAIPro3_Chapter35_Ambient_Interactions_Improving_Believability_by_Leveraging_Rule-Based_AI.pdf (read in full)

The most concrete production architecture found — purpose-built for authored multi-NPC vignettes over autonomous crowds.

- **(a) Unit:** an _interaction script_ — roles + STRIPS-style declarative rules over a shared tuple-space blackboard — owned by a _smart location_ (an invisible object grouping concrete props, e.g. two chairs and a table). "Coordination becomes the focus of the language." Scripts are data, swappable per location; four emitter types recruit participants (notification, script, spawn, player).
- **(b) Sync:** _role allocation_ with cardinalities (e.g. `Elder: 0..1, Tourist: 0..2`), Monte-Carlo greedy assignment from NPCs passing by; rules coordinate turn-taking via blackboard facts (`talker(X)`, `sitting(.me)`, reservation predicates for seats). Actions bottom out in ordinary per-NPC state machines/behavior trees ("sit down," "go to," "talk to") — the script layer only writes/reads shared facts.
- **(c) Failure handling is first-class:** if minimum cardinality can't be met "the script will not start"; if cardinality is violated mid-run (an actor leaves) "the script will terminate"; each rule has an `OnError` fact list applied when its action fails; adaptivity is a design goal — "if there was no old man, the tourist might still sit down to rest." When passers-by can't supply rare 3+ character casts, _spawn emitters_ place NPCs deliberately (a lesson explicitly credited to AC Unity's crowd events).
- **(d) Autonomy yield/resume:** each NPC participates in at most one script; termination rules (e.g. timers) make actors get up and leave, optionally with a "move away from the smart location" command; joining late is allowed per-role via a `dynamicJoin` flag (street vendor serving pedestrians as they pass). More autonomous characters (player's buddies) only get _notified_ of the location, keeping their own decision-making.
- Production notes worth stealing: scripts authored in Excel with a compiler that statically detects unreachable states and unexecutable rules; non-NPC systems (a shop UI) wrapped as _proxy actors_ so the script language can address them like characters; script templating for families of similar scenes (shopkeepers).

### 5. S.T.A.L.K.E.R. — A-Life and smart terrain (GSC / Dmitriy Iassenev)

Sources:

- https://medium.com/black-shell-media/a-life-an-insight-into-ambitious-ai-2eb435fa4054
- Original AiGameDev interview with Iassenev (http://aigamedev.com/open/interviews/stalker-alife/) is dead; web.archive.org was unreachable from this environment — details below come from the Medium secondary source and search summaries.

- **(a) Unit:** the _smart terrain_ — a zone overlay that "appl[ies] new rules to existing AI once they enter" — offering jobs (defend encampment, sit around fireplace, patrol). Much was cut; "what made the cut were factions, stalker activities such as defending encampments, or sitting around fireplaces."
- **(b) Sync:** job slots at the terrain; squads/NPCs route to a terrain and take its jobs (modern mods like AlifePlus show the shape most clearly: "squads route only to smart terrains with real animation jobs — campfires, shelters, traders, patrols"). Offline AI is deliberately minimal: "if there is no goal, try to get one."
- **(c/d) Story vs autonomy:** the blunt instrument — "essential story NPCs remain statically positioned until their quest lines conclude," everything else runs proactively on faction rules; online sim within ~150m of the player, offline elsewhere. Failure handling of authored beats is essentially avoidance: pin the actors you need, let the rest emerge. (Inference: this is the anti-pattern the other systems evolved past.)

### 6. Hitman — situations (2016) and crowd acts (Absolution)

Sources:

- https://www.gamedeveloper.com/design/the-ai-of-hitman-2016- (Tommy Thompson)
- https://media.gdcvault.com/gdc2012/slides/Programming%20Track/Fauerby_Kasper_CrowdsInHitman.pdf (GDC 2012, Kasper Fauerby)
- https://www.gdcvault.com/play/1015315/Crowds-in-Hitman

- **(a) Unit:** two tiers. Ambient: crowd _acts_ (talking on phone, smoking, sitting on bench) built "using a possession system and existing cut-scene tools" (Absolution slides) — i.e., authored choreography literally reuses the cutscene pipeline over possessed crowd agents. Reactive/authored beats: the _situation_ and the _opportunity_ (staged target set-pieces).
- **(b) Sync:** centralized casting, not peer negotiation — "characters will either execute behaviours on their own or they join 'situations', where behaviours are coordinated by a group," and "they're not willingly joining other characters... they simply make themselves available to be added to a situation and a separate system is selecting them." Opportunities exploit targets' predictable loops; deliberate response delays keep it from looking puppeted ("if... they run over immediately after you triggering the action, it will seem stilted and forced").
- **(c) Failure handling:** holding-position fallbacks — if a target can't reach the scripted safe room, "they instead opt to the best evacuation route that's available as a holding position."
- **(d) Autonomy yield/resume:** situation dissolves → NPCs drop back to individual behaviors/routine loops.

### 7. Assassin's Creed Unity — systemic crowd events (GDC 2015, Christine Blondeau)

Sources:

- https://www.gdcvault.com/play/1022211/Postmortem-Developing-Systemic-Crowd-Events (free talk; slide PDF returned 403, YouTube mirrors dead — details here are thinner)
- https://gdconf.com/article/learn-about-assassin-s-creed-unity-s-dynamic-crowds-at-gdc-2015/

- **(a) Unit:** the _crowd event_ — "non-player-centric systemic events" (fistfights to stop, pickpockets to catch) cast from ambient crowd NPCs, designed to fire whether or not the player watches.
- **(b/c):** one concrete lesson survives via the FFXV chapter's citation of this talk: scenes needing 3+ specific characters "occur rarely when using just NPCs that pass by the location" — casting from ambient traffic fails for large casts, which is why FFXV added spawn emitters. Beyond that slide-level detail on failure handling was unrecoverable; flagged as thin rather than padded.
- **(d):** integration with ambient crowd systems and mission design was a stated talk topic; specifics unrecovered.

### 8. Left 4 Dead — AI Director (adjacent only)

Sources:

- https://steamcdn-a.akamaihd.net/apps/valve/2009/ai_systems_of_l4d_mike_booth.pdf
- https://www.gdcvault.com/play/1422/From-COUNTER-STRIKE-to-LEFT

Confirmed adjacent: the Director is a _pacing_ authority ("structured unpredictability" — population functions "not purely random, nor deterministically uniform," driven by estimated survivor intensity), built as "a layered set of extremely simple, playtestable algorithms." It authors _when and how much_, never _who does what with whom_ — no roles, no joint scenes. Useful as the "director tier" above scene systems, not as a scene system.

### Skipped targets

- **RDR2 ambient scripting:** no solid primary/dev sources found on its ambient-scene architecture; skipped.
- **Watch Dogs 2 crowd AI** (GDC 2017 "Helping It All Emerge," Roxanne Blouin-Payer, https://gdcvault.com/play/1024426/): only surface material recoverable (rule-spreadsheet-driven emotional reactions); nothing specific on authored multi-character staging, so not counted.
- **Oxygen Not Included / Prison Architect:** their job/priority systems are per-agent task queues; found nothing on multi-character scene sync, so out of scope.
- Related citation worth having on file: de Sevin, Chopinaud & Mars, "Smart Zones to Create the Ambience of Life," _Game AI Pro 2_ — smart zones cast nearby characters into roles using "timeline-based scripts with synchronization points" reacting to a main set piece (known via the FFXV chapter's discussion and https://www.researchgate.net/publication/275651097_Smart_Zones_to_create_Ambience_of_Life; full text not fetched).

### Cross-cutting patterns

- **Role allocation with cardinalities, cast from whoever's nearby.** FFXV (min/max per role, greedy Monte-Carlo assignment), Versu (practice roles), Hitman (central system selects available NPCs into situations), DF (whoever's idle in the location), Smart Zones. The scene declares roles; agents are cast into them — never named individuals, except as a fallback.
- **The scene is a shared data structure, not a controller.** FFXV's tuple-space blackboard, Versu's practices "merely provide suggestions," Hitman's situations coordinate but the NPC's own behavior tree executes each action. Authored layer speaks in facts/affordances; the agent's normal action system stays the executor. This is the near-universal yield mechanism.
- **Explicit start/abort contracts instead of forcing compliance.** Can't meet minimum cast → don't start (FFXV); actor leaves mid-scene → terminate or degrade (FFXV cardinality violation, Versu practice dissolution, DF improvised instruments, Hitman holding positions). Nobody found teleports or mind-controls an agent to save the scene; the scene bends or dies.
- **Environment-anchored recruiting (smart object → smart location/terrain/zone).** A documented lineage: Sims smart objects → STALKER smart terrains → Smart Zones → FFXV smart locations. Anchoring the authored beat to a place with props solves both casting (query nearby agents) and grounding (the props carry animations/positions).
- **Spawning as the escape hatch for large authored casts.** Directly documented failure mode: casting 3+ specific characters from ambient traffic fails (AC Unity postmortem, fixed in FFXV via spawn emitters; STALKER pinned story NPCs entirely). If a beat needs a precise ensemble, at least part of the cast gets conjured, not recruited.
- **Two-tier authorship: director above, scenes below.** (Partly inference.) L4D's Director and Shadows of Doubt's killer-goal injection author _pressure and premise_ at the top; scene/practice/situation systems author _choreography_ at the bottom; agents keep autonomy in between. Shadows of Doubt shows the extreme where only the premise is authored and everything else is failsafes (body-smell discovery) — robust, but it gives up all beat timing.
