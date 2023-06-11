export default function lastTextNode(line: Node) {
	let lastNode = line

	while (lastNode?.childNodes) {
		const childNodes = Object.values(lastNode.childNodes)
		const textNodes = childNodes.filter((child) => child.nodeName === "#text")

		if (textNodes.length > 0) {
			return textNodes.reverse()[0]
		}

		if (childNodes.length > 0) {
			lastNode = childNodes[childNodes.length - 1]
		}
	}

	return lastNode
}
