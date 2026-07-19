#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAMP_DIR="$ROOT/.make"
SETUP_HASH_FILE="$STAMP_DIR/setup.hash"

# GitHub Actions sets CI=true; prefer lockfile-faithful installs there.
NPM_INSTALL_CMD=install
if [ "${CI:-}" = "true" ] || [ "${CI:-}" = "1" ]; then
	NPM_INSTALL_CMD=ci
fi

compute_setup_hash() {
	shasum -a 256 \
		"$ROOT/package.json" \
		"$ROOT/package-lock.json" \
		"$ROOT/examples/package.json" \
		"$ROOT/examples/package-lock.json" \
		"$ROOT/examples/api/package.json" \
		"$ROOT/examples/api/package-lock.json" \
		"$ROOT/examples/api/openapi.json" \
		"$ROOT/tests/package.json" \
		"$ROOT/tests/package-lock.json" \
		2>/dev/null \
		| shasum -a 256 \
		| awk '{ print $1 }'
}

setup_required() {
	if [ ! -d "$ROOT/node_modules" ]; then
		return 0
	fi
	if [ ! -d "$ROOT/examples/node_modules" ]; then
		return 0
	fi
	if [ ! -d "$ROOT/examples/api/node_modules" ]; then
		return 0
	fi
	if [ ! -d "$ROOT/tests/node_modules" ]; then
		return 0
	fi
	if [ ! -f "$SETUP_HASH_FILE" ]; then
		return 0
	fi

	local current_hash
	local saved_hash=""
	current_hash="$(compute_setup_hash)"
	saved_hash="$(tr -d '\n' < "$SETUP_HASH_FILE")"
	if [ "$current_hash" != "$saved_hash" ]; then
		return 0
	fi

	return 1
}

npm_install_tree() {
	local prefix="$1"
	echo "Installing dependencies in ${prefix} (npm ${NPM_INSTALL_CMD})..."
	# shellcheck disable=SC2086
	npm --prefix "$prefix" "${NPM_INSTALL_CMD}" ${NPM_INSTALL_FLAGS:-}
}

main() {
	mkdir -p "$STAMP_DIR"

	if setup_required; then
		npm_install_tree "$ROOT"
		npm_install_tree "$ROOT/examples"
		npm_install_tree "$ROOT/examples/api"
		mkdir -p "$ROOT/tests"
		npm_install_tree "$ROOT/tests"

		echo "Installing Playwright chromium..."
		(cd "$ROOT/tests" && npx playwright install --with-deps chromium)

		compute_setup_hash > "$SETUP_HASH_FILE"
		echo "Setup complete."
	else
		echo "Setup already up to date."
	fi

	echo "Generating examples API client types..."
	npm run generate-types --prefix "$ROOT/examples/api"
}

main "$@"
