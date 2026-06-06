#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync, spawn } from 'node:child_process';
import { chromium } from 'playwright';

const runDir = valueAfter('--run-dir') || '.harness/runs/UNKNOWN';
const artifactsDir = join(runDir, 'artifacts');
mkdirSync(artifactsDir, { recursive: true });

const checks = [];
const artifacts = [];
const notes = [];

try {
  const testResult = run('npm', ['test']);
  writeFileSync(join(artifactsDir, 'npm-test.txt'), testResult.output, 'utf8');
  artifacts.push({
    kind: 'log',
    path: 'artifacts/npm-test.txt',
    title: 'npm test output',
    role: 'system',
    tags: ['deterministic'],
  });
  checks.push({
    claim: 'npm test passes',
    result: testResult.status === 0 ? 'PASS' : 'FAIL',
    evidence: ['artifacts/npm-test.txt'],
  });

  const buildResult = run('npm', ['run', 'build']);
  writeFileSync(join(artifactsDir, 'npm-build.txt'), buildResult.output, 'utf8');
  artifacts.push({
    kind: 'log',
    path: 'artifacts/npm-build.txt',
    title: 'npm run build output',
    role: 'system',
    tags: ['deterministic'],
  });
  checks.push({
    claim: 'npm run build passes',
    result: buildResult.status === 0 ? 'PASS' : 'FAIL',
    evidence: ['artifacts/npm-build.txt'],
  });

  const browserFlow = await smokeBrowserFlow();
  writeFileSync(
    join(artifactsDir, 'browser-flow.json'),
    JSON.stringify(browserFlow, null, 2) + '\n',
    'utf8',
  );
  artifacts.push({
    kind: 'trace',
    path: 'artifacts/browser-flow.json',
    title: 'Playwright browser clickthrough trace',
    role: 'evaluator',
    tags: ['web', 'playwright', 'interactive-ui'],
  });
  for (const screenshot of browserFlow.screenshots) {
    artifacts.push({
      kind: 'screenshot',
      path: screenshot.path,
      title: screenshot.title,
      role: 'evaluator',
      tags: ['web', 'playwright', 'visual'],
    });
  }
  checks.push(...browserFlow.checks);

  const sourceCheck = checkVisibleSource();
  writeFileSync(
    join(artifactsDir, 'slice-a-visible-source-check.json'),
    JSON.stringify(sourceCheck, null, 2) + '\n',
    'utf8',
  );
  artifacts.push({
    kind: 'trace',
    path: 'artifacts/slice-a-visible-source-check.json',
    title: 'Slice A visible source check',
    role: 'evaluator',
    tags: ['source', 'player-facing'],
  });
  for (const check of sourceCheck.checks) checks.push(check);

  const failed = checks.filter((check) => check.result !== 'PASS');
  console.log(
    JSON.stringify({
      status: failed.length ? 'failed' : 'done',
      summary: failed.length
        ? `${failed.length} Playwright verifier check(s) failed.`
        : 'Tests, build, Playwright clickthrough, screenshots, console check, and Slice A visible-source checks passed.',
      checks,
      artifacts,
      notes,
    }),
  );
  process.exit(failed.length ? 1 : 0);
} catch (error) {
  console.error(error?.stack || String(error));
  console.log(
    JSON.stringify({
      status: 'failed',
      summary: error?.message || String(error),
      checks,
      artifacts,
      notes,
    }),
  );
  process.exit(1);
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  return {
    status: result.status ?? 1,
    output: `${result.stdout || ''}${result.stderr || ''}`,
  };
}

