---
name: brainstorming
description: Explore ideas and turn them into SDDs filed in the PM dashboard. Use this skill BEFORE any creative or feature work — designing new features, rethinking systems, adding functionality, or modifying behavior. Triggers for any "build X", "add Y", "redesign Z", "what if we...", or exploratory conversation about the game. Also use when the user says "brainstorm", "design", "explore", or "let's think about". This skill OVERRIDES the superpowers:brainstorming skill for this project.
---

# Brainstorming Into SDDs

<!-- Adapted from lifelines-core-loop .agents/skills/brainstorming. Godot gym/zoo/museum verification is replaced with this repo's HTML-prototype workflow; /plan routing is replaced with wayfinder or a normal build session. -->

Turn ideas into validated designs filed as SDDs in the PM dashboard (localhost:3333). This replaces generic design-doc workflows — everything routes through the project's issue tracker.

## Why This Exists

This project uses a custom PM dashboard as the single source of truth for all work items. Designs live as SDDs in the dashboard, not as markdown files in `docs/plans/`. This skill ensures brainstorming flows into that system instead of creating orphaned documents.

## Sprint Context

The user often starts with a **project dossier** — a generated prompt containing a project ID (SPRINT-NNN), destination, and suggested knowledge base queries. When the conversation includes a dossier or the user references a project (e.g., "brainstorm on SPRINT-016"):

1. **Extract the project ID** from the dossier or user message
2. **Fetch project detail**: `pm project SPRINT-NNN` — this returns the project's items, designs, and plans
3. **Scope the brainstorm to that project** — all questions, approaches, and the final SDD should relate to the project's destination. Attach `sprintId` when filing the SDD and any new items.
4. **Run any knowledge base queries** the dossier suggests before asking questions — they provide design context the user expects you to have.

If there's no sprint dossier, fall through to the general process below.

## Process

### Quick-take mode (skip the interrogation)

Sometimes the user wants a fast opinion, not an SDD — "quick take", "gut check", "what do you think", or a narrow architectural question. Do NOT run Phase 1. Read the relevant code, give your recommendation with reasoning in a few sentences, and stop. Offer the full brainstorm only if they want depth: "Want to turn this into an SDD, or was this just a gut check?" Forcing the full interrogation onto a quick question is a known way to make the user bail.

### Phase 1: Interrogate the Idea

This phase is the most important part of the entire skill. The goal is to reach **genuine shared understanding** — not polite agreement, but deep alignment where the agent's mental model of the solution matches the user's. Discrepancies caught here save days of wasted implementation.

#### Preparation (before asking anything) — MANDATORY

Most questions you're tempted to ask are **already answered somewhere**. Asking the user something you could have found yourself wastes the session and reads as bullshit. Before the first question, mine all four sources:

1. **The code** — read the files this idea touches and recent commits (`git log`). Form your own model of how it works today. If a question can be answered by reading code, read the code instead.
2. **The PM dashboard** — `pm list project`, `pm list`, `pm get <ID>`, `pm prompt sdd <ID>`. The active project, related SDDs / issues / decisions / gaps. This is the source of truth for what's already decided and in-flight; avoid duplicating it. (If a project is already scoped above, skip re-fetching.)
3. **The Obsidian vault** — `qmd query "..."` (semantic) and `qmd search "DD-054"` (exact) for design docs, locked decisions, and prior art; `obsidian read file="..."` for a named doc.
4. **Claude memories** — the recalled memories already in your context (project direction, locked decisions, past feedback). Check them before asking about design intent or prior choices.

After mining, **answer every question you CAN from these sources yourself** — surface it out loud when it challenges an assumption. What remains — a genuine preference, a judgment call, a decision only the user can make — is what you ask.

#### The Interrogation

Walk down the **design tree** — a branching structure of decisions where each choice constrains or enables later ones. Resolve one branch fully before opening the next. This prevents the conversation from becoming a scattered tour of half-formed ideas.

**How to question:**

- **One question at a time.** Each question should build on the previous answer. Prefer multiple choice ONLY when the design space is genuinely enumerable AND the frame is already agreed (e.g. "which of these three storage backends?"). Ask as plain prose — never a multiple-choice batch — for **premise** ("why is this in the game at all?"), **feel** ("does this read as tense or calm?"), and **spatial / camera / framing** questions. These have no clean option set; forcing one makes the user reject the frame and rewrite it longhand. When in doubt, ask open.
- **Summary and context go in their OWN message, before any AskUserQuestion tool call.** Text emitted in the same turn as the tool doesn't render — the user sees options with no setup. Post the framing as a plain message first, then ask.
- **A rejected question batch means the frame is wrong, not the wording.** When the user declines your options and reframes in free-form, drop to open dialogue and follow THEIR framing — do NOT reformulate another batch. Reformulating twice is the single biggest cause of abandoned sessions.
- **Ask as few questions as possible — quality over count. There is NO minimum.** A question earns its place only when BOTH: (a) the answer is not already in the code, PM dashboard, vault, or memories, AND (b) it's a decision only the user can make — a preference, a priority, a trade-off, a feel call. Facts are lookups, not questions. A handful of sharp decision-questions beats 20 that grind through things you could have found yourself. You're done when you can articulate the vision back accurately — not when you've hit a count.
- **Don't accept surface answers.** When the user says "it should just work like X," ask: *What specifically about X? Which parts? What would you change?* When they say "probably," ask: *What would make you certain?*
- **Follow-up before moving on.** If an answer raises a new question, pursue it immediately. Don't mentally bookmark it for later — the context is fresh now.

