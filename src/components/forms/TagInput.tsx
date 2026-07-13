import type { ComponentProps, KeyboardEvent, ReactNode } from "react";
import { useState } from "react";
import { X } from "lucide-react";

import { cn } from "../../utils/cn.js";
import { Badge } from "../indicators/Badge.js";
import { Button } from "./Button.js";
import { controlVariants } from "./FormField.js";

interface TagInputProps extends Omit<
	ComponentProps<"div">,
	"onChange" | "defaultValue"
> {
	value?: string[];
	defaultValue?: string[];
	onChange?: (tags: string[]) => void;
	placeholder?: string;
	disabled?: boolean;
	invalid?: boolean;
	id?: string;
	delimiter?: RegExp;
}

/**
 * Free-form tag chips (resource tags, labels). Enter or delimiter commits a tag.
 */
function TagInput({
	value,
	defaultValue,
	onChange,
	placeholder,
	disabled,
	invalid,
	id,
	delimiter,
	className,
	...rest
}: TagInputProps) {
	let resolvedInvalid = invalid;
	resolvedInvalid ??= false;

	let resolvedPlaceholder = placeholder;
	resolvedPlaceholder ??= "Add tag";

	let splitPattern = /[\s,]+/;
	if (delimiter !== undefined) {
		splitPattern = delimiter;
	}

	const isControlled = value !== undefined;
	const [uncontrolled, setUncontrolled] = useState(() => {
		if (defaultValue !== undefined) {
			return defaultValue;
		}

		const empty: string[] = [];
		return empty;
	});

	const [draft, setDraft] = useState("");

	let tags = uncontrolled;
	if (isControlled) {
		tags = value;
	}

	function commitTags(next: string[]) {
		if (!isControlled) {
			setUncontrolled(next);
		}
		if (onChange !== undefined) {
			onChange(next);
		}
	}

	function addFromDraft() {
		const parts = draft
			.split(splitPattern)
			.map((part) => {
				return part.trim();
			})
			.filter((part) => {
				return part.length > 0;
			});
		if (parts.length === 0) {
			return;
		}

		const next = [...tags];
		for (const part of parts) {
			if (!next.includes(part)) {
				next.push(part);
			}
		}

		setDraft("");
		commitTags(next);
	}

	function removeTag(tag: string) {
		commitTags(
			tags.filter((item) => {
				return item !== tag;
			}),
		);
	}

	function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (disabled === true) {
			return;
		}
		if (event.key === "Enter" || event.key === ",") {
			event.preventDefault();
			addFromDraft();

			return;
		}
		if (
			event.key === "Backspace" &&
			draft.length === 0 &&
			tags.length > 0
		) {
			event.preventDefault();

			const last = tags[tags.length - 1];
			if (last !== undefined) {
				removeTag(last);
			}
		}
	}

	let chips: ReactNode = null;
	if (tags.length > 0) {
		chips = (
			<div className="flex flex-wrap gap-1.5">
				{tags.map((tag) => {
					return (
						<Button
							key={tag}
							variant="ghost"
							disabled={disabled}
							aria-label={`Remove ${tag}`}
							className="h-auto rounded-full p-0 hover:bg-transparent"
							onClick={() => {
								removeTag(tag);
							}}
						>
							<Badge
								variant="primary"
								size="sm"
								className="inline-flex items-center gap-1"
							>
								{tag}
								<X className="size-3" aria-hidden="true" />
							</Badge>
						</Button>
					);
				})}
			</div>
		);
	}

	return (
		<div
			data-slot="tag-input"
			className={cn(
				controlVariants({ invalid: resolvedInvalid }),
				"flex flex-col gap-2 py-2",
				className,
			)}
			{...rest}
		>
			{chips}
			<input
				id={id}
				type="text"
				disabled={disabled}
				aria-invalid={resolvedInvalid}
				placeholder={resolvedPlaceholder}
				value={draft}
				className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
				onChange={(event) => {
					setDraft(event.target.value);
				}}
				onKeyDown={onKeyDown}
				onBlur={() => {
					addFromDraft();
				}}
			/>
		</div>
	);
}

export type { TagInputProps };
export { TagInput };
