import { cutEvent, copyEvent, pasteEvent } from "./lib/clipboardControl"
import { toHTML, toMarkdown } from "./lib/contentControl"
import paragraphControl from "./lib/paragraphControl"
import { setContainer } from "./utils/getContainer"
import lineSelection from "./lib/lineSelection"
import lineDeletion from "./lib/lineDeletion"
import generateLine from "./lib/lineGenerate"
import caretControl from "./lib/caretControl"
import keybindings from "./lib/keybindings"
import getLine from "./utils/getLines"
import initUndo from "./lib/undo"

/**
 * This creates an editor.
 * You might also need to add the basic styling with "style.css"
 *
 * @param {string} id - The id of the parent in which to put the editor
 *
 * @example
 * import pocketEditor from 'pocket-editor'
 * import 'pocket-editor/style.css'
 *
 * const editor = pocketEditor("some-id")
 */
export default function pocketEditor(id: string) {
	const container = setContainer(document.createElement("div"))

	function set(string: string) {
		Object.values(container.children).forEach((node) => node.remove())
		container.appendChild(toHTML(string))
	}

	function get() {
		return toMarkdown(getLine.all())
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
		container.addEventListener("beforeinput", paragraphControl)
		container.addEventListener("input", paragraphControl)
		container.addEventListener("keydown", keybindings)
		container.addEventListener("paste", pasteEvent)
		container.addEventListener("copy", copyEvent)
		container.addEventListener("cut", cutEvent)
		lineSelection(container)
		caretControl(container)
		lineDeletion()
		initUndo()
	}, 0)

	getLine.init(container)

	container.appendChild(generateLine({ text: "" }))
	document.getElementById(id)?.appendChild(container)

	if (document.getElementById(id) === null) {
		throw 'Pocket editor: id "' + id + '" was not found'
	}

	return { get, set, oninput }
}
