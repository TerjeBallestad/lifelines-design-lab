#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync, spawn } from 'node:child_process';
import { chromium } from 'playwright';

const runDir = valueAfter('--run-dir') || '.harness/runs/UNKNOWN';
const sprintId = valueAfter('--sprint') || 'all';
const artifactsDir = join(runDir, 'artifacts');
mkdirSync(artifactsDir, { recursive: true });

const checks = [];
const artifacts = [];
const notes = [];
const requestFinancialOverviewAction = 'Be Grete finne fram økonomisk oversikt';
const blueprintTestFiles = [
  'src/engine/phoneResolver.test.ts',
  'src/engine/blueprint/blueprintEngine.test.ts',
  'src/components/blueprint/BlueprintLab.test.tsx',
];

try {
  const testResult = run('npx', ['vitest', 'run', ...blueprintTestFiles]);
  writeFileSync(join(artifactsDir, 'npm-test.txt'), testResult.output, 'utf8');
  artifacts.push({
    kind: 'log',
    path: 'artifacts/npm-test.txt',
    title: `Scoped Blueprint test output (${sprintId})`,
    role: 'system',
    tags: ['deterministic', 'scoped-tests', 'blueprint'],
  });
  checks.push({
    claim: 'Scoped Blueprint tests pass',
    result: testResult.status === 0 ? 'PASS' : 'FAIL',
    evidence: ['artifacts/npm-test.txt'],
  });
  notes.push(`Ran scoped Blueprint tests: ${blueprintTestFiles.join(', ')}`);

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
  const result = {
    status: failed.length ? 'failed' : 'done',
    summary: failed.length
      ? `${failed.length} verifier check(s) failed.`
      : 'Scoped Blueprint tests, build, Playwright clickthrough, screenshots, console check, and Slice A visible-source checks passed.',
    checks,
    artifacts,
    notes,
  };
  writeFileSync(
    join(artifactsDir, 'web-ui-smoke-result.json'),
    JSON.stringify(result, null, 2) + '\n',
    'utf8',
  );
  const compactArtifacts = [
    {
      kind: 'trace',
      path: 'artifacts/web-ui-smoke-result.json',
      title: 'Full web-ui-smoke verifier result',
    },
    ...artifacts.filter((artifact) => artifact.kind !== 'screenshot').slice(0, 8),
  ];
  console.log(
    JSON.stringify({
      status: result.status,
      summary: result.summary,
      checksTotal: checks.length,
      checksFailed: failed.length,
      checks: checks.filter((check) => check.result !== 'PASS').slice(0, 10),
      artifacts: compactArtifacts,
      notes,
    }),
  );
  process.exit(failed.length ? 1 : 0);
} catch (error) {
  console.error(error?.stack || String(error));
  const result = {
    status: 'failed',
    summary: error?.message || String(error),
    checks,
    artifacts,
    notes,
  };
  try {
    writeFileSync(
      join(artifactsDir, 'web-ui-smoke-result.json'),
      JSON.stringify(result, null, 2) + '\n',
      'utf8',
    );
  } catch {}
  console.log(
    JSON.stringify({
      status: result.status,
      summary: result.summary,
      checksTotal: checks.length,
      checksFailed: checks.filter((check) => check.result !== 'PASS').length,
      checks: checks.filter((check) => check.result !== 'PASS').slice(0, 10),
      artifacts: [
        {
          kind: 'trace',
          path: 'artifacts/web-ui-smoke-result.json',
          title: 'Full web-ui-smoke verifier result',
        },
        ...artifacts.filter((artifact) => artifact.kind !== 'screenshot').slice(0, 8),
      ],
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
    await enterPhonePracticeSurface(page);
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
    await expectVisible(
      page,
      'Grete har sagt ja til et kort sosialt besøk',
      checks,
      'Social visit is scheduled by the Grete call',
    );
    await expectVisible(
      page,
      'Gjennomfør sosialt besøk',
      checks,
      'Social visit can be performed after the call report',
    );
    await capture(page, screenshots, flow, '03-report-next-actions', 'Report and next actions');

    await page.getByRole('button', { name: 'Gjennomfør sosialt besøk' }).click();
    await expectVisible(
      page,
      'Sosialt besøk hos Grete',
      checks,
      'Social visit opens apartment reveal',
    );
    await expectVisible(page, 'kaffe og kopper', checks, 'Visit shows Grete coffee scene');
    await expectVisible(page, 'post under avisen', checks, 'Visit shows apartment mail clue');
    await capture(
      page,
      screenshots,
      flow,
      '07-social-visit-apartment',
      'Social visit apartment reveal',
    );

    await page.getByRole('button', { name: /post under avisen/ }).click();
    await expectVisible(
      page,
      'Du legger merke til',
      checks,
      'Player marks a concrete room detail before Frank interprets it',
    );
    await capture(page, screenshots, flow, '08-noticed-post', 'Player notices post in room');

    await page.getByRole('button', { name: 'Skriv besøksnotat' }).click();
    await expectVisible(
      page,
      'Besøksnotat: Gretes rolle i saken',
      checks,
      'Social visit returns a desk report',
    );
    await expectVisible(
      page,
      'Hvis Grete dør',
      checks,
      'Visit report states the apartment survival risk',
    );
    await capture(page, screenshots, flow, '09-visit-report', 'Social visit report');

    await page.getByRole('button', { name: /Hva betyr posten under avisen/ }).click();
    await expectVisible(
      page,
      'Frank svarer',
      checks,
      'Frank gives a canned interpretation for the noticed detail',
    );
    await expectVisible(
      page,
      'Bevis fra leiligheten',
      checks,
      'Frank interpretation turns the room notice into desk evidence',
    );
    await expectVisible(
      page,
      'Uåpnet post peker mot økonomi',
      checks,
      'Post pressure becomes evidence chip',
    );
    await expectVisible(
      page,
      'Nytt sakssteg',
      checks,
      'One interpreted room clue unlocks one changed desk decision',
    );
    await capture(
      page,
      screenshots,
      flow,
      '10-frank-post-clue-decision',
      'Frank clue unlocks decision',
    );

    await page.getByRole('button', { name: 'Ny dag' }).click();
    await expectVisible(page, 'Handlinger 2/2', checks, 'New day restores capacity');
    await page.getByRole('button', { name: requestFinancialOverviewAction }).click();
    await expectVisible(
      page,
      'Økonomisk oversikt bedt om',
      checks,
      'Financial request schedules next-day document',
    );
    await expectVisible(page, 'Handlinger 1/2', checks, 'Financial request spends one day action');
    await capture(page, screenshots, flow, '04-finance-requested', 'Financial overview requested');

    await page.getByRole('button', { name: 'Ny dag' }).click();
    await expectVisible(
      page,
      'Dokument: Økonomisk oversikt',
      checks,
      'Next day resolves financial overview document',
    );
    await expectVisible(
      page,
      'Ellings uføretrygd kommer inn',
      checks,
      'Financial document gives concrete case evidence',
    );
    await expectVisible(page, 'Handlinger 2/2', checks, 'Next day restores day actions');
    await capture(page, screenshots, flow, '05-finance-document', 'Financial overview document');

    await page.getByRole('button', { name: 'Foreslå praktisk avlastning' }).click();
    await expectVisible(
      page,
      'praktisk avlastningsgrep',
      checks,
      'Desk decision writes practical relief to case log',
    );
    await capture(
      page,
      screenshots,
      flow,
      '11-practical-relief-decision',
      'Practical relief decision',
    );

    checks.push({
      claim: 'Playwright clickthrough has no browser console errors',
      result:
        consoleMessages.some((message) => message.type === 'error') || jsErrors.length
          ? 'FAIL'
          : 'PASS',
      evidence: ['artifacts/browser-flow.json'],
    });

    const blueprint = await smokeBlueprintFlow(browser, url, screenshots, flow);
    checks.push(...blueprint.checks);

    const mobile = await smokeMobileViewport(browser, url, screenshots, flow);
    checks.push(...mobile.checks);

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

// Fullscreen overlays (e.g. the blueprint prologue) intercept pointer events
// and block navigation. Advance through them by clicking their primary button
// until the overlay is gone; bounded so a sticky overlay cannot hang the run.
async function dismissBlockingOverlays(page) {
  for (let i = 0; i < 12; i += 1) {
    const overlay = page.locator('div.fixed.inset-0').first();
    if (!(await overlay.isVisible().catch(() => false))) return;
    const button = overlay.getByRole('button').first();
    if (!(await button.isVisible().catch(() => false))) return;
    await button.click({ timeout: 2000 }).catch(() => {});
    await page.waitForTimeout(250);
  }
}

// The app may boot into a surface selector shell. The Slice A flow lives in
// the Phone Practice Lab; navigate there when a shell is present, no-op when
// the desk is already the landing surface.
async function enterPhonePracticeSurface(page) {
  await dismissBlockingOverlays(page);
  const desk = page.getByText('Case Desk', { exact: false }).first();
  if (await desk.isVisible().catch(() => false)) return;
  for (const name of [/phone practice/i, /case desk/i, /slice a/i]) {
    const button = page.getByRole('button', { name }).first();
    if (await button.isVisible().catch(() => false)) {
      await button.click({ timeout: 5000 });
      await page.waitForTimeout(300);
      return;
    }
  }
}

// Browser evidence for the Blueprint v1 loop itself: prologue → desk →
// document reader → SDD-004 fact lifting → open question → hypothesis →
// Frank dispatch → day advance → new document. Interaction names mirror
// src/components/blueprint/BlueprintLab.test.tsx.
async function smokeBlueprintFlow(browser, url, screenshots, flow) {
  const checks = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const jsErrors = [];
  page.on('pageerror', (error) => jsErrors.push(error.message));
  const button = (name) => page.getByRole('button', { name, disabled: false }).first();
  const tab = (text) => page.locator('button.blueprint-tab', { hasText: text }).first();

  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    await expectVisible(page, 'LEGESENTERET', checks, 'Blueprint prologue is the landing surface');
    await capture(page, screenshots, flow, 'bp-01-prologue', 'Blueprint prologue');
    await button(/Hopp over/).click();
    await expectVisible(
      page,
      'Én melding. Én pult. Begynn der.',
      checks,
      'Prologue skip lands on the desk',
    );
    await capture(page, screenshots, flow, 'bp-02-desk', 'Blueprint desk');

    await button(/Legesenteret/).click();
    await expectVisible(
      page,
      'Gul markering vises først etter',
      checks,
      'Document reader explains the lift affordance',
    );

    // SDD-004 evidence contract: no yellow before lift, collected mark after.
    const evidence = page.locator('[data-testid="blueprint-evidence-f_grete_baerer"]');
    const before = await evidence.getAttribute('class');
    checks.push({
      claim: 'SDD-004: evidence anchor has no collected mark before lifting',
      result: before && !before.includes('collected') ? 'PASS' : 'FAIL',
      evidence: ['artifacts/bp-03-reader.png'],
    });
    const beforeLabel = await evidence.getAttribute('aria-label');
    checks.push({
      claim: 'SDD-004: evidence anchor advertises the lift affordance before lifting',
      result: beforeLabel?.startsWith('Løft faktum') ? 'PASS' : 'FAIL',
      evidence: ['artifacts/bp-03-reader.png'],
    });
    await evidence.hover();
    const hoverCursor = await evidence.evaluate((el) => getComputedStyle(el).cursor);
    checks.push({
      claim: 'SDD-004: evidence anchor shows a pointer affordance on hover',
      result: hoverCursor === 'pointer' ? 'PASS' : 'FAIL',
      evidence: ['artifacts/bp-03b-hover.png'],
    });
    await capture(page, screenshots, flow, 'bp-03b-hover', 'Evidence anchor hover affordance');
    await evidence.focus();
    const focused = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
    checks.push({
      claim: 'SDD-004: evidence anchor is keyboard-focusable (focus affordance)',
      result: focused === 'blueprint-evidence-f_grete_baerer' ? 'PASS' : 'FAIL',
      evidence: ['artifacts/bp-03-reader.png'],
    });
    await capture(page, screenshots, flow, 'bp-03-reader', 'Document reader before lift');
    await evidence.click();
    const after = await evidence.getAttribute('class');
    const pressed = await evidence.getAttribute('aria-pressed');
    checks.push({
      claim: 'SDD-004: lifted fact gains the collected (yellow) mark and pressed state',
      result: after?.includes('collected') && pressed === 'true' ? 'PASS' : 'FAIL',
      evidence: ['artifacts/bp-04-lifted.png'],
    });
    await expectVisible(page, 'FAKTUM LAGT TIL', checks, 'Lifting a fact gives visible feedback');
    await capture(page, screenshots, flow, 'bp-04-lifted', 'Fact lifted with collected mark');

    for (const factId of ['f_saarbar', 'f_aldri_alene', 'f_ingen_tjenester']) {
      await page.locator(`[data-testid="blueprint-evidence-${factId}"]`).dispatchEvent('click');
    }
    await button(/Lukk/).click();

    await tab('Sakens fakta').click();
    await expectVisible(
      page,
      'Grete bistår med gjøremål',
      checks,
      'Sakens fakta shows the lifted fact',
    );
    await capture(page, screenshots, flow, 'bp-05-sakens-fakta', 'Sakens fakta after lifting');

    // Frank dispatches produce next-day documents whose facts unlock the
    // payment-chain question — same order as BlueprintLab.test.tsx.
    await tab('Frank').click();
    await page.locator('[data-testid="blueprint-dispatch-d_ring_grete"]').click({ force: true });
    await page.locator('[data-testid="blueprint-dispatch-d_konto"]').click({ force: true });
    await button(/Neste dag/).click();
    await expectVisible(page, 'DAG 2', checks, 'Day advance moves the blueprint to day 2');
    await page.locator('[data-testid="blueprint-dispatch-d_besok"]').click({ force: true });
    await button(/Neste dag/).click();
    await tab('Pulten').click();
    await expectVisible(
      page,
      'husholdets økonomi',
      checks,
      'Dispatch produces a new document the next day',
    );
    await capture(
      page,
      screenshots,
      flow,
      'bp-06-day3-desk',
      'Desk after dispatches and day advances',
    );

    await button(/husholdets økonomi/).click();
    for (const factId of ['f_trygd', 'f_husleie', 'f_alt_via_grete', 'f_gap', 'f_ingen_matkjop']) {
      await page.locator(`[data-testid="blueprint-evidence-${factId}"]`).dispatchEvent('click');
    }
    await button(/Lukk/).click();
    await button(/hjemmebesøk/).click();
    for (const factId of ['f_post', 'f_kalender', 'f_matbokser', 'f_bok', 'f_avstand']) {
      await page.locator(`[data-testid="blueprint-evidence-${factId}"]`).dispatchEvent('click');
    }
    await button(/Lukk/).click();

    await tab('Åpne spørsmål').click();
    await button(/Grete bærer betalingskjeden/).dispatchEvent('click');
    await button(/Grete er usynlig infrastruktur/).dispatchEvent('click');
    await button(/Konsentrasjonen er sterk/).dispatchEvent('click');
    await expectVisible(
      page,
      'Arbeidshypotese',
      checks,
      'Choosing a hypothesis records an Arbeidshypotese',
    );
    await capture(
      page,
      screenshots,
      flow,
      'bp-07-hypothesis',
      'Open question with chosen hypothesis',
    );

    // Back half of the loop: vedtak → Frank chat → scripted Grete beats →
    // reflection, mirroring BlueprintLab.test.tsx through day 8.
    await tab('Vedtak og tiltak').click();
    for (const name of [
      /Frivillig forvaltning/,
      /Hjemmehjelp 2x uke/,
      /Åpne ett brev/,
      /Institusjonsvurdering/,
    ]) {
      await button(name).dispatchEvent('click');
    }
    await button(/Fatt vedtak/).dispatchEvent('click');
    await expectVisible(
      page,
      'Vedtak 1 · tiltakspakke',
      checks,
      'Enacted vedtak lands as a re-readable paper on the desk',
    );
    await button(/Vedtak 1 · tiltakspakke/).click();
    await expectVisible(
      page,
      'Arbeidshypotese lagt til grunn',
      checks,
      'Generated VEDTAK paper records the hypothesis basis',
    );
    await expectVisible(
      page,
      'IVERKSATT',
      checks,
      'Generated VEDTAK paper carries the enacted stamp',
    );
    await capture(page, screenshots, flow, 'bp-08-vedtak-paper', 'Generated VEDTAK paper');
    await button(/Lukk/).click();

    await tab('Frank').click();
    await button(/Posten i gangen/).dispatchEvent('click');
    await expectVisible(page, 'FRANK', checks, 'Frank chat answers a grounded question');

    await button(/Neste dag/).dispatchEvent('click');
    await expectVisible(
      page,
      'Grete er innlagt',
      checks,
      'Scripted beat: Grete admitted to hospital',
    );
    await button(/Neste dag/).dispatchEvent('click');
    await expectVisible(page, 'Grete Olsen er død', checks, 'Scripted beat: Grete dies');
    await capture(page, screenshots, flow, 'bp-09-grete-beat', 'Grete scripted beat');
    await button(/Neste dag/).dispatchEvent('click');
    await tab('Pulten').click();
    await expectVisible(
      page,
      'Brev fra huseieren',
      checks,
      'New consequence document arrives after the beat',
    );
    await button(/Neste dag/).dispatchEvent('click');
    await button(/Neste dag/).dispatchEvent('click');
    await expectVisible(
      page,
      'Dag 8 · saken fortsetter',
      checks,
      'Loop reaches the day-8 reflection state',
    );
    await expectVisible(
      page,
      'Frank · status dag 8',
      checks,
      'Reflection includes the Frank status',
    );
    await capture(page, screenshots, flow, 'bp-10-reflection', 'Day 8 reflection');

    checks.push({
      claim: 'Blueprint flow throws no page errors',
      result: jsErrors.length ? 'FAIL' : 'PASS',
      evidence: ['artifacts/bp-10-reflection.png'],
    });
    return { checks };
  } finally {
    await page.close();
  }
}

// Real 390px-viewport evidence for the SDD mobile criterion: play the first
// blueprint path (document → lift facts → hypothesis → day advance) at
// actual mobile width, not jsdom window.innerWidth.
async function smokeMobileViewport(browser, url, screenshots, flow) {
  const checks = [];
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const jsErrors = [];
  page.on('pageerror', (error) => jsErrors.push(error.message));
  const button = (name) => page.getByRole('button', { name, disabled: false }).first();
  const tab = (text) => page.locator('button.blueprint-tab', { hasText: text }).first();

  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      bodyFontPx: parseFloat(getComputedStyle(document.body).fontSize || '0'),
    }));
    checks.push({
      claim: 'Mobile 390px viewport has no horizontal overflow',
      result: metrics.scrollWidth <= metrics.clientWidth + 2 ? 'PASS' : 'FAIL',
      evidence: ['artifacts/mobile-390-landing.png'],
    });
    checks.push({
      claim: 'Mobile 390px base text is at least 12px',
      result: metrics.bodyFontPx >= 12 ? 'PASS' : 'FAIL',
      evidence: ['artifacts/mobile-390-landing.png'],
    });
    await capture(page, screenshots, flow, 'mobile-390-landing', 'Mobile 390px landing surface');

    await button(/Hopp over/).click();
    await button(/Legesenteret/).click();
    await capture(page, screenshots, flow, 'mobile-390-reader', 'Mobile 390px document reader');
    for (const factId of ['f_grete_baerer', 'f_saarbar', 'f_aldri_alene']) {
      await page.locator(`[data-testid="blueprint-evidence-${factId}"]`).dispatchEvent('click');
    }
    checks.push({
      claim: 'Mobile 390px: facts can be lifted by tap',
      result: 'PASS',
      evidence: ['artifacts/mobile-390-reader.png'],
    });
    await button(/Lukk/).click();

    await tab('Åpne spørsmål').click();
    await expectVisible(page, 'Hva bærer Grete', checks, 'Mobile 390px shows the open question');
    await button(/Ferdighetene er der ikke/).dispatchEvent('click');
    await expectVisible(page, 'Arbeidshypotese', checks, 'Mobile 390px hypothesis selection works');
    await capture(
      page,
      screenshots,
      flow,
      'mobile-390-hypothesis',
      'Mobile 390px hypothesis chosen',
    );

    await button(/Neste dag/).click();
    await expectVisible(page, 'DAG 2', checks, 'Mobile 390px day advance reaches day 2');
    await capture(page, screenshots, flow, 'mobile-390-day2', 'Mobile 390px after day advance');

    checks.push({
      claim: 'Mobile 390px blueprint path throws no page errors',
      result: jsErrors.length ? 'FAIL' : 'PASS',
      evidence: ['artifacts/mobile-390-day2.png'],
    });
    return { checks };
  } finally {
    await page.close();
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
  const frankQuestions = readFileSync('src/content/frankQuestions.ts', 'utf8').toLowerCase();
  const intakeCase = readFileSync('src/content/intakeCase.ts', 'utf8').toLowerCase();
  const all = `${component}\n${store}\n${tests}\n${frankQuestions}\n${intakeCase}`;
  const required = [
    'bekymringsmelding',
    'etabler kontakt med grete',
    'ring grete',
    'frank_call',
    'frankrapport',
    'første kontakt',
    'økonomisk oversikt',
    'økonomisk oversikt bedt om',
    'ellings uføretrygd kommer inn',
    'sosialt besøk',
    'sosialt besøk hos grete',
    'kaffe og kopper',
    'post under avisen',
    'besøksnotat',
    'du legger merke til',
    'hva betyr posten under avisen',
    'må legges merke til i rommet først',
    'hvis grete dør',
    'hverdagsferdigheter',
    'gretes håp dekker over risikoen',
    'bevis fra leiligheten',
    'nytt sakssteg',
    'praktisk avlastningsgrep',
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
