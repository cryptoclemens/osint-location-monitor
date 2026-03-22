#!/bin/bash
set -euo pipefail

# Only run in remote (web) sessions
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo "==> Installing Node.js dependencies..."
cd "$CLAUDE_PROJECT_DIR"
npm install

echo "==> Installing Python dependencies..."
pip install -q -r scripts/requirements.txt

echo "==> Session setup complete."
