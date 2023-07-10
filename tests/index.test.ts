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
