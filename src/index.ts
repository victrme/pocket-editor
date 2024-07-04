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

export default class PocketEditor {
	container: HTMLElement

	/**
	 * This creates an editor.
	 * You might also need to add the basic styling with "style.css"
	 *
	 * @param {string} id The id of the parent in which to put the editor
	 * @param {Object} [options] Pocket editor options
	 * @param {string} [options.text] Default text to add when initializing pocket editor
	 * @param {string} [options.name] Specify a name for this instance of the editor
	 *
	 * @example
	 * import pocketEditor from 'pocket-editor'
	 * import 'pocket-editor/style.css'
	 *
	 * const editor = new pocketEditor("some-id", { text: "Hello world" })
	 */
	constructor(id: string, options?: { text?: string; name?: string }) {
		const div = document.createElement("div")
		this.container = setContainer(div)
		getLine.init(div)
		div.dataset.pocketEditor = options?.name
		div.appendChild(options?.text ? toHTML(options?.text) : generateLine({ text: "" }))

		document.getElementById(id)?.appendChild(div)

		queueMicrotask(() => {
			div.addEventListener("beforeinput", (e) => paragraphControl(e))
			div.addEventListener("input", paragraphControl)
			div.addEventListener("keydown", keybindings)
			div.addEventListener("paste", pasteEvent)
			div.addEventListener("copy", copyEvent)
			div.addEventListener("cut", cutEvent)
			lineSelection(div)
			caretControl(div)
			lineDeletion()
			initUndo()
		})

		if (document.getElementById(id) === null) {
			throw 'Pocket editor: id "' + id + '" was not found'
		}
	}

	/**
	 * Gets the editor content as Markdown
	 * @returns A valid markdown string
	 */
	public get() {
		return toMarkdown(getLine.all())
	}

	/**
	 * This replaces the content of the editor with the specified text.
	 * All nodes are removed before adding the new generated HTML.
	 * @param text - Either plain text or Markdown
	 *
	 * @example
	 * // Checks the checkbox every pair seconds
	 * const editor = new pocketEditor("some-id", { text: "Please wait" })
	 *
	 * setInterval(() => {
	 * 	 const second = new Date().getSeconds()
	 * 	 const checkbox = second % 2 ? "[x]" : "[ ]"
	 * 	 const text = `${checkbox} Second is pair`
	 * 	 editor.set(text)
	 * }, 1000)
	 */
	public set(text: string) {
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
	 * pocketEditor("some-id", { text: "Hello" }).oninput(console.log)
	 * 
	 * @example
	 * // Saves editor content to localStorage
	 * const editor = new pocketEditor("some-id", { text: "Hello" })

	 * editor.oninput((content) => {
	 *   localStorage.saved = content
	 * })
 */
	public oninput(callback: (content: string) => void) {
		const self = this
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

			callback(self.get())
		}
	}

	private paragraphControl(event: Event) {
		paragraphControl(event)
	}
}
