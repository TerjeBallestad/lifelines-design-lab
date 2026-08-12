#!/usr/bin/env node
// TASK-917 — Paper texture bake (thin CLI over the TASK-916 doc templates).
//
//   content/cases/olsen/tiny-olsen.case.md
//        │ buildTinyOlsenArtifacts -> labContent (READ-ONLY here)
//        │ templates/docs/* (per-KIND HTML)  +  Playwright (TASK-914 launch path)
//        └─> ../lifelines-core-loop/resources/cases/olsen/textures/
//            ├─ <doc_id>.png          (9 authored docs + DAGSRAPPORT stationery)
//            └─ manifest.json         (per-doc UV fact rects, tab-indented)
//
// Mirrors generate-tiny-olsen-case.mjs: defaultPaths() + assertWritableDirectory()
// gate the cross-repo write, and a --check mode rebuilds and compares instead of
// writing. This module is a READ-ONLY consumer of labContent — it never parses
// markdown or touches case-format.mjs / generate-tiny-olsen-case.mjs beyond the
// artifact build + the shared stableStringify.
//
// Launch path (TASK-914 spike, scripts/blueprint/bake-spike.mjs): a single
// chromium.launch({ headless: true }) drives every page, loaded via a raw
// file:// goto on self-contained HTML (fonts base64-embedded) — no dev server,
// no bundler. If chromium cannot launch in this sandbox the bake throws; it must
// then run Terje-local (the spike documents the Mach-port failure mode).
//
// Per [data-fact-id] span, a Range.getClientRects() yields one rect per rendered
// line box; each becomes a [u, v, w, h] tuple normalized to the FULL page (scroll
// extents), so the manifest lines up with the fullPage screenshot. A fact that
// spans multiple runs contributes all its line rects, in DOM order.
//
// DETERMINISM: the baked PNGs proved byte-identical (sha256-stable) across
// separate processes/launches in this environment, because the fonts are embedded
// and the layout + screenshot are fully specified. The --check therefore compares
// BOTH the manifest (strict, stableStringify) AND the PNG bytes AND the PNG pixel
// dimensions — no flaky check. Should PNG encoding ever go non-deterministic on
// another host, the manifest + dimension comparisons still catch content drift;
// flip PNG_BYTE_COMPARE to false to fall back to those two alone.

