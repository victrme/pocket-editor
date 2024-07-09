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

	if (!line || line?.className.includes(mod)) {
		return
	}

	line.className = "line"
	line.querySelector("span.list-dot")?.remove()
	line.querySelector("span.todo-marker")?.remove()

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
			line.className = "line " + tag
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
		let content = editable.textContent ?? ""

		if (!line || line.className.includes("todo")) {
			return
		}

		if (content.startsWith("[ ]") || content.startsWith("[x]")) {
			content = content.slice(4, content.length)
		}

		input.type = "checkbox"
		input.name = "checkbox"
		input.setAttribute("aria-label", "todo list checkbox")

		input.addEventListener("input", () => {
			line.classList.toggle("todo-checked", input.checked)
			line.classList.toggle("todo", !input.checked)
			if (input.checked) input.setAttribute("checked", "")
			else input.removeAttribute("checked")
		})

		if (checked) {
			input.setAttribute("checked", "")
		}

		line.className = "line todo" + (checked ? "-checked" : "")
		span.className = "todo-marker"
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
		let content = editable.textContent ?? ""

		if (!line || line.className.includes("list")) {
			return
		}

		if (content.startsWith("-")) {
			content = content?.replace("-", "").trimStart()
		}

		span.dataset.content = "•"
		span.className = "list-dot"
		line.className = "line list"
		p.textContent = content
		p.setAttribute("contenteditable", "true")
		editable.replaceWith(p)
		line.prepend(span)

		if (focus) {
			setCaret(p)
		}
	}
}
