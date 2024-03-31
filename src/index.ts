import { cutEvent, copyEvent, pasteEvent } from "./lib/clipboardControl"
import getContainer, { setContainer } from "./utils/getContainer"
import { toHTML, toMarkdown } from "./lib/contentControl"
import paragraphControl from "./lib/paragraphControl"
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
 * @param {string} id The id of the parent in which to put the editor
 * @param {string?} init Default text to add whn initializing pocket editor
 *
 * @example
 * import pocketEditor from 'pocket-editor'
 * import 'pocket-editor/style.css'
 *
 * const editor = pocketEditor("some-id", "Hello world")
 */
export default function pocketEditor(id: string, init?: string) {
	const container = setContainer(document.createElement("div"))

	container.id = "pocket-editor"
	getLine.init(container)
	container.appendChild(init ? toHTML(init) : generateLine({ text: "" }))
	document.getElementById(id)?.appendChild(container)

	queueMicrotask(() => {
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
	})

	if (document.getElementById(id) === null) {
		throw 'Pocket editor: id "' + id + '" was not found'
	}

	return {
		get: pocketeditor_get,
		set: pocketeditor_set,
		oninput: pocketeditor_oninput,
	}
}

/**
 * Gets the editor content as Markdown
 * @returns A valid markdown string
 */
function pocketeditor_get() {
	return toMarkdown(getLine.all())
}

/**
 * This replaces the content of the editor with the specified text.
 * All nodes are removed before adding the new generated HTML.
 * @param text - Either plain text or Markdown
 *
 * @example
 * // Checks the checkbox every pair seconds
 * const editor = pocketEditor("some-id", "Please wait")
 *
 * setInterval(() => {
 * 	 const second = new Date().getSeconds()
 * 	 const checkbox = second % 2 ? "[x]" : "[ ]"
 * 	 const text = `${checkbox} Second is pair`
 * 	 editor.set(text)
 * }, 1000)
 */
function pocketeditor_set(text: string) {
	const container = getContainer()
	Object.values(container.children).forEach((node) => node.remove())
	container.appendChild(toHTML(text))
}

/**
 * Listens to beforeinput, input, cut, and paste events inside the editor.
 * Automatically passes the editor content as markdown as an argument.
 * 
 * @param callback Get the content as a markdown string
 * @returns An event cleanup function
 * 
 * @example
 * // One-liner logger
 * pocketEditor("some-id", "Hello").oninput(console.log)
 * 
 * @example
 * // Saves editor content to localStorage
 * const editor = pocketEditor("some-id", "Hello")

 * editor.oninput((content) => {
 *   localStorage.saved = content
 * })
 */
function pocketeditor_oninput(callback: (content: string) => void) {
	const container = getContainer()
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

	function cb(e: Event) {
		if (e.type === "beforeinput") {
			// Apply beforeinput only on deleteContentBackward & insertParagraph
			if (!(e as InputEvent).inputType.match(/(deleteContentBackward|insertParagraph)/g)) {
				return
			}
		}

		callback(pocketeditor_get())
	}
}
