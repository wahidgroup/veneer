import { expect, test } from "@playwright/test";

const proofPort = process.env.E2E_PROOF_PORT;
if (proofPort === undefined || proofPort.length === 0) {
	throw new Error("E2E_PROOF_PORT is not set");
}

test.use({
	baseURL: `http://127.0.0.1:${proofPort}`,
});

test("action menu is visible and holds focus after open", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("button", { name: "Stack" }).click();

	const menu = page.getByRole("menu");
	await expect(menu).toBeVisible();
	expect(
		await menu.evaluate((node) => {
			return getComputedStyle(node).visibility;
		}),
	).toBe("visible");
	expect(
		await menu.evaluate((node) => {
			return node.contains(document.activeElement);
		}),
	).toBe(true);
});

test("consumed Escape closes the menu, stays marked, and still bubbles", async ({ page }) => {
	await page.goto("/");
	const trigger = page.getByRole("button", { name: "Stack" });
	await trigger.click();
	await expect(page.getByRole("menu")).toBeVisible();
	await page.evaluate(() => {
		document.addEventListener("keydown", (event) => {
			document.body.dataset.escapeKey = event.key;
			document.body.dataset.escapePrevented = String(event.defaultPrevented);
		});
	});

	await page.keyboard.press("Escape");
	await expect(page.getByRole("menu")).toHaveCount(0);
	await expect(page.locator("body")).toHaveAttribute("data-escape-key", "Escape");
	await expect(page.locator("body")).toHaveAttribute("data-escape-prevented", "true");
	await expect(trigger).toBeFocused();
});

test("popover and toolbar select close once on Escape", async ({ page }) => {
	await page.goto("/");

	await page.getByRole("button", { name: "Details" }).click();
	await expect(page.getByRole("dialog")).toBeVisible();
	await page.keyboard.press("Escape");
	await expect(page.getByRole("dialog")).toHaveCount(0);
	await expect(page.getByTestId("popover-opens")).toHaveText("true,false");

	const account = page.getByRole("button", { name: "Account: Prod" });
	await account.click();
	await expect(page.getByRole("listbox")).toBeVisible();
	await page.keyboard.press("Escape");
	await expect(page.getByRole("listbox")).toHaveCount(0);
	await expect(account).toBeFocused();
});

const pickerNames = ["Region", "Zone"] as const;

for (const name of pickerNames) {
	test(`escape leaves focus on the outside input for ${name}`, async ({ page }) => {
		await page.goto("/");
		const field = page.getByRole("combobox", { name });
		await field.click();
		await expect(page.getByRole("listbox")).toBeVisible();

		const outside = page.getByRole("textbox", { name: "Outside" });
		await outside.focus();
		await page.keyboard.press("Escape");
		await expect(page.getByRole("listbox")).toHaveCount(0);
		await expect(outside).toBeFocused();
	});

	test(`outside input press keeps focus and closes ${name}`, async ({ page }) => {
		await page.goto("/");
		const field = page.getByRole("combobox", { name });
		await field.click();
		await expect(page.getByRole("listbox")).toBeVisible();

		const outside = page.getByRole("textbox", { name: "Outside" });
		await outside.click();
		await expect(page.getByRole("listbox")).toHaveCount(0);
		await expect(outside).toBeFocused();
	});

	test(`inert press leaves ${name} unfocused and closed`, async ({ page }) => {
		await page.goto("/");
		const field = page.getByRole("combobox", { name });
		await field.click();
		await expect(page.getByRole("listbox")).toBeVisible();

		await page.getByTestId("inert-area").click();
		await expect(page.getByRole("listbox")).toHaveCount(0);
		await expect(field).not.toBeFocused();
	});
}

test("activating an action menu item focuses the trigger", async ({ page }) => {
	await page.goto("/");
	const trigger = page.getByRole("button", { name: "Stack" });
	await trigger.click();
	await page.getByRole("menuitem", { name: "View events" }).click();
	await expect(page.getByRole("menu")).toHaveCount(0);
	await expect(trigger).toBeFocused();
});

