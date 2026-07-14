.PHONY: all help help-body help-ref version setup lint test build audit spellcheck sbom smoke pack ci release clean clean-dist examples examples-build generate-api generate-api-types

.NOTPARALLEL: ci

.DEFAULT_GOAL := all

PROJECT := veneer
PKG_VERSION := $(shell node -p "require('./package.json').version" 2>/dev/null)
GIT_COMMIT := $(shell git rev-parse --short HEAD 2>/dev/null)
GIT_DIRTY := $(shell test -n "$$(git status --porcelain 2>/dev/null)" && echo "+dirty")

define PRINT_PAGER
@{ $(1); } | less -FRX
endef

ifneq ($(strip $(fix)),)
LINT_MODE := fix
else
LINT_MODE := check
endif

AUDIT_MODE := $(LINT_MODE)

ifneq ($(filter 1,$(debug)),)
export LOG_LEVEL = debug
endif

RELEASE_FLAGS :=
ifneq ($(filter 1,$(dry-run)),)
RELEASE_FLAGS += --dry-run
endif
ifneq ($(filter 1,$(allow-staged)),)
RELEASE_FLAGS += --allow-staged
endif
ifneq ($(filter 1,$(yank)),)
RELEASE_FLAGS += --yank
endif

ifdef CI
NPM_INSTALL_CMD := npm ci
else
NPM_INSTALL_CMD := npm install
endif

API_PORT ?= 8787
export API_PORT

help:
	$(call PRINT_PAGER,$(MAKE) help-body)

help-body:
	@printf 'USAGE:\n'
	@printf '    make <target> [fix=1] [debug=1] [VERSION=vX.Y.Z] [dry-run=1] [allow-staged=1] [yank=1]\n\n'
	@printf 'DESCRIPTION:\n'
	@printf '    Build, test, lint, and release %s following POSIX/GNU CLI conventions.\n\n' '$(PROJECT)'
	@printf 'TARGETS:\n'
	@printf '    help           Show this help and exit\n'
	@printf '    help-ref       Show reference documentation links\n'
	@printf '    version        Show project version information\n'
	@printf '    setup          Install kit + examples + API + Playwright + API types\n'
	@printf '    lint           Run linters + spellcheck (fix mode via fix=1)\n'
	@printf '    test           Kit + API Vitest, generate API types, Playwright\n'
	@printf '    build          Build for production\n'
	@printf '    smoke          Smoke-load built package exports\n'
	@printf '    pack           Assert npm pack contents (minimal + sbom)\n'
	@printf '    audit          Run security audit (fix mode via fix=1)\n'
	@printf '    spellcheck     Run spell checker\n'
	@printf '    sbom           Generate software bill of materials\n'
	@printf '    ci             Lint + build + test + examples-build + smoke + pack\n'
	@printf '    release        Release workflow (see OPTIONS)\n'
	@printf '    generate-api   Refresh OpenAPI spec + examples client types\n'
	@printf '    examples       Run Nest API + Vite examples\n'
	@printf '    examples-build Production build of examples/\n'
	@printf '    clean-dist     Remove dist and artifacts\n'
	@printf '    clean          Remove dist, artifacts, and node_modules\n\n'
	@printf 'OPTIONS / VARIABLES:\n'
	@printf '    fix            If set (e.g., fix=1), apply lint/audit fixes\n'
	@printf '    debug          If set (e.g., debug=1), enable debug logs for tests\n'
	@printf '    VERSION        Release version (e.g., VERSION=v0.2.0)\n'
	@printf '    dry-run        If set (e.g., dry-run=1), preview release without changes\n'
	@printf '    allow-staged   If set (e.g., allow-staged=1), include staged files in release\n'
	@printf '    yank           If set (e.g., yank=1), yank a published version\n'
	@printf '    API_PORT       Examples API port (default 8787)\n'
	@printf '    NPM_INSTALL_FLAGS  Extra flags for npm install/ci\n\n'
	@printf 'EXAMPLES:\n'
	@printf '    make setup\n'
	@printf '    make examples\n'
	@printf '    make generate-api\n'
	@printf '    make lint\n'
	@printf '    make lint fix=1\n'
	@printf '    make test debug=1\n'
	@printf '    make audit fix=1\n'
	@printf '    make release VERSION=v0.2.0\n\n'
	@printf 'EXIT STATUS:\n'
	@printf '    0    Success\n'
	@printf '    >0   Error occurred\n\n'

