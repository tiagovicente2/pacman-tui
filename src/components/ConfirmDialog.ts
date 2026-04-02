import { Box, Text } from '@opentui/core'
import { theme } from '../theme'

interface ConfirmDialogProps {
	title: string
	message: string
	width: number
	height: number
	onConfirm: () => void
	onCancel: () => void
}

export function ConfirmDialog(props: ConfirmDialogProps) {
	const { title, message, width, height } = props

	const dialogWidth = Math.min(50, width - 4)
	const dialogHeight = Math.min(8, height - 4)
	const left = Math.floor((width - dialogWidth) / 2)
	const top = Math.floor((height - dialogHeight) / 2)

	return Box(
		{
			width: dialogWidth,
			height: dialogHeight,
			position: 'absolute',
			left,
			top,
			borderStyle: 'double',
			borderColor: theme.textPrimary,
			title,
			titleAlignment: 'center',
			backgroundColor: theme.surface,
			padding: 1,
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
			gap: 1,
		},
		Text({
			content: message,
			width: dialogWidth - 4,
			fg: theme.textPrimary,
		}),
		Text({
			content: '[Y] Yes  [N] No  [Esc] Cancel',
			fg: theme.textMuted,
		}),
	)
}
