import { BadRequestException, Injectable } from "@nestjs/common";

import type {
	FlowDemoEdge,
	FlowDemoNode,
	FlowDemoRun,
	FlowDemoSnapshot,
} from "./flow-types.js";
import {
	DEFAULT_MIN_AMOUNT,
	MAX_ADDRESS_LENGTH,
	MAX_DEPOSIT_AMOUNT,
	MAX_MIN_AMOUNT,
} from "./flow-types.js";

function emptyRun(): FlowDemoRun {
	return {
		runId: null,
		nodeStates: {},
		outputsByNode: {},
		message: "No run yet",
	};
}

function seedNodes(): FlowDemoNode[] {
	return [
		{
			id: "account-listener",
			label: "Account listener",
			fields: [
				{
					id: "amount",
					label: "Amount",
					kind: "number",
					direction: "out",
				},
				{
					id: "address",
					label: "Address",
					kind: "string",
					direction: "out",
				},
			],
			config: {},
		},
		{
			id: "split-half",
			label: "Split half",
			fields: [
				{
					id: "amount",
					label: "Amount",
					kind: "number",
					direction: "in",
				},
				{
					id: "address",
					label: "Address",
					kind: "string",
					direction: "in",
				},
				{
					id: "halfA",
					label: "Half A",
					kind: "number",
					direction: "out",
				},
				{
					id: "halfB",
					label: "Half B",
					kind: "number",
					direction: "out",
				},
				{
					id: "dust",
					label: "Dust",
					kind: "number",
					direction: "out",
				},
				{
					id: "addressOut",
					label: "Address",
					kind: "string",
					direction: "out",
				},
			],
			config: { minAmount: DEFAULT_MIN_AMOUNT },
		},
		{
			id: "send-a",
			label: "Send payee A",
			fields: [
				{
					id: "amount",
					label: "Amount",
					kind: "number",
					direction: "in",
				},
				{
					id: "txid",
					label: "Tx id",
					kind: "string",
					direction: "out",
				},
			],
			config: {},
		},
		{
			id: "send-b",
			label: "Send payee B",
			fields: [
				{
					id: "amount",
					label: "Amount",
					kind: "number",
					direction: "in",
				},
				{
					id: "txid",
					label: "Tx id",
					kind: "string",
					direction: "out",
				},
			],
			config: {},
		},
		{
			id: "return-dust",
			label: "Return dust",
			fields: [
				{
					id: "amount",
					label: "Dust",
					kind: "number",
					direction: "in",
				},
				{
					id: "address",
					label: "Address",
					kind: "string",
					direction: "in",
				},
				{
					id: "txid",
					label: "Tx id",
					kind: "string",
					direction: "out",
				},
			],
			config: {},
		},
	];
}

function seedEdges(): FlowDemoEdge[] {
	return [
		{
			id: "e-amt",
			source: "account-listener",
			target: "split-half",
			sourcePort: "amount",
			targetPort: "amount",
			valueKind: "number",
		},
		{
			id: "e-addr",
			source: "account-listener",
			target: "split-half",
			sourcePort: "address",
			targetPort: "address",
			valueKind: "string",
		},
		{
			id: "e-a",
			source: "split-half",
			target: "send-a",
			sourcePort: "halfA",
			targetPort: "amount",
			valueKind: "number",
		},
		{
			id: "e-b",
			source: "split-half",
			target: "send-b",
			sourcePort: "halfB",
			targetPort: "amount",
			valueKind: "number",
		},
		{
			id: "e-dust-amt",
			source: "split-half",
			target: "return-dust",
			sourcePort: "dust",
			targetPort: "amount",
			valueKind: "number",
		},
		{
			id: "e-dust-addr",
			source: "split-half",
			target: "return-dust",
			sourcePort: "addressOut",
			targetPort: "address",
			valueKind: "string",
		},
	];
}

/**
 * Integer half-split: halves floor; dust is remainder (0 or 1).
 */
export function splitAmount(amount: number): {
	halfA: number;
	halfB: number;
	dust: number;
} {
	const halfA = Math.floor(amount / 2);
	const halfB = Math.floor(amount / 2);
	const dust = amount - halfA - halfB;
	return { halfA, halfB, dust };
}

@Injectable()
export class FlowsService {
	private nodes = seedNodes();
	private edges = seedEdges();
	private run = emptyRun();
	private runSeq = 0;
	/** Cumulative deposit total since last reset. */
	private deposited = 0;

	getDemo(): FlowDemoSnapshot {
		return {
			nodes: this.nodes.map((node) => {
				return {
					...node,
					fields: [...node.fields],
					config: { ...node.config },
				};
			}),
			edges: this.edges.map((edge) => {
				return { ...edge };
			}),
			run: {
				...this.run,
				nodeStates: { ...this.run.nodeStates },
				outputsByNode: Object.fromEntries(
					Object.entries(this.run.outputsByNode).map(
						([id, fields]) => {
							return [id, { ...fields }];
						},
					),
				),
			},
		};
	}

