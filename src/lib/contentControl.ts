import generateLine from "./lineGenerate"

export function checkModifs(text: string) {
	const modList = {
		h1: "# ",
		h2: "## ",
		h3: "### ",
		todo: "[ ] ",
		unordered: "- ",
		"todo-checked": "[x] ",
	}

	let modif = ""

	Object.entries(modList).forEach(([name, str]) => {
		if (text.startsWith(str)) modif = name
	})

	return modif
}

export function toHTML(markdown: string) {
	// create fragment to append only once to real DOM
	const fragment = document.createDocumentFragment()

	// remove tabs for now
	markdown = markdown.replaceAll("\t", "")

	markdown.split("\n\n").forEach((line) => {
		// Finds modifs that use line breaks (list & todos)
		// And create a line for them
		if (line.split("\n").length > 1) {
			line.split("\n").forEach((subline) => {
				fragment.appendChild(generateLine({ text: subline, modif: checkModifs(subline) }))
			})
			return
		}

		// Normal line
		fragment.appendChild(generateLine({ text: line, modif: checkModifs(line) }))
	})

	return fragment
}

export function toMarkdown(lines: Element[]) {
	function addModif(line: Element) {
		if (line.classList.contains("ul-list")) return "- "
		if (line.classList.contains("h1")) return "# "
		if (line.classList.contains("h2")) return "## "
		if (line.classList.contains("h3")) return "### "
		if (line.classList.contains("todo")) {
			return line.querySelector<HTMLInputElement>("input")?.checked ? "[x] " : "[ ] "
		}

		return ""
	}

	let plaintext = ""
	let modif = ""

	const isList = (line?: Element) => {
		return line?.classList.contains("ul-list") || line?.classList.contains("todo")
	}

	lines.forEach((line, i) => {
		// Add markdown
		modif = addModif(line)
		plaintext += modif + line.textContent

		// Add line break
		const isWithinList = isList(lines[i + 1]) && isList(line)
		const isLastLine = lines.length - 1 === i
		plaintext += isLastLine ? "" : isWithinList ? "\n" : "\n\n"
	})

	return plaintext
}

export default { toHTML, toMarkdown }
