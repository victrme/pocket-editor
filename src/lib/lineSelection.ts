import { addUndoHistory } from "./undo"
import { detectLineJump } from "../utils/detectLineJump"
import { setCaret } from "../utils/setCaret"
import type PocketEditor from "../index"

export function lineSelection(self: PocketEditor): void {
	let lines = self.lines
	let caretSelTimeout: number
	let lineInterval: [number, number] = [-1, -1]
	let currentLine = -1
	let firstLine = -1

	// Funcs

	function caretSelectionDebounce(callback: () => unknown): void {
		clearTimeout(caretSelTimeout)
		caretSelTimeout = window.setTimeout(() => {
			callback()
		}, 200)
	}

	function createRange(selected?: Element[]): void {
		if (!selected) {
			selected = self.getSelectedLines()
		}

		if (selected.length === 0) {
			return
		}

		// create paragraph
		document.querySelector("#pocket-editor-mock-sel")?.remove()
		const mockSelection = document.createElement("pre")
		mockSelection.id = "pocket-editor-mock-sel"
		mockSelection.textContent = "pe-mock-selection"
		mockSelection.setAttribute("contenteditable", "true")
		self.container.appendChild(mockSelection)

		const sel = window.getSelection()
		const range = document.createRange()
		const textlen = mockSelection.childNodes[0].nodeValue?.length || 0

		range.setStart(mockSelection.childNodes[0], 0)
		range.setEnd(mockSelection.childNodes[0], textlen)

		sel?.removeAllRanges()
		sel?.addRange(range)
	}

	function getLineIndex(editable: HTMLElement): number {
		const line = self.getLineFromEditable(editable)
		return line ? lines.indexOf(line) : -1
	}

	function resetLineSelection(): void {
		// Focus on last highlighted line

		const line = lines[currentLine]
		const editable = line?.querySelector("[contenteditable]")

		if (editable) {
			setCaret(line)
		}

		// Reset selection variables
		currentLine = -1
		firstLine = -1
		lineInterval = [-1, -1]

		// remove mock-sel & move event
		document.querySelector("#pocket-editor-mock-sel")?.remove()
		self.container.removeEventListener("mousemove", mouseMoveEvent)
	}

	function addToLineSelection(index: number): void {
		// Change selection interval depending on direction

		if (index > firstLine) {
			lineInterval[1] = index
		}
		if (index < firstLine) {
			lineInterval[0] = index
		}
		if (index === firstLine) {
			lineInterval = [index, index]
		}
	}

	function changeLineSelection(index: number): void {
		firstLine = index
		lineInterval = [index, index]
	}

	function applyLineSelection(interval: [number, number]): void {
		lines.forEach((line, i) => {
			// Index is between interval
			if (i >= interval[0] && i <= interval[1]) {
				line.setAttribute("data-selected", "")
			} else {
				line.removeAttribute("data-selected")
			}
		})

		caretSelectionDebounce(() => createRange())
	}

	function initLineSelection(index: number): void {
		currentLine = firstLine = index
		lineInterval = [index, index]
	}

	// Events

	function keyboardEvent(e: KeyboardEvent): void {
		lines = self.lines

		const selected = self.getSelectedLines()
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
				if (e.key.includes("Down")) {
					currentLine = Math.min(currentLine + 1, lines.length - 1)
				}
				if (e.key.includes("Up")) {
					currentLine = Math.max(0, currentLine - 1)
				}

				if (e.shiftKey) {
					addToLineSelection(currentLine)
				}
				if (!e.shiftKey) {
					changeLineSelection(currentLine)
				}

				applyLineSelection(lineInterval)
				e.preventDefault()
				return
			}

			if (!includesAny(e.code, "Shift", "Alt", "Control", "Caps")) {
				resetLineSelection()
				addUndoHistory(self, selected[selected.length - -1])
				self.removeLines(selected)

				if (e.code === "Enter") {
					e.preventDefault()
				}
			}
		}

		if (!e.shiftKey) {
			return
		}

		// Start line selection
		const { line } = detectLineJump(self, e) ?? {}

		if (line) {
			const index = lines.indexOf(line)
			initLineSelection(index)
			applyLineSelection(lineInterval)
			window.getSelection()?.removeAllRanges()
		}
	}

	function mouseMoveEvent(e: MouseEvent): void {
		const target = e.target as HTMLElement
		const selected = self.getSelectedLines()

		if (selected.length > 0) {
			window.getSelection()?.removeAllRanges()
		}

		const isCheckbox = target.getAttribute("aria-label") === "todo list checkbox"
		const isListMarker = target.dataset.listMarker
		const isEditable = !!target.getAttribute("contenteditable")

		if (isCheckbox || isListMarker || isEditable) {
			currentLine = getLineIndex(target)

			// Don't select when moving inside first line
			if (currentLine === firstLine && selected.length === 0) {
				return
			}

			addToLineSelection(currentLine)
			applyLineSelection(lineInterval)
		}
	}

	function mouseDownEvent(event: MouseEvent): void {
		const target = event.target as HTMLElement
		const rightclick = event.button === 2
		const leftclick = event.button === 0
		const hasSelection = self.getSelectedLines().length > 0

		lines = self.lines

		if (rightclick) {
			event.preventDefault()
		}

		if (!leftclick) {
			return
		}

		if (hasSelection) {
			// reset first
			resetLineSelection()
			applyLineSelection(lineInterval)
		}

		if (target.getAttribute("contenteditable")) {
			initLineSelection(getLineIndex(target))
			self.container.addEventListener("mousemove", mouseMoveEvent)
		}
	}

	function mouseClickEvent(event: Event): void {
		const path = event.composedPath() as Element[]
		const hasSelection = self.getSelectedLines().length > 0
		const clicksOutsideContainer = !path.includes(self.container)

		if (clicksOutsideContainer && hasSelection) {
			lines = self.lines
			resetLineSelection()
			applyLineSelection(lineInterval)
		}

		self.container.removeEventListener("mousemove", mouseMoveEvent)
	}

	window.addEventListener("touchend", mouseClickEvent)
	window.addEventListener("click", mouseClickEvent)
	self.container.addEventListener("keydown", keyboardEvent)
	self.container.addEventListener("mousedown", mouseDownEvent)
}

function includesAny(str: string, ...matches: string[]): boolean {
	for (const match of matches) {
		if (str.includes(match)) {
			return true
		}
	}

	return false
}
