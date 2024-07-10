import { test, expect, Locator } from "@playwright/test"

let line: Locator

test.beforeEach(async ({ page }) => {
	await page.goto("/")
	line = page.locator("[data-pocket-editor] > div").nth(1)
	await line.locator("[contenteditable]").focus()
})

test("Big heading", async ({ page }) => {
	await page.keyboard.press("Control+Shift+Digit1")
	await expect(line).toHaveAttribute("data-h1")
})

test("Medium heading", async ({ page }) => {
	await page.keyboard.press("Control+Shift+Digit2")
	await expect(line).toHaveAttribute("data-h2")
})

test("Small heading", async ({ page }) => {
	await page.keyboard.press("Control+Shift+Digit3")
	await expect(line).toHaveAttribute("data-h3")
})

test("Unordered list", async ({ page }) => {
	await page.keyboard.press("Control+Shift+Digit4")
	await expect(line).toHaveAttribute("data-list")
})

test("Todo list", async ({ page }) => {
	await page.keyboard.press("Control+Shift+Digit5")
	await expect(line).toHaveAttribute("data-todo")
})

test("No headings overlap", async ({ page }) => {
	await page.keyboard.press("Control+Shift+Digit1")
	await expect(line).toHaveAttribute("data-h1")

	await page.keyboard.press("Control+Shift+Digit2")
	await expect(line).toHaveAttribute("data-h2")

	await page.keyboard.press("Control+Shift+Digit3")
	await expect(line).toHaveAttribute("data-h3")
})

test("No list overlap", async ({ page }) => {
	await page.keyboard.press("Control+Shift+Digit4")
	await expect(line).toHaveAttribute("data-list")
	expect((await line.locator("span").all()).length).toBe(1)

	await page.keyboard.press("Control+Shift+Digit5")
	await expect(line).toHaveAttribute("data-todo")
	expect((await line.locator("span").all()).length).toBe(1)

	await page.keyboard.press("Control+Shift+Digit4")
	await expect(line).toHaveAttribute("data-list")
	expect((await line.locator("span").all()).length).toBe(1)
})

test("No title in lists and todos", async ({ page }) => {
	await page.keyboard.press("Control+Shift+Digit4")
	await expect(line).toHaveAttribute("data-list")
	expect(await line.locator("span[data-list-marker]").count()).toBe(1)

	await page.keyboard.press("Control+Shift+Digit3")
	await expect(line).toHaveAttribute("data-h3")
	expect(await line.locator("span[data-list-marker]").count()).toBe(0)
})
