import generateLine from "../lib/lineGenerate"
import setCaret from "./setCaret"

function insertAfter(newNode: Node, existingNode: Node) {
	existingNode?.parentNode?.insertBefore(newNode, existingNode.nextSibling)
}

export default function removeLines(lines: Element[], container: Element) {
	const prevLine = lines[0].previousElementSibling
	const emptyLine = generateLine()

	// remove
	lines.forEach((line) => line.remove())

	// insert
	prevLine ? insertAfter(emptyLine, prevLine) : container.prepend(emptyLine)

	// focus
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
