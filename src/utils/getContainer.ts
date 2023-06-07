let pocketEditorContainer: HTMLElement

export function setContainer(elem: HTMLElement): HTMLElement {
	pocketEditorContainer = elem
	return elem
}

export default function getContainer(): HTMLElement {
	return pocketEditorContainer ?? (document.getElementById("pocket-editor") as HTMLElement)
}
