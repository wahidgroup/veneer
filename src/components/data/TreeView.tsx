import type {
	ComponentProps,
	KeyboardEvent,
	MouseEvent,
	ReactNode,
} from "react";
import { ChevronRight } from "lucide-react";
import { useRef, useState } from "react";

import { cn } from "../../utils/cn.js";

interface TreeViewItem {
	id: string;
	label: string;
	children?: TreeViewItem[];
	disabled?: boolean;
	/**
	 * Trailing row content (Badge, StatusBadge, etc.). Alignment via
	 * {@link TreeViewProps.endAlign}.
	 */
	end?: ReactNode;
}

type TreeViewEndAlign = "snug" | "justify";

interface TreeViewProps extends Omit<ComponentProps<"ul">, "children"> {
	items: TreeViewItem[];
	"aria-label": string;
	expandedIds?: string[];
	defaultExpandedIds?: string[];
	onExpandedIdsChange?: (ids: string[]) => void;
	onActivate?: (id: string) => void;
	/**
	 * How `item.end` sits on the row: `snug` follows the label, `justify`
	 * pushes to the trailing edge (default).
	 */
	endAlign?: TreeViewEndAlign;
}

interface FlatNode {
	id: string;
	label: string;
	parentId: string | null;
	hasChildren: boolean;
	disabled: boolean;
}

/**
 * Milliseconds before the typeahead buffer resets.
 */
const TYPEAHEAD_RESET_MS = 500;

function itemHasChildren(item: TreeViewItem): boolean {
	if (item.children === undefined) {
		return false;
	}

	return item.children.length > 0;
}

function flattenVisible(
	items: TreeViewItem[],
	expanded: ReadonlySet<string>,
	parentId: string | null,
): FlatNode[] {
	const out: FlatNode[] = [];

	for (const item of items) {
		const hasChildren = itemHasChildren(item);
		let disabled = false;
		if (item.disabled === true) {
			disabled = true;
		}

		out.push({
			id: item.id,
			label: item.label,
			parentId,
			hasChildren,
			disabled,
		});

		if (
			hasChildren &&
			expanded.has(item.id) &&
			item.children !== undefined
		) {
			const nested = flattenVisible(item.children, expanded, item.id);
			for (const child of nested) {
				out.push(child);
			}
		}
	}

	return out;
}

function findItem(items: TreeViewItem[], id: string): TreeViewItem | undefined {
	for (const item of items) {
		if (item.id === id) {
			return item;
		}

		if (item.children !== undefined) {
			const nested = findItem(item.children, id);
			if (nested !== undefined) {
				return nested;
			}
		}
	}

	return undefined;
}

function findParentId(
	items: TreeViewItem[],
	id: string,
	parentId: string | null,
): string | null | undefined {
	for (const item of items) {
		if (item.id === id) {
			return parentId;
		}

		if (item.children !== undefined) {
			const nested = findParentId(item.children, id, item.id);
			if (nested !== undefined) {
				return nested;
			}
		}
	}

	return undefined;
}

function siblingItems(items: TreeViewItem[], focusId: string): TreeViewItem[] {
	const parentId = findParentId(items, focusId, null);
	if (parentId === undefined) {
		return [];
	}
	if (parentId === null) {
		return items;
	}

	const parent = findItem(items, parentId);
	if (parent === undefined) {
		return [];
	}
	if (parent.children === undefined) {
		return [];
	}

	return parent.children;
}

function firstEnabledId(nodes: FlatNode[]): string | null {
	for (const node of nodes) {
		if (!node.disabled) {
			return node.id;
		}
	}

	return null;
}

interface TreeNodeProps {
	item: TreeViewItem;
	level: number;
	expanded: ReadonlySet<string>;
	focusedId: string | null;
	endAlign: TreeViewEndAlign;
	onFocusItem: (id: string) => void;
	onToggle: (id: string) => void;
	onActivate?: (id: string) => void;
	onKeyDown: (event: KeyboardEvent<HTMLLIElement>) => void;
}