	reset(): FlowDemoSnapshot {
		this.nodes = seedNodes();
		this.edges = seedEdges();
		this.run = emptyRun();
		this.deposited = 0;
		return this.getDemo();
	}

	patchNodeConfig(
		nodeId: string,
		config: Record<string, number | string>,
	): FlowDemoSnapshot {
		const allowedIds = new Set([
			"account-listener",
			"split-half",
			"send-a",
			"send-b",
			"return-dust",
		]);
		if (!allowedIds.has(nodeId)) {
			throw new BadRequestException("unknown node");
		}

		const node = this.nodes.find((item) => {
			return item.id === nodeId;
		});
		if (node === undefined) {
			throw new BadRequestException("unknown node");
		}

		if (nodeId !== "split-half") {
			throw new BadRequestException(
				"node does not accept config patches",
			);
		}

		const rawMin = config.minAmount;
		if (
			typeof rawMin !== "number" ||
			!Number.isInteger(rawMin) ||
			rawMin < 0
		) {
			throw new BadRequestException(
				"minAmount must be a non-negative integer",
			);
		}
		if (rawMin > MAX_MIN_AMOUNT) {
			throw new BadRequestException(
				`minAmount must be <= ${String(MAX_MIN_AMOUNT)}`,
			);
		}

		const keys = Object.keys(config);
		for (const key of keys) {
			if (
				key === "__proto__" ||
				key === "constructor" ||
				key === "prototype"
			) {
				throw new BadRequestException("invalid config key");
			}
			if (key !== "minAmount") {
				throw new BadRequestException("only minAmount is patchable");
			}
		}

		this.nodes = this.nodes.map((item) => {
			if (item.id !== nodeId) {
				return item;
			}

			return {
				...item,
				config: { minAmount: rawMin },
			};
		});

		return this.getDemo();
	}

	trigger(amount: number, address: string): FlowDemoSnapshot {
		if (
			!Number.isFinite(amount) ||
			amount < 0 ||
			!Number.isInteger(amount)
		) {
			throw new BadRequestException(
				"amount must be a non-negative integer",
			);
		}
		if (amount > MAX_DEPOSIT_AMOUNT) {
			throw new BadRequestException(
				`amount must be <= ${String(MAX_DEPOSIT_AMOUNT)}`,
			);
		}
		if (typeof address !== "string" || address.trim().length === 0) {
			throw new BadRequestException("address must be a non-empty string");
		}
		if (address.trim().length > MAX_ADDRESS_LENGTH) {
			throw new BadRequestException(
				`address must be <= ${String(MAX_ADDRESS_LENGTH)} characters`,
			);
		}

		const trimmed = address.trim();

		this.deposited += amount;

		const total = this.deposited;

		this.runSeq += 1;

		const runId = `run-${String(this.runSeq)}`;
		const nodeStates: FlowDemoRun["nodeStates"] = {
			"account-listener": "ok",
			"split-half": "idle",
			"send-a": "idle",
			"send-b": "idle",
			"return-dust": "idle",
		};
		const outputsByNode: FlowDemoRun["outputsByNode"] = {
			"account-listener": { amount: total, address: trimmed },
		};

		const splitNode = this.nodes.find((node) => {
			return node.id === "split-half";
		});
		let minAmount = DEFAULT_MIN_AMOUNT;
		if (splitNode !== undefined) {
			const raw = splitNode.config.minAmount;
			if (typeof raw === "number") {
				minAmount = raw;
			}
		}

		if (total <= minAmount) {
			nodeStates["split-half"] = "failed";
			outputsByNode["split-half"] = {
				amount: total,
				address: trimmed,
				addressOut: trimmed,
			};

			this.run = {
				runId,
				nodeStates,
				outputsByNode,
				message: `Deposit +${String(amount)} -> total ${String(total)} (≤ minAmount ${String(minAmount)}); split skipped`,
			};

			return this.getDemo();
		}

		const parts = splitAmount(total);
		nodeStates["split-half"] = "ok";
		outputsByNode["split-half"] = {
			amount: total,
			address: trimmed,
			addressOut: trimmed,
			halfA: parts.halfA,
			halfB: parts.halfB,
			dust: parts.dust,
		};

		nodeStates["send-a"] = "ok";
		outputsByNode["send-a"] = {
			amount: parts.halfA,
			txid: `tx-a-${runId}`,
		};

		nodeStates["send-b"] = "ok";
		outputsByNode["send-b"] = {
			amount: parts.halfB,
			txid: `tx-b-${runId}`,
		};

		nodeStates["return-dust"] = "ok";
		outputsByNode["return-dust"] = {
			amount: parts.dust,
			address: trimmed,
			txid: `tx-dust-${runId}`,
		};

		this.run = {
			runId,
			nodeStates,
			outputsByNode,
			message: `Deposit +${String(amount)} -> total ${String(total)}; split ${String(parts.halfA)}/${String(parts.halfB)} dust ${String(parts.dust)}`,
		};

		return this.getDemo();
	}

	getRun(): FlowDemoRun {
		return this.getDemo().run;
	}
}
