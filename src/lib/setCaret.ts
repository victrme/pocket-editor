export default function setCaret(node: Node, atStart?: boolean) {
	let sel = window.getSelection()
	let range = document.createRange()

	let textlen = node.nodeValue?.length || 0
	range.setStart(node, atStart ? 0 : textlen)
	range.setEnd(node, atStart ? 0 : textlen)

	sel?.removeAllRanges()
	sel?.addRange(range)
	sel?.collapseToEnd()
}
