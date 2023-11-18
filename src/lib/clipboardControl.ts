import { toHTML, toMarkdown, checkModifs } from "./contentControl"
import getContainer from "../utils/getContainer"
import removeLines from "../utils/removeLines"
import setCaret from "../utils/setCaret"
import getLine from "../utils/getLines"
import { addUndoHistory } from "./undo"

export function copyEvent(e: ClipboardEvent) {
	const selected = getLine.selected()

	if (selected.length > 0) {
		e.clipboardData?.setData("text/plain", toMarkdown(selected))
		e.preventDefault()
	}
}

export function cutEvent(e: ClipboardEvent) {
	const selected = getLine.selected()

	if (selected.length > 0) {
		e.clipboardData?.setData("text/plain", toMarkdown(selected))
		e.preventDefault()
		removeLines(selected)
		addUndoHistory(selected[selected.length - 1])
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
		let line = getLine.fromEditable(editable)

		// When pasting after selection, line is last selected block
		const selected = getLine.selected()
		if (selected.length > 0) {
			line = selected[selected.length - 1] as HTMLElement
		}

		if (!line?.classList.contains("line")) {
			return
		}

		// Adds content: after line with caret position
		container.insertBefore(newHTML, getLine.next(line))

		// Place caret: Gets last line in paste content
		let lastline = line.nextSibling
		for (let ii = 0; ii < linesInNew; ii++) lastline ? (lastline = lastline.nextSibling) : ""
		if (lastline) setCaret(lastline)

		// Pasting "on same line" (it actually removes empty line)
		// For plaintext, lists & todos
		if (line && line.textContent === "") {
			const areSameMods = (mod: string) => {
				const curr = line?.classList
				const next = getLine.next(line!)?.classList
				return curr?.contains(mod) === next?.contains(mod)
			}

			if (
				line.classList.length > 1 ||
				areSameMods("list") ||
				areSameMods("todo") ||
				areSameMods("todo-checked")
			) {
				line.remove()
			}
		}

		container.dispatchEvent(
			new InputEvent("input", {
				inputType: "insertText",
				bubbles: true,
				data: "",
			})
		)

		return
	}

	// Text doesn't start with special modif chars
	if (selection?.rangeCount && range) {
		const offset = selection?.anchorOffset ?? 0
		const value = selection.focusNode?.nodeValue ?? ""

		if (value && selection.focusNode) {
			selection.focusNode.nodeValue = value.slice(0, offset) + text + value.slice(offset)
			selection.collapse(selection.focusNode, offset + text.length)
		} else {
			range.insertNode(document.createTextNode(text))
			setCaret(range.endContainer)
		}
	}

	container.dispatchEvent(
		new InputEvent("input", {
			inputType: "insertText",
			bubbles: true,
			data: "",
		})
	)
}
