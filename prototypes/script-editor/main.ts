// SB-025 probe — script-first editor over the real 0.2 compiler.
// SB-041 lens extraction: the CodeMirror surface now lives in lens.ts and is
// mounted here — this file is the standalone page host. It owns the compile
// loop, outline, preview rail, problems drawer, draft persistence and ⌘S
// save; the lens owns the editor view and its extensions.
import { compileCase } from '../../src/compiler/index.ts';
import type { CompileResult } from '../../src/compiler/index.ts';
import { liftFact } from '../../src/compiler/patch.ts';
import {
  activeCasePath,
  activeCaseText as initialText,
  draftKey,
  saveCaseUrl,
  wireCaseChrome,
} from '../shared/active-case.ts';
import { mountScriptLens, indexHeadings, KIND_COLOR } from './lens.ts';
import type { Heading, ScriptSymbol } from './lens.ts';
import { buildSymbols } from './symbols.ts';
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

let result: CompileResult = compileCase(initialText);
let compileMs = 0;
let headings: Heading[] = [];
let symbols = new Map<string, ScriptSymbol>();
let dirty = false;

// ---- lens mount ---------------------------------------------------------

let compileTimer: ReturnType<typeof setTimeout> | undefined;

// Draft persistence: the buffer survives page reloads (vite live-reload wiped
// an unsaved buffer once — never again). Every edit lands in localStorage;
// a successful ⌘S clears it. On boot a draft that differs from disk wins.
const DRAFT_KEY = draftKey(activeCasePath);
const draft = localStorage.getItem(DRAFT_KEY);
const draftRestored = draft != null && draft !== initialText;
const bootText = draftRestored ? draft : initialText;
let draftTimer: ReturnType<typeof setTimeout> | undefined;

const lens = mountScriptLens({
  parent: $('editor-pane'),
  doc: bootText,
  onDocChanged: () => {
    dirty = true;
    saveState.textContent = 'unsaved changes';
    saveState.classList.add('dirty');
    clearTimeout(compileTimer);
    compileTimer = setTimeout(recompile, 150);
    clearTimeout(draftTimer);
    draftTimer = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, lens.getText());
    }, 300);
  },
  onCursorLineChanged: () => onCursor(),
  onSaveRequested: () => {
    void save();
  },
  onLiftFact: ({ documentId, quote }) => {
    // SB-043: append the fact stub via the patch layer, then land the caret
    // on its Label line. setText fires onDocChanged → dirty/draft/recompile.
    try {
      const { labelLine, text } = liftFact(lens.getText(), documentId, quote);
      lens.setText(text);
      lens.focusLineEnd(labelLine);
    } catch (err) {
      saveState.textContent = err instanceof Error ? err.message : String(err);
      saveState.classList.add('dirty');
    }
  },
});

const view = lens.view;

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
  const parts: string[] = [
    `<div class="head">${esc((result.slice.title || 'CASE').toUpperCase())}</div>`,
  ];
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
    lens.jumpToHeading(el.dataset.kind!, el.dataset.id);
  } else if (el.dataset.kind) {
    const first = headings.find(
      (h) => h.kind === el.dataset.kind || (el.dataset.kind === 'Facts' && h.kind === 'Fact'),
    );
    if (first) lens.jumpToLine(first.line);
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
// (supports/source links) ride below the card face in stamp type.
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
        lens.jumpToHeading('Fact', id);
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
    lens.jumpToHeading('Fact', anchor.dataset.fact);
    return;
  }
  const jump = target.closest('[data-jump-id]') as HTMLElement | null;
  if (jump?.dataset.jumpId) lens.jumpToHeading(jump.dataset.jumpKind ?? '', jump.dataset.jumpId);
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
  if (el) lens.jumpToLine(Number(el.dataset.line));
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
  parts.push(`<span class="hint">⌘S writes back to ${esc(activeCasePath)}</span>`);
  statusbar.innerHTML = parts.join('');
}

// ---- cursor → preview + outline -----------------------------------------

let lastCursorLine = -1;
function onCursor() {
  const line = lens.getCursorLine();
  if (line === lastCursorLine) return;
  lastCursorLine = line;
  renderPreview(line);
  renderOutline(line);
}

// ---- compile loop -------------------------------------------------------

function recompile() {
  const text = lens.getText();
  const t0 = performance.now();
  result = compileCase(text);
  compileMs = performance.now() - t0;
  headings = indexHeadings(text.split('\n'));
  symbols = buildSymbols(result, headings);
  lens.update({ headings, symbols, diagnostics: result.diagnostics });
  renderProblems();
  renderStatus();
  lastCursorLine = -1;
  onCursor();
}

async function save() {
  try {
    const res = await fetch(saveCaseUrl, {
      method: 'POST',
      body: lens.getText(),
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

wireCaseChrome();

if (draftRestored) {
  recompile();
  dirty = true;
  saveState.textContent = 'restored unsaved draft — ⌘S to keep it';
  saveState.classList.add('dirty');
} else {
  headings = indexHeadings(initialText.split('\n'));
  symbols = buildSymbols(result, headings);
  lens.update({ headings, symbols, diagnostics: result.diagnostics });
  renderProblems();
  renderStatus();
}
lens.foldAllSections();
onCursor();

export { view };
