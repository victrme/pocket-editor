import { addUndoHistory } from "./undo"
import { removeModifier } from "../utils/removeModifier"
import { lineTransform } from "./lineTransform"
import type PocketEditor from "../index"

export function paragraphControl(self: PocketEditor, e: Event): void {
	const container = self.container
	const editable = e.target as HTMLElement
	let range: Range | undefined

	try {
		const isContenteditable = editable?.hasAttribute("contenteditable")
		const isInput = editable?.tagName === "INPUT"
		range = window.getSelection()?.getRangeAt(0)

		if (!(range && isContenteditable) || isInput) {
			throw new Error("?")
		}
	} catch (_) {
		return
	}

	const line = self.getLineFromEditable(editable)
	const datasets = Object.keys(line?.dataset ?? {})
	const insertParagraph = (e as InputEvent)?.inputType === "insertParagraph"
	const insertText = (e as InputEvent)?.inputType === "insertText"
	let modif: keyof typeof self.mods | undefined

	if (e.type === "beforeinput" && insertParagraph && line) {
		e.preventDefault()
		addUndoHistory(self, line)

		const textContent = (editable.textContent ?? "").replace(self.ZERO_WIDTH_WHITESPACE, "")
		const cuttext = textContent.slice(0, range.startOffset)
		const nexttext = textContent.slice(range.startOffset)
		const isAtStart = range.startOffset === 0 || (textContent === "" && range.startOffset === 1)

		if (isAtStart && datasets.length > 0) {
			removeModifier(editable)
			return
		}

		if (line.dataset.todo === "") {
			modif = "todo"
		}
		if (line.dataset.list === "") {
			modif = "list"
		}
		if (line.dataset.todoChecked === "") {
			modif = "todo"
		}

		const nextline = self.getNextLine(line)
		const newline = self.createLine({
			text: nexttext,
			modif: modif,
		})

		if (nextline) {
			container.insertBefore(newline, nextline)
		} else {
			container?.appendChild(newline)
		}

		;(newline as HTMLElement).querySelector<HTMLElement>("[contenteditable]")?.focus()
		editable.textContent = cuttext

		container.dispatchEvent(
			new InputEvent("input", {
				inputType: "insertText",
				bubbles: true,
				data: "",
			}),
		)

		return
	}

	if (e.type === "input" && insertText) {
		const zeroWidthWhitespace = "​"
		const content = (editable?.textContent ?? "").replace(zeroWidthWhitespace, "")

		for (const [mod, val] of Object.entries(self.mods)) {
			const softspace = String.fromCharCode(160)
			const hardspace = String.fromCharCode(32)

			if (content.startsWith(val + hardspace) || content.startsWith(val + softspace)) {
				modif = mod as keyof typeof self.mods
				lineTransform(self, editable, modif)
			}
		}
	}
}
