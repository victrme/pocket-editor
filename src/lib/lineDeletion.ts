import lastNode from "../utils/lastSiblingNode"
import removeModifier from "../utils/removeModifier"

export default function lineDeletion(e: Event) {
	function removeLineNoText(editable: Element, prevLine: Element) {
		// put caret to end of previous line
		const selection = window.getSelection()
		const range = document.createRange()
		const prevEditable = prevLine?.querySelector("[contenteditable]") as HTMLElement

		range.selectNodeContents(prevEditable)
		range.collapse(false)
		selection?.removeAllRanges()
		selection?.addRange(range)

		// Remove target line
		;(editable.parentElement as HTMLDivElement).remove()
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
	}

	const range = window.getSelection()?.getRangeAt(0)
	const editable = e.target as Element
	const prevLine = editable.parentElement?.previousElementSibling
	const keyboardButNoDel = e.type === "beforeinput" && (e as InputEvent).inputType !== "deleteContentBackward"

	// User input comes from keyboard and is not deleteContentBackwards +
	// Caret must be at first pos +
	// Editable must be target
	if (keyboardButNoDel || range?.endOffset !== 0 || !editable.getAttribute("contenteditable")) {
		return
	}

	e.preventDefault()

	// It is a modified line
	if (editable.parentElement?.classList.contains("mod")) {
		removeModifier(editable)
		return
	}

	// Quit if it is last line
	if (!prevLine) return

	// Remove line
	if (editable.textContent === "") removeLineNoText(editable, prevLine)
	if (editable.textContent !== "") removeLineWithText(editable, prevLine)
}
