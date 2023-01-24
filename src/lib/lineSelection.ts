import lastSiblingNode from "../utils/lastSiblingNode"
import detectLineJump from "../utils/detectLineJump"
import setCaret from "../utils/setCaret"
import removeLines from "../utils/removeLines"

export default function lineSelection(container: HTMLElement) {
	let caretSelTimeout = setTimeout(() => {})
	let lineInterval: [number, number] = [-1, -1]
	let currentLine = -1
	let firstLine = -1

	//
	// Funcs
	//

	function caretSelectionDebounce(callback: Function) {
		clearTimeout(caretSelTimeout)
		caretSelTimeout = setTimeout(() => {
			callback()
		}, 200)
	}

	function createRange(selected?: Element[]) {
		if (!selected) selected = Object.values(container.querySelectorAll(".sel"))
		if (selected.length === 0) return

		// create paragraph
		document.querySelector("#pocket-editor-mock-sel")?.remove()
		const mockSelection = document.createElement("pre")
		mockSelection.id = "pocket-editor-mock-sel"
		mockSelection.textContent = "mock-selection"
		container.appendChild(mockSelection)

		let sel = window.getSelection()
		let range = document.createRange()
		let textlen = mockSelection.childNodes[0].nodeValue?.length || 0

		range.setStart(mockSelection.childNodes[0], 0)
		range.setEnd(mockSelection.childNodes[0], textlen)

		sel?.removeAllRanges()
		sel?.addRange(range)
	}

	function getLineIndex(editable: Element) {
		if (editable?.parentElement) {
			const notesLines = Object.values(container.querySelectorAll(".line"))
			const selected = notesLines.indexOf(editable.parentElement)
			return selected
		}

		return -1
	}

	function resetLineSelection() {
		// Focus on last highlighted line
		const line = Object.values(container.querySelectorAll(".line"))[currentLine]
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
		const notesLines = Object.values(container.querySelectorAll(".line"))
		notesLines.forEach((line, i) => {
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
		const allLines = Object.values(document.querySelectorAll(".line"))
		const selected = Object.values(document.querySelectorAll(".sel"))

		if (e.key === "Control") return

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
				const container = allLines[0]?.parentElement
				if (container && container.id === "pocket-editor") {
					removeLines(selected, container)
				}
				return
			}

			// Move selected line
			if (e.key === "ArrowDown") currentLine = Math.min(currentLine + 1, allLines.length - 1)
			if (e.key === "ArrowUp") currentLine = Math.max(0, currentLine - 1)

			// Add lines to selection on shift
			// Not using shift only selects one line
			if (e.shiftKey) addToLineSelection(currentLine)
			else changeLineSelection(currentLine)

			// Apply changes
			applyLineSelection(lineInterval)
			return
		}

		if (!e.shiftKey) return

		// Start line selection
		detectLineJump(e, (notesline) => {
			const index = allLines.indexOf(notesline)
			initLineSelection(index)
			applyLineSelection(lineInterval)
			window.getSelection()?.removeAllRanges()
		})
	}

	function mouseMoveEvent(e: MouseEvent) {
		const target = e.target as Element
		const selected = Object.values(container.querySelectorAll(".sel"))

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
		const target = e.target as Element

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

	function mouseClickEvent() {
		container.removeEventListener("mousemove", mouseMoveEvent)
	}

	container.addEventListener("keydown", keyboardEvent)
	container.addEventListener("click", mouseClickEvent)
	container.addEventListener("mousedown", mouseDownEvent)
}
