import { toHTML, toMarkdown } from "./contentControl"
import getContainer from "../utils/getContainer"
import { getLines } from "../utils/getLines"
import setCaret from "../utils/setCaret"

type History = {
	index: number
	markdown: string
}

let history: History[] = []

export function addUndoHistory(lastline?: HTMLElement | null): void {
	const lines = getLines()
	const markdown = toMarkdown(lines)
	const index = lastline ? lines.indexOf(lastline) : 0

	if (markdown === history[0]?.markdown ?? "") {
		return
	}

	history.unshift({ markdown, index })

	if (history.length > 50) {
		history.pop()
	}
}

export default function initUndo() {
	// This observer stops ctrl + z from applying "pocket-editor undo" if the native undo did change something.
	// Has to do this bc can't preventDefault, and there's no undo API

	const container = getContainer()
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
			timeout = window.setTimeout(() => {
				applyUndo()
			}, 1)
		}
	})
}

function applyUndo() {
	const container = getContainer()
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
			setCaret(editable, false)
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
