import generateLine from "../lib/lineGenerate"
import getContainer from "./getContainer"
import setCaret from "./setCaret"

function insertAfter(newNode: Node, existingNode: Node) {
	existingNode?.parentNode?.insertBefore(newNode, existingNode.nextSibling)
}

export default function removeLines(lines: Element[]) {
	const prevLine = lines[0].previousElementSibling
	const container = getContainer()
	const emptyLine = generateLine()

	lines.forEach((line) => line.remove())

	prevLine ? insertAfter(emptyLine, prevLine) : container.prepend(emptyLine)

	setCaret(emptyLine?.childNodes[0])

	// Mock event to trigger oninput
	container.dispatchEvent(
		new InputEvent("input", {
			inputType: "deleteContent",
			bubbles: true,
			data: "",
		})
	)
}
