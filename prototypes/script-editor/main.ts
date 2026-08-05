// SB-025 probe — script-first editor over the real 0.2 compiler.
// Probe code: outside tsconfig, Vite transpiles it in dev only.
// Editor surface is CodeMirror 6: native caret, folding, autocomplete,
// hover docs. The compile loop, outline, preview and status bar are ours.
import { compileCase } from '../../src/compiler/index.ts';
import type { CompileResult } from '../../src/compiler/index.ts';
import initialText from '../../content/cases/olsen/tiny-olsen.case.md?raw';
import {
  EditorView,
  keymap,
  lineNumbers,
  hoverTooltip,
  Decoration,
  ViewPlugin,
  ViewUpdate,
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
} from '@codemirror/view';
import type { DecorationSet, Tooltip } from '@codemirror/view';
import { EditorState, RangeSetBuilder } from '@codemirror/state';
import {
  codeFolding,
  foldGutter,
  foldService,
  foldAll,
  foldedRanges,
  unfoldEffect,
  foldKeymap,
} from '@codemirror/language';
import { autocompletion, completionKeymap } from '@codemirror/autocomplete';
import type { CompletionContext, CompletionResult, Completion } from '@codemirror/autocomplete';
import { setDiagnostics } from '@codemirror/lint';
import type { Diagnostic as CmDiagnostic } from '@codemirror/lint';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { buildDocPreviewHtml, injectEditorFonts } from './doc-preview.ts';

injectEditorFonts();

const $ = (id: string) => document.getElementById(id) as HTMLElement;
const outline = $('outline');
const preview = $('preview');
const previewTitle = $('preview-title');
const problemList = $('problem-list');
const problemCount = $('problem-count');
const statusbar = $('statusbar');
const saveState = $('save-state');

// ---- compile state ------------------------------------------------------

interface Heading {
  line: number; // 1-based
  endLine: number;
  kind: string; // Document, Question, … or Fact for ##
  id: string;
}

interface Symbol {
  id: string;
  kind: string;
  label: string;
  defLine: number | null;
}

let result: CompileResult = compileCase(initialText);
let compileMs = 0;
let headings: Heading[] = [];
let symbols = new Map<string, Symbol>();
let dirty = false;

const KIND_OF_PREFIX: Record<string, string> = {
  doc_: 'Document',
  f_: 'Fact',
  q_: 'Question',
  h_: 'Hypothesis',
  t_: 'Tiltak',
  d_: 'Dispatch',
  ck_: 'Clock',
};
const KIND_COLOR: Record<string, string> = {
  Document: 'var(--blue)',
  Fact: 'var(--accent)',
  Question: 'var(--yellow)',
  Hypothesis: 'var(--purple)',
  Tiltak: 'var(--green)',
  Dispatch: 'var(--orange)',
  Clock: 'var(--gold)',
  Beat: 'var(--gold)',
  Conversation: 'var(--green)',
  Proposal: 'var(--purple)',
  Recipe: 'var(--green)',
  Event: 'var(--orange)',
  Case: 'var(--text)',
};

function idKind(id: string): string | null {
  const p = Object.keys(KIND_OF_PREFIX).find((pre) => id.startsWith(pre));
  return p ? KIND_OF_PREFIX[p] : null;
}

