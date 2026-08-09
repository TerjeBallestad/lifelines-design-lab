// SB-055 follow-up (Terje's play-session wish) — ⌘K fuzzy jump. Type a few
// characters of an id or title, Enter selects and centers the node. Pure
// scorer exported for the unit test; DOM wiring stays behind initJump.

export interface JumpNode {
  id: string;
  kind: string;
  title: string;
  /** Searchable content text (summary, quote, body runs…) — the active row
   *  expands with it so a hit past the title is visible immediately. */
  text?: string;
  stub?: boolean;
}

/** Subsequence fuzzy score — higher is better, null means no match.
 *  Contiguous runs and word/id-boundary hits score up; scattered matches
 *  score down with the gap length. */
export function fuzzyScore(needle: string, haystack: string): number | null {
  const n = needle.toLowerCase();
  const h = haystack.toLowerCase();
  if (n.length === 0) return 0;
  const direct = h.indexOf(n);
  if (direct >= 0) return 1000 - direct - h.length / 100;
  let score = 0;
  let hi = 0;
  let prev = -2;
  for (const ch of n) {
    const at = h.indexOf(ch, hi);
    if (at < 0) return null;
    if (at === prev + 1)
      score += 12; // contiguous run
    else if (at === 0 || /[\s_:.+-]/.test(h[at - 1]))
      score += 8; // boundary
    else score += 1;
    score -= (at - hi) / 4; // gap penalty
    prev = at;
    hi = at + 1;
  }
  return score - h.length / 100;
}

export interface JumpDeps {
  overlay: HTMLElement;
  input: HTMLInputElement;
  list: HTMLElement;
  getNodes(): JumpNode[];
  onPick(id: string): void;
}

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Escape `text`, wrapping every case-insensitive occurrence of the query in
 *  <em class="hit"> so the palette shows WHERE the search landed. */
export function highlightHits(query: string, text: string): string {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return esc(text);
  const lower = text.toLowerCase();
  let out = '';
  let i = 0;
  for (;;) {
    const at = lower.indexOf(q, i);
    if (at < 0) break;
    out += `${esc(text.slice(i, at))}<em class="hit">${esc(text.slice(at, at + q.length))}</em>`;
    i = at + q.length;
  }
  return out + esc(text.slice(i));
}

export function initJump(deps: JumpDeps): { open(): void; close(): void } {
  const { overlay, input, list } = deps;
  let rows: JumpNode[] = [];
  let active = 0;

  function close(): void {
    overlay.classList.remove('open');
    input.value = '';
  }

  function open(): void {
    overlay.classList.add('open');
    input.value = '';
    render();
    input.focus();
  }

  function pick(index: number): void {
    const node = rows[index];
    close();
    if (node) deps.onPick(node.id);
  }

  function render(): void {
    const query = input.value.trim();
    rows = deps
      .getNodes()
      .map((node) => ({
        node,
        score: fuzzyScore(query, `${node.id} ${node.title} ${node.text ?? ''}`),
      }))
      .filter((r): r is { node: JumpNode; score: number } => r.score !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((r) => r.node);
    active = 0;
    list.innerHTML =
      rows
        .map(
          (node, index) =>
            `<div class="jump-row${index === active ? ' active' : ''}${node.stub ? ' stub' : ''}" data-index="${index}">
              <div class="jump-line">
                <span class="jump-id k-${node.kind}">${esc(node.id)}</span>
                <span class="jump-title">${highlightHits(query, node.title)}</span>
              </div>
              ${node.text ? `<div class="jump-detail">${highlightHits(query, node.text)}</div>` : ''}
            </div>`,
        )
        .join('') || '<div class="jump-empty">no match</div>';
    scrollHitIntoView();
  }

  /** The active row's first highlighted hit scrolls into view inside the
   *  clamped detail block — a match deep in a document body stays visible. */
  function scrollHitIntoView(): void {
    const detail = list.querySelector('.jump-row.active .jump-detail');
    const hit = detail?.querySelector('.hit');
    if (detail && hit) detail.scrollTop = Math.max(0, (hit as HTMLElement).offsetTop - 8);
  }

  function moveActive(delta: number): void {
    if (rows.length === 0) return;
    active = (active + delta + rows.length) % rows.length;
    list.querySelectorAll('.jump-row').forEach((el, index) => {
      el.classList.toggle('active', index === active);
      if (index === active) (el as HTMLElement).scrollIntoView({ block: 'nearest' });
    });
    scrollHitIntoView();
  }

  window.addEventListener(
    'keydown',
    (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        e.stopPropagation();
        if (overlay.classList.contains('open')) close();
        else open();
      }
    },
    true,
  );
  input.addEventListener('input', render);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveActive(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveActive(-1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      pick(active);
    }
  });
  list.addEventListener('click', (e) => {
    const row = (e.target as HTMLElement).closest('.jump-row') as HTMLElement | null;
    if (row) pick(Number(row.dataset.index));
  });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  return { open, close };
}
