import modList from "../utils/modList"
import lineTransform from "./lineTransform"

export default async function keybindings(e: KeyboardEvent) {
	const editable = e.target as HTMLElement
	const ctrl = e.ctrlKey || e.metaKey
	const isValid = ctrl && e.shiftKey && e.code.includes("Digit")

	if (isValid && editable) {
		const index = parseInt(e.code.replace("Digit", "")) - 1
		const targetMod = modList[index]

		if (targetMod) {
			e.preventDefault()

			switch (targetMod[0]) {
				case "h1":
					lineTransform.toHeading(editable, "h1", true)
					break

				case "h2":
					lineTransform.toHeading(editable, "h2", true)
					break

				case "h3":
					lineTransform.toHeading(editable, "h3", true)
					break

				case "list":
					lineTransform.toList(editable, true)
					break

				case "todo":
					lineTransform.toTodolist(editable, false, true)
					break

				default:
					break
			}
		}
	}
}
