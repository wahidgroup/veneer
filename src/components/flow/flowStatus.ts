import type { FlowPortSide, FlowStatus } from "./flowTypes.js";
import type { StatusBadgeStatus } from "../indicators/StatusBadge.js";

const STATUS_LABEL: Record<FlowStatus, string> = {
	idle: "idle",
	running: "running",
	ok: "ok",
	failed: "failed",
};

/**
 * Human label for a flow status; used in aria-live text and badges.
 */
function statusLabel(status: FlowStatus): string {
	return STATUS_LABEL[status];
}

/**
 * Map flow liveness onto inventory StatusBadge tones (1.4.1: not color-only).
 */
function statusBadgeStatus(status: FlowStatus): StatusBadgeStatus | null {
	if (status === "running") {
		return "running";
	}
	if (status === "ok") {
		return "success";
	}
	if (status === "failed") {
		return "danger";
	}

	return null;
}

/**
 * Read a status from a status map, defaulting to idle when unset.
 */
function resolveStatus(
	map: Record<string, FlowStatus> | undefined,
	id: string,
): FlowStatus {
	if (map === undefined) {
		return "idle";
	}

	const value = map[id];
	if (value === undefined) {
		return "idle";
	}

	return value;
}

/**
 * Local port position on a node. Multiple ports on one side spread evenly.
 * `index` / `count` are among ports sharing that side (0-based).
 */
function portAnchor(
	side: FlowPortSide,
	width: number,
	height: number,
	index = 0,
	count = 1,
): { x: number; y: number } {
	let ratio = 0.5;
	if (count > 1) {
		ratio = (index + 1) / (count + 1);
	}

	if (side === "WEST") {
		return { x: 0, y: height * ratio };
	}
	if (side === "EAST") {
		return { x: width, y: height * ratio };
	}
	if (side === "NORTH") {
		return { x: width * ratio, y: 0 };
	}

	return { x: width * ratio, y: height };
}

/**
 * Index and peer count for a port among others on the same side.
 */
function portSlotOnSide(
	ports: { id: string; side: FlowPortSide }[] | undefined,
	portId: string,
	side: FlowPortSide,
): { index: number; count: number } {
	if (ports === undefined) {
		return { index: 0, count: 1 };
	}

	const peers: string[] = [];
	for (const port of ports) {
		if (port.side === side) {
			peers.push(port.id);
		}
	}

	if (peers.length === 0) {
		return { index: 0, count: 1 };
	}

	let index = peers.indexOf(portId);
	if (index < 0) {
		index = 0;
	}

	return { index, count: peers.length };
}

/**
 * Tailwind ring class for a node shell keyed to its FlowStatus.
 */
function statusRingClass(status: FlowStatus): string {
	if (status === "running") {
		return "ring-2 ring-primary";
	}
	if (status === "ok") {
		return "ring-2 ring-emerald-600";
	}
	if (status === "failed") {
		return "ring-2 ring-destructive";
	}

	return "";
}

export {
	portAnchor,
	portSlotOnSide,
	resolveStatus,
	statusBadgeStatus,
	statusLabel,
	statusRingClass,
};
