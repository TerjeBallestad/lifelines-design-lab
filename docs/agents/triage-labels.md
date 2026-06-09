# Triage Labels

The skills speak in terms of five canonical triage roles. This repo uses PM stages/actions instead of issue labels, so this file maps those roles to PM operations.

| Label in mattpocock/skills | PM mapping                                    | Meaning                                                 |
| -------------------------- | --------------------------------------------- | ------------------------------------------------------- |
| `needs-triage`             | `stage: inbox`                                | Maintainer needs to evaluate this issue                 |
| `needs-info`               | `stage: exploring`                            | Waiting for more information or discovery               |
| `ready-for-agent`          | `stage: planned`                              | Fully specified, ready for an AFK agent                 |
| `ready-for-human`          | `stage: sdd`                                  | Needs human design judgment or implementation direction |
| `wontfix`                  | Add a PM comment explaining why, then archive | Will not be actioned                                    |

When a skill mentions a role, apply the corresponding PM stage/action from this table.

## Commands

```sh
pm patch SB-001 --stage inbox
pm patch SB-001 --stage exploring
pm patch SB-001 --stage sdd
pm patch SB-001 --stage planned
pm comment SB-001 "Closing as wontfix because ..." --author codex
pm archive SB-001
```

Use the same mapping for `SDD-*` items when triaging design documents.
