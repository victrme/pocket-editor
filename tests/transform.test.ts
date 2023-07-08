import { test, expect } from "@playwright/test"

test.beforeEach(async ({ page }) => {
	await page.goto("http://localhost:4173")
})

test.describe("Press Enter", () => {
	test("After list adds list", async ({ page }) => {
		await page.locator("#pocket-editor [contenteditable]").nth(7).focus()
		await page.keyboard.press("ArrowLeft")
		await page.keyboard.press("Enter")

		const line = page.locator("#pocket-editor .line").nth(7)
		const listdot = line.locator(".list-dot")
		const cl = await line.getAttribute("class")

		expect(cl?.includes("list")).toBe(true)
		expect(listdot).toBeTruthy()
	})

	test("After todo adds todo", async ({ page }) => {
		await page.locator("#pocket-editor [contenteditable]").nth(9).focus()
		await page.keyboard.press("ArrowLeft")
		await page.keyboard.press("Enter")

		const line = page.locator("#pocket-editor .line").nth(9)
		const cl = await line.getAttribute("class")

		expect(cl?.includes("todo")).toBe(true)
		expect(line.locator("input")).toBeTruthy()
	})

	test("In list cuts text", async ({ page }) => {
		const editable = page.locator("#pocket-editor [contenteditable]").nth(6)
		const editabletext = (await editable.textContent()) ?? ""

		await editable.focus()
		await page.keyboard.down("Shift")

		for (let i = 0; i < editabletext.length; i++) {
			await page.keyboard.press("ArrowRight")
		}

		await page.keyboard.up("Shift")
		await page.keyboard.type("Hello world")

		for (let i = 0; i < 5; i++) {
			await page.keyboard.press("ArrowLeft")
		}

		await page.keyboard.press("Enter")

		const line = page.locator("#pocket-editor .line").nth(7)

		expect(await line.textContent()).toBe("world")
		expect(line.locator(".list-dot")).toBeTruthy()
	})

	test("In todo cuts text", async ({ page }) => {
		const editable = page.locator("#pocket-editor [contenteditable]").nth(9)
		const editabletext = (await editable.textContent()) ?? ""

		await editable.focus()
		await page.keyboard.down("Shift")

		for (let i = 0; i < editabletext.length; i++) {
			await page.keyboard.press("ArrowRight")
		}

		await page.keyboard.up("Shift")
		await page.keyboard.type("Hello world")

		for (let i = 0; i < 5; i++) {
			await page.keyboard.press("ArrowLeft")
		}

		await page.keyboard.press("Enter")

		const line = page.locator("#pocket-editor .line").nth(10)
		const cl = await line.getAttribute("class")

		expect(cl?.includes("todo")).toBe(true)
		expect(line.locator("input")).toBeTruthy()
	})
})
