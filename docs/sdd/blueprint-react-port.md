# Blueprint v1 React/MobX/Tailwind port

Date: 2026-06-12
Status: Draft SDD
Source artifact: `prototypes/blueprint_v1.html`
Target stack: Vite, React, TypeScript, MobX, Tailwind v4/DaisyUI

## Design question

Can the full `blueprint_v1.html` caseworker loop be ported into the React design lab
without losing the prototype's behavioral contracts, writing register, or whole-loop
shape?

## Product claim

The single-file HTML prototype has done its job: it proves the integrated loop. The
next useful step is not to keep expanding that file. The blueprint should become a
typed React/MobX/Tailwind surface where content, engine logic, observable state, and
presentation are separable enough for tests, agent work, responsive passes, and later
Godot-content extraction.

The original HTML file remains the reference artifact. The port should make future
iteration happen in `src/`, not in `prototypes/blueprint_v1.html`.

## Hard constraint: keep the original prototype

`prototypes/blueprint_v1.html` must not be deleted, renamed, or rewritten as part of
the port. It stays as:

- a playable reference for parity checks;
- a source transcript for content extraction;
- a fallback when the React port behavior is questioned;
- a frozen record of the 2026-06-11 blueprint playtest state.

Implementation verification should include a direct check that the file is unchanged
unless a later issue explicitly asks to edit the prototype.

## Source contract

The React port should preserve the source loop:

```text
Prologue
-> Pulten: documents on the desk
-> reader with authored evidence anchors
-> fact lift: hover spyglass, click-to-lift, yellow only after lift
-> Sakens fakta
-> Apne sporsmal with hypothesis selection inside each question
-> Frank dispatch and grounded chat
-> Vedtak og tiltak: three slots plus pressure option
-> mocked simulation/day advance
-> new documents and log changes
-> Grete unavailable/dead beat
-> final status/reflection
```

The port does not need pixel-perfect CSS parity, but it must preserve the gameplay
meaning of each surface.

## Existing SDD contracts carried forward

This port is an implementation SDD for the integration prototype. It should not
reopen the core design decisions from the prior SDDs.

- SDD-003: the case board asks what Grete carries and what Elling can carry with
  support, not what diagnosis Elling has.
- SDD-004: evidence anchors are authored; facts auto-file; highlighter-yellow appears
  only after a fact is lifted; the first meaningful move is interpretation.
- SDD-005: `Arbeidshypotese` lives inside an open question and remains provisional.
- SDD-006: tiltak are formal casework decisions with tradeoffs, not upgrades.
- SDD-007: help changes the ecology and should produce new evidence, not closure.
- SDD-008: clocks are concrete pending case events, not generic meters.

## Scope

### Includes

- Add a React blueprint surface under `src/`.
- Extract prototype content into typed TypeScript data:
  - prologue beats;
  - domains;
  - facts;
  - documents;
  - questions and hypotheses;
  - tiltak and slots;
  - dispatches;
  - Frank chat entries;
  - clock definitions;
  - scripted day beats;
  - mocked sim flavor/events.
- Move prototype engine behavior into pure functions where practical:
  - receive document;
  - lift fact;
  - calculate visible questions;
  - choose hypothesis;
  - check tiltak availability;
  - draft/enact vedtak;
  - run dispatch;
  - ask Frank;
  - advance day;
  - move clocks;
  - run mocked sim tick;
  - calculate ending/reflection.
- Add a MobX store for blueprint state and UI overlays.
- Rebuild the surfaces in React:
  - prologue overlay;
  - topbar/resources;
  - surface tabs;
  - desk/document cards;
  - document reader;
  - fact detail overlay;
  - `Sakens fakta`;
  - `Apne sporsmal`;
  - `Vedtak og tiltak`;
  - Frank dispatch/chat;
  - apartment/simulation view;
  - toasts;
  - reflection/status screen.
