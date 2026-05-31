# SB-008 generator notes

Implemented as a narrow pass over the phone practice slice.

- Extended `PressureObject` with `conditionLabel`, `objectLabel`, `visibleSigns`, and structured `consequences` while retaining legacy `label`/`escalatesInto`/`softenedBy` fields for compatibility.
- Rewrote seven phone pressure objects so player-facing state is concrete anchor + non-clinical condition label + visible signs + mechanical consequences.
- Kept internal IDs such as `phone_fear` stable for resolver/support mechanics, but player-facing copy now uses condition labels like `Terskel`, `Skam`, `Forpliktelse`, and `Blottstillelse`.
- Updated the room/stage and table cards to render anchor/object first, then the attached condition label.
- Updated Frank reports to begin with observed evidence before a cautious pressure read.
- Added tests for object completeness, banned clinical labels, abstract labels requiring anchors, UI source pairing, and report evidence-before-interpretation ordering.
