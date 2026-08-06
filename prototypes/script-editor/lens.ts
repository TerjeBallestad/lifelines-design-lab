// SB-041 lens extraction — the CodeMirror script surface pulled out of the
// SB-025 probe as a mountable module, so both the standalone script page and
// the canvas page can mount the same lens. The lens owns the EditorView,
// theme, token highlighter, section folding, autocomplete, hover docs,
// ⌘-click goto-definition, lint diagnostics push and jump/unfold helpers.
// It holds NO page state: the page passes initial text + callbacks and feeds
// the lens fresh headings/symbols/diagnostics after each recompile — the
// compile loop stays outside (one compile owner per page).
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
  showTooltip,
} from '@codemirror/view';
import type { DecorationSet, Tooltip } from '@codemirror/view';
import { EditorState, RangeSetBuilder, Annotation, StateField } from '@codemirror/state';
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

// ---- shared vocabulary ---------------------------------------------------

export interface Heading {
  line: number; // 1-based
  endLine: number;
  kind: string; // Document, Question, … or Fact for ##
  id: string;
}

export interface ScriptSymbol {
  id: string;
  kind: string;
  label: string;
  defLine: number | null;
}

/** Structurally matches the compiler's Diagnostic — no compiler import here. */
export interface LensDiagnostic {
  code: string;
  severity: string;
  message: string;
  span: { startLine: number; endLine: number };
}

export const KIND_OF_PREFIX: Record<string, string> = {
  doc_: 'Document',
  f_: 'Fact',
  q_: 'Question',
  h_: 'Hypothesis',
  t_: 'Tiltak',
  d_: 'Dispatch',
  ck_: 'Clock',
};
export const KIND_COLOR: Record<string, string> = {
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

export function idKind(id: string): string | null {
  const p = Object.keys(KIND_OF_PREFIX).find((pre) => id.startsWith(pre));
  return p ? KIND_OF_PREFIX[p] : null;
}

/** Section index over raw markup lines — pages feed the result to update(). */
export function indexHeadings(lines: string[]): Heading[] {
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

// ---- field docs (from docs/markup-0.2-reference.md) ---------------------

export const KEY_DOCS: Record<string, string> = {
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

export const EFFECT_DOCS: Record<string, string> = {
  pay: '~ pay f_x — reveal a fact to the player.',
  clock: '~ clock ck_x +1 — tick a clock (either direction).',
  deliver: '~ deliver doc_x in 1d [on ck_y] — queue a document delivery.',
  open: '~ open q_x — force a question open.',
  stage: '~ stage 1 — advance the scenario stage.',
  log: '~ log «…» — write a line to the case log.',
};

// ---- hover helpers ------------------------------------------------------

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

// IDE affordance: while ⌘ is held, ids underline and show a pointer.
// Window-level, installed once regardless of how many lenses mount.
let gotoModeInstalled = false;
function installGotoModeAffordance() {
  if (gotoModeInstalled) return;
  gotoModeInstalled = true;
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Meta' || e.key === 'Control') document.body.classList.add('goto-mode');
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === 'Meta' || e.key === 'Control') document.body.classList.remove('goto-mode');
  });
  window.addEventListener('blur', () => document.body.classList.remove('goto-mode'));
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
    // SB-043: the "Lift as fact" selection popup
    '.lift-tip': { padding: '2px' },
    '.lift-btn': {
      background: 'transparent',
      border: 'none',
      color: 'var(--text)',
      fontFamily: 'var(--mono)',
      fontSize: '11px',
      padding: '4px 9px',
      borderRadius: '6px',
      cursor: 'pointer',
    },
    '.lift-btn:hover': { background: 'var(--panel-hover)', color: 'var(--accent)' },
    '.lift-kbd': { color: 'var(--text-4)', marginLeft: '8px', fontSize: '10px' },
  },
  { dark: true },
);