function indexHeadings(lines: string[]): Heading[] {
  const hs: Heading[] = [];
  lines.forEach((line, i) => {
    let m = line.match(/^# ([A-Za-z]+)[^:]*:? *([\wæøåÆØÅ_.-]*)/);
    if (m) {
      hs.push({ line: i + 1, endLine: lines.length, kind: m[1], id: m[2] ?? '' });
      return;
    }
    m = line.match(/^## ([\wæøåÆØÅ_.-]+)/);
    if (m) hs.push({ line: i + 1, endLine: lines.length, kind: 'Fact', id: m[1] });
  });
  hs.forEach((h, i) => {
    if (i + 1 < hs.length) h.endLine = hs[i + 1].line - 1;
  });
  return hs;
}

function buildSymbols(): Map<string, Symbol> {
  const map = new Map<string, Symbol>();
  const put = (id: string, kind: string, label: string) => {
    if (!id) return;
    map.set(id, { id, kind, label, defLine: null });
  };
  const lc = result.labContent;
  for (const [id, d] of Object.entries(lc.documents)) put(id, 'Document', d.title);
  for (const [id, f] of Object.entries(lc.facts))
    put(id, 'Fact', (f as { text?: string }).text ?? '');
  const s = result.slice as unknown as Record<string, Array<Record<string, unknown>>>;
  const pools: Array<[string, string]> = [
    ['questions', 'Question'],
    ['hypotheses', 'Hypothesis'],
    ['tiltak', 'Tiltak'],
    ['dispatches', 'Dispatch'],
    ['clocks', 'Clock'],
  ];
  for (const [pool, kind] of pools) {
    for (const n of s[pool] ?? []) {
      const id = n.id as string;
      const label = (n.title ?? n.label ?? n.question ?? '') as string;
      put(id, kind, label);
    }
  }
  for (const h of headings) {
    const existing = map.get(h.id);
    if (existing) existing.defLine = h.line;
    else if (h.id) map.set(h.id, { id: h.id, kind: h.kind, label: '', defLine: h.line });
  }
  return map;
}

// ---- token classifier ---------------------------------------------------

interface Tok {
  start: number;
  end: number;
  cls: string;
  prio: number;
}

const HEAD_CLASS: Record<string, string> = {
  Document: 'tok-h-doc',
  Fact: 'tok-h-fact',
  Question: 'tok-h-question',
  Hypothesis: 'tok-h-hypothesis',
  Tiltak: 'tok-h-tiltak',
  Dispatch: 'tok-h-dispatch',
  Clock: 'tok-h-clock',
  Beat: 'tok-h-clock',
  Conversation: 'tok-h-tiltak',
  Proposal: 'tok-h-hypothesis',
  Recipe: 'tok-h-tiltak',
  Event: 'tok-h-dispatch',
  Case: 'tok-h-case',
};
const ID_CLASS: Record<string, string> = {
  Document: 'tok-id-doc',
  Fact: 'tok-id-fact',
  Question: 'tok-id-question',
  Hypothesis: 'tok-id-hypothesis',
  Tiltak: 'tok-id-tiltak',
  Dispatch: 'tok-id-dispatch',
  Clock: 'tok-id-clock',
};
const GATE_KEYS = /^(when|needs|gate|visible when|arrives|Opens when|Needs|Gate|Arrives)$/i;
const OPEN_KEYS = /^(Opens|Leads|Supports)$/;

function classifyLine(raw: string): Tok[] {
  const toks: Tok[] = [];
  const add = (start: number, end: number, cls: string, prio: number) => {
    if (end > start) toks.push({ start, end, cls, prio });
  };
  // whole-line cases first
  const head = raw.match(/^(#{1,2}) ?([A-Za-z]+)?/);
  if (raw.startsWith('## ')) {
    add(0, raw.length, 'tok-h-fact', 100);
  } else if (raw.startsWith('# ') && head?.[2]) {
    add(0, raw.length, HEAD_CLASS[head[2]] ?? 'tok-h-case', 100);
  }
  if (/^TODO:/.test(raw)) add(0, raw.length, 'tok-todo', 95);
  // comment tail
  const ci = raw.indexOf('//');
  if (ci >= 0) add(ci, raw.length, 'tok-comment', 90);
  // effect lines
  const eff = raw.match(/^(\s*)(~ *\w+)/);
  if (eff) add(eff[1].length, eff[1].length + eff[2].length, 'tok-effect', 60);
  // weave markers
  const weave = raw.match(/^(\s*)([*+]+ ?[*+]* ?|- |-> ?\w*)/);
  if (weave && !eff) add(weave[1].length, weave[1].length + weave[2].length, 'tok-weave', 55);
  // guards {…}
  for (const m of raw.matchAll(/\{[^}]*\}/g))
    add(m.index!, m.index! + m[0].length, 'tok-guard', 50);
  // field keys — line start and after '·'
  for (const m of raw.matchAll(/(^|· )([A-Za-zÆØÅ][\wæøåÆØÅ ]{0,15}?):(?= |$)/gu)) {
    const key = m[2];
    const start = m.index! + m[1].length;
    const cls = GATE_KEYS.test(key)
      ? 'tok-key-gate'
      : OPEN_KEYS.test(key)
        ? key === 'Supports'
          ? 'tok-key-needs'
          : 'tok-key-opens'
        : /^(needs|Needs)$/.test(key)
          ? 'tok-key-needs'
          : 'tok-key';
    add(start, start + key.length + 1, cls, 45);
  }
  // anchors [text](fact:id)
  for (const m of raw.matchAll(/\[([^\]]*)\]\((fact:[\wæøå_.-]+)\)/g)) {
    const textStart = m.index! + 1;
    add(textStart, textStart + m[1].length, 'tok-anchor-text', 40);
    const refStart = m.index! + m[0].length - m[2].length - 1;
    add(refStart, refStart + m[2].length, 'tok-anchor-ref', 40);
  }
  // quotes «…»
  for (const m of raw.matchAll(/«[^»]*»/g)) add(m.index!, m.index! + m[0].length, 'tok-quote', 35);
  // icons [icon=x]
  for (const m of raw.matchAll(/\[icon=\w+\]/g))
    add(m.index!, m.index! + m[0].length, 'tok-icon', 33);
  // ids, colored by prefix, everywhere
  for (const m of raw.matchAll(/\b(doc_|f_|q_|h_|t_|d_|ck_)[a-z0-9_]+\b/g)) {
    const kind = KIND_OF_PREFIX[m[1]];
    add(m.index!, m.index! + m[0].length, ID_CLASS[kind] ?? 'tok-id', 30);
  }
  // condition keywords on gate/guard lines
  if (/^(when|needs|gate|visible when|Opens when|Needs|Gate):/i.test(raw) || /\{/.test(raw)) {
    for (const m of raw.matchAll(/\b(and|or|not|of|taken|open|done|day|stage)\b/g))
      add(m.index!, m.index! + m[0].length, 'tok-kw', 20);
  }
  // overlap filter: high priority wins, then sort by position
  toks.sort((a, b) => b.prio - a.prio || a.start - b.start);
  const kept: Tok[] = [];
  for (const t of toks) {
    if (t.prio === 100 || t.prio === 95) {
      // whole-line paint coexists with inner tokens via CSS (line color + spans)
      kept.push(t);
      continue;
    }
    if (!kept.some((k) => k.prio < 100 && k.prio !== 95 && t.start < k.end && k.start < t.end))
      kept.push(t);
  }
  return kept.sort((a, b) => a.start - b.start || b.prio - a.prio);
}

// heading/TODO lines paint as line decorations, tokens as marks
const highlighter = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = this.build(view);
    }
    update(u: ViewUpdate) {
      if (u.docChanged || u.viewportChanged) this.decorations = this.build(u.view);
    }
    build(view: EditorView): DecorationSet {
      const b = new RangeSetBuilder<Decoration>();
      for (const { from, to } of view.visibleRanges) {
        let pos = from;
        while (pos <= to) {
          const line = view.state.doc.lineAt(pos);
          const toks = classifyLine(line.text);
          for (const t of toks) {
            if (t.prio >= 95) {
              b.add(line.from, line.from, Decoration.line({ class: t.cls }));
            } else {
              b.add(line.from + t.start, line.from + t.end, Decoration.mark({ class: t.cls }));
            }
          }
          pos = line.to + 1;
        }
      }
      return b.finish();
    }
  },
  { decorations: (v) => v.decorations },
);

