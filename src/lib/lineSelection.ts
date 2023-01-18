import detectLineJump from "./detectLineJump"
import setCaret from "../utils/setCaret"
import lastSiblingNode from "../utils/lastSiblingNode"

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

	function getLineIndex(editable: Element) {
		if (editable?.parentElement) {
			const notesLines = Object.values(document.querySelectorAll(".notes-line"))
			const selected = notesLines.indexOf(editable.parentElement)
			return selected
		}

		return -1
	}

	function resetLineSelection() {
		// Focus on last highlighted line
		const line = Object.values(document.querySelectorAll(".notes-line"))[currentLine]
		const editable = line?.querySelector(".editable")
		if (editable) setCaret(lastSiblingNode(line).node)

		// Reset selection variables
		currentLine = -1
		firstLine = -1
		lineInterval = [-1, -1]
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
		const notesLines = Object.values(document.querySelectorAll(".notes-line"))
		notesLines.forEach((line, i) => {
			// Index is between interval
			if (i >= interval[0] && i <= interval[1]) {
				line.classList.add("select-all")
			} else {
				line.classList.remove("select-all")
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

	function createRange(selected?: Element[]) {
		if (!selected) {
			selected = Object.values(document.querySelectorAll(".select-all"))
		}

		let sel = window.getSelection()
		let range = document.createRange()
		const lastNodeOfLastSelect = lastSiblingNode(selected[selected.length - 1]).node
		let textlen = lastNodeOfLastSelect.nodeValue?.length || 0

		range.setStart(selected[0], 0)
		range.setEnd(lastNodeOfLastSelect, textlen)

		sel?.removeAllRanges()
		sel?.addRange(range)
	}

	function keyboardEvent(e: KeyboardEvent) {
		const allLines = Object.values(document.querySelectorAll(".notes-line"))
		const selected = Object.values(document.querySelectorAll(".select-all"))

		if (e.key === "Control") return

		if ((e.ctrlKey || e.metaKey) && e.key.matchAll(/([x|c|v])/g) && selected.length > 0) {
			createRange(selected)
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
				const nextline = selected[0]?.previousElementSibling
				if (nextline) setCaret(lastSiblingNode(nextline).node)

				selected.forEach((line) => line.remove())
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
		if (e.y % 3 === 0) return // Safe some computing every by leaving 1 out of 3 events

		const target = e.target as Element

		if (target.className === "editable") {
			const selected = Object.values(document.querySelectorAll(".select-all"))

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

		if (target.classList.contains("editable")) {
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
