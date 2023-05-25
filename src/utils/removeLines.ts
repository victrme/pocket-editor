import { addHistory } from "../lib/actionHistory"
import generateLine from "../lib/lineGenerate"
import setCaret from "./setCaret"

function insertAfter(newNode: Node, existingNode: Node) {
	existingNode?.parentNode?.insertBefore(newNode, existingNode.nextSibling)
}

export default function removeLines(lines: Element[], container: Element) {
	const prevLine = lines[0].previousElementSibling
	const emptyLine = generateLine()
	const snapshot = container.cloneNode(true) as Element

	let prevElem = lines.at(-1)
	let targetline = 0

	for (let i = 0; i < container.childElementCount; i++) {
		if (!prevElem?.previousElementSibling) {
			break
		}

		prevElem = prevElem?.previousElementSibling
		targetline++
	}

	lines.forEach((line) => line.remove())

	prevLine ? insertAfter(emptyLine, prevLine) : container.prepend(emptyLine)

	setCaret(emptyLine?.childNodes[0])

	addHistory({
		snapshot,
		targetline,
		action: "Removed line",
		text: container.textContent ?? "",
	})

	// Mock event to trigger oninput
	container.dispatchEvent(
		new InputEvent("input", {
			inputType: "deleteContent",
			bubbles: true,
			data: "",
		})
	)
}
