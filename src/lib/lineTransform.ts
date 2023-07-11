import { getLineFromEditable } from "../utils/getLines"
import modList from "../utils/modList"

type Mods = keyof typeof modList

export default function lineTransform(editable: HTMLElement, mod?: Mods, focus = true) {
	const line = getLineFromEditable(editable)

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
			heading.focus()
		}
	}

	function toTodolist(checked: boolean) {
		const input = document.createElement("input")
		const span = document.createElement("span")
		const line = getLineFromEditable(editable)

		if (!line || line.className.includes("todo")) {
			return
		}

		input.type = "checkbox"
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
		span.appendChild(input)
		line.prepend(span)

		const str = editable.textContent || ""
		if (str.indexOf("[ ]") === 0 || str.indexOf("[x]") === 0) {
			editable.textContent = str.slice(4, str.length)
		}

		if (focus) {
			editable.focus()
		}
	}

	function toList() {
		const span = document.createElement("span")

		if (!line || line.className.includes("list")) {
			return
		}

		span.dataset.content = "•"
		span.className = "list-dot"
		line.className = "line list"
		line.prepend(span)

		if (editable.textContent?.indexOf("-") === 0) {
			editable.textContent = editable.textContent?.replace("-", "").trimStart()
		}

		if (focus) {
			editable.focus()
		}
	}

	switch (mod) {
		case "h1":
			toHeading("h1")
			break

		case "h2":
			toHeading("h2")
			break

		case "h3":
			toHeading("h3")
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
}