test("consumer close keeps focus on the outside input", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("button", { name: "Details" }).click();
	await expect(page.getByRole("dialog")).toBeVisible();

	const outside = page.getByRole("textbox", { name: "Outside" });
	await outside.focus();
	await page.getByRole("button", { name: "Dismiss panel" }).dispatchEvent("click");
	await expect(page.getByRole("dialog")).toHaveCount(0);
	await expect(outside).toBeFocused();
});

test("escape closes a later modal before the combobox", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("combobox", { name: "Region" }).click();
	await expect(page.getByRole("listbox")).toBeVisible();
	await page.keyboard.press("Tab");
	await page.keyboard.press("Enter");
	await expect(page.getByRole("dialog", { name: "Stacked notice" })).toBeVisible();
	await expect(page.getByRole("listbox")).toBeVisible();
	await page.keyboard.press("Escape");
	await expect(page.getByRole("dialog", { name: "Stacked notice" })).toHaveCount(0);
	await expect(page.getByRole("listbox")).toBeVisible();
	await page.keyboard.press("Escape");
	await expect(page.getByRole("listbox")).toHaveCount(0);
});

test("a later modal paints over the combobox list where they overlap", async ({ page }) => {
	await page.goto("/");
	const listbox = page.getByRole("listbox");
	await page.getByRole("combobox", { name: "Region" }).click();
	await expect(listbox).toBeVisible();
	await page.keyboard.press("Tab");
	await page.keyboard.press("Enter");
	const modal = page.locator("[data-slot='modal']");
	await expect(modal).toBeVisible();
	await expect(listbox).toBeVisible();
	expect(
		await listbox.evaluate((node) => {
			const rect = node.getBoundingClientRect();
			const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
			const shell = document.querySelector("[data-slot='modal']");
			return shell.contains(hit);
		}),
	).toBe(true);
	expect(
		await listbox.evaluate((node) => {
			const rect = node.getBoundingClientRect();
			const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
			return node.contains(hit);
		}),
	).toBe(false);
});

test("escape closes a select inside a drawer before the drawer", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("button", { name: "Open drawer" }).click();
	await expect(page.getByRole("dialog", { name: "Shelf" })).toBeVisible();
	await page.getByRole("combobox", { name: "Shelf zone" }).click();
	await expect(page.getByRole("listbox")).toBeVisible();
	await page.keyboard.press("Escape");
	await expect(page.getByRole("listbox")).toHaveCount(0);
	await expect(page.getByRole("dialog", { name: "Shelf" })).toBeVisible();
	await page.keyboard.press("Escape");
	await expect(page.getByRole("dialog", { name: "Shelf" })).toHaveCount(0);
});

test("a child that prevents Escape leaves the popover open", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("button", { name: "Hold", exact: true }).click();
	await expect(page.getByRole("dialog", { name: "Hold" })).toBeVisible();
	await page.getByRole("button", { name: "Hold escape" }).focus();
	await page.keyboard.press("Escape");
	await expect(page.getByRole("dialog", { name: "Hold" })).toBeVisible();
});

test("escape closes a context menu before its drawer", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("button", { name: "Open drawer" }).click();
	await expect(page.getByRole("dialog", { name: "Shelf" })).toBeVisible();
	await page.getByText("Shelf row").click({ button: "right" });
	await expect(page.getByRole("menu")).toBeVisible();
	await page.keyboard.press("Escape");
	await expect(page.getByRole("menu")).toHaveCount(0);
	await expect(page.getByRole("dialog", { name: "Shelf" })).toBeVisible();
});

const drawOrderCases = [
	{
		title: "select inside modal",
		openParent: "Open select modal",
		parentName: "Select modal",
		childLocator: "[aria-label='Modal zone']",
		childButton: "left",
		panelSlot: "select-listbox",
	},
	{
		title: "popover inside modal",
		openParent: "Open popover modal",
		parentName: "Popover modal",
		childLocator: "role=button[name='Modal popover']",
		childButton: "left",
		panelSlot: "popover-content",
	},
	{
		title: "select inside drawer",
		openParent: "Open drawer",
		parentName: "Shelf",
		childLocator: "[aria-label='Shelf zone']",
		childButton: "left",
		panelSlot: "select-listbox",
	},
	{
		title: "context menu inside drawer",
		openParent: "Open drawer",
		parentName: "Shelf",
		childLocator: "text='Shelf row'",
		childButton: "right",
		panelSlot: "context-menu-panel",
	},
] as const;

