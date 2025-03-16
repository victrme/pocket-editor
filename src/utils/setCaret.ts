import { lastTextNode } from "./lastTextNode"

export function setCaret(elem: Element | Node, atStart?: boolean): void {
	const node = lastTextNode(elem)
	const sel = window.getSelection()
	const range = document.createRange()

	const textlen = node.nodeValue?.length || 0
	range.setStart(node, atStart ? 0 : textlen)
	range.setEnd(node, atStart ? 0 : textlen)

	sel?.removeAllRanges()
	sel?.addRange(range)
	sel?.collapseToEnd()
}
