import lineTransform from "./lineTransform"
import removeModifier from "../utils/removeModifier"
import generateLine from "./lineGenerate"
import modList from "../utils/modList"

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

export default function paragraphControl(e: Event) {
	const range = window.getSelection()?.getRangeAt(0)
	const target = e.target as HTMLElement
	const { inputType } = e as InputEvent
	const container = document.querySelector("#pocket-editor")

	if (!range || !target || !container || !inputType) {
		return
	}

	if (e.type === "beforeinput" && inputType === "insertParagraph") {
		e.preventDefault()
		paragraphInsert(container, target, range)
		return
	}

	if (
		inputType !== "insertText" ||
		(target?.parentElement?.classList?.contains("mod") &&
			(target?.parentElement?.classList?.contains("ul-list") ||
				target?.parentElement?.classList?.contains("todo")))
	) {
		return // not insert or modif on already list line
	}

	const targetText = target.textContent || ""
	let whichMod = ""

	Object.entries(modList).forEach(([key, val]) => {
		if (targetText.startsWith(val)) whichMod = key
	})

	if (whichMod === "h1") lineTransform.toHeading(target, "h1")
	if (whichMod === "h2") lineTransform.toHeading(target, "h2")
	if (whichMod === "h3") lineTransform.toHeading(target, "h3")
	if (whichMod === "todo") lineTransform.toTodolist(target)
	if (whichMod === "todo-checked") lineTransform.toTodolist(target)
	if (whichMod === "unordered") lineTransform.toUnorderedList(target)
}
