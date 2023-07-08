import { test, expect, Locator } from "@playwright/test"

test.beforeEach(async ({ page }) => {
	await page.goto("http://localhost:4173")
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

test.describe("Line Selection", () => {
	let element: Locator
	let text: string

	test.beforeEach(async ({ page }) => {
		element = page.locator("#pocket-editor [contenteditable]").nth(1)
		text = (await element.textContent()) ?? ""
		await element.focus()
	})

	test("Select all text in single line", async ({ page }) => {
		await page.keyboard.down("Shift")

		for (let i = 0; i < text.length; i++) {
			await page.keyboard.press("ArrowRight")
		}

		await page.keyboard.up("Shift")
		await page.keyboard.press("Backspace")

		expect(await element.textContent()).toBe("")
	})

	test("Mouse move", async ({ page }) => {
		const box = await element.boundingBox()
		const { x, y, height } = box ?? { x: 0, y: 0, height: 0 }
		await page.mouse.move(x + 50, y)
		await page.mouse.down()
		await page.mouse.move(x + 50, y + height + 10)

		const lines = await page.locator("#pocket-editor .line.sel").all()
		expect(lines.length).toBe(2)
	})

	test("Left arrow at start", async ({ page }) => {
		await page.keyboard.down("Shift")
		await page.keyboard.press("ArrowLeft")

		const line = page.locator("#pocket-editor .line").nth(1)
		const cl = (await line.getAttribute("class")) ?? ""

		expect(cl.includes("sel")).toBe(true)
	})

	test("Right arrow at end", async ({ page }) => {
		for (let i = 0; i < text.length; i++) {
			await page.keyboard.press("ArrowRight")
		}

		await page.keyboard.down("Shift")
		await page.keyboard.press("ArrowRight")

		const line = page.locator("#pocket-editor .line").nth(1)
		const cl = (await line.getAttribute("class")) ?? ""

		expect(cl.includes("sel")).toBe(true)
	})

	test("Up arrow", async ({ page }) => {
		await page.keyboard.down("Shift")
		await page.keyboard.press("ArrowUp")

		const line = page.locator("#pocket-editor .line").nth(1)
		const cl = (await line.getAttribute("class")) ?? ""

		expect(cl.includes("sel")).toBe(true)
	})

	test("Down arrow", async ({ page }) => {
		await page.keyboard.down("Shift")
		await page.keyboard.press("ArrowDown")

		const line = page.locator("#pocket-editor .line").nth(1)
		const cl = (await line.getAttribute("class")) ?? ""

		expect(cl.includes("sel")).toBe(true)
	})

	test("Escape removes selection", async ({ page }) => {
		const line = page.locator("#pocket-editor .line").nth(1)

		await page.keyboard.down("Shift")
		await page.keyboard.press("ArrowUp")

		expect(((await line.getAttribute("class")) ?? "").includes("sel")).toBe(true)
		await page.keyboard.press("Escape")
		expect(((await line.getAttribute("class")) ?? "").includes("sel")).toBe(false)
	})

	test("Selects to top", async ({ page }) => {
		await page.keyboard.down("Shift")
		await page.keyboard.press("ArrowUp")
		await page.keyboard.press("ArrowUp")
		await page.keyboard.press("ArrowUp")
		await page.keyboard.press("ArrowUp")

		const lines = (await page.locator("#pocket-editor .line.sel").all()).length
		expect(lines).toBe(2)
	})

	test("Selects to bottom", async ({ page }) => {
		await page.keyboard.down("Shift")

		for (let i = 0; i < 10; i++) {
			await page.keyboard.press("ArrowDown")
		}

		const lines = (await page.locator("#pocket-editor .line.sel").all()).length
		expect(lines).toBe(9)
	})

	test("No shifts selects one line", async ({ page }) => {
		await page.keyboard.down("Shift")
		await page.keyboard.press("ArrowDown")
		await page.keyboard.press("ArrowDown")
		await page.keyboard.up("Shift")
		await page.keyboard.press("ArrowDown")

		const line = page.locator("#pocket-editor .line").nth(3)
		expect(((await line.getAttribute("class")) ?? "").includes("sel")).toBe(true)
	})
})
