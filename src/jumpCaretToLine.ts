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

function focusOnOtherLine(node: Node) {
	let lastNode = node // gets deepest last child (to get textnode)
	while (lastNode?.lastChild) lastNode = lastNode.lastChild

	setCaret(lastNode)
}

export default function jumpCaretToLine(dir: "up" | "down", range: Range, e: KeyboardEvent) {
	const notesline = (e.target as HTMLElement)?.parentElement
	if (!notesline) return

	const rangeRects = range.getClientRects()[0]
	const lineRects = notesline?.getBoundingClientRect()
	let isOnFirstLine: boolean
	let isOnLastLine: boolean

	if (!lineRects || !rangeRects) {
		isOnFirstLine = true
		isOnLastLine = true
	} else {
		// Detect if need of jump with range pos & line pos
		isOnFirstLine = lineRects.top - rangeRects.top + rangeRects.height > 0
		isOnLastLine = rangeRects.bottom + rangeRects.height - lineRects.bottom > 0
	}

	if (dir === "down" && isOnLastLine) {
		e.preventDefault()
		focusOnOtherLine(notesline?.nextElementSibling as Node)
	}

	if (dir === "up" && isOnFirstLine) {
		e.preventDefault()
		focusOnOtherLine(notesline?.previousElementSibling as Node)
	}
}
