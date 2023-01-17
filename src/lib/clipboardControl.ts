import { toHTML, toMarkdown, checkModifs } from "./contentConversion"
import lastSiblingNode from "../utils/lastSiblingNode"
import setCaret from "../utils/setCaret"
import removeLines from "../utils/removeLines"

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

		// sets data
		const textToCopy = toMarkdown(selected)
		e.clipboardData?.setData("text/plain", textToCopy)
		e.preventDefault()

		// remove lines
		removeLines(selected, container)

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

		// Text starts with a spcial char, create new lines
		if (checkModifs(text) !== "") {
			const notesline = (e.target as Element)?.parentElement

			if (notesline) {
				notesline?.after(toHTML(text))
				setCaret(lastSiblingNode(notesline).node)
			}

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