- Fold in the known playtest fixes where the port creates the right seam:
  - mobile readability and layout;
  - discoverability of opening documents and lifting facts;
  - locked-question guidance;
  - non-hover legend for orange badges;
  - clearer day/week/month passage feedback.

### Out of scope

- Deleting or simplifying the HTML prototype.
- Building the Godot port.
- Replacing the mocked simulation with `lifelines-core-loop`.
- Creating a content editor.
- Adding arbitrary text selection or freeform evidence-board layout.
- Rewriting the case content beyond changes needed for typed extraction and
  responsive presentation.
- Solving full save/load.

## Target architecture

### Content

Recommended shape:

```text
src/content/blueprint/
  prologue.ts
  domains.ts
  facts.ts
  documents.tsx or documents.ts
  questions.ts
  tiltak.ts
  dispatches.ts
  chat.ts
  clocks.ts
  script.ts
  simFlavor.ts
  index.ts
```

Documents need rich authored markup. Prefer structured spans over raw HTML string
manipulation. A document paragraph can be represented as text runs:

```ts
type DocumentRun =
  | { kind: 'text'; text: string }
  | { kind: 'evidence'; factId: FactId; text: string };
```

This keeps evidence anchors type-checkable and avoids reintroducing DOM parsing inside
React.

### Domain types

Add blueprint-specific types in `src/domain/blueprint.ts` unless an existing domain
type is already a good fit.

Important IDs should be literal unions inferred from content where practical:

- `FactId`
- `DocumentId`
- `QuestionId`
- `HypothesisId`
- `TiltakId`
- `DispatchId`
- `ChatId`
- `ClockId`

### Engine

Recommended shape:

```text
src/engine/blueprint/
  evidence.ts
  questions.ts
  vedtak.ts
  dispatch.ts
  sim.ts
  ending.ts
```

Engine functions should accept plain state/data and return patches, events, or next
state. They should not reach into React components or the DOM.

### Store

Add a `BlueprintStore` rather than overloading the existing `RootStore`.

State should cover:

- current phase and surface;
- day/actions;
- prologue progress;
- documents received/read/new;
- pending documents;
- collected facts/fresh flags;
- visible questions and selected hypotheses;
- unread counts;
- chat log and asked questions;
- dispatch history;
- vedtak draft and enacted tiltak;
- clocks;
- mocked sim state/log;
- active overlays;
- toasts;
- final reflection state.

The store should expose user-intent actions such as `openDocument`, `liftFact`,
`chooseHypothesis`, `toggleDraftTiltak`, `enactVedtak`, `runDispatch`, `askFrank`,
`advanceDay`, and `resetBlueprint`.

### UI

Recommended shape:

```text
src/components/blueprint/
  BlueprintLab.tsx
  BlueprintTopbar.tsx
  BlueprintTabs.tsx
  PrologueOverlay.tsx
  DeskSurface.tsx
  DocumentCard.tsx
  DocumentReader.tsx
  FactsSurface.tsx
  FactOverlay.tsx
  QuestionsSurface.tsx
  VedtakSurface.tsx
  FrankSurface.tsx
  ApartmentSurface.tsx
  ToastStack.tsx
  ReflectionOverlay.tsx
```

Use React rendering for state-specific UI rather than manual `renderAll` functions.
Keep Tailwind utility classes close to components, with small shared primitives only
when repetition becomes real.

### Styling

The HTML prototype's paper/desk feeling matters, but the CSS should not be pasted
wholesale.

Use Tailwind for layout, spacing, responsive behavior, and common states. Keep a small
CSS layer for project-specific tokens and effects that Tailwind does not express well:

- paper colors;
- document register font variables;
- evidence underline/mark states;
- line-paper backgrounds;
- slight paper rotation/shadow;
- toast positioning;
- SVG evidence-link overlay if retained.

Do not let DaisyUI card defaults turn the desk into a generic dashboard. The React
surface should still feel like a work surface with documents, notes, and restrained
case UI.

## Responsive and usability contract

The port should fix the known playtest failures rather than preserve them.

