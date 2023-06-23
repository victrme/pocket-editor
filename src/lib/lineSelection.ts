import { getLines, getSelectedLines, getLineFromEditable } from "../utils/getLines"
import detectLineJump from "../utils/detectLineJump"
import removeLines from "../utils/removeLines"
import setCaret from "../utils/setCaret"
import { addUndoHistory } from "./undo"

export default function lineSelection(container: HTMLElement) {
	let lines = getLines()
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
		if (!selected) selected = getSelectedLines(lines)
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
		return line ? lines.indexOf(line) : -1
	}

	function resetLineSelection() {
		// Focus on last highlighted line
		const line = lines[currentLine]
		const editable = line?.querySelector("[contenteditable]")
		if (editable) setCaret(line)

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
		lines.forEach((line, i) => {
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
		lines = getLines()

		const selected = getSelectedLines(lines)
		const isClipboardKey = e.key.match(/([x|c|v])/g)
		const isCtrlKey = e.key === "Control" || e.key === "Meta"
		const noSelection = selected.length > 0
		const ctrl = e.ctrlKey || e.metaKey

		if (isCtrlKey || (ctrl && isClipboardKey && noSelection)) {
			return
		}

		if (ctrl && e.key === "a") {
			window.getSelection()?.removeAllRanges()
			currentLine = firstLine = 0
			lineInterval = [0, lines.length - 1]
			applyLineSelection(lineInterval)
			e.preventDefault()
			return
		}

		if (noSelection) {
			window.getSelection()?.removeAllRanges()

			if (e.key === "Escape" || e.key === "Tab") {
				resetLineSelection()
				applyLineSelection(lineInterval)
				e.preventDefault()
				return
			}

			if (e.key.includes("Arrow")) {
				if (e.key.includes("Down")) currentLine = Math.min(currentLine + 1, lines.length - 1)
				if (e.key.includes("Up")) currentLine = Math.max(0, currentLine - 1)

				if (e.shiftKey) addToLineSelection(currentLine)
				if (!e.shiftKey) changeLineSelection(currentLine)

				applyLineSelection(lineInterval)
				e.preventDefault()
				return
			}

			if (!e.code.match(/Shift|Alt|Control|Caps/)) {
				resetLineSelection()
				addUndoHistory(selected[selected.length - -1])
				removeLines(selected)

				if (e.code === "Enter") {
					e.preventDefault()
				}
			}
		}

		if (!e.shiftKey) return

		// Start line selection
		const jump = detectLineJump(e)

		if (jump?.line) {
			const index = lines.indexOf(jump.line)
			initLineSelection(index)
			applyLineSelection(lineInterval)
			window.getSelection()?.removeAllRanges()
		}
	}

	function mouseMoveEvent(e: MouseEvent) {
		const target = e.target as HTMLElement
		const selected = getSelectedLines(lines)

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

		lines = getLines()

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
		const path = e.composedPath() as Element[]
		const clicksOutsideContainer = !path.includes(container)

		if (clicksOutsideContainer) {
			lines = getLines()
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
