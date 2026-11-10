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

test("consumed Escape closes the menu, stays marked, and still bubbles", async ({
	page,
}) => {
	await page.goto("/");
	const trigger = page.getByRole("button", { name: "Stack" });
	await trigger.click();
	await expect(page.getByRole("menu")).toBeVisible();
	await page.evaluate(() => {
		document.body.addEventListener("keydown", (event) => {
			document.body.dataset.escapeKey = event.key;
			document.body.dataset.escapePrevented = String(
				event.defaultPrevented,
			);
		});
	});

	await page.keyboard.press("Escape");
	await expect(page.getByRole("menu")).toHaveCount(0);
	await expect(page.locator("body")).toHaveAttribute(
		"data-escape-key",
		"Escape",
	);
	await expect(page.locator("body")).toHaveAttribute(
		"data-escape-prevented",
		"true",
	);
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
