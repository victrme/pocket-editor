import { getLineFromEditable, getPrevLine } from "../utils/getLines"
import lastTextNode from "../utils/lastTextNode"
import removeModifier from "../utils/removeModifier"
import getContainer from "../utils/getContainer"
import setCaret from "../utils/setCaret"
import { addUndoHistory } from "./undo"

function removeLineNoText(editable: Element, prevline: Element) {
	setCaret(prevline)
	editable.parentElement?.remove()
}

function removeLineWithText(editable: Element, prevLine: Element) {
	const node = lastTextNode(prevLine as Node)
	const isTextNode = node.nodeType === 3
	const charAmount = node.nodeValue?.length || 0

	const targetText = editable?.textContent || ""
	node[isTextNode ? "nodeValue" : "textContent"] += targetText

	const selection = window.getSelection()
	const range = document.createRange()
	range.setStart(node, isTextNode ? charAmount : 0)
	range.setEnd(node, isTextNode ? charAmount : 0)
	selection?.removeAllRanges()
	selection?.addRange(range)

	const parent = editable.parentElement as HTMLDivElement
	parent.remove()
}

export default function lineDeletion() {
	const container = getContainer()
	const sel = window.getSelection()

	function applyLineRemove(e: Event) {
		const editable = e.target as HTMLElement
		const line = getLineFromEditable(editable) as HTMLElement

		const isEditable = !!editable.getAttribute("contenteditable")
		const isAtStart = sel?.getRangeAt(0)?.endOffset === 0
		const isDelEvent = (e as InputEvent).inputType === "deleteContentBackward"
		const isBeforeinput = e.type === "beforeinput"

		if ((isBeforeinput && !isDelEvent) || !isAtStart || !isEditable) {
			return
		}

		e.preventDefault()

		// Add this condition because of a conflit
		// with "backspace in lineSelection.ts" creating a double history
		if (line) {
			addUndoHistory(line)
		}

		if (line?.classList.length > 1) {
			removeModifier(editable)
			return
		}

		const prevline = getPrevLine(line)

		if (prevline) {
			if (editable.textContent === "") removeLineNoText(editable, prevline)
			if (editable.textContent !== "") removeLineWithText(editable, prevline)
		}
	}

	//
	// Default Chromium / Firefox
	//

	container.addEventListener("beforeinput", applyLineRemove)

	//
	// Safari macOS:
	// Special remove event because "input" event doesn't work on empty contenteditables
	//

	if (navigator.userAgent.includes("Safari")) {
		container.addEventListener("keydown", (e) => {
			try {
				const range = sel?.getRangeAt(0)
				const isBackspacing = (e as KeyboardEvent).key === "Backspace"
				const isAtContainerStart = range?.startOffset === 0

				if (isBackspacing && isAtContainerStart) {
					applyLineRemove(e)
				}
			} catch (e) {
				// IndexSizeError: The index is not in the allowed range.
				// No idea how to handle getRangeAt() error properly
			}
		})
	}

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
		let touchDeleteDebounce: number
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

			touchDeleteDebounce = window.setTimeout(() => applyLineRemove(ev), 5)
		})
	}
}
