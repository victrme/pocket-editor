import { test, expect } from "@playwright/test"

test.beforeEach(async ({ page }) => {
	await page.goto("http://localhost:4173")
})

test("Pocket editor exists", async ({ page }) => {
	const dom = page.locator("#pocket-editor")
	expect(dom).toBeTruthy()
})

test("Add a new line", async ({ page }) => {
	await page.locator("#pocket-editor [contenteditable]").first().focus()

	const oldlines = await page.$$eval(".line", (lines) => lines.length)
	await page.keyboard.press("ArrowRight")
	await page.keyboard.press("Enter")
	const newlines = await page.$$eval(".line", (lines) => lines.length)

	expect(newlines).toBe(oldlines + 1)
})
