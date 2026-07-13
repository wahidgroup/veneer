import "@testing-library/jest-dom/vitest";
import "vitest";

declare module "vitest" {
	interface Assertion<_T = unknown> {
		toHaveNoViolations(): void;
	}

	interface AsymmetricMatchersContaining {
		toHaveNoViolations(): void;
	}
}
