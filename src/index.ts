import deleteContentBackwardEvent from "./lib/deleteContentBackwardEvent"
import jumpCaretToLine from "./lib/jumpCaretToLine"
import lastSiblingNode from "./lib/lastSiblingNode"

export default function editor(initWrapper: string) {
	const container = document.createElement("div")

	function generateLine({
		target,
		text,
		modif,
	}: {
		target?: HTMLElement
		text?: string
		modif?: "todo" | "unordered" | "h1" | "h2" | "h3"
	}) {
		const container = document.querySelector("#container")
		const notesline = document.createElement("div")
		const editable = document.createElement("div")

		editable.classList.add("editable")
		editable.setAttribute("contenteditable", "true")

		notesline.classList.add("notes-line")
		notesline.appendChild(editable)

		// Find where to put the new line
		const parentSibling = target?.parentElement?.nextElementSibling
		if (parentSibling) container?.insertBefore(notesline, parentSibling)
		else container?.appendChild(notesline)

		// Does it need transformation ?
		if (target?.parentElement?.classList.contains("todo-list")) transformToTodolist(editable)
		if (target?.parentElement?.classList.contains("unordered-list")) transformToUnorderedList(editable)

		editable.focus()

		// for debug
		if (text) {
			editable.textContent = text
		}
	}

	function transformToHeading(target: HTMLElement, tag: string) {
		const isTag = (h: number) => tag.includes(h.toString())
		const heading = document.createElement(tag)
		heading.innerHTML = target.innerHTML

		// Remove markdown characters
		heading.textContent = heading.textContent?.replace(isTag(1) ? "#" : isTag(2) ? "##" : "###", "") || ""
		heading.setAttribute("contenteditable", "true")
		heading.classList.add("editable")

		target.parentElement?.classList.add("modif-line")
		target.replaceWith(heading)
		heading.focus()
	}

	function transformToTodolist(target: HTMLElement) {
		const input = document.createElement("input")
		const parent = target.parentElement

		if (!parent) return

		input.type = "checkbox"
		input.addEventListener("input", () => {
			if (input.checked) input.setAttribute("checked", "")
			else input.removeAttribute("checked")
		})

		parent?.classList.add("modif-line")
		parent?.classList.add("todo-list")
		parent.prepend(input)

		target.innerHTML = target.innerHTML.replace("[ ]", "")
		target.focus()
	}

	function transformToUnorderedList(target: HTMLElement) {
		const span = document.createElement("span")
		const parent = target.parentElement

		if (!parent) return

		span.dataset.content = "•"
		span.classList.add("list-dot")

		parent?.classList.add("modif-line")
		parent?.classList.add("unordered-list")
		parent.prepend(span)

		target.innerHTML = target.innerHTML.replace("-", "")
		target.focus()
	}

	function arrowMovement(e: KeyboardEvent) {
		const range = window.getSelection()?.getRangeAt(0)
		if (!range) return

		if (e.key === "ArrowUp") jumpCaretToLine("up", range, e)
		if (e.key === "ArrowDown") jumpCaretToLine("down", range, e)
	}

	function classicParagraphInsert(target: HTMLElement, range: Range) {
		const text = range.startContainer?.nodeValue || ""

		// create new line if or if br (for now)
		if (range.startContainer.nodeType !== 3) {
			generateLine({ target })
			return
		}

		// put text between caret and EOL on new line
		generateLine({ target, text: text.slice(range?.startOffset) || "" })

		// Remove newlined text to previous line
		if (range.startContainer.textContent) {
			range.startContainer.textContent = text.slice(0, range.startOffset)
		}
	}

	function lineKeyboardEvent(e: InputEvent) {
		const container = document.querySelector("#container")
		const range = window.getSelection()?.getRangeAt(0)
		const target = e.target as HTMLElement

		if (!range || !target || !container) return

		if (e.inputType) {
			e.preventDefault()
			classicParagraphInsert(target, range)
		}

		const { startOffset } = range
		const targetText = target.textContent || ""
		const textWithInput = targetText.slice(0, startOffset) + e.data + targetText.slice(startOffset)

		// Plaintext pasting
		if (e.inputType === "insertFromPaste") {
			const plaintext = e.dataTransfer?.getData("text/plain")
			const withPaste = targetText.slice(0, startOffset) + plaintext + targetText.slice(startOffset)

			// todo:
			// Don't use lastSiblingNode, because you could paste from anywhere !!
			// Must implement line generation from markdown before
			// 1) Output markdown from html line
			// 2) Add paste content at position in markdown
			// 3) Generate html from new markdown string

			console.log(plaintext, withPaste)
		}

		// Big Heading
		if (targetText.startsWith("#")) {
			if (e.inputType === "insertText" && textWithInput.startsWith("# ")) {
				transformToHeading(target, "h1")
				e.preventDefault()
			}
		}

		// Medium Heading
		if (targetText.startsWith("##")) {
			if (e.inputType === "insertText" && textWithInput.startsWith("## ")) {
				transformToHeading(target, "h2")
				e.preventDefault()
			}
		}

		// Small Heading
		if (targetText.startsWith("###")) {
			if (e.inputType === "insertText" && textWithInput.startsWith("### ")) {
				transformToHeading(target, "h3")
				e.preventDefault()
			}
		}

		// Unordered List
		if (targetText.startsWith("-")) {
			if (e.inputType === "insertText" && textWithInput.startsWith("- ")) {
				transformToUnorderedList(target)
				e.preventDefault()
			}
		}

		// Checkbox List
		if (targetText.startsWith("[ ]")) {
			if (e.inputType === "insertText" && textWithInput.startsWith("[ ] ")) {
				transformToTodolist(target)
				e.preventDefault()
			}
		}
	}

	container.id = "container"
	container?.addEventListener("keydown", function (e) {
		arrowMovement(e)
		console.log(e)
	})
	container?.addEventListener("beforeinput", function (e) {
		deleteContentBackwardEvent(e)
		lineKeyboardEvent(e)
		console.log(e)
	})

	document.getElementById(initWrapper)?.appendChild(container)

	// For line generation
	// "\n" is <br> in same line
	// "\n\n" is a new line
	generateLine({ text: "" })
	return
}
