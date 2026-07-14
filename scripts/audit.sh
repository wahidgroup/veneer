#!/usr/bin/env bash
set -euo pipefail

# Audit every npm package in the repo (root + examples + API + e2e).
# Mode: AUDIT_MODE=fix runs `npm audit fix`; otherwise `npm audit --audit-level=high`.

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MODE="${AUDIT_MODE:-check}"
PREFIXES=(. examples examples/api tests)

cd "$ROOT"

echo "Running security audit (mode: ${MODE})..."

for prefix in "${PREFIXES[@]}"; do
	echo "Auditing ${prefix}..."
	if [ "$MODE" = "fix" ]; then
		npm audit fix --prefix "$prefix"
	else
		npm audit --audit-level=high --prefix "$prefix"
	fi
done
