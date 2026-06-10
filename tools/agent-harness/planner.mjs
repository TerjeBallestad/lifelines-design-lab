#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const inputFlag = process.argv.indexOf('--input');
const input = inputFlag >= 0 ? JSON.parse(readFileSync(process.argv[inputFlag + 1], 'utf8')) : {};
const sddPath = join(process.cwd(), '.pm/data/designs/SDD-004.md');
const planPath = join(process.cwd(), '.pm/data/plans/PLAN-002.json');
const sdd = existsSync(sddPath) ? readFileSync(sddPath, 'utf8') : '';
const plan = existsSync(planPath) ? readFileSync(planPath, 'utf8') : '';
const goal = input.goal ?? 'SDD-004 Desk Evidence Loop';
const processMode = input.process?.mode ?? input.mode ?? 'deliver';

const sdd004Contract = [
  'Three documents only: Dr. Haug/clinical referral frame, economy record, rent warning/late-payment document.',
  'Use case_session_spike_v3.html as visual/content reference: paper texture, stamps, restrained Norwegian case-document tone, highlighter-yellow after lift.',
  'Click-to-lift authored evidence anchors; delayed subtle underline/margin affordance before lift; no pre-highlighted answers.',
  'Fact notifications show fact + domain before threshold; hypothesis notification only after threshold.',
  'Sakens fakta is a separate Blake Manor-like structured/read-only evidence canvas, not a sidebar or freeform editor.',
  'One authored cluster unlocks Arbeidshypotese: Grete bærer økonomien only after economy/rent facts earn it.',
  'No SDD-005/006 consequence simulation, clocks, tiltak, right/wrong grading, or freeform chat UI.',
];

console.log(
  JSON.stringify({
    sprints: [
      {
        id: 'SDD-004-desk-evidence-loop',
        title: 'Desk Evidence Loop: three documents to one working hypothesis',
        goal: `${goal}\n\nProcess mode: ${processMode}. Deliver a player-facing slice, not architecture hardening.\n\nSDD-004 present: ${sdd.includes('Desk Evidence Loop')}. PLAN-002 present: ${plan.includes('SDD-004 Desk Evidence Loop')}.`,
        playerDecisionUnderTest:
          'Does the player feel they are building a municipal case file from ordinary documents, rather than looting highlighted clues or being graded right/wrong?',
        touchSurface: [
          'src/content/intakeCase.ts',
          'src/domain/types.ts',
          'src/stores/RootStore.tsx',
          'src/components/PhonePracticeLab.tsx',
          'src/styles.css',
        ],
        referenceSurface: [
          '/Users/godstemning/dev/lifelines-core-loop/wireframes/case_session_spike_v3.html#SAKSDOKUMENTER',
        ],
        nonGoals: [
          'No full freeform evidence canvas or draggable node editor',
          'No Åpne spørsmål implementation',
          'No vedtak/tiltak or apartment consequence simulation',
          'No clock consequences',
          'No right/wrong grading of interpretations',
          'No broad Frank/client chat UI; only discussable_with hooks',
          'No five-document case expansion',
        ],
        acceptanceContract: sdd004Contract.map((claim, index) => ({
          kind: index < 2 ? 'content-style' : index < 5 ? 'player-flow' : 'taste',
          claim,
        })).concat([
          {
            kind: 'test',
            claim:
              'Tests/smoke checks verify click-to-lift, notification, threshold-gated hypothesis unlock, and structured evidence canvas content.',
          },
        ]),
        optional: false,
      },
    ],
  }),
);
