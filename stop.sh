#!/usr/bin/env bash

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$ROOT_DIR/backend/data/mongod.pid"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()    { echo -e "${GREEN}[where-to]${NC} $*"; }
warning() { echo -e "${YELLOW}[where-to]${NC} $*"; }

warning "Stopping all where-to services …"

pkill -f "nodemon src/server.js" 2>/dev/null && info "Backend stopped."  || true
pkill -f "node src/server.js"    2>/dev/null || true
pkill -f "nuxt dev"              2>/dev/null && info "Frontend stopped." || true

if [ -f "$PID_FILE" ]; then
  MONGO_PID=$(cat "$PID_FILE")
  if kill -0 "$MONGO_PID" 2>/dev/null; then
    kill "$MONGO_PID" && info "MongoDB stopped (pid $MONGO_PID)."
  else
    warning "MongoDB was not running."
  fi
  rm -f "$PID_FILE"
else
  pkill -f "mongod --config" 2>/dev/null && info "MongoDB stopped." || warning "MongoDB was not running."
fi

info "Done."
