// Case-format core (SDD-100 authoring pipeline, night build 2026-07-02):
// full-schema round-trip between the humane `.case.md` markdown format and the
// Godot case-source JSON (tiny_olsen_slice.json shape).
//
//   parseCaseMarkdown(text)  -> source        (markdown -> neutral source tree)
//   buildArtifacts(source)   -> { godotSource, labContent, warnings }
//   serializeCase(godot)     -> markdown      (the REVERSE generator)
//
// Design rules:
// - The `.case.md` is the single humane source; generated artifacts are
//   machinery. serializeCase exists to heal drift (the Godot JSON evolved by
//   hand while the old one-document .case.md went stale — SB-314 root cause).
// - Round-trip law: buildArtifacts(parseCaseMarkdown(serializeCase(J))).godotSource
//   must deep-equal J. The parity test enforces this against the live JSON.
// - Validation returns WARNINGS (the authoring editor shows them live);
//   callers that want the old hard-fail behavior check warnings.length.

// === Section grammar =============================================================

const SECTION_ORDER = [
  'Facts',
  'Questions',
  'Hypotheses',
  'Tiltak',
  'Dispatches',
  'Clocks',
  'Event deltas',
  'Day script beats',
];

export function parseCaseMarkdown(text) {
  const normalized = text.replace(/\r\n/g, '\n').trimEnd();
  const caseMatch = normalized.match(/^# Case:\s*(\S+)\n([\s\S]*?)(?=^# Document:)/m);
  if (!caseMatch) throw new Error('Expected top-level "# Case: <id>" section before first document');
  const caseFields = parseFields(caseMatch[2]);

  const documents = parseDocuments(normalized);

  const facts = parseItems(sectionBody(normalized, 'Facts', 'Questions')).map((item) => ({
    id: item.id,
    label: required(item.fields, 'Label', item.id),
    summary: required(item.fields, 'Summary', item.id),
    domain: required(item.fields, 'Domain', item.id),
    category: required(item.fields, 'Category', item.id),
    source_document_id: item.fields.get('Source') ?? documents[0].id,
    quote_override: item.fields.get('Quote') ?? null,
    supports: listField(item.fields, 'Supports'),
    discuss: listField(item.fields, 'Discuss'),
    reveals_questions: listField(item.fields, 'Reveals questions'),
  }));

  const questions = parseItems(sectionBody(normalized, 'Questions', 'Hypotheses')).map((item) => ({
    id: item.id,
    title: required(item.fields, 'Title', item.id),
    prompt: item.fields.get('Prompt') ?? required(item.fields, 'Title', item.id),
    appears_on: item.fields.has('Appears on')
      ? listField(item.fields, 'Appears on')
      : listField(item.fields, 'Opens when'),
    opens_when: listField(item.fields, 'Opens when'),
  }));

  const hypotheses = parseItems(sectionBody(normalized, 'Hypotheses', 'Tiltak')).map((item) => ({
    id: item.id,
    title: required(item.fields, 'Title', item.id),
    summary: required(item.fields, 'Summary', item.id),
    question_id: required(item.fields, 'Question', item.id),
    needs: listField(item.fields, 'Needs'),
    opens_tiltak: listField(item.fields, 'Opens tiltak'),
    unlocks_dispatches: listField(item.fields, 'Unlocks dispatches'),
  }));

  const tiltak = parseItems(sectionBody(normalized, 'Tiltak', 'Dispatches')).map((item) => ({
    id: item.id,
    title: required(item.fields, 'Title', item.id),
    slot: required(item.fields, 'Slot', item.id),
    cost: parseIntegerField(required(item.fields, 'Cost', item.id), `${item.id}.Cost`),
    needs: listField(item.fields, 'Needs'),
    needs_hypothesis: listField(item.fields, 'Needs hypothesis'),
    description: required(item.fields, 'Description', item.id),
    sim_hook_id: required(item.fields, 'Sim hook', item.id),
  }));

  const dispatches = parseItems(sectionBody(normalized, 'Dispatches', 'Clocks')).map((item) => ({
    id: item.id,
    title: required(item.fields, 'Title', item.id),
    description: required(item.fields, 'Description', item.id),
    sim_hook_id: required(item.fields, 'Sim hook', item.id),
    visit_hour: parseIntegerField(item.fields.get('Visit hour') ?? '14', `${item.id}.Visit hour`),
    occupies_hours: parseIntegerField(item.fields.get('Occupies hours') ?? '2', `${item.id}.Occupies hours`),
    gate: required(item.fields, 'Gate', item.id),
    effects: required(item.fields, 'Effects', item.id),
  }));

  const clocks = parseItems(sectionBody(normalized, 'Clocks', 'Event deltas')).map((item) => ({
    id: item.id,
    label: required(item.fields, 'Label', item.id),
    sim_hook_id: required(item.fields, 'Sim hook', item.id),
    question: item.fields.get('Question') ?? '',
    good_segment_label: item.fields.get('Good label') ?? '',
    good_segment_size: parseIntegerField(item.fields.get('Good size') ?? '0', `${item.id}.Good size`),
    bad_segment_label: item.fields.get('Bad label') ?? '',
    bad_segment_size: parseIntegerField(item.fields.get('Bad size') ?? '0', `${item.id}.Bad size`),
    visibility: item.fields.get('Visibility') ?? null,
  }));

  const event_deltas = parseItems(sectionBody(normalized, 'Event deltas', 'Day script beats')).map(
    (item) => ({
      event_type: item.id,
      log_text: item.fields.get('Log') ?? '',
      clock_id: item.fields.get('Clock') ?? '',
      clock_direction: parseIntegerField(item.fields.get('Direction') ?? '0', `${item.id}.Direction`),
      reveal_fact_id: item.fields.get('Reveals fact') ?? '',
    }),
  );

  return {
    case: {
      id: caseMatch[1],
      title: required(caseFields, 'Title', 'case'),
      scenario_stage: parseIntegerField(caseFields.get('Scenario stage') ?? '0', 'case.Scenario stage'),
      vurdering_frist_day: parseIntegerField(caseFields.get('Vurdering frist day') ?? '10', 'case.Vurdering frist day'),
    },
    documents,
    facts,
    questions,
    hypotheses,
    tiltak,
    dispatches,
    clocks,
    event_deltas,
  };
}

function parseDocuments(text) {
  const headerRe = /^# Document:\s*(\S+)\s*$/gm;
  const factsIndex = text.search(/^# Facts\s*$/m);
  if (factsIndex < 0) throw new Error('Missing # Facts section');
  const headers = [];
  let match;
  while ((match = headerRe.exec(text)) !== null) {
    if (match.index > factsIndex) break;
    headers.push({ id: match[1], start: match.index, contentStart: match.index + match[0].length });
  }
  if (!headers.length) throw new Error('Expected at least one "# Document: <id>" section');
  return headers.map((header, index) => {
    const end = index + 1 < headers.length ? headers[index + 1].start : factsIndex;
    const sectionText = text.slice(header.contentStart, end);
    const { fieldsText, bodyText } = splitFieldsAndBody(sectionText);
    const fields = parseFields(fieldsText);
    const body = bodyText.trim();
    return {
      id: header.id,
      kind: required(fields, 'Kind', header.id),
      title: required(fields, 'Title', header.id),
      register: required(fields, 'Register', header.id),
      peek: required(fields, 'Peek', header.id),
      meta: required(fields, 'Meta', header.id),
      body,
      body_bbcode: evidenceMarkdownToBbcode(body),
    };
  });
}

// === Artifact build ==============================================================

export function buildArtifacts(source) {
  const warnings = [];
  const allRunsByDoc = new Map();
  for (const doc of source.documents) {
    allRunsByDoc.set(doc.id, parseDocumentRuns(doc.body, warnings, doc.id));
  }
  const factIds = new Set(source.facts.map((fact) => fact.id));
  for (const [docId, runs] of allRunsByDoc) {
    for (const run of runs) {
      if (run.fact_id && !factIds.has(run.fact_id)) {
        warnings.push(`document ${docId}: evidence link references unknown fact id ${run.fact_id}`);
      }
    }
  }

  const godotSource = {
    id: source.case.id,
    title: source.case.title,
    scenario_stage: source.case.scenario_stage,
    vurdering_frist_day: source.case.vurdering_frist_day,
    documents: source.documents.map((doc) => ({
      id: doc.id,
      kind: doc.kind,
      title: doc.title,
      register: doc.register,
      peek: doc.peek,
      meta: doc.meta,
      body_bbcode: doc.body_bbcode,
      runs: allRunsByDoc.get(doc.id),
    })),
    facts: source.facts.map((fact) => ({
      id: fact.id,
      label: fact.label,
      summary: fact.summary,
      source_document_id: fact.source_document_id,
      domain: fact.domain,
      category: fact.category,
      quote: fact.quote_override ?? quoteForFact(allRunsByDoc, fact.id),
      discuss: fact.discuss,
      supports_questions: fact.supports,
      lift_effects: fact.reveals_questions.length
        ? [{ op: 'reveal_questions', args: { question_ids: fact.reveals_questions } }]
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
      question_id: hypothesis.question_id,
      availability: predicateFromFactIds(hypothesis.needs),
      opening_sources: openingSourcesForHypothesis(hypothesis),
    })),
    tiltak: source.tiltak.map((tiltak) => ({
      id: tiltak.id,
      title: tiltak.title,
      sim_hook_id: tiltak.sim_hook_id,
      slot: tiltak.slot,
      cost: tiltak.cost,
      description: tiltak.description,
    })),
    dispatches: source.dispatches.map((dispatch) => ({
      id: dispatch.id,
      title: dispatch.title,
      sim_hook_id: dispatch.sim_hook_id,
      description: dispatch.description,
      visit_hour: dispatch.visit_hour,
      occupies_hours: dispatch.occupies_hours,
      gate: predicateFromGate(dispatch.gate),
      effects: effectsFromLine(dispatch.effects),
    })),
    clocks: source.clocks.map((clock) => {
      const out = {
        id: clock.id,
        label: clock.label,
        sim_hook_id: clock.sim_hook_id,
        question: clock.question,
        good_segment_label: clock.good_segment_label,
        good_segment_size: clock.good_segment_size,
        bad_segment_label: clock.bad_segment_label,
        bad_segment_size: clock.bad_segment_size,
      };
      if (clock.visibility != null) out.visibility = predicateFromGate(clock.visibility);
      return out;
    }),
    event_delta_specs: source.event_deltas.map((delta) => ({
      event_type: delta.event_type,
      log_text: delta.log_text,
      clock_id: delta.clock_id,
      clock_direction: delta.clock_direction,
      reveal_fact_id: delta.reveal_fact_id,
    })),
    day_script_beats: [],
  };

  const labContent = buildLabContent(source, allRunsByDoc);
  warnings.push(...validateArtifacts(source, godotSource));
  return { godotSource, labContent, warnings };
}

function buildLabContent(source, allRunsByDoc) {
  return {
    documents: Object.fromEntries(
      source.documents.map((doc) => [
        doc.id,
        {
          id: doc.id,
          kind: doc.kind,
          title: doc.title,
          register: doc.register,
          peek: doc.peek,
          meta: doc.meta,
          blocks: [
            {
              id: `${doc.id}_body`,
              runs: allRunsByDoc
                .get(doc.id)
                .map((run) => (run.fact_id ? { text: run.text, factId: run.fact_id } : { text: run.text })),
            },
          ],
        },
      ]),
    ),
    facts: Object.fromEntries(
      source.facts.map((fact) => [
        fact.id,
        {
          id: fact.id,
          domain: fact.domain,
          category: fact.category,
          text: fact.summary,
          quote: fact.quote_override ?? quoteForFact(allRunsByDoc, fact.id),
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
        { id: dispatch.id, title: dispatch.title, description: dispatch.description },
      ]),
    ),
  };
}

// === Reverse generator (Godot JSON -> .case.md) ==================================

export function serializeCase(godot) {
  const lines = [];
  lines.push(`# Case: ${godot.id}`);
  lines.push(`Title: ${godot.title}`);
  lines.push(`Scenario stage: ${godot.scenario_stage}`);
  lines.push(`Vurdering frist day: ${godot.vurdering_frist_day ?? 10}`);
  lines.push('');

  for (const doc of godot.documents ?? []) {
    lines.push(`# Document: ${doc.id}`);
    lines.push(`Kind: ${doc.kind}`);
    lines.push(`Title: ${doc.title}`);
    lines.push(`Register: ${doc.register}`);
    lines.push(`Peek: ${doc.peek}`);
    lines.push(`Meta: ${doc.meta}`);
    lines.push('');
    lines.push(bbcodeToEvidenceMarkdown(doc.body_bbcode));
    lines.push('');
  }

  lines.push('# Facts');
  lines.push('');
  for (const fact of godot.facts ?? []) {
    lines.push(`## ${fact.id}`);
    lines.push(`Label: ${fact.label}`);
    lines.push(`Summary: ${fact.summary}`);
    lines.push(`Domain: ${fact.domain}`);
    lines.push(`Category: ${fact.category}`);
    lines.push(`Source: ${fact.source_document_id}`);
    const derived = quoteFromDocuments(godot.documents ?? [], fact.id);
    if ((fact.quote ?? '') !== derived) lines.push(`Quote: ${fact.quote ?? ''}`);
    pushList(lines, 'Supports', fact.supports_questions);
    pushList(lines, 'Discuss', fact.discuss);
    const reveals = (fact.lift_effects ?? [])
      .filter((effect) => effect.op === 'reveal_questions')
      .flatMap((effect) => effect.args?.question_ids ?? []);
    pushList(lines, 'Reveals questions', reveals);
    lines.push('');
  }

  lines.push('# Questions');
  lines.push('');
  for (const question of godot.questions ?? []) {
    lines.push(`## ${question.id}`);
    lines.push(`Title: ${question.prompt}`);
    pushList(lines, 'Opens when', factIdsFromPredicate(question.reveal_when));
    lines.push('');
  }

  lines.push('# Hypotheses');
  lines.push('');
  for (const hypothesis of godot.hypotheses ?? []) {
    lines.push(`## ${hypothesis.id}`);
    lines.push(`Title: ${hypothesis.title}`);
    lines.push(`Summary: ${hypothesis.summary}`);
    lines.push(`Question: ${hypothesis.question_id}`);
    pushList(lines, 'Needs', factIdsFromPredicate(hypothesis.availability));
    const opensTiltak = (hypothesis.opening_sources ?? [])
      .filter((sourceSpec) => sourceSpec.op === 'open_tiltak')
      .flatMap((sourceSpec) => sourceSpec.args?.tiltak_ids ?? []);
    const opensDispatches = (hypothesis.opening_sources ?? [])
      .filter((sourceSpec) => sourceSpec.op === 'open_dispatches')
      .flatMap((sourceSpec) => sourceSpec.args?.dispatch_ids ?? []);
    pushList(lines, 'Opens tiltak', opensTiltak);
    pushList(lines, 'Unlocks dispatches', opensDispatches);
    lines.push('');
  }

  lines.push('# Tiltak');
  lines.push('');
  for (const tiltak of godot.tiltak ?? []) {
    lines.push(`## ${tiltak.id}`);
    lines.push(`Title: ${tiltak.title}`);
    lines.push(`Slot: ${tiltak.slot}`);
    lines.push(`Cost: ${tiltak.cost}`);
    lines.push(`Description: ${tiltak.description}`);
    lines.push(`Sim hook: ${tiltak.sim_hook_id}`);
    lines.push('');
  }

  lines.push('# Dispatches');
  lines.push('');
  for (const dispatch of godot.dispatches ?? []) {
    lines.push(`## ${dispatch.id}`);
    lines.push(`Title: ${dispatch.title}`);
    lines.push(`Description: ${dispatch.description}`);
    lines.push(`Sim hook: ${dispatch.sim_hook_id}`);
    lines.push(`Visit hour: ${dispatch.visit_hour ?? 14}`);
    lines.push(`Occupies hours: ${dispatch.occupies_hours ?? 2}`);
    lines.push(`Gate: ${gateLineFromPredicate(dispatch.gate)}`);
    lines.push(`Effects: ${effectsLineFromEffects(dispatch.effects)}`);
    lines.push('');
  }

  lines.push('# Clocks');
  lines.push('');
  for (const clock of godot.clocks ?? []) {
    lines.push(`## ${clock.id}`);
    lines.push(`Label: ${clock.label}`);
    lines.push(`Sim hook: ${clock.sim_hook_id}`);
    if (clock.question) lines.push(`Question: ${clock.question}`);
    if (clock.good_segment_label) lines.push(`Good label: ${clock.good_segment_label}`);
    if (clock.good_segment_size) lines.push(`Good size: ${clock.good_segment_size}`);
    if (clock.bad_segment_label) lines.push(`Bad label: ${clock.bad_segment_label}`);
    if (clock.bad_segment_size) lines.push(`Bad size: ${clock.bad_segment_size}`);
    if (clock.visibility != null) lines.push(`Visibility: ${gateLineFromPredicate(clock.visibility)}`);
    lines.push('');
  }

  lines.push('# Event deltas');
  lines.push('');
  const deltas = godot.event_delta_specs ?? [];
  if (!deltas.length) {
    lines.push('None');
    lines.push('');
  }
  for (const delta of deltas) {
    lines.push(`## ${delta.event_type}`);
    if (delta.log_text) lines.push(`Log: ${delta.log_text}`);
    if (delta.clock_id) lines.push(`Clock: ${delta.clock_id}`);
    if (delta.clock_direction) lines.push(`Direction: ${delta.clock_direction}`);
    if (delta.reveal_fact_id) lines.push(`Reveals fact: ${delta.reveal_fact_id}`);
    lines.push('');
  }

  lines.push('# Day script beats');
  lines.push('');
  lines.push('None');
  return lines.join('\n') + '\n';
}

function pushList(lines, key, values) {
  if (values && values.length) lines.push(`${key}: ${values.join(', ')}`);
}

function bbcodeToEvidenceMarkdown(bbcode) {
  return (bbcode ?? '').replace(
    /\[url=fact:([a-zA-Z0-9_:-]+)\]([\s\S]*?)\[\/url\]/g,
    (_m, factId, text) => `[${text}](fact:${factId})`,
  );
}

function factIdsFromPredicate(predicate) {
  if (!predicate) return [];
  if (predicate.op === 'fact_lifted') return [predicate.args?.fact_id].filter(Boolean);
  if (predicate.op === 'all') return (predicate.children ?? []).flatMap(factIdsFromPredicate);
  throw new Error(`Cannot express predicate op "${predicate.op}" as a fact list`);
}

function gateLineFromPredicate(predicate) {
  const tokens = [];
  const walk = (node) => {
    if (!node) return;
    if (node.op === 'fact_lifted') tokens.push(`fact ${node.args?.fact_id}`);
    else if (node.op === 'hypothesis_chosen') tokens.push(`hypothesis ${node.args?.hypothesis_id}`);
    else if (node.op === 'all') (node.children ?? []).forEach(walk);
    else throw new Error(`Cannot express gate predicate op "${node.op}"`);
  };
  walk(predicate);
  return tokens.join(' + ');
}

function effectsLineFromEffects(effects) {
  const parts = (effects ?? []).map((effect) => {
    if (effect.op === 'set_scenario_stage') return `scenario_stage ${effect.args?.stage}`;
    if (effect.op === 'queue_pending_document') {
      return `pending_doc ${effect.args?.document_id} after ${effect.args?.delay_days} day on ${effect.args?.clock_id}`;
    }
    throw new Error(`Cannot express effect op "${effect.op}"`);
  });
  return parts.join('; ');
}

function quoteFromDocuments(documents, factId) {
  for (const doc of documents) {
    const run = (doc.runs ?? []).find((candidate) => candidate.fact_id === factId);
    if (run) return run.text;
  }
  return '';
}

// === Shared low-level helpers ====================================================

function sectionBody(text, title, nextTitle) {
  const re = new RegExp(
    `^# ${escapeRegExp(title)}\\s*$([\\s\\S]*?)^# ${escapeRegExp(nextTitle)}\\s*$`,
    'm',
  );
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
    if (!/^[- A-Za-zæøåÆØÅ]+:/.test(line)) {
      throw new Error(`Document metadata must be followed by a blank line before prose; got: ${line}`);
    }
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

function parseIntegerField(value, context) {
  if (!/^-?\d+$/.test(String(value))) throw new Error(`${context} must be an integer, got: ${value}`);
  return Number(value);
}

function listField(fields, key) {
  const value = fields.get(key);
  if (!value || value === 'None') return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseDocumentRuns(markdown, warnings = [], docId = 'document') {
  const runs = [];
  const re = /\[([^\]]+)\]\(fact:([a-zA-Z0-9_:-]+)\)/g;
  let match;
  let cursor = 0;
  let textRunIndex = 0;
  while ((match = re.exec(markdown)) !== null) {
    const before = normalizeRunText(markdown.slice(cursor, match.index));
    if (before) runs.push({ id: `run_text_${textRunIndex++}`, text: before, fact_id: '' });
    runs.push({
      id: `run_${match[2].replace(/^f_/, '')}`,
      text: collapseWhitespace(match[1]),
      fact_id: match[2],
    });
    cursor = match.index + match[0].length;
  }
  const after = normalizeRunText(markdown.slice(cursor));
  if (after) runs.push({ id: `run_text_${textRunIndex++}`, text: after, fact_id: '' });
  if (!runs.some((run) => run.fact_id)) {
    warnings.push(`document ${docId}: no evidence links in body`);
  }
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

function normalizeRunText(value) {
  if (!value) return '';
  const leading = /^\s/.test(value) ? ' ' : '';
  const trailing = /\s$/.test(value) ? ' ' : '';
  const core = collapseWhitespace(value);
  if (!core) return ' ';
  return `${leading}${core}${trailing}`;
}

function quoteForFact(allRunsByDoc, factId) {
  for (const runs of allRunsByDoc.values()) {
    const run = runs.find((candidate) => candidate.fact_id === factId);
    if (run) return run.text;
  }
  return '';
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

function openingSourcesForHypothesis(hypothesis) {
  const sources = [];
  if (hypothesis.opens_tiltak.length) {
    sources.push({ op: 'open_tiltak', args: { tiltak_ids: hypothesis.opens_tiltak } });
  }
  if (hypothesis.unlocks_dispatches.length) {
    sources.push({ op: 'open_dispatches', args: { dispatch_ids: hypothesis.unlocks_dispatches } });
  }
  return sources;
}

function effectsFromLine(line) {
  return line.split(';').map((part) => {
    const token = part.trim();
    const scenarioStage = token.match(/^scenario_stage\s+(\d+)$/);
    if (scenarioStage) return { op: 'set_scenario_stage', args: { stage: Number(scenarioStage[1]) } };
    const pendingDoc = token.match(/^pending_doc\s+(\S+)\s+after\s+(\d+)\s+day\s+on\s+(\S+)$/);
    if (pendingDoc) {
      return {
        op: 'queue_pending_document',
        args: {
          clock_id: pendingDoc[3],
          document_id: pendingDoc[1],
          delay_days: Number(pendingDoc[2]),
        },
      };
    }
    throw new Error(`Unsupported Effects token: ${token}`);
  });
}

// === Validation (warnings, not throws) ===========================================

function validateArtifacts(source, godotSource) {
  const warnings = [];
  const known = (items) => new Set(items.map((item) => item.id));
  const documentIds = known(source.documents);
  const factIds = known(source.facts);
  const questionIds = known(source.questions);
  const hypothesisIds = known(source.hypotheses);
  const tiltakIds = known(source.tiltak);
  const dispatchIds = known(source.dispatches);
  const clockIds = known(source.clocks);
  const warnUnknown = (set, id, label) => {
    if (id && !set.has(id)) warnings.push(`${label} references unknown id ${id}`);
  };

  for (const fact of source.facts) {
    warnUnknown(documentIds, fact.source_document_id, `fact ${fact.id}.Source`);
    for (const questionId of fact.supports) warnUnknown(questionIds, questionId, `fact ${fact.id}.Supports`);
    for (const questionId of fact.reveals_questions) warnUnknown(questionIds, questionId, `fact ${fact.id}.Reveals questions`);
  }
  for (const question of source.questions) {
    for (const factId of question.opens_when) warnUnknown(factIds, factId, `question ${question.id}.Opens when`);
  }
  for (const hypothesis of source.hypotheses) {
    warnUnknown(questionIds, hypothesis.question_id, `hypothesis ${hypothesis.id}.Question`);
    for (const factId of hypothesis.needs) warnUnknown(factIds, factId, `hypothesis ${hypothesis.id}.Needs`);
    for (const tiltakId of hypothesis.opens_tiltak) warnUnknown(tiltakIds, tiltakId, `hypothesis ${hypothesis.id}.Opens tiltak`);
    for (const dispatchId of hypothesis.unlocks_dispatches) warnUnknown(dispatchIds, dispatchId, `hypothesis ${hypothesis.id}.Unlocks dispatches`);
  }
  for (const dispatch of godotSource.dispatches) {
    const walk = (node) => {
      if (!node) return;
      if (node.op === 'fact_lifted') warnUnknown(factIds, node.args?.fact_id, `dispatch ${dispatch.id}.gate`);
      if (node.op === 'hypothesis_chosen') warnUnknown(hypothesisIds, node.args?.hypothesis_id, `dispatch ${dispatch.id}.gate`);
      (node.children ?? []).forEach(walk);
    };
    walk(dispatch.gate);
    for (const effect of dispatch.effects ?? []) {
      if (effect.args?.clock_id) warnUnknown(clockIds, effect.args.clock_id, `dispatch ${dispatch.id}.effects`);
      // NOTE: queued document_ids are NOT checked against authored documents —
      // the Godot engine happily queues/delivers ids without authored content
      // (e.g. pending_konto_overfort; case_engine tests depend on it).
    }
  }
  for (const delta of source.event_deltas) {
    if (delta.clock_id) warnUnknown(clockIds, delta.clock_id, `event delta ${delta.event_type}.Clock`);
    if (delta.reveal_fact_id) warnUnknown(factIds, delta.reveal_fact_id, `event delta ${delta.event_type}.Reveals fact`);
  }
  return warnings;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function stableStringify(value) {
  return JSON.stringify(value, null, '\t') + '\n';
}
