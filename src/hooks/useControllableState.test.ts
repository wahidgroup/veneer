import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { useControllableState } from "./useControllableState.js";

describe("useControllableState", () => {
	it("uses defaultProp when uncontrolled", () => {
		const values: string[] = [];
		const { result } = renderHook(() => {
			return useControllableState({
				defaultProp: "a",
				onChange: (value) => {
					values.push(value);
				},
			});
		});

		expect(result.current[0]).toBe("a");

		act(() => {
			result.current[1]("b");
		});

		expect(result.current[0]).toBe("b");
		expect(values).toEqual(["b"]);
	});

	it("defers to prop when controlled", () => {
		const values: string[] = [];
		const { result, rerender } = renderHook(
			({ prop }) => {
				return useControllableState({
					prop,
					defaultProp: "a",
					onChange: (value) => {
						values.push(value);
					},
				});
			},
			{ initialProps: { prop: "x" } },
		);

		expect(result.current[0]).toBe("x");

		act(() => {
			result.current[1]("y");
		});

		expect(result.current[0]).toBe("x");
		expect(values).toEqual(["y"]);

		rerender({ prop: "y" });
		expect(result.current[0]).toBe("y");
	});

	it("supports setting a new value", () => {
		const { result } = renderHook(() => {
			return useControllableState({ defaultProp: 1 });
		});

		act(() => {
			result.current[1](2);
		});

		expect(result.current[0]).toBe(2);
	});
});
