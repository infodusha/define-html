import { test, expect, selectors } from "@playwright/test";

function createTagNameEngine() {
	return {
		query(root: Document, selector: string) {
			return root.querySelector(selector);
		},
		queryAll(root: Document, selector: string) {
			return Array.from(root.querySelectorAll(selector));
		},
	};
}

await selectors.register("tag", createTagNameEngine);

test.beforeEach(async ({ page }) => {
	await page.goto("/example");
	await page.waitForLoadState("networkidle");
});

test("opens example page", async ({ page }) => {
	await expect(page).toHaveTitle("define-html");
});

test("app-header has content", async ({ page }) => {
	const appHeader = page.locator("tag=app-root").first();
	const appHeaderHtml = await appHeader.innerHTML();
	expect(appHeaderHtml.length).toBeGreaterThan(0);
});
