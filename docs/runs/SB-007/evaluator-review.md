# SB-007 evaluator review

## First review: REVISE

The first generator pass moved the obvious dashboard words out of the main loop, but it still leaked implementation language through dynamic UI paths.

Blockers found:

- Raw enum values appeared in the room pills and evidence values: `seated_away`, `written_script`, `completed_practice`, etc.
- Pressure labels in Frank reports mixed English fragments into Norwegian caseworker copy: `restless chair`, `thin hope`, `being watched`.
- The UI still rendered raw anchors like `phone`, `chair`, `sofa`, `bedroom`, and `desk`.
- Result beats rendered the internal actor `Room` and English helper text like `Can become` / `Eased by`.
- Tests were too source-oriented; they did not catch dynamic JSX values such as `{pressure.anchor}` or `{beat.actor}`.

## Revision made

The revision replaced the remaining raw/internal display paths with player-facing room language:

- Anchor labels now render as `telefonbordet`, `lesestolen`, `sofaen`, `soverommet`, `kjøkkenbordet`.
- Frank position, script state, friction state, result state, and evidence values now pass through copy maps before rendering.
- Frank reports now use Norwegian pressure language consistently.
- The main UI is plainer: `Stua`, `Hvor Frank står`, `Hva Frank tar med inn`, `Hva Elling skal prøve`, `Bruk dagens oppmerksomhet`.
- Stage labels now name room objects instead of prototype zones.
- Tests now guard against the specific raw-rendering regression: `{telefonAversjon.anchor}`, `{pressure.anchor}`, `{beat.actor}`, `Can become`, and `Eased by`.

## Final verdict: PASS

This is not final voice. It is better than the version Terje rejected because it removes the worst middle-language layer: design-system phrasing masquerading as in-world text.

The app now reads more like a rough Norwegian casework scene and less like `Lifelines Social Realist 3D Life-Sim Spine` pasted into a UI.

Remaining caveat:

- Some labels are still mechanically descriptive rather than truly good prose. That is acceptable for this sprint. The goal was to stop the game getting lost in weird text, not to finish the voice bible.
