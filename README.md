# Querithm releases

Installers for [Querithm](https://dev-taosif-net.github.io/querithm-releases/), a desktop SQL IDE for SQL Server and
PostgreSQL. The source code is in a private repository. This repository holds only the download page and the
installers published under [Releases](https://github.com/dev-taosif-net/querithm-releases/releases).

## Download

**https://dev-taosif-net.github.io/querithm-releases/**

These links always point to the newest release:

| Platform | File |
|---|---|
| Windows 10/11 (installer) | [Querithm-windows-x64-setup.exe](https://github.com/dev-taosif-net/querithm-releases/releases/latest/download/Querithm-windows-x64-setup.exe) |
| Windows 10/11 (MSI) | [Querithm-windows-x64.msi](https://github.com/dev-taosif-net/querithm-releases/releases/latest/download/Querithm-windows-x64.msi) |
| macOS, Apple Silicon | [Querithm-macos-arm64.dmg](https://github.com/dev-taosif-net/querithm-releases/releases/latest/download/Querithm-macos-arm64.dmg) |
| macOS, Intel | [Querithm-macos-x64.dmg](https://github.com/dev-taosif-net/querithm-releases/releases/latest/download/Querithm-macos-x64.dmg) |
| Linux (AppImage) | [Querithm-linux-x64.AppImage](https://github.com/dev-taosif-net/querithm-releases/releases/latest/download/Querithm-linux-x64.AppImage) |
| Debian / Ubuntu | [Querithm-linux-x64.deb](https://github.com/dev-taosif-net/querithm-releases/releases/latest/download/Querithm-linux-x64.deb) |
| Fedora / RHEL | [Querithm-linux-x64.rpm](https://github.com/dev-taosif-net/querithm-releases/releases/latest/download/Querithm-linux-x64.rpm) |

Each release also includes `SHA256SUMS.txt`.

## How releases get here

Pushing a `v*` tag in the source repository runs its `release` workflow. The workflow builds the installers, renames them
to the stable names above, and creates the Release here using the `RELEASES_REPO_TOKEN` secret, a fine-grained token
limited to this repository with **Contents: read and write**. Tags with a suffix such as `v0.2.0-beta.1` are published as
pre-releases and do not replace the "latest" links.

## The page

`index.html`, `style.css` and `app.js` are served by GitHub Pages from the root of `main`. The page is static and needs
no build step. It reads version, file sizes and download counts from the public GitHub API. If the API is unreachable or
rate-limited, the numbers are hidden and the download links still work. The page loads nothing from third parties, sets
no cookies and runs no analytics.
