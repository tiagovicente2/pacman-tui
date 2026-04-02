import type { Package } from '../types'

function popularityValue(pkg: Package): number {
	return pkg.popularity ?? -1
}

function votesValue(pkg: Package): number {
	return pkg.votes ?? -1
}

function matchRank(pkg: Package, rawQuery: string): number {
	const query = rawQuery.trim().toLowerCase()
	if (!query) {
		return 4
	}

	const name = pkg.name.toLowerCase()
	if (name === query) {
		return 0
	}
	if (name.startsWith(query)) {
		return 1
	}
	if (name.includes(query)) {
		return 2
	}

	const description = pkg.description.toLowerCase()
	if (description.includes(query)) {
		return 3
	}

	return 4
}

export function sortSearchPackages(
	packages: Package[],
	query: string = '',
): Package[] {
	return [...packages].sort((a, b) => {
		const rankDiff = matchRank(a, query) - matchRank(b, query)
		if (rankDiff !== 0) {
			return rankDiff
		}

		const popularityDiff = popularityValue(b) - popularityValue(a)
		if (popularityDiff !== 0) {
			return popularityDiff
		}

		const votesDiff = votesValue(b) - votesValue(a)
		if (votesDiff !== 0) {
			return votesDiff
		}

		if (a.isAur !== b.isAur) {
			return a.isAur ? 1 : -1
		}

		return a.name.localeCompare(b.name)
	})
}

export function formatAurRate(pkg: Package): string {
	if (!pkg.isAur) {
		return ''
	}

	if (typeof pkg.popularity === 'number') {
		return `~${pkg.popularity.toFixed(2)}`
	}

	if (typeof pkg.votes === 'number') {
		return `+${pkg.votes}`
	}

	return '-'
}
