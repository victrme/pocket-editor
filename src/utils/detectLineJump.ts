//

// Very heavy way to detect first/last line of paragraph
// But average char width cannot work with custom fonts
function isOnVerticalLineEdge(range?: Range, notesline?: Element) {
	const rangeRects = range?.getClientRects()[0]
	const lineRects = notesline?.getBoundingClientRect()
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

export default function detectLineJump(e: KeyboardEvent, callback: (notesline: Element, dir: string) => void) {
	// Do nothing if not arrow or selection
	if (!e.key.includes("Arrow") || !window.getSelection()?.anchorNode) return

	const notesline = (e.target as HTMLElement)?.parentElement
	const range = window?.getSelection()?.getRangeAt(0)
	const txtLen = range?.startContainer?.nodeValue?.length

	if (!range || !notesline) return // range must exists

	const prevSibling = notesline?.previousElementSibling
	const nextSibling = notesline?.nextElementSibling
	const isCaretAtZero = range?.startOffset === 0
	const isCaretAtEnd = range?.startOffset === txtLen
	const isSelectionAtEnd = range?.endOffset === txtLen

	// When user is selecting text (shiftKey might not be very compatible (we'll see))
	if (e.shiftKey) {
		if (nextSibling && isSelectionAtEnd && (e.key === "ArrowDown" || e.key === "ArrowRight")) {
			callback(notesline, "down")
		}

		if (prevSibling && isCaretAtZero && (e.key === "ArrowUp" || e.key === "ArrowLeft")) {
			callback(notesline, "up")
		}

		return
	}

	// Going up from Left Arrow
	if (e.key === "ArrowLeft") {
		if (isCaretAtZero && prevSibling) callback(notesline, "up")
		return
	}

	// Going down from Right Arrow
	if (e.key === "ArrowRight") {
		if ((isCaretAtEnd || !txtLen) && nextSibling) callback(notesline, "down")
		return
	}

	// Going up/down on simple arrow press
	const { bottom, top } = isOnVerticalLineEdge(range, notesline)
	if (nextSibling && e.key === "ArrowDown" && bottom) callback(notesline, "down")
	if (prevSibling && e.key === "ArrowUp" && top) callback(notesline, "up")
}
