import lastSiblingNode from "./lastSiblingNode"
import setCaret from "./setCaret"

export default function clipboardControl(container: HTMLElement) {
	function getMarkdownFromLines(lines: Element[]) {
		let plaintext = ""

		lines.forEach((line) => {
			plaintext += line.textContent + "\n\n"
		})

		return plaintext
	}

	function copyEvent(e: ClipboardEvent) {
		const selected = Object.values(document.querySelectorAll(".select-all"))
		const textToCopy = getMarkdownFromLines(selected)

		if (selected.length > 0) {
			// sets data
			e.clipboardData?.setData("text/plain", textToCopy)
			e.preventDefault()
		}

		console.log("copy")
	}

	function cutEvent(e: ClipboardEvent) {
		const selected = Object.values(document.querySelectorAll(".select-all"))
		const nextLine = selected[selected.length - 1].nextElementSibling

		// sets data
		const textToCopy = getMarkdownFromLines(selected)
		e.clipboardData?.setData("text/plain", textToCopy)
		e.preventDefault()

		console.log(e.clipboardData?.getData("text/plain"))

		// remove selected lines
		selected.forEach((line) => line.remove())

		// focus on next line if available
		if (nextLine) {
			const { node } = lastSiblingNode(nextLine)
			setCaret(node)
		}

		// log
		console.log("cut")
	}

	function pasteEvent(e: ClipboardEvent) {
		e.preventDefault()

		// For now
		// transform paste content to plaintext
		const selection = window.getSelection()
		const text = e.clipboardData?.getData("text") || ""

		if (selection?.rangeCount) {
			const range = selection.getRangeAt(0)
			selection.deleteFromDocument()
			range.insertNode(document.createTextNode(text))
			range.setStart(range.endContainer, range.endOffset)
		}
	}

	container.addEventListener("cut", cutEvent)
	container.addEventListener("copy", copyEvent)
	container.addEventListener("paste", pasteEvent)
}
