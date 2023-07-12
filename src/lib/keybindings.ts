import modList from "../utils/modList"
import lineTransform from "./lineTransform"

export default async function keybindings(e: KeyboardEvent) {
	const editable = e.target as HTMLElement
	const ctrl = e.ctrlKey || e.metaKey
	const isValid = ctrl && e.shiftKey && e.code.includes("Digit")

	if (isValid && editable) {
		const index = parseInt(e.code.replace("Digit", "")) - 1
		const targetMod = Object.keys(modList)[index]

		if (targetMod in modList) {
			e.preventDefault()
			lineTransform(editable, targetMod as keyof typeof modList)
		}
	}
}
