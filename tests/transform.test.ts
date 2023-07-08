import { test, expect } from "@playwright/test"

test.beforeEach(async ({ page }) => {
	await page.goto("http://localhost:4173")
})

test("Enter after list adds list", async ({ page }) => {
	await page.locator("#pocket-editor [contenteditable]").nth(7).focus()
	await page.keyboard.press("ArrowLeft")
	await page.keyboard.press("Enter")

	const newline = page.locator("#pocket-editor .line").nth(8)
	const listdot = page.locator("#pocket-editor .line .list-dot")
	const cl = await newline.getAttribute("class")

	expect(cl?.includes("list")).toBe(true)
	expect(listdot).toBeTruthy()
})
