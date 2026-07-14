import { act, fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { LogViewerLine } from "./LogViewer.js";
import { expectNoA11yViolations } from "../../test/component-harness.js";
import { LogViewer } from "./LogViewer.js";

const SAMPLE_LINES: LogViewerLine[] = [
	{
		id: "1",
		text: "boot ok",
		level: "info",
		at: "2026-07-13T10:00:00.000Z",
		data: { event: "boot", host: "web-1" },
	},
	{
		id: "2",
		text: "cache miss",
		level: "debug",
		at: "2026-07-13T10:01:00.000Z",
	},
	{
		id: "3",
		text: "apply failed",
		level: "error",
		at: "2026-07-13T10:02:00.000Z",
		data: { event: "apply", reason: "timeout", requestId: "req-9" },
	},
];

describe("LogViewer", () => {
	it("exposes a log region with aria-live off and a status region", () => {
		const { container } = render(
			<LogViewer aria-label="Deploy logs" lines={SAMPLE_LINES} />,
		);

		const log = screen.getByRole("log", { name: "Deploy logs" });
		expect(log).toHaveAttribute("aria-live", "off");
		expect(log).toHaveAttribute("tabindex", "0");
		expect(
			container.querySelector("[data-slot='log-viewer-status']"),
		).toHaveAttribute("role", "status");
		expect(screen.getByText("boot ok")).toBeInTheDocument();
		expect(screen.getByText("apply failed")).toBeInTheDocument();
	});

	it("emits level chrome changes without filtering lines", async () => {
		const user = userEvent.setup();
		const seen: string[][] = [];

		render(
			<LogViewer
				aria-label="Deploy logs"
				lines={SAMPLE_LINES}
				onLevelsChange={(levels) => {
					seen.push(levels);
				}}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "debug" }));
		await user.click(screen.getByRole("button", { name: "info" }));
		await user.click(screen.getByRole("button", { name: "warn" }));
		expect(screen.getByText("boot ok")).toBeInTheDocument();
		expect(screen.getByText("cache miss")).toBeInTheDocument();
		expect(screen.getByText("apply failed")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "error" })).toHaveAttribute(
			"aria-pressed",
			"true",
		);
		expect(seen.length).toBeGreaterThan(0);
	});

	it("commits a query chip from the search form without filtering lines", async () => {
		const user = userEvent.setup();
		const seen: string[][] = [];

		render(
			<LogViewer
				aria-label="Deploy logs"
				lines={SAMPLE_LINES}
				onQueriesChange={(next) => {
					seen.push(next);
				}}
			/>,
		);

		const search = screen.getByRole("searchbox", {
			name: "Filter log text",
		});

		await user.click(search);
		search.focus();
		fireEvent.change(search, { target: { value: "failed" } });

		const form = search.closest("form");
		expect(form).not.toBeNull();
		if (form === null) {
			return;
		}

		fireEvent.submit(form);

		expect(seen.at(-1)).toEqual(["failed"]);
		expect(screen.getByText("apply failed")).toBeInTheDocument();
		expect(screen.getByText("boot ok")).toBeInTheDocument();
	});

	it("dismisses query chips", async () => {
		const user = userEvent.setup();

		render(
			<LogViewer
				aria-label="Deploy logs"
				lines={SAMPLE_LINES}
				defaultQueries={["failed"]}
			/>,
		);

		expect(
			screen.getByRole("button", { name: "Remove failed" }),
		).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Remove failed" }));
		expect(
			screen.queryByRole("button", { name: "Remove failed" }),
		).not.toBeInTheDocument();
		expect(screen.getByText("boot ok")).toBeInTheDocument();
	});

	it("expands and collapses JSON detail for lines with data", async () => {
		const user = userEvent.setup();
		const { container } = render(
			<LogViewer aria-label="Deploy logs" lines={SAMPLE_LINES} />,
		);

		expect(
			screen.queryByRole("button", {
				name: "Toggle details for line 2",
			}),
		).not.toBeInTheDocument();

		const toggle = screen.getByRole("button", {
			name: "Toggle details for line 1",
		});
		expect(toggle).toHaveAttribute("aria-expanded", "false");

		await user.click(toggle);
		expect(toggle).toHaveAttribute("aria-expanded", "true");
		expect(
			container.querySelector("[data-slot='log-viewer-detail']"),
		).toHaveTextContent("web-1");

		await user.click(toggle);
		expect(toggle).toHaveAttribute("aria-expanded", "false");
		expect(
			container.querySelector("[data-slot='log-viewer-detail']"),
		).toBeNull();
	});

	it("truncates to maxLines and announces the window", () => {
		const { container } = render(
			<LogViewer
				aria-label="Deploy logs"
				lines={SAMPLE_LINES}
				maxLines={1}
			/>,
		);

		expect(screen.getByText("apply failed")).toBeInTheDocument();
		expect(screen.queryByText("boot ok")).not.toBeInTheDocument();
		expect(
			container.querySelector("[data-slot='log-viewer-status']"),
		).toHaveTextContent("Showing last 1 of 3");
	});

	it("renders oldest lines first", () => {
		const { container } = render(
			<LogViewer aria-label="Deploy logs" lines={SAMPLE_LINES} />,
		);

		const texts = Array.from(
			container.querySelectorAll("[data-slot='log-viewer-text']"),
		).map((node) => {
			return node.textContent;
		});
		expect(texts).toEqual(["boot ok", "cache miss", "apply failed"]);
	});

	it("shows EmptyState when lines are empty", () => {
		render(<LogViewer aria-label="Deploy logs" lines={[]} />);
		expect(screen.getByText("No log lines")).toBeInTheDocument();
	});

	it("toggles follow and reports pending when paused", () => {
		const follows: boolean[] = [];
		const { rerender } = render(
			<LogViewer
				aria-label="Deploy logs"
				lines={SAMPLE_LINES}
				defaultFollow={false}
				onFollowChange={(value) => {
					follows.push(value);
				}}
			/>,
		);

		expect(screen.getByRole("button", { name: "Follow" })).toHaveAttribute(
			"aria-pressed",
			"false",
		);

		rerender(
			<LogViewer
				aria-label="Deploy logs"
				lines={[
					...SAMPLE_LINES,
					{
						id: "4",
						text: "late",
						level: "info",
						at: "2026-07-13T10:03:00.000Z",
					},
				]}
				defaultFollow={false}
				onFollowChange={(value) => {
					follows.push(value);
				}}
			/>,
		);

		expect(screen.getByText("1 new")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Show new" }),
		).toBeInTheDocument();
	});

	it("renders per-line and visible CopyButton controls", () => {
		render(<LogViewer aria-label="Deploy logs" lines={SAMPLE_LINES} />);

		expect(
			screen.getByRole("button", { name: "Copy visible lines" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Copy line 1" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Copy line 3" }),
		).toBeInTheDocument();
	});

	it("unfollows when the user scrolls away from the bottom", async () => {
		const follows: boolean[] = [];
		render(
			<LogViewer
				aria-label="Deploy logs"
				lines={SAMPLE_LINES}
				follow={true}
				onFollowChange={(value) => {
					follows.push(value);
				}}
			/>,
		);

		await act(async () => {
			await new Promise<void>((resolve) => {
				window.requestAnimationFrame(() => {
					resolve();
				});
			});
		});

		const log = screen.getByRole("log", { name: "Deploy logs" });
		Object.defineProperty(log, "scrollHeight", {
			configurable: true,
			value: 400,
		});
		Object.defineProperty(log, "clientHeight", {
			configurable: true,
			value: 100,
		});
		Object.defineProperty(log, "scrollTop", {
			configurable: true,
			writable: true,
			value: 0,
		});

		fireEvent.scroll(log);
		expect(follows).toEqual([false]);
	});

	it("merges className onto the root", () => {
		const { container } = render(
			<LogViewer
				aria-label="Deploy logs"
				lines={SAMPLE_LINES}
				className="log-extra"
			/>,
		);
		expect(container.querySelector("[data-slot='log-viewer']")).toHaveClass(
			"log-extra",
		);
	});

	it("has no accessibility violations on the default render", async () => {
		await expectNoA11yViolations(
			<LogViewer aria-label="Deploy logs" lines={SAMPLE_LINES} />,
		);
	});
});
