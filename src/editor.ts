import deleteContentBackwardEvent from "./deleteContentBackwardEvent"
import jumpCaretToLine from "./jumpCaretToLine"

export default function editor(initWrapper: string) {
	function generateLine(target?: HTMLElement, text?: string) {
		const container = document.querySelector("#container")
		const wrapper = document.createElement("div")
		const content = document.createElement("div")

		content.classList.add("editable")
		content.setAttribute("contenteditable", "true")

		wrapper.classList.add("notes-line")
		wrapper.appendChild(content)

		// Find where to put the new line
		const parentSibling = target?.parentElement?.nextElementSibling
		if (parentSibling) container?.insertBefore(wrapper, parentSibling)
		else container?.appendChild(wrapper)

		// Does it need transformation ?
		if (target?.parentElement?.classList.contains("todo-list")) transformToTodolist(content)
		if (target?.parentElement?.classList.contains("unordered-list")) transformToUnorderedList(content)

		content.focus()

		// for debug
		if (!target && text) {
			content.innerText = text
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

	function lineKeyboardEvent(e: InputEvent) {
		const container = document.querySelector("#container")
		const range = window.getSelection()?.getRangeAt(0)
		const target = e.target as HTMLElement

		if (!range || !target || !container) return

		if (e.inputType === "insertParagraph") {
			e.preventDefault()
			generateLine(target)
			return
		}

		const { startOffset } = range
		const targetText = target.textContent || ""
		const textWithInput = targetText.slice(0, startOffset) + e.data + targetText.slice(startOffset)

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

	const div = document.createElement("div")
	div.id = "container"

	div?.addEventListener("keydown", function (e) {
		arrowMovement(e)
		console.log(e)
	})

	div?.addEventListener("beforeinput", function (e) {
		deleteContentBackwardEvent(e)
		lineKeyboardEvent(e)
		console.log(e)
	})

	document.getElementById(initWrapper)?.appendChild(div)

	generateLine(undefined, "Bonjour je suis un test")
	generateLine(undefined, "Enfin un autre, oui !")
	generateLine(undefined, "Lorem ipsum dolor sit amet")

	return
}
