import { createApp } from './app'

async function main() {
	// Check if paru is installed
	try {
		const paruCheck = Bun.spawn(['which', 'paru'])
		const exitCode = await paruCheck.exited

		if (exitCode !== 0) {
			console.error('Error: PARU is not installed or not in PATH.')
			console.error('Please install PARU: https://github.com/Morganamilo/paru')
			process.exit(1)
		}
	} catch {
		console.error('Error: Unable to check for PARU installation.')
		process.exit(1)
	}

	console.log('Starting Pacman TUI...')

	try {
		const { renderer: _renderer, cleanup } = await createApp()

		// Handle cleanup on exit
		process.on('SIGINT', () => {
			cleanup()
			process.exit(0)
		})

		process.on('SIGTERM', () => {
			cleanup()
			process.exit(0)
		})

		// Keep the process alive
		await new Promise(() => {})
	} catch (error) {
		console.error('Failed to start Pacman TUI:', error)
		process.exit(1)
	}
}

main()
