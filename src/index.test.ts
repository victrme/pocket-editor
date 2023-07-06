import { test, expect } from "@playwright/test"

test("has title", async ({ page }) => {
	await page.goto("localhost:4173")
	await expect(page).toHaveTitle("Pocket editor example")
})
