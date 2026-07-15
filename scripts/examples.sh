#!/usr/bin/env bash
set -euo pipefail

# Start Nest examples API, wait for /health, then run Vite examples UI.
# Allocates free TCP ports unless API_PORT / UI_PORT already set.

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GET_PORT="${ROOT}/scripts/get-port.sh"

if [ -z "${API_PORT:-}" ]; then
	API_PORT="$("${GET_PORT}")"
fi
if [ -z "${UI_PORT:-}" ]; then
	UI_PORT="$("${GET_PORT}")"
fi

export API_PORT
export UI_PORT

cd "$ROOT"

echo "Starting examples API on 127.0.0.1:${API_PORT} and Vite on 127.0.0.1:${UI_PORT}..."

API_PORT="${API_PORT}" npm run start:dev --prefix examples/api &
api_pid=$!

cleanup() {
	kill "$api_pid" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

ready=0
for _ in $(seq 1 40); do
	if curl -sf "http://127.0.0.1:${API_PORT}/health" >/dev/null; then
		ready=1
		break
	fi
	# API crashed early (e.g. bind race).
	if ! kill -0 "$api_pid" 2>/dev/null; then
		break
	fi
	sleep 0.25
done

if [ "$ready" -ne 1 ]; then
	echo "examples API did not become healthy on port ${API_PORT}" >&2
	exit 1
fi

API_PORT="${API_PORT}" npm run dev --prefix examples -- \
	--host 127.0.0.1 \
	--port "${UI_PORT}" \
	--strictPort