function TreeNode({
	item,
	level,
	expanded,
	focusedId,
	endAlign,
	onFocusItem,
	onToggle,
	onActivate,
	onKeyDown,
}: TreeNodeProps) {
	const hasChildren = itemHasChildren(item);
	const isExpanded = expanded.has(item.id);
	const disabled = item.disabled === true;

	let tabIndex = -1;
	if (!disabled && focusedId === item.id) {
		tabIndex = 0;
	}

	let expandAttr: boolean | undefined;
	if (hasChildren) {
		expandAttr = isExpanded;
	}

	let disabledAttr: true | undefined;
	if (disabled) {
		disabledAttr = true;
	}

	let chevron: ReactNode = <span className="inline-block size-4 shrink-0" />;
	if (hasChildren) {
		let chevronClass =
			"size-4 shrink-0 text-muted-foreground transition-transform";
		if (isExpanded) {
			chevronClass = cn(chevronClass, "rotate-90");
		}

		chevron = <ChevronRight className={chevronClass} aria-hidden="true" />;
	}

	let groupNode: ReactNode = null;
	if (hasChildren && isExpanded && item.children !== undefined) {
		groupNode = (
			<ul
				role="group"
				data-slot="tree-view-group"
				className="m-0 list-none p-0"
			>
				{item.children.map((child) => {
					return (
						<TreeNode
							key={child.id}
							item={child}
							level={level + 1}
							expanded={expanded}
							focusedId={focusedId}
							endAlign={endAlign}
							onFocusItem={onFocusItem}
							onToggle={onToggle}
							onActivate={onActivate}
							onKeyDown={onKeyDown}
						/>
					);
				})}
			</ul>
		);
	}

	let itemClass = "outline-none focus-visible:bg-accent/40";
	if (disabled) {
		itemClass = cn(itemClass, "cursor-not-allowed opacity-50");
	} else {
		itemClass = cn(itemClass, "cursor-pointer");
	}

	function handleClick(event: MouseEvent<HTMLLIElement>) {
		event.preventDefault();
		event.stopPropagation();

		if (disabled) {
			return;
		}

		const target = event.target;
		if (target instanceof Element) {
			if (target.closest("[data-slot='tree-view-end']") !== null) {
				return;
			}
		}

		onFocusItem(item.id);

		if (hasChildren) {
			onToggle(item.id);
			return;
		}

		if (onActivate !== undefined) {
			onActivate(item.id);
		}
	}

	let endNode: ReactNode = null;
	if (item.end !== undefined) {
		let endClass = "flex shrink-0 items-center gap-1";
		if (endAlign === "justify") {
			endClass = cn(endClass, "ml-auto");
		}

		endNode = (
			<span
				data-slot="tree-view-end"
				data-align={endAlign}
				className={endClass}
			>
				{item.end}
			</span>
		);
	}

	// APG: non-selectable trees MUST omit aria-selected (presence -> selectable).
	// jsx-a11y requires it via option-role inheritance - false positive here.
	/* eslint-disable jsx-a11y/role-has-required-aria-props */
	const node = (
		<li
			role="treeitem"
			data-slot="tree-view-item"
			data-tree-id={item.id}
			tabIndex={tabIndex}
			aria-label={item.label}
			aria-expanded={expandAttr}
			aria-disabled={disabledAttr}
			className={itemClass}
			onFocus={() => {
				if (!disabled) {
					onFocusItem(item.id);
				}
			}}
			onClick={handleClick}
			onKeyDown={onKeyDown}
		>
			<span
				data-slot="tree-view-row"
				className="flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-accent/30"
				style={{ paddingLeft: 8 + level * 16 }}
			>
				{chevron}
				<span data-slot="tree-view-label" className="min-w-0 truncate">
					{item.label}
				</span>
				{endNode}
			</span>
			{groupNode}
		</li>
	);
	/* eslint-enable jsx-a11y/role-has-required-aria-props */

	return node;
}

/**
 * Hierarchical navigator (`role="tree"`). Roving tabindex, APG keyboard.
 * Optional `item.end` with `endAlign` (`snug` | `justify`).
 */
