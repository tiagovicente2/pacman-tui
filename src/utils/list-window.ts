export function getListWindowStart(
	totalItems: number,
	visibleItems: number,
	selectedIndex: number,
): number {
	if (totalItems <= 0 || visibleItems <= 0) {
		return 0
	}

	if (totalItems <= visibleItems) {
		return 0
	}

	const maxStart = totalItems - visibleItems
	const centeredStart = selectedIndex - Math.floor(visibleItems / 2)

	if (centeredStart < 0) {
		return 0
	}

	if (centeredStart > maxStart) {
		return maxStart
	}

	return centeredStart
}
