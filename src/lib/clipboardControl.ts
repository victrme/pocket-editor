import { toHTML, toMarkdown, checkModifs } from "./contentControl"
import removeLines from "../utils/removeLines"

export function copyEvent(e: ClipboardEvent) {
	const selected = Object.values(document.querySelectorAll("#pocket-editor .sel"))

	if (selected.length > 0) {
		e.clipboardData?.setData("text/plain", toMarkdown(selected))
		e.preventDefault()
	}
}

export function cutEvent(e: ClipboardEvent, container: Element) {
	const selected = Object.values(document.querySelectorAll("#pocket-editor .sel"))

	if (selected.length > 0) {
		e.clipboardData?.setData("text/plain", toMarkdown(selected))
		e.preventDefault()
		removeLines(selected, container)
	}
}

export function pasteEvent(e: ClipboardEvent, container: Element) {
	e.preventDefault()

	// For now
	// transform paste content to plaintext
	const selection = window.getSelection()
	const range = selection?.getRangeAt(0)
	const text = e.clipboardData?.getData("text") || ""

	// Text starts with a spcial char, create new lines
	if (checkModifs(text) !== "") {
		let notesline = (e.target as Element)?.parentElement
		const newHTML = toHTML(text)

		// When pasting after selection, line is last selected block
		const selected = Object.values(document.querySelectorAll("#pocket-editor  .sel"))
		if (selected.length > 0) notesline = selected.at(-1) as HTMLElement

		if (!notesline?.classList.contains("line")) {
			return
		}

		container.insertBefore(newHTML, notesline.nextSibling)

		// not working
		// setCaret(lastSiblingNode(newHTML).node)

		return
	}

	// Text doesn't start with special modif chars
	if (selection?.rangeCount && range) {
		selection.deleteFromDocument()
		range.insertNode(document.createTextNode(text))
		range.setStart(range.endContainer, range.endOffset)
	}
}
