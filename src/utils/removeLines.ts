import generateLine from "../lib/lineGenerate"

function insertAfter(newNode: Node, existingNode: Node) {
	existingNode?.parentNode?.insertBefore(newNode, existingNode.nextSibling)
}

function focusOnEditable(line: Element | undefined) {
	line?.querySelector<HTMLElement>("[contenteditable]")?.focus()
}

export default function removeLines(lines: Element[], container: Element) {
	const prevLine = lines[0].previousElementSibling
	const emptyLine = generateLine()

	// remove selected lines
	lines.forEach((line) => line.remove())

	// focus on last line
	if (prevLine) {
		insertAfter(emptyLine, prevLine)
		focusOnEditable(emptyLine)
	} else {
		// no prev line, create one
		container.prepend(emptyLine)
		focusOnEditable(emptyLine)
	}

	// Create a mock event to trigger oninput
	container.dispatchEvent(
		new InputEvent("input", {
			inputType: "deleteContent",
			bubbles: true,
			data: "",
		})
	)
}
