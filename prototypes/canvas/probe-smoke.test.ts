// @vitest-environment jsdom
// Smoke test for the SB-026 canvas probe: derives the graph from the real
// compiled case, then boots the page in jsdom and clicks through it.
// SB-032 adds the inspector-editing acceptance tests at the bottom.
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

const ROOT = process.cwd();
const caseText = readFileSync(`${ROOT}/content/cases/olsen/tiny-olsen.case.md`, 'utf8');

describe('canvas graph derivation', () => {
  it('builds the full Olsen graph with no dangling edges', async () => {
    const { compileCase } = await import('../../src/compiler/index.ts');
    const { buildGraph } = await import('./graph.ts');
    const { slice } = compileCase(caseText);
    const graph = buildGraph(slice);

    const byKind = (kind: string) => graph.nodes.filter((n) => n.kind === kind).length;
    expect(byKind('document')).toBe(9);
    expect(byKind('fact')).toBe(27);
    expect(byKind('question')).toBe(8);
    expect(byKind('hypothesis')).toBe(23);
    expect(byKind('tiltak')).toBe(9);
    expect(byKind('dispatch')).toBe(2);
    expect(byKind('clock')).toBe(6);

    const ids = new Set(graph.nodes.map((n) => n.id));
    for (const edge of graph.edges) {
      expect(ids.has(edge.from)).toBe(true);
      expect(ids.has(edge.to)).toBe(true);
    }

    // Every fact hangs off a document; every hypothesis hangs off a question.
    for (const fact of slice.facts)
      expect(graph.edges.some((e) => e.to === fact.id && e.label === 'source')).toBe(true);
    for (const h of slice.hypotheses)
      expect(graph.edges.some((e) => e.to === h.id && e.from === h.question_id)).toBe(true);
  });

  it('lays out kind columns left to right with no overlaps inside a column', async () => {
    const { compileCase } = await import('../../src/compiler/index.ts');
    const { buildGraph, layoutGraph } = await import('./graph.ts');
    const graph = buildGraph(compileCase(caseText).slice);
    const extent = layoutGraph(graph);
    expect(extent.width).toBeGreaterThan(0);
    expect(extent.height).toBeGreaterThan(0);

    const xOf = (kind: string) => graph.nodes.find((n) => n.kind === kind)!.x;
    expect(xOf('document')).toBeLessThan(xOf('fact'));
    expect(xOf('fact')).toBeLessThan(xOf('question'));
    expect(xOf('question')).toBeLessThan(xOf('hypothesis'));
    expect(xOf('hypothesis')).toBeLessThan(xOf('tiltak'));
    expect(xOf('tiltak')).toBeLessThan(xOf('clock'));

    const columns = new Map<number, number[]>();
    for (const node of graph.nodes) {
      if (!columns.has(node.x)) columns.set(node.x, []);
      columns.get(node.x)!.push(node.y);
    }
    for (const ys of columns.values()) {
      ys.sort((a, b) => a - b);
      for (let i = 1; i < ys.length; i++) expect(ys[i] - ys[i - 1]).toBeGreaterThanOrEqual(58);
    }
  });
});

describe('canvas probe page', () => {
  it('boots over the real case and answers "what does this fact open?"', async () => {
    const html = readFileSync(`${ROOT}/prototypes/canvas/index.html`, 'utf8');
    const body = html.slice(html.indexOf('<body>') + 6, html.indexOf('</body>'));
    document.body.innerHTML = body.replace(/<script[^]*?<\/script>/g, '');

    const probe = await import('./main.ts');

    const statusbar = document.getElementById('statusbar')!;
    expect(statusbar.textContent).toContain('compiled');
    expect(statusbar.textContent).toMatch(/\d+ nodes · \d+ edges/);

    expect(document.querySelectorAll('.node').length).toBe(probe.graph.nodes.length);

    // Select a fact that supports questions: neighborhood lights up and the
    // inspector lists what it opens.
    const fact = probe.graph.nodes.find(
      (n) => n.kind === 'fact' && probe.graph.edges.some((e) => e.from === n.id),
    )!;
    probe.select(fact.id);
    expect(document.body.classList.contains('has-selection')).toBe(true);
    const inspector = document.getElementById('inspector-body')!;
    expect(inspector.textContent).toContain(fact.id);
    expect(inspector.textContent).toContain('OPENS / FEEDS');
    expect(document.querySelectorAll('.node.lit').length).toBeGreaterThan(1);

    probe.select(null);
    expect(document.body.classList.contains('has-selection')).toBe(false);
  });

  it('surfaces the §9 quiet-day lint in the status bar when present', async () => {
    const { compileCase } = await import('../../src/compiler/index.ts');
    const { diagnostics } = compileCase(caseText);
    const quiet = diagnostics.find((d) => d.code === 'lint-quiet-day');
    const statusbar = document.getElementById('statusbar')!;
    if (quiet) expect(statusbar.textContent).toContain('pacing');
    else expect(statusbar.textContent).not.toContain('pacing');
  });
});

