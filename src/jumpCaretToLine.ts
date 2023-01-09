import lastNode from "./lastSiblingNode"

// is working
function setCaret(node: Node) {
	let sel = window.getSelection()
	let range = document.createRange()
	let textlen = node.nodeValue?.length || 0

	range.setStart(node, textlen)
	range.setEnd(node, textlen)

	sel?.removeAllRanges()
	sel?.addRange(range)
	sel?.collapseToEnd()
}

export default function jumpCaretToLine(dir: "up" | "down", range: Range, e: KeyboardEvent) {
	const notesline = (e.target as HTMLElement)?.parentElement
	if (!notesline) return

	const rangeRects = range.getClientRects()[0]
	const lineRects = notesline?.getBoundingClientRect()
	let isOnFirstLine: boolean
	let isOnLastLine: boolean

	// Rects undefined sometimes, just accept
	if (!lineRects || !rangeRects) {
		isOnFirstLine = true
		isOnLastLine = true
	} else {
		// Detect if need of jump with range pos & line pos
		isOnFirstLine = lineRects.top - rangeRects.top + rangeRects.height > 0
		isOnLastLine = rangeRects.bottom + rangeRects.height - lineRects.bottom > 0
	}

	if (dir === "down" && isOnLastLine && notesline?.nextElementSibling) {
		setCaret(lastNode(notesline?.nextElementSibling as Node).node)
		e.preventDefault()
	}

	if (dir === "up" && isOnFirstLine && notesline?.previousElementSibling) {
		setCaret(lastNode(notesline?.previousElementSibling as Node).node)
		e.preventDefault()
	}
}
