import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cva } from "class-variance-authority";
import { useState } from "react";

import { cn } from "../../utils/cn.js";

const avatarVariants = cva(
	"relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground font-medium select-none",
	{
		variants: {
			size: {
				sm: "size-8 text-xs",
				md: "size-10 text-sm",
				lg: "size-12 text-base",
			},
		},
		defaultVariants: {
			size: "md",
		},
	},
);

interface AvatarProps extends Omit<ComponentProps<"span">, "children">, VariantProps<typeof avatarVariants> {
	src?: string;
	alt: string;
	fallback: ReactNode;
}

/**
 * User / contact identity chrome. Shows `src` when loadable; otherwise
 * `fallback` (typically initials). Pass `alt=""` when decorative and the
 * name is adjacent text (WCAG 1.1.1).
 */
function Avatar({ src, alt, fallback, size, className, ...rest }: AvatarProps) {
	const [failed, setFailed] = useState(false);

	let resolvedSize: "sm" | "md" | "lg" = "md";
	if (size === "sm") {
		resolvedSize = "sm";
	} else if (size === "lg") {
		resolvedSize = "lg";
	}

	let showImage = false;
	if (src !== undefined && src.length > 0 && !failed) {
		showImage = true;
	}

	let content: ReactNode = (
		<span data-slot="avatar-fallback" aria-hidden="true">
			{fallback}
		</span>
	);
	if (showImage) {
		content = (
			<img
				data-slot="avatar-image"
				src={src}
				alt={alt}
				className="size-full object-cover"
				onError={() => {
					setFailed(true);
				}}
			/>
		);
	}

	let rootLabel: string | undefined;
	if (!showImage && alt.length > 0) {
		rootLabel = alt;
	}

	let rootRole: "img" | undefined;
	if (rootLabel !== undefined) {
		rootRole = "img";
	}

	return (
		<span
			data-slot="avatar"
			data-size={resolvedSize}
			role={rootRole}
			aria-label={rootLabel}
			className={cn(avatarVariants({ size: resolvedSize }), className)}
			{...rest}
		>
			{content}
		</span>
	);
}

export type { AvatarProps };
export { Avatar, avatarVariants };