// ---- SB-032: the inspector is the edit surface ----------------------------

const DRAFT_KEY = 'kildeverket-draft:content/cases/olsen/tiny-olsen.case.md';

/** Fresh module + fresh DOM, exactly like a page load. */
async function bootProbe() {
  vi.resetModules();
  const html = readFileSync(`${ROOT}/prototypes/canvas/index.html`, 'utf8');
  const body = html.slice(html.indexOf('<body>') + 6, html.indexOf('</body>'));
  document.body.innerHTML = body.replace(/<script[^]*?<\/script>/g, '');
  return import('./main.ts');
}

describe('canvas inspector editing (SB-032)', () => {
  it('edits a fact label through the form: patch, save POST, recompiled re-render', async () => {
    localStorage.clear();
    const fetchMock = vi.fn(async () => ({ ok: true, text: async () => 'ok' }));
    globalThis.fetch = fetchMock as never;
    const probe = await bootProbe();

    probe.select('f_grete_syk');
    const input = document.querySelector<HTMLInputElement>(
      '#inspector-body .fval[data-key="Label"]',
    )!;
    expect(input.value).toBe('Grete er alvorlig syk');

    input.value = 'Grete er alvorlig syk (redigert)';
    input.dispatchEvent(new Event('change'));

    // The patch landed in the buffer and the recompiled node re-rendered.
    expect(probe.getCaseText()).toContain('Label: Grete er alvorlig syk (redigert)');
    const nodeEl = document.querySelector('.node[data-id="f_grete_syk"]')!;
    expect(nodeEl.textContent).toContain('Grete er alvorlig syk (redigert)');

    // Selection survived the rebuild.
    expect(probe.selectedId).toBe('f_grete_syk');
    expect(document.querySelector('.node.selected')!.getAttribute('data-id')).toBe('f_grete_syk');

    // Exactly one save POST; the draft clears once it succeeds.
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('/__save-case');
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
    localStorage.clear();
  });

  it('restores an unsaved draft from localStorage after a reload', async () => {
    localStorage.clear();
    const draft = caseText.replace('Label: Grete er alvorlig syk', 'Label: Draft label survives');
    expect(draft).not.toBe(caseText);
    localStorage.setItem(DRAFT_KEY, draft);

    const probe = await bootProbe();

    expect(probe.getCaseText()).toBe(draft);
    probe.select('f_grete_syk');
    const input = document.querySelector<HTMLInputElement>(
      '#inspector-body .fval[data-key="Label"]',
    )!;
    expect(input.value).toBe('Draft label survives');
    expect(document.getElementById('statusbar')!.textContent).toContain('restored');
    localStorage.clear();
  });

  it('writes nothing on a no-op focus/blur: byte-identical text, no save POST', async () => {
    localStorage.clear();
    const fetchMock = vi.fn(async () => ({ ok: true, text: async () => 'ok' }));
    globalThis.fetch = fetchMock as never;
    const probe = await bootProbe();
    const before = probe.getCaseText();

    probe.select('f_grete_syk');
    const input = document.querySelector<HTMLInputElement>(
      '#inspector-body .fval[data-key="Label"]',
    )!;
    input.focus();
    input.dispatchEvent(new Event('change')); // unchanged value
    input.blur();

    expect(probe.getCaseText()).toBe(before); // byte-identical
    expect(fetchMock).not.toHaveBeenCalled();
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
    localStorage.clear();
  });
});

// ---- SB-033: edge authoring — drag to connect, delete to disconnect -------

/** Simulate a port drag from one node to another (window-level pointer flow). */
function dragConnect(fromId: string, toId: string): void {
  const port = document.querySelector<HTMLElement>(`.node[data-id="${fromId}"] .port`)!;
  port.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, clientX: 10, clientY: 10 }));
  window.dispatchEvent(new MouseEvent('pointermove', { clientX: 120, clientY: 80 }));
  const target = document.querySelector<HTMLElement>(`.node[data-id="${toId}"]`)!;
  target.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, clientX: 200, clientY: 90 }));
}

