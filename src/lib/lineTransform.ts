function toHeading(target: HTMLElement, tag: string) {
	const heading = document.createElement(tag)

	// Remove markdown characters
	let mod = tag === "h1" ? "#" : tag === "h2" ? "##" : "###"
	heading.textContent = target.textContent?.replace(mod, "").trimStart() || ""

	heading.setAttribute("contenteditable", "true")

	target.parentElement?.classList.add("mod")
	target.parentElement?.classList.remove("h3")
	target.parentElement?.classList.remove("h2")
	target.parentElement?.classList.remove("h1")
	target.parentElement?.classList.add(tag)
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

	if (checked) input.setAttribute("checked", "")

	parent?.classList.add("mod")
	parent?.classList.add("todo")
	parent.prepend(input)

	const str = target.textContent || ""
	if (str.indexOf("[ ]") === 0 || str.indexOf("[x]") === 0) {
		target.textContent = str.slice(4, str.length)
	}

	target.focus()
}

function toUnorderedList(target: HTMLElement) {
	const span = document.createElement("span")
	const parent = target.parentElement

	if (!parent) return

	span.dataset.content = "•"
	span.classList.add("list-dot")

	parent?.classList.add("mod")
	parent?.classList.add("ul-list")
	parent.prepend(span)

	if (target.textContent?.indexOf("-") === 0) {
		target.textContent = target.textContent?.replace("-", "").trimStart()
	}

	target.focus()
}

export default { toHeading, toTodolist, toUnorderedList }
