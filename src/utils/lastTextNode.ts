export default function lastTextNode(line: Node) {
	let lastNode = line

	while (lastNode?.childNodes.length > 0) {
		const childNodes = Object.values(lastNode.childNodes).reverse()
		const textNodes = childNodes.filter((child) => child.nodeName === "#text")

		if (textNodes.length > 0) {
			return textNodes[0]
		} else {
			lastNode = childNodes[0]
		}
	}

	return lastNode
}
