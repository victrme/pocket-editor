import { test, expect } from "@playwright/test"

test.describe("Contenteditable Text Editor", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("http://localhost:4173")
	})

	test.afterAll(async ({ page }) => {
		await page.close()
	})

	test("Pocket editor exists", async ({ page }) => {
		const dom = page.locator("#pocket-editor")
		expect(dom).toBeTruthy()
	})

	test("should move the cursor", async ({ page }) => {
		await page.click("#pocket-editor") // Replace with your editor's selector

		await page.keyboard.press("ArrowRight")
		await page.keyboard.press("ArrowRight")

		const cursorPosition = await page.evaluate(() => {
			const selection = window.getSelection()
			return selection?.getRangeAt(0).startOffset
		})

		expect(cursorPosition).toBe(2)
	})

	test("should add a new line", async ({ page }) => {
		await page.locator("#pocket-editor [contenteditable]").first().focus()

		const oldlines = await page.$$eval(".line", (lines) => lines.length)
		await page.keyboard.press("ArrowRight")
		await page.keyboard.press("Enter")
		const newlines = await page.$$eval(".line", (lines) => lines.length)

		expect(newlines).toBe(oldlines + 1)
	})

	test("should remove a line", async ({ page }) => {
		const oldlines = await page.$$eval(".line", (lines) => lines.length)

		await page.locator("#pocket-editor [contenteditable]").nth(1).focus()
		await page.keyboard.press("Backspace")

		const newlines = await page.$$eval(".line", (lines) => lines.length)

		expect(newlines).toBe(oldlines - 1)
	})

	test("backspace removes a transform", async ({ page }) => {
		const element = page.locator("#pocket-editor [contenteditable]").first()
		const line = page.locator("#pocket-editor .line").first()

		await element.focus()
		await page.keyboard.press("Backspace")

		await expect(line).not.toHaveClass("h2")
	})
})
