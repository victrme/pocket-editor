import { getLineFromEditable, getNextLine } from "../utils/getLines"
import removeModifier from "../utils/removeModifier"
import getContainer from "../utils/getContainer"
import modList from "../utils/modList"
import lineTransform from "./lineTransform"
import generateLine from "./lineGenerate"
import { addUndoHistory } from "./undo"

export default function paragraphControl(e: Event) {
	const container = getContainer()
	const range = window.getSelection()?.getRangeAt(0)
	const editable = e.target as HTMLElement | null

	if (!range || !(editable && "textContent" in editable) || editable?.tagName === "INPUT") {
		return
	}

	const line = getLineFromEditable(editable)
	const insertParagraph = (e as InputEvent)?.inputType === "insertParagraph"
	const insertText = (e as InputEvent)?.inputType === "insertText"
	let modif

	if (e.type === "beforeinput" && insertParagraph && line) {
		e.preventDefault()
		addUndoHistory(line)

		const cuttext = (editable.textContent ?? "").slice(0, range.startOffset)
		const nexttext = (editable.textContent ?? "").slice(range.startOffset)

		if (range.startOffset === 0 && line?.classList?.contains("mod")) {
			removeModifier(editable)
			return
		}

		if (line?.classList.contains("todo")) modif = "todo"
		if (line?.classList.contains("ul-list")) modif = "unordered"

		const nextline = getNextLine(line)
		const newline = generateLine({
			text: nexttext,
			modif: modif,
		})

		if (nextline) container.insertBefore(newline, nextline)
		else container?.appendChild(newline)

		newline.querySelector<HTMLElement>("[contenteditable]")?.focus()
		editable.textContent = cuttext

		return
	}

	if (e.type === "input" && insertText) {
		const isTargetTitle = editable?.tagName.includes("H")
		const content = editable?.textContent ?? ""

		for (const [mod, val] of modList) {
			const softspace = String.fromCharCode(160)
			const hardspace = String.fromCharCode(32)

			if (content.startsWith(val + hardspace) || content.startsWith(val + softspace)) {
				modif = mod
			}
		}

		if (modif?.includes("h")) {
			lineTransform.toHeading(editable, modif, true)
		}

		if (isTargetTitle === false) {
			if (modif === "todo") lineTransform.toTodolist(editable, false, true)
			if (modif === "todo-checked") lineTransform.toTodolist(editable, false, true)
			if (modif === "unordered") lineTransform.toUnorderedList(editable, true)
		}
	}
}
