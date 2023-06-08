// gets deepest last child (to get textnode)
export default function lastSiblingNode(line: Node) {
	let lastNode = line
	while (lastNode?.lastChild) lastNode = lastNode.lastChild
	return lastNode
}
