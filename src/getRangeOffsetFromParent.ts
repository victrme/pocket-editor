export default function getRangeOffsetFromParent(range: Range) {
	function prevNodeLength() {
		let node = range.startContainer
		let res = 0

		while (node.previousSibling) {
			let text = node.previousSibling.textContent || node.previousSibling.nodeValue || ""
			res += text.length
			node = node.previousSibling
		}

		return res
	}

	let start = range.startOffset + prevNodeLength()
	let end = range.endOffset + prevNodeLength()

	return { start, end }
}
