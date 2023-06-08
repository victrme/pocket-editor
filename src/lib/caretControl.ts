import { getLines, getNextLine, getPrevLine } from "../utils/getLines"
import lastSiblingNode from "../utils/lastSiblingNode"
import detectLineJump from "../utils/detectLineJump"
import getContainer from "../utils/getContainer"

function rangePosInCharLen(line: Element | null, str: string): number | null {
	const sel = window.getSelection()
	const range = sel?.getRangeAt(0)?.cloneRange()
	const rx = range?.getBoundingClientRect().x ?? 0
	const cx = line?.querySelector("[contenteditable]")?.getBoundingClientRect().x ?? 0
	const ox = rx - cx

	const lineMod = line?.className.replace("line ", "").toLocaleUpperCase() // headings have diff character sizes
	const tagName = lineMod?.includes("H") ? lineMod : "p"
	const elem = document.createElement(tagName)

	elem.style.position = "absolute"
	elem.style.whiteSpace = "pre"
	elem.style.width = ox + "px"
	elem.style.overflow = "hidden"
	elem.style.opacity = "0"

	line?.appendChild(elem)

	let charCount: ReturnType<typeof rangePosInCharLen> = null

	const span = document.createElement("span")
	span.textContent = "abcdefghijklmnopqrstuvwxyz"
	elem.appendChild(span)
	const averageCharWidth = span.offsetWidth / 26

	elem.textContent = ""

	for (const char of str.split("")) {
		const span = document.createElement("span")
		span.textContent = char
		elem.appendChild(span)

		if (span.offsetLeft + averageCharWidth / 2 >= ox) {
			charCount = Math.max(0, elem.childElementCount - 1)
			break
		}
	}

	elem.remove()
	return charCount
}

function getParagraphAsArray(line: HTMLElement | null): string[] {
	if (!line) {
		console.warn("Couldn't get string[], line undefined")
		return []
	}

	// Create a temporary clone of the paragraph
	const container = getContainer()
	const lineRect = line.getBoundingClientRect()
	const wrapper = document.createElement("div")
	const clone = line.cloneNode(true)

	wrapper.id = "pocket-editor-mock-p"
	wrapper.style.width = lineRect.width + "px"

	// Append the clone to the document body
	wrapper?.appendChild(clone)
	container?.appendChild(wrapper)

	const editable = wrapper.querySelector("[contenteditable]")

	if (!editable) {
		console.warn("Couldn't get string[], no contenteditable found")
		return []
	}

	let lastHeight = 0
	let lines: string[] = []
	let words = (editable.textContent ?? "").split(" ")

	editable.textContent = ""

	for (let i = 0; i < words.length; i++) {
		// Add word to mock
		const word = words[i] + " "
		editable.textContent += word

		// Create new line if height changed
		const editableHeight = editable.getBoundingClientRect().height ?? 0
		if (editableHeight !== lastHeight) {
			lines.push("")
		}

		// Add word to the last line
		lines[lines.length - 1] += word
		lastHeight = editableHeight
	}

	wrapper.remove()
	return lines
}

export default function caretControl(e: KeyboardEvent) {
	const { line, dir } = detectLineJump(e) ?? {}
	const lines = getLines()

	if (!line) return

	const goesRight = e.key === "ArrowRight"
	const goesLeft = e.key === "ArrowLeft"
	let sel = window.getSelection()
	let range = document.createRange()
	let offset = 0
	let node

	if (dir === "down") {
		const nextline = getNextLine(line, lines) ?? line
		node = lastSiblingNode(nextline)
		const textlen = node.nodeValue?.length || 0

		if (!goesRight) {
			const rows = getParagraphAsArray(nextline)
			offset = rangePosInCharLen(nextline, rows[0]) ?? -1

			if (offset < 0) offset = textlen
		}
	}

	if (dir === "up") {
		const targetline = getPrevLine(line, lines) ?? line
		node = lastSiblingNode(targetline)
		const textlen = node.nodeValue?.length || 0

		offset = textlen

		if (!goesLeft) {
			const rows = getParagraphAsArray(targetline)
			const lastrow = rows[rows.length - 1].trimEnd()
			let lastrowOffset = rangePosInCharLen(targetline, lastrow) ?? textlen

			offset = textlen - (lastrow.length - lastrowOffset)

			if (offset < 0) offset = textlen
		}
	}

	range.setStart(node as Node, offset)
	range.setEnd(node as Node, offset)

	sel?.removeAllRanges()
	sel?.addRange(range)
	sel?.collapseToEnd()

	e.preventDefault()
}
