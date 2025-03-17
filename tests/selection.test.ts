import { test, expect } from "@playwright/test"
import type { Locator } from "@playwright/test"

let element: Locator
let line: Locator
let text: string

test.beforeEach(async ({ page, isMobile }) => {
	test.fixme(isMobile, "Selection is not available on mobile")

	await page.goto("/")

	line = page.locator("[data-pocket-editor] > div").nth(1)
	element = page.locator("[data-pocket-editor] [contenteditable]").nth(1)
	text = (await element.textContent()) ?? ""
	await element.focus()
})

test.describe("Selection", () => {
	test("All text in single line", async ({ page }) => {
		await page.keyboard.down("Shift")

		for (let i = 0; i < text.length; i++) {
			await page.keyboard.press("ArrowRight")
		}

		await page.keyboard.up("Shift")
		await page.keyboard.press("Backspace")

		expect(await element.textContent()).toBe("")
	})

	test("With shift + left", async ({ page }) => {
		await page.keyboard.down("Shift")
		await page.keyboard.press("ArrowLeft")
		expect(await line.getAttribute("data-selected")).toEqual("")
	})

	test("With shift + right", async ({ page }) => {
		for (let i = 0; i < text.length; i++) {
			await page.keyboard.press("ArrowRight")
		}

		await page.keyboard.down("Shift")
		await page.keyboard.press("ArrowRight")
		expect(await line.getAttribute("data-selected")).toEqual("")
	})

	test("With Shift + up", async ({ page }) => {
		await page.keyboard.down("Shift")
		await page.keyboard.press("ArrowUp")
		expect(await line.getAttribute("data-selected")).toEqual("")
	})

	test("With shift + down", async ({ page }) => {
		await page.keyboard.down("Shift")
		await page.keyboard.press("ArrowDown")
		expect(await line.getAttribute("data-selected")).toEqual("")
	})

	test("With mouse", async ({ page }) => {
		const box = await element.boundingBox()
		const { x, y } = box ?? { x: 0, y: 0 }
		await page.mouse.move(x + 50, y + 10)
		await page.mouse.down()
		await page.mouse.move(x + 50, y + 100)

		const lines = await page.locator("[data-pocket-editor] [data-selected]").all()
		expect(lines.length).toBe(4)
	})

	test("Max to top", async ({ page }) => {
		await page.keyboard.down("Shift")
		await page.keyboard.press("ArrowUp")
		await page.keyboard.press("ArrowUp")
		await page.keyboard.press("ArrowUp")

		const lines = (await page.locator("[data-pocket-editor] [data-selected]").all()).length
		expect(lines).toBe(2)
	})

	test("Max to bottom", async ({ page }) => {
		await page.keyboard.down("Shift")

		for (let i = 0; i < 10; i++) {
			await page.keyboard.press("ArrowDown")
		}

		const lines = (await page.locator("[data-pocket-editor] [data-selected]").all()).length
		expect(lines).toBe(9)
	})

	test("No shift moves selected line", async ({ page }) => {
		await page.keyboard.down("Shift")
		await page.keyboard.press("ArrowDown")
		await page.keyboard.press("ArrowDown")
		await page.keyboard.up("Shift")
		await page.keyboard.press("ArrowDown")

		const line = page.locator("[data-pocket-editor] > div").nth(3)
		expect(await line.getAttribute("data-selected")).toEqual("")
	})
})

test.describe("Action", () => {
	test.beforeEach(async ({ page }) => {
		await page.keyboard.down("Shift")
		await page.keyboard.press("ArrowUp")
		await page.keyboard.press("ArrowUp")
		await page.keyboard.up("Shift")
	})

	test("Click outside removes selection", async ({ page }) => {
		await page.locator("header").click()
		await page.waitForTimeout(100)
		expect(!(await line.getAttribute("data-selected"))).toBeTruthy()
	})

	test("Escape removes selection", async ({ page }) => {
		await page.keyboard.press("Escape")
		expect(!(await line.getAttribute("data-selected"))).toBeTruthy()
	})

	test("Backspace removes lines", async ({ page }) => {
		const linesAmount = (await page.locator("[data-pocket-editor] > div").all()).length

		await page.keyboard.press("Backspace")

		expect((await page.locator("[data-pocket-editor] > div").all()).length).toBe(linesAmount - 1)
		expect(await page.locator("[data-pocket-editor] > div").first().textContent()).toBe("")
	})

	test("Typing overwrites lines", async ({ page }) => {
		await page.keyboard.type("hello world")
		expect(page.getByText("hello world")).toBeTruthy()
	})
})