function TreeView({
	items,
	"aria-label": ariaLabel,
	expandedIds,
	defaultExpandedIds,
	onExpandedIdsChange,
	onActivate,
	endAlign,
	className,
	...rest
}: TreeViewProps) {
	let resolvedEndAlign: TreeViewEndAlign = "justify";
	if (endAlign === "snug") {
		resolvedEndAlign = "snug";
	}
	const isControlled = expandedIds !== undefined;
	const [uncontrolledExpanded, setUncontrolledExpanded] = useState<string[]>(
		() => {
			if (defaultExpandedIds !== undefined) {
				return defaultExpandedIds;
			}

			return [];
		},
	);

	let currentExpanded = uncontrolledExpanded;
	if (isControlled) {
		currentExpanded = expandedIds;
	}

	const expandedSet = new Set(currentExpanded);
	const visible = flattenVisible(items, expandedSet, null);

	const [focusedId, setFocusedId] = useState<string | null>(() => {
		return firstEnabledId(
			flattenVisible(items, new Set(currentExpanded), null),
		);
	});

	let activeFocusId = focusedId;
	const focusedStillVisible = visible.some((node) => {
		return node.id === focusedId && !node.disabled;
	});
	if (!focusedStillVisible) {
		activeFocusId = firstEnabledId(visible);
	}

	const typeaheadRef = useRef({ buffer: "", timeoutId: 0 });
	const treeRef = useRef<HTMLUListElement | null>(null);

	function commitExpanded(next: string[]) {
		if (!isControlled) {
			setUncontrolledExpanded(next);
		}

		if (onExpandedIdsChange !== undefined) {
			onExpandedIdsChange(next);
		}
	}

	function setFocus(id: string) {
		setFocusedId(id);

		const root = treeRef.current;
		if (root === null) {
			return;
		}

		const el = root.querySelector<HTMLElement>(
			`[data-tree-id="${CSS.escape(id)}"]`,
		);
		if (el !== null) {
			el.focus();
		}
	}

	function toggleExpand(id: string) {
		const next = new Set(currentExpanded);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}

		commitExpanded(Array.from(next));
	}

	function expandId(id: string) {
		if (currentExpanded.includes(id)) {
			return;
		}

		commitExpanded([...currentExpanded, id]);
	}

	function collapseId(id: string) {
		if (!currentExpanded.includes(id)) {
			return;
		}

		commitExpanded(
			currentExpanded.filter((value) => {
				return value !== id;
			}),
		);
	}

	function moveFocusFrom(focusId: string, delta: number) {
		const enabled = visible.filter((node) => {
			return !node.disabled;
		});
		if (enabled.length === 0) {
			return;
		}

		let index = enabled.findIndex((node) => {
			return node.id === focusId;
		});
		if (index < 0) {
			index = 0;
		} else {
			index = index + delta;
			if (index < 0) {
				index = 0;
			}

			if (index >= enabled.length) {
				index = enabled.length - 1;
			}
		}

		const target = enabled[index];
		if (target !== undefined) {
			setFocus(target.id);
		}
	}

	function handleTypeahead(character: string, focusId: string) {
		const state = typeaheadRef.current;

		window.clearTimeout(state.timeoutId);

		const lower = character.toLowerCase();
		if (state.buffer === lower) {
			state.buffer = lower;
		} else {
			state.buffer = `${state.buffer}${lower}`;
		}

		state.timeoutId = window.setTimeout(() => {
			state.buffer = "";
		}, TYPEAHEAD_RESET_MS);

		const enabled = visible.filter((node) => {
			return !node.disabled;
		});
		if (enabled.length === 0) {
			return;
		}

		let start = enabled.findIndex((node) => {
			return node.id === focusId;
		});
		if (start < 0) {
			start = 0;
		}

		const query = state.buffer;
		for (let offset = 1; offset <= enabled.length; offset += 1) {
			const index = (start + offset) % enabled.length;
			const candidate = enabled[index];
			if (candidate === undefined) {
				continue;
			}

			if (candidate.label.toLowerCase().startsWith(query)) {
				setFocus(candidate.id);
				return;
			}
		}

		if (query.length > 1) {
			state.buffer = lower;
			for (let offset = 1; offset <= enabled.length; offset += 1) {
				const index = (start + offset) % enabled.length;
				const candidate = enabled[index];
				if (candidate === undefined) {
					continue;
				}

				if (candidate.label.toLowerCase().startsWith(lower)) {
					setFocus(candidate.id);
					return;
				}
			}
		}
	}

	function handleKeyDown(event: KeyboardEvent<HTMLLIElement>) {
		event.stopPropagation();

		let focusId = activeFocusId;
		const target = event.target;
		if (target instanceof HTMLElement) {
			const itemEl = target.closest<HTMLElement>("[data-tree-id]");
			if (itemEl !== null) {
				const fromDom = itemEl.dataset.treeId;
				if (fromDom !== undefined) {
					focusId = fromDom;
				}
			}
		}

		if (focusId === null) {
			return;
		}

		const node = visible.find((entry) => {
			return entry.id === focusId;
		});
		if (node === undefined) {
			return;
		}

		if (event.key === "ArrowDown") {
			event.preventDefault();
			moveFocusFrom(focusId, 1);
			return;
		}

		if (event.key === "ArrowUp") {
			event.preventDefault();
			moveFocusFrom(focusId, -1);
			return;
		}

		if (event.key === "Home") {
			event.preventDefault();
			const first = firstEnabledId(visible);
			if (first !== null) {
				setFocus(first);
			}

			return;
		}

		if (event.key === "End") {
			event.preventDefault();

			const enabled = visible.filter((entry) => {
				return !entry.disabled;
			});

			const last = enabled[enabled.length - 1];
			if (last !== undefined) {
				setFocus(last.id);
			}

			return;
		}

		if (event.key === "ArrowRight") {
			event.preventDefault();

			if (!node.hasChildren) {
				return;
			}

			if (!expandedSet.has(node.id)) {
				expandId(node.id);
				return;
			}

			const child = visible.find((entry) => {
				return entry.parentId === node.id && !entry.disabled;
			});
			if (child !== undefined) {
				setFocus(child.id);
			}

			return;
		}

		if (event.key === "ArrowLeft") {
			event.preventDefault();

			if (node.hasChildren && expandedSet.has(node.id)) {
				collapseId(node.id);
				return;
			}

			if (node.parentId !== null) {
				setFocus(node.parentId);
			}

			return;
		}

		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();

			if (node.hasChildren) {
				toggleExpand(node.id);
				return;
			}

			if (onActivate !== undefined) {
				onActivate(node.id);
			}

			return;
		}

		if (event.key === "*") {
			event.preventDefault();

			const siblings = siblingItems(items, focusId);
			const next = new Set(currentExpanded);
			for (const sibling of siblings) {
				if (itemHasChildren(sibling)) {
					next.add(sibling.id);
				}
			}

			commitExpanded(Array.from(next));
			return;
		}

		if (
			event.key.length === 1 &&
			!event.ctrlKey &&
			!event.metaKey &&
			!event.altKey
		) {
			event.preventDefault();
			handleTypeahead(event.key, focusId);
		}
	}

	// Keep React state in sync when focus was clamped to a visible node.
	if (activeFocusId !== focusedId && activeFocusId !== null) {
		setFocusedId(activeFocusId);
	}

	const root = (
		<ul
			ref={treeRef}
			role="tree"
			data-slot="tree-view"
			aria-label={ariaLabel}
			className={cn("m-0 list-none p-0", className)}
			{...rest}
		>
			{items.map((item) => {
				return (
					<TreeNode
						key={item.id}
						item={item}
						level={0}
						expanded={expandedSet}
						focusedId={activeFocusId}
						endAlign={resolvedEndAlign}
						onFocusItem={setFocusedId}
						onToggle={toggleExpand}
						onActivate={onActivate}
						onKeyDown={handleKeyDown}
					/>
				);
			})}
		</ul>
	);

	return root;
}

export type { TreeViewEndAlign, TreeViewItem, TreeViewProps };
export { TreeView };
