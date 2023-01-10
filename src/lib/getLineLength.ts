export default function getLineLength(element: HTMLElement) {
	const text = element.innerText
	let arr = encodeURI(text).split("%0A")
	let len = arr.map((str) => decodeURI(str).length)

	return len
}
