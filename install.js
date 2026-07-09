#!/usr/bin/env node
/**
 * BundleFuk install script — runs after `npm install -g bundlefuk`.
 *
 * Architecture:
 *   npm install -g bundlefuk
 *     ├── npm installs @fractalcode/runner (logic layer: 8 packages + bridge)
 *     └── this script downloads the openshell-fractal binary (sandbox layer)
 *
 * Fallback: if the binary download fails, Fractal still works using the
 * built-in Javy Wasm void sandbox. The OpenShell binary adds kernel-level
 * isolation as an opt-in hardening layer.
 */

'use strict';

const event = process.env.npm_lifecycle_event;
if (event !== 'postinstall' && event !== undefined) process.exit(0);

const os = require('os');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// ── Styling ───────────────────────────────────────────────────────────────
const G = '\x1b[32m';
const Y = '\x1b[33m';
const B = '\x1b[34m';
const D = '\x1b[2m';
const R = '\x1b[0m';

// ── Config ────────────────────────────────────────────────────────────────
const BUNDLEFUK_VERSION = 'bundlefuk-v0.1.0';
const GITHUB_REPO = 'haltandcatchwater/OpenShell'; // Fork with the crate
const GITHUB_RELEASES = `https://github.com/${GITHUB_REPO}/releases/download`;

// ── Platform mapping ──────────────────────────────────────────────────────
const PLATFORM_MAP = {
  'linux-x64':   'openshell-fractal-linux-amd64',
  'linux-arm64': 'openshell-fractal-linux-arm64',
  'darwin-x64':  'openshell-fractal-darwin-amd64',
  'darwin-arm64': 'openshell-fractal-darwin-arm64',
  'win32-x64':   'openshell-fractal-windows-amd64.exe',
};

const BINARY_NAME = os.platform() === 'win32' ? 'openshell.exe' : 'openshell';

function detectPlatform() {
  return PLATFORM_MAP[`${os.platform()}-${os.arch()}`] || null;
}

// ── Download ──────────────────────────────────────────────────────────────
function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { timeout: 120000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(dest);
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const total = parseInt(res.headers['content-length'], 10) || 0;
      let downloaded = 0;
      res.on('data', (chunk) => {
        downloaded += chunk.length;
        if (total > 0) {
          const pct = Math.round((downloaded / total) * 100);
          process.stdout.write(`\r   ${D}Downloading... ${pct}%${R}`);
        }
      });
      res.pipe(file);
      file.on('finish', () => {
        process.stdout.write('\r\x1b[K'); // Clear progress line
        file.close();
        resolve();
      });
      file.on('error', (e) => { fs.unlink(dest, () => {}); reject(e); });
    }).on('error', (e) => { fs.unlink(dest, () => {}); reject(e); });
  });
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  // Banner
  process.stdout.write(`
${B}  BundleFuk${R} — Fractal Code + OpenShell sandbox

${D}  Logic layer:  @fractalcode/runner (npm)${R}
${D}  Sandbox layer: openshell-fractal binary (GitHub Releases)${R}
`);

  // ── Step 1: Verify Fractal runner is available ──────────────────────
  let runnerVersion;
  try {
    runnerVersion = execSync('fractal-runner --version', { timeout: 5000 }).toString().trim();
    process.stdout.write(`\n${G}✓${R} Fractal runner: ${runnerVersion}\n`);
  } catch {
    process.stdout.write(`\n${Y}⚠${R}  fractal-runner not found on PATH.\n`);
    process.stdout.write(`   Install it: npm install -g @fractalcode/runner\n`);
    // Continue anyway — maybe the user installed the runner separately
  }

  // ── Step 2: Download OpenShell sandbox binary ───────────────────────
  const artifact = detectPlatform();

  if (!artifact) {
    process.stdout.write(`
${Y}⚠${R}  No prebuilt OpenShell binary for ${os.platform()}-${os.arch()}.
   Sandbox: Javy Wasm void (built-in, no kernel isolation).
   Install OpenShell separately for hardened sandboxing:
     curl -LsSf https://raw.githubusercontent.com/NVIDIA/OpenShell/main/install.sh | sh
`);
    printDone();
    return;
  }

  const binDir = path.join(__dirname, 'bin');
  if (!fs.existsSync(binDir)) fs.mkdirSync(binDir, { recursive: true });

  const destPath = path.join(binDir, BINARY_NAME);

  // Check if already installed
  if (fs.existsSync(destPath)) {
    try {
      const v = execSync(`"${destPath}" --version`, { timeout: 5000 }).toString().trim();
      process.stdout.write(`\n${G}✓${R} OpenShell sandbox already installed (${v})\n`);
      printDone();
      return;
    } catch {
      process.stdout.write(`   Re-downloading (existing binary corrupt)...\n`);
      fs.unlinkSync(destPath);
    }
  }

  const url = `${GITHUB_RELEASES}/${BUNDLEFUK_VERSION}/${artifact}`;
  process.stdout.write(`\n${D}   Pulling sandbox binary...${R}\n`);

  try {
    await download(url, destPath);

    if (os.platform() !== 'win32') fs.chmodSync(destPath, 0o755);

    try {
      const v = execSync(`"${destPath}" --version`, { timeout: 10000 }).toString().trim();
      process.stdout.write(`\n${G}✓${R} OpenShell sandbox installed (${v})\n`);
      process.stdout.write(`   Run: openshell fractal --help\n`);
    } catch {
      process.stdout.write(`\n${Y}⚠${R}  Binary downloaded but may be incompatible. Falling back to Wasm sandbox.\n`);
    }
  } catch (err) {
    process.stdout.write(`\n${Y}⚠${R}  Sandbox download skipped: ${err.message}\n`);
    process.stdout.write(`   Falling back to Javy Wasm sandbox (built-in).\n`);
    process.stdout.write(`   Manual install: ${GITHUB_RELEASES}/${BUNDLEFUK_VERSION}\n`);
  }

  printDone();
}

function printDone() {
  process.stdout.write(`
${G}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${R}
${G}  BundleFuk installed!${R}

  Get started:
    bundlefuk doctor          ${D}# verify everything works${R}
    fractal-runner init       ${D}# scaffold a new Fractal project${R}
    fractal-runner serve      ${D}# boot API + dashboard${R}
    openshell fractal --help  ${D}# explore the Fractal CLI${R}
${G}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${R}
`);
}

main().catch(() => process.exit(0)); // Never fail the install
