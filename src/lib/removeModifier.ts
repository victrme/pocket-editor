export default function removeModifier(editable: Element) {
	const content = document.createElement("div")
	const parent = editable.parentElement as HTMLElement
	if (!parent) return

	parent.className = "notes-line"
	content.textContent = parent.textContent

	content.classList.add("editable")
	content.setAttribute("contenteditable", "true")

	Object.values(parent.childNodes).forEach((node) => node.remove())

	parent.appendChild(content)
	content.focus()
}
