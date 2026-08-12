#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "Iniciando backend y frontend..."
(
  npm --prefix backend run dev
) &
BACKEND_PID=$!
(
  npm --prefix frontend run dev
) &
FRONTEND_PID=$!

trap 'kill $BACKEND_PID $FRONTEND_PID' EXIT
wait "$BACKEND_PID" "$FRONTEND_PID"
