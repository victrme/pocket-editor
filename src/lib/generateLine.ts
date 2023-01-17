export function generateLine(props?: { text?: string; modif?: string }) {
	const notesline = document.createElement("div")
	const editable = document.createElement("div")

	editable.classList.add("editable")
	notesline.classList.add("notes-line")
	editable.setAttribute("contenteditable", "true")
	notesline.appendChild(editable)

	// Add text if any
	if (typeof props?.text === "string") editable.innerText = props?.text

	// Transform line
	const transform = transformLine()
	switch (props?.modif) {
		case "todo":
		case "todo-checked":
			transform.toTodolist(editable, props?.modif === "todo-checked")
			break

		case "unordered":
			transform.toUnorderedList(editable)
			break

		case "h1":
		case "h2":
		case "h3":
			transform.toHeading(editable, props?.modif)
			break
	}

	return notesline
}

export function transformLine() {
	function toHeading(target: HTMLElement, tag: string) {
		const heading = document.createElement(tag)

		// Remove markdown characters
		let toSlice = tag === "h1" ? 1 : tag === "h2" ? 2 : 3
		heading.textContent = target.textContent?.slice(toSlice) || ""

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

		target.innerText = target.innerText?.slice(3) || ""
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

		target.innerText = target.innerText?.slice(2) || ""
		target.focus()
	}

	return { toHeading, toTodolist, toUnorderedList }
}
