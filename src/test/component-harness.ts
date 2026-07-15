import type { CSSProperties, ReactElement } from "react";
import { render } from "@testing-library/react";
import { expect } from "vitest";
import { axe } from "vitest-axe";

/**
 * Renders `ui` and asserts axe finds no violations.
 */
export async function expectNoA11yViolations(ui: ReactElement): Promise<void> {
	const { container } = render(ui);
	const results = await axe(container);
	expect(results).toHaveNoViolations();
}

/**
 * Build a style object that carries CSS custom properties.
 */
export function cssVarStyle(
	vars: Record<`--${string}`, string>,
): CSSProperties {
	const style: CSSProperties = Object.assign({}, vars);
	return style;
}
