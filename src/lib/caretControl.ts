import detectLineJump from "../utils/detectLineJump"
import lastSiblingNode from "../utils/lastSiblingNode"

function rangePosInCharLen(line: Element | null, str: string): number | null {
	const sel = window.getSelection()
	const range = sel?.getRangeAt(0)?.cloneRange()
	const rx = range?.getBoundingClientRect().x ?? 0
	const cx = line?.querySelector("[contenteditable]")?.getBoundingClientRect().x ?? 0
	const offset = rx - cx

	const p = document.createElement("p")

	p.style.position = "absolute"
	p.style.whiteSpace = "pre"
	p.style.width = offset + "px"
	p.style.overflow = "hidden"
	p.style.opacity = "0"

	line?.appendChild(p)

	for (const char of str.split("")) {
		const span = document.createElement("span")
		span.textContent = char
		p.appendChild(span)

		if (span.offsetLeft > offset) {
			const elemCount = p.childElementCount - 2
			p.remove()
			return elemCount
		}
	}

	p.remove()
	return null
}

function getParagraphAsArray(line: Element | null): string[] {
	if (!line) {
		console.warn("Couldn't get string[], line undefined")
		return []
	}

	// Create a temporary clone of the paragraph
	const lineRect = line.getBoundingClientRect()
	const wrapper = document.createElement("div")
	const clone = line.cloneNode(true)

	wrapper.id = "pocket-editor-mock-p"
	wrapper.style.width = lineRect.width + "px"

	// Append the clone to the document body
	wrapper?.appendChild(clone)
	document.getElementById("pocket-editor")?.appendChild(wrapper)

	let lastHeight = 0
	let lines: string[] = []
	let words = (clone.textContent ?? "").split(" ")

	clone.textContent = ""

	for (let i = 0; i < words.length; i++) {
		// Add word to mock
		const word = words[i] + " "
		clone.textContent += word

		// Create new line if height changed
		const cloneHeight = (clone as Element).getBoundingClientRect().height ?? 0
		if (cloneHeight !== lastHeight) {
			lines.push("")
		}

		// Add word to the last line
		lines[lines.length - 1] += word
		lastHeight = cloneHeight
	}

	wrapper.remove()

	return lines
}

export default function caretControl(e: KeyboardEvent) {
	function jumpCallback(notesline: Element, dir: string) {
		if (dir === "down") {
			let sel = window.getSelection()
			let range = document.createRange()

			const nextline = notesline?.nextElementSibling
			const node = lastSiblingNode(nextline as Node).node
			const textlen = node.nodeValue?.length || 0

			const paragraphlines = getParagraphAsArray(nextline)
			const offset = rangePosInCharLen(nextline, paragraphlines[0]) ?? 0

			range.setStart(node, e.key === "ArrowRight" ? textlen : offset)
			range.setEnd(node, e.key === "ArrowRight" ? textlen : offset)

			sel?.removeAllRanges()
			sel?.addRange(range)
			sel?.collapseToEnd()

			e.preventDefault()
		}

		if (dir === "up") {
			let sel = window.getSelection()
			let range = document.createRange()

			const prevline = notesline?.previousElementSibling
			const node = lastSiblingNode(prevline as Node).node
			const textlen = node.nodeValue?.length || 0

			const pRows = getParagraphAsArray(prevline)
			const lastpRow = pRows[pRows.length - 1]
			const lastpRowOffset = rangePosInCharLen(prevline, lastpRow) ?? 0

			let offset = textlen - (lastpRow.length - lastpRowOffset)

			if (offset < 0) {
				offset = textlen
			}

			range.setStart(node, offset)
			range.setEnd(node, offset)

			sel?.removeAllRanges()
			sel?.addRange(range)
			sel?.collapseToEnd()

			e.preventDefault()
		}
	}

	detectLineJump(e, jumpCallback)
}
