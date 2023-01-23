import lineTransform from "./lineTransform"
import removeModifier from "../utils/removeModifier"
import generateLine from "./lineGenerate"

function paragraphInsert(container: Element, target: HTMLElement, range: Range) {
	const text = range.startContainer?.nodeValue || ""
	const lineClasses = target.parentElement?.classList

	function appendLine(line: HTMLElement) {
		const nextLine = target.parentElement?.nextElementSibling

		// append line where it is supposed to be, then focus
		nextLine ? container.insertBefore(line, nextLine) : container?.appendChild(line)
		line.querySelector<HTMLElement>("[contenteditable]")?.focus()
	}

	// Remove mod if line is empty with modif
	if (range.startOffset === 0 && lineClasses?.contains("mod")) {
		removeModifier(target)
		return
	}

	// create new line if or if br (for now)
	if (range.startContainer.nodeType !== 3) {
		appendLine(generateLine())
		return
	}

	// Does it need transformation ?
	let modif
	if (lineClasses?.contains("todo")) modif = "todo"
	if (lineClasses?.contains("ul-list")) modif = "unordered"

	// put text between caret and EOL on new line
	const nextLineText = text.slice(range?.startOffset) || ""

	// Remove newlined text to previous line
	if (range.startContainer.textContent) {
		range.startContainer.textContent = text.slice(0, range.startOffset)
	}

	// append line
	appendLine(generateLine({ text: nextLineText, modif }))
}

export default function paragraphControl(e: InputEvent) {
	const range = window.getSelection()?.getRangeAt(0)
	const target = e.target as HTMLElement
	const container = document.querySelector("#pocket-editor")

	if (!range || !target || !container) return

	if (e.inputType === "insertParagraph") {
		e.preventDefault()
		paragraphInsert(container, target, range)
	}

	const { startOffset } = range
	const targetText = target.textContent || ""
	const textWithInput = targetText.slice(0, startOffset) + e.data + targetText.slice(startOffset)

	// Big Heading
	if (targetText.startsWith("#")) {
		if (e.inputType === "insertText" && textWithInput.startsWith("# ")) {
			lineTransform.toHeading(target, "h1")
			e.preventDefault()
		}
	}

	// Medium Heading
	if (targetText.startsWith("##")) {
		if (e.inputType === "insertText" && textWithInput.startsWith("## ")) {
			lineTransform.toHeading(target, "h2")
			e.preventDefault()
		}
	}

	// Small Heading
	if (targetText.startsWith("###")) {
		if (e.inputType === "insertText" && textWithInput.startsWith("### ")) {
			lineTransform.toHeading(target, "h3")
			e.preventDefault()
		}
	}

	// Prevent modif on already modified line
	if (target?.parentElement?.classList.contains("mod")) {
		return
	}

	// Unordered List
	if (targetText.startsWith("-")) {
		if (e.inputType === "insertText" && textWithInput.startsWith("- ")) {
			lineTransform.toUnorderedList(target)
			e.preventDefault()
		}
	}

	// Checkbox List
	if (targetText.startsWith("[ ]")) {
		if (e.inputType === "insertText" && textWithInput.startsWith("[ ] ")) {
			lineTransform.toTodolist(target)
			e.preventDefault()
		}
	}

	// Checked checkbox List
	if (targetText.startsWith("[x]")) {
		if (e.inputType === "insertText" && textWithInput.startsWith("[x] ")) {
			lineTransform.toTodolist(target)
			e.preventDefault()
		}
	}
}
