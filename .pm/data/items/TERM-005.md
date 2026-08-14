---
id: TERM-005
type: term
title: fail trigger
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
createdAt: 2026-08-13T11:15:18.430Z
updatedAt: 2026-08-13T11:15:18.430Z
---
The authored condition that declares a visit stage unable to succeed. Three kinds: timeout, unreachable, role-lost. Every stage carries an implicit engine-default timeout that authors can raise but not remove. Grace periods are parameters on unreachable/role-lost, not separate kinds.