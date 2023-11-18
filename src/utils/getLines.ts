let lines: HTMLElement[]

const getLine = {
	all: getLines,
	selected: getSelectedLines,
	next: getNextLine,
	previous: getPrevLine,
	fromEditable: getLineFromEditable,
	init: initLinesObserver,
}

export default getLine

function initLinesObserver(container: HTMLElement) {
	const lineObserverCallback = () => {
		lines = Object.values(container.querySelectorAll<HTMLElement>(".line"))
	}

	const observer = new MutationObserver(lineObserverCallback)
	observer.observe(container, { childList: true })
}

function getLines(): HTMLElement[] {
	return lines
}

function getSelectedLines(): HTMLElement[] {
	return lines.filter((line) => line.classList.contains("sel")) ?? []
}

function getPrevLine(line: HTMLElement): HTMLElement | null {
	return lines[lines.indexOf(line) - 1]
}

function getNextLine(line: HTMLElement): HTMLElement | null {
	return lines[lines.indexOf(line) + 1]
}

function getLineFromEditable(elem: HTMLElement): HTMLElement | null {
	while (elem?.parentElement) {
		if (elem.parentElement.classList.contains("line")) {
			return elem.parentElement
		}

		elem = elem.parentElement
	}

	return null
}
