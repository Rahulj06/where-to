#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
MONGOD_BIN="$(which mongod 2>/dev/null || echo '')"
PID_FILE="$BACKEND_DIR/data/mongod.pid"
DATA_DIR="$BACKEND_DIR/data/db"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()    { echo -e "${GREEN}[where-to]${NC} $*"; }
warning() { echo -e "${YELLOW}[where-to]${NC} $*"; }
error()   { echo -e "${RED}[where-to]${NC} $*"; exit 1; }

[ -z "$MONGOD_BIN" ] && error "mongod not found in PATH."
[ ! -d "$DATA_DIR" ] && mkdir -p "$DATA_DIR"

# ── 1. Start MongoDB ──────────────────────────────────────────────────────────
if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  warning "MongoDB already running (pid $(cat "$PID_FILE"))"
else
  info "Starting MongoDB (data: backend/data/db) …"
  cd "$BACKEND_DIR"
  "$MONGOD_BIN" --config ./mongod.conf >> ./data/mongod.log 2>&1 &
  MONGO_PID=$!
  echo $MONGO_PID > "$PID_FILE"
  cd "$ROOT_DIR"

  # Wait for MongoDB to accept connections (up to 20 s)
  info "Waiting for MongoDB to be ready …"
  for i in $(seq 1 20); do
    if node -e "
      const net = require('net');
      const s = net.createConnection(27017, '127.0.0.1');
      s.on('connect', () => { s.destroy(); process.exit(0); });
      s.on('error',   () => process.exit(1));
    " 2>/dev/null; then
      info "MongoDB is ready."
      break
    fi
    sleep 1
  done
fi

# ── 2. Seed database (idempotent) ─────────────────────────────────────────────
info "Seeding database …"
cd "$BACKEND_DIR" && npm run seed 2>&1
cd "$ROOT_DIR"

# ── 3. Start backend ──────────────────────────────────────────────────────────
info "Starting backend on http://localhost:3001 …"
cd "$BACKEND_DIR" && npm run dev &
BACKEND_PID=$!
cd "$ROOT_DIR"

# ── 4. Start frontend ─────────────────────────────────────────────────────────
info "Starting frontend on http://localhost:3000 …"
cd "$FRONTEND_DIR" && NUXT_TELEMETRY_DISABLED=1 npm run dev &
FRONTEND_PID=$!
cd "$ROOT_DIR"

info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info "  Frontend  →  http://localhost:3000"
info "  Backend   →  http://localhost:3001"
info "  MongoDB   →  127.0.0.1:27017"
info "  Data dir  →  backend/data/db"
info "  Press Ctrl+C to stop everything."
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cleanup() {
  echo ""
  warning "Shutting down …"
  kill "$BACKEND_PID"  2>/dev/null || true
  kill "$FRONTEND_PID" 2>/dev/null || true
  if [ -f "$PID_FILE" ]; then
    kill "$(cat "$PID_FILE")" 2>/dev/null || true
    rm -f "$PID_FILE"
  fi
  info "All services stopped."
}
trap cleanup SIGINT SIGTERM

wait "$BACKEND_PID" "$FRONTEND_PID"
