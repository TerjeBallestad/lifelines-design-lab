#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
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
    title: 'Blueprint v1 browser playthrough trace',
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
    join(artifactsDir, 'blueprint-source-check.json'),
    JSON.stringify(sourceCheck, null, 2) + '\n',
    'utf8',
  );
  artifacts.push({
    kind: 'trace',
    path: 'artifacts/blueprint-source-check.json',
    title: 'Blueprint typed source check',
    role: 'evaluator',
    tags: ['source', 'blueprint'],
  });
  for (const check of sourceCheck.checks) checks.push(check);

  const failed = checks.filter((check) => check.result !== 'PASS');
  console.log(
    JSON.stringify({
      status: failed.length ? 'failed' : 'done',
      summary: failed.length
        ? `${failed.length} Blueprint verifier check(s) failed.`
        : 'Tests, build, Blueprint browser playthrough, mobile trace, evidence contract, screenshots, and source checks passed.',
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
  const url = prepareStaticSmokeApp();

  const consoleMessages = [];
  const jsErrors = [];
  const screenshots = [];
  const flow = [];
  const localChecks = [];
  let browser;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--single-process', '--allow-file-access-from-files'],
    });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    attachErrorCapture(page, consoleMessages, jsErrors);

    await page.goto(url, { waitUntil: 'networkidle' });
    await expectVisible(page, 'DR. HAUG', localChecks, 'Prologue is visible before play starts');
    await capture(page, screenshots, flow, '01-blueprint-prologue', 'Blueprint prologue', {
      viewport: { width: 1440, height: 1100 },
      milestone: 'prologue',
    });

    await clickButton(page, 'Hopp over');
    await expectVisible(page, 'Sak 99/0412', localChecks, 'Case desk is visible after prologue');
    await expectVisible(
      page,
      'Legesenteret · Dr. J. Haug',
      localChecks,
      'Initial desk document is visible',
    );
    await capture(page, screenshots, flow, '02-blueprint-desk', 'Desk with first document', {
      viewport: { width: 1440, height: 1100 },
      milestone: 'desk',
    });

    await openDocument(page, 'Legesenteret · Dr. J. Haug');
    await expectVisible(
      page,
      'Gul markering vises først etter',
      localChecks,
      'Document reader explains evidence lifting',
    );
    await verifyEvidenceContract(page, localChecks);
    await clickEvidence(page, 'f_saarbar');
    await clickEvidence(page, 'f_aldri_alene');
    await clickEvidence(page, 'f_ingen_tjenester');
    await closeDocument(page);
    await capture(page, screenshots, flow, '03-blueprint-evidence-lifted', 'Evidence lifted', {
      viewport: { width: 1440, height: 1100 },
      milestone: 'document-reader-and-evidence',
    });

    await clickTab(page, 'Sakens fakta');
    await expectVisible(page, 'Grete bistår', localChecks, 'Lifted fact appears in Sakens fakta');
    await expectVisible(
      page,
      'Elling vurderes som sårbar',
      localChecks,
      'Second lifted fact appears in Sakens fakta',
    );
    await capture(page, screenshots, flow, '04-blueprint-facts', 'Sakens fakta', {
      viewport: { width: 1440, height: 1100 },
      milestone: 'facts-board',
    });

    await clickTab(page, 'Åpne spørsmål');
    await expectVisible(page, 'Hva bærer Grete', localChecks, 'Open question is visible');
    await clickButton(page, 'Ferdighetene er der ikke');
    await expectVisible(
      page,
      'Arbeidshypotese · foreløpig',
      localChecks,
      'Arbeidshypotese selection is recorded',
    );
    await capture(page, screenshots, flow, '05-blueprint-question', 'Question and hypothesis', {
      viewport: { width: 1440, height: 1100 },
      milestone: 'questions-and-hypothesis',
    });

    await runFrankDocumentLoop(page, localChecks, screenshots, flow);
    await selectCaseHypotheses(page, localChecks, screenshots, flow);
    await draftAndEnactTiltak(page, localChecks, screenshots, flow);
    await askFrankAndAdvanceDays(page, localChecks, screenshots, flow);
    await verifyPhonePracticeReachable(page, localChecks, screenshots, flow);
    await verifyMobileFlow(page, url, localChecks, screenshots, flow);

    localChecks.push({
      claim: 'Playwright clickthrough has no browser console errors',
      result:
        consoleMessages.some((message) => message.type === 'error') || jsErrors.length
          ? 'FAIL'
          : 'PASS',
      evidence: ['artifacts/browser-flow.json'],
    });

    return {
      ok: localChecks.every((check) => check.result === 'PASS'),
      url,
      serverOutput:
        'Loaded the built Vite app from a file URL to avoid dev-server bind permissions.',
      flow,
      screenshots,
      consoleMessages,
      jsErrors,
      checks: localChecks,
    };
  } finally {
    if (browser) await browser.close();
  }
}

