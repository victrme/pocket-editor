export default function getSelectedLines(container?: HTMLElement): HTMLElement[] {
	container = container ?? (document.getElementById("pocket-editor") as HTMLElement)
	const res = Object.values(container?.querySelectorAll<HTMLElement>(".line.sel") ?? [])

	console.log(res)

	return res
}
