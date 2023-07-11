import { test, expect, Locator } from "@playwright/test"

let line: Locator

test.beforeEach(async ({ page }) => {
	await page.goto("http://localhost:4173")
	line = page.locator(".line").nth(1)
	await line.locator("[contenteditable]").focus()
})

test("Big heading", async ({ page }) => {
	await page.keyboard.press("Control+Shift+Digit1")
	await expect(line).toHaveClass("line h1")
})

test("Medium heading", async ({ page }) => {
	await page.keyboard.press("Control+Shift+Digit2")
	await expect(line).toHaveClass("line h2")
})

test("Small heading", async ({ page }) => {
	await page.keyboard.press("Control+Shift+Digit3")
	await expect(line).toHaveClass("line h3")
})

test("Unordered list", async ({ page }) => {
	await page.keyboard.press("Control+Shift+Digit4")
	await expect(line).toHaveClass("line list")
})

test("Todo list", async ({ page }) => {
	await page.keyboard.press("Control+Shift+Digit5")
	await expect(line).toHaveClass("line todo")
})

test("No headings overlap", async ({ page }) => {
	await page.keyboard.press("Control+Shift+Digit1")
	await expect(line).toHaveClass("line h1")

	await page.keyboard.press("Control+Shift+Digit2")
	await expect(line).toHaveClass("line h2")

	await page.keyboard.press("Control+Shift+Digit3")
	await expect(line).toHaveClass("line h3")
})

test("No list overlap", async ({ page }) => {
	await page.keyboard.press("Control+Shift+Digit4")
	await expect(line).toHaveClass("line list")
	expect((await line.locator("span").all()).length).toBe(1)

	await page.keyboard.press("Control+Shift+Digit5")
	await expect(line).toHaveClass("line todo")
	expect((await line.locator("span").all()).length).toBe(1)

	await page.keyboard.press("Control+Shift+Digit4")
	await expect(line).toHaveClass("line list")
	expect((await line.locator("span").all()).length).toBe(1)
})

test("No title in lists and todos", async ({ page }) => {
	await page.keyboard.press("Control+Shift+Digit4")
	await expect(line).toHaveClass("line list")
	expect(line.locator("span")).toBeTruthy()

	await page.keyboard.press("Control+Shift+Digit3")
	await expect(line).toHaveClass("line h3")
	expect(line.locator("span")).toBeFalsy()
})
