#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';
import { parse as parseYaml } from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function defaultPaths(cwd = process.cwd()) {
  const designLabRoot = resolve(cwd);
  const coreLoopRoot = resolve(designLabRoot, '../lifelines-core-loop');
  return {
    designLabRoot,
    coreLoopRoot,
    markdownPath: join(designLabRoot, 'content/cases/olsen/tiny-olsen.case.md'),
    sidecarPath: join(designLabRoot, 'content/cases/olsen/tiny-olsen.case.yaml'),
    generatedModulePath: join(designLabRoot, 'src/content/blueprint/generated/tinyOlsen.ts'),
    coreSourcePath: join(coreLoopRoot, 'resources/cases/olsen/source/tiny_olsen_slice.json'),
  };
}

export async function buildTinyOlsenArtifacts(paths = defaultPaths()) {
  const [markdown, sidecarText] = await Promise.all([
    readFile(paths.markdownPath, 'utf8'),
    readFile(paths.sidecarPath, 'utf8'),
  ]);
  const sidecar = parseYaml(sidecarText);
  const documentMeta = only(sidecar.documents, 'documents');
  const runs = parseEvidenceRuns(markdown);
  const factIds = new Set(sidecar.facts.map((fact) => fact.id));
  for (const run of runs) {
    if (!factIds.has(run.fact_id)) {
      throw new Error(`Markdown evidence span references unknown fact id: ${run.fact_id}`);
    }
  }

  const bodyBbcode = runs.map((run) => `[url=fact:${run.fact_id}]${run.text}[/url]`).join('\n\n');
  const godotSource = {
    id: sidecar.case.id,
    title: sidecar.case.title,
    scenario_stage: sidecar.case.scenario_stage ?? 0,
    documents: [
      {
        id: documentMeta.id,
        kind: documentMeta.kind,
        title: documentMeta.title,
        body_bbcode: bodyBbcode,
        runs,
      },
    ],
    facts: sidecar.facts.map((fact) => ({
      id: fact.id,
      label: fact.label,
      summary: fact.summary,
      source_document_id: fact.source_document_id,
      lift_effects: fact.lift_effects ?? [],
    })),
    questions: sidecar.questions.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      reveal_when: question.reveal_when,
    })),
    hypotheses: sidecar.hypotheses.map((hypothesis) => ({
      id: hypothesis.id,
      title: hypothesis.title,
      summary: hypothesis.summary,
      availability: hypothesis.availability,
      chosen_effects: hypothesis.chosen_effects ?? [],
    })),
    tiltak: sidecar.tiltak.map((tiltak) => ({
      id: tiltak.id,
      title: tiltak.title,
      sim_hook_id: tiltak.sim_hook_id,
    })),
    dispatches: sidecar.dispatches.map((dispatch) => ({
      id: dispatch.id,
      title: dispatch.title,
      sim_hook_id: dispatch.sim_hook_id,
      gate: dispatch.gate,
      effects: dispatch.effects ?? [],
    })),
    clocks: sidecar.clocks.map((clock) => ({
      id: clock.id,
      label: clock.label,
      sim_hook_id: clock.sim_hook_id,
    })),
    day_script_beats: sidecar.day_script_beats ?? [],
  };

  const documentRuns = runs.map((run) => ({ text: run.text, factId: run.fact_id }));
  const labContent = {
    documents: {
      [documentMeta.id]: {
        id: documentMeta.id,
        kind: documentMeta.kind,
        title: documentMeta.title,
        register: documentMeta.register,
        peek: documentMeta.peek,
        meta: documentMeta.meta,
        blocks: [{ id: `${documentMeta.id}_body`, runs: documentRuns }],
      },
    },
    facts: Object.fromEntries(
      sidecar.facts.map((fact) => [
        fact.id,
        {
          id: fact.id,
          domain: fact.domain,
          category: fact.category,
          text: fact.summary,
          quote: quoteForFact(runs, fact.id),
          supports: fact.supports ?? [],
          discuss: fact.discuss ?? [],
        },
      ]),
    ),
    questions: Object.fromEntries(
      sidecar.questions.map((question) => [
        question.id,
        {
          id: question.id,
          title: question.title ?? question.prompt,
          appearsOn: question.appears_on ?? [],
          hypotheses: sidecar.hypotheses
            .filter((hypothesis) => hypothesis.question_id === question.id)
            .map((hypothesis) => ({
              id: hypothesis.id,
              label: hypothesis.label ?? hypothesis.title,
              needs: predicateFactIds(hypothesis.availability),
              opens: hypothesis.opens ?? [],
              note: hypothesis.note ?? hypothesis.summary,
            })),
        },
      ]),
    ),
    tiltak: Object.fromEntries(
      sidecar.tiltak.map((tiltak) => [
        tiltak.id,
        {
          id: tiltak.id,
          slot: tiltak.slot,
          title: tiltak.title,
          cost: tiltak.cost,
          needs: tiltak.needs ?? [],
          ...(tiltak.needs_hypothesis ? { needsHypothesis: tiltak.needs_hypothesis } : {}),
          description: tiltak.description,
          sim: tiltak.sim_hook_id,
        },
      ]),
    ),
    dispatches: Object.fromEntries(
      sidecar.dispatches.map((dispatch) => [
        dispatch.id,
        {
          id: dispatch.id,
          title: dispatch.title,
          description: dispatch.description,
        },
      ]),
    ),
  };

  validateArtifacts({ godotSource, labContent });
  return { godotSource, labContent, source: { markdown, sidecar } };
}