async function runFrankDocumentLoop(page, localChecks, screenshots, flow) {
  await clickTab(page, 'Frank');
  await expectVisible(page, 'Send Frank', localChecks, 'Frank dispatch board is visible');
  await clickButton(page, 'Ring Grete');
  await expectVisible(
    page,
    'Frank · telefonsamtale med Grete',
    localChecks,
    'Ring Grete creates a Frank phone document',
  );
  await clickButton(page, 'Be om økonomisk oversikt');
  await expectVisible(
    page,
    'FRANK ER I GANG',
    localChecks,
    'Financial overview dispatch is queued',
  );
  await clickButton(page, 'Neste dag');
  await expectVisible(page, 'DAG 2', localChecks, 'Advancing day shows day notice');
  await clickButton(page, 'Avtal hjemmebesøk');
  await clickButton(page, 'Neste dag');
  await expectVisible(
    page,
    'Frank · hjemmebesøk Gabels gate 14',
    localChecks,
    'Home visit report arrives after day advance',
  );
  await capture(page, screenshots, flow, '06-blueprint-frank-dispatch', 'Frank dispatches', {
    viewport: { width: 1440, height: 1100 },
    milestone: 'frank-dispatch-and-day-advance',
  });

  await clickTab(page, 'Pulten');
  await openDocument(page, 'Frank · telefonsamtale med Grete');
  for (const factId of ['f_klarer_seg', 'f_ingen_plan', 'f_elling_tlf', 'f_grete_redd']) {
    await clickEvidence(page, factId);
  }
  await closeDocument(page);

  await openDocument(page, 'Frank · husholdets økonomi');
  for (const factId of ['f_trygd', 'f_husleie', 'f_alt_via_grete', 'f_ingen_matkjop', 'f_gap']) {
    await clickEvidence(page, factId);
  }
  await closeDocument(page);

  await openDocument(page, 'Frank · hjemmebesøk Gabels gate 14');
  for (const factId of [
    'f_post',
    'f_kalender',
    'f_matbokser',
    'f_bok',
    'f_utklipp',
    'f_avstand',
    'f_smart_gutt',
  ]) {
    await clickEvidence(page, factId);
  }
  await closeDocument(page);
  await capture(page, screenshots, flow, '07-blueprint-new-documents', 'New documents and facts', {
    viewport: { width: 1440, height: 1100 },
    milestone: 'new-documents-and-log-changes',
  });
}

async function selectCaseHypotheses(page, localChecks, screenshots, flow) {
  await clickTab(page, 'Åpne spørsmål');
  for (const hypothesis of [
    'Grete bærer betalingskjeden.',
    'Grete er usynlig infrastruktur',
    'Konsentrasjonen er sterk',
    'Telefonen er stengt kanal',
  ]) {
    await clickButton(page, hypothesis);
  }
  await expectVisible(page, 'Gir grunnlag for', localChecks, 'Hypotheses expose available tiltak');
  await capture(page, screenshots, flow, '08-blueprint-hypotheses', 'Multiple work hypotheses', {
    viewport: { width: 1440, height: 1100 },
    milestone: 'hypothesis-availability',
  });
}

