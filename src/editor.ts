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

	function removeLine(target: Element) {
		const parent = target.parentElement as HTMLDivElement
		const prevParent = parent.previousElementSibling as HTMLDivElement
		const prevEditable = prevParent.querySelector(".editable") as HTMLDivElement
		if (!prevEditable) return

		prevEditable?.focus()

		// put caret to end of previous line
		const selection = window.getSelection()
		const range = document.createRange()
		range.selectNodeContents(prevEditable)
		range.collapse(false)
		selection?.removeAllRanges()
		selection?.addRange(range)

		parent.remove()
	}

	function removeModifier(target: Element) {
		const content = document.createElement("div")
		const parent = target.parentElement as HTMLElement
		if (!parent) return

		parent.className = "notes-line"
		content.textContent = parent.textContent

		content.classList.add("editable")
		content.setAttribute("contenteditable", "true")
		content.addEventListener("keydown", lineKeyboardEvent)

		Object.values(parent.childNodes).forEach((node) => {
			node.remove()
		})

		parent.appendChild(content)
		content.focus()
	}

	function transformToHeading(target: HTMLElement, tag: string) {
		const isTag = (h: number) => tag.includes(h.toString())
		const heading = document.createElement(tag)
		heading.innerHTML = target.innerHTML

		// Remove markdown characters
		heading.textContent = heading.textContent?.replace(isTag(1) ? "#" : isTag(2) ? "##" : "###", "") || ""
		heading.setAttribute("contenteditable", "true")
		heading.addEventListener("keydown", lineKeyboardEvent)

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

	function lineKeyboardEvent(e: Event) {
		const container = document.querySelector("#container")
		const range = window.getSelection()?.getRangeAt(0)
		const target = e.target as HTMLElement

		if (!range || !target || !container) return

		if ((e as KeyboardEvent).key === "Enter" && (e as KeyboardEvent).shiftKey === false) {
			e.preventDefault()
			generateLine(target)
		}

		// Backspace + caret at first pos
		if ((e as KeyboardEvent).key === "Backspace" && range.endOffset === 0) {
			//
			// It is a modified line
			if (target.parentElement?.classList.contains("modif-line")) {
				removeModifier(target)
				console.log("Has modifier, remove modifier")
			}

			// Not modified + no text
			else if (target.textContent === "") {
				if (container.children.length === 1) return

				e.preventDefault()
				removeLine(target)
				console.log("No modifier, remove line")
			}
		}

		if ((e as KeyboardEvent).key === " " && target.textContent?.startsWith("#") && range.endOffset === 1) {
			e.preventDefault()
			transformToHeading(target, "h1")
		}

		if ((e as KeyboardEvent).key === " " && target.textContent?.startsWith("##") && range.endOffset === 2) {
			e.preventDefault()
			transformToHeading(target, "h2")
		}

		if (
			(e as KeyboardEvent).key === " " &&
			target.textContent?.startsWith("###") &&
			range.endOffset === 3
		) {
			e.preventDefault()
			transformToHeading(target, "h3")
		}

		if (
			(e as KeyboardEvent).key === " " &&
			target.textContent?.startsWith("[ ]") &&
			range.endOffset === 3
		) {
			e.preventDefault()
			transformToTodolist(target)
		}

		if ((e as KeyboardEvent).key === " " && target.textContent?.startsWith("-") && range.endOffset === 1) {
			e.preventDefault()
			transformToUnorderedList(target)
		}

		if ((e as KeyboardEvent).key === "ArrowUp") {
			jumpCaretToLine("up", range, e as KeyboardEvent)
		}

		if ((e as KeyboardEvent).key === "ArrowDown") {
			jumpCaretToLine("down", range, e as KeyboardEvent)
		}

		// if ((e as KeyboardEvent).key === " " && target.textContent?.startsWith("1.") && range.endOffset === 1) {
		// 	console.log("modify to ordered element")
		// }
	}

	const div = document.createElement("div")
	div.id = "container"
	div?.addEventListener("keydown", lineKeyboardEvent)
	div?.addEventListener("beforeinput", (e) => console.log(e))
	document.getElementById(initWrapper)?.appendChild(div)

	generateLine(undefined, "Lorem ipsum dolor sit amet")
	generateLine(undefined, "")
	generateLine(undefined, "Pellentesque sit amet purus vestibulum, egestas est quis, consequat ante.")
	generateLine(undefined, "### Donec convallis lacinia lacus eu molestie. vitae dignissim purus eleifend.")
	generateLine(
		undefined,
		"Donec convallis lacinia lacus eu molestie. Quisque tempus magna ut varius euismod.In hac habitasse platea dictumst. Mauris egestas orci id justo molestie, vitae dignissim purus eleifend."
	)

	return
}
