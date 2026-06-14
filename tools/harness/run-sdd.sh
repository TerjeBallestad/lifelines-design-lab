#!/usr/bin/env bash
set -euo pipefail

SDD_ID="${1:-}"
MODE="${2:-deliver}"
if [[ -z "$SDD_ID" ]]; then
  echo "usage: tools/harness/run-sdd.sh SDD-NNN [mode]" >&2
  exit 64
fi
if [[ ! "$SDD_ID" =~ ^SDD-[0-9]{3}$ ]]; then
  echo "expected an SDD id like SDD-010, got: $SDD_ID" >&2
  exit 64
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$ROOT_DIR"

if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
  export NVM_DIR="$HOME/.nvm"
  # shellcheck disable=SC1090
  source "$NVM_DIR/nvm.sh"
  nvm use --silent default >/dev/null
fi

if ! command -v harness >/dev/null 2>&1; then
  echo "harness command not found on PATH" >&2
  exit 127
fi
if ! command -v pm >/dev/null 2>&1; then
  echo "pm command not found on PATH" >&2
  exit 127
fi

if [[ -z "${SLACK_BOT_TOKEN:-}" ]]; then
  ROOK_ENV="/Users/godstemning/dev/rook/.env"
  if [[ -r "$ROOK_ENV" ]]; then
    SLACK_BOT_TOKEN="$(${PYTHON:-python3} - <<'PY'
from pathlib import Path
key = 'SLACK_' + 'BOT_TOKEN'
for line in Path('/Users/godstemning/dev/rook/.env').read_text().splitlines():
    if line.startswith(key + '='):
        print(line.split('=', 1)[1].strip().strip('"').strip("'"))
        break
PY
)"
    export SLACK_BOT_TOKEN
  fi
fi
if [[ -z "${SLACK_BOT_TOKEN:-}" ]]; then
  echo "SLACK_BOT_TOKEN is required because harness.config.json enables Slack reporting" >&2
  exit 78
fi

pm health >/dev/null
tools/harness/resolve-sdd.sh "$SDD_ID" >/dev/null

echo "Starting harness run-sdd $SDD_ID --mode $MODE"
exec harness run-sdd "$SDD_ID" --config harness.config.json --mode "$MODE"
