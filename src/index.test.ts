import { describe, expect, test, beforeEach } from "@jest/globals"
import pocketEditor from "./index"

let editor = pocketEditor("")

beforeEach(() => {
	Object.values(document.body.childNodes).forEach((node) => node.remove())

	const wrapper = document.createElement("div")
	wrapper.id = "wrapper"
	document.body.appendChild(wrapper)
	editor = pocketEditor("wrapper")
})

describe("Is working", () => {
	test("Appends to wrapper", () => {
		expect(document.getElementById("pocket-editor")?.id).toEqual("pocket-editor")
	})

	test("Sets text", async () => {
		const text = "Hello world"
		editor.set(text)
		expect(document.getElementById("pocket-editor")?.textContent).toEqual(text)
	})

	test("Sets multiple lines", () => {
		const text = `Hello\nworld`
		editor.set(text)
		expect(document.querySelectorAll("#pocket-editor .line")?.length).toEqual(2)
	})

	test("Gets text", () => {
		const text = "Hello world"
		editor.set(text)
		expect(editor.get()).toEqual(text)
	})
})

describe("Line transform", () => {
	const text = `Hello world\n\n# h1\n\n## h2\n\n### h3\n\n- ul\n\n- ul\n\n[ ] c\n\n[x] cc`

	editor.set(text)

	test("Has big heading", () => {
		expect(!!document.querySelector("h1")).toBe(true)
	})
	test("Has medium heading", () => {
		expect(!!document.querySelector("h2")).toBe(true)
	})
	test("Has small heading", () => {
		expect(!!document.querySelector("h3")).toBe(true)
	})
	test("Has unordered list", () => {
		expect(!!document.querySelector("span.list-dot")).toBe(true)
	})
	test("Has checkbox", () => {
		expect(!!document.querySelector("input[type='checkbox']")).toBe(true)
	})
	test("Has checked checkbox", () => {
		expect(!!document.querySelector("input[type='checkbox']:checked")).toBe(true)
	})
})
