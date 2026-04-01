# Pacman TUI

A terminal user interface for managing Arch Linux packages (pacman) and AUR packages using PARU.

## Prerequisites

- [PARU](https://github.com/Morganamilo/paru) AUR helper installed
- `sudo` or `pkexec` available for privileged actions
- Arch Linux or derivative distribution

## Installation

### Option 1: Install from hosted installer (recommended)

```bash
curl -fsSL https://ptui.arpgg.io/install.sh | sh
```

Notes:
- The installer script still downloads binaries from GitHub Releases.
- Default install location is `~/.local/bin`.
- No shell alias is needed; just ensure `~/.local/bin` is in your `PATH`.

### Option 2: Run locally from source (Bun)

```bash
bun install
bun start
```

## Usage

```bash
pacman-tui
```

## Controls

- `Tab` - Switch between tabs
- `1/2/3` - Jump to Installed/Search/Updates
- `↑/↓` or `k/j` - Navigate packages
- `/` - Filter current Installed/Updates list (in Search tab, focus query input)
- `Enter` - In Search, run query and move to list mode
- `i` - Install selected package
- `r` - Remove selected package
- `u` - Update selected installed package; if none selected, update system
- `q` or `Ctrl+C` - Quit

## Privilege Escalation

Privileged operations (install/remove/update) use graphical auth when available:

- Auto mode (default): `pkexec` on graphical sessions, fallback to `sudo`
- Force mode: set `PACMAN_TUI_AUTH=pkexec|sudo|none`

## Release Process

Create a tag and push it to publish a binary release asset:

```bash
git tag v1.0.0
git push origin v1.0.0
```

The GitHub Actions workflow builds `pacman-tui-linux-x64` and attaches it to the release.
