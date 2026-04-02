#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
NOTIF_DIR="$ROOT_DIR/notification-service"

if ! command -v redis-cli >/dev/null 2>&1; then
  echo "redis-cli not found. Install Redis first: brew install redis"
  exit 1
fi

echo "Starting Redis service..."
brew services start redis >/dev/null 2>&1 || true

if [[ "$(redis-cli ping 2>/dev/null || true)" != "PONG" ]]; then
  echo "Redis is not responding on localhost:6379."
  echo "Try running: brew services restart redis"
  exit 1
fi

echo "Redis is running."

echo "Starting notification service..."
(
  cd "$NOTIF_DIR"
  npm run start:dev
) &
NOTIF_PID=$!

cleanup() {
  echo "Stopping notification service..."
  kill "$NOTIF_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

sleep 2

echo "Starting Weddly app..."
cd "$ROOT_DIR"
npm run dev
