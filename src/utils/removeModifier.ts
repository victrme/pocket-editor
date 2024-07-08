export default function removeModifier(editable: Element): HTMLDivElement | undefined {
	const content = document.createElement("div")
	const parent = editable.parentElement as HTMLElement

	if (!parent) {
		return
	}

	parent.className = "line"
	content.textContent = parent.textContent
	content.setAttribute("contenteditable", "true")

	Object.values(parent.childNodes).forEach((node) => node.remove())

	parent.appendChild(content)
	content.focus()

	return content
}
