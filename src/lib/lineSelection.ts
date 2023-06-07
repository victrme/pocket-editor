import { getLines, getSelectedLines, getLineFromEditable } from "../utils/getLines"
import lastSiblingNode from "../utils/lastSiblingNode"
import detectLineJump from "../utils/detectLineJump"
import getContainer from "../utils/getContainer"
import removeLines from "../utils/removeLines"
import setCaret from "../utils/setCaret"
import { addUndoHistory } from "./undo"

export default function lineSelection() {
	const container = getContainer()
	let caretSelTimeout: number
	let lineInterval: [number, number] = [-1, -1]
	let currentLine = -1
	let firstLine = -1

	//
	// Funcs
	//

	function caretSelectionDebounce(callback: Function) {
		clearTimeout(caretSelTimeout)
		caretSelTimeout = window.setTimeout(() => {
			callback()
		}, 200)
	}

	function createRange(selected?: Element[]) {
		if (!selected) selected = getSelectedLines()
		if (selected.length === 0) return

		// create paragraph
		document.querySelector("#pocket-editor-mock-sel")?.remove()
		const mockSelection = document.createElement("pre")
		mockSelection.id = "pocket-editor-mock-sel"
		mockSelection.textContent = "mock-selection"
		mockSelection.setAttribute("contenteditable", "true")
		container.appendChild(mockSelection)

		let sel = window.getSelection()
		let range = document.createRange()
		let textlen = mockSelection.childNodes[0].nodeValue?.length || 0

		range.setStart(mockSelection.childNodes[0], 0)
		range.setEnd(mockSelection.childNodes[0], textlen)

		sel?.removeAllRanges()
		sel?.addRange(range)
	}

	function getLineIndex(editable: HTMLElement) {
		const line = getLineFromEditable(editable)
		const lines = getLines()
		return line ? lines.indexOf(line) : -1
	}

	function resetLineSelection() {
		// Focus on last highlighted line
		const line = getLines()[currentLine]
		const editable = line?.querySelector("[contenteditable]")
		if (editable) setCaret(lastSiblingNode(line).node)

		// Reset selection variables
		currentLine = -1
		firstLine = -1
		lineInterval = [-1, -1]

		// remove mock-sel & move event
		document.querySelector("#pocket-editor-mock-sel")?.remove()
		container.removeEventListener("mousemove", mouseMoveEvent)
	}

	function addToLineSelection(index: number) {
		// Change selection interval depending on direction
		if (index > firstLine) lineInterval[1] = index
		if (index < firstLine) lineInterval[0] = index
		if (index === firstLine) lineInterval = [index, index]
	}

	function changeLineSelection(index: number) {
		firstLine = index
		lineInterval = [index, index]
	}

	function applyLineSelection(interval: [number, number]) {
		getLines().forEach((line, i) => {
			// Index is between interval
			if (i >= interval[0] && i <= interval[1]) {
				line.classList.add("sel")
			} else {
				line.classList.remove("sel")
			}
		})

		caretSelectionDebounce(() => createRange())
	}

	function initLineSelection(index: number) {
		currentLine = firstLine = index
		lineInterval = [index, index]
	}

	//
	// Events
	//

	function keyboardEvent(e: KeyboardEvent) {
		const allLines = getLines()
		const selected = getSelectedLines()

		if (e.key === "Control" || e.key === "Meta") return

		if ((e.ctrlKey || e.metaKey) && e.key.match(/([x|c|v])/g) && selected.length > 0) {
			return
		}

		if ((e.ctrlKey || e.metaKey) && e.key === "a") {
			window.getSelection()?.removeAllRanges()
			currentLine = firstLine = 0
			lineInterval = [0, allLines.length - 1]
			applyLineSelection(lineInterval)
			e.preventDefault()
			return
		}

		if (selected.length > 0) {
			e.preventDefault()
			window.getSelection()?.removeAllRanges()

			// Escape deletes selection
			if (e.key === "Escape" || e.key === "Tab") {
				resetLineSelection()
				applyLineSelection(lineInterval)
				return
			}

			// Backspace deletes lines
			if (e.key === "Backspace") {
				resetLineSelection()
				addUndoHistory(selected[selected.length - -1])
				removeLines(selected)
				return
			}

			// Move selected line
			if (e.key === "ArrowDown") currentLine = Math.min(currentLine + 1, allLines.length - 1)
			if (e.key === "ArrowUp") currentLine = Math.max(0, currentLine - 1)

			// Not using shift only selects one line
			if (e.shiftKey) {
				addToLineSelection(currentLine)
			} else {
				changeLineSelection(currentLine)
			}

			// Apply changes
			applyLineSelection(lineInterval)
			return
		}

		if (!e.shiftKey) return

		// Start line selection
		const { line } = detectLineJump(e) ?? {}

		if (line) {
			const index = allLines.indexOf(line)
			initLineSelection(index)
			applyLineSelection(lineInterval)
			window.getSelection()?.removeAllRanges()
		}
	}

	function mouseMoveEvent(e: MouseEvent) {
		const target = e.target as HTMLElement
		const selected = getSelectedLines()

		if (selected.length > 0) {
			window.getSelection()?.removeAllRanges()
		}

		if (!!target.getAttribute("contenteditable")) {
			currentLine = getLineIndex(target)

			// Don't select when moving inside first line
			if (currentLine === firstLine && selected.length === 0) return

			addToLineSelection(currentLine)
			applyLineSelection(lineInterval)
		}
	}

	function mouseDownEvent(e: MouseEvent) {
		const target = e.target as HTMLElement

		if (e.button === 2) e.preventDefault() // right click doesn't trigger click
		if (e.button !== 0) return

		// reset first
		resetLineSelection()
		applyLineSelection(lineInterval)

		if (!!target.getAttribute("contenteditable")) {
			initLineSelection(getLineIndex(target))
			container.addEventListener("mousemove", mouseMoveEvent)
		}
	}

	function mouseClickEvent(e: Event) {
		const path = e.composedPath()

		if (path.filter((el) => (el as HTMLElement).id === "pocket-editor").length === 0) {
			resetLineSelection()
			applyLineSelection(lineInterval)
		}

		container.removeEventListener("mousemove", mouseMoveEvent)
	}

	window.addEventListener("touchend", mouseClickEvent)
	window.addEventListener("click", mouseClickEvent)
	container.addEventListener("keydown", keyboardEvent)
	container.addEventListener("mousedown", mouseDownEvent)
}
