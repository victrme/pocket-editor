import { getLines, getSelectedLines, getLineFromEditable, getNextLine } from "../utils/getLines"
import { toHTML, toMarkdown, checkModifs } from "./contentControl"
import lastSiblingNode from "../utils/lastSiblingNode"
import getContainer from "../utils/getContainer"
import removeLines from "../utils/removeLines"
import setCaret from "../utils/setCaret"

export function copyEvent(e: ClipboardEvent) {
	const selected = getSelectedLines()

	if (selected.length > 0) {
		e.clipboardData?.setData("text/plain", toMarkdown(selected))
		e.preventDefault()
	}
}

export function cutEvent(e: ClipboardEvent) {
	const selected = getSelectedLines()

	if (selected.length > 0) {
		e.clipboardData?.setData("text/plain", toMarkdown(selected))
		e.preventDefault()
		removeLines(selected)
	}
}

export function pasteEvent(e: ClipboardEvent) {
	e.preventDefault()

	// transform paste content to plaintext
	const container = getContainer()
	const selection = window.getSelection()
	const range = selection?.getRangeAt(0)
	const text = e.clipboardData?.getData("text") || ""

	// Text starts with a spcial char, create new lines
	if (checkModifs(text) !== "") {
		const editable = e.target as HTMLElement
		const newHTML = toHTML(text)
		const linesInNew = newHTML.childElementCount - 1 // before document fragment gets consumed
		const lines = getLines()
		let line = getLineFromEditable(editable)

		// When pasting after selection, line is last selected block
		const selected = getSelectedLines()
		if (selected.length > 0) {
			line = selected[selected.length - 1] as HTMLElement
		}

		if (!line?.classList.contains("line")) {
			return
		}

		// Adds content: after line with caret position
		container.insertBefore(newHTML, getNextLine(line, lines))

		// Place caret: Gets last line in paste content
		let lastline = line.nextSibling
		for (let ii = 0; ii < linesInNew; ii++) lastline ? (lastline = lastline.nextSibling) : ""
		if (lastline) setCaret(lastSiblingNode(lastline).node)

		// Pasting "on same line" (it actually removes empty line)
		// For plaintext, lists & todos
		if (line && line.textContent === "") {
			const areSameMods = (mod: string) => {
				const curr = line?.classList
				const next = getNextLine(line!, lines)?.classList
				return curr?.contains(mod) === next?.contains(mod)
			}

			if (!line.classList.contains("mod") || areSameMods("ul-lists") || areSameMods("todo")) {
				line.remove()
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