for (const entry of drawOrderCases) {
	test(`drawn child ${entry.title} is on top and closes alone`, async ({ page }) => {
		await page.goto("/");
		await page.getByRole("button", { name: entry.openParent }).click();
		await expect(page.getByRole("dialog", { name: entry.parentName })).toBeVisible();
		await page.locator(entry.childLocator).click({ button: entry.childButton });
		const panel = page.locator(`[data-slot='${entry.panelSlot}']`);
		await expect(panel).toBeVisible();
		expect(
			await panel.evaluate((node) => {
				return getComputedStyle(node).zIndex;
			}),
		).toBe("100");
		expect(
			await panel.evaluate((node) => {
				const rect = node.getBoundingClientRect();
				const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
				return node.contains(hit);
			}),
		).toBe(true);
		await page.keyboard.press("Escape");
		await expect(panel).toHaveCount(0);
		await expect(page.getByRole("dialog", { name: entry.parentName })).toBeVisible();
	});
}

const shellOrders = [
	{
		title: "rail then drawer",
		first: "Open shell rail",
		second: "Open shell drawer",
	},
	{
		title: "drawer then rail",
		first: "Open shell drawer",
		second: "Open shell rail",
	},
] as const;

test.describe("app shell mobile dismiss", () => {
	test.use({ viewport: { width: 390, height: 844 } });

	for (const order of shellOrders) {
		test(`one escape closes both panes opened ${order.title}`, async ({ page }) => {
			await page.goto("/");
			await expect(page.locator("[data-slot='app-shell']")).toHaveAttribute("data-viewport", "mobile");
			await page.getByRole("button", { name: order.first }).click();
			await page.getByRole("button", { name: order.second }).click();
			await expect(page.locator("[data-slot='app-shell-backdrop']")).toHaveCount(1);
			await page.keyboard.press("Escape");
			await expect(page.locator("[data-slot='app-shell']")).toHaveAttribute("data-collapsed", "true");
			await expect(page.locator("[data-slot='app-shell']")).toHaveAttribute("data-rail-collapsed", "true");
			await expect(page.locator("[data-slot='app-shell-backdrop']")).toHaveCount(0);
		});

		test(`backdrop click closes both panes opened ${order.title}`, async ({ page }) => {
			await page.goto("/");
			await expect(page.locator("[data-slot='app-shell']")).toHaveAttribute("data-viewport", "mobile");
			await page.getByRole("button", { name: order.first }).click();
			await page.getByRole("button", { name: order.second }).click();
			const backdrop = page.locator("[data-slot='app-shell-backdrop']");
			await expect(backdrop).toHaveCount(1);
			const point = await backdrop.evaluate((node) => {
				const rect = node.getBoundingClientRect();
				return {
					x: rect.right - 8,
					y: rect.top + 8,
				};
			});
			await page.mouse.click(point.x, point.y);
			await expect(page.locator("[data-slot='app-shell']")).toHaveAttribute("data-collapsed", "true");
			await expect(page.locator("[data-slot='app-shell']")).toHaveAttribute("data-rail-collapsed", "true");
			await expect(backdrop).toHaveCount(0);
		});
	}
});

test("option picker closes once on Escape", async ({ page }) => {
	await page.goto("/");

	const region = page.getByRole("combobox", { name: "Region" });
	await region.click();
	await region.pressSequentially("a");
	await expect(page.getByRole("listbox")).toBeVisible();
	await page.keyboard.press("Escape");
	await expect(page.getByRole("listbox")).toHaveCount(0);
	await expect(page.getByTestId("queries")).toHaveText("a|");
});
