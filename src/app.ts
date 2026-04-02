// src/app.ts - Clean rewrite

import type { CliRenderer, KeyEvent } from '@opentui/core'
import {
	getAvailableUpdates,
	getInstalledPackages,
	installPackage,
	removePackage,
	searchPackages,
	updatePackage,
	updateSystem,
} from './paru'
import { theme } from './theme'
import type { AppState, Package, TabType } from './types'
import { type SearchMode, shouldHandleGlobalShortcut } from './utils/keyboard'
import { getMainContentHeight } from './utils/layout'
import { filterPackageList } from './utils/list-filter'
import { getInstallTarget } from './utils/package-target'
import { sortSearchPackages } from './utils/search-ranking'
import { shouldUpdateSelectedPackage } from './utils/update-target'

// Component refs (using unknown for dynamic imports)
let TabBar: unknown
let StatusBar: unknown
let PackageList: unknown
let PackageDetail: unknown
let SearchInput: unknown
let ConfirmDialog: unknown
let Box: unknown

// State
let renderer: CliRenderer | null = null
let state: AppState = {
	currentTab: 'installed',
	packages: [],
	selectedPackage: null,
	searchQuery: '',
	isLoading: false,
	statusMessage: 'Loading...',
	errorMessage: null,
}

let selectedIndex = 0
let searchMode: SearchMode = 'list'
let showConfirm = false
let confirmTitle = ''
let confirmMessage = ''
let confirmAction: (() => void) | null = null

// UI elements
let keypressHandler: ((key: KeyEvent) => void) | null = null
let resizeHandler: (() => void) | null = null
let installedLoadId = 0
let updatesLoadId = 0
let searchLoadId = 0
let baseListPackages: Package[] = []
let listFilterQuery = ''
let listFilterMode = false

function getDimensions() {
	return {
		width: process.stdout.columns || 120,
		height: process.stdout.rows || 30,
	}
}

function setState(updates: Partial<AppState>) {
	state = { ...state, ...updates }
	render()
}

function isListTab(tab: TabType): boolean {
	return tab === 'installed' || tab === 'updates'
}

function getBaseListStatus(tab: TabType, totalCount: number): string {
	if (tab === 'updates') {
		return totalCount > 0 ? `${totalCount} updates` : 'Up to date'
	}

	return `${totalCount} packages`
}

function applyCurrentListFilter() {
	const filtered = filterPackageList(baseListPackages, listFilterQuery)

	if (selectedIndex >= filtered.length) {
		selectedIndex = Math.max(0, filtered.length - 1)
	}

	const statusMessage = listFilterQuery.trim()
		? `${filtered.length}/${baseListPackages.length} match`
		: getBaseListStatus(state.currentTab, baseListPackages.length)

	setState({
		packages: filtered,
		selectedPackage: filtered[selectedIndex] || null,
		isLoading: false,
		statusMessage,
	})
}

function updateSelected() {
	const pkg = state.packages[selectedIndex] || null
	setState({ selectedPackage: pkg })
}

async function loadInstalled() {
	const requestId = ++installedLoadId
	setState({ isLoading: true, statusMessage: 'Loading packages...' })
	try {
		const pkgs = await getInstalledPackages()
		if (requestId !== installedLoadId || state.currentTab !== 'installed') {
			return
		}
		baseListPackages = pkgs
		selectedIndex = 0
		applyCurrentListFilter()
	} catch (e) {
		if (requestId !== installedLoadId || state.currentTab !== 'installed') {
			return
		}
		setState({
			isLoading: false,
			errorMessage: e instanceof Error ? e.message : 'Error',
			statusMessage: 'Error',
		})
	}
}

