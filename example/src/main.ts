import pocketEditor from "../../dist/index"
import markdown from "./markdown"
import "../../src/style.css"
import "./style.css"

window.addEventListener("load", function () {
	const editor = pocketEditor("wrapper")
	editor.set(markdown)

	this.document.querySelector("#b_logcontent")?.addEventListener("click", function () {
		console.log(editor.get())
	})
})
