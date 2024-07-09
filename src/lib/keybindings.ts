import removeModifier from "../utils/removeModifier"
import lineTransform from "./lineTransform"
import PocketEditor from "../index"

export default async function keybindings(self: PocketEditor, ev: KeyboardEvent) {
	const editable = ev.target as HTMLElement
	const ctrl = ev.ctrlKey || ev.metaKey
	const isValid = ctrl && ev.shiftKey && ev.code.includes("Digit")

	if (isValid && editable) {
		const index = parseInt(ev.code.replace("Digit", "")) - 1
		const targetMod = Object.keys(self.mods)[index]

		if (index === 5) {
			ev.preventDefault()
			removeModifier(editable)
			return
		}

		if (targetMod in self.mods && targetMod !== "todo-checked") {
			ev.preventDefault()
			lineTransform(self, editable, targetMod as keyof typeof self.mods)
		}
	}
}