// ---- folding: a section folds from its heading to the section end -------

const sectionFolding = foldService.of((state: EditorState, lineStart: number) => {
  const line = state.doc.lineAt(lineStart);
  const h = headings.find((x) => x.line === line.number);
  if (!h || h.endLine <= h.line) return null;
  let end = h.endLine;
  while (end > h.line && state.doc.line(end).text.trim() === '') end--;
  if (end <= h.line) return null;
  return { from: line.to, to: state.doc.line(end).to };
});

// ---- field docs (from docs/markup-0.2-reference.md) ---------------------

const KEY_DOCS: Record<string, string> = {
  Kind: 'Document type as shown in the game (BREV, BEKYMRINGSMELDING, MELDING …). Pairs with Register on one line.',
  Register: 'The document’s voice: formell · klinisk · notat. Drives how the prose renders.',
  Title: 'Display name of this node.',
  Peek: 'One-line teaser («…») shown before the player opens the document.',
  Meta: 'The header line rendered on the document itself: sender · form · delivery.',
  Arrives: 'Delivery gate: day N [on ck_x] — when the document reaches the player.',
  arrives: 'Delivery gate: day N [on ck_x] — when the document reaches the player.',
  Label: 'Short display name (facts, clocks).',
  Summary: 'The fact as one sentence — what the player holds after lifting it.',
  Domain:
    'Life area: Økonomi/bolig · Helse/risiko · Hverdag/rutine · Nettverk/sosialt. Pairs with Category.',
  Category: 'Card category on the board: Dokument · Risiko · Økonomi …',
  About: 'Who the fact concerns (elling, grete, utleier …).',
  Supports: 'The question(s) this fact is evidence for — these are the fact→question edges.',
  Discuss: 'Who this fact can be discussed with (Frank, Grete).',
  Frank: 'Frank’s spoken take on the fact («…»).',
  Source:
    'Standalone fact only: the document it comes from. A ## fact under a document inherits it.',
  Teaser: 'Hint text shown before the question opens.',
  when: 'Open gate — §6 condition grammar: and · or · not · ( ) · n of (…) · day >= N · stage N.',
  'Opens when': 'Legacy 0.1 gate; a comma list reads as “and”. Same as when:.',
  needs: 'Evidence gate on a hypothesis — §6 condition.',
  Needs: 'Evidence gate on a hypothesis — §6 condition (legacy capitalized form).',
  gate: 'Availability gate on a dispatch — §6 condition.',
  Gate: 'Availability gate on a dispatch — §6 condition (legacy capitalized form).',
  'visible when': 'When the clock becomes visible to the player — §6 condition.',
  Leads: 'The tiltak this question points toward.',
  Question: 'The question this node belongs to (hypotheses, clocks).',
  Opens: 'What a proven hypothesis unlocks: tiltak, dispatches, conversations [risk=…].',
  Slot: 'Action economy: which dice slot the tiltak occupies.',
  Cost: 'Coin cost of the tiltak.',
  Weight: 'Commitment weight: normal · heavy.',
  Description: 'Card body text for the tiltak.',
  'Sim hook': 'Godot-side hook id this tiltak triggers.',
  Channel: 'Dispatch channel: scheduled · immediate.',
  Delay: 'Minutes before the dispatch runs.',
  Duration: 'How long the dispatch takes.',
  Occupies: 'How long the dispatch blocks its channel.',
  Reception: 'Reception modifier the dispatch applies.',
  Good: 'Clock good outcome: label / segment count.',
  Bad: 'Clock bad outcome: label / segment count.',
  Stage: 'Scenario stage this case starts in.',
  Deadline: 'Case deadline: day N.',
  TODO: 'Tracked work — surfaces in the status bar, preview and playtest. Never fatal.',
};

const EFFECT_DOCS: Record<string, string> = {
  pay: '~ pay f_x — reveal a fact to the player.',
  clock: '~ clock ck_x +1 — tick a clock (either direction).',
  deliver: '~ deliver doc_x in 1d [on ck_y] — queue a document delivery.',
  open: '~ open q_x — force a question open.',
  stage: '~ stage 1 — advance the scenario stage.',
  log: '~ log «…» — write a line to the case log.',
};

// ---- autocomplete -------------------------------------------------------

function idCompletions(filterKinds: string[] | null): Completion[] {
  const out: Completion[] = [];
  for (const s of symbols.values()) {
    if (filterKinds && !filterKinds.includes(s.kind)) continue;
    out.push({
      label: s.id,
      type: 'variable',
      detail: s.label ? s.label.slice(0, 48) : undefined,
      info: `${s.kind}${s.defLine ? ` · defined L${s.defLine}` : ' · stub (no definition)'}`,
      boost: s.kind === 'Fact' ? 1 : 0,
    });
  }
  return out;
}

const KEY_KIND_HINTS: Record<string, string[] | null> = {
  Supports: ['Question'],
  Leads: ['Tiltak'],
  Question: ['Question'],
  Opens: ['Tiltak', 'Dispatch', 'Conversation'],
  Source: ['Document'],
};