function parseEvidenceRuns(markdown) {
  const runs = [];
  const re = /\{ev:([a-zA-Z0-9_:-]+)\}([\s\S]*?)\{\/ev\}/g;
  let match;
  while ((match = re.exec(markdown)) !== null) {
    const factId = match[1];
    const text = collapseWhitespace(match[2]);
    runs.push({ id: `run_${factId.replace(/^f_/, '')}`, text, fact_id: factId });
  }
  if (runs.length === 0) throw new Error('No evidence spans found in markdown');
  return runs;
}

function collapseWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function only(items, label) {
  if (!Array.isArray(items) || items.length !== 1) {
    throw new Error(`${label} must contain exactly one item for the tiny Olsen slice`);
  }
  return items[0];
}

function quoteForFact(runs, factId) {
  return runs.find((run) => run.fact_id === factId)?.text ?? '';
}

function predicateFactIds(predicate) {
  if (!predicate) return [];
  const ids = [];
  if (predicate.op === 'fact_lifted' && predicate.args?.fact_id) ids.push(predicate.args.fact_id);
  for (const child of predicate.children ?? []) ids.push(...predicateFactIds(child));
  return [...new Set(ids)];
}

function collectPredicateOps(predicate, ops = []) {
  if (!predicate) return ops;
  ops.push(predicate.op);
  for (const child of predicate.children ?? []) collectPredicateOps(child, ops);
  return ops;
}

function collectEffectOps(effects, ops = []) {
  for (const effect of effects ?? []) {
    ops.push(effect.op);
    collectEffectOps(effect.children ?? [], ops);
  }
  return ops;
}

function validateArtifacts({ godotSource, labContent }) {
  const factIds = new Set(godotSource.facts.map((fact) => fact.id));
  const questionIds = new Set(godotSource.questions.map((question) => question.id));
  const hypothesisIds = new Set(godotSource.hypotheses.map((hypothesis) => hypothesis.id));
  const tiltakIds = new Set(godotSource.tiltak.map((tiltak) => tiltak.id));
  const dispatchIds = new Set(godotSource.dispatches.map((dispatch) => dispatch.id));
  for (const doc of godotSource.documents) {
    for (const run of doc.runs) requireKnown(factIds, run.fact_id, `run ${run.id}.fact_id`);
  }
  for (const fact of Object.values(labContent.facts)) {
    for (const questionId of fact.supports)
      requireKnown(questionIds, questionId, `fact ${fact.id}.supports`);
  }
  for (const question of Object.values(labContent.questions)) {
    for (const factId of question.appearsOn)
      requireKnown(factIds, factId, `question ${question.id}.appearsOn`);
    for (const hypothesis of question.hypotheses) {
      requireKnown(hypothesisIds, hypothesis.id, `question ${question.id}.hypotheses`);
      for (const factId of hypothesis.needs)
        requireKnown(factIds, factId, `hypothesis ${hypothesis.id}.needs`);
      for (const tiltakId of hypothesis.opens)
        requireKnown(tiltakIds, tiltakId, `hypothesis ${hypothesis.id}.opens`);
    }
  }
  for (const hypothesis of godotSource.hypotheses) {
    for (const op of collectPredicateOps(hypothesis.availability)) assertCaseAgnosticOp(op);
    for (const op of collectEffectOps(hypothesis.chosen_effects)) assertCaseAgnosticOp(op);
  }
  for (const dispatch of godotSource.dispatches) {
    for (const op of collectPredicateOps(dispatch.gate)) assertCaseAgnosticOp(op);
    for (const op of collectEffectOps(dispatch.effects)) assertCaseAgnosticOp(op);
    const unlocked = collectEffectArgs(
      godotSource.hypotheses.flatMap((h) => h.chosen_effects),
      'dispatch_ids',
    );
    if (dispatch.id !== 'd_ring_grete' && dispatch.id !== 'd_konto')
      requireKnown(dispatchIds, dispatch.id, `dispatch ${dispatch.id}`);
    for (const dispatchId of unlocked)
      requireKnown(dispatchIds, dispatchId, 'unlock_dispatches.dispatch_ids');
  }
}

