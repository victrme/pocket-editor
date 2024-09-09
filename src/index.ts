import { cutEvent, copyEvent, pasteEvent } from "./lib/clipboardControl"
import { toHTML, toMarkdown } from "./lib/contentControl"
import paragraphControl from "./lib/paragraphControl"
import lineTransform from "./lib/lineTransform"
import lineSelection from "./lib/lineSelection"
import lineDeletion from "./lib/lineDeletion"
import caretControl from "./lib/caretControl"
import keybindings from "./lib/keybindings"
import initUndo from "./lib/undo"
import setCaret from "./utils/setCaret"

class PocketEditor {
	container: HTMLElement
	lines: HTMLElement[]
	wrapper: Element | null
	caret_x: number | undefined

	ZERO_WIDTH_WHITESPACE = "​"

	mods = {
		h1: "#",
		h2: "##",
		h3: "###",
		list: "-",
		todo: "[ ]",
		"todo-checked": "[x]",
	}

	/**
	 * This creates an editor.
	 * You might also need to add the basic styling with "style.css"
	 *
	 * @param {string} selector The selector of the parent in which to put the editor
	 * @param {Object} [options] Pocket editor options
	 * @param {string} [options.text] Default text to add when initializing pocket editor
	 * @param {string} [options.id] Specify an id for this instance of the editor
	 * @param {true | number} [options.defer] Defer load with a timeout
	 *
	 * @example
	 * import pocketEditor from 'pocket-editor'
	 * import 'pocket-editor/style.css'
	 *
	 * const editor = new pocketEditor("some-selector", { text: "Hello world" })
	 */
	constructor(selector: string, options?: Options) {
		const div = document.createElement("div")
		const { text, defer, id } = options ?? {}

		this.wrapper = document.querySelector(selector)
		this.container = div
		this.lines = []

		if (this.wrapper === null) {
			throw `Pocket editor: selector "${selector}" was not found`
		}

		if (id) {
			div.id = id
		}

		div.dataset.pocketEditor = ""

		if (typeof defer === "number") {
			setTimeout(() => this.init(text), defer)
		} else if (defer === true) {
			setTimeout(() => this.init(text))
		} else {
			this.init(text)
		}
	}

	private init(text?: string) {
		const self = this

		if (text) {
			this.container.appendChild(toHTML(this, text))
		} else {
			this.container.appendChild(this.createLine({ text: "" }))
		}

		if (this.wrapper) {
			this.wrapper.appendChild(this.container)
		}

		this.container.addEventListener("beforeinput", (ev) => paragraphControl(self, ev))
		this.container.addEventListener("input", (ev) => paragraphControl(self, ev))
		this.container.addEventListener("keydown", (ev) => keybindings(self, ev))
		this.container.addEventListener("paste", (ev) => pasteEvent(self, ev))
		this.container.addEventListener("copy", (ev) => copyEvent(self, ev))
		this.container.addEventListener("cut", (ev) => cutEvent(self, ev))

		lineSelection(self)
		caretControl(self)
		lineDeletion(self)
		initUndo(self)

		const lineObserverCallback = () => {
			this.lines = Object.values(this.container.children) as HTMLElement[]
		}

		const observer = new MutationObserver(lineObserverCallback)
		observer.observe(this.container, { childList: true })

		this.lines = Object.values(this.container.children) as HTMLElement[]
	}

	/**
	 * Gets the editor content as Markdown
	 * @returns A valid markdown string
	 */
	get value() {
		return toMarkdown(this.lines)
	}

	/**
	 * This replaces the content of the editor with the specified text.
	 * All nodes are removed before adding the new generated HTML.
	 * @param text - Either plain text or Markdown
	 *
	 * @example
	 * // Checks the checkbox every pair seconds
	 * const editor = new pocketEditor("#some-id", { text: "Please wait" })
	 *
	 * setInterval(() => {
	 * 	 const second = new Date().getSeconds()
	 * 	 const checkbox = second % 2 ? "[x]" : "[ ]"
	 * 	 const text = `${checkbox} Second is pair`
	 * 	 editor.value = text
	 * }, 1000)
	 */
	set value(text: string) {
		Object.values(this.container.children).forEach((node) => node.remove())
		this.container.appendChild(toHTML(this, text))
	}