function completeCase(context: CompletionContext): CompletionResult | null {
  const line = context.state.doc.lineAt(context.pos);
  const before = line.text.slice(0, context.pos - line.from);
  // fact anchors: [text](fact:…
  const anchor = before.match(/fact:([\wæøå_.-]*)$/);
  if (anchor) {
    return {
      from: context.pos - anchor[1].length,
      options: idCompletions(['Fact']),
      validFor: /^[\wæøå_.-]*$/,
    };
  }
  const word = context.matchBefore(/[\wæøå_.-]+/);
  // id positions: reference fields, gates, effect lines, guards
  const keyMatch = line.text.match(/^([A-Za-zÆØÅ][\wæøåÆØÅ ]{0,15}?):/u);
  const inGate =
    (keyMatch && GATE_KEYS.test(keyMatch[1])) ||
    /^(when|needs|gate|visible when):/i.test(line.text) ||
    /\{[^}]*$/.test(before);
  const inEffect = /^\s*~ *(pay|open|deliver|clock)\b/.test(line.text);
  const inRefField = keyMatch && KEY_KIND_HINTS[keyMatch[1]] !== undefined;
  if (word && (inGate || inEffect || inRefField)) {
    const hint = inRefField ? KEY_KIND_HINTS[keyMatch![1]] : null;
    if (!context.explicit && word.text.length < 2) return null;
    return { from: word.from, options: idCompletions(hint), validFor: /^[\wæøå_.-]*$/ };
  }
  // field keys at line start
  if (/^[A-Za-z]*$/.test(before) && (context.explicit || before.length >= 2)) {
    const options: Completion[] = Object.entries(KEY_DOCS)
      .filter(([k]) => /^[A-Z]/.test(k))
      .map(([k, doc]) => ({ label: `${k}: `, displayLabel: k, type: 'keyword', info: doc }));
    return { from: line.from, options, validFor: /^[A-Za-z]*$/ };
  }
  return null;
}

// ---- hover docs ---------------------------------------------------------

function tooltipDom(title: string, body: string, color?: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'kv-tip';
  el.innerHTML = `<div class="kv-tip-title"${color ? ` style="color:${color}"` : ''}>${title}</div><div class="kv-tip-body">${body}</div>`;
  return el;
}

// id token at a document position, or null
function idAtPos(v: EditorView, pos: number): string | null {
  const line = v.state.doc.lineAt(pos);
  const col = pos - line.from;
  for (const m of line.text.matchAll(/\b(doc_|f_|q_|h_|t_|d_|ck_)[a-z0-9_]+\b/g)) {
    if (col >= m.index! && col <= m.index! + m[0].length) return m[0];
  }
  return null;
}

// ⌘-click on an id → jump to its definition (heading line)
const gotoDefinition = EditorView.domEventHandlers({
  mousedown(event, v) {
    if (!(event.metaKey || event.ctrlKey) || event.button !== 0) return false;
    const pos = v.posAtCoords({ x: event.clientX, y: event.clientY });
    if (pos == null) return false;
    const id = idAtPos(v, pos);
    const defLine = id ? symbols.get(id)?.defLine : null;
    if (!defLine) return false;
    event.preventDefault();
    jumpToLine(defLine);
    return true;
  },
});

// IDE affordance: while ⌘ is held, ids underline and show a pointer
window.addEventListener('keydown', (e) => {
  if (e.key === 'Meta' || e.key === 'Control') document.body.classList.add('goto-mode');
});
window.addEventListener('keyup', (e) => {
  if (e.key === 'Meta' || e.key === 'Control') document.body.classList.remove('goto-mode');
});
window.addEventListener('blur', () => document.body.classList.remove('goto-mode'));

const hoverDocs = hoverTooltip((view, pos): Tooltip | null => {
  const line = view.state.doc.lineAt(pos);
  const col = pos - line.from;
  // id under cursor?
  for (const m of line.text.matchAll(/\b(doc_|f_|q_|h_|t_|d_|ck_)[a-z0-9_]+\b/g)) {
    if (col >= m.index! && col <= m.index! + m[0].length) {
      const id = m[0];
      const sym = symbols.get(id);
      const kind = sym?.kind ?? idKind(id) ?? 'id';
      const color = KIND_COLOR[kind];
      const body = sym
        ? `${sym.label ? `«${sym.label}»<br>` : ''}${sym.defLine ? `defined at L${sym.defLine} — ⌘-click to jump` : '<span style="color:var(--danger)">stub — no definition yet</span>'}`
        : '<span style="color:var(--danger)">stub — no definition yet</span>';
      return {
        pos: line.from + m.index!,
        end: line.from + m.index! + id.length,
        above: true,
        create: () => ({ dom: tooltipDom(`${kind} · ${id}`, body, color) }),
      };
    }
  }
  // field key under cursor?
  for (const m of line.text.matchAll(/(^|· )([A-Za-zÆØÅ][\wæøåÆØÅ ]{0,15}?):(?= |$)/gu)) {
    const start = m.index! + m[1].length;
    if (col >= start && col <= start + m[2].length) {
      const doc = KEY_DOCS[m[2]] ?? KEY_DOCS[m[2].toLowerCase()];
      if (!doc) return null;
      return {
        pos: line.from + start,
        end: line.from + start + m[2].length,
        above: true,
        create: () => ({ dom: tooltipDom(`${m[2]}:`, doc) }),
      };
    }
  }
  // effect verb?
  const eff = line.text.match(/^\s*~ *(\w+)/);
  if (eff && EFFECT_DOCS[eff[1]]) {
    const start = line.text.indexOf('~');
    if (col >= start && col <= start + eff[0].trim().length) {
      return {
        pos: line.from + start,
        above: true,
        create: () => ({ dom: tooltipDom(`~ ${eff[1]}`, EFFECT_DOCS[eff[1]]) }),
      };
    }
  }
  return null;
});

// ---- diagnostics --------------------------------------------------------

function pushDiagnostics(view: EditorView) {
  const doc = view.state.doc;
  const diags: CmDiagnostic[] = [];
  for (const d of result.diagnostics) {
    const startLine = Math.min(d.span.startLine, doc.lines);
    const endLine = Math.min(d.span.endLine, doc.lines);
    const from = doc.line(startLine).from;
    const to = doc.line(endLine).to;
    const severity =
      d.severity === 'error' ? 'error' : d.severity === 'warning' ? 'warning' : 'info';
    diags.push({ from, to, severity, source: d.code, message: d.message });
  }
  view.dispatch(setDiagnostics(view.state, diags));
}

