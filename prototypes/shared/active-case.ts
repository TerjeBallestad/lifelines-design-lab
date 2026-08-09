// SB-083: the active-case seam. One module owns which `.case.md` the lens
// pages operate on: discovery over content/cases, the ?case URL param, the
// boot text, the localStorage key builders, and the save target. The lens
// pages import this instead of hard-wiring a case path.

// Eager on purpose: the case files stay inside the vite module graph, so an
// external edit still triggers the live reload the probes rely on. A fetch()
// loader would lose that.
const files = import.meta.glob('/content/cases/**/*.case.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/** Repo-relative case paths (no leading slash), sorted for a stable picker
 *  order. The first entry is the default case. */
export const casePaths = Object.keys(files)
  .map((key) => key.slice(1))
  .sort();

if (casePaths.length === 0) throw new Error('no .case.md found under content/cases/');

// Tests run model.ts under a node environment with no `location`; there the
// default case is the answer, same as a lens page opened without ?case.
const param =
  typeof location !== 'undefined' ? new URLSearchParams(location.search).get('case') : null;

/** The case this page operates on: ?case=<relpath> when it names a real
 *  case, else the default (first sorted path). */
export const activeCasePath = param !== null && casePaths.includes(param) ? param : casePaths[0];

/** The active case text as it was on disk at module-graph build time. */
export const activeCaseText = files[`/${activeCasePath}`];

// The four localStorage key builders. The suffix is the repo-relative case
// path, so every store is per-case by construction (SB-025 rule: a reload
// must never wipe unsaved work — and a case switch must never mix drafts).
export const draftKey = (path: string): string => `kildeverket-draft:${path}`;
export const posKey = (path: string): string => `kildeverket-canvas-pos:${path}`;
export const modeKey = (path: string): string => `kildeverket-canvas-mode:${path}`;
export const pinKey = (path: string): string => `kildeverket-canvas-pins:${path}`;
/** SB-063 amendment: the playtest run survives a lens switch. The store is
 *  sessionStorage (per tab), so a fresh tab still starts a clean run. */
export const playKey = (path: string): string => `kildeverket-playtest:${path}`;

/** Save target for the active case — vite.config.ts validates the path. */
export const saveCaseUrl = `/__save-case?path=${encodeURIComponent(activeCasePath)}`;

/**
 * The active case's boot buffer (SB-025 rule: a reload must never wipe
 * unsaved work). A localStorage draft that differs from disk wins; a
 * successful save clears the draft again.
 */
export function resolveBootText(): { text: string; draftRestored: boolean } {
  const draft = localStorage.getItem(draftKey(activeCasePath));
  return draft !== null && draft !== activeCaseText
    ? { text: draft, draftRestored: true }
    : { text: activeCaseText, draftRestored: false };
}

/** Picker label: the case block's Title field, else the file name. A full
 *  compile per case just for a label made every lens boot pay O(cases). */
export function caseTitle(path: string): string {
  // The case block is the text up to the second `# ` heading; its Title line
  // is plain (composite `·` lines live on documents only).
  const head = (files[`/${path}`] ?? '').split(/\n# /)[0];
  const title = head.match(/^Title:\s*(.+?)\s*(?:\/\/.*)?$/m)?.[1];
  return title || (path.split('/').pop() ?? path);
}

/** Wire the topbar chrome: fill the #case-picker select (a change navigates
 *  to ?case=<path>) and carry the active case across the lens cross-links. */
export function wireCaseChrome(): void {
  const picker = document.getElementById('case-picker') as HTMLSelectElement | null;
  if (picker) {
    for (const path of casePaths) {
      const option = document.createElement('option');
      option.value = path;
      option.textContent = caseTitle(path);
      picker.append(option);
    }
    picker.value = activeCasePath;
    picker.addEventListener('change', () => {
      location.href = `?case=${encodeURIComponent(picker.value)}`;
    });
  }
  for (const link of document.querySelectorAll<HTMLAnchorElement>('#topbar .tabs a')) {
    // Splice the param in properly — a tab href may already carry ?query/#hash.
    const raw = link.getAttribute('href') ?? '';
    const hashAt = raw.indexOf('#');
    const base = hashAt >= 0 ? raw.slice(0, hashAt) : raw;
    const hash = hashAt >= 0 ? raw.slice(hashAt) : '';
    const sep = base.includes('?') ? '&' : '?';
    link.href = `${base}${sep}case=${encodeURIComponent(activeCasePath)}${hash}`;
  }
}
