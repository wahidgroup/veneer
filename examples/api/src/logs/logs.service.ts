import { Injectable, OnModuleDestroy } from "@nestjs/common";

import type { LogFilter, LogLevel, LogLine } from "./log-types.js";
import { matchLogLine } from "./log-types.js";

const BUFFER_CAP = 1000;

const SEED: LogLine[] = [
	{
		id: "seed-1",
		text: "planner: loading stack state",
		level: "info",
		at: "2026-07-13T18:00:00.000Z",
		data: {
			component: "planner",
			action: "load_state",
			stack: "prod-edge",
		},
	},
	{
		id: "seed-2",
		text: "planner: 12 resources in plan",
		level: "debug",
		at: "2026-07-13T18:00:01.000Z",
		data: {
			component: "planner",
			resourceCount: 12,
			requestId: "plan-a1",
		},
	},
	{
		id: "seed-3",
		text: "apply: aws_vpc.main create complete",
		level: "info",
		at: "2026-07-13T18:00:02.000Z",
		data: {
			component: "apply",
			resource: "aws_vpc.main",
			status: "created",
		},
	},
];

const STREAM_TEMPLATES: {
	text: string;
	level: LogLevel;
	data: Record<string, unknown>;
}[] = [
	{
		text: "apply: aws_subnet.public create",
		level: "info",
		data: { resource: "aws_subnet.public", status: "creating" },
	},
	{
		text: "apply: waiting on dependency",
		level: "debug",
		data: { waitFor: "aws_vpc.main", elapsedMs: 1200 },
	},
	{
		text: "apply: aws_instance.web create",
		level: "info",
		data: { resource: "aws_instance.web", instanceType: "t3.small" },
	},
	{
		text: "health: probe timeout",
		level: "warn",
		data: { probe: "http", target: "web", timeoutMs: 5000 },
	},
	{
		text: "apply: retrying instance create",
		level: "warn",
		data: { resource: "aws_instance.web", attempt: 2 },
	},
	{
		text: "apply: aws_lb.app create complete",
		level: "info",
		data: { resource: "aws_lb.app", status: "created" },
	},
	{
		text: "apply: error attaching target group",
		level: "error",
		data: {
			resource: "aws_lb_target_group.app",
			errorCode: "InvalidTarget",
		},
	},
	{
		text: "apply: stack complete with errors",
		level: "error",
		data: { status: "failed", errorCount: 1 },
	},
];

type LineListener = (line: LogLine) => void;

@Injectable()
export class LogsService implements OnModuleDestroy {
	private lines: LogLine[] = SEED.map((line) => {
		return { ...line };
	});
	private streaming = false;
	private streamIndex = 0;
	private clockMs = Date.parse("2026-07-13T18:00:02.000Z");
	private timer: ReturnType<typeof setInterval> | null = null;
	private readonly listeners = new Set<LineListener>();

	onModuleDestroy(): void {
		this.stopStream();
	}

	getLines(): LogLine[] {
		return [...this.lines];
	}

	isStreaming(): boolean {
		return this.streaming;
	}

	filterLines(filter: LogFilter): LogLine[] {
		return this.lines.filter((line) => {
			return matchLogLine(line, filter);
		});
	}

	subscribeLines(listener: LineListener): () => void {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	startStream(): { streaming: boolean } {
		if (this.streaming) {
			return { streaming: true };
		}

		this.streaming = true;
		this.timer = setInterval(() => {
			this.appendNext();
		}, 900);

		return { streaming: true };
	}

	stopStream(): { streaming: boolean } {
		this.streaming = false;
		if (this.timer !== null) {
			clearInterval(this.timer);
			this.timer = null;
		}

		return { streaming: false };
	}

	reset(): { streaming: boolean; count: number } {
		this.stopStream();
		this.streamIndex = 0;
		this.clockMs = Date.parse("2026-07-13T18:00:02.000Z");
		this.lines = SEED.map((line) => {
			return { ...line };
		});

		return { streaming: false, count: this.lines.length };
	}

	append(line: LogLine): void {
		this.lines = [...this.lines, line];
		if (this.lines.length > BUFFER_CAP) {
			this.lines = this.lines.slice(this.lines.length - BUFFER_CAP);
		}

		for (const listener of this.listeners) {
			listener(line);
		}
	}

	private appendNext(): void {
		const template = STREAM_TEMPLATES[this.streamIndex % STREAM_TEMPLATES.length];
		const index = this.streamIndex;
		this.streamIndex = index + 1;
		this.clockMs += 1000;

		this.append({
			id: `stream-${String(index)}`,
			text: template.text,
			level: template.level,
			at: new Date(this.clockMs).toISOString(),
			data: template.data,
		});
	}
}

export { BUFFER_CAP };
