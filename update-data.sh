#!/usr/bin/env bash
# update-data.sh
# Convenience wrapper to update CV data from data.json

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR"

if command -v node >/dev/null 2>&1; then
  node scripts/update-data.js "$@"
elif command -v python3 >/dev/null 2>&1; then
  python3 scripts/update_data.py "$@"
else
  echo "Error: Neither Node.js nor Python 3 is installed." >&2
  exit 1
fi