async function doSearch(
	q: string,
	fromSubmit: boolean = false,
): Promise<number> {
	const requestId = ++searchLoadId
	if (!q.trim()) {
		setState({ packages: [], statusMessage: 'Enter query' })
		if (fromSubmit) {
			enterSearchInputMode()
		}
		return 0
	}
	setState({ isLoading: true, statusMessage: `Searching "${q}"...` })
	try {
		const trimmedQuery = q.trim()
		const pkgs = sortSearchPackages(
			await searchPackages({ query: trimmedQuery }),
			trimmedQuery,
		)
		if (requestId !== searchLoadId || state.currentTab !== 'search') {
			return 0
		}
		selectedIndex = 0
		setState({
			packages: pkgs,
			isLoading: false,
			statusMessage: `${pkgs.length} found`,
		})
		updateSelected()
		if (fromSubmit) {
			if (pkgs.length > 0) {
				enterSearchListMode()
			} else {
				enterSearchInputMode()
			}
		}
		return pkgs.length
	} catch (e) {
		if (requestId !== searchLoadId || state.currentTab !== 'search') {
			return 0
		}
		setState({
			isLoading: false,
			errorMessage: e instanceof Error ? e.message : 'Search error',
			statusMessage: 'Search error',
		})
		if (fromSubmit) {
			enterSearchInputMode()
		}
		return 0
	}
}

async function loadUpdates() {
	const requestId = ++updatesLoadId
	setState({ isLoading: true, statusMessage: 'Checking updates...' })
	try {
		const pkgs = await getAvailableUpdates()
		if (requestId !== updatesLoadId || state.currentTab !== 'updates') {
			return
		}
		baseListPackages = pkgs
		selectedIndex = 0
		applyCurrentListFilter()
	} catch (e) {
		if (requestId !== updatesLoadId || state.currentTab !== 'updates') {
			return
		}
		setState({
			isLoading: false,
			errorMessage: e instanceof Error ? e.message : 'Error',
			statusMessage: 'Error',
		})
	}
}

function switchTab(tab: TabType) {
	installedLoadId++
	updatesLoadId++
	searchLoadId++

	baseListPackages = []
	listFilterMode = false
	listFilterQuery = ''

	state = {
		...state,
		currentTab: tab,
		packages: [],
		selectedPackage: null,
		errorMessage: null,
		isLoading: tab === 'installed' || tab === 'updates',
	}

	selectedIndex = 0

	switch (tab) {
		case 'installed':
			loadInstalled()
			break
		case 'search':
			searchMode = 'input'
			state = { ...state, searchQuery: '' }
			setState({ packages: [], statusMessage: 'Type query and press Enter' })
			break
		case 'updates':
			loadUpdates()
			break
	}
}

function showConfirmDialog(title: string, msg: string, action: () => void) {
	confirmTitle = title
	confirmMessage = msg
	confirmAction = action
	showConfirm = true
	render()
}

function hideConfirmDialog() {
	showConfirm = false
	confirmAction = null
	render()
}

function enterSearchInputMode() {
	if (state.currentTab !== 'search') {
		return
	}
	searchMode = 'input'
	render()
}

function enterSearchListMode() {
	if (state.currentTab !== 'search') {
		return
	}
	searchMode = 'list'
	render()
}

function handleInstall() {
	const pkg = state.selectedPackage
	if (!pkg) {
		setState({ statusMessage: 'Select a package to install' })
		return
	}
	if (pkg.installed) {
		setState({ statusMessage: 'Package already installed' })
		return
	}

	showConfirmDialog(
		'Install Package',
		`Install ${pkg.name} (${pkg.version})?`,
		async () => {
			hideConfirmDialog()
			setState({
				isLoading: true,
				statusMessage: `Installing ${pkg.name}...`,
				errorMessage: null,
			})
			try {
				const result = await installPackage(getInstallTarget(pkg))
				if (!result.success) {
					throw new Error(result.error || 'Installation failed')
				}
				setState({ statusMessage: `Installed ${pkg.name}` })
				if (state.currentTab === 'installed') {
					await loadInstalled()
				} else if (state.currentTab === 'updates') {
					await loadUpdates()
				}
			} catch (error) {
				setState({
					errorMessage:
						error instanceof Error ? error.message : 'Installation failed',
					statusMessage: 'Install failed',
				})
			} finally {
				setState({ isLoading: false })
			}
		},
	)
}

