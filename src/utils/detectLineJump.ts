import { getLineFromEditable, getLines, getNextLine, getPrevLine } from "./getLines"

export default function detectLineJump(e: KeyboardEvent): {
	line: HTMLElement
	dir: "down" | "up"
} | void {
	// Do nothing if not arrow or selection
	if (!e.key.includes("Arrow") || !window.getSelection()?.anchorNode) {
		return
	}

	const editable = e.target as HTMLElement
	const lines = getLines()
	const line = getLineFromEditable(editable)
	const range = window?.getSelection()?.getRangeAt(0)
	const txtLen = range?.startContainer?.nodeValue?.length ?? 0

	if (!range || !line) return

	const prevSibling = getPrevLine(line, lines)
	const nextSibling = getNextLine(line, lines)
	const isCaretAtZero = Math.min(range?.endOffset, range?.startOffset) === 0
	const isCaretAtEnd = Math.max(range?.endOffset, range?.startOffset) === txtLen

	if (e.key === "ArrowLeft" && isCaretAtZero && prevSibling) return { line, dir: "up" }
	if (e.key === "ArrowRight" && isCaretAtEnd && nextSibling) return { line, dir: "down" }

	let top = false
	let bottom = false
	const rr = range?.getBoundingClientRect()
	const lr = line?.getBoundingClientRect()
	const noRanges = !lr || !rr || rr.y === 0

	// just accept when undefined (it seems to be undefined just after a jump)
	if (noRanges) {
		top = true
		bottom = true
	}
	// "range will go above current line after this key press"
	else {
		top = lr.top - rr.top + rr.height > 0
		bottom = rr.bottom + rr.height - lr.bottom > 0
	}

	if (e.key === "ArrowUp" && prevSibling && top) return { line, dir: "up" }
	if (e.key === "ArrowDown" && nextSibling && bottom) return { line, dir: "down" }
}
