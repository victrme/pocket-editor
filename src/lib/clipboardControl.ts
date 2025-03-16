import { toHTML, toMarkdown, checkModifs } from "./contentControl"
import { addUndoHistory } from "./undo"
import { setCaret } from "../utils/setCaret"

import type PocketEditor from "../index"

export function copyEvent(self: PocketEditor, ev: ClipboardEvent): void {
	const selected = self.getSelectedLines()

	if (selected.length > 0) {
		ev.clipboardData?.setData("text/plain", toMarkdown(selected))
		ev.preventDefault()
	}
}

export function cutEvent(self: PocketEditor, ev: ClipboardEvent): void {
	const selected = self.getSelectedLines()

	if (selected.length > 0) {
		ev.clipboardData?.setData("text/plain", toMarkdown(selected))
		ev.preventDefault()
		self.removeLines(selected)
		addUndoHistory(self, selected[selected.length - 1])
	}
}

export function pasteEvent(self: PocketEditor, ev: ClipboardEvent): void {
	ev.preventDefault()

	// transform paste content to plaintext
	const selection = window.getSelection()
	const range = selection?.getRangeAt(0)
	const text = ev.clipboardData?.getData("text") || ""

	// Text starts with a spcial char, create new lines
	if (checkModifs(text, self.mods) !== "") {
		const editable = ev.target as HTMLElement
		const newHtml = toHTML(self, text)
		const linesInNew = newHtml.childElementCount - 1 // before document fragment gets consumed
		let line = self.getLineFromEditable(editable)

		// When pasting after selection, line is last selected block
		const selected = self.getSelectedLines()
		if (selected.length > 0) {
			line = selected[selected.length - 1] as HTMLElement
		}

		if (!line?.parentElement?.dataset.pocketEditor) {
			return
		}

		// Adds content: after line with caret position
		self.container.insertBefore(newHtml, self.getNextLine(line))

		// Place caret: Gets last line in paste content
		let lastline = line.nextSibling

		for (let ii = 0; ii < linesInNew; ii++) {
			if (lastline) {
				lastline = lastline.nextSibling
			}
		}

		if (lastline) {
			setCaret(lastline)
		}

		// Pasting "on same line" (it actually removes empty line)
		// For plaintext, lists & todos
		if (line && line.textContent === "") {
			const areSameMods = (mod: string) => {
				const currIsMod = line?.dataset[mod] === mod
				const nextIsMod = self.getNextLine(line)?.dataset[mod] === mod
				return currIsMod === nextIsMod
			}

			if (line || areSameMods("list") || areSameMods("todo") || areSameMods("todo-checked")) {
				line.remove()
			}
		}

		self.container.dispatchEvent(
			new InputEvent("input", {
				inputType: "insertText",
				bubbles: true,
				data: "",
			}),
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

	self.container.dispatchEvent(
		new InputEvent("input", {
			inputType: "insertText",
			bubbles: true,
			data: "",
		}),
	)
}
