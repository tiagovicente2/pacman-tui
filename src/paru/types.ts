// src/paru/types.ts

export interface ParuPackageInfo {
	name: string
	version: string
	description?: string
	repository: string
	installedVersion?: string
	availableVersion?: string
	size?: string
	groups?: string[]
	license?: string[]
	url?: string
	depends?: string[]
	optdepends?: string[]
	conflicts?: string[]
	provides?: string[]
	replaces?: string[]
}

export interface ParuSearchOptions {
	query: string
	aurOnly?: boolean
	repoOnly?: boolean
	limit?: number
}

export interface ParuListOptions {
	explicitOnly?: boolean
	dependenciesOnly?: boolean
	aurOnly?: boolean
	nativeOnly?: boolean
}
