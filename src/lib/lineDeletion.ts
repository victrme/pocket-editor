import lastNode from "../utils/lastSiblingNode"
import removeModifier from "../utils/removeModifier"

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

export default function lineDeletion(container: Element) {
	const sel = window.getSelection()

	function applyLineRemove(e: Event) {
		const editable = e.target as Element
		const prevLine = editable.parentElement?.previousElementSibling

		const isEditable = !!editable.getAttribute("contenteditable")
		const isAtStart = sel?.getRangeAt(0)?.endOffset === 0
		const isDelEvent = (e as InputEvent).inputType === "deleteContentBackward"
		const isBeforeinput = e.type === "beforeinput"

		if ((isBeforeinput && !isDelEvent) || !isAtStart || !isEditable) {
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

	container.addEventListener("beforeinput", applyLineRemove)

	/*
	 *	Ok...
	 *	Virtual keyboard on mobile doesn't trigger "input" event when backspacing empty text
	 *	But it triggers on "keyup" with Unidentified key.
	 *	It also triggers an Unidentified keyup on line break and THEN a "Enter" keyup.
	 *
	 *	This works by debouncing the first Unidentified key and waiting for the "Enter"
	 *	If no "Enter" is triggered in 5ms, apply the line remove
	 */

	// Only on touch devices
	if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
		let touchDeleteDebounce = setTimeout(() => {})
		let inputEventPrevents = false

		container.addEventListener("input", () => (inputEventPrevents = true))
		container.addEventListener("keyup", function (ev) {
			if (
				inputEventPrevents ||
				(ev as KeyboardEvent)?.key !== "Unidentified" ||
				sel?.getRangeAt(0)?.endOffset !== 0
			) {
				clearTimeout(touchDeleteDebounce)
				inputEventPrevents = false
				return
			}

			touchDeleteDebounce = setTimeout(() => applyLineRemove(ev), 5)
		})
	}
}