async function draftAndEnactTiltak(page, localChecks, screenshots, flow) {
  await clickTab(page, 'Vedtak og tiltak');
  await expectVisible(page, 'Tre slots pluss presskort', localChecks, 'Vedtak shows three slots');
  await expectVisible(
    page,
    'Press: alltid tilgjengelig',
    localChecks,
    'Vedtak shows pressure slot',
  );
  for (const tiltak of [
    'Frivillig forvaltning',
    'Hjemmehjelp 2x uke',
    'Åpne ett brev',
    'Institusjonsvurdering',
  ]) {
    await clickButton(page, tiltak);
  }
  await expectVisible(page, 'Fatt vedtak (4)', localChecks, 'Four tiltak are drafted');
  await capture(page, screenshots, flow, '09-blueprint-vedtak-draft', 'Drafted vedtak', {
    viewport: { width: 1440, height: 1100 },
    milestone: 'vedtak-three-slots-plus-pressure',
  });

  await clickButton(page, 'Fatt vedtak');
  await expectVisible(
    page,
    'Logg · det kommunen vet',
    localChecks,
    'Enacting tiltak moves to apartment log',
  );
  await capture(
    page,
    screenshots,
    flow,
    '10-blueprint-apartment-log',
    'Apartment log after vedtak',
    {
      viewport: { width: 1440, height: 1100 },
      milestone: 'mocked-sim-log',
    },
  );
}

async function askFrankAndAdvanceDays(page, localChecks, screenshots, flow) {
  await clickTab(page, 'Frank');
  await clickButton(page, 'Posten i gangen');
  await expectVisible(page, 'Frank svarer', localChecks, 'Frank chat answer is visible');
  await capture(page, screenshots, flow, '11-blueprint-frank-chat', 'Frank chat', {
    viewport: { width: 1440, height: 1100 },
    milestone: 'frank-chat',
  });

  await clickButton(page, 'Neste dag');
  await expectVisible(page, 'Grete er innlagt', localChecks, 'Grete unavailable beat appears');
  await capture(page, screenshots, flow, '12-blueprint-grete-unavailable', 'Grete unavailable', {
    viewport: { width: 1440, height: 1100 },
    milestone: 'grete-unavailable',
  });

  await clickButton(page, 'Neste dag');
  await expectVisible(page, 'Grete Olsen er død', localChecks, 'Grete death beat appears');
  await capture(page, screenshots, flow, '13-blueprint-grete-death', 'Grete death beat', {
    viewport: { width: 1440, height: 1100 },
    milestone: 'grete-death',
  });

  await clickButton(page, 'Neste dag');
  await clickTab(page, 'Pulten');
  await expectVisible(page, 'Brev fra huseieren', localChecks, 'New landlord document arrives');
  await capture(
    page,
    screenshots,
    flow,
    '14-blueprint-landlord-document',
    'New document after time',
    {
      viewport: { width: 1440, height: 1100 },
      milestone: 'new-document-after-day-advance',
    },
  );

  await clickButton(page, 'Neste dag');
  await clickButton(page, 'Neste dag');
  await expectVisible(page, 'Dag 8 · saken fortsetter', localChecks, 'Final reflection is visible');
  await expectVisible(page, 'Frank · status dag 8', localChecks, 'Final status document exists');
  await capture(page, screenshots, flow, '15-blueprint-reflection', 'Final status and reflection', {
    viewport: { width: 1440, height: 1100 },
    milestone: 'final-reflection',
  });
}

async function verifyPhonePracticeReachable(page, localChecks, screenshots, flow) {
  await clickButton(page, 'Se på saken');
  await page.getByText('Dag 8 · saken fortsetter', { exact: false }).waitFor({
    state: 'hidden',
    timeout: 5000,
  });
  await clickButton(page, 'Phone Practice Lab');
  await expectVisible(
    page,
    'Phone Practice',
    localChecks,
    'PhonePracticeLab remains reachable from app shell',
  );
  await capture(
    page,
    screenshots,
    flow,
    '16-phone-practice-reachable',
    'Phone Practice reachable',
    {
      viewport: { width: 1440, height: 1100 },
      milestone: 'phone-practice-reachability',
    },
  );
}

