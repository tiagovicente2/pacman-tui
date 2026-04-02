import type { Package } from '../types'

export function filterPackageList(
	packages: Package[],
	query: string,
): Package[] {
	const normalized = query.trim().toLowerCase()

	if (!normalized) {
		return packages
	}

	return packages.filter((pkg) => {
		return (
			pkg.name.toLowerCase().includes(normalized) ||
			pkg.description.toLowerCase().includes(normalized) ||
			pkg.repository.toLowerCase().includes(normalized)
		)
	})
}
