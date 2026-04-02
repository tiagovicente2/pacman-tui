import { Box, Text } from '@opentui/core'
import { theme } from '../theme'
import type { Package } from '../types.ts'

interface PackageDetailProps {
	package: Package | null
	width: number
	height: number
}

export function PackageDetail(props: PackageDetailProps) {
	const { package: pkg, width, height } = props

	if (!pkg) {
		return Box(
			{
				width,
				height,
				borderStyle: 'rounded',
				borderColor: theme.border,
				title: 'Package Details',
				backgroundColor: theme.surface,
				padding: 1,
			},
			Text({
				content: 'Select a package to view details',
				fg: theme.textDim,
			}),
		)
	}

	const labelWidth = 20
	const valueWidth = width - labelWidth - 5

	const sections = []

	sections.push(
		Box(
			{
				width: width - 4,
				height: 1,
				flexDirection: 'row',
			},
			Text({
				content: 'Name:'.padEnd(labelWidth),
				width: labelWidth,
				fg: theme.textMuted,
			}),
			Text({
				content: pkg.name.slice(0, valueWidth),
				width: valueWidth,
				fg: theme.textSecondary,
			}),
		),
	)

	sections.push(
		Box(
			{
				width: width - 4,
				height: 1,
				flexDirection: 'row',
			},
			Text({
				content: 'Version:'.padEnd(labelWidth),
				width: labelWidth,
				fg: theme.textMuted,
			}),
			Text({
				content: pkg.version.slice(0, valueWidth),
				width: valueWidth,
				fg: theme.textSecondary,
			}),
		),
	)

	sections.push(
		Box(
			{
				width: width - 4,
				height: 1,
				flexDirection: 'row',
			},
			Text({
				content: 'Repository:'.padEnd(labelWidth),
				width: labelWidth,
				fg: theme.textMuted,
			}),
			Text({
				content: pkg.repository.slice(0, valueWidth),
				width: valueWidth,
				fg: theme.textSecondary,
			}),
		),
	)

	sections.push(
		Box(
			{
				width: width - 4,
				height: 1,
				flexDirection: 'row',
			},
			Text({
				content: 'Size:'.padEnd(labelWidth),
				width: labelWidth,
				fg: theme.textMuted,
			}),
			Text({
				content: (pkg.size || 'N/A').slice(0, valueWidth),
				width: valueWidth,
				fg: theme.textSecondary,
			}),
		),
	)

	sections.push(
		Box(
			{
				width: width - 4,
				height: 1,
				flexDirection: 'row',
			},
			Text({
				content: 'License:'.padEnd(labelWidth),
				width: labelWidth,
				fg: theme.textMuted,
			}),
			Text({
				content: (pkg.license || 'N/A').slice(0, valueWidth),
				width: valueWidth,
				fg: theme.textSecondary,
			}),
		),
	)

	if (pkg.isAur) {
		sections.push(
			Box(
				{
					width: width - 4,
					height: 1,
					flexDirection: 'row',
				},
				Text({
					content: 'Votes:'.padEnd(labelWidth),
					width: labelWidth,
					fg: theme.textMuted,
				}),
				Text({
					content: (pkg.votes?.toString() || 'N/A').slice(0, valueWidth),
					width: valueWidth,
					fg: theme.textSecondary,
				}),
			),
		)

		sections.push(
			Box(
				{
					width: width - 4,
					height: 1,
					flexDirection: 'row',
				},
				Text({
					content: 'Popularity:'.padEnd(labelWidth),
					width: labelWidth,
					fg: theme.textMuted,
				}),
				Text({
					content: (pkg.popularity?.toString() || 'N/A').slice(0, valueWidth),
					width: valueWidth,
					fg: theme.textSecondary,
				}),
			),
		)
	}

	if (pkg.url) {
		sections.push(
			Box(
				{
					width: width - 4,
					height: 1,
					flexDirection: 'row',
				},
				Text({
					content: 'URL:'.padEnd(labelWidth),
					width: labelWidth,
					fg: theme.textMuted,
				}),
				Text({
					content: pkg.url.slice(0, valueWidth),
					width: valueWidth,
					fg: theme.textSecondary,
				}),
			),
		)
	}

	sections.push(
		Box({
			width: width - 4,
			height: 1,
		}),
	)

	sections.push(
		Text({
			content: 'Description:',
			fg: theme.textMuted,
		}),
	)

	sections.push(
		Text({
			content: pkg.description || 'No description available',
			width: width - 4,
			fg: theme.textSecondary,
		}),
	)

	if (pkg.dependencies && pkg.dependencies.length > 0) {
		sections.push(
			Box({
				width: width - 4,
				height: 1,
			}),
		)

		sections.push(
			Text({
				content: `Dependencies (${pkg.dependencies.length}):`,
				fg: theme.textMuted,
			}),
		)

		sections.push(
			Text({
				content:
					pkg.dependencies.slice(0, 5).join(', ') +
					(pkg.dependencies.length > 5 ? '...' : ''),
				width: width - 4,
				fg: theme.textSecondary,
			}),
		)
	}

	return Box(
		{
			width,
			height,
			borderStyle: 'rounded',
			borderColor: theme.border,
			title: pkg.name,
			titleAlignment: 'center',
			backgroundColor: theme.surface,
			padding: 1,
			flexDirection: 'column',
			gap: 0,
		},
		...sections,
	)
}
