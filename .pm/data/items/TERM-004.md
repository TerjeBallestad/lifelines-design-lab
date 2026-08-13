---
id: TERM-004
type: term
title: end trigger
stage: inbox
priority: null
pillar: ""
related: []
affectedFiles: []
blockedBy: []
aliases: []
sprintId: null
assignee: null
assignedAt: null
comments: []
createdAt: 2026-08-13T11:12:53.306Z
updatedAt: 2026-08-13T14:02:47.857Z
---
The authored condition that advances a visit stage to the next one. Three authored kinds: roles-arrived, duration, event. Multiple triggers are OR - the first to fire ends the stage. 'Answer' is an event name, not a kind.

Amendment (SB-107 probe session): say and converse are self-terminating - say ends on line delivered plus a read-time dwell computed from line length (dwell= overrides), converse ends when the conversation manager ends it. A stage with a self-terminating duty needs no authored end trigger. The compiler requires an authored end trigger only for stages with nothing self-terminating (pure goto/stay/do), which would otherwise never end.
