import detectLineJump from "../utils/detectLineJump"
import lastTextNode from "../utils/lastTextNode"
import getLine from "../utils/getLines"

export default function caretControl(container: HTMLElement) {
	let averageCharWidth = 0

	function initAverageCharWidth() {
		const p = document.createElement("p")
		const span = document.createElement("span")
		p.id = "pocket-editor-mock-p"
		span.textContent = "abcdefghijklmnopqrstuvwxyz"
		p?.appendChild(span)
		container.querySelector(".line [contenteditable]")?.appendChild(p)
		averageCharWidth = span.offsetWidth / 26 / 2

		p.remove()
	}

	function rangePosInCharLen(line: Element, str: string): number | null {
		const sel = window.getSelection()
		const editable = line?.querySelector("[contenteditable]") as HTMLElement
		const cx = editable?.getBoundingClientRect().x ?? 0
		const rx = sel?.getRangeAt(0)?.cloneRange()?.getBoundingClientRect().x ?? 0
		const ox = rx - cx

		let charCount: number = -1

		const textnode = lastTextNode(editable)
		const range = document.createRange()
		range.setStart(textnode, 0)
		range.setEnd(textnode, 0)

		let rangeX = 0

		for (let i = 0; i < str.length - 1; i++) {
			try {
				range.setStart(textnode, i)
				range.setEnd(textnode, i)
			} catch (_) {
				break
			}

			rangeX = range.getBoundingClientRect().x - cx

			if (rangeX + averageCharWidth >= ox) {
				charCount = i
				break
			}
		}

		return charCount
	}

	function getParagraphAsArray(line: HTMLElement | null): string[] {
		const editable = line?.querySelector<HTMLElement>("[contenteditable]")

		if (!editable) {
			console.warn("Couldn't get string[], no contenteditable found")
			return []
		}

		let pos = 0
		let rangeY = 0
		let rangeYlast = 0
		let lines: string[] = [""]
		let words = (editable.textContent ?? "").split(" ")
		let textnode = lastTextNode(editable)

		const range = document.createRange()
		range.setStart(textnode, 0)
		range.setEnd(textnode, 0)

		const isWebkit = navigator.userAgent.includes("AppleWebKit")
		rangeYlast = rangeY = range.getBoundingClientRect().y

		for (let word of words) {
			word = word + " "
			pos += word.length

			try {
				range.setStart(textnode, pos)
				range.setEnd(textnode, pos)
				rangeY = range.getBoundingClientRect().y
			} catch (_) {}

			// QUIRK: because webkit trims the last space on newlines,
			// the space manually added above will send the range to line below.
			// meaning the paragraph lines will always be one word off
			// FIX: Add word before Y comparison on webkit
			if (isWebkit) lines[0] += word

			if (rangeY > rangeYlast) {
				// trim space like webkit
				if (isWebkit) lines[0] = lines[0].trimEnd()

				lines.unshift("")
				rangeYlast = rangeY
			}

			// Add word normally on firefox
			if (isWebkit === false) lines[0] += word
		}

		lines.reverse()

		return lines
	}

	container.addEventListener("keydown", function (e: KeyboardEvent) {
		const { line, dir } = detectLineJump(e) ?? {}

		if (!line) return

		const goesRight = e.key === "ArrowRight"
		const goesLeft = e.key === "ArrowLeft"
		let sel = window.getSelection()
		let range = document.createRange()
		let offset = 0
		let node

		if (averageCharWidth === 0) {
			initAverageCharWidth()
		}

		if (dir === "down") {
			const nextline = getLine.next(line) ?? line
			node = lastTextNode(nextline)
			const textlen = node.nodeValue?.length || 0

			if (!goesRight) {
				const rows = getParagraphAsArray(nextline)
				offset = rangePosInCharLen(nextline, rows[0]) ?? -1

				if (offset < 0) offset = textlen
			}
		}

		if (dir === "up") {
			const prevline = getLine.previous(line) ?? line
			node = lastTextNode(prevline)
			const textlen = node.nodeValue?.length || 0

			offset = textlen

			if (!goesLeft) {
				const rows = getParagraphAsArray(prevline)
				const lastrow = rows[rows.length - 1].trimEnd()
				let lastrowOffset = rangePosInCharLen(prevline, lastrow) ?? textlen

				offset = textlen - (lastrow.length - lastrowOffset)

				if (lastrowOffset < 0) offset = textlen
			}
		}

		try {
			range.setStart(node as Node, offset)
			range.setEnd(node as Node, offset)
			sel?.removeAllRanges()
			sel?.addRange(range)
			sel?.collapseToEnd()

			e.preventDefault()
		} catch (_) {
			console.warn("Cannot set caret")
		}
	})
}
