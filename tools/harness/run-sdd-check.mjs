#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const config = JSON.parse(readFileSync('harness.config.json', 'utf8'));
assert.equal(
  config.contractNegotiation?.enabled,
  true,
  'contract negotiation must be enabled for SDD runs',
);
assert.equal(config.contractNegotiation?.maxRounds, 3, 'contract negotiation should stay bounded');

const wrapper = readFileSync('tools/harness/run-sdd.sh', 'utf8');
assert.match(
  wrapper,
  /harness run-sdd "\$SDD_ID"/,
  'wrapper must use harness run-sdd with the SDD ID',
);
assert.match(
  wrapper,
  /SLACK_BOT_TOKEN/,
  'wrapper must load/check Slack token before creating a run',
);
assert.match(
  wrapper,
  /tools\/harness\/resolve-sdd\.sh "\$SDD_ID"/,
  'wrapper must preflight SDD resolver',
);
assert.match(wrapper, /pm health/, 'wrapper must preflight PM health');

const resolver = spawnSync('tools/harness/resolve-sdd.sh', ['SDD-010'], { encoding: 'utf8' });
assert.equal(resolver.status, 0, resolver.stderr || resolver.stdout);
assert.match(resolver.stdout, /id: SDD-010/, 'resolver must resolve SDD IDs to markdown');

const smoke = readFileSync('tools/harness/web-ui-smoke.mjs', 'utf8');
const roleCodex = readFileSync('tools/harness/role-codex.mjs', 'utf8');
const plannerPacket = readFileSync('tools/harness/prompts/planner-packet.md', 'utf8');
assert.match(
  smoke,
  /blueprintTestFiles/,
  'web-ui-smoke must use scoped Blueprint tests for Blueprint verifier evidence',
);
assert.doesNotMatch(
  smoke,
  /run\('npm', \['test'\]\)/,
  'web-ui-smoke must not run unscoped npm test for every sprint',
);
assert.match(
  smoke,
  /web-ui-smoke-result\.json/,
  'web-ui-smoke must persist full verifier details as an artifact',
);
assert.match(
  roleCodex,
  /generator MAY update project-owned verifier files/,
  'live generator prompt must explicitly allow narrow verifier updates when the contract changes evidence',
);
assert.match(
  roleCodex,
  /do not weaken unrelated checks/,
  'live generator prompt must guard against weakening verifier evidence',
);
assert.match(
  roleCodex,
  /directly answer every previous evaluator issue/,
  'live generator prompt must force contract revisions to answer evaluator feedback',
);
assert.match(
  roleCodex,
  /likely to waste an implementation attempt/,
  'live evaluator prompt must avoid halting on contract polish that can be verified after implementation',
);
assert.match(
  roleCodex,
  /Do not dismiss polish\/game-feel work as optional/,
  'live role prompt must protect polish/game-feel work from being dismissed as automatically optional',
);
assert.match(
  plannerPacket,
  /Treat project verifiers as part of the slice contract/,
  'planner packet must surface stale-verifier risk during contract formation',
);
assert.match(
  plannerPacket,
  /Use `optional: true` only when/,
  'planner packet must require an explicit reason before making polish optional',
);

console.log('harness SDD workflow contract checks passed');
