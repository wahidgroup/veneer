import { expect, test } from "@playwright/test";

test("log viewer showcase streams lines from the API", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("link", { name: "Workflow" }).click();
	await page.getByRole("tab", { name: "LogViewer" }).click();

	await expect(page.getByRole("log", { name: "Apply logs" })).toBeVisible({
		timeout: 30_000,
	});
	await expect(page.getByRole("log", { name: "Apply logs" })).toContainText("planner:", { timeout: 15_000 });

	await page.getByRole("switch", { name: "Streaming" }).click();
	await expect(page.getByRole("log", { name: "Apply logs" })).toContainText("apply:", { timeout: 15_000 });
});
