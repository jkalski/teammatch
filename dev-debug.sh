#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/teammatch/backend"
FRONTEND_DIR="$ROOT_DIR/teammatch/frontend"

BACKEND_HOST="${BACKEND_HOST:-0.0.0.0}"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_HOST="${FRONTEND_HOST:-0.0.0.0}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"

if [[ -z "${DATABASE_URL:-}" ]]; then
  export DATABASE_URL="sqlite:///$BACKEND_DIR/test_notifications.db"
fi
export POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
export POSTGRES_USER="${POSTGRES_USER:-teammatch}"
export POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-teammatch}"
export POSTGRES_PORT="${POSTGRES_PORT:-5432}"
export POSTGRES_DB="${POSTGRES_DB:-teammatch}"

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is required but not found in PATH."
  exit 1
fi

if command -v python3 >/dev/null 2>&1; then
  PYTHON_BIN="python3"
elif command -v python >/dev/null 2>&1; then
  PYTHON_BIN="python"
else
  echo "Error: python3/python is required but not found in PATH."
  exit 1
fi

BACKEND_PYTHON="$PYTHON_BIN"
if [[ -x "$BACKEND_DIR/.venv/bin/python" ]]; then
  BACKEND_PYTHON="$BACKEND_DIR/.venv/bin/python"
fi

if ! "$BACKEND_PYTHON" -c "import fastapi, uvicorn" >/dev/null 2>&1; then
  if [[ "$BACKEND_PYTHON" == "$PYTHON_BIN" ]]; then
    echo "Backend dependencies missing. Creating local virtual environment..."
    (
      cd "$BACKEND_DIR"
      "$PYTHON_BIN" -m venv .venv
    )
    BACKEND_PYTHON="$BACKEND_DIR/.venv/bin/python"
  fi

  echo "Installing backend dependencies into local virtual environment..."
  (
    cd "$BACKEND_DIR"
    "$BACKEND_PYTHON" -m pip install -r requirements.txt
  )
fi

if ! "$BACKEND_PYTHON" -c "import fastapi, uvicorn" >/dev/null 2>&1; then
  echo "Error: fastapi/uvicorn are still unavailable in the current Python environment."
  echo "Try running manually: cd $BACKEND_DIR && $BACKEND_PYTHON -m pip install -r requirements.txt"
  exit 1
fi

if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
  echo "Frontend dependencies not found. Installing with npm..."
  (
    cd "$FRONTEND_DIR"
    npm install
  )
fi

if [[ ! -x "$FRONTEND_DIR/node_modules/.bin/next" ]]; then
  echo "Error: Next.js CLI was not found after install attempt."
  echo "Try running manually: cd $FRONTEND_DIR && npm install"
  exit 1
fi

BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  echo
  echo "Stopping dev processes..."

  if [[ -n "$FRONTEND_PID" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi

  if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi

  wait 2>/dev/null || true
}

trap cleanup INT TERM EXIT

echo "Starting TeamMatch local dev/debug stack (no Docker)..."
echo "Backend:  http://localhost:$BACKEND_PORT"
echo "Frontend: http://localhost:$FRONTEND_PORT"

(
  cd "$BACKEND_DIR"
  "$BACKEND_PYTHON" -m uvicorn app.main:app \
    --reload \
    --host "$BACKEND_HOST" \
    --port "$BACKEND_PORT" \
    --log-level debug
) &
BACKEND_PID=$!

(
  cd "$FRONTEND_DIR"
  npm run dev -- --hostname "$FRONTEND_HOST" --port "$FRONTEND_PORT"
) &
FRONTEND_PID=$!

wait -n "$BACKEND_PID" "$FRONTEND_PID"
