import generateLine from "../lib/lineGenerate"
import getContainer from "./getContainer"
import getLine from "./getLines"
import setCaret from "./setCaret"

function insertAfter(newNode: Node, existingNode: Node) {
	existingNode?.parentNode?.insertBefore(newNode, existingNode.nextSibling)
}

export default function removeLines(lines: HTMLElement[]) {
	const container = getContainer()
	const emptyLine = generateLine()
	const prevline = getLine.previous(lines[0])

	lines.forEach((line) => line.remove())

	prevline ? insertAfter(emptyLine, prevline) : container.prepend(emptyLine)

	setCaret(emptyLine)

	// Mock event to trigger oninput
	container.dispatchEvent(
		new InputEvent("input", {
			inputType: "deleteContent",
			bubbles: true,
			data: "",
		})
	)
}
