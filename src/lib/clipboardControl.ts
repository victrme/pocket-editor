import { toHTML, toMarkdown, checkModifs } from "./contentConversion"
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
		e.clipboardData?.setData("text/plain", toMarkdown(selected))
		e.preventDefault()

		removeLines(selected, container)
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
			let notesline = (e.target as Element)?.parentElement
			const newHTML = toHTML(text)

			// When pasting after selection, line is last selected block
			const selected = Object.values(document.querySelectorAll(".select-all"))
			if (selected.length > 0) notesline = selected.at(-1) as HTMLElement

			if (!notesline?.classList.contains("notes-line")) {
				return
			}

			container.insertBefore(newHTML, notesline.nextSibling)

			// not working
			// setCaret(lastSiblingNode(newHTML).node)

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