- Mobile must be playable at 390px width without browser zoom.
- Document body text should not drop into 8-10px sizes.
- The first document-open action and first fact-lift action need an affordance that
  works without hover.
- Locked open questions should name what kind of evidence is missing.
- Orange/new-count badges need an inline or first-use explanation that works on touch.
- Day advance should communicate elapsed time and what changed, not only increment
  `Dag`.

## Implementation slices

### Slice 1: content and engine parity

Extract source data and core functions. Add unit tests for fact lifting, question
visibility, hypothesis availability, tiltak availability, day advancement, and one
scripted Grete beat.

Pass when a test can drive the loop from first document to at least one visible
question without React.

### Slice 2: desk, reader, facts, questions

Build the playable desk loop in React:

```text
document -> lift facts -> Sakens fakta -> Apne sporsmal -> choose hypothesis
```

Pass when the player can read, lift, review, and choose a provisional hypothesis on
desktop and mobile.

### Slice 3: vedtak, Frank, simulation, reflection

Build the rest of the blueprint loop:

```text
hypothesis -> tiltak draft/enact -> Frank dispatch/chat -> day advance/sim -> new docs
-> Grete beat -> reflection
```

Pass when the whole HTML prototype loop is playable in React.

### Slice 4: parity and regression pass

Run side-by-side manual review against `prototypes/blueprint_v1.html`, then close the
known responsive/discoverability/time-passage gaps.

Pass when the React port is the surface to continue from and the HTML prototype is
only a reference.

## Acceptance criteria

- `prototypes/blueprint_v1.html` remains present and unchanged.
- The React app exposes the blueprint as a first-class playable surface.
- The full loop is playable from prologue to reflection.
- Evidence anchors preserve the SDD-004 interaction contract:
  - no immediate yellow pre-highlight;
  - hover/focus or touch affordance;
  - click/tap to lift;
  - yellow collected mark only after lift.
- Facts auto-file by domain and source.
- Open questions appear from facts and contain hypothesis choices.
- Blocked hypotheses/questions explain missing evidence in case language.
- Vedtak requires earned basis where the prototype requires it.
- Frank dispatch/chat remains grounded in collected facts and current phase.
- Day advancement moves documents, clocks, sim log, and Grete script beats.
- Mobile layout is usable without zoom.
- `npm test`, `npm run build`, and `npm run lint` pass.

## Verification

Required automated checks:

- unit tests for engine behavior;
- component tests or smoke tests for the core desk loop if practical;
- `npm test`;
- `npm run build`;
- `npm run lint`.

Required manual/browser checks:

- desktop playthrough of the full loop;
- mobile viewport playthrough through at least first hypothesis and day advance;
- comparison against `prototypes/blueprint_v1.html` for missing surfaces or broken
  story beats.

## Main risks

### Risk: port becomes a visual rewrite and drops behavior

Mitigation: extract engine/content first and test it before polishing surfaces.

### Risk: raw HTML strings leak into React

Mitigation: represent documents as typed text/evidence runs. Use React components for
evidence spans.

### Risk: Tailwind/DaisyUI makes the case desk generic

Mitigation: keep paper/document styling as local design tokens and component-specific
classes. Use DaisyUI sparingly for controls, not as the visual identity.

### Risk: the port preserves desktop-only affordances

Mitigation: make mobile/touch requirements acceptance criteria, not a later polish
task.

### Risk: content extraction creates accidental copy edits

Mitigation: preserve Norwegian text verbatim where possible. Any deliberate copy change
should be called out in the implementation notes.

## Prototype verdict question

After the port is playable, ask:

> Does the React version still feel like the whole caseworker game blueprint, or did
> the port turn it back into a dashboard?

Supporting questions:

1. Can a player complete the same loop without reading the old HTML first?
2. Did the port make the central verb easier to discover?
3. Did the typed seams make future design work safer?
4. Is the HTML prototype now a useful reference rather than the place we keep editing?
