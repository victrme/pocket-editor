import { generateLine } from "../lib/generateLine"
import lastSiblingNode from "./lastSiblingNode"
import setCaret from "./setCaret"

export default function removeLines(lines: Element[], container: Element) {
	const nextLine = lines[lines.length - 1].nextElementSibling
	const emptyLine = generateLine()

	// focus on next generated line
	if (nextLine) nextLine.prepend(emptyLine)
	else container.appendChild(emptyLine)

	// remove selected lines
	lines.forEach((line) => line.remove())

	// move caret to empty line
	setCaret(lastSiblingNode(emptyLine).node)
}
