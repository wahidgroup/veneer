import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
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

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<Avatar alt="User" fallback="U" />);
	});
});
