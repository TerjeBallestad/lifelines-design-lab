#!/usr/bin/env bash
# SDD resolver for agent-harness: turns "SDD-NNN" into SDD markdown on stdout.
# Backed by the project's pm dashboard; the harness itself never learns pm.
set -euo pipefail
pm get "$1" | node -e '
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
' "$1"
