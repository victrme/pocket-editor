function toHeading(target: HTMLElement, tag: string, focus?: true) {
	const heading = document.createElement(tag)
	const parent = target.parentElement

	// Remove markdown characters
	let mod = tag === "h1" ? "#" : tag === "h2" ? "##" : "###"
	heading.textContent = target.textContent?.replace(mod, "").trimStart() || ""

	heading.setAttribute("contenteditable", "true")

	if (parent) {
		parent.className = "line mod " + tag
		target.replaceWith(heading)
	}

	if (focus) {
		heading.focus()
	}
}

function toTodolist(target: HTMLElement, checked: boolean, focus?: true) {
	const input = document.createElement("input")
	const parent = target.parentElement

	if (!parent) return

	input.type = "checkbox"
	input.addEventListener("input", () => {
		if (input.checked) input.setAttribute("checked", "")
		else input.removeAttribute("checked")
	})

	if (checked) {
		input.setAttribute("checked", "")
	}

	parent.className = "line mod todo"
	parent.prepend(input)

	const str = target.textContent || ""
	if (str.indexOf("[ ]") === 0 || str.indexOf("[x]") === 0) {
		target.textContent = str.slice(4, str.length)
	}

	if (focus) {
		target.focus()
	}
}

function toUnorderedList(target: HTMLElement, focus?: true) {
	const span = document.createElement("span")
	const parent = target.parentElement

	if (!parent) return

	span.dataset.content = "•"
	span.className = "list-dot"
	parent.className = "line mod ul-list"
	parent.prepend(span)

	if (target.textContent?.indexOf("-") === 0) {
		target.textContent = target.textContent?.replace("-", "").trimStart()
	}

	if (focus) {
		target.focus()
	}
}

export default { toHeading, toTodolist, toUnorderedList }
