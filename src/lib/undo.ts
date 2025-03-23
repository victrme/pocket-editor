import { toHTML, toMarkdown } from "./contentControl"
import { setCaret } from "../utils/setCaret"
import type PocketEditor from "../index"

type History = {
	index: number
	markdown: string
}

const history: History[] = []

export function addUndoHistory(self: PocketEditor, lastline?: HTMLElement | null): void {
	const lines = self.lines
	const markdown = toMarkdown(lines)
	const index = lastline ? lines.indexOf(lastline) : 0

	if (markdown === history[0]?.markdown || "") {
		return
	}

	history.unshift({ markdown, index })

	if (history.length > 50) {
		history.pop()
	}
}

export function initUndo(self: PocketEditor): void {
	// This observer stops ctrl + z from applying "pocket-editor undo" if the native undo did change something.
	// Has to do this bc can't preventDefault, and there's no undo API

	let timeout: number

	const observer = new MutationObserver(() => {
		if (timeout) {
			clearTimeout(timeout)
		}
	})

	observer.observe(self.container, {
		characterData: true,
		subtree: true,
	})

	self.container.addEventListener("keydown", e => {
		if ((e.ctrlKey || e.metaKey) && e.key === "z") {
			timeout = window.setTimeout(() => {
				applyUndo(self)
			}, 1)
		}
	})
}

function applyUndo(self: PocketEditor): void {
	const { markdown, index } = history[0] ?? {}

	if (!markdown) {
		return
	}

	for (const node of Object.values(self.container.children)) {
		node.remove()
	}

	self.container.appendChild(toHTML(self, markdown))

	setTimeout(() => {
		const editable = self.container.querySelectorAll<HTMLElement>("[contenteditable]")[index]

		if (editable) {
			editable.focus()
			setCaret(editable, false)
		}
	}, 0)

	history.shift()

	self.container.dispatchEvent(
		new InputEvent("input", {
			inputType: "insertText",
			bubbles: true,
			data: "",
		}),
	)
}
