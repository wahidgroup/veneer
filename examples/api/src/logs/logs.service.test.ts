import { describe, expect, it } from "vitest";

import { BUFFER_CAP, LogsService } from "./logs.service.js";

describe("LogsService", () => {
	it("drops oldest lines when the buffer exceeds the cap", () => {
		const logs = new LogsService();
		logs.reset();

		for (let index = 0; index < BUFFER_CAP + 5; index += 1) {
			logs.append({
				id: `line-${String(index)}`,
				text: `row ${String(index)}`,
				level: "info",
				at: "2026-07-13T18:00:00.000Z",
			});
		}

		const lines = logs.getLines();
		expect(lines).toHaveLength(BUFFER_CAP);
		expect(lines[0]).toEqual(expect.objectContaining({ id: "line-5" }));
		expect(lines[BUFFER_CAP - 1]).toEqual(
			expect.objectContaining({
				id: `line-${String(BUFFER_CAP + 4)}`,
			}),
		);
	});
});