	/**
	 * Listens to beforeinput, input, cut, and paste events inside the editor.
	 * Automatically passes the editor content as markdown as an argument.
	 * 
	 * @param listener Get the content as a markdown string
	 * @returns An event cleanup function
	 * 
	 * @example
	 * // One-liner logger
	 * pocketEditor("#some-id", { text: "Hello" }).oninput = console.log
	 * 
	 * @example
	 * // Saves editor content to localStorage
	 * const editor = new pocketEditor("#some-id", { text: "Hello" })

	 * editor.oninput = content => {
	 *   localStorage.saved = content
	 * })
 	 */
	public oninput(listener: (content: string) => void): () => void {
		const self = this
		this.container.addEventListener("cut", cb)
		this.container.addEventListener("paste", cb)
		this.container.addEventListener("input", cb)
		this.container.addEventListener("beforeinput", cb)

		return () => {
			this.container.removeEventListener("cut", cb)
			this.container.removeEventListener("paste", cb)
			this.container.removeEventListener("input", cb)
			this.container.removeEventListener("beforeinput", cb)
		}

		function cb(e: Event) {
			if (e.type === "beforeinput") {
				// Apply beforeinput only on deleteContentBackward & insertParagraph
				if (!(e as InputEvent).inputType.match(/(deleteContentBackward|insertParagraph)/g)) {
					return
				}
			}

			listener(self.value)
		}
	}

	/**
	 * An addEventListener wrapper for esthetic purposes.
	 *
	 * @param type Listens to everything on "input"
	 * @param listener Get the content as a markdown string
	 * @returns An event cleanup function
	 */
	public addEventListener(type: "input", listener: (content: string) => void): () => void {
		return this.oninput(listener)
	}

	public getSelectedLines(): HTMLElement[] {
		return this.lines.filter((line) => line.dataset.selected !== undefined) ?? []
	}

	public getPrevLine(line: HTMLElement): HTMLElement | null {
		return this.lines[this.lines.indexOf(line) - 1]
	}

	public getNextLine(line: HTMLElement): HTMLElement | null {
		return this.lines[this.lines.indexOf(line) + 1]
	}

	public getLineFromEditable(elem: HTMLElement): HTMLElement | null {
		while (elem?.parentElement) {
			const parent = elem.parentElement
			const isDiv = parent.tagName === "DIV"

			if (isDiv) {
				return parent
			} else {
				elem = parent
			}
		}

		return null
	}

	public removeLines(lines: HTMLElement[]) {
		const emptyLine = this.createLine()
		const prevline = this.getPrevLine(lines[0])

		lines.forEach((line) => line.remove())

		if (prevline) {
			this.insertAfter(emptyLine, prevline)
		} else {
			this.container.prepend(emptyLine)
		}

		setCaret(emptyLine)

		// Mock event to trigger oninput
		this.container.dispatchEvent(
			new InputEvent("input", {
				inputType: "deleteContent",
				bubbles: true,
				data: "",
			})
		)
	}

	public createLine(props?: { text?: string; modif?: string }) {
		const notesline = document.createElement("div")
		const editable = document.createElement("p")
		const mod = props?.modif ?? ""
		const mods = this.mods

		editable.setAttribute("contenteditable", "true")
		notesline.appendChild(editable)

		// Add text if any
		if (typeof props?.text === "string") {
			editable.textContent = props.text
		}

		if (mod in mods) {
			lineTransform(this, editable, mod as keyof typeof mods, false)
		}

		return notesline
	}

	private insertAfter(newNode: Node, existingNode: Node) {
		existingNode?.parentNode?.insertBefore(newNode, existingNode.nextSibling)
	}
}

// Exports

export default PocketEditor

globalThis.PocketEditor = PocketEditor

// Types

declare global {
	var PocketEditor: _PocketEditor
}

type _PocketEditor = typeof PocketEditor

type Options = {
	id?: string
	text?: string
	defer?: true | number
}
