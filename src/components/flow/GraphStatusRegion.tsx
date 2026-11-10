import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import type { FlowStatus } from "./flowTypes.js";
import { VisuallyHidden } from "../a11y/VisuallyHidden.js";
import { StatusBadge } from "../indicators/StatusBadge.js";
import { statusBadgeStatus, statusLabel } from "./flowStatus.js";

interface GraphStatusRegionProps {
	message: string;
	nodeStatuses?: Record<string, FlowStatus>;
	throttleMs?: number;
}

/**
 * Polite status region for flow liveness (WCAG 2.2 SC 4.1.3). Throttles chatter.
 */
function GraphStatusRegion({ message, nodeStatuses, throttleMs = 800 }: GraphStatusRegionProps) {
	const [announced, setAnnounced] = useState(message);
	const lastAt = useRef(0);
	const pending = useRef<string | null>(null);
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		const now = Date.now();
		const elapsed = now - lastAt.current;
		if (elapsed >= throttleMs) {
			lastAt.current = now;

			setAnnounced(message);

			return;
		}

		pending.current = message;

		if (timer.current !== null) {
			return;
		}

		timer.current = setTimeout(() => {
			timer.current = null;
			if (pending.current === null) {
				return;
			}

			lastAt.current = Date.now();

			setAnnounced(pending.current);

			pending.current = null;
		}, throttleMs - elapsed);

		return () => {
			if (timer.current !== null) {
				clearTimeout(timer.current);

				timer.current = null;
			}
		};
	}, [message, throttleMs]);

	const badges: ReactNode[] = [];
	if (nodeStatuses !== undefined) {
		for (const [id, status] of Object.entries(nodeStatuses)) {
			const badgeStatus = statusBadgeStatus(status);
			if (badgeStatus === null) {
				continue;
			}
			badges.push(
				<StatusBadge key={id} status={badgeStatus}>
					{id}: {statusLabel(status)}
				</StatusBadge>,
			);
		}
	}

	let badgeRow: ReactNode = null;
	if (badges.length > 0) {
		badgeRow = <div className="flex flex-wrap gap-1">{badges}</div>;
	}

	return (
		<div data-slot="graph-status-region" role="status" aria-live="polite" className="flex flex-col gap-2">
			<VisuallyHidden>{announced}</VisuallyHidden>
			<p className="text-xs text-muted-foreground">{announced}</p>
			{badgeRow}
		</div>
	);
}

/**
 * Compose a polite-region status line from node + edge status maps.
 * Non-idle entries only; returns "Graph idle" when nothing is active.
 */
function buildStatusMessage(
	nodeStatuses: Record<string, FlowStatus> | undefined,
	edgeStatuses: Record<string, FlowStatus> | undefined,
): string {
	const parts: string[] = [];
	if (nodeStatuses !== undefined) {
		for (const [id, status] of Object.entries(nodeStatuses)) {
			if (status === "idle") {
				continue;
			}

			parts.push(`Node ${id} ${statusLabel(status)}`);
		}
	}
	if (edgeStatuses !== undefined) {
		for (const [id, status] of Object.entries(edgeStatuses)) {
			if (status === "idle") {
				continue;
			}

			parts.push(`Edge ${id} ${statusLabel(status)}`);
		}
	}

	if (parts.length === 0) {
		return "Graph idle";
	}

	return parts.join(". ");
}

export type { GraphStatusRegionProps };
export { GraphStatusRegion, buildStatusMessage };