async function smokeBrowserFlow() {
  const port = 5199;
  const url = `http://127.0.0.1:${port}/`;
  const server = spawn('npm', ['run', 'dev', '--', '--port', String(port), '--strictPort'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, BROWSER: 'none' },
  });
  let serverOutput = '';
  server.stdout.on('data', (chunk) => {
    serverOutput += chunk;
  });
  server.stderr.on('data', (chunk) => {
    serverOutput += chunk;
  });

  const consoleMessages = [];
  const jsErrors = [];
  const screenshots = [];
  const flow = [];
  const checks = [];
  let browser;

  try {
    await waitForHttp(url, 15000);
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    page.on('console', (message) => {
      consoleMessages.push({ type: message.type(), text: message.text() });
    });
    page.on('pageerror', (error) => {
      jsErrors.push(error.message);
    });

    await page.goto(url, { waitUntil: 'networkidle' });
    await expectVisible(page, 'Case Desk', checks, 'Initial Case Desk is visible');
    await expectVisible(page, 'Bekymringsmelding', checks, 'Initial concern document is visible');
    await expectVisible(page, 'Ring Grete', checks, 'Ring Grete action is visible');
    await capture(page, screenshots, flow, '01-case-desk-start', 'Case Desk start');

    await page.getByRole('button', { name: 'Ring Grete' }).click();
    await expectVisible(page, 'Frank på telefon', checks, 'Ring Grete opens Frank phone scene');
    await expectVisible(page, 'Telefonnotat', checks, 'Phone scene includes phone note');
    await expectVisible(
      page,
      'Legg rapporten på pulten',
      checks,
      'Phone scene exposes report action',
    );
    await capture(page, screenshots, flow, '02-frank-call', 'Frank call scene');

    await page.getByRole('button', { name: 'Legg rapporten på pulten' }).click();
    await expectVisible(
      page,
      'Frankrapport · Første kontakt',
      checks,
      'Report appears on desk after call',
    );
    await expectVisible(page, 'Be om kontoutskrift', checks, 'Financial statement action appears');
    await expectVisible(page, 'Avtal sosialt besøk', checks, 'Social visit action appears');
    await capture(page, screenshots, flow, '03-report-next-actions', 'Report and next actions');

    checks.push({
      claim: 'Playwright clickthrough has no browser console errors',
      result:
        consoleMessages.some((message) => message.type === 'error') || jsErrors.length
          ? 'FAIL'
          : 'PASS',
      evidence: ['artifacts/browser-flow.json'],
    });

    return {
      ok: checks.every((check) => check.result === 'PASS'),
      url,
      serverOutput,
      flow,
      screenshots,
      consoleMessages,
      jsErrors,
      checks,
    };
  } finally {
    if (browser) await browser.close();
    server.kill('SIGTERM');
  }
}

async function capture(page, screenshots, flow, id, title) {
  const path = `artifacts/${id}.png`;
  await page.screenshot({ path: join(artifactsDir, `${id}.png`), fullPage: true });
  const visibleText = normalizeWhitespace(await page.locator('body').innerText());
  screenshots.push({ path, title });
  flow.push({ id, title, visibleText });
}

async function expectVisible(page, text, checks, claim) {
  const locator = page.getByText(text, { exact: false }).first();
  const visible = await locator.isVisible().catch(() => false);
  checks.push({
    claim,
    result: visible ? 'PASS' : 'FAIL',
    evidence: ['artifacts/browser-flow.json'],
  });
}

async function waitForHttp(url, timeoutMs) {
  const started = Date.now();
  let lastError = null;
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      const text = await response.text();
      if (response.ok && text.includes('<div id="root"></div>')) return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw lastError || new Error(`Timed out waiting for ${url}`);
}

function checkVisibleSource() {
  const component = readFileSync('src/components/PhonePracticeLab.tsx', 'utf8').toLowerCase();
  const store = readFileSync('src/stores/RootStore.tsx', 'utf8').toLowerCase();
  const tests = readFileSync('src/engine/phoneResolver.test.ts', 'utf8').toLowerCase();
  const all = `${component}\n${store}\n${tests}`;
  const required = [
    'bekymringsmelding',
    'etabler kontakt med grete',
    'ring grete',
    'frank_call',
    'frankrapport',
    'første kontakt',
    'kontoutskrift',
    'sosialt besøk',
  ];
  const bannedVisible = [
    'rapporten gir ikke svar',
    'ikke løs elling',
    'hva spilleren lærer',
    'infrastrukturen',
  ];
  const checks = [
    ...required.map((term) => ({
      claim: `Slice A source contains ${term}`,
      result: all.includes(term) ? 'PASS' : 'FAIL',
      evidence: ['artifacts/slice-a-visible-source-check.json'],
    })),
    ...bannedVisible.map((term) => ({
      claim: `Visible/source text avoids ${term}`,
      result: component.includes(term) ? 'FAIL' : 'PASS',
      evidence: ['artifacts/slice-a-visible-source-check.json'],
    })),
  ];
  return { required, bannedVisible, checks };
}

function normalizeWhitespace(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function valueAfter(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : null;
}
