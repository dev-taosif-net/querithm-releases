# Querithm releases

Installers for [Querithm](https://dev-taosif-net.github.io/querithm-releases/), a desktop SQL IDE for SQL Server and
PostgreSQL. The source code is in a private repository. This repository holds only the download page and the
installers published under [Releases](https://github.com/dev-taosif-net/querithm-releases/releases).

## Download

**https://dev-taosif-net.github.io/querithm-releases/**

The Windows and Linux links always point to the newest release. macOS builds are paused, so the macOS links point to
0.2.0, the last macOS release:

| Platform | File |
|---|---|
| Windows 10/11 (installer) | [Querithm-windows-x64-setup.exe](https://github.com/dev-taosif-net/querithm-releases/releases/latest/download/Querithm-windows-x64-setup.exe) |
| Windows 10/11 (MSI) | [Querithm-windows-x64.msi](https://github.com/dev-taosif-net/querithm-releases/releases/latest/download/Querithm-windows-x64.msi) |
| macOS, Apple Silicon (0.2.0) | [Querithm-macos-arm64.dmg](https://github.com/dev-taosif-net/querithm-releases/releases/download/v0.2.0/Querithm-macos-arm64.dmg) |
| macOS, Intel (0.2.0) | [Querithm-macos-x64.dmg](https://github.com/dev-taosif-net/querithm-releases/releases/download/v0.2.0/Querithm-macos-x64.dmg) |
| Linux (AppImage) | [Querithm-linux-x64.AppImage](https://github.com/dev-taosif-net/querithm-releases/releases/latest/download/Querithm-linux-x64.AppImage) |
| Debian / Ubuntu | [Querithm-linux-x64.deb](https://github.com/dev-taosif-net/querithm-releases/releases/latest/download/Querithm-linux-x64.deb) |
| Fedora / RHEL | [Querithm-linux-x64.rpm](https://github.com/dev-taosif-net/querithm-releases/releases/latest/download/Querithm-linux-x64.rpm) |

Each release also includes `SHA256SUMS.txt`.

## In-app updates

Installed copies of Querithm update themselves: they read `latest.json` from the newest release
(`releases/latest/download/latest.json`) and show an **Update** button when a newer version exists. The update
packages are the installers above, plus `Querithm-macos-*.app.tar.gz` for macOS. Each has a `.sig` file, the minisign
signature the app checks before installing. Pre-releases have no effect on installed apps because they never become
"latest". Download counts on the page include these in-app updates.

Releases after 0.2.0 have no macOS files and no macOS entry in `latest.json`. A Mac on 0.2.0 finds no update package
for itself: it keeps running 0.2.0, its automatic check stays silent and a manual check says there is no package for it.

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
