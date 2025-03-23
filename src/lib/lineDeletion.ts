import { addUndoHistory } from "./undo"
import { removeModifier } from "../utils/removeModifier"
import { lastTextNode } from "../utils/lastTextNode"
import { setCaret } from "../utils/setCaret"
import type PocketEditor from "../index"

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

export function lineDeletion(self: PocketEditor) {
	const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0
	const userAgent = navigator.userAgent.toLowerCase()
	const sel = window.getSelection()

	function applyLineRemove(ev: Event): void {
		const editable = ev.target as HTMLElement
		const line = self.getLineFromEditable(editable) as HTMLElement

		const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0
		const isEditable = !!editable.getAttribute("contenteditable")
		const isAtStart = sel?.getRangeAt(0)?.endOffset === 0
		const isDelEvent = (ev as InputEvent).inputType === "deleteContentBackward"
		const isBeforeinput = ev.type === "beforeinput"

		if ((isBeforeinput && !isDelEvent) || !isAtStart || !isEditable) {
			return
		}

		ev.preventDefault()

		// Add this condition because of a conflit
		// with "backspace in lineSelection.ts" creating a double history
		if (line) {
			addUndoHistory(self, line)
		}

		if (Object.keys(line?.dataset ?? {}).length > 0) {
			const newEditable = removeModifier(editable)

			if (isTouch && newEditable && newEditable.textContent === "") {
				newEditable.textContent = self.ZERO_WIDTH_WHITESPACE
				setCaret(newEditable)
			}

			return
		}

		const prevline = self.getPrevLine(line)

		if (prevline) {
			if (editable.textContent === "") {
				removeLineNoText(editable, prevline)
			}
			if (editable.textContent !== "") {
				removeLineWithText(editable, prevline)
			}
		}
	}

	// Default Chromium / Firefox

	self.container.addEventListener("beforeinput", applyLineRemove)

	// Safari macOS:
	// Special remove event because "input" event doesn't work on empty contenteditables

	if (userAgent.includes("safari") && !(userAgent.includes("chrome") && userAgent.includes("chromium"))) {
		self.container.addEventListener("keydown", e => {
			try {
				const range = sel?.getRangeAt(0)
				const isBackspacing = (e as KeyboardEvent).key === "Backspace"
				const isAtContainerStart = range?.startOffset === 0

				if (isBackspacing && isAtContainerStart) {
					applyLineRemove(e)
				}
			} catch (_) {
				// IndexSizeError: The index is not in the allowed range.
				// No idea how to handle getRangeAt() error properly
			}
		})
	}

	//  Virtual keyboards:
	//	"input" events are not triggered when backspacing empty text with a virtual keyboard.
	//	This adds a whitespace when deleting to force an "input" event.

	if (isTouchDevice) {
		let triggerDeleteLine = false

		self.container.addEventListener("beforeinput", ev => {
			const editable = ev.target as HTMLElement
			const deleteContent = ev.inputType === "deleteContentBackward"
			const whitespaceOnly = editable.textContent === self.ZERO_WIDTH_WHITESPACE

			if (deleteContent && whitespaceOnly) {
				triggerDeleteLine = true
			}
		})

		self.container.addEventListener("keyup", ev => {
			const editable = ev.target as HTMLElement

			if (triggerDeleteLine) {
				triggerDeleteLine = false
				applyLineRemove(ev)
				return
			}

			if (editable.textContent === "") {
				editable.textContent = self.ZERO_WIDTH_WHITESPACE
				setCaret(editable)
			}
		})
	}
}