// ---- theme --------------------------------------------------------------

const theme = EditorView.theme(
  {
    '&': {
      backgroundColor: 'var(--surface-code)',
      color: 'var(--text-prose)',
      height: '100%',
      fontSize: '12px',
    },
    '.cm-scroller': {
      fontFamily: 'var(--mono)',
      lineHeight: '1.85',
      paddingBottom: '40vh',
    },
    '.cm-content': { caretColor: 'var(--text)' },
    '.cm-cursor': { borderLeftColor: 'var(--text)' },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
      backgroundColor: 'rgba(123,131,235,.22) !important',
    },
    '.cm-gutters': {
      backgroundColor: 'var(--surface-code)',
      color: 'var(--text-4)',
      border: 'none',
      paddingLeft: '6px',
    },
    '.cm-activeLine': { backgroundColor: 'rgba(255,255,255,.025)' },
    '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--text-2)' },
    '.cm-foldGutter .cm-gutterElement': { cursor: 'pointer', color: 'var(--text-4)' },
    '.cm-foldPlaceholder': {
      background: 'var(--panel-hover)',
      border: '1px solid var(--border-2)',
      color: 'var(--text-3)',
      borderRadius: '4px',
      padding: '0 7px',
      margin: '0 4px',
      fontSize: '10px',
    },
    '.cm-tooltip': {
      backgroundColor: 'var(--surface-toast, #1d1f27)',
      border: '1px solid var(--border-2)',
      borderRadius: '8px',
      color: 'var(--text-2)',
    },
    '.cm-tooltip.cm-tooltip-autocomplete > ul': {
      fontFamily: 'var(--mono)',
      fontSize: '11px',
      maxHeight: '260px',
    },
    '.cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]': {
      background: 'var(--panel-hover)',
      color: 'var(--text)',
    },
    '.cm-completionDetail': { color: 'var(--text-3)', fontStyle: 'normal', marginLeft: '0.8em' },
    '.cm-tooltip.cm-tooltip-lint': { fontFamily: 'var(--mono)', fontSize: '11px' },
    '.cm-lintRange-error': { textDecorationColor: 'var(--danger)' },
    '.cm-lintRange-warning': { textDecorationColor: 'var(--orange)' },
    '.cm-lintRange-info': { textDecorationColor: 'var(--text-4)' },
    '.cm-panels': { backgroundColor: 'var(--bg-side)', color: 'var(--text-2)' },
    '.cm-searchMatch': { backgroundColor: 'rgba(226,197,65,.25)' },
    '.cm-selectionMatch': { backgroundColor: 'rgba(123,131,235,.15)' },
  },
  { dark: true },
);

// ---- view ---------------------------------------------------------------

let compileTimer: ReturnType<typeof setTimeout> | undefined;
let cursorTimer: ReturnType<typeof setTimeout> | undefined;

// Draft persistence: the buffer survives page reloads (vite live-reload wiped
// an unsaved buffer once — never again). Every edit lands in localStorage;
// a successful ⌘S clears it. On boot a draft that differs from disk wins.
const DRAFT_KEY = 'kildeverket-draft:content/cases/olsen/tiny-olsen.case.md';
const draft = localStorage.getItem(DRAFT_KEY);
const draftRestored = draft != null && draft !== initialText;
const bootText = draftRestored ? draft : initialText;
let draftTimer: ReturnType<typeof setTimeout> | undefined;

const view = new EditorView({
  parent: $('editor-pane'),
  state: EditorState.create({
    doc: bootText,
    extensions: [
      lineNumbers(),
      history(),
      drawSelection(),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      highlightSelectionMatches(),
      codeFolding({
        placeholderText: '…',
      }),
      sectionFolding,
      foldGutter({ openText: '▾', closedText: '▸' }),
      highlighter,
      autocompletion({ override: [completeCase], activateOnTyping: true }),
      hoverDocs,
      gotoDefinition,
      theme,
      EditorView.lineWrapping,
      keymap.of([
        {
          key: 'Mod-s',
          run: () => {
            void save();
            return true;
          },
        },
        indentWithTab,
        ...completionKeymap,
        ...defaultKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...searchKeymap,
      ]),
      EditorView.updateListener.of((u) => {
        if (u.docChanged) {
          dirty = true;
          saveState.textContent = 'unsaved changes';
          saveState.classList.add('dirty');
          clearTimeout(compileTimer);
          compileTimer = setTimeout(recompile, 150);
          clearTimeout(draftTimer);
          draftTimer = setTimeout(() => {
            localStorage.setItem(DRAFT_KEY, u.state.doc.toString());
          }, 300);
        }
        if (u.selectionSet || u.docChanged) {
          clearTimeout(cursorTimer);
          cursorTimer = setTimeout(onCursor, 80);
        }
      }),
    ],
  }),
});

// ---- outline ------------------------------------------------------------

function headingAt(line: number): Heading | null {
  let found: Heading | null = null;
  for (const h of headings) {
    if (h.line <= line) found = h;
    else break;
  }
  return found;
}

