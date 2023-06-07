import { getLineFromEditable } from "../utils/getLines"

function toHeading(editable: HTMLElement, tag: string, focus?: true) {
	const heading = document.createElement(tag)
	const line = getLineFromEditable(editable)

	// Remove markdown characters
	let mod = tag === "h1" ? "#" : tag === "h2" ? "##" : "###"
	heading.textContent = editable.textContent?.replace(mod, "").trimStart() || ""

	heading.setAttribute("contenteditable", "true")

	if (line) {
		line.className = "line mod " + tag
		editable.replaceWith(heading)
	}

	if (focus) {
		heading.focus()
	}
}

function toTodolist(editable: HTMLElement, checked: boolean, focus?: true) {
	const input = document.createElement("input")
	const span = document.createElement("span")
	const line = getLineFromEditable(editable)

	if (!line) return

	input.type = "checkbox"
	input.addEventListener("input", () => {
		if (input.checked) input.setAttribute("checked", "")
		else input.removeAttribute("checked")
	})

	if (checked) {
		input.setAttribute("checked", "")
	}

	line.className = "line mod todo"
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

function toUnorderedList(editable: HTMLElement, focus?: true) {
	const span = document.createElement("span")
	const line = getLineFromEditable(editable)

	if (!line) return

	span.dataset.content = "•"
	span.className = "list-dot"
	line.className = "line mod ul-list"
	line.prepend(span)

	if (editable.textContent?.indexOf("-") === 0) {
		editable.textContent = editable.textContent?.replace("-", "").trimStart()
	}

	if (focus) {
		editable.focus()
	}
}

export default { toHeading, toTodolist, toUnorderedList }
