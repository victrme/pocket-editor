import { describe, expect, test, beforeAll } from "@jest/globals"
import pocketEditor from "./index"

let editor = pocketEditor("")

beforeAll(() => {
	const wrapper = document.createElement("div")
	wrapper.id = "wrapper"
	document.body.appendChild(wrapper)
	editor = pocketEditor("wrapper")
})

describe("Is working", () => {
	test("Appends to wrapper", () => {
		expect(document.getElementById("pocket-editor")?.id).toEqual("pocket-editor")
	})

	test("Sets text", () => {
		const text = "Hello world"
		editor.set(text)
		setTimeout(() => {
			expect(document.getElementById("pocket-editor")?.textContent).toEqual(text)
		}, 1)
	})

	test("Sets multiple lines", () => {
		const text = `Hello\nworld`
		editor.set(text)
		setTimeout(() => {
			expect(document.querySelectorAll("#pocket-editor .line")?.length).toEqual(2)
		}, 1)
	})

	test("Gets text", () => {
		const text = "Hello world"
		editor.set(text)
		setTimeout(() => {
			expect(editor.get()).toEqual(text)
		}, 1)
	})
})

describe("Line transform", () => {
	const text = `Hello world\n\n# h1\n\n## h2\n\n### h3\n\n- ul\n\n- ul\n\n[ ] c\n\n[x] cc`
	editor.set(text)

	test("Has big heading", () => {
		setTimeout(() => expect(!!document.querySelector("h1")).toBe(true), 1)
	})

	test("Has medium heading", () => {
		setTimeout(() => expect(!!document.querySelector("h2")).toBe(true), 1)
	})

	test("Has small heading", () => {
		setTimeout(() => expect(!!document.querySelector("h3")).toBe(true), 1)
	})

	test("Has unordered list", () => {
		setTimeout(() => expect(!!document.querySelector("span.list-dot")).toBe(true), 1)
	})

	test("Has checkbox", () => {
		setTimeout(() => expect(!!document.querySelector("input[type='checkbox']")).toBe(true), 1)
	})

	test("Has checked checkbox", () => {
		setTimeout(() => expect(!!document.querySelector("input[type='checkbox']:checked")).toBe(true), 1)
	})
})
