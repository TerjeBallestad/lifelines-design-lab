#!/usr/bin/env node
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const runDir = process.argv[process.argv.indexOf('--run-dir') + 1];
const inputPath = process.argv[process.argv.indexOf('--input') + 1];
const input = JSON.parse(readFileSync(inputPath, 'utf8'));
const sprint = input.sprint ?? {};
const artifactDir = join(runDir, 'artifacts');
mkdirSync(artifactDir, { recursive: true });

const componentPath = 'src/components/PhonePracticeLab.tsx';
const storePath = 'src/stores/RootStore.tsx';
const testPath = 'src/engine/phoneResolver.test.ts';
const source = existsSync(componentPath) ? readFileSync(componentPath, 'utf8').toLowerCase() : '';
const store = existsSync(storePath) ? readFileSync(storePath, 'utf8').toLowerCase() : '';

const requirements = [
  [
    'desk_start',
    'Start at Case Desk with Bekymringsmelding and Etabler kontakt med Grete.',
    source.includes('bekymringsmelding') && source.includes('etabler kontakt med grete'),
  ],
  [
    'distinct_call_scene',
    'Ring Grete enters a distinct Frank phone scene rather than jumping straight to Apartment.',
    store.includes('frank_call') ||
      source.includes('frank phone') ||
      source.includes('telefonsamtale'),
  ],
  [
    'obscured_contact',
    'The phone scene uses obscured bubbles/symbols/fragments, not a transcript.',
    source.includes('obskur') ||
      source.includes('symbol') ||
      source.includes('boble') ||
      source.includes('…'),
  ],
  [
    'first_report',
    'Completing the scene creates Frankrapport · Første kontakt.',
    source.includes('frankrapport') && source.includes('første kontakt'),
  ],
  [
    'next_actions',
    'Report unlocks Be om kontoutskrift and Avtal sosialt besøk.',
    source.includes('kontoutskrift') && source.includes('sosialt besøk'),
  ],
  [
    'grete_contact_content',
    'The call/report shows concrete contact facts: Grete answers or leads the conversation, and Elling does not come to the phone.',
    (source.includes('grete svarte') || source.includes('grete tar telefonen')) &&
      source.includes('elling kom ikke til telefonen'),
  ],
  [
    'no_meta_player_explanation',
    'Visible copy avoids meta-describing the intended player conclusion or experience.',
    !source.includes('hva spilleren lærer') &&
      !source.includes('rapporten gir ikke svar') &&
      !source.includes('ikke løs elling') &&
      !source.includes('finn inngangen') &&
      !source.includes('infrastrukturen'),
  ],
];

const missing = requirements.filter(([, , pass]) => !pass).map(([id, text]) => ({ id, text }));
const briefPath = join(artifactDir, 'SDD-002-slice-a-generator-requirements.md');
writeFileSync(
  briefPath,
  `# SDD-002 Slice A — Generator goals and verifiable requirements\n\nSprint: ${sprint.title ?? 'unknown'}\n\n## Player decision under test\n\n${sprint.playerDecisionUnderTest ?? 'Does the first casework action produce a report and next decision?'}\n\n## Generator interpretation\n\nThe build should not optimize for architecture first. It should create a playable player-facing seam:\n\n\`\`\`text\nBekymringsmelding → click Frank → Ring Grete → obscured Frank phone scene → Frankrapport · Første kontakt → next casework actions\n\`\`\`\n\n## Verifiable requirements\n\n${requirements.map(([id, text, pass]) => `- [${pass ? 'x' : ' '}] **${id}** — ${text}`).join('\n')}\n\n## Missing before evaluator happiness\n\n${missing.length ? missing.map((item) => `- ${item.id}: ${item.text}`).join('\n') : '- None detected by source scan.'}\n\n## Generator stance\n\nIf missing items remain, build them before claiming PASS. Keep the first slice narrow: no resources resolution, no day advance, no apartment social visit.\n`,
  'utf8',
);

console.log(
  JSON.stringify({
    status: missing.length ? 'needs_source_work' : 'ready_for_evaluator',
    summary: missing.length
      ? `Generator requirements found ${missing.length} missing Slice A requirement(s).`
      : 'Generator requirements are satisfied by current source scan; evaluator should judge user-facing quality.',
    changedFiles: [],
    artifacts: [
      { kind: 'requirements', path: 'artifacts/SDD-002-slice-a-generator-requirements.md' },
    ],
    notes: [
      'This role now converts the SDD slice into player-facing goals and verifiable requirements.',
      'It still does not run an autonomous coding agent; source edits are applied outside the role until the harness supports agent executors.',
      ...missing.map((item) => `Missing: ${item.id}`),
    ],
  }),
);
