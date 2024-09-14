import PocketEditor from "../index"
import setCaret from "../utils/setCaret"

export default function lineTransform(
	self: PocketEditor,
	editable: HTMLElement,
	mod?: keyof typeof self.mods,
	focus = true
) {
	if (!mod) return

	const line = self.getLineFromEditable(editable)

	if (!line || line?.dataset[mod]) {
		return
	}

	line.querySelector("span[data-list-marker]")?.remove()
	line.querySelector("span[data-todo-marker]")?.remove()

	delete line.dataset.h1
	delete line.dataset.h2
	delete line.dataset.h3
	delete line.dataset.list
	delete line.dataset.todo
	delete line.dataset.todoChecked

	switch (mod) {
		case "h1":
		case "h2":
		case "h3":
			toHeading(mod)
			break

		case "list":
			toList()
			break

		case "todo":
			toTodolist(false)
			break

		case "todo-checked":
			toTodolist(true)
			break
	}

	function toHeading(tag: "h1" | "h2" | "h3") {
		const heading = document.createElement(tag)

		// Remove markdown characters
		let mod = tag === "h1" ? "#" : tag === "h2" ? "##" : "###"
		heading.textContent = editable.textContent?.replace(mod, "").trimStart() || ""

		heading.setAttribute("contenteditable", "true")

		if (line) {
			line.dataset[tag] = ""
			editable.replaceWith(heading)
		}

		if (focus) {
			setCaret(heading)
		}
	}

	function toTodolist(checked: boolean) {
		const input = document.createElement("input")
		const span = document.createElement("span")
		const p = document.createElement("p")
		const line = self.getLineFromEditable(editable)
		let content = (editable.textContent ?? "").replace(self.ZERO_WIDTH_WHITESPACE, "")

		if (!line || line.dataset.todo) {
			return
		}

		if (content.startsWith("[ ]") || content.startsWith("[x]")) {
			content = content.slice(4, content.length)
		}

		input.type = "checkbox"
		input.name = "checkbox"
		input.setAttribute("aria-label", "todo list checkbox")

		input.addEventListener("input", () => {
			if (input.checked) {
				line.setAttribute("data-todo-checked", "")
				input.setAttribute("checked", "")
			} else {
				line.removeAttribute("data-todo-checked")
				line.setAttribute("data-todo", "")
				input.removeAttribute("checked")
			}
		})

		if (checked) {
			input.setAttribute("checked", "")
			line.dataset.todoChecked = ""
		}

		line.dataset.todo = ""
		span.dataset.todoMarker = ""
		p.textContent = content
		p.setAttribute("contenteditable", "true")
		editable.replaceWith(p)
		span.appendChild(input)
		line.prepend(span)

		if (focus) {
			setCaret(p)
		}
	}

	function toList() {
		const span = document.createElement("span")
		const p = document.createElement("p")
		let content = (editable.textContent ?? "").replace(self.ZERO_WIDTH_WHITESPACE, "")

		if (!line || line.dataset.list === "") {
			return
		}

		if (content.startsWith("-")) {
			content = content?.replace("-", "").trimStart()
		}

		line.dataset.list = ""
		span.dataset.content = "•"
		span.dataset.listMarker = ""
		p.textContent = content
		p.setAttribute("contenteditable", "true")
		editable.replaceWith(p)
		line.prepend(span)

		if (focus) {
			setCaret(p)
		}
	}
}
