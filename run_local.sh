#!/usr/bin/env bash
# Start backend and frontend with one command. Backend runs in background; frontend in foreground.
# Stop with Ctrl+C (kills both).

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

# Backend
BACKEND_PID=""
cleanup() {
  if [[ -n "$BACKEND_PID" ]]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

cd backend
if [[ ! -d .venv ]]; then
  python3 -m venv .venv
fi
source .venv/bin/activate
pip install -q -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
cd "$ROOT"

# Give backend a moment to bind
sleep 2

echo ""
echo "Backend  → http://127.0.0.1:8000"
echo "Frontend → http://localhost:5173"
echo ""

# Frontend
cd frontend
if [[ ! -d node_modules ]]; then
  npm install
fi
npm run dev
