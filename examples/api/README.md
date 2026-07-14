# Examples API

In-memory NestJS control plane for Veneer demos. No database.

## Run

Root Makefile owns lifecycle:

- `make setup` - install this package + Playwright chromium; generate client types
- `make examples` - Nest API + Vite together (types from committed `openapi.json`)
- `make generate-api` - Nest exports `openapi.json` + regenerates `api.d.ts` (commit the JSON)
- `make lint` - includes Nest ESLint (`base` + `nestjs` + `strict`)
- `make test` - API Vitest + regenerate client types + Playwright

`examples/src/api/types/api.d.ts` is generated (gitignored). Commit `examples/api/openapi.json`.

## HTTP

Success bodies use envelope `{ data, meta? }`. Pagination lives under `meta.pagination`.

| Method | Path                    | Purpose              |
| ------ | ----------------------- | -------------------- |
| GET    | `/health`               | Readiness gate       |
| GET    | `/v1/logs/stream`       | Stream ticker status |
| POST   | `/v1/logs/stream/start` | Start log ticker     |
| POST   | `/v1/logs/stream/stop`  | Stop ticker          |
| POST   | `/v1/logs/stream/reset` | Reseed + stop        |
| GET    | `/v1/tables/:id`        | Paginated rows       |
| POST   | `/v1/tables/:id/rows`   | Append rows          |
| POST   | `/v1/tables/:id/reset`  | Reseed table         |

Log buffer hard-caps at 1000 lines (drop oldest).

## WebSocket

Path `/v1/logs` (outside OpenAPI). Client sends:

```json
{
	"type": "subscribe",
	"levels": ["info"],
	"queries": ["apply"],
	"from": "",
	"to": ""
}
```

Server replies with `snapshot` then `line` events for matching appends. Query chips match with OR.
