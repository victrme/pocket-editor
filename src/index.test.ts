import { describe, expect, jest, test, beforeEach, afterEach } from "@jest/globals"
import pocketEditor from "./index"

let editor = pocketEditor("")

beforeEach(() => {
	const wrapper = document.createElement("div")
	wrapper.id = "wrapper"
	document.body.appendChild(wrapper)
	editor = pocketEditor("wrapper")
})

afterEach(() => {
	document.getElementById("wrapper")?.remove()
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

function setCaret(node: Node | null, pos = 0) {
	let range = new Range()
	let sel = window.getSelection()

	if (node) {
		range.setStart(node, pos)
		range.setEnd(node, pos)
		sel?.addRange(range)
	}
}

function dispatchInput(elem: Element | null, e: Pick<InputEvent, "data" | "inputType">) {
	if (!elem) throw "Element is null"

	elem.dispatchEvent(
		new InputEvent("beforeinput", {
			inputType: e.inputType,
			data: e.data,
			bubbles: true,
		})
	)
}

describe("Oninput", () => {
	test("Is called", () => {
		const editable = document.querySelector("[contenteditable]")

		editor.set("##hello")

		editor.oninput(() => {
			expect(editor.get()).toBe("e")
		})

		setCaret(editable)
		dispatchInput(editable, { data: "e", inputType: "insertText" })
	})
})

describe("Line addition", () => {
	test("", () => {})
})

describe("Line deletion", () => {
	beforeEach(() => {
		editor.set(`# Titre 1\n\n- liste\n- liste\n\nLigne normale\n\n`)
	})

	describe("Removes transform", () => {
		test("Title", () => {
			const editable = document.querySelectorAll("[contenteditable]")[0]

			setCaret(editable.childNodes[0])
			dispatchInput(editable, { inputType: "deleteContentBackward", data: "" })

			expect(document.querySelector("h1")).toBeNull()
		})
	})

	test("Removes empty line", () => {
		const lineslength = document.querySelectorAll(".line").length
		const editable = document.querySelectorAll("[contenteditable]")[lineslength - 1]

		setCaret(editable)
		dispatchInput(editable, { inputType: "deleteContentBackward", data: "" })

		expect(document.querySelectorAll(".line").length).toEqual(lineslength - 1)
	})

	test("Removes text line", () => {
		const editable = document.querySelectorAll("[contenteditable]")[3]

		setCaret(editable.childNodes[0])
		dispatchInput(editable, { inputType: "deleteContentBackward", data: "" })

		expect(document.querySelectorAll("[contenteditable]")[2]?.textContent).toEqual("listeLigne normale")
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
