import "./style.css"
import getRangeOffsetFromParent from "./getRangeOffsetFromParent"
import jumpCaretToLine from "./jumpCaretToLine"

function generateLine(target?: HTMLElement) {
	const container = document.querySelector("#container")
	const wrapper = document.createElement("div")
	const content = document.createElement("div")

	content.classList.add("editable")
	content.setAttribute("contenteditable", "true")
	content.addEventListener("keydown", lineKeyboardEvent)

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
	if (!target) {
		content.innerText = `uhoorughurhguorhgrz
		GLRIHGLIRH iHRGIL Hlh LUHR LU
		glrizhglihril ihzr uzr ugzhuoz hrg`
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

function textStylingControl(range: Range, e: KeyboardEvent) {
	const trueRange = getRangeOffsetFromParent(range)
	const selectionLen = trueRange.end - trueRange.start
	if (selectionLen === 0) return

	function splitTextNodeAsSpan(style: string) {
		const target = e.target as HTMLDivElement
		const splitarr: [string, string][] = []

		Object.values(target?.childNodes).forEach((node) => {
			const val = node.textContent || node.nodeValue || ""
			let mods = ""

			// detect and add stylings to node object
			if (node.nodeName === "SPAN") {
				if ((node as Element).className === "text-italics") mods += "i"
				if ((node as Element).className === "text-bold") mods += "b"
				if ((node as Element).className === "text-strike") mods += "s"
				if ((node as Element).className === "text-code") mods += "c"
			}

			const chars = val.split("")
			const res: [string, string][] = chars.map((char) => [char, mods])
			splitarr.push(...res)
		})

		let newsplitarr = [...splitarr]

		// Updates characters modifications
		splitarr.forEach((split, i) => {
			if (i >= trueRange.start && i < trueRange.end) {
				if (split[1].includes("i")) return
				newsplitarr[i][1] += "i"
			}
		})

		target.innerHTML = ""

		let joinstr: string
		let lastmod: string

		function createNode(str: string) {
			let newnode: Element | Node

			if (lastmod === "i") {
				newnode = document.createElement("span")
				;(newnode as Element).classList.add("text-italics")
				;(newnode as Element).textContent = str
			} else {
				newnode = document.createTextNode(str)
			}

			return newnode
		}

		newsplitarr.forEach(([char, mod], i) => {
			// First char, init all
			if (i === 0) {
				lastmod = mod
				joinstr = char
				return
			}

			// last char, force node creation
			if (i + 1 === newsplitarr.length) {
				target.appendChild(createNode(joinstr + char))
				return
			}

			// same modification, just add to string
			if (mod === lastmod) {
				joinstr += char
				return
			}

			// Not same, reset string and change mod
			target.appendChild(createNode(joinstr))
			joinstr = char
			lastmod = mod
		})
	}

	if (e.key === "i" && e.ctrlKey) {
		e.preventDefault()
		console.log(range)
		splitTextNodeAsSpan("italics")
	}

	if (e.key === "b" && e.ctrlKey) {
		e.preventDefault()
		console.log("style selection to bold")
	}

	if (e.key === "s" && e.ctrlKey) {
		e.preventDefault()
		console.log("style selection to strike")
	}

	if (e.key === "e" && e.ctrlKey) {
		e.preventDefault()
		console.log("style selection to code")
	}
}

function lineKeyboardEvent(e: Event) {
	const container = document.querySelector("#container")
	const range = window.getSelection()?.getRangeAt(0)
	const target = e.target as HTMLDivElement

	if (!range || !target || !container) return

	//
	//
	textStylingControl(range, e as KeyboardEvent)
	//
	//

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

	if ((e as KeyboardEvent).key === " " && target.textContent?.startsWith("###") && range.endOffset === 3) {
		e.preventDefault()
		transformToHeading(target, "h3")
	}

	if ((e as KeyboardEvent).key === " " && target.textContent?.startsWith("[ ]") && range.endOffset === 3) {
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

	// if ((e as KeyboardEvent).key === "-" && target.textContent?.startsWith("--") && range.endOffset === 2) {
	// 	console.log("modify to separator")
	// }

	// Set "prepare text transform" value when inputing a "*", "**", "~~"
	// If it finds another similar input, split text node to add transform tag
	// set a "transformed text" value to true
	// If user hits backspace, removes transform
}

window.addEventListener("load", function () {
	generateLine()
})
