import type { Package } from '../types'

export function getInstallTarget(pkg: Package): string {
	if (
		!pkg.repository ||
		pkg.repository === 'local' ||
		pkg.repository === 'update'
	) {
		return pkg.name
	}

	return `${pkg.repository}/${pkg.name}`
}
