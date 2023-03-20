import lineTransform from "./lineTransform"

export default function generateLine(props?: { text?: string; modif?: string }) {
	const notesline = document.createElement("div")
	const editable = document.createElement("div")

	editable.setAttribute("contenteditable", "true")
	notesline.classList.add("line")
	notesline.appendChild(editable)

	// Add text if any
	if (typeof props?.text === "string") {
		editable.textContent = props.text
	}

	// Transform line
	switch (props?.modif) {
		case "todo":
		case "todo-checked":
			lineTransform.toTodolist(editable, props?.modif === "todo-checked")
			break

		case "unordered":
			lineTransform.toUnorderedList(editable)
			break

		case "h1":
		case "h2":
		case "h3":
			lineTransform.toHeading(editable, props?.modif)
			break
	}

	return notesline
}
