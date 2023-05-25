import lastSiblingNode from "../utils/lastSiblingNode"
import setCaret from "../utils/setCaret"

type History = {
	action: string
	text: string
	snapshot: Element
	targetline: number
}

let history: History[] = []

export function addHistory(action: History) {
	history.push(action)
	console.log(history)
}

export function initHistory(container: HTMLElement) {
	container.addEventListener("keydown", (e) => {
		if (e.ctrlKey && e.key === "z") {
			applyHistory(container)
		}
	})
}

function applyHistory(container: HTMLElement) {
	const last = history.at(-1)

	if (!last) return

	const current = encodeURIComponent(container.textContent ?? "")
	const lasttext = encodeURIComponent(last.text)
	const isTextSimilar = current === lasttext

	if (isTextSimilar) {
		container.innerHTML = last.snapshot?.innerHTML ?? ""

		console.log(last.targetline)

		history.pop()

		container.dispatchEvent(
			new InputEvent("input", {
				inputType: "insertText",
				bubbles: true,
				data: "",
			})
		)

		setTimeout(() => {
			const editable = document.querySelectorAll<HTMLElement>("#pocket-editor [contenteditable]")[
				last.targetline
			]

			if (editable) {
				editable.focus()
				setCaret(lastSiblingNode(editable).node, false)
			}
		}, 0)
	}
}