function handleRemove() {
	const pkg = state.selectedPackage
	if (!pkg) {
		setState({ statusMessage: 'Select a package to remove' })
		return
	}
	if (!pkg.installed) {
		setState({ statusMessage: 'Package is not installed' })
		return
	}

	showConfirmDialog(
		'Remove Package',
		`Remove ${pkg.name} (${pkg.version})?`,
		async () => {
			hideConfirmDialog()
			setState({
				isLoading: true,
				statusMessage: `Removing ${pkg.name}...`,
				errorMessage: null,
			})
			try {
				const result = await removePackage(pkg.name)
				if (!result.success) {
					throw new Error(result.error || 'Removal failed')
				}
				setState({ statusMessage: `Removed ${pkg.name}` })
				if (state.currentTab === 'installed') {
					await loadInstalled()
				} else if (state.currentTab === 'updates') {
					await loadUpdates()
				}
			} catch (error) {
				setState({
					errorMessage:
						error instanceof Error ? error.message : 'Removal failed',
					statusMessage: 'Remove failed',
				})
			} finally {
				setState({ isLoading: false })
			}
		},
	)
}

function handleUpdate() {
	const selected = shouldUpdateSelectedPackage(state.selectedPackage)
		? state.selectedPackage
		: null
	const updateSelectedOnly = Boolean(selected)

	const title = updateSelectedOnly ? 'Update Package' : 'Update System'
	const message = updateSelectedOnly
		? `Update ${selected?.name} only?`
		: 'Update all packages?'

	showConfirmDialog(title, message, async () => {
		hideConfirmDialog()
		setState({
			isLoading: true,
			statusMessage: updateSelectedOnly
				? `Updating ${selected?.name}...`
				: 'Updating system...',
			errorMessage: null,
		})

		try {
			const result =
				updateSelectedOnly && selected?.name
					? await updatePackage(selected.name)
					: await updateSystem()

			if (!result.success) {
				throw new Error(
					result.error ||
						(updateSelectedOnly
							? 'Package update failed'
							: 'System update failed'),
				)
			}

			setState({
				statusMessage: updateSelectedOnly
					? `Updated ${selected?.name}`
					: 'System updated',
			})

			if (state.currentTab === 'updates') {
				await loadUpdates()
			} else if (state.currentTab === 'installed') {
				await loadInstalled()
			}
		} catch (error) {
			setState({
				errorMessage:
					error instanceof Error
						? error.message
						: updateSelectedOnly
							? 'Package update failed'
							: 'System update failed',
				statusMessage: 'Update failed',
			})
		} finally {
			setState({ isLoading: false })
		}
	})
}

