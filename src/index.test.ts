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

	test("Move the cursor", async ({ page }) => {
		await page.click("#pocket-editor") // Replace with your editor's selector

		await page.keyboard.press("ArrowRight")
		await page.keyboard.press("ArrowRight")

		const cursorPosition = await page.evaluate(() => {
			const selection = window.getSelection()
			return selection?.getRangeAt(0).startOffset
		})

		expect(cursorPosition).toBe(2)
	})

	test("Add a new line", async ({ page }) => {
		await page.locator("#pocket-editor [contenteditable]").first().focus()

		const oldlines = await page.$$eval(".line", (lines) => lines.length)
		await page.keyboard.press("ArrowRight")
		await page.keyboard.press("Enter")
		const newlines = await page.$$eval(".line", (lines) => lines.length)

		expect(newlines).toBe(oldlines + 1)
	})

	test("Remove a line", async ({ page }) => {
		const oldlines = await page.$$eval(".line", (lines) => lines.length)

		await page.locator("#pocket-editor [contenteditable]").nth(1).focus()
		await page.keyboard.press("Backspace")

		const newlines = await page.$$eval(".line", (lines) => lines.length)

		expect(newlines).toBe(oldlines - 1)
	})

	test("Backspace removes a transform", async ({ page }) => {
		const element = page.locator("#pocket-editor [contenteditable]").first()
		const line = page.locator("#pocket-editor .line").first()

		await element.focus()
		await page.keyboard.press("Backspace")

		await expect(line).not.toHaveClass("h2")
	})

	test("Enter adds a list item", async ({ page }) => {
		const element = page.locator("#pocket-editor [contenteditable]").nth(7)
		const text = (await element.textContent()) ?? ""

		await element.focus()

		for (let i = 0; i < text.length; i++) {
			await page.keyboard.press("Delete")
		}

		await page.keyboard.press("KeyA")
		await page.keyboard.press("Enter")

		const line = page.locator("#pocket-editor .line").nth(8)
		const lasttext = (await line.textContent()) ?? ""

		expect(lasttext).toBe("")
	})

	test("Enter adds a checkbox", async ({ page }) => {
		const element = page.locator("#pocket-editor [contenteditable]").last()
		const text = (await element.textContent()) ?? ""

		await element.focus()

		for (let i = 0; i < text.length; i++) {
			await page.keyboard.press("Delete")
		}

		await page.keyboard.press("KeyA")
		await page.keyboard.press("Enter")

		const line = page.locator("#pocket-editor .line").last()
		const lasttext = (await line.textContent()) ?? ""

		expect(lasttext).toBe("")
	})
})
