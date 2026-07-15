# Flow canvas (`@wahidgroup/veneer/flow`)

## Phase 0 spike notes

**Verdict:** proceed to ship `/flow`. Kill criteria not met — pan/zoom (CSS transform), fitView, screenToFlowPosition, multi-port elk layout, roving Navigate focus, Edit-node Esc, status region, and sidecar list all work without adopting xyflow.

### Proven

- Hybrid HTML nodes + SVG edges inside `GraphViewport`
- `layoutGraph` on `@wahidgroup/veneer/flow/layout` (elk peer isolated from canvas entry)
- Polite `role="status"` + throttle + `StatusBadge` chips
- Composite widget: node shells are `role="group"` (not nested buttons); handles stay Buttons
- Connect via source then target `GraphHandle` clicks; rejected links announce via status text
- Delete/Backspace removes the selected node and incident edges when `onEdgesChange` is wired
- Multi-port sides spread evenly; edges attach per port slot
- WEST/NORTH = target handles; EAST/SOUTH = source handles
- `FlowValueKind` is `"string" | "number"` in v1 (breaking change to widen)

### Deferred

- MiniMap widget (plan Phase 2 polish; not required for tbd-flow parity checklist yet)
- Drag-to-connect rubber-band line while connecting
- Spatial nearest-neighbor arrow keys (currently index order)
- Dedicated edge selection (delete currently targets selected nodes)

### Pointer model

CSS `translate` + `scale` on a world layer (not scroll container).

### Examples playground

`examples` FlowCanvas demo is API-driven (`GET/POST /v1/flows/demo*`): deposits **accumulate** until reset; split runs when `total > minAmount`; typed port-to-port edges (`sameValueKindConnection`). Canvas seeds locally if the API is down and surfaces load/mutation errors in an Alert.
