function setCaret(node: Node) {
	var sel = window.getSelection()
	var range = document.createRange()

	range.setStart(node, 0)

	sel?.removeAllRanges()
	sel?.addRange(range)
	sel?.collapse(node)
}

export default function jumpCaretToLine(dir: "up" | "down", range: Range, e: KeyboardEvent) {
	// const target = e.target as HTMLElement
	const editable = range.startContainer?.parentElement
	if (!editable) return

	// const caretPos = getRangeOffsetFromParent(range).start
	// const lineLengths = getLineLength(target)
	const rangeRects = range.getClientRects()[0]
	const editableRects = editable?.getBoundingClientRect()
	if (!editableRects || !rangeRects) return

	function focusOnOtherLine() {
		const prevNode = editable?.parentElement?.previousElementSibling?.children[0]
		const nextNode = editable?.parentElement?.nextElementSibling?.children[0]

		// const { x, y, height } = rangeRects
		// let line = document.elementFromPoint(x, dir === "up" ? y - height / 2 : y + height * 1.5)

		if (dir === "down" && nextNode) {
			// nextNode?.focus()
			// line.click()
			setCaret(nextNode)
		}

		if (dir === "up" && prevNode) {
			// prevNode?.focus()
			setCaret(prevNode)
		}
	}

	console.log(range)

	const bottomBound = editableRects.y + editableRects.height - rangeRects.height
	const topBound = editableRects.y + rangeRects.height / 2

	if (dir === "down" && rangeRects.y + rangeRects.height > bottomBound) {
		e.preventDefault()
		focusOnOtherLine()
		console.log("Jump down")
	}

	if (dir === "up" && rangeRects.y < topBound) {
		e.preventDefault()
		focusOnOtherLine()
		console.log("Jump up")
	}

	// if (dir === "up" && caretPos < lineLengths[0]) {
	// 	console.log("Jump to previous line", range?.startOffset)
	// 	focusOnOtherLine()
	// 	e.preventDefault()
	// }

	// if (dir === "down" && caretPos > (lineLengths?.at(-2) || 0)) {
	// 	console.log("Jump to next line", range?.startOffset)
	// 	focusOnOtherLine()
	// 	e.preventDefault()
	// }
}
