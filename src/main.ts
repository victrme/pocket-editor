import "./style.css"

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
		content.textContent =
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec tempus, nunc ut faucibus placerat, mauris quam vehicula mauris, in volutpat risus diam in lectus. Aenean ultricies risus sit amet risus fermentum ullamcorper. Nulla tincidunt laoreet lorem non fermentum. Nulla libero quam, suscipit imperdiet orci non, malesuada auctor massa. Sed faucibus nulla vel nibh faucibus, vitae imperdiet nisl auctor. Etiam sit amet mi tincidunt, euismod velit a, mattis quam. Aliquam aliquet lacinia aliquam. Nunc sed nisi sed sapien fermentum pulvinar ac vel elit. Sed sed aliquam sapien, at ullamcorper metus. Donec finibus ante ut urna porttitor, et tincidunt augue sagittis. Curabitur nulla odio, tincidunt ut felis et, efficitur eleifend ex. "
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
	const selectionLen = range.endOffset - range.startOffset
	if (selectionLen === 0) return

	function splitTextNodeAsSpan(style: string) {
		const target = e.target as HTMLDivElement
		const editableText = target.innerText || ""

		console.log(target)

		const pre = document.createTextNode(editableText.slice(0, range.startOffset))
		const post = document.createTextNode(editableText.slice(range.endOffset, editableText.length - 1))
		const span = document.createElement("span")

		span.textContent = editableText.slice(range.startOffset, range.endOffset)

		if (style === "italics") {
			span.className = "text-italics"
		}

		// type TextModifiers = {
		// 	val: string
		// 	pos: [number, number]
		// 	bold?: true
		// 	italics?: true
		// 	strike?: true
		// 	code?: true
		// }

		// let nodeStartPos = 0
		// let currentEditableText: TextModifiers[] = []

		// Object.values(target?.childNodes).forEach((node) => {
		// 	const val = node.nodeValue || ""
		// 	const pos: [number, number] = [nodeStartPos, nodeStartPos + val.length - 1]
		// 	let res: TextModifiers = { pos, val }

		// 	// detect and add stylings to node object
		// 	if (node.nodeName === "SPAN") {
		// 		if ((node as Element).className === "text-italics") res.italics = true
		// 		if ((node as Element).className === "text-bold") res.bold = true
		// 		if ((node as Element).className === "text-strike") res.strike = true
		// 		if ((node as Element).className === "text-code") res.code = true
		// 	}

		// 	// next node will start at the end of this one
		// 	nodeStartPos += val.length
		// 	currentEditableText.push(res)
		// })

		// suppr tout
		target.innerHTML = ""
		target.appendChild(pre)
		target.appendChild(span)
		target.appendChild(post)
		target.focus()
	}

	if (e.key === "i" && e.ctrlKey) {
		e.preventDefault()
		console.log("style selection to italics")
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
