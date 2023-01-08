import getRangeOffsetFromParent from "./getRangeOffsetFromParent"

export default function textStylingControl(range: Range, e: KeyboardEvent) {
	const trueRange = getRangeOffsetFromParent(range)
	const selectionLen = trueRange.end - trueRange.start
	if (selectionLen === 0) return

	function splitTextNodeAsSpan(style: string) {
		const target = e.target as HTMLDivElement
		const splitarr: [string, string][] = []

		console.log(style)

		Object.values(target?.childNodes).forEach((node) => {
			const val = node.textContent || node.nodeValue || ""
			let mods = ""

			// detect and add stylings to node object
			if (node.nodeName === "SPAN") {
				if ((node as Element).className === "text-italics") mods += "i"
				if ((node as Element).className === "text-bold") mods += "b"
				if ((node as Element).className === "text-strike") mods += "s"
				if ((node as Element).className === "text-code") mods += "c"
			}

			const chars = val.split("")
			const res: [string, string][] = chars.map((char) => [char, mods])
			splitarr.push(...res)
		})

		let newsplitarr = [...splitarr]

		// Updates characters modifications
		splitarr.forEach((split, i) => {
			if (i >= trueRange.start && i < trueRange.end) {
				if (split[1].includes("i")) return
				newsplitarr[i][1] += "i"
			}
		})

		target.innerHTML = ""

		let joinstr: string
		let lastmod: string

		function createNode(str: string) {
			let newnode: Element | Node

			if (lastmod === "i") {
				newnode = document.createElement("span")
				;(newnode as Element).classList.add("text-italics")
				;(newnode as Element).textContent = str
			} else {
				newnode = document.createTextNode(str)
			}

			return newnode
		}

		newsplitarr.forEach(([char, mod], i) => {
			// First char, init all
			if (i === 0) {
				lastmod = mod
				joinstr = char
				return
			}

			// last char, force node creation
			if (i + 1 === newsplitarr.length) {
				target.appendChild(createNode(joinstr + char))
				return
			}

			// same modification, just add to string
			if (mod === lastmod) {
				joinstr += char
				return
			}

			// Not same, reset string and change mod
			target.appendChild(createNode(joinstr))
			joinstr = char
			lastmod = mod
		})
	}

	if (e.key === "i" && e.ctrlKey) {
		e.preventDefault()
		console.log(range)
		splitTextNodeAsSpan("italics")
	}

	if (e.key === "b" && e.ctrlKey) {
		e.preventDefault()
		console.log("style selection to bold")
	}

	if (e.key === "s" && e.ctrlKey) {
		e.preventDefault()
		console.log("style selection to strike")
	}

	if (e.key === "e" && e.ctrlKey) {
		e.preventDefault()
		console.log("style selection to code")
	}
}
