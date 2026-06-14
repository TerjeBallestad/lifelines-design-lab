#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const role = process.argv[2];
const inputPath = valueAfter('--input');
const runDir = valueAfter('--run-dir');
const input = inputPath ? JSON.parse(readFileSync(inputPath, 'utf8')) : {};
const phase = input.phase || 'planning';

try {
  // Live Codex is the default. Scripted role output is only allowed when the
  // harness explicitly marked the run as a dry run — a green live run must
  // mean a real agent did the work.
  if (input.dryRun === true) {
    const output = fallbackRole({ role, input });
    console.log(JSON.stringify(output));
    process.exit(0);
  }

  const live = runCodexLive({ role, input, runDir });
  if (!live) {
    console.error(
      `[role-codex] ${role} (${phase}): live Codex run failed and this is not a dry run — refusing to simulate output`,
    );
    process.exit(1);
  }
  console.log(JSON.stringify(live));
} catch (error) {
  console.error(error?.stack || String(error));
  process.exit(1);
}

function fallbackRole({ role, input }) {
  if (role === 'planner') return planner(input);
  if (role === 'generator') return generator(input);
  if (role === 'evaluator') return evaluator(input);
  throw new Error(`unsupported role: ${role}`);
}

function planner(input) {
  const goal = input.goal || 'Verify current Lifelines Design Lab slice through generic harness';
  return {
    sprints: [
      {
        id: 'slice-a-generic-harness-smoke',
        title: 'Verify current Slice A through generic agent-harness',
        goal: `${goal}\n\nUse this as an adapter smoke: prove the generic harness can negotiate a definition of done, run project verifiers, and expose the evidence without changing gameplay code.`,
        playerDecisionUnderTest:
          'Can the player move from bekymringsmelding to Ring Grete, witness Frank contact, receive Frankrapport · Første kontakt, and see the next casework actions?',
        touchSurface: [
          'harness.config.json',
          'tools/harness/**',
          'src/components/PhonePracticeLab.tsx',
          'src/stores/RootStore.tsx',
          'src/engine/phoneResolver.test.ts',
        ],
        nonGoals: [
          'Do not implement Slice B gameplay in the adapter smoke',
          'Do not introduce a fourth implementor role',
          'Do not let generator emit final verdicts',
          'Do not use project-specific logic inside the generic agent-harness package',
        ],
        acceptanceContract: [
          {
            kind: 'contract',
            mode: 'qualitative',
            claim:
              'Generator and evaluator agree on a concrete definition of done before implementation/review.',
          },
          {
            kind: 'test',
            mode: 'deterministic',
            claim: 'Project tests and build pass as verifier evidence.',
          },
          {
            kind: 'trace',
            mode: 'deterministic',
            claim:
              'Web UI smoke evidence confirms Slice A visible flow terms are present and the app serves locally.',
          },
          {
            kind: 'judge',
            mode: 'qualitative',
            claim:
              'Evaluator judges the artifact from player-facing Slice A readability, not code style.',
          },
        ],
        optional: false,
      },
    ],
  };
}

function generator(input) {
  if (phase === 'contract_proposal') {
    const revised = Boolean(input.previousEvaluator);
    const contract = {
      title: 'Slice A generic harness adapter definition of done',
      summary:
        'The adapter run is done when the generic harness shows an agreed contract, project-owned verifier evidence, and an evaluator judgment over the existing Slice A player flow.',
      deterministicChecks: [
        'npm test passes',
        'npm run build passes',
        'Local Vite web UI serves index.html',
        'Visible/source evidence contains bekymringsmelding, Ring Grete, Frankrapport, kontoutskrift, sosialt besøk, and avoids banned meta copy',
      ],
      qualitativeChecks: [
        'Slice A remains narrow: desk → Grete call → Frank report → next actions',
        'The report and next actions are game-world surfaces, not design explanation',
        'The harness report exposes what planner/generator/evaluator/verifier did',
      ],
      evidence: [
        'web-ui-smoke verifier',
        'report.html raw IO drilldown',
        'report.json normalized summary',
      ],
      nonGoalsAccepted: input.sprint?.nonGoals || [],
    };
    return {
      status: 'done',
      summary: revised
        ? 'Generator revised the definition of done around concrete verifier evidence and player-facing Slice A checks.'
        : 'Generator proposed a concrete Slice A harness-smoke definition of done.',
      changedFiles: [],
      artifacts: [],
      notes: [
        'Generator proposes the contract and later implements/checks against the agreed version, but does not emit verdicts.',
      ],
      contract,
    };
  }

  const artifact = writeArtifact(
    'generator-implementation.md',
    `# Generator implementation note\n\nNo gameplay code was changed in this adapter smoke. The implementation phase delegates evidence gathering to the configured project verifier and expects the evaluator to judge that evidence.\n\nAgreed contract:\n\n\`\`\`json\n${JSON.stringify(input.agreedContract || {}, null, 2)}\n\`\`\`\n`,
  );
  return {
    status: 'done',
    summary:
      'Implementation phase completed as an adapter smoke; verifier evidence will determine the result.',
    changedFiles: [],
    artifacts: [
      { kind: 'brief', path: artifact, title: 'Generator implementation note', role: 'generator' },
    ],
    notes: ['No source edits were needed for this smoke run.'],
  };
}

