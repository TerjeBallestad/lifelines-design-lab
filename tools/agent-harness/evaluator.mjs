#!/usr/bin/env node
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const runDir = process.argv[process.argv.indexOf('--run-dir') + 1];
const inputPath = process.argv[process.argv.indexOf('--input') + 1];
const input = JSON.parse(readFileSync(inputPath, 'utf8'));
const artifactDir = join(runDir, 'artifacts');
mkdirSync(artifactDir, { recursive: true });

const component = existsSync('src/components/PhonePracticeLab.tsx')
  ? readFileSync('src/components/PhonePracticeLab.tsx', 'utf8')
  : '';
const store = existsSync('src/stores/RootStore.tsx')
  ? readFileSync('src/stores/RootStore.tsx', 'utf8')
  : '';
const tests = existsSync('src/engine/phoneResolver.test.ts')
  ? readFileSync('src/engine/phoneResolver.test.ts', 'utf8')
  : '';
const all = `${component}\n${store}\n${tests}`.toLowerCase();
const visibleComponent = component.toLowerCase();

const checks = [
  {
    id: 'desk_has_concern',
    question: 'Does the player begin with a concrete bekymringsmelding and a single first goal?',
    pass: all.includes('bekymringsmelding') && all.includes('etabler kontakt med grete'),
    revise:
      'Opening does not clearly establish the concern report as the action source. The player needs one document, one goal, one first action.',
  },
  {
    id: 'call_is_scene',
    question: 'Does Ring Grete become a distinct Frank phone scene instead of an instant tab jump?',
    pass:
      all.includes('frank_call') &&
      (all.includes('telefonsamtale') ||
        all.includes('phone scene') ||
        all.includes('frank på telefon')),
    revise:
      'The Grete call is still too mechanical. The player must witness Frank making contact before receiving the report.',
  },
  {
    id: 'conversation_obscured',
    question: 'Is the conversation obscured rather than turned into exposition transcript?',
    pass:
      all.includes('boble') ||
      all.includes('symbol') ||
      all.includes('obskur') ||
      all.includes('…'),
    revise:
      'The call risks becoming exposition. Use bubbles/symbols/fragments and let Frank report carry interpretation afterward.',
  },
  {
    id: 'report_spawns',
    question: 'Does the call create Frankrapport · Første kontakt back at the desk?',
    pass: all.includes('frankrapport') && all.includes('første kontakt'),
    revise:
      'The report is the payoff of the first casework action. Without it, the loop has no desk consequence.',
  },
  {
    id: 'next_actions_unlock',
    question: 'Does the report unlock the next player decisions?',
    pass: all.includes('be om kontoutskrift') && all.includes('avtal sosialt besøk'),
    revise:
      'The player needs at least two visible next actions after the report: financial request and social visit.',
  },
  {
    id: 'grete_contact_content',
    question:
      'Does the call/report show concrete contact facts instead of explaining Grete as a design role?',
    pass:
      (all.includes('grete svarte') || all.includes('grete tar telefonen')) &&
      all.includes('elling kom ikke til telefonen'),
    revise:
      'Use in-world facts: Grete answered, Grete led the call, Elling did not come to the phone. Do not explain the design role to the player.',
  },
  {
    id: 'no_meta_player_explanation',
    question: 'Does visible copy avoid telling the player what to conclude or feel?',
    pass:
      !visibleComponent.includes('hva spilleren lærer') &&
      !visibleComponent.includes('rapporten gir ikke svar') &&
      !visibleComponent.includes('ikke løs elling') &&
      !visibleComponent.includes('finn inngangen') &&
      !visibleComponent.includes('infrastrukturen'),
    revise:
      'Visible copy should only lay out game-world content: documents, actions, reports, objects, people, costs, dates. Remove meta lines that describe the intended experience.',
  },
  {
    id: 'tests_guard_flow',
    question: 'Do tests guard the staged flow/source terms?',
    pass:
      tests.toLowerCase().includes('frank_call') &&
      tests.toLowerCase().includes('frankrapport') &&
      tests.toLowerCase().includes('kontoutskrift'),
    revise:
      'The source may work visually, but the staged Slice A contract is not test-protected enough.',
  },
];

const failures = checks.filter((check) => !check.pass);
const critiquePath = join(artifactDir, 'SDD-002-slice-a-user-perspective-review.md');
writeFileSync(
  critiquePath,
  `# SDD-002 Slice A — Evaluator user-perspective review\n\n## Evaluator stance\n\nThis is not a code review. The question is whether the first player-facing casework loop lands.\n\n## Checks\n\n${checks.map((check) => `- [${check.pass ? 'x' : ' '}] **${check.id}** — ${check.question}${check.pass ? '' : `\n  - REVISE: ${check.revise}`}`).join('\n')}\n\n## Verdict rationale\n\n${failures.length ? `REVISE/PIVOT. ${failures.length} user-facing requirement(s) fail. The player would not yet experience the intended casework loop.` : 'PASS. The source scan indicates the player can move from concern report to Frank call scene to first report and new casework decisions. Manual/browser taste review is still recommended before calling the slice truly done.'}\n`,
  'utf8',
);

console.log(
  JSON.stringify({
    status: 'done',
    verdict: failures.length ? 'PIVOT' : 'PASS',
    summary: failures.length
      ? `User-perspective evaluator found ${failures.length} Slice A issue(s).`
      : 'User-perspective evaluator passes Slice A source contract; next gate is browser/taste smoke.',
    issues: failures.map((check) => ({ id: check.id, issue: check.revise })),
    artifacts: [
      {
        kind: 'user-perspective-review',
        path: 'artifacts/SDD-002-slice-a-user-perspective-review.md',
      },
    ],
    notes: [
      'Evaluator emphasizes player comprehension/feeling over code structure.',
      'A PASS here is source-contract PASS, not a substitute for seeing the UI in browser.',
    ],
  }),
);
