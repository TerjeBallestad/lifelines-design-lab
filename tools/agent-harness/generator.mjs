#!/usr/bin/env node
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const runDir = process.argv[process.argv.indexOf('--run-dir') + 1];
const inputPath = process.argv[process.argv.indexOf('--input') + 1];
const input = JSON.parse(readFileSync(inputPath, 'utf8'));
const artifactDir = join(runDir, 'artifacts');
mkdirSync(artifactDir, { recursive: true });
const artifactPath = join(artifactDir, 'SB-004-005-generator-brief.md');
writeFileSync(
  artifactPath,
  `# SB-004/SB-005 generator brief\n\nSprint: ${input.sprint?.title}\n\n## Implementation target\n\nReplace generic phone practice clocks with a staged Citizen Sleeper-style ladder:\n\n1. Frank says \"ring ring\" beside the landline.\n2. Elling picks up, blurts, hangs up.\n3. Frank calls from his mobile while still present.\n4. Frank steps into another room and calls the landline.\n5. Elling answers independently.\n\nAdd a parallel complication clock:\n\n1. Phone becomes interesting.\n2. Private call window opens.\n3. Sex-line temptation appears.\n4. Phone bill lands on the table.\n\n## Generator stance\n\nKeep the implementation small. Make the clock readable and test-protected before touching the desk.\n`,
  'utf8',
);

console.log(
  JSON.stringify({
    status: 'done',
    summary: 'Produced SB-004/SB-005 implementation brief for the phone clock spike.',
    changedFiles: [],
    artifacts: [{ kind: 'brief', path: 'artifacts/SB-004-005-generator-brief.md' }],
    notes: [
      'Generator is intentionally advisory in this first agent-harness integration run; source edits are applied by Rook after the protocol run.',
    ],
  }),
);
