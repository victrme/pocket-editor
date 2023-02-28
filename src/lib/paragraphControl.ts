import removeModifier from "../utils/removeModifier"
import modList from "../utils/modList"
import generateLine from "./lineGenerate"
import lineTransform from "./lineTransform"

export default function paragraphControl(e: Event, container: HTMLElement, is: "insert" | "transform") {
	const target = e.target as HTMLElement

	if (target?.tagName === "INPUT") return // Don't need control when clicking on checkbox

	const range = window.getSelection()?.getRangeAt(0)
	const { inputType } = e as InputEvent

	if (!range || !target || !inputType) return

	//
	// ParagraphInsert is a beforeinput event
	//

	if (is === "insert" && inputType === "insertParagraph") {
		e.preventDefault()

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

		return
	}

	//
	// lineTransform is a input event
	//

	if (
		is !== "transform" ||
		inputType !== "insertText" ||
		(target?.parentElement?.classList?.contains("mod") &&
			(target?.parentElement?.classList?.contains("ul-list") ||
				target?.parentElement?.classList?.contains("todo")))
	) {
		return // no modif on already list line
	}

	const targetText = target.textContent || ""
	let whichMod = ""

	Object.entries(modList).forEach(([key, val]) => {
		if (
			targetText.startsWith(val + String.fromCharCode(32)) ||
			targetText.startsWith(val + String.fromCharCode(160))
		)
			whichMod = key
	})

	if (whichMod === "h1") lineTransform.toHeading(target, "h1")
	if (whichMod === "h2") lineTransform.toHeading(target, "h2")
	if (whichMod === "h3") lineTransform.toHeading(target, "h3")
	if (whichMod === "todo") lineTransform.toTodolist(target)
	if (whichMod === "todo-checked") lineTransform.toTodolist(target)
	if (whichMod === "unordered") lineTransform.toUnorderedList(target)
}