function render() {
	if (!renderer) {
		return
	}

	const { width, height } = getDimensions()
	const contentH = getMainContentHeight(height)
	const listW = Math.floor(width * 0.6)
	const detailW = width - listW - 1
	const inListTab = isListTab(state.currentTab)

	let content: unknown
	if (state.currentTab === 'search') {
		const listH = Math.max(0, contentH - 1)
		const searchInput = SearchInput({
			query: state.searchQuery,
			width,
			mode: searchMode,
		})
		const pkgList = PackageList({
			packages: state.packages,
			selectedIndex,
			width: listW,
			height: listH,
			onSelect: (i: number) => {
				selectedIndex = i
				updateSelected()
			},
			showAurRate: true,
		})
		const pkgDetail = PackageDetail({
			package: state.selectedPackage,
			width: detailW,
			height: listH,
		})
		content = Box(
			{
				width,
				height: contentH,
				flexDirection: 'column',
				backgroundColor: theme.surface,
			},
			searchInput,
			Box(
				{
					width,
					height: listH,
					flexDirection: 'row',
					backgroundColor: theme.surface,
				},
				pkgList,
				Box({ width: 1, height: listH, backgroundColor: theme.border }),
				pkgDetail,
			),
		)
	} else {
		const pkgList = PackageList({
			packages: state.packages,
			selectedIndex,
			width: listW,
			height: contentH,
			onSelect: (i: number) => {
				selectedIndex = i
				updateSelected()
			},
		})
		const pkgDetail = PackageDetail({
			package: state.selectedPackage,
			width: detailW,
			height: contentH,
		})
		content = Box(
			{
				width,
				height: contentH,
				flexDirection: 'row',
				backgroundColor: theme.surface,
			},
			pkgList,
			Box({ width: 1, height: contentH, backgroundColor: theme.border }),
			pkgDetail,
		)
	}

	const topRow =
		inListTab && (listFilterMode || listFilterQuery.length > 0)
			? SearchInput({
					query: listFilterQuery,
					width,
					mode: listFilterMode ? 'input' : 'list',
					placeholder:
						state.currentTab === 'updates'
							? 'Filter updates...'
							: 'Filter installed packages...',
				})
			: Box({
					width,
					height: 1,
					backgroundColor: theme.surface,
				})

	let mainContent = Box(
		{
			width,
			height,
			flexDirection: 'column',
			backgroundColor: theme.appBackground,
		},
		TabBar({
			currentTab: state.currentTab,
			width,
			onTabChange: switchTab,
		}),
		topRow,
		content,
		StatusBar({
			state,
			width,
		}),
	)

	if (showConfirm) {
		mainContent = Box(
			{
				width,
				height,
			},
			mainContent,
			ConfirmDialog({
				title: confirmTitle,
				message: confirmMessage,
				width,
				height,
				onConfirm: () => {
					if (confirmAction) confirmAction()
				},
				onCancel: hideConfirmDialog,
			}),
		)
	}

	const rootChildren = renderer.root.getChildren()
	for (const child of rootChildren) {
		if (child?.id) {
			renderer.root.remove(child.id)
		}
	}

	renderer.root.add(mainContent)
	renderer.requestRender()
}

