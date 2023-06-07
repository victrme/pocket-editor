import getContainer from "./getContainer"

export default function getSelectedLines(): HTMLElement[] {
	return Object.values(getContainer()?.querySelectorAll<HTMLElement>(".line.sel") ?? [])
}
