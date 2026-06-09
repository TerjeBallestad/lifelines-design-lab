# Lifelines Design Lab Agent Notes

## Agent skills

### Issue tracker

Issues and design docs are tracked with the local `pm` CLI: `SB-*` issues flow into `SDD-*` designs, and "PRD" means SDD in this repo. In sandboxed shells, PM server calls may need approval outside the sandbox; prefer narrow persisted approvals for read-only PM commands. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical triage roles map to PM stages/actions: `inbox`, `exploring`, `planned`, `sdd`, and archive-with-comment for wontfix. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repo; read root domain context and ADRs when present, plus existing architecture/SDD docs as relevant. See `docs/agents/domain.md`.
