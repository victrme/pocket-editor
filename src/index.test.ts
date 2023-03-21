import { describe, expect, test, beforeEach, beforeAll } from "@jest/globals"
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
})

describe("Set", () => {
	beforeEach(() => {
		const text = "Hello world\n\nHello !\n\nHello\tworld"
		editor.set(text)
	})

	test("Never empty", () => {
		editor.set("")
		expect(!!document.querySelector("[contenteditable]")).toBe(true)
		expect(document.querySelector("[contenteditable]")?.textContent).toEqual("")
	})

	test("Single line", () => {
		expect(document.querySelector(".line")?.textContent).toEqual("Hello world")
	})

	test("Multiple lines", () => {
		expect(document.querySelectorAll("#pocket-editor .line")?.length).toEqual(3)
	})

	test("Removes tabs", () => {
		expect(document.querySelectorAll(".line")[2]?.textContent).toEqual("Helloworld")
	})
})

describe("Get", () => {
	test("Single line", () => {
		const text = "Hello world"
		editor.set(text)
		expect(editor.get()).toEqual(text)
	})
})

describe("Line transform", () => {
	beforeEach(() => {
		editor.set(`Hello world\n\n# h1\n\n## h2\n\n### h3\n\n- ul\n\n- ul\n\n[ ] c\n\n[x] cc`)
	})

	test("Has big heading", () => {
		const title = document.querySelector("h1[contenteditable]")
		expect(title?.textContent).toEqual("h1")
		expect(title?.parentElement?.className).toEqual("line mod h1")
	})

	test("Has medium heading", () => {
		const title = document.querySelector("h2[contenteditable]")
		expect(title?.textContent).toEqual("h2")
		expect(title?.parentElement?.className).toEqual("line mod h2")
	})

	test("Has small heading", () => {
		const title = document.querySelector("h3[contenteditable]")
		expect(title?.textContent).toEqual("h3")
		expect(title?.parentElement?.className).toEqual("line mod h3")
	})

	test("Has unordered list", () => {
		const line = document.querySelector(".line.mod.ul-list")

		expect(!!line?.querySelector("span.list-dot")).toBe(true)
		expect(line?.querySelector("div[contenteditable]")?.textContent).toEqual("ul")
	})

	test("Has checkbox", () => {
		expect(!!document.querySelector("input[type='checkbox']")).toBe(true)
	})

	test("Has checked checkbox", () => {
		expect(!!document.querySelector("input[type='checkbox']:checked")).toBe(true)
	})
})
