#!/usr/bin/env bash
# SDD resolver for agent-harness: turns "SDD-NNN" into SDD markdown on stdout.
# Backed by the project's pm dashboard; the harness itself never learns pm.
set -euo pipefail

SDD_ID="${1:-}"
if [[ ! "$SDD_ID" =~ ^SDD-[0-9]{3}$ ]]; then
  echo "expected SDD id like SDD-010, got: $SDD_ID" >&2
  exit 64
fi

# Prefer PM so the harness follows the project planning surface. Fall back to
# the checked-in PM data file so `harness run-sdd SDD-NNN` still works when a
# non-interactive spawn exposes an odd pm shim/shebang environment.
if PM_JSON="$(pm get "$SDD_ID" 2>/tmp/resolve-sdd-pm.err)"; then
  printf '%s' "$PM_JSON" | node -e '
let data = "";
process.stdin.on("data", (chunk) => (data += chunk));
process.stdin.on("end", () => {
  const item = JSON.parse(data);
  if (!item.body) {
    console.error(`pm item ${process.argv[1]} has no body`);
    process.exit(1);
  }
  process.stdout.write(item.body);
});
' "$SDD_ID"
  exit 0
fi

FALLBACK=".pm/data/designs/${SDD_ID}.md"
if [[ -r "$FALLBACK" ]]; then
  cat "$FALLBACK"
  exit 0
fi

cat /tmp/resolve-sdd-pm.err >&2 || true
echo "could not resolve $SDD_ID through pm or $FALLBACK" >&2
exit 1
