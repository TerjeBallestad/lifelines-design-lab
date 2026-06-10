#!/usr/bin/env node
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const runDir = process.argv[process.argv.indexOf('--run-dir') + 1];
const inputPath = process.argv[process.argv.indexOf('--input') + 1];
const input = JSON.parse(readFileSync(inputPath, 'utf8'));
const artifactDir = join(runDir, 'artifacts');
mkdirSync(artifactDir, { recursive: true });

const paths = [
  'src/components/PhonePracticeLab.tsx',
  'src/stores/RootStore.tsx',
  'src/content/evidenceDesk.ts',
  'src/content/intakeCase.ts',
  'src/domain/types.ts',
  'src/styles.css',
];
const all = paths.map((path) => (existsSync(path) ? readFileSync(path, 'utf8') : '')).join('\n');
const lower = all.toLowerCase();

const checks = [
  {
    id: 'municipal_case_file_feeling',
    question: 'Does the loop feel like building a municipal case file from ordinary documents?',
    pass: lower.includes('sakens fakta') && lower.includes('arbeidshypotese') && lower.includes('bekymringsmelding'),
    revise:
      'The visible/source contract does not yet make case-file formation central. The player needs documents, captured facts, and a provisional case note.',
  },
  {
    id: 'not_loot_highlights',
    question: 'Are answers not immediately pre-highlighted before the player acts?',
    pass:
      (lower.includes('delay') || lower.includes('timeout') || lower.includes('forsink')) &&
      !(lower.includes('pre-highlight') || lower.includes('always highlighted')),
    revise:
      'The evidence affordance risks hidden-object looting or highlighted homework. Use delayed subtle affordance before highlighter-yellow collected state.',
  },
  {
    id: 'notification_not_interruption',
    question: 'Does notification capture evidence without forcing a modal interruption?',
    pass: lower.includes('faktum lagt til') && (lower.includes('toast') || lower.includes('notification')),
    revise:
      'Fact capture needs a satisfying notification/toast and must not auto-open the evidence canvas.',
  },
  {
    id: 'canvas_worth_opening',
    question: 'Is Sakens fakta a separate structured evidence canvas worth opening, not just an inventory list?',
    pass:
      lower.includes('sakens fakta') &&
      (lower.includes('canvas') || lower.includes('evidence-canvas')) &&
      (lower.includes('bygg') || lower.includes('backed_by') || lower.includes('bygger på')),
    revise:
      'The evidence board risks being a generic inventory. It should show facts grouped by domain/question and the working hypothesis with backing evidence.',
  },
  {
    id: 'hypothesis_earned',
    question: 'Does Arbeidshypotese: Grete bærer økonomien feel earned from rent/economy facts?',
    pass:
      lower.includes('grete bærer økonomien') &&
      lower.includes('grete betaler husleien') &&
      lower.includes('husleien er betalt sent') &&
      lower.includes('threshold'),
    revise:
      'The hypothesis must not appear as a designer conclusion. Gate it behind the economy/rent fact cluster.',
  },
  {
    id: 'provisional_not_correct_answer',
    question: 'Does the player understand the hypothesis is provisional rather than a correct-answer stamp?',
    pass:
      lower.includes('foreløpig') &&
      !lower.includes('correct') &&
      !lower.includes('riktig svar') &&
      !lower.includes('wrong answer'),
    revise:
      'Case reasoning should not be graded. Mark the hypothesis as Foreløpig and leave consequence judgement to later SDDs.',
  },
  {
    id: 'scope_guard',
    question: 'Does the slice avoid SDD-005/006 systems and freeform tooling?',
    pass:
      !lower.includes('apartment consequence') &&
      !lower.includes('clock movement') &&
      !lower.includes('tiltak consequence') &&
      !lower.includes('drag node') &&
      !lower.includes('freeform canvas'),
    revise:
      'Scope drift detected. SDD-004 should stop at evidence capture, structured canvas, and provisional hypothesis formation.',
  },
  {
    id: 'wireframe_style_reference',
    question: 'Does the implementation preserve the old wireframe visual/content style?',
    pass:
      lower.includes('case_session_spike_v3') ||
      lower.includes('helsrapport') ||
      lower.includes('helserapport') ||
      lower.includes('#fff8b0') ||
      lower.includes('stamp'),
    revise:
      'Use the old wireframe for paper texture, stamps, restrained Norwegian document registers, and highlighter-yellow collected state.',
  },
];

const failures = checks.filter((check) => !check.pass);
const critiquePath = join(artifactDir, 'SDD-004-user-perspective-review.md');
writeFileSync(
  critiquePath,
  `# SDD-004 — Evaluator user-perspective review\n\n## Evaluator stance\n\nThis is not a code review. The question is whether the desk evidence loop feels like municipal casework rather than clue looting.\n\n## Checks\n\n${checks.map((check) => `- [${check.pass ? 'x' : ' '}] **${check.id}** — ${check.question}${check.pass ? '' : `\n  - REVISE: ${check.revise}`}`).join('\n')}\n\n## Verdict rationale\n\n${failures.length ? `PIVOT. ${failures.length} user-facing requirement(s) fail or are not yet implemented. This is expected before source work; use these failures as the build checklist.` : 'PASS. Source scan suggests the SDD-004 player-facing contract is present. Still run browser/playtest review before calling the slice done.'}\n`,
  'utf8',
);

console.log(
  JSON.stringify({
    status: 'done',
    verdict: failures.length ? 'PIVOT' : 'PASS',
    summary: failures.length
      ? `User-perspective evaluator found ${failures.length} SDD-004 issue(s).`
      : 'User-perspective evaluator passes SDD-004 source contract; next gate is browser/taste smoke.',
    issues: failures.map((check) => ({ id: check.id, issue: check.revise })),
    artifacts: [
      {
        kind: 'user-perspective-review',
        path: 'artifacts/SDD-004-user-perspective-review.md',
      },
    ],
    notes: [
      'Evaluator emphasizes player comprehension/feeling over code structure.',
      'A PASS here is source-contract PASS, not a substitute for seeing the UI in browser.',
    ],
  }),
);
