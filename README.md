# Pacman TUI

A terminal user interface for managing Arch Linux packages (pacman) and AUR packages using PARU.

<img width="1341" height="877" alt="image" src="https://github.com/user-attachments/assets/2f2768fa-2264-4d38-9ee4-7afc6caab5d0" />


## Prerequisites

- [PARU](https://github.com/Morganamilo/paru) AUR helper installed
- `sudo` or `pkexec` available for privileged actions
- Arch Linux or derivative distribution

## Installation

```bash
curl -fsSL https://ptui.arpgg.io/install.sh | bash

# locally
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
