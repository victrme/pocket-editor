import pocketEditor from "pocket-editor"
import markdown from "./markdown"
import "pocket-editor/dist/style.css"
import "./style.css"

window.addEventListener("load", function () {
	const editor = pocketEditor("wrapper")
	editor.set(markdown)

	this.document.querySelector("#b_logcontent")?.addEventListener("click", function () {
		console.log(editor.get())
	})
})
