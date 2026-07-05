#!/usr/bin/env node
// TASK-914 — Playwright bake SPIKE (throwaway). GATE for the design-lab bake pipeline.
//
// Proves — in the exact sandboxed-macOS environment executors run in — WHICH browser
// launch path works, before any template or bake-script investment.
//
// Prior traces (artifacts/browser-trace-attempts.txt) show two distinct failure modes:
//   1. Vite dev-server bind: `listen EPERM 127.0.0.1:5199`  (a URL-source failure)
//   2. chromium.launch Mach-port rendezvous 'Permission denied (1100)' (a launch failure)
// A later run (artifacts/browser-flow.json) worked by loading a built app via a file:// URL
// instead of a dev server. This spike attempts the launch, and — if the launch succeeds —
// loads a raw static HTML doc via file:// (no dev server, no bundler for static HTML),
// screenshots it, and extracts per-line client rects for a data-fact-id span into UV space.
//
// Launch path is common to every URL strategy; a Mach-port launch failure cannot be worked
// around by switching the goto target. Per the task, if NO browser launches we STOP + report
// BLOCKED rather than improvise. Follows the consumer pattern in
// tools/harness/web-ui-smoke.mjs (chromium.launch headless, newPage viewport, goto, screenshot).

import { mkdirSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const OUT_DIR = '/tmp/bake-spike';
const DOC_HTML_PATH = join(OUT_DIR, 'doc.html');
const DOC_PNG_PATH = join(OUT_DIR, 'doc.png');
const MANIFEST_PATH = join(OUT_DIR, 'manifest.json');

const VIEWPORT = { width: 800, height: 1100 };
const DEVICE_SCALE_FACTOR = 2;

// Minimal hardcoded doc: one <h1> + one quoted <span data-fact-id="f_test">. The span text is
// long and lives in a narrow measure column so it is guaranteed to wrap over 2+ lines, which is
// the whole point — multi-rect proof that Range.getClientRects() splits per line box.
const DOC_HTML = `<!doctype html>
<html lang="nb">
<head>
<meta charset="utf-8" />
<title>Bake spike doc</title>
<style>
  html, body { margin: 0; padding: 0; background: #f4efe3; }
  body { padding: 48px; font-family: Georgia, "Times New Roman", serif; color: #1c1712; }
  .doc { width: 360px; }
  h1 { font-size: 28px; margin: 0 0 24px 0; letter-spacing: 0.5px; }
  .quote { font-size: 20px; line-height: 1.6; }
  [data-fact-id] { background: rgba(200, 160, 60, 0.28); box-decoration-break: clone; }
</style>
</head>
<body>
  <div class="doc">
    <h1>SAKENS FAKTA — BAKE SPIKE</h1>
    <p class="quote">Frank noterer: <span data-fact-id="f_test">Grete bistår med praktiske gjøremål, økonomisk oversikt og kontakt med de øvrige tjenestene i kommunen, og saken vurderes som sårbar dersom denne støtten skulle falle bort.</span></p>
  </div>
</body>
</html>
`;

function looksLikeMachPortFailure(err) {
  const text = `${err?.message || ''}\n${err?.stack || ''}`;
  return (
    /mach_port_rendezvous/i.test(text) ||
    /Permission denied \(1100\)/i.test(text) ||
    /Target page, context or browser has been closed/i.test(text) ||
    /bootstrap_check_in/i.test(text)
  );
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  // Write the raw static HTML to disk up front so a file:// goto needs no bundler.
  writeFileSync(DOC_HTML_PATH, DOC_HTML, 'utf8');

  let browser;
  let launchPath;

  // ---- Launch attempt --------------------------------------------------------------------
  try {
    browser = await chromium.launch({ headless: true });
    launchPath = 'headless-launch';
    console.log('[spike] chromium.launch({ headless: true }) SUCCEEDED');
  } catch (err) {
    const machPort = looksLikeMachPortFailure(err);
    console.error('[spike] chromium.launch FAILED:', err?.message || String(err));
    // A Mach-port launch failure is not a URL problem — switching to file:// cannot rescue a
    // browser that never launched. No browser => STOP, do not improvise.
    console.log(
      JSON.stringify({
        spike: 'bake-spike',
        launchPath: null,
        launched: false,
        machPortFailure: machPort,
        blocked: true,
        reason: machPort
          ? 'chromium.launch died the Mach-port rendezvous way (Permission denied 1100) — no browser can launch in this sandbox. design-lab bake must run Terje-local.'
          : `chromium.launch failed: ${err?.message || String(err)}`,
      }),
    );
    process.exit(2);
    return;
  }

  // ---- Page load via raw file:// (no dev server, avoids the EPERM listen bind) ------------
  try {
    const page = await browser.newPage({
      viewport: VIEWPORT,
      deviceScaleFactor: DEVICE_SCALE_FACTOR,
    });
    const fileUrl = `file://${DOC_HTML_PATH}`;
    await page.goto(fileUrl, { waitUntil: 'networkidle' });
    launchPath = `${launchPath}+raw-file://`;

    // Screenshot the rendered doc (full page) at deviceScaleFactor 2.
    await page.screenshot({ path: DOC_PNG_PATH, fullPage: true });

    // ---- Extract per-line client rects for the f_test span, in UV [0..1] space -----------
    const measurement = await page.evaluate(() => {
      const factId = 'f_test';
      const span = document.querySelector(`[data-fact-id="${factId}"]`);
      if (!span) return { factId, error: 'span not found', rects: [] };

      // A Range over the span's text content yields one client rect per line box, so wrapped
      // text produces multiple rects — exactly the multi-line proof this spike needs.
      const range = document.createRange();
      range.selectNodeContents(span);
      const clientRects = Array.from(range.getClientRects());

      // UV is normalized against the FULL page (scroll extents), not just the viewport, so the
      // manifest lines up with a fullPage screenshot regardless of scroll.
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

      const rects = clientRects
        .filter((r) => r.width > 0 && r.height > 0)
        .map((r) => ({
          x0: (r.left + window.scrollX) / pageW,
          y0: (r.top + window.scrollY) / pageH,
          x1: (r.right + window.scrollX) / pageW,
          y1: (r.bottom + window.scrollY) / pageH,
        }));

      return { factId, pageW, pageH, lineCount: rects.length, rects };
    });

    await page.close();
    await browser.close();

    const manifest = {
      spike: 'bake-spike',
      launchPath,
      viewport: VIEWPORT,
      deviceScaleFactor: DEVICE_SCALE_FACTOR,
      docUrl: fileUrl,
      facts: [measurement],
    };
    writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

    const pngBytes = statSync(DOC_PNG_PATH).size;
    const rectCount = measurement.rects.length;
    const multiLineOk = rectCount >= 2;

    console.log(`[spike] screenshot: ${DOC_PNG_PATH} (${pngBytes} bytes)`);
    console.log(`[spike] manifest:   ${MANIFEST_PATH}`);
    console.log(`[spike] f_test UV rects: ${rectCount} (multi-line ${multiLineOk ? 'OK' : 'FAIL'})`);
    console.log(
      JSON.stringify({
        spike: 'bake-spike',
        launched: true,
        blocked: false,
        WORKING_LAUNCH_PATH: launchPath,
        pngBytes,
        rectCount,
        multiLineOk,
      }),
    );
    process.exit(multiLineOk && pngBytes > 0 ? 0 : 3);
  } catch (err) {
    console.error('[spike] page/render step FAILED after successful launch:', err?.stack || String(err));
    try {
      await browser.close();
    } catch {}
    console.log(
      JSON.stringify({
        spike: 'bake-spike',
        launched: true,
        blocked: false,
        WORKING_LAUNCH_PATH: launchPath,
        error: err?.message || String(err),
      }),
    );
    process.exit(3);
  }
}

main().catch((err) => {
  console.error('[spike] unexpected top-level failure:', err?.stack || String(err));
  process.exit(1);
});
