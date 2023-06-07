import { getLineFromEditable, getLines, getNextLine, getPrevLine } from "./getLines"

type DetectLineJumpReturn = {
	line: HTMLElement
	dir: "down" | "up"
}

// Very heavy way to detect first/last line of paragraph
// But average char width cannot work with custom fonts
function isOnVerticalLineEdge(range?: Range, line?: HTMLElement) {
	const rangeRects = range?.getClientRects()[0]
	const lineRects = line?.getBoundingClientRect()
	let topEdge: boolean
	let bottomEdge: boolean

	// Rects undefined sometimes, just accept (it seems to be undefined just after a jump)
	if (!lineRects || !rangeRects) {
		topEdge = true
		bottomEdge = true
	} else {
		// Detect if need of jump with range pos & line pos
		topEdge = lineRects.top - rangeRects.top + rangeRects.height > 0
		bottomEdge = rangeRects.bottom + rangeRects.height - lineRects.bottom > 0
	}

	return { top: topEdge, bottom: bottomEdge }
}

export default function detectLineJump(e: KeyboardEvent): DetectLineJumpReturn | undefined {
	// Do nothing if not arrow or selection
	if (!e.key.includes("Arrow") || !window.getSelection()?.anchorNode) {
		return
	}

	const editable = e.target as HTMLElement
	const lines = getLines()
	const line = getLineFromEditable(editable)
	const range = window?.getSelection()?.getRangeAt(0)
	const txtLen = range?.startContainer?.nodeValue?.length

	if (!range || !line) return // range must exists

	const prevSibling = getPrevLine(line, lines)
	const nextSibling = getNextLine(line, lines)
	const isCaretAtZero = range?.startOffset === 0
	const isCaretAtEnd = range?.startOffset === txtLen
	const isSelectionAtEnd = range?.endOffset === txtLen

	if (e.shiftKey) {
		if (!!nextSibling && isSelectionAtEnd && e.key.match(/^Arrow(Down|Right)$/)) {
			return { line, dir: "down" }
		}

		if (!!prevSibling && isCaretAtZero && e.key.match(/^Arrow(Up|Left)$/)) {
			return { line, dir: "up" }
		}
	}

	// Going up from Left Arrow
	if (e.key === "ArrowLeft" && isCaretAtZero && prevSibling) {
		return { line, dir: "up" }
	}

	// Going down from Right Arrow
	if (e.key === "ArrowRight" && (isCaretAtEnd || !txtLen) && nextSibling) {
		return { line, dir: "down" }
	}

	// Going up/down on simple arrow press
	const { bottom, top } = isOnVerticalLineEdge(range, line)
	if (nextSibling && e.key === "ArrowDown" && bottom) return { line, dir: "down" }
	if (prevSibling && e.key === "ArrowUp" && top) return { line, dir: "up" }
}
