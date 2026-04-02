const INPUT_MODE_SHORTCUTS = new Set(['tab', '1', '2', '3', '/', 'q', 'escape'])

export type SearchMode = 'input' | 'list'

export function shouldHandleGlobalShortcut(
	keyName: string,
	isSearchTab: boolean,
	searchMode: SearchMode,
	ctrl: boolean,
	meta: boolean,
): boolean {
	if ((ctrl || meta) && keyName === 'c') {
		return true
	}

	if (!isSearchTab) {
		return true
	}

	if (searchMode === 'list') {
		return true
	}

	return INPUT_MODE_SHORTCUTS.has(keyName)
}