function evaluator(input) {
  if (phase === 'contract_review') {
    const contract = input.proposedContract || input.generator?.contract || {};
    const evidence = JSON.stringify(contract.evidence || []).toLowerCase();
    const checks = JSON.stringify(contract.deterministicChecks || []).toLowerCase();
    const hasVerifier =
      evidence.includes('web-ui-smoke') || evidence.includes('browser') || evidence.includes('web');
    const hasTests = checks.includes('npm test') && checks.includes('npm run build');
    if (!hasVerifier || !hasTests) {
      return {
        status: 'done',
        verdict: 'PIVOT',
        summary:
          'Contract is not concrete enough yet: it needs explicit project-owned verifier evidence plus tests/build.',
        issues: [
          {
            severity: 'major',
            issue: 'Missing verifier evidence',
            recommendation: 'Name web-ui-smoke/browser/Godot evidence explicitly.',
          },
          {
            severity: 'major',
            issue: 'Missing deterministic checks',
            recommendation: 'Include npm test and npm run build.',
          },
        ],
        artifacts: [],
        notes: [],
      };
    }
    return {
      status: 'done',
      verdict: 'PASS',
      summary: 'Evaluator agrees the contract is narrow, verifiable, and player-facing.',
      agreedContract: contract,
      issues: [],
      artifacts: [],
      notes: ['Contract accepted before implementation.'],
    };
  }

  const verifiers = input.verifiers || [];
  const failing = verifiers.filter((verifier) => verifier.status !== 'done' || verifier.code !== 0);
  const failedChecks = verifiers
    .flatMap((verifier) => verifier.checks || [])
    .filter((check) => check.result !== 'PASS');
  const pass = failing.length === 0 && failedChecks.length === 0 && verifiers.length > 0;
  return {
    status: 'done',
    verdict: pass ? 'PASS' : 'PIVOT',
    summary: pass
      ? 'Evaluator passes the adapter smoke: verifier evidence supports the current Slice A player flow and the run is inspectable.'
      : 'Evaluator pivots: verifier evidence is missing or contains failing checks.',
    issues: pass
      ? []
      : [
          ...failing.map((verifier) => ({
            severity: 'critical',
            issue: `${verifier.id} did not complete`,
            recommendation: verifier.summary,
          })),
          ...failedChecks.map((check) => ({
            severity: 'major',
            issue: check.claim || check.id,
            recommendation: check.summary || 'Fix verifier check.',
          })),
        ],
    artifacts: [
      {
        kind: 'review',
        path: writeArtifact('evaluator-review.md', evaluatorReviewMarkdown({ pass, verifiers })),
        title: 'Evaluator user-perspective review',
        role: 'evaluator',
      },
    ],
    notes: [
      'Evaluator judged verifier evidence from player-facing Slice A readability, not implementation style.',
    ],
    judgments: [
      {
        claim:
          'The generic harness run is inspectable enough to see contract, verifier evidence, and final judgment.',
        result: pass ? 'PASS' : 'PIVOT',
        confidence: pass ? 'high' : 'medium',
        reasoning: pass
          ? 'report.html/report.json and raw role IO are produced by the generic harness.'
          : 'Verifier evidence did not fully support the claim.',
        evidence: verifiers.flatMap((verifier) =>
          (verifier.artifacts || []).map((artifact) => artifact.path),
        ),
      },
      {
        claim:
          'Current Slice A remains a player-facing casework loop rather than meta explanation.',
        result: pass ? 'PASS' : 'PIVOT',
        confidence: 'medium',
        reasoning: pass
          ? 'Verifier checks passed for required terms and banned meta phrases.'
          : 'One or more UI/source checks failed.',
        evidence: verifiers.flatMap((verifier) =>
          (verifier.artifacts || []).map((artifact) => artifact.path),
        ),
      },
    ],
  };
}

