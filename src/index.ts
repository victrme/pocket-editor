import { cutEvent, copyEvent, pasteEvent } from "./lib/clipboardControl"
import { toHTML, toMarkdown } from "./lib/contentControl"
import paragraphControl from "./lib/paragraphControl"
import { setContainer } from "./utils/getContainer"
import lineSelection from "./lib/lineSelection"
import lineDeletion from "./lib/lineDeletion"
import generateLine from "./lib/lineGenerate"
import caretControl from "./lib/caretControl"
import { getLines } from "./utils/getLines"
import initUndo from "./lib/undo"

export default function pocketEditor(wrapper: string) {
	const container = setContainer(document.createElement("div"))

	// Delete all content before & append generated HTML
	function set(string: string) {
		Object.values(container.children).forEach((node) => node.remove())
		container.appendChild(toHTML(string))
	}

	function get() {
		return toMarkdown(getLines(container))
	}

	function oninput(callback: Function) {
		function cb(e: Event) {
			if (e.type === "beforeinput") {
				// Apply beforeinput only on deleteContentBackward & insertParagraph
				if (!(e as InputEvent).inputType.match(/(deleteContentBackward|insertParagraph)/g)) {
					return
				}
			}
			callback()
		}

		container.addEventListener("cut", cb)
		container.addEventListener("paste", cb)
		container.addEventListener("input", cb)
		container.addEventListener("beforeinput", cb)

		return () => {
			container.removeEventListener("cut", cb)
			container.removeEventListener("paste", cb)
			container.removeEventListener("input", cb)
			container.removeEventListener("beforeinput", cb)
		}
	}

	container.id = "pocket-editor"

	setTimeout(() => {
		lineSelection()
		lineDeletion()
		initUndo()
	}, 0)

	container.addEventListener("paste", pasteEvent)
	container.addEventListener("copy", copyEvent)
	container.addEventListener("cut", cutEvent)
	container.addEventListener("beforeinput", paragraphControl)
	container.addEventListener("input", paragraphControl)
	container.addEventListener("keydown", caretControl)

	container.appendChild(generateLine({ text: "" }))
	document.getElementById(wrapper)?.appendChild(container)

	if (document.getElementById(wrapper) === null) {
		throw 'Pocket editor: id "' + wrapper + '" was not found'
	}

	return { set, get, oninput }
}