describe('canvas edge authoring (SB-033)', () => {
  it('drag fact→question writes the Supports entry, recompiles, renders the edge', async () => {
    localStorage.clear();
    const fetchMock = vi.fn(async () => ({ ok: true, text: async () => 'ok' }));
    globalThis.fetch = fetchMock as never;
    const probe = await bootProbe();

    expect(probe.getCaseText()).toContain('Supports: q_grete_dor\nDiscuss: Frank');
    dragConnect('f_grete_syk', 'q_okonomi');

    // The case text gained the Supports entry…
    expect(probe.getCaseText()).toContain('Supports: q_grete_dor, q_okonomi');
    // …the recompiled graph carries the edge, and it rendered.
    expect(
      probe.graph.edges.some(
        (e) => e.from === 'f_grete_syk' && e.to === 'q_okonomi' && e.label === 'supports',
      ),
    ).toBe(true);
    expect(document.querySelector('[data-edge="f_grete_syk→q_okonomi·supports"]')).not.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('/__save-case');
    localStorage.clear();
  });

  it('illegal drag document→tiltak writes nothing and shows the refusal at the cursor', async () => {
    localStorage.clear();
    const fetchMock = vi.fn(async () => ({ ok: true, text: async () => 'ok' }));
    globalThis.fetch = fetchMock as never;
    const probe = await bootProbe();
    const before = probe.getCaseText();

    const doc = probe.graph.nodes.find((n) => n.kind === 'document')!;
    const tiltak = probe.graph.nodes.find((n) => n.kind === 'tiltak')!;
    dragConnect(doc.id, tiltak.id);

    expect(probe.getCaseText()).toBe(before); // byte-identical — nothing written
    expect(fetchMock).not.toHaveBeenCalled();
    const tipEl = document.getElementById('cursor-tip')!;
    expect(tipEl.classList.contains('show')).toBe(true);
    expect(tipEl.textContent).toContain('ingen lovlig relasjon');
    expect(tipEl.textContent).toContain('dra fra port for ny kant');
    localStorage.clear();
  });

  it('condition-term add + edge delete keep the §6 grammar valid (no cond-parse errors)', async () => {
    localStorage.clear();
    const fetchMock = vi.fn(async () => ({ ok: true, text: async () => 'ok' }));
    globalThis.fetch = fetchMock as never;
    const probe = await bootProbe();
    const { compileCase } = await import('../../src/compiler/index.ts');
    const noCondErrors = (text: string) =>
      compileCase(text).diagnostics.filter((d) => d.code === 'cond-parse-error');

    // fact→hypothesis appends an and-term to the hypothesis's needs:.
    dragConnect('f_post', 'h_gd_system');
    expect(probe.getCaseText()).toContain('needs: f_smart_gutt and f_ingen_matkjop and f_post');
    expect(noCondErrors(probe.getCaseText())).toEqual([]);
    expect(
      probe.graph.edges.some(
        (e) => e.from === 'f_post' && e.to === 'h_gd_system' && e.label === 'needs',
      ),
    ).toBe(true);

    // Select the new needs edge and delete it: the term drops, the and-chain
    // normalizes, and the grammar stays parseable.
    const hit = document.querySelector<SVGPathElement>('[data-edge="f_post→h_gd_system·needs"]')!;
    hit.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));

    expect(probe.getCaseText()).toContain('needs: f_smart_gutt and f_ingen_matkjop\n');
    expect(probe.getCaseText()).not.toContain('and f_post');
    expect(noCondErrors(probe.getCaseText())).toEqual([]);
    expect(
      probe.graph.edges.some(
        (e) => e.from === 'f_post' && e.to === 'h_gd_system' && e.label === 'needs',
      ),
    ).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(2); // one save per commit
    localStorage.clear();
  });
});

// ---- SB-034: node lifecycle — create, duplicate, delete, sticky layout ----

