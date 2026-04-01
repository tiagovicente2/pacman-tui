export type AuthMode = 'auto' | 'pkexec' | 'sudo' | 'none';

interface ResolvePrivilegedCommandOptions {
  requireRoot: boolean;
  authMode: AuthMode;
  hasDisplay: boolean;
  hasPkexec: boolean;
  hasSudo: boolean;
  paruBinary?: string;
}

interface PrivilegedCommand {
  command: string;
  args: string[];
  error?: string;
}

interface PreAuthCommand {
  command: string;
  args: string[];
  stdio: 'inherit' | 'pipe';
}

export function resolvePrivilegedCommand(
  paruArgs: string[],
  options: ResolvePrivilegedCommandOptions,
): PrivilegedCommand {
  const { requireRoot, authMode, hasDisplay, hasPkexec, hasSudo } = options;
  const paruBinary = options.paruBinary ?? 'paru';

  if (!requireRoot || authMode === 'none') {
    return { command: paruBinary, args: paruArgs };
  }

  if (authMode === 'pkexec') {
    if (!hasPkexec) {
      return {
        command: paruBinary,
        args: paruArgs,
        error: 'pkexec not found. Install polkit or set PACMAN_TUI_AUTH=sudo.',
      };
    }
    return { command: paruBinary, args: ['--sudo', 'pkexec', ...paruArgs] };
  }

  if (authMode === 'sudo') {
    if (!hasSudo) {
      return {
        command: paruBinary,
        args: paruArgs,
        error: 'sudo not found. Install sudo or set PACMAN_TUI_AUTH=pkexec.',
      };
    }
    return { command: paruBinary, args: ['--sudo', 'sudo', '--sudoloop', ...paruArgs] };
  }

  if (hasDisplay && hasPkexec) {
    return { command: paruBinary, args: ['--sudo', 'pkexec', ...paruArgs] };
  }

  if (hasSudo) {
    return { command: paruBinary, args: ['--sudo', 'sudo', '--sudoloop', ...paruArgs] };
  }

  if (hasPkexec) {
    return { command: paruBinary, args: ['--sudo', 'pkexec', ...paruArgs] };
  }

  return {
    command: paruBinary,
    args: paruArgs,
    error: 'No privilege escalation command available (pkexec/sudo).',
  };
}

export function resolvePreAuthCommand(
  command: string,
  args: string[],
  paruBinary: string,
): PreAuthCommand | null {
  if (command !== paruBinary || args[0] !== '--sudo') {
    return null;
  }

  if (args[1] === 'sudo') {
    return { command: 'sudo', args: ['-v'], stdio: 'inherit' };
  }

  if (args[1] === 'pkexec') {
    return { command: 'pkexec', args: ['/usr/bin/true'], stdio: 'pipe' };
  }

  return null;
}
