import type { ComponentProps, DragEvent, ReactNode } from "react";
import { useId, useRef, useState } from "react";
import { Trash2, Upload } from "lucide-react";

import { cn } from "../../utils/cn.js";

interface FileUploadProps extends Omit<
	ComponentProps<"div">,
	"onChange" | "defaultValue"
> {
	value?: File[];
	defaultValue?: File[];
	onChange?: (files: File[]) => void;
	accept?: string;
	multiple?: boolean;
	disabled?: boolean;
	invalid?: boolean;
	id?: string;
	maxSizeBytes?: number;
	emptyText?: string;
}

/**
 * File picker with click and drag-and-drop. Emits `File[]` (empty when cleared).
 */
function FileUpload({
	value,
	defaultValue,
	onChange,
	accept,
	multiple,
	disabled,
	invalid,
	id,
	maxSizeBytes,
	emptyText,
	className,
	...rest
}: FileUploadProps) {
	let resolvedInvalid = invalid;
	resolvedInvalid ??= false;

	let resolvedMultiple = multiple;
	resolvedMultiple ??= false;

	let resolvedEmpty = emptyText;
	resolvedEmpty ??= "Drop files here or browse";

	const autoId = useId();
	let inputId = id;
	inputId ??= autoId;

	const inputRef = useRef<HTMLInputElement>(null);
	const isControlled = value !== undefined;
	const [uncontrolled, setUncontrolled] = useState(() => {
		if (defaultValue !== undefined) {
			return defaultValue;
		}

		const empty: File[] = [];
		return empty;
	});
	const [dragging, setDragging] = useState(false);
	const [rejectMessage, setRejectMessage] = useState<string | undefined>();

	let files = uncontrolled;
	if (isControlled) {
		files = value;
	}

	function commit(next: File[]) {
		setRejectMessage(undefined);

		if (!isControlled) {
			setUncontrolled(next);
		}
		if (onChange !== undefined) {
			onChange(next);
		}
	}

	function filterIncoming(incoming: FileList | File[]): File[] {
		const list = Array.from(incoming);
		if (maxSizeBytes === undefined) {
			return list;
		}

		const kept: File[] = [];
		for (const file of list) {
			if (file.size <= maxSizeBytes) {
				kept.push(file);
			}
		}

		if (kept.length < list.length) {
			setRejectMessage("One or more files exceed the size limit");
		}

		return kept;
	}

	function applyIncoming(incoming: FileList | File[]) {
		if (disabled === true) {
			return;
		}

		const filtered = filterIncoming(incoming);
		if (resolvedMultiple) {
			commit([...files, ...filtered]);
			return;
		}

		if (filtered.length === 0) {
			return;
		}

		const first = filtered[0];
		if (first !== undefined) {
			commit([first]);
		}
	}

	function onDragOver(event: DragEvent<HTMLLabelElement>) {
		event.preventDefault();

		if (disabled === true) {
			return;
		}

		setDragging(true);
	}

	function onDragLeave(event: DragEvent<HTMLLabelElement>) {
		event.preventDefault();
		setDragging(false);
	}

	function onDrop(event: DragEvent<HTMLLabelElement>) {
		event.preventDefault();
		setDragging(false);

		if (event.dataTransfer.files.length > 0) {
			applyIncoming(event.dataTransfer.files);
		}
	}

	let borderClass = "border-border";
	if (resolvedInvalid) {
		borderClass = "border-destructive";
	} else if (dragging) {
		borderClass = "border-primary";
	}

	let fileList: ReactNode = null;
	if (files.length > 0) {
		fileList = (
			<ul className="mt-3 flex flex-col gap-1 text-sm">
				{files.map((file, index) => {
					return (
						<li
							key={`${file.name}-${file.size}-${index}`}
							className="flex items-center gap-2"
						>
							<button
								type="button"
								disabled={disabled}
								aria-label={`Remove ${file.name}`}
								className={cn(
									"inline-flex size-8 shrink-0 items-center justify-center rounded-md",
									"cursor-pointer text-destructive transition-colors",
									"hover:bg-destructive-muted focus-visible:outline-none",
									"focus-visible:ring-2 focus-visible:ring-destructive",
									"disabled:cursor-not-allowed disabled:opacity-50",
								)}
								onClick={() => {
									commit(
										files.filter((_, i) => {
											return i !== index;
										}),
									);
								}}
							>
								<Trash2 className="size-4" aria-hidden="true" />
							</button>
							<span className="min-w-0 truncate text-foreground">
								{file.name}
							</span>
						</li>
					);
				})}
			</ul>
		);
	}

	let rejectNode: ReactNode = null;
	if (rejectMessage !== undefined) {
		rejectNode = (
			<p className="mt-2 text-sm text-destructive">{rejectMessage}</p>
		);
	}

	let dropClass =
		"block rounded-lg border border-dashed bg-secondary px-4 py-6 text-center transition-colors";
	dropClass = cn(dropClass, borderClass);
	if (disabled === true) {
		dropClass = cn(dropClass, "cursor-not-allowed opacity-50");
	} else {
		dropClass = cn(dropClass, "cursor-pointer hover:border-input");
	}

	return (
		<div
			data-slot="file-upload"
			className={cn("w-full", className)}
			{...rest}
		>
			<label
				htmlFor={inputId}
				aria-disabled={disabled === true}
				className={dropClass}
				onDragOver={onDragOver}
				onDragLeave={onDragLeave}
				onDrop={onDrop}
			>
				<span className="mb-2 inline-flex justify-center text-muted-foreground">
					<Upload className="size-6" aria-hidden="true" />
				</span>
				<p className="text-sm text-muted-foreground">{resolvedEmpty}</p>
				<input
					ref={inputRef}
					id={inputId}
					type="file"
					className="sr-only"
					accept={accept}
					multiple={resolvedMultiple}
					disabled={disabled}
					aria-invalid={resolvedInvalid}
					onChange={(event) => {
						if (event.target.files !== null) {
							applyIncoming(event.target.files);
						}
						event.target.value = "";
					}}
				/>
			</label>
			{fileList}
			{rejectNode}
		</div>
	);
}

export type { FileUploadProps };
export { FileUpload };
