import removeModifier from "../utils/removeModifier"
import modList from "../utils/modList"
import generateLine from "./lineGenerate"
import lineTransform from "./lineTransform"
import { addUndoHistory } from "./undo"

export default function paragraphControl(e: Event, container: HTMLElement) {
	const range = window.getSelection()?.getRangeAt(0)
	const editable = e.target as HTMLElement | null

	if (!range || !(editable && "textContent" in editable) || editable?.tagName === "INPUT") {
		return
	}

	const line = (e.target as Element)?.parentElement
	const insertParagraph = (e as InputEvent)?.inputType === "insertParagraph"
	const insertText = (e as InputEvent)?.inputType === "insertText"
	let modif

	if (e.type === "beforeinput" && insertParagraph) {
		e.preventDefault()
		addUndoHistory(container, line)

		const cuttext = (editable.textContent ?? "").slice(0, range.startOffset)
		const nexttext = (editable.textContent ?? "").slice(range.startOffset)

		if (range.startOffset === 0 && line?.classList?.contains("mod")) {
			removeModifier(editable)
			return
		}

		if (line?.classList.contains("todo")) modif = "todo"
		if (line?.classList.contains("ul-list")) modif = "unordered"

		const newline = generateLine({
			text: nexttext,
			modif: modif,
		})

		line?.nextElementSibling
			? container.insertBefore(newline, line.nextElementSibling)
			: container?.appendChild(newline)

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