function renderOutline(currentLine: number) {
  const lc = result.labContent;
  const slice = result.slice as unknown as Record<string, unknown[]>;
  const docEntries = Object.entries(lc.documents);
  const current = headingAt(currentLine);
  const kinds: Array<{
    label: string;
    dot: string;
    count: number;
    items?: Array<{ id: string; label: string; kind: string }>;
  }> = [
    {
      label: 'Documents',
      dot: 'var(--blue)',
      count: docEntries.length,
      items: docEntries.map(([id, d]) => ({
        id,
        label: (d as { title?: string }).title || id,
        kind: 'Document',
      })),
    },
    { label: 'Facts', dot: 'var(--accent)', count: Object.keys(lc.facts).length },
    {
      label: 'Questions',
      dot: 'var(--yellow)',
      count: slice.questions.length,
      items: (slice.questions as Array<{ id: string }>).map((q) => ({
        id: q.id,
        label: q.id,
        kind: 'Question',
      })),
    },
    { label: 'Hypotheses', dot: 'var(--purple)', count: slice.hypotheses.length },
    { label: 'Tiltak', dot: 'var(--green)', count: slice.tiltak.length },
    { label: 'Dispatches', dot: 'var(--orange)', count: slice.dispatches.length },
    { label: 'Clocks', dot: 'var(--gold)', count: slice.clocks.length },
    { label: 'Day beats', dot: 'var(--yellow)', count: slice.day_script_beats.length },
  ];
  const parts: string[] = [`<div class="head">CASE OLSEN</div>`];
  for (const k of kinds) {
    parts.push(
      `<div class="o-kind" data-kind="${k.label}"><span class="dot" style="background:${k.dot}"></span>${k.label}<span class="count">${k.count}</span></div>`,
    );
    for (const it of k.items ?? []) {
      const cur = current && current.id === it.id ? ' current' : '';
      parts.push(
        `<div class="o-item${cur}" data-kind="${it.kind}" data-id="${it.id}">${esc(it.label)}</div>`,
      );
    }
  }
  parts.push(
    `<div class="legend"><div class="head">MARKUP</div><div class="body"><span style="color:var(--accent)">[text](fact:id)</span> anchor · type <span style="color:var(--accent)">fact:</span> for id picker<br><span style="color:var(--yellow)">when:</span> gate · <span style="color:var(--purple)">needs:</span> evidence<br><span style="color:var(--green)">~ pay / deliver / open</span> effects<br><span style="color:var(--orange)">TODO:</span> shows everywhere<br>hover any <span style="color:var(--text-2)">key:</span> or id for docs</div></div>`,
  );
  outline.innerHTML = parts.join('');
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

outline.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest('.o-item, .o-kind') as HTMLElement | null;
  if (!el) return;
  if (el.dataset.id) {
    jumpToHeading(el.dataset.kind!, el.dataset.id);
  } else if (el.dataset.kind) {
    const first = headings.find(
      (h) => h.kind === el.dataset.kind || (el.dataset.kind === 'Facts' && h.kind === 'Fact'),
    );
    if (first) jumpToLine(first.line);
  }
});

// ---- preview ------------------------------------------------------------

function enclosingDocument(h: Heading): Heading | null {
  if (h.kind === 'Document') return h;
  if (h.kind !== 'Fact') return null;
  let doc: Heading | null = null;
  for (const other of headings) {
    if (other.line > h.line) break;
    if (other.kind === 'Document') doc = other;
    else if (other.kind !== 'Fact') doc = null;
  }
  return doc;
}

function renderPreview(line: number) {
  const h = headingAt(line);
  if (!h) {
    previewTitle.textContent = 'PREVIEW';
    preview.innerHTML = '<div class="empty">Place the cursor in a section.</div>';
    return;
  }
  if (h.kind === 'Fact' && result.labContent.facts[h.id]) {
    renderFactCard(h.id);
    return;
  }
  const doc = enclosingDocument(h);
  if (doc && result.labContent.documents[doc.id]) {
    renderDocPreview(doc.id, h.kind === 'Fact' ? h.id : null);
    return;
  }
  renderNodePreview(h);
}

function sourceDocOf(factId: string): string | null {
  for (const [docId, d] of Object.entries(result.labContent.documents)) {
    if (d.blocks.some((b) => b.runs.some((r) => r.factId === factId))) return docId;
  }
  return null;
}

// FUNN card — the in-game desk fact card (scenes/ui/hand_card.tscn look):
// red top rule, red FUNN stamp, Fraunces quote, source line. Editor extras
// (supports/discuss/source links) ride below the card face in stamp type.
function renderFactCard(factId: string) {
  const f = result.labContent.facts[factId];
  previewTitle.textContent = `FUNN — ${factId.toUpperCase()}`;
  const questions = result.slice.questions as unknown as Array<{ id: string; title?: string }>;
  const supports = (f.supports ?? [])
    .map((qId) => {
      const q = questions.find((x) => x.id === qId);
      return q
        ? `<span class="fc-link" data-jump-kind="Question" data-jump-id="${qId}">? &nbsp;${esc(q.title || qId)}</span>`
        : `<span class="fc-link dead">? &nbsp;${qId} — stub</span>`;
    })
    .join('');
  const discuss = (f.discuss ?? [])
    .map((p) => `<span class="fc-link dead">${p === 'Frank' ? '☎' : '○'} &nbsp;${esc(p)}</span>`)
    .join('');
  const srcDoc = sourceDocOf(factId);
  const srcTitle = srcDoc ? result.labContent.documents[srcDoc].title : null;
  const quote = f.quote || f.text || '';
  preview.innerHTML =
    `<div class="funn-card">` +
    `<div class="funn-rule"></div>` +
    `<div class="funn-stamp">FUNN</div>` +
    `<div class="funn-quote">«${esc(quote)}»</div>` +
    `<div class="funn-source">${esc(srcTitle || '—')}</div>` +
    `</div>` +
    `<div class="funn-meta">` +
    `<div class="fc-rel"><h4>${esc(f.domain || '—')} · ${esc(f.category || '—')}</h4></div>` +
    `<div class="fc-rel"><h4>HENGER SAMMEN MED</h4>${supports || '<span class="fc-link dead">ingen spørsmål ennå</span>'}</div>` +
    (discuss ? `<div class="fc-rel"><h4>KAN DRØFTES MED</h4>${discuss}</div>` : '') +
    (srcDoc
      ? `<div class="fc-rel"><h4>KILDE</h4><span class="fc-link" data-jump-kind="Document" data-jump-id="${srcDoc}">▤ &nbsp;${esc(srcTitle || srcDoc)}</span></div>`
      : `<div class="fc-rel"><h4>KILDE</h4><span class="fc-link dead">ingen anker i noe dokument — lint: fact without source anchor</span></div>`) +
    `</div>`;
}

