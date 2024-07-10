import { test, expect } from "@playwright/test"

test.beforeEach(async ({ page }) => {
	await page.goto("/")
})

test("Empty line places caret to previous", async ({ page }) => {
	const lines = await page.locator("[data-pocket-editor] > div").all()
	const firstText = (await lines[0].textContent()) ?? ""
	const linesLength = lines.length

	await lines[1].locator("[contenteditable]").clear()
	await lines[1].locator("[contenteditable]").focus()

	await page.keyboard.press("Backspace")
	expect((await page.locator("[data-pocket-editor] > div").all()).length).toBe(linesLength - 1)

	await page.keyboard.press("Backspace")
	expect(await lines[0].textContent()).toBe(firstText.slice(0, firstText.length - 1))
})

test("Non-empty line concats text to previous", async ({ page }) => {
	const lines = await page.locator("[data-pocket-editor] > div").all()
	const firstText = (await lines[0].textContent()) ?? ""
	const secondText = (await lines[1].textContent()) ?? ""

	await page.locator("[data-pocket-editor] [contenteditable]").nth(1).focus()
	await page.keyboard.press("Backspace")

	expect(await lines[0].textContent()).toBe(firstText + secondText)
})

test("Backspace removes a transform", async ({ page }) => {
	const element = page.locator("[data-pocket-editor] [contenteditable]").first()
	const line = page.locator("[data-pocket-editor] > div").first()

	await element.focus()
	await page.keyboard.press("Backspace")
	await expect(line).not.toHaveClass("h2")
})

test("Enter on empty list removes list", async ({ page }) => {
	const line = page.locator("[data-pocket-editor] > div").nth(2)
	await line.locator("[contenteditable]").clear()
	await line.locator("[contenteditable]").focus()
	await page.keyboard.press("Enter")
	await expect(line).not.toHaveClass("list")
})

test("Enter on empty todo removes todo", async ({ page }) => {
	const line = page.locator("[data-pocket-editor] > div").nth(8)
	await line.locator("[contenteditable]").clear()
	await line.locator("[contenteditable]").focus()
	await page.keyboard.press("Enter")
	await expect(line).not.toHaveClass("todo")
})
