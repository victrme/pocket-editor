import deleteContentBackwardEvent from "./lib/deleteContentBackwardEvent"
import jumpCaretToLine from "./lib/jumpCaretToLine"
import removeModifier from "./lib/removeModifier"

export default function tinyNotes(initWrapper: string) {
	const container = document.createElement("div")

	function generateLine({ target, text, modif }: { target?: HTMLElement; text?: string; modif?: string }) {
		const notesline = document.createElement("div")
		const editable = document.createElement("div")

		editable.classList.add("editable")
		notesline.classList.add("notes-line")
		editable.setAttribute("contenteditable", "true")
		notesline.appendChild(editable)

		// Add text if any
		if (typeof text === "string") editable.innerText = text

		// Transform line
		switch (modif) {
			case "todo":
				transformToTodolist(editable)
				break

			case "todo-checked":
				transformToTodolist(editable, true)
				break

			case "unordered":
				transformToUnorderedList(editable)
				break

			case "h1":
			case "h2":
			case "h3":
				transformToHeading(editable, modif)
				break
		}

		// Put line where it is supposed to be
		const parentSibling = target?.parentElement?.nextElementSibling
		if (parentSibling) container.insertBefore(notesline, parentSibling)
		else container.appendChild(notesline)

		editable.focus()

		// might be useful in the future
		return editable
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

	function transformToTodolist(target: HTMLElement, checked?: true) {
		const input = document.createElement("input")
		const parent = target.parentElement

		if (!parent) return

		input.type = "checkbox"
		input.addEventListener("input", () => {
			if (input.checked) input.setAttribute("checked", "")
			else input.removeAttribute("checked")
		})

		if (checked) input.checked = true

		parent?.classList.add("modif-line")
		parent?.classList.add("todo-list")
		parent.prepend(input)

		target.innerHTML = target.innerHTML.replace("[ ]", "")
		target.innerHTML = target.innerHTML.replace("[x]", "")
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
		const lineClasses = target.parentElement?.classList

		// Remove mod if line is empty with modif
		if (target.textContent === "" && lineClasses?.contains("modif-line")) {
			removeModifier(target)
			return
		}

		// create new line if or if br (for now)
		if (range.startContainer.nodeType !== 3) {
			generateLine({ target })
			return
		}

		// Does it need transformation ?
		let modif
		if (lineClasses?.contains("todo-list")) modif = "todo"
		if (lineClasses?.contains("unordered-list")) modif = "unordered"

		// put text between caret and EOL on new line
		generateLine({ target, text: text.slice(range?.startOffset) || "", modif })

		// Remove newlined text to previous line
		if (range.startContainer.textContent) {
			range.startContainer.textContent = text.slice(0, range.startOffset)
		}
	}

	function lineKeyboardEvent(e: InputEvent) {
		const range = window.getSelection()?.getRangeAt(0)
		const target = e.target as HTMLElement

		if (!range || !target || !container) return

		if (e.inputType === "insertParagraph") {
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

		if (targetText.startsWith("[x]")) {
			if (e.inputType === "insertText" && textWithInput.startsWith("[x] ")) {
				transformToTodolist(target)
				e.preventDefault()
			}
		}
	}

	function set(markdown: string) {
		function checkModifs(text: string) {
			const modList = {
				h1: "# ",
				h2: "## ",
				h3: "### ",
				todo: "[ ] ",
				unordered: "- ",
				"todo-checked": "[x] ",
			}

			let modif = ""

			Object.entries(modList).forEach(([name, str]) => {
				if (text.startsWith(str)) modif = name
			})

			return modif
		}

		// Delete all content before
		Object.values(container.children).forEach((node) => node.remove())

		markdown.split("\n\n").forEach((line) => {
			// Finds modifs that use line breaks (list & todos)
			// And create a line for them
			if (line.split("\n").length > 1) {
				line.split("\n").forEach((subline) => {
					generateLine({ text: subline, modif: checkModifs(subline) })
				})
				return
			}

			// Normal line
			generateLine({ text: line, modif: checkModifs(line) })
		})
	}

	container.id = "tiny-notes"

	container.addEventListener("keydown", function (e) {
		arrowMovement(e)
	})

	container.addEventListener("beforeinput", function (e) {
		deleteContentBackwardEvent(e)
		lineKeyboardEvent(e)
	})

	generateLine({ text: "" })
	document.getElementById(initWrapper)?.appendChild(container)

	return { set }
}
