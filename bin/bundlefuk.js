#!/usr/bin/env node
/**
 * bundlefuk CLI — the one command to check everything.
 *
 * Delegates to fractal-runner and openshell. Just verifies they're all present.
 */

const { execSync } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

const B = '\x1b[34m';
const G = '\x1b[32m';
const Y = '\x1b[33m';
const R = '\x1b[0m';
const D = '\x1b[2m';

const args = process.argv.slice(2);
const cmd = args[0] || 'doctor';

function findOpenshell() {
  const binName = os.platform() === 'win32' ? 'openshell.exe' : 'openshell';
  // Check bundled binary first
  const bundled = path.join(__dirname, '..', 'bin', binName);
  if (fs.existsSync(bundled)) return bundled;
  // Check PATH
  try {
    return execSync(`which ${binName} 2>/dev/null || where ${binName} 2>/dev/null`, { shell: true })
      .toString().trim() || null;
  } catch { return null; }
}

function doctor() {
  console.log(`${B}BundleFuk${R} — system check\n`);
  const checks = [];

  // 1. Fractal runner
  try {
    const v = execSync('fractal-runner --version', { timeout: 5000 }).toString().trim();
    checks.push([true, 'Fractal runner', v]);
  } catch {
    checks.push([false, 'Fractal runner', 'not found — npm install -g @fractalcode/runner']);
  }

  // 2. OpenShell sandbox binary
  const osPath = findOpenshell();
  if (osPath) {
    try {
      const v = execSync(`"${osPath}" --version`, { timeout: 5000 }).toString().trim();
      checks.push([true, 'OpenShell sandbox', `${v} (${osPath})`]);
    } catch {
      checks.push([false, 'OpenShell sandbox', `found at ${osPath} but not executable`]);
    }
  } else {
    checks.push([false, 'OpenShell sandbox', 'not found — using Javy Wasm void (built-in)']);
  }

  // 3. Node version
  const nodeV = process.version;
  const nodeOk = parseInt(nodeV.slice(1)) >= 20;
  checks.push([nodeOk, 'Node.js', nodeV + (nodeOk ? '' : ' (need >=20)')]);

  // 4. Platform
  checks.push([true, 'Platform', `${os.platform()}-${os.arch()}`]);

  // Print
  let allOk = true;
  for (const [ok, name, detail] of checks) {
    const icon = ok ? `${G}✓${R}` : `${Y}✗${R}`;
    console.log(`  ${icon} ${name}: ${D}${detail}${R}`);
    if (!ok) allOk = false;
  }

  console.log('');
  if (allOk) {
    console.log(`${G}All checks passed.${R}`);
    console.log(`\nNext: ${D}fractal-runner init${R}  or  ${D}openshell fractal --help${R}`);
  } else {
    console.log(`${Y}Some checks failed — see install instructions above.${R}`);
    console.log(`\nManual setup: ${D}https://github.com/haltandcatchwater/BundleFuk${R}`);
  }
}

function help() {
  console.log(`${B}BundleFuk${R} — Fractal Code + OpenShell sandbox\n`);
  console.log(`  bundlefuk doctor     Check that everything is installed`);
  console.log(`  bundlefuk --help      Show this help`);
  console.log(`\nDelegates to:`);
  console.log(`  fractal-runner        Fractal Code CLI (cells, scaffolds, serve)`);
  console.log(`  openshell fractal     Fractal cells in hardened sandboxes`);
  console.log(`\nRepo: ${D}https://github.com/haltandcatchwater/BundleFuk${R}`);
}

switch (cmd) {
  case 'doctor':
    doctor();
    break;
  case '--help':
  case '-h':
  case 'help':
    help();
    break;
  default:
    console.log(`Unknown command: ${cmd}`);
    help();
    process.exit(1);
}
