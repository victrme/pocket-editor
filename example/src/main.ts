import pocketEditor from "../../src/index"
import "../../src/style.css"
import "./style.css"

const content = `## This is pocket editor !

You can transform by starting a line with these characters:
-   "# " creates a big heading
-   "## " medium heading
-   "### " small heading
-   "- " simple list
-   "[ ] " todo list

### Todays list

[x] Check sitting posture
[ ] Stay hydrated`

if (!sessionStorage.pcktdtr) {
	sessionStorage.pcktdtr = content
}

const editor = pocketEditor("wrapper")

editor.set(sessionStorage.pcktdtr)

editor.oninput(function () {
	sessionStorage.pcktdtr = editor.get()
})

document.getElementById("b_reset")?.addEventListener("click", () => {
	sessionStorage.pcktdtr = content
	editor.set(content)
})
