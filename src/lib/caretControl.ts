import detectLineJump from "../utils/detectLineJump"
import lastTextNode from "../utils/lastTextNode"
import PocketEditor from "../index"

export default function caretControl(self: PocketEditor) {
	let averageCharWidth = 0

	function initAverageCharWidth() {
		const p = document.createElement("p")
		const span = document.createElement("span")
		p.id = "pocket-editor-mock-p"
		span.textContent = "abcdefghijklmnopqrstuvwxyz0123456789"
		p?.appendChild(span)
		self.container.querySelector(".line [contenteditable]")?.appendChild(p)
		averageCharWidth = span.offsetWidth / 36 / 2

		p.remove()
	}

	function rangePosInCharLen(line: HTMLElement, str: string): number | null {
		const sel = window.getSelection()

		let charCount: number = -1
		const x = getHorizontalPosition(sel, line)
		const offset = self.caret_x ?? x.offset

		const editable = line?.querySelector("[contenteditable]") as HTMLElement
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

			rangeX = range.getBoundingClientRect().x - x.editable

			if (rangeX + averageCharWidth >= offset) {
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

	self.container.addEventListener("pointerdown", function () {
		self.caret_x = undefined
	})

	self.container.addEventListener("keydown", function (ev: KeyboardEvent) {
		if (!ev.key.includes("Arrow")) {
			return
		}

		const goesRight = ev.key === "ArrowRight"
		const goesLeft = ev.key === "ArrowLeft"
		const { line, dir } = detectLineJump(self, ev) ?? {}
		let sel = window.getSelection()
		let range = document.createRange()
		let offset = 0
		let node

		if (goesLeft || goesRight) {
			self.caret_x = undefined
		}
		//
		else if (self.caret_x === undefined) {
			self.caret_x = getHorizontalPosition(sel, line).offset
		}

		if (!line) {
			return
		}

		if (averageCharWidth === 0) {
			initAverageCharWidth()
		}

		if (dir === "down") {
			const nextline = self.getNextLine(line) ?? line
			node = lastTextNode(nextline)
			const textlen = node.nodeValue?.length || 0

			if (!goesRight) {
				const rows = getParagraphAsArray(nextline)
				offset = rangePosInCharLen(nextline, rows[0]) ?? -1

				if (offset < 0) offset = textlen
			}
		}

		if (dir === "up") {
			const prevline = self.getPrevLine(line) ?? line
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

			ev.preventDefault()
		} catch (_) {
			console.warn("Cannot set caret")
		}
	})
}

function getHorizontalPosition(selection: Selection | null, line?: HTMLElement) {
	const selectionNotValid = !selection?.anchorNode

	if (!line || selectionNotValid) {
		return { editable: 0, range: 0, offset: 0 }
	}

	const editable = line.querySelector("[contenteditable]") as HTMLElement
	const editable_x = editable?.getBoundingClientRect().x ?? 0
	const range_x = selection?.getRangeAt(0)?.cloneRange()?.getBoundingClientRect().x ?? 0

	return {
		editable: editable_x,
		range: range_x,
		offset: range_x - editable_x,
	}
}
