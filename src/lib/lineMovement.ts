import lastNode from "./lastSiblingNode"
import setCaret from "./setCaret"

export default function lineMovement(container: HTMLElement) {
	let lastRangePosition: number | undefined
	let offset: number | undefined
	let range: Range | undefined

	function detectLineJumps(dir: string, notesline?: Element) {
		// Left / right arrow movement
		// Before heavy getClientRects
		if (dir === "left" || dir === "right") {
			if (offset === lastRangePosition) {
				return { up: dir === "left", down: dir === "right" }
			}
		}

		const rangeRects = range?.getClientRects()[0]
		const lineRects = notesline?.getBoundingClientRect()
		let firstInnerLine: boolean
		let lastInnerLine: boolean

		// Rects undefined sometimes, just accept
		if (!lineRects || !rangeRects) {
			firstInnerLine = true
			lastInnerLine = true
		} else {
			// Detect if need of jump with range pos & line pos
			firstInnerLine = lineRects.top - rangeRects.top + rangeRects.height > 0
			lastInnerLine = rangeRects.bottom + rangeRects.height - lineRects.bottom > 0
		}

		let down = dir === "down" && lastInnerLine && notesline?.nextElementSibling
		let up = dir === "up" && firstInnerLine && notesline?.previousElementSibling

		return { up, down }
	}

	function keydownEvent(e: KeyboardEvent) {
		const notesline = (e.target as HTMLElement)?.parentElement
		range = window?.getSelection()?.getRangeAt(0)

		if (!e.key.includes("Arrow") || !range || !notesline) return

		offset = range.startOffset

		// Set direction for line jump detection
		let dir = ""
		if (e.key === "ArrowUp") dir = "up"
		if (e.key === "ArrowDown") dir = "down"
		if (e.key === "ArrowLeft") dir = "left"
		if (e.key === "ArrowRight") dir = "right"

		// Set offset position for left / right jump
		if (dir === "left") offset -= 1
		if (dir === "right") offset += 1

		const { up, down } = detectLineJumps(dir, notesline)
		let node: Node

		if (down) {
			node = lastNode(notesline?.nextElementSibling as Node).node
			setCaret(node, dir === "right")
			e.preventDefault()
		}

		if (up) {
			node = lastNode(notesline?.previousElementSibling as Node).node
			setCaret(node, false)
			e.preventDefault()
		}

		lastRangePosition = offset
	}

	container.addEventListener("keydown", keydownEvent)
}
