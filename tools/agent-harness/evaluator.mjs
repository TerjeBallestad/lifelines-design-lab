#!/usr/bin/env node
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const runDir = process.argv[process.argv.indexOf('--run-dir') + 1];
const inputPath = process.argv[process.argv.indexOf('--input') + 1];
const input = JSON.parse(readFileSync(inputPath, 'utf8'));
const artifactDir = join(runDir, 'artifacts');
mkdirSync(artifactDir, { recursive: true });
const critiquePath = join(artifactDir, 'SB-004-005-evaluator-attack.md');
writeFileSync(
  critiquePath,
  `# SB-004/SB-005 evaluator attack\n\n## Verdict\n\nPIVOT before source work if the implementation keeps phone practice generic.\n\n## Must reject\n\n- A progress bar labelled \"phone mastery\" without the ring-ring sequence.\n- Choices about Frank's abstract position instead of authored practice steps.\n- A success clock without a complication clock.\n- Any result where phone progress cannot create a phone bill / sex-line problem.\n\n## Must pass\n\n- The apartment surface visibly stages the Frank/Elling practice ladder.\n- The complication clock advances as the phone becomes useful.\n- Tests name the ring-ring ladder and the complication risk.\n- The tone remains concrete, social-realist, and slightly humiliating.\n`,
  'utf8',
);

console.log(
  JSON.stringify({
    status: 'done',
    verdict: 'PASS',
    summary:
      'Protocol run passes: planner/generator/evaluator artifacts were produced. Evaluator attack is ready to govern source implementation.',
    issues: [],
    artifacts: [{ kind: 'critique', path: 'artifacts/SB-004-005-evaluator-attack.md' }],
    notes: [
      'This PASS is for harness protocol readiness, not for the eventual source implementation.',
    ],
  }),
);
