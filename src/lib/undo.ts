import { toHTML, toMarkdown } from "./contentControl"
import lastSiblingNode from "../utils/lastSiblingNode"
import setCaret from "../utils/setCaret"

type History = {
	index: number
	markdown: string
}

let history: History[] = []

export function addUndoHistory(container: Element, lastline?: Element | null): void {
	const markdown = toMarkdown(Object.values(container.children))
	const index = Array.from(container.children).indexOf(lastline ?? container.children[0])

	if (markdown === history[0]?.markdown ?? "") {
		return
	}

	history.unshift({ markdown, index })

	if (history.length > 50) {
		history.pop()
	}
}

export default function initUndo(container: HTMLElement) {
	// This observer stops ctrl + z from applying "pocket-editor undo" if the native undo did change something.
	// Has to do this bc can't preventDefault, and there's no undo API

	let timeout: number

	const observer = new MutationObserver(() => {
		if (timeout) clearTimeout(timeout)
	})

	observer.observe(container, {
		characterData: true,
		subtree: true,
	})

	container.addEventListener("keydown", (e) => {
		if ((e.ctrlKey || e.metaKey) && e.key === "z") {
			timeout = setTimeout(() => {
				applyUndo(container)
			}, 1)
		}
	})
}

function applyUndo(container: HTMLElement) {
	const { markdown, index } = history[0] ?? {}

	if (!markdown) {
		return
	}

	Object.values(container.children).forEach((node) => node.remove())
	container.appendChild(toHTML(markdown))

	setTimeout(() => {
		const editable = container.querySelectorAll<HTMLElement>("[contenteditable]")[index]

		if (editable) {
			editable.focus()
			setCaret(lastSiblingNode(editable).node, false)
		}
	}, 0)

	history.shift()

	container.dispatchEvent(
		new InputEvent("input", {
			inputType: "insertText",
			bubbles: true,
			data: "",
		})
	)
}
