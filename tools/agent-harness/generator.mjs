#!/usr/bin/env node
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const runDir = process.argv[process.argv.indexOf('--run-dir') + 1];
const inputPath = process.argv[process.argv.indexOf('--input') + 1];
const input = JSON.parse(readFileSync(inputPath, 'utf8'));
const sprint = input.sprint ?? {};
const artifactDir = join(runDir, 'artifacts');
mkdirSync(artifactDir, { recursive: true });

const files = {
  component: 'src/components/PhonePracticeLab.tsx',
  store: 'src/stores/RootStore.tsx',
  evidence: 'src/content/evidenceDesk.ts',
  intake: 'src/content/intakeCase.ts',
  types: 'src/domain/types.ts',
  styles: 'src/styles.css',
};
const text = Object.fromEntries(
  Object.entries(files).map(([key, path]) => [key, existsSync(path) ? readFileSync(path, 'utf8') : '']),
);
const all = Object.values(text).join('\n').toLowerCase();
const sdd004 = [text.evidence, text.types, text.store, text.component].join('\n').toLowerCase();

const requirements = [
  [
    'three_document_scope',
    'The slice has exactly/clearly three target documents: clinical referral, economy record, rent warning.',
    all.includes('bekymringsmelding') &&
      (all.includes('kontoutskrift') || all.includes('bank')) &&
      (all.includes('husleievarsel') || all.includes('husleien er betalt sent') || all.includes('rent warning')),
  ],
  [
    'authored_evidence_anchors',
    'Documents contain authored liftable evidence anchors, not arbitrary freeform parsing.',
    all.includes('evidence') || all.includes('faktum') || all.includes('evidenceanchor') || all.includes('lift'),
  ],
  [
    'click_to_lift',
    'Interaction supports click-to-lift rather than requiring drag-selection.',
    all.includes('click') && (all.includes('lift') || all.includes('faktum') || all.includes('evidence')),
  ],
  [
    'delayed_affordance',
    'Uncollected evidence gets delayed subtle affordance, not immediate highlighter-yellow.',
    (all.includes('delay') || all.includes('timeout') || all.includes('forsink')) &&
      (all.includes('underline') || all.includes('understrek') || all.includes('margin')),
  ],
  [
    'collected_highlighter',
    'Collected phrases can become highlighter-yellow after lift.',
    all.includes('highlight') || all.includes('#fff8b0') || all.includes('highlighter') || all.includes('markert'),
  ],
  [
    'notification_fact_domain',
    'Fact notifications show fact + domain context before hypothesis threshold.',
    all.includes('faktum lagt til') && all.includes('økonomi/bolig'),
  ],
  [
    'hypothesis_threshold',
    'Arbeidshypotese: Grete bærer økonomien unlocks only after an economy/rent cluster threshold.',
    sdd004.includes('arbeidshypotese') &&
      sdd004.includes('grete bærer økonomien') &&
      sdd004.includes('threshold') &&
      (sdd004.includes('requiredfactids') || sdd004.includes('required facts')),
  ],
  [
    'separate_evidence_canvas',
    'Sakens fakta is a separate structured/read-only evidence canvas surface, not just a sidebar inventory.',
    all.includes('sakens fakta') &&
      (all.includes('canvas') || all.includes('evidence-canvas') || all.includes('evidence canvas')) &&
      (all.includes('readonly') || all.includes('read-only') || all.includes('strukturert')),
  ],
  [
    'discussable_hooks',
    'Facts/hypotheses can declare discussable_with character hooks without chat UI.',
    all.includes('discussable_with') || all.includes('discussablewith'),
  ],
  [
    'no_forbidden_scope',
    'Visible/source slice avoids consequence simulation, clocks, tiltak, right/wrong grading, and freeform graph editing.',
    !sdd004.includes('riktig svar') &&
      !sdd004.includes('wrong answer') &&
      !sdd004.includes('correct answer') &&
      !sdd004.includes('vedtak') &&
      !sdd004.includes('tiltak valgt') &&
      !sdd004.includes('freeform graph'),
  ],
];

const missing = requirements.filter(([, , pass]) => !pass).map(([id, text]) => ({ id, text }));
const briefPath = join(artifactDir, 'SDD-004-generator-requirements.md');
writeFileSync(
  briefPath,
  `# SDD-004 — Generator goals and verifiable requirements\n\nSprint: ${sprint.title ?? 'unknown'}\n\n## Player decision/feeling under test\n\n${sprint.playerDecisionUnderTest ?? 'Does this feel like building a municipal case file from ordinary documents?'}\n\n## Generator interpretation\n\nBuild the smallest player-facing evidence loop:\n\n\`\`\`text\nthree case documents → delayed authored evidence affordance → click-to-lift → yellow collected mark → fact/domain notification → structured Sakens fakta canvas → threshold-gated Arbeidshypotese\n\`\`\`\n\n## Verifiable requirements\n\n${requirements.map(([id, text, pass]) => `- [${pass ? 'x' : ' '}] **${id}** — ${text}`).join('\n')}\n\n## Missing before evaluator happiness\n\n${missing.length ? missing.map((item) => `- ${item.id}: ${item.text}`).join('\n') : '- None detected by source scan.'}\n\n## Generator stance\n\nIf missing items remain, build them before claiming PASS. Keep the slice narrow: no SDD-005/006 consequence feedback, no freeform canvas editor, no full chat.\n`,
  'utf8',
);

console.log(
  JSON.stringify({
    status: missing.length ? 'needs_source_work' : 'ready_for_evaluator',
    summary: missing.length
      ? `Generator requirements found ${missing.length} missing SDD-004 requirement(s).`
      : 'Generator requirements are satisfied by current source scan; evaluator should judge player-facing quality.',
    changedFiles: [],
    artifacts: [
      { kind: 'requirements', path: 'artifacts/SDD-004-generator-requirements.md' },
    ],
    notes: [
      'This role converts SDD-004 into player-facing goals and verifiable requirements.',
      'It does not run an autonomous coding agent; it is an advisory/deterministic harness role until executor integration exists.',
      ...missing.map((item) => `Missing: ${item.id}`),
    ],
  }),
);
