import pocketEditor from "../../src/index"
import "../../src/style.css"

import markdown from "./markdown"
import "./style.css"

window.addEventListener("load", function () {
	const editor = pocketEditor("wrapper")
	editor.set(markdown)
})