async function verifyMobileFlow(page, url, localChecks, screenshots, flow) {
  await page.setViewportSize({ width: 390, height: 920 });
  await page.goto(url, { waitUntil: 'networkidle' });
  await clickButton(page, 'Hopp over');
  await openDocument(page, 'Legesenteret · Dr. J. Haug');
  await clickEvidence(page, 'f_grete_baerer');
  await dismissNotices(page);
  await clickEvidence(page, 'f_saarbar');
  await dismissNotices(page);
  await clickEvidence(page, 'f_aldri_alene');
  await dismissNotices(page);
  await closeDocument(page);
  await clickTab(page, 'Åpne spørsmål');
  await expectVisible(page, 'Hva bærer Grete', localChecks, '390px mobile shows a question');
  await clickButton(page, 'Ferdighetene er der ikke');
  await expectVisible(
    page,
    'Arbeidshypotese · foreløpig',
    localChecks,
    '390px mobile can select a hypothesis',
  );
  await clickButton(page, 'Neste dag');
  await expectVisible(page, 'DAG 2', localChecks, '390px mobile can advance a day');
  await capture(page, screenshots, flow, '17-mobile-390-playability', '390px mobile playability', {
    viewport: { width: 390, height: 920 },
    milestone: 'mobile-390',
  });
}

async function verifyEvidenceContract(page, localChecks) {
  const evidence = page.locator('[data-testid="blueprint-evidence-f_grete_baerer"]');
  const before = await evidence.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      className: element.className,
      ariaPressed: element.getAttribute('aria-pressed'),
      backgroundColor: style.backgroundColor,
      borderBottomStyle: style.borderBottomStyle,
      cursor: style.cursor,
    };
  });

  await evidence.hover();
  const hover = await evidence.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      backgroundColor: style.backgroundColor,
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
    };
  });

  await evidence.focus();
  const focus = await evidence.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      backgroundColor: style.backgroundColor,
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
    };
  });

  await clickEvidence(page, 'f_grete_baerer');
  const after = await evidence.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      className: element.className,
      ariaPressed: element.getAttribute('aria-pressed'),
      backgroundColor: style.backgroundColor,
      borderBottomColor: style.borderBottomColor,
      cursor: style.cursor,
    };
  });

  const yellowBefore = isCollectedYellow(before.backgroundColor);
  const yellowAfter = isCollectedYellow(after.backgroundColor);
  localChecks.push({
    claim: 'SDD-004 evidence text is not yellow before lift',
    result: !yellowBefore && before.ariaPressed === 'false' ? 'PASS' : 'FAIL',
    evidence: ['artifacts/browser-flow.json'],
    observed: before,
  });
  localChecks.push({
    claim: 'SDD-004 evidence has hover/focus/touch affordance before lift',
    result:
      before.cursor === 'pointer' &&
      before.borderBottomStyle === 'dotted' &&
      hover.backgroundColor !== before.backgroundColor &&
      focus.outlineStyle !== 'none' &&
      focus.outlineWidth !== '0px'
        ? 'PASS'
        : 'FAIL',
    evidence: ['artifacts/browser-flow.json'],
    observed: { before, hover, focus },
  });
  localChecks.push({
    claim: 'SDD-004 click lifts fact and collected mark appears only after lift',
    result:
      after.ariaPressed === 'true' && after.className.includes('collected') && yellowAfter
        ? 'PASS'
        : 'FAIL',
    evidence: ['artifacts/browser-flow.json'],
    observed: after,
  });
}

