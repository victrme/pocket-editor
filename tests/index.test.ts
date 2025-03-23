import { test, expect } from "@playwright/test"

test.beforeEach(async ({ page }) => {
	await page.goto("/")
})

test("Pocket editor exists", async ({ page }) => {
	await page.waitForSelector("[data-pocket-editor]")
	const dom = page.locator("[data-pocket-editor]")
	expect(dom).toBeTruthy()
})

test("Add a new line", async ({ page }) => {
	await page.locator("[data-pocket-editor] [contenteditable]").first().focus()

	const oldlines = await page.$$eval("[data-pocket-editor] > div", lines => lines.length)
	await page.keyboard.press("ArrowRight")
	await page.keyboard.press("Enter")
	const newlines = await page.$$eval("[data-pocket-editor] > div", lines => lines.length)

	expect(newlines).toBe(oldlines + 1)
})
