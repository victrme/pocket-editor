import removeModifier from "../utils/removeModifier"
import getContainer from "../utils/getContainer"
import modList from "../utils/modList"
import getLine from "../utils/getLines"
import lineTransform from "./lineTransform"
import generateLine from "./lineGenerate"
import { addUndoHistory } from "./undo"

export default function paragraphControl(e: Event) {
	const container = getContainer()
	const editable = e.target as HTMLElement
	let range: Range | undefined

	try {
		const isContenteditable = editable?.hasAttribute("contenteditable")
		const isInput = editable?.tagName === "INPUT"
		range = window.getSelection()?.getRangeAt(0)

		if (!range || !isContenteditable || isInput) {
			throw ""
		}
	} catch (_) {
		return
	}

	const line = getLine.fromEditable(editable)
	const insertParagraph = (e as InputEvent)?.inputType === "insertParagraph"
	const insertText = (e as InputEvent)?.inputType === "insertText"
	let modif

	if (e.type === "beforeinput" && insertParagraph && line) {
		e.preventDefault()
		addUndoHistory(line)

		const cuttext = (editable.textContent ?? "").slice(0, range.startOffset)
		const nexttext = (editable.textContent ?? "").slice(range.startOffset)

		if (range.startOffset === 0 && line?.classList?.length > 1) {
			removeModifier(editable)
			return
		}

		if (line?.classList.contains("todo")) modif = "todo"
		if (line?.classList.contains("list")) modif = "list"
		if (line?.classList.contains("todo-checked")) modif = "todo"

		const nextline = getLine.next(line)
		const newline = generateLine({
			text: nexttext,
			modif: modif,
		})

		if (nextline) container.insertBefore(newline, nextline)
		else container?.appendChild(newline)

		newline.querySelector<HTMLElement>("[contenteditable]")?.focus()
		editable.textContent = cuttext

		container.dispatchEvent(
			new InputEvent("input", {
				inputType: "insertText",
				bubbles: true,
				data: "",
			})
		)

		return
	}

	if (e.type === "input" && insertText) {
		const content = editable?.textContent ?? ""

		for (const [mod, val] of Object.entries(modList)) {
			const softspace = String.fromCharCode(160)
			const hardspace = String.fromCharCode(32)

			if (content.startsWith(val + hardspace) || content.startsWith(val + softspace)) {
				modif = mod as keyof typeof modList
				lineTransform(editable, modif)
			}
		}
	}
}