function collectEffectArgs(effects, argName, values = []) {
  for (const effect of effects ?? []) {
    const raw = effect.args?.[argName];
    if (Array.isArray(raw)) values.push(...raw);
    collectEffectArgs(effect.children ?? [], argName, values);
  }
  return values;
}

function requireKnown(set, id, label) {
  if (!set.has(id)) throw new Error(`${label} references unknown id ${id}`);
}

function assertCaseAgnosticOp(op) {
  if (/grete|olsen|elling/i.test(String(op))) {
    throw new Error(`Operation name must be case-agnostic, got ${op}`);
  }
}

export function renderGeneratedBlueprintModule({ godotSource, labContent }) {
  return (
    `import type { BlueprintDispatch, BlueprintDocument, BlueprintFact, BlueprintQuestion, BlueprintTiltak } from '../../../domain/blueprint';\n\n` +
    `export const tinyOlsenDocuments = ${toTs(labContent.documents)} satisfies Record<string, BlueprintDocument>;\n\n` +
    `export const tinyOlsenFacts = ${toTs(labContent.facts)} satisfies Record<string, BlueprintFact>;\n\n` +
    `export const tinyOlsenQuestions = ${toTs(labContent.questions)} satisfies Record<string, BlueprintQuestion>;\n\n` +
    `export const tinyOlsenTiltak = ${toTs(labContent.tiltak)} satisfies Record<string, BlueprintTiltak>;\n\n` +
    `export const tinyOlsenDispatches = ${toTs(labContent.dispatches)} satisfies Record<string, BlueprintDispatch>;\n\n` +
    `export const tinyOlsenGodotSource = ${toTs(godotSource)} as const;\n`
  );
}

function toTs(value) {
  return JSON.stringify(value, null, 2)
    .replace(/"([A-Za-z_$][\w$]*)":/g, '$1:')
    .replace(/: "([a-zA-Z0-9_]+)"/g, ": '$1'")
    .replace(/"/g, "'");
}

export async function formatGeneratedBlueprintModule(artifacts) {
  return prettier.format(renderGeneratedBlueprintModule(artifacts), {
    parser: 'typescript',
    singleQuote: true,
    trailingComma: 'all',
    printWidth: 100,
  });
}

export async function writeTinyOlsenArtifacts(paths = defaultPaths()) {
  const artifacts = await buildTinyOlsenArtifacts(paths);
  await mkdir(dirname(paths.generatedModulePath), { recursive: true });
  await mkdir(dirname(paths.coreSourcePath), { recursive: true });
  await writeFile(
    paths.generatedModulePath,
    await formatGeneratedBlueprintModule(artifacts),
    'utf8',
  );
  await writeFile(
    paths.coreSourcePath,
    `${JSON.stringify(artifacts.godotSource, null, 2)}\n`,
    'utf8',
  );
  return artifacts;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  const paths = defaultPaths(process.cwd());
  const artifacts = await buildTinyOlsenArtifacts(paths);
  const moduleSource = await formatGeneratedBlueprintModule(artifacts);
  const jsonSource = `${JSON.stringify(artifacts.godotSource, null, 2)}\n`;
  if (check) {
    const [currentModule, currentJson] = await Promise.all([
      readFile(paths.generatedModulePath, 'utf8'),
      readFile(paths.coreSourcePath, 'utf8'),
    ]);
    if (currentModule !== moduleSource || currentJson !== jsonSource) {
      throw new Error('Generated tiny Olsen artifacts are stale. Run npm run gen:olsen.');
    }
    console.log('tiny Olsen artifacts are up to date');
  } else {
    await writeTinyOlsenArtifacts(paths);
    console.log(`wrote ${paths.generatedModulePath}`);
    console.log(`wrote ${paths.coreSourcePath}`);
  }
}