async function capture(page, screenshots, flow, id, title, metadata = {}) {
  const path = `artifacts/${id}.png`;
  await page.screenshot({ path: join(artifactsDir, `${id}.png`), fullPage: true });
  const visibleText = normalizeWhitespace(await page.locator('body').innerText());
  screenshots.push({ path, title });
  flow.push({
    id,
    title,
    visibleText,
    url: page.url(),
    viewport: page.viewportSize(),
    ...metadata,
  });
}

async function expectVisible(page, text, targetChecks, claim) {
  const locator = page.getByText(text, { exact: false }).first();
  const visible = await locator.isVisible().catch(() => false);
  targetChecks.push({
    claim,
    result: visible ? 'PASS' : 'FAIL',
    evidence: ['artifacts/browser-flow.json'],
  });
}

async function clickButton(page, name) {
  await page.getByRole('button', { name, exact: false }).first().click();
}

async function clickTab(page, name) {
  await page.getByRole('button', { name, exact: false }).first().click();
}

async function openDocument(page, title) {
  await clickButton(page, title);
  await page.getByText('Gul markering vises først etter', { exact: false }).waitFor({
    state: 'visible',
    timeout: 5000,
  });
}

async function closeDocument(page) {
  await page.getByRole('button', { name: 'Lukk', exact: true }).click();
}

async function clickEvidence(page, factId) {
  await page.locator(`[data-testid="blueprint-evidence-${factId}"]`).click();
}

async function dismissNotices(page) {
  const notices = page.locator('.blueprint-toast');
  const count = await notices.count();
  for (let index = 0; index < count; index += 1) {
    await notices
      .first()
      .click({ timeout: 1000 })
      .catch(() => undefined);
  }
}

function attachErrorCapture(page, consoleMessages, jsErrors) {
  page.on('console', (message) => {
    consoleMessages.push({ type: message.type(), text: message.text() });
  });
  page.on('pageerror', (error) => {
    jsErrors.push(error.message);
  });
}

function prepareStaticSmokeApp() {
  const html = readFileSync('dist/index.html', 'utf8')
    .replaceAll('"/assets/', '"./assets/')
    .replaceAll("'/assets/", "'./assets/");
  const smokeIndex = resolve('dist/blueprint-smoke-index.html');
  writeFileSync(smokeIndex, html, 'utf8');
  return pathToFileURL(smokeIndex).href;
}

function checkVisibleSource() {
  const component = readFileSync('src/components/blueprint/BlueprintLab.tsx', 'utf8');
  const store = readFileSync('src/stores/BlueprintStore.tsx', 'utf8');
  const engine = readFileSync('src/engine/blueprint/blueprintEngine.ts', 'utf8');
  const content = readFileSync('src/content/blueprint/index.ts', 'utf8');
  const app = readFileSync('src/App.tsx', 'utf8');
  const all = `${component}\n${store}\n${engine}\n${content}\n${app}`.toLowerCase();
  const required = [
    'prologue',
    'sakens fakta',
    'åpne spørsmål',
    'arbeidshypotese',
    'tre slots pluss presskort',
    'ring grete',
    'grete er innlagt',
    'grete olsen er død',
    'dag 8',
    'phone practice lab',
    'blueprint-evidence',
    'blueprintstore',
    'liftblueprintfact',
    'runblueprintdispatch',
  ];
  const banned = ['domparser', 'blueprint_v1.html'];
  const checks = [
    ...required.map((term) => ({
      claim: `Blueprint source contains ${term}`,
      result: all.includes(term) ? 'PASS' : 'FAIL',
      evidence: ['artifacts/blueprint-source-check.json'],
    })),
    ...banned.map((term) => ({
      claim: `Blueprint source avoids runtime prototype parsing term ${term}`,
      result: all.includes(term) ? 'FAIL' : 'PASS',
      evidence: ['artifacts/blueprint-source-check.json'],
    })),
  ];
  return { required, banned, checks };
}

function isCollectedYellow(color) {
  return color === 'rgb(255, 248, 176)' || color === 'rgba(255, 248, 176, 1)';
}

function normalizeWhitespace(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function valueAfter(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : null;
}
