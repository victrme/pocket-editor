import getContainer from "./getContainer"

export function getLines(container = getContainer()): HTMLElement[] {
	return Object.values(container.querySelectorAll<HTMLElement>(".line"))
}

export function getSelectedLines(lines = getLines()): HTMLElement[] {
	return Object.values(lines).filter((line) => line.classList.contains("sel")) ?? []
}

export function getPrevLine(line: HTMLElement, lines = getLines()): HTMLElement | null {
	return lines[lines.indexOf(line) - 1]
}

export function getNextLine(line: HTMLElement, lines = getLines()): HTMLElement | null {
	return lines[lines.indexOf(line) + 1]
}

export function getLineFromEditable(elem: HTMLElement): HTMLElement | null {
	while (elem?.parentElement) {
		if (elem.parentElement.classList.contains("line")) {
			return elem.parentElement
		}

		elem = elem.parentElement
	}

	return null
}
