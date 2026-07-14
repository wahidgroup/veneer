#!/usr/bin/env bash
set -euo pipefail

# Start Nest examples API, wait for /health, then run Vite examples UI.

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API_PORT="${API_PORT:-8787}"

cd "$ROOT"

echo "Starting examples API on ${API_PORT} and Vite..."

API_PORT="${API_PORT}" npm run start --prefix examples/api &
api_pid=$!

cleanup() {
	kill "$api_pid" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

ready=0
for _ in $(seq 1 20); do
	if curl -sf "http://127.0.0.1:${API_PORT}/health" >/dev/null; then
		ready=1
		break
	fi
	sleep 0.5
done

if [ "$ready" -ne 1 ]; then
	echo "examples API did not become healthy on port ${API_PORT}" >&2
	exit 1
fi

API_PORT="${API_PORT}" npm run dev --prefix examples -- --host 127.0.0.1
