import "@fontsource/reenie-beanie"

import pocketEditor from "../../src/index"
import "../../src/style.css"
import "./style.css"

const intro = `## This is pocket editor

You can transform a line by starting with these characters:
-   "# " creates a big heading
-   "## " medium heading
-   "### " small heading
-   "- " simple list
-   "[ ] " todo list

### Today's list

[x] Check sitting posture
[ ] Stay hydrated`

if (!sessionStorage.pcktdtr) {
	sessionStorage.pcktdtr = intro
}

const editor = new pocketEditor("#wrapper", {
	text: sessionStorage.pcktdtr,
	id: "example",
})

editor.oninput((content) => {
	sessionStorage.pcktdtr = content
})

document.getElementById("b_reset")?.addEventListener("click", () => {
	sessionStorage.pcktdtr = intro
	editor.value = intro
})