// Real bake template in an iframe — the same HTML the Playwright bake
// screenshots into core-loop textures, scaled to the rail.
function renderDocPreview(docId: string, focusFact: string | null) {
  const d = result.labContent.documents[docId];
  previewTitle.textContent = `PREVIEW — ${docId.toUpperCase()}`;
  const factIds = new Set<string>();
  d.blocks.forEach((b) => b.runs.forEach((r) => r.factId && factIds.add(r.factId)));
  const questions = new Set<string>();
  factIds.forEach((f) =>
    (result.labContent.facts[f]?.supports ?? []).forEach((q) => questions.add(q)),
  );
  const { html, width, kindUsed, fallback } = buildDocPreviewHtml(docId, d as never);
  preview.innerHTML =
    (fallback
      ? `<div class="chips" style="margin-bottom:8px"><span class="chip" style="color:var(--orange);border-color:rgba(240,136,62,.35);background:var(--tint-orange)">no template for ${esc(d.kind)} — showing ${esc(kindUsed)}</span></div>`
      : '') +
    `<div class="doc-frame-wrap"><iframe id="doc-frame" title="${esc(docId)}"></iframe></div>` +
    `<div class="lb-hint">click the page to read it full size</div>` +
    `<div class="feeds-head">THIS SECTION FEEDS</div><div class="chips">` +
    `<span class="chip" style="color:var(--accent);border-color:rgba(123,131,235,.3);background:var(--tint-accent)">${factIds.size} facts</span>` +
    (questions.size
      ? `<span class="chip" style="color:var(--yellow);border-color:rgba(226,197,65,.3);background:var(--tint-yellow)">${[...questions].join(' · ')}</span>`
      : '') +
    `</div>`;
  const wrap = preview.querySelector('.doc-frame-wrap') as HTMLElement;
  const iframe = preview.querySelector('#doc-frame') as HTMLIFrameElement;
  wireDocFrame(iframe, wrap, html, width, focusFact, () => openLightbox(html, width, focusFact));
}

// Shared iframe wiring: scale-to-fit, focus highlight, anchor click-to-jump,
// and (rail only) click-anywhere-else opens the readable lightbox.
function wireDocFrame(
  iframe: HTMLIFrameElement,
  wrap: HTMLElement,
  html: string,
  width: number,
  focusFact: string | null,
  onPageClick: (() => void) | null,
) {
  iframe.style.width = `${width}px`;
  iframe.addEventListener('load', () => {
    const idoc = iframe.contentDocument;
    if (!idoc) return;
    if (focusFact) {
      idoc.querySelector(`[data-fact-id="${focusFact}"]`)?.classList.add('focus');
    }
    if (onPageClick) idoc.body.style.cursor = 'zoom-in';
    idoc.addEventListener('click', (ev) => {
      const el = (ev.target as HTMLElement).closest('[data-fact-id]');
      const id = el?.getAttribute('data-fact-id');
      if (id) {
        closeLightbox();
        jumpToHeading('Fact', id);
      } else if (onPageClick) {
        onPageClick();
      }
    });
    const fit = () => {
      const h = idoc.body?.scrollHeight ?? 0;
      const scale = Math.min(1, wrap.clientWidth / width);
      iframe.style.height = `${h}px`;
      iframe.style.transform = `scale(${scale})`;
      wrap.style.height = `${h * scale}px`;
    };
    fit();
    // refit once webfonts finish loading (reflow changes page height)
    idoc.fonts?.ready.then(fit).catch(() => {});
  });
  iframe.srcdoc = html;
}

// Readable full-size view over the editor. Esc / backdrop click closes.
const lightbox = $('doc-lightbox');
function openLightbox(html: string, width: number, focusFact: string | null) {
  lightbox.innerHTML = `<div class="lb-inner"><iframe title="document"></iframe></div>`;
  lightbox.classList.add('open');
  const inner = lightbox.querySelector('.lb-inner') as HTMLElement;
  inner.style.width = `${Math.min(width, window.innerWidth * 0.86)}px`;
  wireDocFrame(inner.querySelector('iframe')!, inner, html, width, focusFact, null);
}
function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.innerHTML = '';
}
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
});

function renderNodePreview(h: Heading) {
  previewTitle.textContent = `PREVIEW — ${h.id ? h.id.toUpperCase() : h.kind.toUpperCase()}`;
  const slice = result.slice as unknown as Record<string, Array<{ id?: string }>>;
  const pools = ['questions', 'hypotheses', 'tiltak', 'dispatches', 'clocks', 'day_script_beats'];
  let node: unknown = null;
  for (const p of pools) {
    node = (slice[p] ?? []).find((n) => n.id === h.id);
    if (node) break;
  }
  if (!node && h.kind === 'Fact') node = result.labContent.facts[h.id];
  const color = KIND_COLOR[h.kind] ?? 'var(--text-2)';
  const body = node
    ? `<div class="node-json">${esc(JSON.stringify(node, null, 2))}</div>`
    : `<div class="node-json" style="color:var(--text-4)">No compiled node for this section (${esc(h.kind.toLowerCase())} — parsed but not emitted, or a stub).</div>`;
  preview.innerHTML = `<div class="node-card"><div class="node-kind" style="color:${color}">${h.kind.toUpperCase()} · COMPILED OUTPUT</div><div class="node-id">${esc(h.id || '—')}</div>${body}</div>`;
}

