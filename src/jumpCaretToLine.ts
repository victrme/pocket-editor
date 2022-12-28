import getLineLength from "./getLineLength"
import getRangeOffsetFromParent from "./getRangeOffsetFromParent"

export default function jumpCaretToLine(dir: "up" | "down", range: Range, e: KeyboardEvent) {
	const target = e.target as HTMLElement
	const caretPos = getRangeOffsetFromParent(range).start
	const lineLengths = getLineLength(target)

	function focusOnOtherLine() {
		const parent = target.parentElement

		// select "notes-line" parent
		if (parent?.className !== "notes-line") return

		// Prev or next depending on arrow direction
		let notesLine: Element | null | undefined
		if (dir === "up") notesLine = target.parentElement?.previousElementSibling
		if (dir === "down") notesLine = target.parentElement?.nextElementSibling

		if (!notesLine) return

		// Select editable in notes-line if it exists & focus
		const prevEditable = notesLine.childNodes[0] as HTMLElement
		let editableChild: Node | null | undefined

		if (dir === "up") editableChild = prevEditable?.lastChild
		if (dir === "down") editableChild = prevEditable?.firstChild

		if (!editableChild) return

		const sel = window.getSelection()
		const offset = Math.min((editableChild.textContent?.length || 0) - 1, range?.startOffset)
		sel?.collapse(editableChild, offset)
	}

	if (dir === "up" && caretPos < lineLengths[0]) {
		console.log("Jump to previous line", range?.startOffset)
		focusOnOtherLine()
		e.preventDefault()
	}

	if (dir === "down" && caretPos > (lineLengths?.at(-2) || 0)) {
		console.log("Jump to next line", range?.startOffset)
		focusOnOtherLine()
		e.preventDefault()
	}
}
