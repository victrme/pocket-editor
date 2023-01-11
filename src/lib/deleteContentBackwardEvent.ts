import lastNode from "./lastSiblingNode"
import removeModifier from "./removeModifier"

export default function deleteContentBackwardEvent(e: InputEvent) {
	function removeLineNoText(editable: Element, prevLine: Element) {
		// put caret to end of previous line
		const selection = window.getSelection()
		const range = document.createRange()
		range.selectNodeContents(prevLine?.querySelector(".editable") as HTMLElement)
		range.collapse(false)
		selection?.removeAllRanges()
		selection?.addRange(range)

		// Remove target line
		;(editable.parentElement as HTMLDivElement).remove()

		console.log("No modifier + no text, remove line")
	}

	function removeLineWithText(editable: Element, prevLine: Element) {
		// get char amount to place caret
		const { node, isTextNode } = lastNode(prevLine as Node)
		const charAmount = node.nodeValue?.length || 0

		// Add text to previous line
		const targetText = editable?.textContent || ""
		node[isTextNode ? "nodeValue" : "textContent"] += targetText

		// Place caret before append text
		const selection = window.getSelection()
		const range = document.createRange()
		range.setStart(node, isTextNode ? charAmount : 0)
		range.setEnd(node, isTextNode ? charAmount : 0)
		selection?.removeAllRanges()
		selection?.addRange(range)

		// Remove target line
		;(editable.parentElement as HTMLDivElement).remove()

		console.log("No modifier + text, append text to previous line")
	}

	const range = window.getSelection()?.getRangeAt(0)
	const editable = e.target as Element
	const prevLine = editable.parentElement?.previousElementSibling

	// Must be Backspace + caret at first pos, editable must be target
	if (
		editable.classList.contains("editable") === false ||
		e.inputType !== "deleteContentBackward" ||
		range?.endOffset !== 0
	) {
		return
	}

	e.preventDefault()

	// It is a modified line
	if (editable.parentElement?.classList.contains("modif-line")) {
		removeModifier(editable)
		return console.log("Has modifier, remove modifier")
	}

	// Quit if it is last line
	if (!prevLine) return

	// Remove line
	if (editable.textContent === "") removeLineNoText(editable, prevLine)
	if (editable.textContent !== "") removeLineWithText(editable, prevLine)
}
