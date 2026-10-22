// Download page logic: pick the visitor's installer, then fill in version, sizes and download counts
// from GitHub's public release API. Every link works without this script; on any API failure the
// page keeps its static links and hides the numbers.
"use strict";

const REPO = "dev-taosif-net/querithm-releases";
const LATEST = `https://github.com/${REPO}/releases/latest/download/`;
const CACHE_KEY = "querithm-releases-v1";
const CACHE_MS = 15 * 60 * 1000; // the unauthenticated API allows 60 requests per hour per IP
const MAX_PAGES = 10;

const OS_LABEL = { windows: "Windows", macos: "macOS", linux: "Linux" };

// Primary button per platform, plus the alternatives listed under it.
const CHOICES = {
  windows: { primary: "Querithm-windows-x64-setup.exe", label: "Windows 64-bit", alts: [["MSI package", "Querithm-windows-x64.msi"]] },
  "macos-arm64": { primary: "Querithm-macos-arm64.dmg", label: "macOS, Apple Silicon", alts: [["Intel Mac", "Querithm-macos-x64.dmg"]] },
  "macos-x64": { primary: "Querithm-macos-x64.dmg", label: "macOS, Intel", alts: [["Apple Silicon", "Querithm-macos-arm64.dmg"]] },
  linux: { primary: "Querithm-linux-x64.AppImage", label: "Linux x86-64, AppImage", alts: [[".deb", "Querithm-linux-x64.deb"], [".rpm", "Querithm-linux-x64.rpm"]] },
};

function detectPlatform() {
  const uad = navigator.userAgentData;
  const ua = navigator.userAgent.toLowerCase();
  const platform = ((uad && uad.platform) || navigator.platform || "").toLowerCase();
  if ((uad && uad.mobile) || /android|iphone|ipad|ipod/.test(ua)) return null;
  if (platform.includes("win")) return "windows";
  if (platform.includes("mac")) {
    if (navigator.maxTouchPoints > 1) return null; // iPadOS reports itself as a Mac
    return "macos";
  }
  if (platform.includes("linux") || ua.includes("linux")) return "linux";
  return null;
}

// Chromium browsers report the CPU; Safari and Firefox do not, so Apple Silicon is the default.
async function detectMacArch() {
  const uad = navigator.userAgentData;
  if (!uad || !uad.getHighEntropyValues) return "arm64";
  try {
    const { architecture } = await uad.getHighEntropyValues(["architecture"]);
    return architecture === "x86" ? "x64" : "arm64";
  } catch {
    return "arm64";
  }
}

function el(id) {
  return document.getElementById(id);
}

function showPrimary(choiceKey) {
  const choice = CHOICES[choiceKey];
  const btn = el("primary");
  btn.href = LATEST + choice.primary;
  btn.dataset.asset = choice.primary;
  btn.textContent = `Download for ${OS_LABEL[choiceKey.split("-")[0]]}`;
  el("primary-meta").textContent = choice.label;

  const alt = el("primary-alt");
  alt.replaceChildren("Also: ");
  choice.alts.forEach(([text, asset], i) => {
    if (i > 0) alt.append(" · ");
    const a = document.createElement("a");
    a.href = LATEST + asset;
    a.dataset.asset = asset;
    a.textContent = text;
    alt.append(a);
  });
  alt.append(" · ");
  const all = document.createElement("a");
  all.href = "#platforms";
  all.textContent = "other platforms";
  alt.append(all);
  alt.hidden = false;
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (Date.now() - entry.at > CACHE_MS || !Array.isArray(entry.releases)) return null;
    return entry.releases;
  } catch {
    return null;
  }
}

function writeCache(releases) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), releases }));
  } catch {
    // storage blocked or full: the page still works, it just asks the API again next time
  }
}

// Only the fields the page uses, with types checked: the response is external data.
function slim(release) {
  return {
    tag: String(release.tag_name || ""),
    draft: release.draft === true,
    prerelease: release.prerelease === true,
    assets: (Array.isArray(release.assets) ? release.assets : []).map((a) => ({
      name: String(a.name || ""),
      size: Number.isFinite(a.size) ? a.size : 0,
      count: Number.isFinite(a.download_count) ? a.download_count : 0,
    })),
  };
}

async function fetchReleases() {
  const cached = readCache();
  if (cached) return cached;
  const releases = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=100&page=${page}`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const batch = await res.json();
    if (!Array.isArray(batch)) throw new Error("unexpected API response");
    releases.push(...batch.map(slim));
    if (batch.length < 100) break;
  }
  writeCache(releases);
  return releases;
}

function formatSize(bytes) {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function formatCount(n) {
  return new Intl.NumberFormat("en").format(n);
}

function disableLink(a) {
  a.classList.add("disabled");
  a.setAttribute("aria-disabled", "true");
  a.removeAttribute("href");
}

function render(releases) {
  const assetLinks = document.querySelectorAll("a[data-asset]");
  const latest = releases.find((r) => !r.draft && !r.prerelease);

  if (!latest) {
    const notice = el("notice");
    notice.textContent = "The first release is on its way. Check back soon.";
    notice.hidden = false;
    assetLinks.forEach(disableLink);
    disableLink(el("primary"));
    el("primary-alt").hidden = true;
    return;
  }

  const version = latest.tag.replace(/^v/, "");
  const byName = new Map(latest.assets.map((a) => [a.name, a]));
  assetLinks.forEach((a) => {
    const asset = byName.get(a.dataset.asset);
    if (!asset) {
      disableLink(a);
      return;
    }
    const size = a.parentElement.querySelector(".size");
    if (size) size.textContent = formatSize(asset.size);
  });

  const primary = el("primary");
  const primaryAsset = byName.get(primary.dataset.asset);
  if (primaryAsset) {
    el("primary-meta").textContent += ` · version ${version} · ${formatSize(primaryAsset.size)}`;
  } else {
    el("primary-meta").textContent = `Version ${version}`;
  }

  // Counts cover every release; only installers are counted, not SHA256SUMS.txt.
  const perOs = { windows: 0, macos: 0, linux: 0 };
  for (const r of releases) {
    if (r.draft) continue;
    for (const a of r.assets) {
      const m = /^Querithm-(windows|macos|linux)-/.exec(a.name);
      if (m) perOs[m[1]] += a.count;
    }
  }
  const total = perOs.windows + perOs.macos + perOs.linux;
  el("stats-total").textContent = formatCount(total);
  el("stats").hidden = false;
  document.querySelectorAll(".card[data-os]").forEach((card) => {
    const count = card.querySelector(".count");
    count.textContent = `${formatCount(perOs[card.dataset.os])} downloads`;
    count.hidden = false;
  });
}

async function main() {
  const os = detectPlatform();
  if (os) {
    const key = os === "macos" ? `macos-${await detectMacArch()}` : os;
    showPrimary(key);
    const card = document.querySelector(`.card[data-os="${os}"]`);
    if (card) card.classList.add("current");
    const help = document.querySelector(`details[data-os="${os}"]`);
    if (help) help.open = true;
  } else {
    el("primary").textContent = "See all downloads";
    el("primary-meta").textContent = "Querithm is a desktop app for Windows, macOS and Linux.";
  }

  try {
    render(await fetchReleases());
  } catch {
    // Rate-limited or offline: the static links still point at the latest release.
  }
}

main();
