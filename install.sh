#!/usr/bin/env bash

set -eu

APP_NAME="pacman-tui"
INSTALL_DIR="${INSTALL_DIR:-$HOME/.local/bin}"
VERSION="latest"
REPO="${PACMAN_TUI_REPO:-tiagovicente2/pacman-tui}"

print_usage() {
  cat <<'EOF'
Install pacman-tui from GitHub releases.

Usage:
  install.sh [--repo <owner/repo>] [--version <tag>] [--install-dir <path>]

Options:
  --repo         GitHub repository in owner/repo format (default: tiagovicente2/pacman-tui)
  --version      Release tag (default: latest)
  --install-dir  Install directory (default: ~/.local/bin)
  -h, --help     Show this help

Examples:
  install.sh
  install.sh --version v1.0.0
  install.sh --repo your-org/pacman-tui
EOF
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: required command '$1' is not installed." >&2
    exit 1
  fi
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --repo)
      REPO="$2"
      shift 2
      ;;
    --version)
      VERSION="$2"
      shift 2
      ;;
    --install-dir)
      INSTALL_DIR="$2"
      shift 2
      ;;
    -h|--help)
      print_usage
      exit 0
      ;;
    *)
      echo "Error: unknown argument '$1'" >&2
      print_usage
      exit 1
      ;;
  esac
done

require_command curl
require_command uname

if [ "$(uname -s)" != "Linux" ]; then
  echo "Error: $APP_NAME currently supports Linux only." >&2
  exit 1
fi

if [ ! -f /etc/arch-release ]; then
  echo "Error: $APP_NAME is intended for Arch Linux and derivatives." >&2
  exit 1
fi

if ! command -v paru >/dev/null 2>&1; then
  echo "Error: paru is required but not installed." >&2
  echo "Install it first, for example: sudo pacman -S --needed paru" >&2
  exit 1
fi

if ! command -v sudo >/dev/null 2>&1 && ! command -v pkexec >/dev/null 2>&1; then
  echo "Error: either sudo or pkexec is required for privileged package actions." >&2
  exit 1
fi

arch="$(uname -m)"
case "$arch" in
  x86_64)
    asset_arch="x64"
    ;;
  aarch64|arm64)
    asset_arch="arm64"
    ;;
  *)
    echo "Error: unsupported architecture '$arch'." >&2
    exit 1
    ;;
esac

asset_name="${APP_NAME}-linux-${asset_arch}"

if [ "$VERSION" = "latest" ]; then
  download_url="https://github.com/${REPO}/releases/latest/download/${asset_name}"
else
  download_url="https://github.com/${REPO}/releases/download/${VERSION}/${asset_name}"
fi

tmp_file="$(mktemp)"
cleanup() {
  rm -f "$tmp_file"
}
trap cleanup EXIT INT TERM

echo "Downloading $APP_NAME from: $download_url"
curl -fsSL "$download_url" -o "$tmp_file"

mkdir -p "$INSTALL_DIR"
chmod +x "$tmp_file"
mv "$tmp_file" "$INSTALL_DIR/$APP_NAME"

echo "Installed: $INSTALL_DIR/$APP_NAME"

case ":$PATH:" in
  *":$INSTALL_DIR:"*)
    ;;
  *)
    echo ""
    echo "Add this directory to PATH to run '$APP_NAME' directly:"
    echo "  export PATH=\"$INSTALL_DIR:\$PATH\""
    ;;
esac

echo ""
echo "Run: $APP_NAME"
