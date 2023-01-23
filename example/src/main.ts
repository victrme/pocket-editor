import pocketEditor from "../../src/index"
import markdown from "./markdown"

import "../../src/style.css"
import "./style.css"

window.addEventListener("load", function () {
	const editor = pocketEditor("wrapper")

	editor.set(markdown)

	editor.oninput(function () {
		localStorage.pocketEditor = editor.get()
	})
})
