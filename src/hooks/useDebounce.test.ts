import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useDebounce } from "./useDebounce.js";

describe("useDebounce", () => {
	it("returns the latest value after the delay", () => {
		vi.useFakeTimers();

		const { result, rerender } = renderHook(
			({ value, delayMs }) => {
				return useDebounce(value, delayMs);
			},
			{ initialProps: { value: "a", delayMs: 200 } },
		);
		expect(result.current).toBe("a");

		rerender({ value: "ab", delayMs: 200 });
		expect(result.current).toBe("a");

		act(() => {
			vi.advanceTimersByTime(200);
		});

		expect(result.current).toBe("ab");

		vi.useRealTimers();
	});
});