help-ref:
	@printf 'REFERENCES:\n'
	@printf '    GNU CLI Guidelines: https://www.gnu.org/prep/standards/html_node/Command_002dLine-Interfaces.html\n'
	@printf '    POSIX Utility Syntax: https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html\n'
	@printf '    GNU Make Goals: https://www.gnu.org/software/make/manual/html_node/Goals.html\n\n'

version:
	@v='$(PKG_VERSION)'; c='$(GIT_COMMIT)'; d='$(GIT_DIRTY)'; [ -n "$$v" ] || v=unknown; \
	printf '%s %s (%s%s)\n' '$(PROJECT)' "$$v" "$$c" "$$d"

node_modules: package.json package-lock.json
	$(NPM_INSTALL_CMD) $(NPM_INSTALL_FLAGS)
	@touch $@

setup:
	@chmod +x scripts/setup.sh scripts/get-port.sh
	@./scripts/setup.sh

all: setup build

lint: node_modules
	@echo "Running linters (mode: $(LINT_MODE))..."
ifeq ($(LINT_MODE),fix)
	npm run format
	npm run lint -- --fix
	npm run lint --prefix examples/api -- --fix
else
	npm run format:check
	npm run lint
	npm run lint --prefix examples/api
endif
	npm run spellcheck

test: node_modules
	@echo "Running kit tests..."
	npm run test
	@echo "Running examples API tests..."
	npm run test --prefix examples/api
	@echo "Generating examples API client types..."
	npm run generate-types --prefix examples/api
	@echo "Running Playwright smoke..."
	npm run test --prefix tests

build: node_modules
	@echo "Building..."
	npm run build

smoke: build
	@echo "Smoking built exports..."
	@test -f dist/index.js || (echo "dist/index.js missing after build"; exit 1)
	npm run smoke

audit: node_modules
	@echo "Running security audit (mode: $(AUDIT_MODE))..."
ifeq ($(AUDIT_MODE),fix)
	npm audit fix
else
	npm audit --audit-level=high
endif

spellcheck: node_modules
	@echo "Checking spelling..."
	npm run spellcheck

sbom: node_modules
	@echo "Generating SBOM..."
	npm run sbom

pack: build sbom
	@echo "Checking npm pack contents..."
	npm run pack:check

ci:
	$(MAKE) lint
	$(MAKE) build
	$(MAKE) test
	$(MAKE) examples-build
	$(MAKE) smoke
	$(MAKE) pack

release: node_modules
	@./scripts/release.sh "$(VERSION)" $(RELEASE_FLAGS)

generate-api:
	@echo "Refreshing OpenAPI spec + examples client types..."
	npm run generate-openapi --prefix examples/api

examples: generate-api-types
	@echo "Starting examples API on $(API_PORT) and Vite..."
	@API_PORT=$(API_PORT) npm run start --prefix examples/api & \
		api_pid=$$!; \
		trap 'kill $$api_pid 2>/dev/null || true' EXIT INT TERM; \
		for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20; do \
			if curl -sf "http://127.0.0.1:$(API_PORT)/health" >/dev/null; then break; fi; \
			sleep 0.5; \
		done; \
		API_PORT=$(API_PORT) npm run dev --prefix examples

examples-build: generate-api-types
	@echo "Building examples..."
	npm run build --prefix examples

generate-api-types:
	@echo "Generating examples API client types from openapi.json..."
	npm run generate-types --prefix examples/api

clean-dist:
	rm -rf dist artifacts sbom.json examples/dist examples/api/dist

clean: clean-dist
	rm -rf node_modules examples/node_modules examples/api/node_modules tests/node_modules .make
