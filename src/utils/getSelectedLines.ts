export default function getSelectedLines(container?: HTMLElement): HTMLElement[] {
	container = container ?? (document.getElementById("pocket-editor") as HTMLElement)
	return Object.values(container?.querySelectorAll<HTMLElement>(".line.sel") ?? [])
}
