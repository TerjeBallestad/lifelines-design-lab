#!/usr/bin/env node
// TASK-916 — Doc render route + entry.
//
// Given a doc id, looks up its kind from the generator's labContent, selects the
// per-kind template, feeds the labContent run list, and renders a full-page A4 PNG
// via the TASK-914-proven launch path: chromium.launch({ headless: true }) +
// page.goto('file://<abs>/doc.html') on raw static HTML (no dev server, no bundler).
//
// This module is a READ-ONLY consumer of labContent. It never parses markdown and
// never touches case-format.mjs / generate-tiny-olsen-case.mjs.
//
// CLI:
//   node templates/docs/render-doc.mjs <docId> [outDir]
//   node templates/docs/render-doc.mjs --stationery DAGSRAPPORT [outDir]

import { mkdirSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { templateForKind } from './registry.mjs';
import { renderRuns, pageShell, overrideForDoc, sizeForKind, PAGE_WIDTH_PX } from './shared.mjs';
import { fontFaceCss } from './fonts-node.mjs';

const DEFAULT_OUT_DIR = '/tmp/bake-spike';
const DEFAULT_DEVICE_SCALE_FACTOR = 3;

// ---- HTML build (pure) ----------------------------------------------------

// Build full-page HTML for an authored doc: kind comes from labContent, runs from
// labContent.documents[docId].blocks[0].runs. Per-doc override hook is wired but
// unused in v1 (overrideForDoc returns empty).
export function buildDocHtml(docId, labContent) {
  const doc = labContent?.documents?.[docId];
  if (!doc) {
    const known = Object.keys(labContent?.documents ?? {}).join(', ');
    throw new Error(`Unknown doc id ${JSON.stringify(docId)}. Known: ${known}.`);
  }
  const template = templateForKind(doc.kind);
  // One labContent block per authored paragraph (blank-line separated).
  const runsHtml = (doc.blocks ?? [])
    .map((b) => `<p class="para">${renderRuns(b.runs)}</p>`)
    .join('\n');
  const override = overrideForDoc(docId);
  const bodyHtml = template.render({
    docId,
    kind: doc.kind,
    title: doc.title ?? '',
    meta: doc.meta ?? '',
    register: doc.register ?? '',
    peek: doc.peek ?? '',
    runsHtml,
    overrideClass: override.className,
    art: override.art,
  });
  return pageShell({
    kind: doc.kind,
    overrideClass: override.className,
    styleCss: template.styleCss,
    overrideCss: override.css,
    bodyHtml,
    fontCss: fontFaceCss(),
  });
}

// Build full-page HTML for a generated stationery kind (no labContent doc, no runs).
export function buildStationeryHtml(kind) {
  const template = templateForKind(kind);
  const bodyHtml = template.render({
    docId: `stationery_${kind.toLowerCase()}`,
    kind,
    title: '',
    meta: '',
    register: '',
    peek: '',
    runsHtml: '',
    overrideClass: '',
    art: '',
  });
  return pageShell({ kind, styleCss: template.styleCss, bodyHtml, fontCss: fontFaceCss() });
}

// ---- Render (Playwright, spike-proven launch path) ------------------------

// Render prebuilt HTML to a PNG. Writes the HTML beside the PNG so the file:// goto
// needs no bundler, screenshots full-page at deviceScaleFactor, and returns the
// count of [data-fact-id] spans found in the DOM.
export async function renderHtmlToPng(html, outPngPath, opts = {}) {
  const deviceScaleFactor = opts.deviceScaleFactor ?? DEFAULT_DEVICE_SCALE_FACTOR;
  const htmlPath = opts.htmlPath ?? outPngPath.replace(/\.png$/i, '.html');
  // Per-kind sheet format (SB-427): a viewport wider than the kind's CSS page
  // would leave a white gutter in the fullPage shot, so callers pass the size.
  const viewport = opts.viewport ?? { width: PAGE_WIDTH_PX, height: 1131 };
  mkdirSync(join(outPngPath, '..'), { recursive: true });
  writeFileSync(htmlPath, html, 'utf8');

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport,
      deviceScaleFactor,
    });
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: outPngPath, fullPage: true });
    const factCount = (await page.$$('[data-fact-id]')).length;
    return { htmlPath, pngPath: outPngPath, factCount };
  } finally {
    await browser.close();
  }
}

export async function renderDocToPng(docId, labContent, outPngPath, opts = {}) {
  const size = sizeForKind(labContent?.documents?.[docId]?.kind);
  return renderHtmlToPng(buildDocHtml(docId, labContent), outPngPath, {
    viewport: { width: size.width, height: size.minHeight },
    ...opts,
  });
}

export async function renderStationeryToPng(kind, outPngPath, opts = {}) {
  const size = sizeForKind(kind);
  return renderHtmlToPng(buildStationeryHtml(kind), outPngPath, {
    viewport: { width: size.width, height: size.minHeight },
    ...opts,
  });
}

// ---- CLI ------------------------------------------------------------------

async function main(argv) {
  const args = argv.slice(2);
  const stationeryIdx = args.indexOf('--stationery');
  const outDir =
    args.find((a, i) => i > 0 && !a.startsWith('--') && args[i - 1] !== '--stationery') ??
    DEFAULT_OUT_DIR;
  mkdirSync(outDir, { recursive: true });

  if (stationeryIdx !== -1) {
    const kind = args[stationeryIdx + 1];
    if (!kind) throw new Error('--stationery requires a KIND argument.');
    const outPng = join(outDir, `stationery_${kind.toLowerCase()}.png`);
    const res = await renderStationeryToPng(kind, outPng);
    console.log(
      JSON.stringify({ route: 'stationery', kind, ...res, bytes: statSync(res.pngPath).size }),
    );
    return;
  }

  const docId = args.find((a) => !a.startsWith('--'));
  if (!docId)
    throw new Error('Usage: render-doc.mjs <docId> [outDir] | --stationery KIND [outDir]');

  const { buildTinyOlsenArtifacts } =
    await import('../../scripts/blueprint/generate-tiny-olsen-case.mjs');
  const { labContent } = await buildTinyOlsenArtifacts();
  const outPng = join(outDir, `${docId}.png`);
  const res = await renderDocToPng(docId, labContent, outPng);
  console.log(
    JSON.stringify({
      route: 'doc',
      docId,
      kind: labContent.documents[docId].kind,
      ...res,
      bytes: statSync(res.pngPath).size,
    }),
  );
}

if (process.argv[1] && process.argv[1].endsWith('render-doc.mjs')) {
  main(process.argv).catch((err) => {
    console.error('[render-doc] FAILED:', err?.stack || String(err));
    process.exit(1);
  });
}
