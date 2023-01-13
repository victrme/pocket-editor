export default function lineSelection(container: HTMLElement) {
	let currentLine = -1
	let firstLine = -1
	let lineInterval: [number, number] = [-1, -1]

	//
	// Funcs
	//

	function getLineIndex(editable: Element) {
		if (editable?.parentElement) {
			const notesLines = Object.values(document.querySelectorAll(".notes-line"))
			const selected = notesLines.indexOf(editable.parentElement)
			return selected
		}

		return -1
	}

	function resetLineSelection() {
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
		window.getSelection()?.removeAllRanges()
	}

	function initLineSelection(index: number) {
		currentLine = firstLine = index
		lineInterval = [index, index]
	}

	//
	// Events
	//

	function keyboardEvent(e: KeyboardEvent) {
		const allLines = Object.values(document.querySelectorAll(".notes-line"))
		const selected = Object.values(document.querySelectorAll(".select-all"))
		const editable = e.target as HTMLElement

		if (selected.length > 0) {
			// Escape deletes selection
			if (e.key === "Escape" || e.key === "Tab") {
				resetLineSelection()
				applyLineSelection(lineInterval)
				return
			}

			e.preventDefault()

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

		const range = window?.getSelection()?.getRangeAt(0)
		if (!range) return

		// Start line selection
		if (e.shiftKey && e.key === "ArrowLeft" && range.startOffset < 2 && editable?.parentElement) {
			const index = allLines.indexOf(editable?.parentElement)
			initLineSelection(index)
			applyLineSelection(lineInterval)
		}
	}

	function mouseMoveEvent(e: MouseEvent) {
		// Safe some computing every by leaving 2 out of 3 events
		// We don't need precision here
		if (e.y % 3 === 0) return

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

	function mouseClickEvent() {
		container.removeEventListener("mousemove", mouseMoveEvent)
	}

	function mouseDownEvent(e: MouseEvent) {
		const target = e.target as Element

		// reset first
		resetLineSelection()
		applyLineSelection(lineInterval)

		if (target.classList.contains("editable")) {
			initLineSelection(getLineIndex(target))
			container.addEventListener("mousemove", mouseMoveEvent)
		}
	}

	container.addEventListener("keydown", keyboardEvent)
	container.addEventListener("click", mouseClickEvent)
	container.addEventListener("mousedown", mouseDownEvent)
}
