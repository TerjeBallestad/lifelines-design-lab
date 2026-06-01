#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const inputFlag = process.argv.indexOf('--input');
const input = inputFlag >= 0 ? JSON.parse(readFileSync(process.argv[inputFlag + 1], 'utf8')) : {};

console.log(
  JSON.stringify({
    sprints: [
      {
        id: 'SB-004-005',
        title: 'Phone training as staged Citizen Sleeper clock with complication clock',
        goal: `Turn the phone practice side of the lab into the actual Elling/Frank ring-ring arc for: ${input.goal ?? 'design-lab phone clock'}`,
        touchSurface: [
          'src/content/phonePractice.ts',
          'src/components/PhonePracticeLab.tsx',
          'src/stores/RootStore.tsx',
          'src/engine/phoneResolver.test.ts',
        ],
        nonGoals: [
          'No full Roottrees desk rewrite',
          'No graph editor',
          'No generic RPG skill tree',
          'No final production art direction',
        ],
        acceptanceContract: [
          {
            kind: 'test',
            claim:
              'The visible source names the ring-ring ladder: dummy practice, pickup/blurt/hangup, real call while Frank is present, next-room call, independent answer.',
          },
          {
            kind: 'test',
            claim: 'The visible source names a complication clock for phone bill / sex-line risk.',
          },
          {
            kind: 'judge',
            claim: 'Reject generic phone progress bars that do not encode the film arc.',
          },
          {
            kind: 'judge',
            claim: 'Reject any implementation where progress is pure buff without new risk.',
          },
        ],
        optional: false,
      },
    ],
  }),
);
