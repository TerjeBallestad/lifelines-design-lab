#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync, spawn } from 'node:child_process';

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

  const served = await smokeServe();
  writeFileSync(
    join(artifactsDir, 'web-ui-smoke.json'),
    JSON.stringify(served, null, 2) + '\n',
    'utf8',
  );
  artifacts.push({
    kind: 'trace',
    path: 'artifacts/web-ui-smoke.json',
    title: 'Web UI smoke trace',
    role: 'evaluator',
    tags: ['web', 'interactive-ui'],
  });
  checks.push({
    claim: 'Vite web UI serves index.html locally',
    result: served.ok ? 'PASS' : 'FAIL',
    evidence: ['artifacts/web-ui-smoke.json'],
  });

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
        ? `${failed.length} web UI smoke check(s) failed.`
        : 'Tests, build, local web serving, and Slice A visible-source checks passed.',
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

async function smokeServe() {
  const port = 5199;
  const server = spawn('npm', ['run', 'dev', '--', '--port', String(port), '--strictPort'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, BROWSER: 'none' },
  });
  let output = '';
  server.stdout.on('data', (chunk) => {
    output += chunk;
  });
  server.stderr.on('data', (chunk) => {
    output += chunk;
  });
  try {
    const response = await waitForHttp(`http://127.0.0.1:${port}/`, 15000);
    return {
      ok: response.ok && response.text.includes('<div id="root"></div>'),
      status: response.status,
      hasRoot: response.text.includes('<div id="root"></div>'),
      serverOutput: output,
    };
  } finally {
    server.kill('SIGTERM');
  }
}

async function waitForHttp(url, timeoutMs) {
  const started = Date.now();
  let lastError = null;
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      const text = await response.text();
      return { ok: response.ok, status: response.status, text };
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

function valueAfter(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : null;
}