function setupKeys() {
	keypressHandler = (key: KeyEvent) => {
		if (showConfirm) {
			if (key.name === 'y' || key.name === 'return') {
				if (confirmAction) confirmAction()
			} else if (key.name === 'n' || key.name === 'escape') {
				hideConfirmDialog()
			}
			return
		}

		const inSearchTab = state.currentTab === 'search'
		const inListTab = isListTab(state.currentTab)
		const isPrintable =
			typeof key.sequence === 'string' &&
			key.sequence.length === 1 &&
			!key.ctrl &&
			!key.meta
		const allowGlobalInCurrentMode = shouldHandleGlobalShortcut(
			key.name,
			inSearchTab,
			searchMode,
			Boolean(key.ctrl),
			Boolean(key.meta),
		)

		if (inSearchTab && searchMode === 'input') {
			if (key.name === 'return') {
				void doSearch(state.searchQuery, true)
				return
			}

			if (key.name === 'backspace') {
				const query = state.searchQuery.slice(0, -1)
				state = {
					...state,
					searchQuery: query,
					statusMessage: 'Press Enter to search',
				}
				render()
				return
			}

			if (!allowGlobalInCurrentMode && isPrintable && key.name !== '/') {
				const query = `${state.searchQuery}${key.sequence}`
				state = {
					...state,
					searchQuery: query,
					statusMessage: 'Press Enter to search',
				}
				render()
				return
			}
		}

		if (inListTab && listFilterMode) {
			if (key.name === 'return') {
				listFilterMode = false
				applyCurrentListFilter()
				return
			}

			if (key.name === 'backspace') {
				listFilterQuery = listFilterQuery.slice(0, -1)
				applyCurrentListFilter()
				return
			}

			if (key.name === 'escape') {
				if (listFilterQuery.length > 0) {
					listFilterQuery = ''
					applyCurrentListFilter()
					return
				}

				listFilterMode = false
				render()
				return
			}

			if (isPrintable && key.name !== '/') {
				listFilterQuery = `${listFilterQuery}${key.sequence}`
				applyCurrentListFilter()
				return
			}

			const allowTabSwitchWhileFiltering =
				key.name === 'tab' ||
				key.name === '1' ||
				key.name === '2' ||
				key.name === '3' ||
				key.name === 'q' ||
				(key.ctrl && key.name === 'c')

			if (!allowTabSwitchWhileFiltering) {
				return
			}
		}

		if (key.name === '/') {
			if (inSearchTab) {
				enterSearchInputMode()
			} else if (inListTab) {
				listFilterMode = true
				setState({ statusMessage: 'Type filter and press Enter' })
			}
			return
		}

		if (!allowGlobalInCurrentMode) {
			return
		}

		if (key.name === 'tab') {
			const tabs: TabType[] = ['installed', 'search', 'updates']
			const idx = tabs.indexOf(state.currentTab)
			const next = key.shift
				? (idx - 1 + tabs.length) % tabs.length
				: (idx + 1) % tabs.length
			switchTab(tabs[next])
			return
		}
		if (key.name === '1') {
			switchTab('installed')
			return
		}
		if (key.name === '2') {
			switchTab('search')
			return
		}
		if (key.name === '3') {
			switchTab('updates')
			return
		}

		if (key.name === 'up' || key.name === 'k') {
			if (state.packages.length) {
				selectedIndex = Math.max(0, selectedIndex - 1)
				updateSelected()
			}
			return
		}
		if (key.name === 'down' || key.name === 'j') {
			if (state.packages.length) {
				selectedIndex = Math.min(state.packages.length - 1, selectedIndex + 1)
				updateSelected()
			}
			return
		}
		if (key.name === 'pageup') {
			if (state.packages.length) {
				selectedIndex = Math.max(0, selectedIndex - 10)
				updateSelected()
			}
			return
		}
		if (key.name === 'pagedown') {
			if (state.packages.length) {
				selectedIndex = Math.min(state.packages.length - 1, selectedIndex + 10)
				updateSelected()
			}
			return
		}

		if (key.name === 'i') {
			handleInstall()
			return
		}

		if (key.name === 'r') {
			handleRemove()
			return
		}

		if (key.name === 'u') {
			handleUpdate()
			return
		}

		if (key.name === 'escape') {
			if (inSearchTab && searchMode === 'input' && state.packages.length > 0) {
				enterSearchListMode()
				return
			}

			if (state.errorMessage) {
				setState({ errorMessage: null, statusMessage: 'Ready' })
			}
			return
		}

		if (key.name === 'q' || (key.ctrl && key.name === 'c')) {
			renderer?.destroy()
			process.exit(0)
		}
	}
	renderer?.keyInput.on('keypress', keypressHandler)
}

export async function createApp() {
	const mod = await import('@opentui/core')
	Box = mod.Box
	const createCliRenderer = mod.createCliRenderer

	renderer = await createCliRenderer({
		exitOnCtrlC: false,
		screenMode: 'alternate-screen',
	})

	// Load components
	TabBar = (await import('./components/TabBar')).TabBar
	StatusBar = (await import('./components/StatusBar')).StatusBar
	PackageList = (await import('./components/PackageList')).PackageList
	PackageDetail = (await import('./components/PackageDetail')).PackageDetail
	SearchInput = (await import('./components/SearchInput')).SearchInput
	ConfirmDialog = (await import('./components/ConfirmDialog')).ConfirmDialog

	// Keyboard
	setupKeys()

	resizeHandler = () => {
		render()
	}
	process.stdout.on('resize', resizeHandler)

	// Initial render
	render()
	renderer?.auto()

	// Load packages
	setTimeout(() => loadInstalled(), 100)

	return {
		renderer,
		cleanup: () => {
			if (keypressHandler) renderer?.keyInput.off('keypress', keypressHandler)
			if (resizeHandler) {
				process.stdout.off('resize', resizeHandler)
				resizeHandler = null
			}
		},
	}
}
