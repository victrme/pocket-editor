import { test, expect, Locator } from "@playwright/test"

test.beforeEach(async ({ page }) => {
	await page.goto("/")
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

test.describe("Type Markdown", () => {
	let editable: Locator
	let line: Locator

	test.beforeEach(async ({ page }) => {
		editable = page.locator("#pocket-editor [contenteditable]").first()
		line = page.locator("#pocket-editor .line").first()
		await editable.clear()
		await page.keyboard.press("Backspace")
	})

	test("Editable is empty", async ({ page }) => {
		expect(await editable.textContent()).toBe("")
	})

	test("to add big heading", async ({ page }) => {
		await page.keyboard.type("# hello world")
		expect(await line.getAttribute("class")).toBe("line h1")
		expect(await editable.textContent()).toBe("hello world")
	})

	test("to add medium heading", async ({ page }) => {
		await page.keyboard.type("## hello world")
		expect(await line.getAttribute("class")).toBe("line h2")
		expect(await editable.textContent()).toBe("hello world")
	})

	test("to add small heading", async ({ page }) => {
		await page.keyboard.type("### hello world")
		expect(await line.getAttribute("class")).toBe("line h3")
		expect(await editable.textContent()).toBe("hello world")
	})

	test("to add list", async ({ page }) => {
		await page.keyboard.type("- hello world")
		expect(await line.getAttribute("class")).toBe("line list")
		expect(await editable.textContent()).toBe("hello world")
	})

	test("to add todo", async ({ page }) => {
		await page.keyboard.type("[ ] hello world")
		expect(await line.getAttribute("class")).toBe("line todo")
		expect(await editable.textContent()).toBe("hello world")
	})

	test("to add checked todo", async ({ page }) => {
		await page.keyboard.type("[x] hello world")
		expect(await line.getAttribute("class")).toBe("line todo-checked")
		expect(await editable.textContent()).toBe("hello world")
	})
})
