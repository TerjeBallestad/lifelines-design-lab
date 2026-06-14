#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function defaultPaths(cwd = process.cwd()) {
  const designLabRoot = resolve(cwd);
  const coreLoopRoot = resolve(designLabRoot, '../lifelines-core-loop');
  return {
    designLabRoot,
    coreLoopRoot,
    casePath: join(designLabRoot, 'content/cases/olsen/tiny-olsen.case.md'),
    generatedModulePath: join(designLabRoot, 'src/content/blueprint/generated/tinyOlsen.ts'),
    coreSourcePath: join(coreLoopRoot, 'resources/cases/olsen/source/tiny_olsen_slice.json'),
  };
}

export async function buildTinyOlsenArtifacts(paths = defaultPaths()) {
  const caseText = await readFile(paths.casePath, 'utf8');
  const source = parseCaseMarkdown(caseText);
  const documentMeta = only(source.documents, 'documents');
  const runs = parseDocumentRuns(documentMeta.body);
  const factIds = new Set(source.facts.map((fact) => fact.id));
  for (const run of runs) {
    if (run.fact_id && !factIds.has(run.fact_id)) {
      throw new Error(`Document evidence link references unknown fact id: ${run.fact_id}`);
    }
  }

  const godotSource = {
    id: source.case.id,
    title: source.case.title,
    scenario_stage: source.case.scenario_stage,
    documents: [
      {
        id: documentMeta.id,
        kind: documentMeta.kind,
        title: documentMeta.title,
        body_bbcode: documentMeta.body_bbcode,
        runs,
      },
    ],
    facts: source.facts.map((fact) => ({
      id: fact.id,
      label: fact.label,
      summary: fact.summary,
      source_document_id: fact.source_document_id,
      lift_effects: fact.reveals_questions.length
        ? [
            {
              op: 'reveal_questions',
              args: { question_ids: fact.reveals_questions },
            },
          ]
        : [],
    })),
    questions: source.questions.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      reveal_when: predicateFromFactIds(question.opens_when),
    })),
    hypotheses: source.hypotheses.map((hypothesis) => ({
      id: hypothesis.id,
      title: hypothesis.title,
      summary: hypothesis.summary,
      availability: predicateFromFactIds(hypothesis.needs),
      chosen_effects: chosenEffectsForHypothesis(hypothesis),
    })),
    tiltak: source.tiltak.map((tiltak) => ({
      id: tiltak.id,
      title: tiltak.title,
      sim_hook_id: tiltak.sim_hook_id,
    })),
    dispatches: source.dispatches.map((dispatch) => ({
      id: dispatch.id,
      title: dispatch.title,
      sim_hook_id: dispatch.sim_hook_id,
      gate: predicateFromGate(dispatch.gate),
      effects: effectsFromLine(dispatch.effects),
    })),
    clocks: source.clocks.map((clock) => ({
      id: clock.id,
      label: clock.label,
      sim_hook_id: clock.sim_hook_id,
    })),
    day_script_beats: [],
  };

  const labRuns = runs.map((run) =>
    run.fact_id ? { text: run.text, factId: run.fact_id } : { text: run.text },
  );
  const labContent = {
    documents: {
      [documentMeta.id]: {
        id: documentMeta.id,
        kind: documentMeta.kind,
        title: documentMeta.title,
        register: documentMeta.register,
        peek: documentMeta.peek,
        meta: documentMeta.meta,
        blocks: [{ id: `${documentMeta.id}_body`, runs: labRuns }],
      },
    },
    facts: Object.fromEntries(
      source.facts.map((fact) => [
        fact.id,
        {
          id: fact.id,
          domain: fact.domain,
          category: fact.category,
          text: fact.summary,
          quote: quoteForFact(runs, fact.id),
          supports: fact.supports,
          discuss: fact.discuss,
        },
      ]),
    ),
    questions: Object.fromEntries(
      source.questions.map((question) => [
        question.id,
        {
          id: question.id,
          title: question.title,
          appearsOn: question.appears_on,
          hypotheses: source.hypotheses
            .filter((hypothesis) => hypothesis.question_id === question.id)
            .map((hypothesis) => ({
              id: hypothesis.id,
              label: hypothesis.title,
              needs: hypothesis.needs,
              opens: hypothesis.opens_tiltak,
              note: hypothesis.summary,
            })),
        },
      ]),
    ),
    tiltak: Object.fromEntries(
      source.tiltak.map((tiltak) => [
        tiltak.id,
        {
          id: tiltak.id,
          slot: tiltak.slot,
          title: tiltak.title,
          cost: tiltak.cost,
          needs: tiltak.needs,
          ...(tiltak.needs_hypothesis.length ? { needsHypothesis: tiltak.needs_hypothesis } : {}),
          description: tiltak.description,
          sim: tiltak.sim_hook_id,
        },
      ]),
    ),
    dispatches: Object.fromEntries(
      source.dispatches.map((dispatch) => [
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
  return { godotSource, labContent, source };
}

export function parseCaseMarkdown(text) {
  const normalized = text.replace(/\r\n/g, '\n').trimEnd();
  const caseMatch = normalized.match(/^# Case:\s*(\S+)\n([\s\S]*?)(?=^# Document:)/m);
  if (!caseMatch) throw new Error('Expected top-level "# Case: <id>" section before document');
  const caseFields = parseFields(caseMatch[2]);

  const documentSection = sectionBetween(normalized, /^# Document:\s*(\S+)\s*$/m, /^# Facts\s*$/m);
  const documentFieldsAndBody = splitFieldsAndBody(documentSection.body);
  const documentFields = parseFields(documentFieldsAndBody.fieldsText);
  const documentBody = documentFieldsAndBody.bodyText.trim();

  const documents = [
    {
      id: documentSection.id,
      kind: required(documentFields, 'Kind', documentSection.id),
      title: required(documentFields, 'Title', documentSection.id),
      register: required(documentFields, 'Register', documentSection.id),
      peek: required(documentFields, 'Peek', documentSection.id),
      meta: required(documentFields, 'Meta', documentSection.id),
      body: documentBody,
      body_bbcode: evidenceMarkdownToBbcode(documentBody),
    },
  ];

  return {
    case: {
      id: caseMatch[1],
      title: required(caseFields, 'Title', 'case'),
      scenario_stage: Number(caseFields.get('Scenario stage') ?? 0),
    },
    documents,
    facts: parseItems(sectionBody(normalized, 'Facts', 'Questions')).map((item) => ({
      id: item.id,
      label: required(item.fields, 'Label', item.id),
      summary: required(item.fields, 'Summary', item.id),
      domain: required(item.fields, 'Domain', item.id),
      category: required(item.fields, 'Category', item.id),
      source_document_id: item.fields.get('Source') ?? documents[0].id,
      supports: listField(item.fields, 'Supports'),
      discuss: listField(item.fields, 'Discuss'),
      reveals_questions: listField(item.fields, 'Reveals questions'),
    })),
    questions: parseItems(sectionBody(normalized, 'Questions', 'Hypotheses')).map((item) => ({
      id: item.id,
      title: required(item.fields, 'Title', item.id),
      prompt: item.fields.get('Prompt') ?? required(item.fields, 'Title', item.id),
      appears_on: listField(item.fields, 'Appears on'),
      opens_when: listField(item.fields, 'Opens when'),
    })),
    hypotheses: parseItems(sectionBody(normalized, 'Hypotheses', 'Tiltak')).map((item) => ({
      id: item.id,
      title: required(item.fields, 'Title', item.id),
      summary: required(item.fields, 'Summary', item.id),
      question_id: required(item.fields, 'Question', item.id),
      needs: listField(item.fields, 'Needs'),
      opens_tiltak: listField(item.fields, 'Opens tiltak'),
      unlocks_dispatches: listField(item.fields, 'Unlocks dispatches'),
    })),
    tiltak: parseItems(sectionBody(normalized, 'Tiltak', 'Dispatches')).map((item) => ({
      id: item.id,
      title: required(item.fields, 'Title', item.id),
      slot: required(item.fields, 'Slot', item.id),
      cost: Number(required(item.fields, 'Cost', item.id)),
      needs: listField(item.fields, 'Needs'),
      needs_hypothesis: listField(item.fields, 'Needs hypothesis'),
      description: required(item.fields, 'Description', item.id),
      sim_hook_id: required(item.fields, 'Sim hook', item.id),
    })),
    dispatches: parseItems(sectionBody(normalized, 'Dispatches', 'Clocks')).map((item) => ({
      id: item.id,
      title: required(item.fields, 'Title', item.id),
      description: required(item.fields, 'Description', item.id),
      sim_hook_id: required(item.fields, 'Sim hook', item.id),
      gate: required(item.fields, 'Gate', item.id),
      effects: required(item.fields, 'Effects', item.id),
    })),
    clocks: parseItems(sectionBody(normalized, 'Clocks', 'Day script beats')).map((item) => ({
      id: item.id,
      label: required(item.fields, 'Label', item.id),
      sim_hook_id: required(item.fields, 'Sim hook', item.id),
    })),
  };
}

function sectionBetween(text, startRe, endRe) {
  const start = startRe.exec(text);
  if (!start) throw new Error(`Missing section matching ${startRe}`);
  const afterStart = start.index + start[0].length;
  endRe.lastIndex = afterStart;
  const rest = text.slice(afterStart);
  const end = endRe.exec(rest);
  if (!end) throw new Error(`Missing section end matching ${endRe}`);
  return { id: start[1], body: rest.slice(0, end.index) };
}

function sectionBody(text, title, nextTitle) {
  const re = new RegExp(`^# ${escapeRegExp(title)}\\s*$([\\s\\S]*?)^# ${escapeRegExp(nextTitle)}\\s*$`, 'm');
  const match = text.match(re);
  if (!match) throw new Error(`Missing # ${title} section before # ${nextTitle}`);
  return match[1].trim();
}

function parseItems(text) {
  if (!text.trim() || text.trim() === 'None') return [];
  const items = [];
  let current = null;
  for (const line of text.split('\n')) {
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      if (current) items.push(current);
      current = { id: heading[1].trim(), lines: [] };
      continue;
    }
    if (current) current.lines.push(line);
  }
  if (current) items.push(current);
  return items.map((item) => ({ id: item.id, fields: parseFields(item.lines.join('\n')) }));
}

function splitFieldsAndBody(text) {
  const lines = text.replace(/^\n+/, '').split('\n');
  const fieldLines = [];
  let index = 0;
  for (; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.trim() === '') {
      index += 1;
      break;
    }
    if (!/^[- A-Za-zæøåÆØÅ]+:/.test(line)) break;
    fieldLines.push(line);
  }
  return { fieldsText: fieldLines.join('\n'), bodyText: lines.slice(index).join('\n') };
}

function parseFields(text) {
  const fields = new Map();
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (!match) throw new Error(`Expected "Key: value" line, got: ${line}`);
    fields.set(match[1].trim(), match[2].trim());
  }
  return fields;
}

function required(fields, key, context) {
  const value = fields.get(key);
  if (value == null || value === '') throw new Error(`${context} missing required field: ${key}`);
  return value;
}

function listField(fields, key) {
  const value = fields.get(key);
  if (!value || value === 'None') return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseDocumentRuns(markdown) {
  const runs = [];
  const re = /\[([^\]]+)\]\(fact:([a-zA-Z0-9_:-]+)\)/g;
  let match;
  let cursor = 0;
  let textRunIndex = 0;
  while ((match = re.exec(markdown)) !== null) {
    const before = collapseWhitespace(markdown.slice(cursor, match.index));
    if (before) runs.push({ id: `run_text_${textRunIndex++}`, text: before, fact_id: '' });
    runs.push({ id: `run_${match[2].replace(/^f_/, '')}`, text: match[1], fact_id: match[2] });
    cursor = match.index + match[0].length;
  }
  const after = collapseWhitespace(markdown.slice(cursor));
  if (after) runs.push({ id: `run_text_${textRunIndex++}`, text: after, fact_id: '' });
  if (!runs.some((run) => run.fact_id)) throw new Error('No evidence links found in document body');
  return runs;
}

function evidenceMarkdownToBbcode(markdown) {
  return markdown
    .replace(/\[([^\]]+)\]\(fact:([a-zA-Z0-9_:-]+)\)/g, '[url=fact:$2]$1[/url]')
    .trim();
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

function predicateFromFactIds(factIds) {
  const predicates = factIds.map((factId) => ({ op: 'fact_lifted', args: { fact_id: factId } }));
  return combineAll(predicates);
}

function predicateFromGate(line) {
  const predicates = line.split('+').map((part) => {
    const token = part.trim();
    const fact = token.match(/^fact\s+(\S+)$/);
    if (fact) return { op: 'fact_lifted', args: { fact_id: fact[1] } };
    const hypothesis = token.match(/^hypothesis\s+(\S+)$/);
    if (hypothesis) return { op: 'hypothesis_chosen', args: { hypothesis_id: hypothesis[1] } };
    throw new Error(`Unsupported Gate token: ${token}`);
  });
  return combineAll(predicates);
}

function combineAll(predicates) {
  if (predicates.length === 0) return { op: 'all', children: [] };
  if (predicates.length === 1) return predicates[0];
  return { op: 'all', children: predicates };
}

function chosenEffectsForHypothesis(hypothesis) {
  const effects = [];
  if (hypothesis.opens_tiltak.length) {
    effects.push({ op: 'unlock_tiltak', args: { tiltak_ids: hypothesis.opens_tiltak } });
  }
  if (hypothesis.unlocks_dispatches.length) {
    effects.push({ op: 'unlock_dispatches', args: { dispatch_ids: hypothesis.unlocks_dispatches } });
  }
  return effects;
}

function effectsFromLine(line) {
  const scenarioStage = line.match(/^scenario_stage\s+(\d+)$/);
  if (scenarioStage) return [{ op: 'set_scenario_stage', args: { stage: Number(scenarioStage[1]) } }];

  const pendingDoc = line.match(/^pending_doc\s+(\S+)\s+after\s+(\d+)\s+day\s+on\s+(\S+)$/);
  if (pendingDoc) {
    return [
      {
        op: 'queue_pending_document',
        args: {
          clock_id: pendingDoc[3],
          document_id: pendingDoc[1],
          delay_days: Number(pendingDoc[2]),
        },
      },
    ];
  }
  throw new Error(`Unsupported Effects line: ${line}`);
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
    for (const run of doc.runs) if (run.fact_id) requireKnown(factIds, run.fact_id, `run ${run.id}.fact_id`);
  }
  for (const fact of Object.values(labContent.facts)) {
    for (const questionId of fact.supports) requireKnown(questionIds, questionId, `fact ${fact.id}.supports`);
  }
  for (const question of Object.values(labContent.questions)) {
    for (const factId of question.appearsOn) requireKnown(factIds, factId, `question ${question.id}.appearsOn`);
    for (const hypothesis of question.hypotheses) {
      requireKnown(hypothesisIds, hypothesis.id, `question ${question.id}.hypotheses`);
      for (const factId of hypothesis.needs) requireKnown(factIds, factId, `hypothesis ${hypothesis.id}.needs`);
      for (const tiltakId of hypothesis.opens) requireKnown(tiltakIds, tiltakId, `hypothesis ${hypothesis.id}.opens`);
    }
  }
  for (const hypothesis of godotSource.hypotheses) {
    for (const op of collectPredicateOps(hypothesis.availability)) assertCaseAgnosticOp(op);
    for (const op of collectEffectOps(hypothesis.chosen_effects)) assertCaseAgnosticOp(op);
  }
  for (const dispatch of godotSource.dispatches) {
    requireKnown(dispatchIds, dispatch.id, `dispatch ${dispatch.id}`);
    for (const op of collectPredicateOps(dispatch.gate)) assertCaseAgnosticOp(op);
    for (const op of collectEffectOps(dispatch.effects)) assertCaseAgnosticOp(op);
  }
}

function requireKnown(set, id, label) {
  if (!set.has(id)) throw new Error(`${label} references unknown id ${id}`);
}

function assertCaseAgnosticOp(op) {
  if (/grete|olsen|elling/i.test(String(op))) {
    throw new Error(`Operation name must be case-agnostic, got ${op}`);
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
  await writeFile(paths.generatedModulePath, await formatGeneratedBlueprintModule(artifacts), 'utf8');
  await writeFile(paths.coreSourcePath, `${JSON.stringify(artifacts.godotSource, null, 2)}\n`, 'utf8');
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
