#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
  # Hermes/non-interactive PATH can pick up system Node 18; this project needs Node 20+.
  # Prefer Terje's current shell default when available.
  export NVM_DIR="$HOME/.nvm"
  # shellcheck disable=SC1090
  source "$NVM_DIR/nvm.sh"
  nvm use --silent default >/dev/null
fi

exec node "$SCRIPT_DIR/web-ui-smoke.mjs" "$@"
