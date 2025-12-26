#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

start_service() {
  local name="$1"
  local rel_path="$2"
  (
    cd "$ROOT_DIR/$rel_path"
    echo "Starting $name..."
    npm start
  ) &
}

start_service "auth-service (port 4001)" "services/auth-service"
start_service "workspace-service (port 4002)" "services/workspace-service"
start_service "page-service (port 4003)" "services/page-service"
start_service "api-gateway (port 4000)" "services/api-gateway"

echo "All services started. Press Ctrl+C to stop."
wait

