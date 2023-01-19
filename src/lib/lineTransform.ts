function toHeading(target: HTMLElement, tag: string) {
	const heading = document.createElement(tag)

	// Remove markdown characters
	let mod = tag === "h1" ? "#" : tag === "h2" ? "##" : "###"
	heading.textContent = target.textContent?.replace(mod, "").trimStart() || ""

	heading.setAttribute("contenteditable", "true")
	heading.classList.add("editable")

	target.parentElement?.classList.add("modif-line")
	target.parentElement?.classList.add(
		tag === "h1" ? "heading-big" : tag === "h2" ? "heading-medium" : "heading-small"
	)

	target.replaceWith(heading)
	heading.focus()
}

function toTodolist(target: HTMLElement, checked?: boolean) {
	const input = document.createElement("input")
	const parent = target.parentElement

	if (!parent) return

	input.type = "checkbox"
	input.addEventListener("input", () => {
		if (input.checked) input.setAttribute("checked", "")
		else input.removeAttribute("checked")
	})

	if (checked) input.checked = true

	parent?.classList.add("modif-line")
	parent?.classList.add("todo-list")
	parent.prepend(input)

	target.innerText = target.innerText?.replace("[ ]", "").replace("[x]", "").trimStart()
	target.focus()
}

function toUnorderedList(target: HTMLElement) {
	const span = document.createElement("span")
	const parent = target.parentElement

	if (!parent) return

	span.dataset.content = "•"
	span.classList.add("list-dot")

	parent?.classList.add("modif-line")
	parent?.classList.add("unordered-list")
	parent.prepend(span)

	target.innerText = target.innerText?.replace("-", "").trimStart()
	target.focus()
}

export default { toHeading, toTodolist, toUnorderedList }
