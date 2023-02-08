import { cutEvent, copyEvent, pasteEvent } from "./lib/clipboardControl"
import { toHTML, toMarkdown } from "./lib/contentControl"
import paragraphControl from "./lib/paragraphControl"
import lineSelection from "./lib/lineSelection"
import lineDeletion from "./lib/lineDeletion"
import generateLine from "./lib/lineGenerate"
import caretControl from "./lib/caretControl"

export default function pocketEditor(wrapper: string) {
	const container = document.createElement("div")

	// Delete all content before & append generated HTML
	function set(string: string) {
		Object.values(container.children).forEach((node) => node.remove())
		container.appendChild(toHTML(string))
	}

	function get() {
		const lines = Object.values(container.querySelectorAll(".line"))
		if (lines) return toMarkdown(lines)
		return ""
	}

	function oninput(callback: Function) {
		const cb = (e: Event) => {
			if (e.type === "beforeinput") {
				// Apply beforeinput only on deleteContentB & insertP
				if (!(e as InputEvent).inputType.match(/(deleteContentBackward|insertParagraph)/g)) {
					return
				}
			}

			console.log(e)
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

	lineSelection(container)
	lineDeletion(container)

	container.addEventListener("paste", (e) => pasteEvent(e, container))
	container.addEventListener("cut", (e) => cutEvent(e, container))
	container.addEventListener("copy", copyEvent)

	container.addEventListener("input", paragraphControl)
	container.addEventListener("beforeinput", paragraphControl)
	container.addEventListener("keydown", caretControl)

	container.appendChild(generateLine({ text: "" }))
	document.getElementById(wrapper)?.appendChild(container)

	return { set, get, oninput }
}
