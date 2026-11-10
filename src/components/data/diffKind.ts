import type { DiffChangeKind } from "./diffTypes.js";

function badgeVariantForKind(kind: DiffChangeKind): "success" | "info" | "danger" | "warning" {
	if (kind === "create") {
		return "success";
	}
	if (kind === "update") {
		return "info";
	}
	if (kind === "destroy") {
		return "danger";
	}

	return "warning";
}

function labelForKind(kind: DiffChangeKind): string {
	if (kind === "create") {
		return "Create";
	}
	if (kind === "update") {
		return "Update";
	}
	if (kind === "destroy") {
		return "Destroy";
	}

	return "Replace";
}

export { badgeVariantForKind, labelForKind };