const KEY_KIND_HINTS: Record<string, string[] | null> = {
  Supports: ['Question'],
  Leads: ['Tiltak'],
  Question: ['Question'],
  Opens: ['Tiltak', 'Dispatch', 'Conversation'],
  Source: ['Document'],
};

// External text replacements (setText) carry this annotation so pages can
// tell a programmatic store-sync apart from the author typing.
const externalReplace = Annotation.define<boolean>();

// ---- lens API -----------------------------------------------------------

export interface ScriptLensOptions {
  /** Element the EditorView mounts into. */
  parent: HTMLElement;
  /** Initial document text (page decides disk vs restored draft). */
  doc: string;
  /** Fires on every doc change; external=true when it came from setText(). */
  onDocChanged?: (info: { external: boolean }) => void;
  /** Debounced (80 ms) cursor-line report; fires on selection or doc moves. */
  onCursorLineChanged?: (line: number) => void;
  /** ⌘S inside the editor. The page owns what "save" means. */
  onSaveRequested?: () => void;
  /**
   * SB-043 select-to-lift: fires when the author triggers "Lift as fact" on
   * a passage selected inside a document block's prose ("⌘⇧L" or the
   * selection popup). The page owns the patch (liftFact) + commit; without
   * this callback the affordance never shows.
   */
  onLiftFact?: (req: LiftFactRequest) => void;
}

export interface LiftFactRequest {
  /** The `# Document:` block the selection lies in. */
  documentId: string;
  /** The selected passage, raw — the patch layer normalizes it. */
  quote: string;
}

export interface ScriptLensContext {
  headings: Heading[];
  symbols: Map<string, ScriptSymbol>;
  diagnostics: LensDiagnostic[];
}

export interface ScriptLensHandle {
  view: EditorView;
  getText(): string;
  /**
   * Apply an external replacement (e.g. a canvas commit) as a minimal
   * prefix/suffix-trimmed change — undo history survives and the cursor
   * holds when the change does not overlap it. Tagged external for
   * onDocChanged.
   */
  setText(text: string): void;
  getCursorLine(): number;
  /** Jump: unfold whatever hides the line, select its start, scroll, focus. */
  jumpToLine(lineNo: number): void;
  /**
   * Same jump WITHOUT stealing keyboard focus — for cross-surface jumps
   * (SB-041: a canvas node click scrolls the script pane while the designer
   * keeps typing in the inspector).
   */
  scrollToLine(lineNo: number): void;
  /** Jump to a heading by kind + id ('' kind matches any). */
  jumpToHeading(kind: string, id: string): void;
  /**
   * Put the caret at the END of a line and focus the editor — SB-043 lands
   * the author on the new fact stub's `Label: ` line, ready to type.
   */
  focusLineEnd(lineNo: number): void;
  /** Feed fresh compile context; pushes lint diagnostics into the view. */
  update(ctx: ScriptLensContext): void;
  foldAllSections(): void;
  destroy(): void;
}