import { constants as fsConstants } from 'node:fs';
import { access, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { chromium } from 'playwright';
// compile-content.mjs is the 0.2-compiler CLI; serializeSliceJson is the
// same tab-indented stable serialization case-format.mjs used to provide.
import {
  buildTinyOlsenArtifacts,
  serializeSliceJson as stableStringify,
} from './compile-content.mjs';
import { buildDocHtml, buildStationeryHtml } from '../../templates/docs/render-doc.mjs';
import { sizeForKind } from '../../templates/docs/shared.mjs';
import { blockRuns } from '../../src/domain/blueprint.ts';

// The shell renders at this device scale (mirrors render-doc.mjs) — the "@
// deviceScaleFactor per template shell" the task asks for.
const DEVICE_SCALE_FACTOR = 3;
const UV_PRECISION = 5;
const PNG_BYTE_COMPARE = true;

// 11 authored docs in a fixed bake order (deterministic manifest key order).
// SDD-011: doc_konto/doc_papirer retired; the four raw economy papers arrive.
export const AUTHORED_DOC_IDS = Object.freeze([
  'doc_bekymring',
  'doc_konto_grete',
  'doc_konto_elling',
  'doc_strom',
  'doc_kassalapp',
  'doc_huseier',
  'doc_frank_tlf',
  'doc_frank_visit',
  'doc_innleggelse',
  'doc_dodsfall',
  'doc_status',
]);

// Generated stationery: empty-content kinds with no labContent doc.
export const STATIONERY_DOCS = Object.freeze([
  { kind: 'DAGSRAPPORT', docId: 'stationery_dagsrapport' },
]);

export function defaultPaths(cwd = process.cwd()) {
  const designLabRoot = resolve(cwd);
  const coreLoopRoot = resolve(designLabRoot, '../lifelines-core-loop');
  const coreCaseDir = join(coreLoopRoot, 'resources/cases/olsen');
  const coreTexturesDir = join(coreCaseDir, 'textures');
  return {
    designLabRoot,
    coreLoopRoot,
    coreCaseDir,
    coreTexturesDir,
    manifestPath: join(coreTexturesDir, 'manifest.json'),
  };
}

async function assertWritableDirectory(path, label) {
  try {
    await access(path, fsConstants.W_OK);
  } catch {
    throw new Error(`${label} is missing or not writable: ${path}`);
  }
}

// PNG pixel dimensions straight from the IHDR chunk (ground-truth texture size).
function pngSize(buffer) {
  if (buffer.length < 24 || buffer.toString('latin1', 1, 4) !== 'PNG') {
    throw new Error('not a PNG buffer');
  }
  return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
}

const roundUv = (n) => {
  const f = 10 ** UV_PRECISION;
  return Math.round(n * f) / f;
};

// Extract per-[data-fact-id] line rects in full-page UV space. One rect per line
// box; a fact appearing in multiple runs accumulates all its rects in DOM order.
async function measureFacts(page) {
  const raw = await page.evaluate(() => {
    const pageW = Math.max(
      document.documentElement.scrollWidth,
      document.documentElement.clientWidth,
      document.body.scrollWidth,
    );
    const pageH = Math.max(
      document.documentElement.scrollHeight,
      document.documentElement.clientHeight,
      document.body.scrollHeight,
    );
    const facts = {};
    for (const span of document.querySelectorAll('[data-fact-id]')) {
      const factId = span.getAttribute('data-fact-id');
      const range = document.createRange();
      range.selectNodeContents(span);
      const rects = Array.from(range.getClientRects())
        .filter((r) => r.width > 0 && r.height > 0)
        .map((r) => [
          (r.left + window.scrollX) / pageW,
          (r.top + window.scrollY) / pageH,
          r.width / pageW,
          r.height / pageH,
        ]);
      if (!facts[factId]) facts[factId] = [];
      facts[factId].push(...rects);
    }
    return facts;
  });
  const facts = {};
  for (const [factId, rects] of Object.entries(raw)) {
    facts[factId] = rects.map((r) => r.map(roundUv));
  }
  return facts;
}

async function renderPage(browser, { html, docId, texture, outDir, htmlDir, kind }) {
  const htmlPath = join(htmlDir, `${docId}.html`);
  const pngPath = join(outDir, texture);
  await writeFile(htmlPath, html, 'utf8');
  // Per-kind sheet format (SB-427): the viewport matches the kind's CSS page
  // size; fullPage still grows the shot if content runs past the min-height.
  const size = sizeForKind(kind);
  const page = await browser.newPage({
    viewport: { width: size.width, height: size.minHeight },
    deviceScaleFactor: DEVICE_SCALE_FACTOR,
  });
  try {
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const facts = await measureFacts(page);
    await page.screenshot({ path: pngPath, fullPage: true });
    const size_px = pngSize(await readFile(pngPath));
    return { docId, entry: { texture, size_px, facts } };
  } finally {
    await page.close();
  }
}

// SDD-011 coverage assertion: every fact anchored in a document's blocks must
// measure at least one UV rect on its sheet. A fact whose span renders
// zero-width, or whose anchor silently failed to land in a cell, would ship an
// empty rect list — the bake would pass and the desk highlight would be
// invisible in the game. Fail the bake instead, naming the doc and the fact.
function assertFactCoverage(docId, doc, measured) {
  const anchored = new Set(
    doc.blocks.flatMap((block) =>
      blockRuns(block)
        .filter((run) => run.factId)
        .map((run) => run.factId),
    ),
  );
  const uncovered = [...anchored].filter((factId) => !(measured[factId]?.length > 0));
  if (uncovered.length) {
    throw new Error(
      `bake coverage: ${docId} anchors ${uncovered.join(', ')} but measured no UV rect for ` +
        `${uncovered.length > 1 ? 'them' : 'it'} — the desk highlight would be invisible.`,
    );
  }
}

// Render every doc + stationery into outDir, return the manifest object (docs
// keyed by doc_id in a fixed, deterministic order).
export async function bakeAll(outDir, paths = defaultPaths()) {
  const { labContent } = await buildTinyOlsenArtifacts();
  await mkdir(outDir, { recursive: true });
  const htmlDir = await mkTempDir('lifelines-bake-html-');

  const browser = await chromium.launch({ headless: true });
  const docs = {};
  try {
    for (const docId of AUTHORED_DOC_IDS) {
      if (!labContent.documents[docId]) {
        throw new Error(`authored doc ${docId} missing from labContent`);
      }
      const html = buildDocHtml(docId, labContent);
      const { entry } = await renderPage(browser, {
        html,
        docId,
        texture: `${docId}.png`,
        outDir,
        htmlDir,
        kind: labContent.documents[docId].kind,
      });
      assertFactCoverage(docId, labContent.documents[docId], entry.facts);
      docs[docId] = entry;
    }
    for (const { kind, docId } of STATIONERY_DOCS) {
      const html = buildStationeryHtml(kind);
      const { entry } = await renderPage(browser, {
        html,
        docId,
        texture: `${docId}.png`,
        outDir,
        htmlDir,
        kind,
      });
      docs[docId] = entry;
    }
  } finally {
    await browser.close();
    await rm(htmlDir, { recursive: true, force: true });
  }
  return { docs };
}

async function mkTempDir(prefix) {
  const dir = join(tmpdir(), `${prefix}${process.pid}-${Date.now()}`);
  await mkdir(dir, { recursive: true });
  return dir;
}

export async function writeBake(paths = defaultPaths()) {
  await assertWritableDirectory(paths.coreCaseDir, 'core-loop olsen case directory');
  await mkdir(paths.coreTexturesDir, { recursive: true });
  const manifest = await bakeAll(paths.coreTexturesDir, paths);
  await writeFile(paths.manifestPath, stableStringify(manifest), 'utf8');
  return manifest;
}

export async function checkBake(paths = defaultPaths()) {
  const tmpOut = await mkTempDir('lifelines-bake-check-');
  try {
    const manifest = await bakeAll(tmpOut, paths);
    const freshManifest = stableStringify(manifest);

    let committedManifest = null;
    try {
      committedManifest = await readFile(paths.manifestPath, 'utf8');
    } catch {
      throw new Error(
        `Baked textures are stale: manifest missing at ${paths.manifestPath}. Run npm run bake:docs.`,
      );
    }
    if (freshManifest !== committedManifest) {
      throw new Error('Baked textures are stale: manifest mismatch. Run npm run bake:docs.');
    }

    for (const [docId, entry] of Object.entries(manifest.docs)) {
      const freshPng = await readFile(join(tmpOut, entry.texture));
      let committedPng;
      try {
        committedPng = await readFile(join(paths.coreTexturesDir, entry.texture));
      } catch {
        throw new Error(
          `Baked textures are stale: ${entry.texture} missing for ${docId}. Run npm run bake:docs.`,
        );
      }
      const [fw, fh] = pngSize(freshPng);
      const [cw, ch] = pngSize(committedPng);
      if (fw !== cw || fh !== ch) {
        throw new Error(
          `Baked textures are stale: ${entry.texture} dimensions ${fw}x${fh} != ${cw}x${ch}. Run npm run bake:docs.`,
        );
      }
      if (PNG_BYTE_COMPARE && !freshPng.equals(committedPng)) {
        throw new Error(
          `Baked textures are stale: ${entry.texture} bytes differ. Run npm run bake:docs.`,
        );
      }
    }
    return manifest;
  } finally {
    await rm(tmpOut, { recursive: true, force: true });
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  const paths = defaultPaths(process.cwd());
  if (check) {
    await checkBake(paths);
    console.log('Baked Olsen doc textures are fresh.');
  } else {
    const manifest = await writeBake(paths);
    const docCount = Object.keys(manifest.docs).length;
    console.log(`Wrote ${docCount} baked doc textures + manifest to ${paths.coreTexturesDir}`);
  }
}
