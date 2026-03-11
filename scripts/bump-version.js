#!/usr/bin/env node
// scripts/bump-version.js – Automatic version bump script (M10 Task 10.4)
//
// Usage:
//   node scripts/bump-version.js patch   → 0.10.0 → 0.10.1
//   node scripts/bump-version.js minor   → 0.10.0 → 0.11.0
//   node scripts/bump-version.js major   → 0.10.0 → 1.0.0
//   node scripts/bump-version.js 1.2.3   → set explicit version
//
// Or via npm (after adding to package.json scripts):
//   npm run bump -- patch
//
// What it does:
//   1. Bumps the version in package.json
//   2. Updates the "Version:" line in BRIEF.md
//   3. Updates the changelog header in TASKS.md
//
// Run this before `git commit` after completing a milestone or release.

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ── Helpers ─────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dirname, '..');

function readJSON(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

function writeJSON(file, data) {
  writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function readText(file) {
  return readFileSync(file, 'utf8');
}

function writeText(file, content) {
  writeFileSync(file, content, 'utf8');
}

/** Parse a semver string into { major, minor, patch } */
function parseSemver(v) {
  const m = v.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!m) throw new Error(`Invalid semver: "${v}"`);
  return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]) };
}

/** Increment semver by bump type or set explicit version */
function bumpVersion(current, bump) {
  // Explicit version string?
  if (/^\d+\.\d+\.\d+$/.test(bump)) return bump;

  const { major, minor, patch } = parseSemver(current);
  switch (bump) {
    case 'major': return `${major + 1}.0.0`;
    case 'minor': return `${major}.${minor + 1}.0`;
    case 'patch': return `${major}.${minor}.${patch + 1}`;
    default:      throw new Error(`Unknown bump type: "${bump}". Use patch | minor | major | x.y.z`);
  }
}

/** Zero-pad single digit to two digits */
function pad(n) {
  return String(n).padStart(2, '0');
}

/** Today's date as YYYY-MM-DD */
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// ── Main ─────────────────────────────────────────────────────────────────────

const bump = process.argv[2];
if (!bump) {
  console.error('Usage: node scripts/bump-version.js [patch|minor|major|x.y.z]');
  process.exit(1);
}

// 1) package.json
const pkgPath = resolve(ROOT, 'package.json');
const pkg     = readJSON(pkgPath);
const oldVer  = pkg.version;
const newVer  = bumpVersion(oldVer, bump);

pkg.version = newVer;
writeJSON(pkgPath, pkg);
console.log(`✅ package.json: ${oldVer} → ${newVer}`);

const date = today();

// 2) BRIEF.md – update **Version:** line
const briefPath = resolve(ROOT, 'BRIEF.md');
if (readText(briefPath)) {
  const brief = readText(briefPath)
    // Match: **Version:** 0.10.0  or  Version: 0.10.0
    .replace(
      /(\*\*Version:\*\*\s*)[\d.]+/,
      `$1${newVer}`
    )
    // Update Aktualisiert date
    .replace(
      /(\*\*Aktualisiert:\*\*\s*)[\d-]+/,
      `$1${date}`
    );
  writeText(briefPath, brief);
  console.log(`✅ BRIEF.md: Version → ${newVer}, Aktualisiert → ${date}`);
}

// 3) TASKS.md – update version reference in the first heading or footer line
const tasksPath = resolve(ROOT, 'TASKS.md');
if (readText(tasksPath)) {
  let tasks = readText(tasksPath);

  // Update line like: "**Version:** 0.10.0 ..."
  tasks = tasks.replace(
    /(\*\*Version:\*\*\s*)[\d.]+/,
    `$1${newVer}`
  );

  // Update footer line: "*Dokument zuletzt aktualisiert: ..."
  tasks = tasks.replace(
    /(\*Dokument zuletzt aktualisiert:?\s*)[\d-]+(\s*\|?\s*v?[\d.]+)?/,
    `$1${date} | v${newVer}`
  );

  writeText(tasksPath, tasks);
  console.log(`✅ TASKS.md: Version → ${newVer}, Datum → ${date}`);
}

console.log(`\n🚀 Version bumped: ${oldVer} → ${newVer}`);
console.log(`   Next steps:`);
console.log(`   git add package.json BRIEF.md TASKS.md`);
console.log(`   git commit -m "chore: bump version to ${newVer}"`);