export function mountScriptLens(opts: ScriptLensOptions): ScriptLensHandle {
  installGotoModeAffordance();

  // per-instance compile context, fed by update()
  let headings: Heading[] = [];
  let symbols = new Map<string, ScriptSymbol>();
  let cursorTimer: ReturnType<typeof setTimeout> | undefined;

  // ---- folding: a section folds from its heading to the section end -----

  const sectionFolding = foldService.of((state: EditorState, lineStart: number) => {
    const line = state.doc.lineAt(lineStart);
    const h = headings.find((x) => x.line === line.number);
    if (!h || h.endLine <= h.line) return null;
    let end = h.endLine;
    while (end > h.line && state.doc.line(end).text.trim() === '') end--;
    if (end <= h.line) return null;
    return { from: line.to, to: state.doc.line(end).to };
  });

  // ---- autocomplete -----------------------------------------------------

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

  // ---- select-to-lift (SB-043, SB-040 ruling 3) -------------------------
  //
  // A selection inside a document block's prose is a liftable passage. The
  // lens only detects and offers ("Lift as fact" popup + ⌘⇧L); the page owns
  // the patch. Field/effect/heading lines are markup, not passage — refuse.

  const FIELD_LINE_RE = /^[A-Za-zÆØÅæøå][A-Za-zÆØÅæøå ]{0,24}:( |$)/u;

  function isProseLine(text: string): boolean {
    const t = text.trim();
    if (t === '' || t.startsWith('#') || t.startsWith('~') || t.startsWith('//')) return false;
    if (/^([*+-]|->)/.test(t)) return false;
    return !FIELD_LINE_RE.test(text);
  }

  function liftTarget(state: EditorState): LiftFactRequest | null {
    if (!opts.onLiftFact) return null;
    const sel = state.selection.main;
    if (sel.empty) return null;
    const fromLine = state.doc.lineAt(sel.from);
    const toLine = state.doc.lineAt(sel.to);
    // The enclosing section of the selection start must be a Document.
    let section: Heading | null = null;
    for (const h of headings) {
      if (h.line <= fromLine.number) section = h;
      else break;
    }
    if (!section || section.kind !== 'Document' || section.id === '') return null;
    if (fromLine.number === section.line) return null; // the heading line itself
    if (toLine.number > section.endLine) return null; // spills out of the document
    if (!isProseLine(fromLine.text)) return null;
    const quote = state.sliceDoc(sel.from, sel.to);
    if (quote.trim() === '') return null;
    return { documentId: section.id, quote };
  }

  function liftTooltip(state: EditorState): Tooltip | null {
    const target = liftTarget(state);
    if (!target) return null;
    return {
      pos: state.selection.main.from,
      above: true,
      create: (v: EditorView) => {
        const dom = document.createElement('div');
        dom.className = 'lift-tip';
        const btn = document.createElement('button');
        btn.className = 'lift-btn';
        btn.textContent = 'Lift as fact';
        const kbd = document.createElement('span');
        kbd.className = 'lift-kbd';
        kbd.textContent = '⌘⇧L';
        btn.append(kbd);
        // mousedown would collapse the selection before click lands — stop it.
        btn.addEventListener('mousedown', (e) => e.preventDefault());
        btn.addEventListener('click', () => {
          const fresh = liftTarget(v.state);
          if (fresh) opts.onLiftFact?.(fresh);
        });
        dom.append(btn);
        return { dom };
      },
    };
  }

  const liftTooltipField = StateField.define<Tooltip | null>({
    create: liftTooltip,
    update(value, tr) {
      if (!tr.docChanged && !tr.selection) return value;
      return liftTooltip(tr.state);
    },
    provide: (f) => showTooltip.from(f),
  });

  // ---- ⌘-click on an id → jump to its definition (heading line) ---------

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

  // ---- hover docs -------------------------------------------------------

  const hoverDocs = hoverTooltip((v, pos): Tooltip | null => {
    const line = v.state.doc.lineAt(pos);
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

  // ---- view -------------------------------------------------------------

  const view = new EditorView({
    parent: opts.parent,
    state: EditorState.create({
      doc: opts.doc,
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
        liftTooltipField,
        theme,
        EditorView.lineWrapping,
        keymap.of([
          {
            key: 'Mod-s',
            run: () => {
              opts.onSaveRequested?.();
              return true;
            },
          },
          {
            key: 'Mod-Shift-l',
            run: (v) => {
              const target = liftTarget(v.state);
              if (!target) return false;
              opts.onLiftFact?.(target);
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
            const external = u.transactions.some((tr) => tr.annotation(externalReplace));
            opts.onDocChanged?.({ external });
          }
          if (u.selectionSet || u.docChanged) {
            clearTimeout(cursorTimer);
            cursorTimer = setTimeout(() => {
              opts.onCursorLineChanged?.(getCursorLine());
            }, 80);
          }
        }),
      ],
    }),
  });

  // ---- navigation helpers ----------------------------------------------

  function unfoldAt(pos: number) {
    const folded: Array<{ from: number; to: number }> = [];
    foldedRanges(view.state).between(0, view.state.doc.length, (from, to) => {
      if (pos >= from - 1 && pos <= to + 1) folded.push({ from, to });
    });
    if (folded.length) view.dispatch({ effects: folded.map((r) => unfoldEffect.of(r)) });
  }

  function jumpToLine(lineNo: number, { focus = true } = {}) {
    const doc = view.state.doc;
    const line = doc.line(Math.min(lineNo, doc.lines));
    unfoldAt(line.from);
    try {
      view.dispatch({
        selection: { anchor: line.from },
        effects: EditorView.scrollIntoView(line.from, { y: 'start', yMargin: 90 }),
      });
    } catch {
      // Headless DOM (jsdom) may lack the layout APIs the scroll effect
      // needs — the selection move is the contract, keep it.
      view.dispatch({ selection: { anchor: line.from } });
    }
    if (focus) view.focus();
  }

  function getCursorLine(): number {
    return view.state.doc.lineAt(view.state.selection.main.head).number;
  }

  return {
    view,
    getText: () => view.state.doc.toString(),
    setText(text: string) {
      const cur = view.state.doc.toString();
      if (text === cur) return;
      // minimal change: trim the common prefix and suffix so an untouched
      // cursor and the undo history survive the replacement
      let start = 0;
      const minLen = Math.min(cur.length, text.length);
      while (start < minLen && cur.charCodeAt(start) === text.charCodeAt(start)) start++;
      let curEnd = cur.length;
      let nextEnd = text.length;
      while (
        curEnd > start &&
        nextEnd > start &&
        cur.charCodeAt(curEnd - 1) === text.charCodeAt(nextEnd - 1)
      ) {
        curEnd--;
        nextEnd--;
      }
      view.dispatch({
        changes: { from: start, to: curEnd, insert: text.slice(start, nextEnd) },
        annotations: externalReplace.of(true),
      });
    },
    getCursorLine,
    jumpToLine,
    scrollToLine: (lineNo: number) => jumpToLine(lineNo, { focus: false }),
    jumpToHeading(kind: string, id: string) {
      const h = headings.find((x) => x.id === id && (kind === '' || x.kind === kind));
      if (h) jumpToLine(h.line);
    },
    focusLineEnd(lineNo: number) {
      const doc = view.state.doc;
      const line = doc.line(Math.min(lineNo, doc.lines));
      unfoldAt(line.from);
      try {
        view.dispatch({
          selection: { anchor: line.to },
          effects: EditorView.scrollIntoView(line.to, { y: 'center' }),
        });
      } catch {
        // jsdom lacks the layout APIs the scroll effect needs — see jumpToLine.
        view.dispatch({ selection: { anchor: line.to } });
      }
      view.focus();
    },
    update(ctx: ScriptLensContext) {
      headings = ctx.headings;
      symbols = ctx.symbols;
      const doc = view.state.doc;
      const diags: CmDiagnostic[] = [];
      for (const d of ctx.diagnostics) {
        const startLine = Math.min(d.span.startLine, doc.lines);
        const endLine = Math.min(d.span.endLine, doc.lines);
        const from = doc.line(startLine).from;
        const to = doc.line(endLine).to;
        const severity =
          d.severity === 'error' ? 'error' : d.severity === 'warning' ? 'warning' : 'info';
        diags.push({ from, to, severity, source: d.code, message: d.message });
      }
      view.dispatch(setDiagnostics(view.state, diags));
    },
    foldAllSections: () => {
      foldAll(view);
    },
    destroy() {
      clearTimeout(cursorTimer);
      view.destroy();
    },
  };
}
