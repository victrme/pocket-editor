import { toHTML, toMarkdown, checkModifs } from "./contentConversion"
import { generateLine } from "./generateLine"
import lastSiblingNode from "../utils/lastSiblingNode"
import setCaret from "../utils/setCaret"

export default function clipboardControl(container: HTMLElement) {
	function copyEvent(e: ClipboardEvent) {
		const selected = Object.values(document.querySelectorAll(".select-all"))
		const textToCopy = toMarkdown(selected)

		if (selected.length > 0) {
			// sets data
			e.clipboardData?.setData("text/plain", textToCopy)
			e.preventDefault()
		}
	}

	function cutEvent(e: ClipboardEvent) {
		const selected = Object.values(document.querySelectorAll(".select-all"))
		const nextLine = selected[selected.length - 1].nextElementSibling
		const emptyLine = generateLine()

		// sets data
		const textToCopy = toMarkdown(selected)
		e.clipboardData?.setData("text/plain", textToCopy)
		e.preventDefault()

		console.log(e.clipboardData?.getData("text/plain"))

		// remove selected lines
		selected.forEach((line, i) => {
			if (i === selected.length - 1) line.childNodes
			line.remove()
		})

		// focus on next generated line
		if (nextLine) nextLine.prepend(emptyLine)
		else container.appendChild(emptyLine)

		const { node } = lastSiblingNode(emptyLine)
		setCaret(node)

		// log
		console.log("cut")
	}

	function pasteEvent(e: ClipboardEvent) {
		e.preventDefault()

		// For now
		// transform paste content to plaintext
		const selection = window.getSelection()
		const range = selection?.getRangeAt(0)
		const text = e.clipboardData?.getData("text") || ""

		if (checkModifs(text) !== "") {
			const notesline = (e.target as Element)?.parentElement
			notesline?.after(toHTML(text))
			return
		}

		// Text doesn't start with special modif chars
		if (selection?.rangeCount && range) {
			selection.deleteFromDocument()
			range.insertNode(document.createTextNode(text))
			range.setStart(range.endContainer, range.endOffset)
		}
	}

	container.addEventListener("cut", cutEvent)
	container.addEventListener("copy", copyEvent)
	container.addEventListener("paste", pasteEvent)
}
