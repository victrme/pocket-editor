import { getLines, getNextLine, getPrevLine } from "../utils/getLines"
import lastTextNode from "../utils/lastTextNode"
import detectLineJump from "../utils/detectLineJump"

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

		let x = 0

		for (let i = 0; i < str.length - 1; i++) {
			try {
				range.setStart(textnode, i)
				range.setEnd(textnode, i)
			} catch (_) {
				break
			}

			x = range.getBoundingClientRect().x - cx

			if (x + averageCharWidth >= ox) {
				charCount = i
				break
			}
		}

		return charCount
	}

	function getParagraphAsArrayWithDOM(line: HTMLElement | null): string[] {
		const editable = line?.querySelector<HTMLElement>("[contenteditable]")

		if (!editable) {
			console.warn("Couldn't get string[], no contenteditable found")
			return []
		}

		let rangeY = 0
		let rangeYlast = 0
		let lines: string[] = []
		let words = (editable.textContent ?? "").split(" ")
		let textnode = lastTextNode(editable)
		let pos = 0

		const range = document.createRange()
		range.setStart(textnode, 0)
		range.setEnd(textnode, 0)

		for (let word of words) {
			word = word + " "
			pos += word.length

			try {
				range.setStart(textnode, pos)
				range.setEnd(textnode, pos)
				rangeY = range.getBoundingClientRect().y
			} catch (_) {}

			if (rangeY > rangeYlast) {
				lines.unshift("")
				rangeYlast = rangeY
			}

			lines[0] += word
		}

		lines.reverse()

		return lines
	}

	container.addEventListener("keydown", function (e: KeyboardEvent) {
		const { line, dir } = detectLineJump(e) ?? {}
		const lines = getLines()

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
			const nextline = getNextLine(line, lines) ?? line
			node = lastTextNode(nextline)
			const textlen = node.nodeValue?.length || 0

			if (!goesRight) {
				const rows = getParagraphAsArrayWithDOM(nextline)
				offset = rangePosInCharLen(nextline, rows[0]) ?? -1

				if (offset < 0) offset = textlen
			}
		}

		if (dir === "up") {
			const prevline = getPrevLine(line, lines) ?? line
			node = lastTextNode(prevline)
			const textlen = node.nodeValue?.length || 0

			offset = textlen

			if (!goesLeft) {
				const rows = getParagraphAsArrayWithDOM(prevline)
				const lastrow = rows[rows.length - 1].trimEnd()
				let lastrowOffset = rangePosInCharLen(prevline, lastrow) ?? textlen

				offset = textlen - (lastrow.length - lastrowOffset)

				if (offset < 0) offset = textlen
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
			console.log(node)
			console.log("oupsie")
		}
	})
}
