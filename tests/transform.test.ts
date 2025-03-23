import { test, expect } from "@playwright/test"
import type { Locator } from "@playwright/test"

test.beforeEach(async ({ page }) => {
	await page.goto("/")
})

test.describe("Press Enter", () => {
	test("After list adds list", async ({ page }) => {
		await page.locator("[data-pocket-editor] [contenteditable]").nth(7).focus()
		await page.keyboard.press("ArrowLeft")
		await page.keyboard.press("Enter")

		const line = page.locator("[data-pocket-editor] > div").nth(7)
		const listdot = line.locator("[data-list-marker]")
		const list = await line.getAttribute("data-list")

		expect(list).toEqual("")
		expect(listdot).toBeTruthy()
	})

	test("After todo adds todo", async ({ page }) => {
		await page.locator("[data-pocket-editor] [contenteditable]").nth(9).focus()
		await page.keyboard.press("ArrowLeft")
		await page.keyboard.press("Enter")

		const line = page.locator("[data-pocket-editor] > div").nth(9)
		const todo = await line.getAttribute("data-todo")

		expect(todo).toEqual("")
		expect(line.locator("input")).toBeTruthy()
	})

	test("In list cuts text", async ({ page }) => {
		const editable = page.locator("[data-pocket-editor] [contenteditable]").nth(6)
		const editabletext = (await editable.textContent()) ?? ""

		await editable.focus()
		await page.keyboard.down("Shift")

		for (const _ of editabletext) {
			await page.keyboard.press("ArrowRight")
		}

		await page.keyboard.up("Shift")
		await page.keyboard.type("Hello world")

		for (let i = 0; i < 5; i++) {
			await page.keyboard.press("ArrowLeft")
		}

		await page.keyboard.press("Enter")

		const line = page.locator("[data-pocket-editor] > div").nth(7)

		expect(await line.textContent()).toBe("world")
		expect(line.locator("[data-list-marker]")).toBeTruthy()
	})

	test("In todo cuts text", async ({ page }) => {
		const editable = page.locator("[data-pocket-editor] [contenteditable]").nth(9)
		const editabletext = (await editable.textContent()) ?? ""

		await editable.focus()
		await page.keyboard.down("Shift")

		for (const _ of editabletext) {
			await page.keyboard.press("ArrowRight")
		}

		await page.keyboard.up("Shift")
		await page.keyboard.type("Hello world")

		for (let i = 0; i < 5; i++) {
			await page.keyboard.press("ArrowLeft")
		}

		await page.keyboard.press("Enter")

		const line = page.locator("[data-pocket-editor] > div").nth(10)
		const todo = await line.getAttribute("data-todo")

		expect(todo).toEqual("")
		expect(line.locator("input")).toBeTruthy()
	})
})

test.describe("Type Markdown", () => {
	let editable: Locator
	let line: Locator

	test.beforeEach(async ({ page, isMobile }) => {
		test.fixme(isMobile, "Needs a zero white space fix")

		editable = page.locator("[data-pocket-editor] [contenteditable]").first()
		line = page.locator("[data-pocket-editor] > div").first()
		await editable.clear()
		await page.keyboard.press("Backspace")
	})

	test("Editable is empty", async () => {
		expect(await editable.textContent()).toBe("")
	})

	test("to add big heading", async ({ page }) => {
		await page.keyboard.type("# hello world")
		expect(await line.getAttribute("data-h1")).toEqual("")
		expect(await editable.textContent()).toBe("hello world")
	})

	test("to add medium heading", async ({ page }) => {
		await page.keyboard.type("## hello world")
		expect(await line.getAttribute("data-h2")).toEqual("")
		expect(await editable.textContent()).toBe("hello world")
	})

	test("to add small heading", async ({ page }) => {
		await page.keyboard.type("### hello world")
		expect(await line.getAttribute("data-h3")).toEqual("")
		expect(await editable.textContent()).toBe("hello world")
	})

	test("to add list", async ({ page }) => {
		await page.keyboard.type("- hello world")
		expect(await line.getAttribute("data-list")).toEqual("")
		expect(await editable.textContent()).toBe("hello world")
	})

	test("to add todo", async ({ page }) => {
		await page.keyboard.type("[ ] hello world")
		expect(await line.getAttribute("data-todo")).toEqual("")
		expect(await editable.textContent()).toBe("hello world")
	})

	test("to add checked todo", async ({ page }) => {
		await page.keyboard.type("[x] hello world")
		expect(await line.getAttribute("data-todo-checked")).toEqual("")
		expect(await editable.textContent()).toBe("hello world")
	})
})
