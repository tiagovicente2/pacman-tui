// src/paru/index.ts

import { spawn, spawnSync } from 'node:child_process'
import type { Package, ParuCommandResult } from '../types'
import {
	type AuthMode,
	resolvePreAuthCommand,
	resolvePrivilegedCommand,
} from './auth'
import {
	parseInfoOutput,
	parseListOutput,
	parseSearchOutput,
	parseUpdatesOutput,
} from './parser'
import type { ParuListOptions, ParuSearchOptions } from './types'

interface RunParuCommandOptions {
	requireRoot?: boolean
}

const hasDisplay = Boolean(process.env.DISPLAY || process.env.WAYLAND_DISPLAY)

function commandExists(command: string): boolean {
	try {
		const result = spawnSync('which', [command], { stdio: 'ignore' })
		return result.status === 0
	} catch {
		return false
	}
}

function resolveParuBinary(): string {
	try {
		const result = spawnSync('which', ['paru'], {
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'ignore'],
		})

		if (result.status === 0 && result.stdout.trim()) {
			return result.stdout.trim()
		}
	} catch {
		// fall through
	}

	return 'paru'
}

const hasPkexec = commandExists('pkexec')
const hasSudo = commandExists('sudo')
const paruBinary = resolveParuBinary()

function resolveAuthMode(): AuthMode {
	const mode = (process.env.PACMAN_TUI_AUTH ?? 'auto').toLowerCase()
	if (mode === 'pkexec' || mode === 'sudo' || mode === 'none') {
		return mode
	}

	return 'auto'
}

const authMode = resolveAuthMode()

function runParuCommand(
	args: string[],
	options: RunParuCommandOptions = {},
): Promise<ParuCommandResult> {
	const resolved = resolvePrivilegedCommand(args, {
		requireRoot: options.requireRoot ?? false,
		authMode,
		hasDisplay,
		hasPkexec,
		hasSudo,
		paruBinary,
	})

	if (resolved.error) {
		return Promise.resolve({
			success: false,
			output: '',
			error: resolved.error,
			exitCode: -1,
		})
	}

	const preAuth = resolvePreAuthCommand(
		resolved.command,
		resolved.args,
		paruBinary,
	)

	if (preAuth) {
		try {
			const authResult = spawnSync(preAuth.command, preAuth.args, {
				stdio: preAuth.stdio,
			})
			if (authResult.status !== 0) {
				const authLabel = preAuth.command === 'pkexec' ? 'pkexec' : 'sudo'
				return Promise.resolve({
					success: false,
					output: '',
					error: `${authLabel} authentication failed or was cancelled.`,
					exitCode: authResult.status ?? -1,
				})
			}
		} catch {
			const authLabel = preAuth.command === 'pkexec' ? 'pkexec' : 'sudo'
			return Promise.resolve({
				success: false,
				output: '',
				error: `Unable to start ${authLabel} authentication.`,
				exitCode: -1,
			})
		}
	}

	return new Promise((resolve) => {
		const child = spawn(resolved.command, resolved.args, {
			stdio: ['inherit', 'pipe', 'pipe'],
		})

		let stdout = ''
		let stderr = ''

		child.stdout?.on('data', (data) => {
			stdout += data.toString()
		})

		child.stderr?.on('data', (data) => {
			stderr += data.toString()
		})

		child.on('close', (code) => {
			resolve({
				success: code === 0,
				output: stdout,
				error: stderr || undefined,
				exitCode: code || 0,
			})
		})

		child.on('error', (err) => {
			resolve({
				success: false,
				output: stdout,
				error: err.message,
				exitCode: -1,
			})
		})
	})
}

export async function searchPackages(
	options: ParuSearchOptions,
): Promise<Package[]> {
	const args = ['-Ss', options.query]

	if (options.aurOnly) {
		args.push('--aur')
	} else if (options.repoOnly) {
		args.push('--repo')
	}

	const result = await runParuCommand(args)

	if (!result.success) {
		throw new Error(result.error || 'Search failed')
	}

	return parseSearchOutput(result.output)
}

export async function getInstalledPackages(
	options: ParuListOptions = {},
): Promise<Package[]> {
	const args = ['-Q']

	if (options.explicitOnly) {
		args.push('-e')
	} else if (options.dependenciesOnly) {
		args.push('-d')
	}

	if (options.aurOnly) {
		args.push('-m')
	} else if (options.nativeOnly) {
		args.push('-n')
	}

	const result = await runParuCommand(args)

	if (!result.success) {
		throw new Error(result.error || 'Failed to list packages')
	}

	const packages = parseListOutput(result.output)

	// Note: We don't fetch detailed info for all packages initially
	// as that would require N+1 queries (one per package).
	// Detailed info is fetched on-demand when viewing a specific package.

	return packages
}

export async function getPackageInfo(
	packageName: string,
): Promise<Partial<Package>> {
	const result = await runParuCommand(['-Qi', packageName])

	if (!result.success) {
		// Try AUR info
		const aurResult = await runParuCommand(['-Si', packageName])
		if (!aurResult.success) {
			throw new Error(`Package ${packageName} not found`)
		}
		return parseInfoOutput(aurResult.output)
	}

	return parseInfoOutput(result.output)
}

export async function getAvailableUpdates(): Promise<Package[]> {
	const result = await runParuCommand(['-Qu'])

	if (!result.success && result.exitCode !== 1) {
		// Exit code 1 means no updates available
		throw new Error(result.error || 'Failed to check updates')
	}

	return parseUpdatesOutput(result.output)
}

export async function installPackage(
	packageName: string,
): Promise<ParuCommandResult> {
	return runParuCommand(['-S', packageName, '--noconfirm'], {
		requireRoot: true,
	})
}

export async function removePackage(
	packageName: string,
	purge: boolean = false,
): Promise<ParuCommandResult> {
	const args = ['-R', packageName, '--noconfirm']

	if (purge) {
		args.splice(1, 0, '-n')
	}

	return runParuCommand(args, { requireRoot: true })
}

export async function updateSystem(): Promise<ParuCommandResult> {
	return runParuCommand(['-Syu', '--noconfirm'], { requireRoot: true })
}

export async function updatePackage(
	packageName: string,
): Promise<ParuCommandResult> {
	return runParuCommand(['-S', packageName, '--noconfirm'], {
		requireRoot: true,
	})
}

export async function syncDatabases(): Promise<ParuCommandResult> {
	return runParuCommand(['-Sy'], { requireRoot: true })
}

export async function cleanCache(): Promise<ParuCommandResult> {
	return runParuCommand(['-Sc', '--noconfirm'], { requireRoot: true })
}
