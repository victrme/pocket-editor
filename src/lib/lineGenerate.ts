import lineTransform from "./lineTransform"
import modList from "../utils/modList"

export default function generateLine(props?: { text?: string; modif?: string }) {
	const notesline = document.createElement("div")
	const editable = document.createElement("p")
	const mod = props?.modif ?? ""

	editable.setAttribute("contenteditable", "true")
	notesline.classList.add("line")
	notesline.appendChild(editable)

	// Add text if any
	if (typeof props?.text === "string") {
		editable.textContent = props.text
	}

	if (mod in Object.keys(modList)) {
		lineTransform(editable, mod as keyof typeof modList, false)
	}

	return notesline
}
