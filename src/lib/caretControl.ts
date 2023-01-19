import detectLineJump from "../utils/detectLineJump"
import lastSiblingNode from "../utils/lastSiblingNode"
import setCaret from "../utils/setCaret"

export default function caretControl(e: KeyboardEvent) {
	function jumpCallback(notesline: Element, dir: string) {
		let node: Node

		if (dir === "down") {
			node = lastSiblingNode(notesline?.nextElementSibling as Node).node
			setCaret(node, e.key === "ArrowRight")
			e.preventDefault()
		}

		if (dir === "up") {
			node = lastSiblingNode(notesline?.previousElementSibling as Node).node
			setCaret(node, false)
			e.preventDefault()
		}
	}

	detectLineJump(e, jumpCallback)
}