**What to question:**

- **The problem itself** — Is this the right problem? What evidence says so? What happens if we don't solve it? Who does it affect?
- **Assumptions** — What's being taken for granted? What would change if those assumptions were wrong?
- **Prior art** — Has this been tried before in this project? What happened? In other projects/games?
- **Constraints** — What's non-negotiable? What's flexible? What are the time/scope/quality trade-offs?
- **Success criteria** — What does "done" look like? How will we know this worked? What would make it a failure?
- **Edge cases and failure modes** — What happens when the inputs are weird? When the user does something unexpected? When two systems interact badly?
- **The uncomfortable questions** — "If we rebuilt this system from scratch with everything we know now, would we make this same choice?" "What's the version of this that's 10x simpler?" "What would we cut if we had half the time?"

#### Codebase-Informed Challenges

Use what you found in the code to challenge assumptions and surface hidden complexity:

- **"You said X, but the code does Y"** — When the user's description doesn't match reality, flag it immediately. This is the most common source of implementation surprises.
- **"This would also affect Z"** — When you spot ripple effects the user hasn't mentioned, surface them as questions, not objections.
- **"The current pattern is P — do you want to follow it or diverge?"** — Architectural consistency matters, but so does improving bad patterns. Make this a conscious choice.

#### Contradiction Surfacing

Track what the user says across all answers. When a new answer conflicts with an earlier one, stop and resolve it:

> "Earlier you said [X], but just now you described [Y]. These seem to pull in different directions — which one wins, and why?"

This isn't adversarial — it's protective. Contradictions left unresolved become bugs.

#### Exit Criteria

You're ready for Phase 2 when ALL of these are true:
- You can articulate the user's vision back to them in your own words and they agree it's accurate
- You know the boundaries — what's in scope and what's explicitly out
- You've identified the riskiest technical decisions and discussed them
- You haven't discovered a new major question in the last 2-3 exchanges

Before moving on, **summarize your understanding** in 3-5 sentences and ask: "Is this right, or am I missing something?" If they correct you, keep questioning until the summary sticks.

### Phase 2: Explore Approaches

1. **Propose 2-3 approaches** with trade-offs. Lead with your recommendation and explain why.
2. **Check against design decisions** — scan the PM dashboard's locked decisions (`pm list decision`, `pm get DD-NNN`) to make sure proposals don't conflict with them.
3. **Get the user's pick** before moving to detailed design.

### Phase 3: Design

Present the design incrementally — section by section, scaled to complexity:
- Architecture / system changes
- Data flow / store (MobX) changes
- UI changes (if any)
- Testing approach
- Edge cases
Ask for confirmation after each section. Revise if needed.

Keep it lean — YAGNI ruthlessly. The SDD captures what to build, not every possible future. Remember the lab's pinned rule: this repo tests design decisions faster than Godot — it never becomes a second game implementation. Anything that only matters in the real game engine belongs in a core-loop SDD, not here.

### Phase 3.5: Designer Verification (HTML probes)

After the design is approved but before filing the SDD, ask whether this system needs an interactive probe in `prototypes/`. This is where the designer specifies how they'll verify and explore the feature — not an afterthought bolted on during planning.

**When to ask:** Systems with tunable parameters, emergent behavior, or visual/temporal behavior. Skip for pure data migrations, config changes, or simple bug fixes.

**Questions:**
- "Does this need a probe? What controls and presets would help you tune it?"
- "Is there a comparison component — variants to display side by side?"
- "What tells you at a glance that this system is working correctly?"

If the user says yes, add a **Designer Verification** section to the SDD with:
- Key controls and presets
- What "working correctly" looks like visually
- Which assertions can run as automated tests (`npm test`)

If the user says standalone tests are sufficient, that's fine — note it and move on.

### Phase 4: File the SDD

Once the user approves the design, file it in the dashboard:

```bash
pm design create "<descriptive title>" \
  --body "<the full design in markdown>" \
  --items SB-NNN \
  --sprint SPRINT-NNN
```

- **--items**: link to any existing issues/gaps this design addresses (check dashboard first)
- **--sprint**: attach to the active sprint if there is one

If the design surfaces new issues or gaps, file those too:
```bash
pm gap "..." --body "..." --pillar "..."
```

Print the SDD ID and a summary when done.

### Phase 5: Transition

After filing the SDD, ask the user:

> "SDD filed as SDD-NNN. Want me to break this into tickets now, or save that for later?"

If yes: for foggy multi-session scope, load `wayfinder` and chart it as a map; for settled scope, load the `plan` skill (it runs the two-track gate and picks the D0/D1 dial). If no, stop here. Either way, note in the SDD which parts are Track V vs Track F (load the `two-track` skill if unsure) — it saves the next session a classification pass.

## Principles

- **One question at a time** — don't flood with questions
- **Depth before breadth** — resolve one decision branch fully before opening the next
- **The code is evidence** — use the codebase to inform and challenge, not just the user's description
- **Contradictions are gifts** — surfacing them early prevents implementation surprises
- **YAGNI** — remove unnecessary features from designs
- **Dashboard is truth** — everything goes through localhost:3333, not markdown files
- **Check before creating** — always scan existing items for duplicates or related work
- **Design decisions are law** — proposals must not contradict locked DDs
- **Open by default** — multiple choice only for enumerable, agreed-frame decisions; premise/feel/spatial questions go as prose
- **Rejection = reframe, not rephrase** — a declined question batch means switch to open dialogue on the user's terms, never a second batch
