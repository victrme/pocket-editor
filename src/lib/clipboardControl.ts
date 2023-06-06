import { toHTML, toMarkdown, checkModifs } from "./contentControl"
import removeLines from "../utils/removeLines"
import lastSiblingNode from "../utils/lastSiblingNode"
import setCaret from "../utils/setCaret"

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

export function pasteEvent(e: ClipboardEvent, container: HTMLElement) {
	e.preventDefault()

	// transform paste content to plaintext
	const selection = window.getSelection()
	const range = selection?.getRangeAt(0)
	const text = e.clipboardData?.getData("text") || ""

	// Text starts with a spcial char, create new lines
	if (checkModifs(text) !== "") {
		let notesline = (e.target as Element)?.parentElement
		const newHTML = toHTML(text)
		const linesInNew = newHTML.childElementCount - 1 // before document fragment gets consumed

		// When pasting after selection, line is last selected block
		const selected = Object.values(document.querySelectorAll("#pocket-editor  .sel"))
		if (selected.length > 0) {
			notesline = selected[selected.length - 1] as HTMLElement
		}

		if (!notesline?.classList.contains("line")) {
			return
		}

		// Adds content: after line with caret position
		container.insertBefore(newHTML, notesline.nextSibling)

		// Place caret: Gets last line in paste content
		let lastline = notesline.nextSibling
		for (let ii = 0; ii < linesInNew; ii++) lastline ? (lastline = lastline.nextSibling) : ""
		if (lastline) setCaret(lastSiblingNode(lastline).node)

		// Pasting "on same line" (it actually removes empty line)
		// For plaintext, lists & todos
		if (notesline.textContent === "") {
			function areSameMods(mod: string) {
				const curr = notesline?.classList
				const next = notesline?.nextElementSibling?.classList
				return curr?.contains(mod) === next?.contains(mod)
			}

			if (!notesline.classList.contains("mod") || areSameMods("ul-lists") || areSameMods("todo")) {
				notesline.remove()
			}
		}

		return
	}

	// Text doesn't start with special modif chars
	if (selection?.rangeCount && range) {
		selection.deleteFromDocument()
		range.insertNode(document.createTextNode(text))
		setCaret(lastSiblingNode(range.endContainer).node)
	}
}