describe('canvas node lifecycle (SB-034)', () => {
  it('creates nodes from templates: markup block, column-end slot, inspector open — nothing else moves', async () => {
    localStorage.clear();
    const fetchMock = vi.fn(async () => ({ ok: true, text: async () => 'ok' }));
    globalThis.fetch = fetchMock as never;
    const probe = await bootProbe();
    const before = new Map(probe.graph.nodes.map((n) => [n.id, { x: n.x, y: n.y }]));

    const res = probe.createNode('question');
    expect(res.ok).toBe(true);
    expect(probe.getCaseText()).toContain('# Question: q_ny');

    const node = probe.graph.nodes.find((n) => n.id === 'q_ny')!;
    expect(node.kind).toBe('question');
    expect(document.querySelector('.node[data-id="q_ny"]')).not.toBeNull();

    // STICKY: every pre-existing node kept its exact position…
    for (const n of probe.graph.nodes)
      if (before.has(n.id)) expect({ x: n.x, y: n.y }).toEqual(before.get(n.id));
    // …and the new node appended at the end of its kind column.
    const others = probe.graph.nodes.filter((n) => n.kind === 'question' && n.id !== 'q_ny');
    expect(node.x).toBe(others[0].x);
    expect(node.y).toBeGreaterThan(Math.max(...others.map((q) => q.y)));

    // The inspector opened on the new block for naming.
    expect(probe.selectedId).toBe('q_ny');
    expect(document.getElementById('inspector-body')!.textContent).toContain('q_ny');

    // A fact lands inside its parent document's contiguous fact run.
    const doc = probe.graph.nodes.find((n) => n.kind === 'document')!;
    const res2 = probe.createNode('fact', { documentId: doc.id });
    expect(res2.ok).toBe(true);
    expect(probe.getCaseText()).toContain('## f_ny');
    expect(probe.graph.nodes.find((n) => n.id === 'f_ny')!.kind).toBe('fact');
    // A fact without a parent document refuses before writing.
    const textBefore = probe.getCaseText();
    expect(probe.createNode('fact').ok).toBe(false);
    expect(probe.getCaseText()).toBe(textBefore);

    expect(fetchMock).toHaveBeenCalledTimes(2); // one save per create
    localStorage.clear();
  });

  it('duplicates a fact: fresh id, body copied, compiles round-trip to a node', async () => {
    localStorage.clear();
    const fetchMock = vi.fn(async () => ({ ok: true, text: async () => 'ok' }));
    globalThis.fetch = fetchMock as never;
    const probe = await bootProbe();

    const res = probe.duplicateNode('f_grete_syk');
    expect(res.ok).toBe(true);
    expect(probe.getCaseText()).toContain('## f_grete_syk_kopi');
    // The body came along: the label now appears twice in the markup.
    expect(probe.getCaseText().match(/Label: Grete er alvorlig syk/g)!.length).toBe(2);

    const node = probe.graph.nodes.find((n) => n.id === 'f_grete_syk_kopi')!;
    expect(node.kind).toBe('fact');
    expect(probe.selectedId).toBe('f_grete_syk_kopi');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    localStorage.clear();
  });

  it('delete of a referenced fact surfaces the reference list BEFORE writing, then cleans on confirm', async () => {
    localStorage.clear();
    const fetchMock = vi.fn(async () => ({ ok: true, text: async () => 'ok' }));
    globalThis.fetch = fetchMock as never;
    const probe = await bootProbe();
    const before = probe.getCaseText();

    probe.select('f_grete_syk');
    probe.requestDelete('f_grete_syk');

    // Nothing written yet — the confirm step surfaced the references first.
    expect(probe.getCaseText()).toBe(before);
    expect(fetchMock).not.toHaveBeenCalled();
    const inspector = document.getElementById('inspector-body')!;
    expect(inspector.textContent).toContain('INNKOMMENDE REFERANSER');
    expect(inspector.textContent).toContain('q_grete_dor'); // when: f_grete_syk and f_klarer_seg
    expect(inspector.textContent).toContain('parorende'); // Relevant: list on the proposal

    probe.confirmDelete();
    const text = probe.getCaseText();
    expect(text).not.toContain('## f_grete_syk');
    expect(probe.graph.nodes.some((n) => n.id === 'f_grete_syk')).toBe(false);
    // Patchable references were cleaned: the cond term and the list entry…
    expect(text).toContain('when: f_klarer_seg\n');
    expect(text).toContain('Relevant: f_grete_baerer\n');
    // …without breaking the §6 grammar.
    const { compileCase } = await import('../../src/compiler/index.ts');
    expect(compileCase(text).diagnostics.filter((d) => d.code === 'cond-parse-error')).toEqual([]);
    // Unpatchable references (document prose, the recipe header) were
    // refused and reported instead of rewritten blind.
    expect(document.getElementById('statusbar')!.textContent).toContain('ryddet ikke');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    localStorage.clear();
  });

  it('positions persist per case across reloads (sticky layout)', async () => {
    localStorage.clear();
    globalThis.fetch = vi.fn(async () => ({ ok: true, text: async () => 'ok' })) as never;
    let probe = await bootProbe();
    const before = new Map(probe.graph.nodes.map((n) => [n.id, { x: n.x, y: n.y }]));

    // Simulate a user reposition: move one node in the per-case store.
    const stored = JSON.parse(localStorage.getItem(probe.POS_KEY)!) as Record<
      string,
      { x: number; y: number }
    >;
    stored['f_grete_syk'] = { x: 999, y: 777 };
    localStorage.setItem(probe.POS_KEY, JSON.stringify(stored));

    probe = await bootProbe();
    const moved = probe.graph.nodes.find((n) => n.id === 'f_grete_syk')!;
    expect({ x: moved.x, y: moved.y }).toEqual({ x: 999, y: 777 });
    for (const n of probe.graph.nodes)
      if (n.id !== 'f_grete_syk') expect({ x: n.x, y: n.y }).toEqual(before.get(n.id));
    localStorage.clear();
  });
});
