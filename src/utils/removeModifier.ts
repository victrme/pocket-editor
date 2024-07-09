export default function removeModifier(editable: Element): HTMLDivElement | undefined {
	const content = document.createElement("div")
	const parent = editable.parentElement as HTMLElement

	if (!parent) {
		return
	}

	delete parent.dataset.list
	delete parent.dataset.todo
	delete parent.dataset.h1
	delete parent.dataset.h2
	delete parent.dataset.h3
	delete parent.dataset.todoChecked

	content.textContent = parent.textContent
	content.setAttribute("contenteditable", "true")

	Object.values(parent.childNodes).forEach((node) => node.remove())

	parent.appendChild(content)
	content.focus()

	return content
}