function evaluatorReviewMarkdown({ pass, verifiers }) {
  return `# Evaluator review\n\nVerdict: ${pass ? 'PASS' : 'PIVOT'}\n\n## Verifier evidence\n\n${verifiers
    .map(
      (verifier) =>
        `- **${verifier.id}**: ${verifier.status} / exit ${verifier.code} — ${verifier.summary}`,
    )
    .join('\n')}\n\n## Checks\n\n${verifiers
    .flatMap((verifier) => verifier.checks || [])
    .map((check) => `- [${check.result === 'PASS' ? 'x' : ' '}] ${check.claim || check.id}`)
    .join('\n')}\n`;
}

function runCodexLive({ role, input, runDir }) {
  const artifactsDir = join(runDir || '.harness', 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  const promptPath = join(artifactsDir, `${role}-${phase}-codex-prompt.md`);
  const outputPath = join(artifactsDir, `${role}-${phase}-codex-output.json`);
  const schemaPath = join(artifactsDir, `${role}-${phase}-schema.json`);
  writeFileSync(promptPath, buildCodexPrompt({ role, input }), 'utf8');
  writeFileSync(schemaPath, JSON.stringify(schemaForRole(role), null, 2), 'utf8');
  const result = spawnSync(
    'codex',
    [
      'exec',
      '--sandbox',
      'workspace-write',
      '--output-schema',
      schemaPath,
      '--output-last-message',
      outputPath,
      '-',
    ],
    {
      input: readFileSync(promptPath, 'utf8'),
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    },
  );
  writeFileSync(
    join(artifactsDir, `${role}-${phase}-codex-stdout.txt`),
    result.stdout || '',
    'utf8',
  );
  writeFileSync(
    join(artifactsDir, `${role}-${phase}-codex-stderr.txt`),
    result.stderr || '',
    'utf8',
  );
  if (result.status !== 0 || !existsSync(outputPath)) return null;
  try {
    return JSON.parse(readFileSync(outputPath, 'utf8'));
  } catch {
    return null;
  }
}

function buildCodexPrompt({ role, input }) {
  return `You are the ${role} role in the Lifelines Design Lab agent-harness run.\n\nReturn ONLY JSON matching the role schema.\n\nRules:\n- Keep the first slice narrow.\n- Generator may propose/revise contract and implement, but must never emit verdict.\n- Evaluator must judge from player/user perspective and may PASS/PIVOT/REJECT.\n- Do not tell the player what to feel; prefer visible game-world evidence.\n- Treat project verifiers as part of the implementation surface when the agreed contract changes player-facing evidence.\n- The generator MAY update project-owned verifier files such as tools/harness/web-ui-smoke.mjs when the existing verifier encodes stale behavior or cannot observe the agreed contract.\n- Verifier edits must be narrow: update/add checks for the agreed player-facing evidence, do not weaken unrelated checks, do not delete failing checks without replacing them, and document the verifier change in changedFiles/notes.\n- If a verifier appears stale but the generator cannot safely update it, say so explicitly and return INFRA_FAIL/PIVOT-worthy evidence rather than building against a known-bad gate.\n- During contract proposal, the generator must directly answer every previous evaluator issue with a named deterministic check or artifact. If an issue is not worth blocking implementation, say why and make it an evaluator review note rather than leaving it vague.\n- During contract review, the evaluator should PIVOT only for claims that are unsafe, untestable, or likely to waste an implementation attempt. Do not halt on polish to the contract if the missing evidence can be produced during implementation and reviewed afterward.\n\nInput:\n\n${JSON.stringify(input, null, 2)}\n`;
}

function schemaForRole(role) {
  if (role === 'planner') {
    return {
      type: 'object',
      additionalProperties: true,
      required: ['sprints'],
      properties: { sprints: { type: 'array' } },
    };
  }
  if (role === 'generator') {
    return {
      type: 'object',
      additionalProperties: true,
      required: ['status', 'summary'],
      properties: {
        status: { type: 'string' },
        summary: { type: 'string' },
        changedFiles: { type: 'array' },
        artifacts: { type: 'array' },
        notes: { type: 'array' },
        contract: { type: 'object' },
      },
    };
  }
  return {
    type: 'object',
    additionalProperties: true,
    required: ['status', 'verdict', 'summary'],
    properties: {
      status: { type: 'string' },
      verdict: { type: 'string' },
      summary: { type: 'string' },
      issues: { type: 'array' },
      artifacts: { type: 'array' },
      notes: { type: 'array' },
      judgments: { type: 'array' },
      agreedContract: { type: 'object' },
    },
  };
}

function writeArtifact(name, content) {
  const artifactsDir = join(runDir || '.harness', 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  const path = join(artifactsDir, name);
  writeFileSync(path, content, 'utf8');
  return `artifacts/${name}`;
}

function valueAfter(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : null;
}
