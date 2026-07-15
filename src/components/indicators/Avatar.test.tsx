import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { Avatar } from "./Avatar.js";

describe("Avatar", () => {
	it("renders fallback when src is omitted", () => {
		render(<Avatar alt="" fallback="WG" />);
		expect(screen.getByText("WG")).toBeInTheDocument();
		expect(screen.getByText("WG")).toHaveAttribute(
			"data-slot",
			"avatar-fallback",
		);
	});

	it("renders an image when src is provided", () => {
		render(
			<Avatar
				alt="Wahid"
				fallback="W"
				src="https://example.com/avatar.png"
			/>,
		);

		const image = screen.getByRole("img", { name: "Wahid" });
		expect(image).toHaveAttribute("data-slot", "avatar-image");
	});

	it.each([
		{ size: "sm" as const },
		{ size: "md" as const },
		{ size: "lg" as const },
	])("applies size $size", ({ size }) => {
		const { container } = render(
			<Avatar alt="" fallback="A" size={size} />,
		);
		expect(container.querySelector("[data-slot='avatar']")).toHaveAttribute(
			"data-size",
			size,
		);
	});

	it("merges className", () => {
		const { container } = render(
			<Avatar alt="" fallback="A" className="my-avatar" />,
		);
		expect(
			container.querySelector("[data-slot='avatar']")?.className,
		).toContain("my-avatar");
	});

	it("has no accessibility violations", async () => {
		const { container } = render(<Avatar alt="User" fallback="U" />);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});
});