preview.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const anchor = target.closest('[data-fact]') as HTMLElement | null;
  if (anchor?.dataset.fact) {
    jumpToHeading('Fact', anchor.dataset.fact);
    return;
  }
  const jump = target.closest('[data-jump-id]') as HTMLElement | null;
  if (jump?.dataset.jumpId) jumpToHeading(jump.dataset.jumpKind ?? '', jump.dataset.jumpId);
});

// ---- problems + status --------------------------------------------------

function renderProblems() {
  const items = [...result.diagnostics].sort((a, b) => a.span.startLine - b.span.startLine);
  problemCount.textContent = `${items.length}`;
  problemList.innerHTML = items
    .map(
      (d) =>
        `<div class="prob" data-line="${d.span.startLine}"><span class="sev sev-${d.severity}"></span><span class="line">L${d.span.startLine}</span><span class="msg" title="${esc(d.code)} — ${esc(d.message)}">${esc(d.message)}</span></div>`,
    )
    .join('');
}

problemList.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest('.prob') as HTMLElement | null;
  if (el) jumpToLine(Number(el.dataset.line));
});

function renderStatus() {
  const ds = result.diagnostics;
  const errors = ds.filter((d) => d.severity === 'error').length;
  const todos = ds.filter((d) => d.code === 'todo-line');
  const stubs = ds.filter((d) => d.code === 'stub-unresolved-id');
  const warnings = ds.filter((d) => d.severity === 'warning' && d.code !== 'stub-unresolved-id');
  const advisories = ds.filter((d) => d.severity === 'advisory');
  const quiet = advisories.find((d) => d.code === 'lint-quiet-day');
  const s = result.slice;
  const nodes =
    s.documents.length +
    s.facts.length +
    s.questions.length +
    s.hypotheses.length +
    s.tiltak.length +
    s.dispatches.length +
    s.clocks.length;
  const stubIds = [...new Set(stubs.flatMap((d) => d.subjectIds))];
  const parts: string[] = [];
  parts.push(
    errors
      ? `<span class="stub-c">${errors} error${errors > 1 ? 's' : ''}</span>`
      : `<span class="ok">compiled · ${nodes} nodes · ${compileMs.toFixed(0)} ms</span>`,
  );
  if (todos.length) parts.push(`<span class="todo-c">${todos.length} TODO</span>`);
  if (stubs.length)
    parts.push(
      `<span class="stub-c">${stubIds.length} stub${stubIds.length > 1 ? 's' : ''} — ${stubIds.slice(0, 3).join(', ')}${stubIds.length > 3 ? '…' : ''}</span>`,
    );
  if (warnings.length) parts.push(`<span class="warn-c">${warnings.length} warnings</span>`);
  if (quiet) parts.push(`<span class="warn-c">${esc(quiet.message)}</span>`);
  else if (advisories.length)
    parts.push(`<span class="adv-c">${advisories.length} advisory</span>`);
  parts.push(`<span class="hint">⌘S writes back to content/cases/olsen/tiny-olsen.case.md</span>`);
  statusbar.innerHTML = parts.join('');
}

// ---- navigation ---------------------------------------------------------

function unfoldAt(pos: number) {
  const folded: Array<{ from: number; to: number }> = [];
  foldedRanges(view.state).between(0, view.state.doc.length, (from, to) => {
    if (pos >= from - 1 && pos <= to + 1) folded.push({ from, to });
  });
  if (folded.length) view.dispatch({ effects: folded.map((r) => unfoldEffect.of(r)) });
}

function jumpToHeading(kind: string, id: string) {
  const h = headings.find((x) => x.id === id && (kind === '' || x.kind === kind));
  if (h) jumpToLine(h.line);
}

function jumpToLine(lineNo: number) {
  const doc = view.state.doc;
  const line = doc.line(Math.min(lineNo, doc.lines));
  unfoldAt(line.from);
  view.dispatch({
    selection: { anchor: line.from },
    effects: EditorView.scrollIntoView(line.from, { y: 'start', yMargin: 90 }),
  });
  view.focus();
}

function cursorLine(): number {
  return view.state.doc.lineAt(view.state.selection.main.head).number;
}

let lastCursorLine = -1;
function onCursor() {
  const line = cursorLine();
  if (line === lastCursorLine) return;
  lastCursorLine = line;
  renderPreview(line);
  renderOutline(line);
}

// ---- compile loop -------------------------------------------------------

function recompile() {
  const text = view.state.doc.toString();
  const t0 = performance.now();
  result = compileCase(text);
  compileMs = performance.now() - t0;
  headings = indexHeadings(text.split('\n'));
  symbols = buildSymbols();
  pushDiagnostics(view);
  renderProblems();
  renderStatus();
  lastCursorLine = -1;
  onCursor();
}

async function save() {
  try {
    const res = await fetch('/__save-case', {
      method: 'POST',
      body: view.state.doc.toString(),
    });
    if (!res.ok) throw new Error(await res.text());
    dirty = false;
    clearTimeout(draftTimer);
    localStorage.removeItem(DRAFT_KEY);
    const t = new Date();
    saveState.textContent = `saved · ${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
    saveState.classList.remove('dirty');
  } catch (err) {
    saveState.textContent = `save failed — ${err instanceof Error ? err.message : err}`;
    saveState.classList.add('dirty');
  }
}

window.addEventListener('beforeunload', (e) => {
  if (dirty) e.preventDefault();
});

// ---- boot ---------------------------------------------------------------

if (draftRestored) {
  recompile();
  dirty = true;
  saveState.textContent = 'restored unsaved draft — ⌘S to keep it';
  saveState.classList.add('dirty');
} else {
  headings = indexHeadings(initialText.split('\n'));
  symbols = buildSymbols();
  pushDiagnostics(view);
  renderProblems();
  renderStatus();
}
foldAll(view);
onCursor();

export { view };
