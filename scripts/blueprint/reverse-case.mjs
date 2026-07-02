#!/usr/bin/env node
// Reverse generator (SDD-100 authoring pipeline): Godot case-source JSON ->
// humane .case.md. Used once to heal the stale tiny-olsen.case.md (the Godot
// JSON evolved by hand — SB-314 root cause) and available for future drift.
//
// Usage:
//   node scripts/blueprint/reverse-case.mjs <in.json> <out.case.md>          # write
//   node scripts/blueprint/reverse-case.mjs <in.json> --verify               # round-trip proof only
//
// --verify: serialize -> parse -> build and deep-compare against the input
// JSON. Exit 1 with a field-level diff when parity fails.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parseCaseMarkdown, buildArtifacts, serializeCase } from './case-format.mjs';

export function roundTripDiff(godot) {
  const markdown = serializeCase(godot);
  const rebuilt = buildArtifacts(parseCaseMarkdown(markdown)).godotSource;
  return { markdown, rebuilt, diffs: deepDiff(godot, rebuilt, '$') };
}

export function deepDiff(a, b, path, out = []) {
  if (out.length > 40) return out;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) out.push(`${path}: array length ${a.length} != ${b.length}`);
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i += 1) deepDiff(a[i], b[i], `${path}[${i}]`, out);
    return out;
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of keys) {
      if (!(key in a)) out.push(`${path}.${key}: missing in ORIGINAL (extra in rebuilt)`);
      else if (!(key in b)) out.push(`${path}.${key}: missing in REBUILT`);
      else deepDiff(a[key], b[key], `${path}.${key}`, out);
    }
    return out;
  }
  if (a !== b) out.push(`${path}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`);
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [inPath, outPath] = process.argv.slice(2);
  if (!inPath) {
    console.error('usage: reverse-case.mjs <in.json> (<out.case.md> | --verify)');
    process.exit(2);
  }
  const godot = JSON.parse(await readFile(inPath, 'utf8'));
  const { markdown, diffs } = roundTripDiff(godot);
  if (diffs.length) {
    console.error(`ROUND-TRIP PARITY FAILED (${diffs.length} diffs):`);
    for (const diff of diffs) console.error('  ' + diff);
    process.exit(1);
  }
  if (outPath && outPath !== '--verify') {
    await writeFile(outPath, markdown, 'utf8');
    console.log(`round-trip parity OK — wrote ${outPath}`);
  } else {
    console.log('round-trip parity OK');
  }
}
