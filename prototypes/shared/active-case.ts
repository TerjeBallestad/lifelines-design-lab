// SB-083: the active-case seam. One module owns which `.case.md` the lens
// pages operate on: discovery over content/cases, the ?case URL param, the
// boot text, the localStorage key builders, and the save target. The lens
// pages import this instead of hard-wiring a case path.
import { compileCase } from '../../src/compiler/index.ts';

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

/** Save target for the active case — vite.config.ts validates the path. */
export const saveCaseUrl = `/__save-case?path=${encodeURIComponent(activeCasePath)}`;

/** Picker label: the compiled slice title, else the file name. */
export function caseTitle(path: string): string {
  try {
    const title = compileCase(files[`/${path}`]).slice.title;
    if (title) return title;
  } catch {
    // an uncompilable case still needs a picker entry
  }
  return path.split('/').pop() ?? path;
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
    link.href = `${link.getAttribute('href')}?case=${encodeURIComponent(activeCasePath)}`;
  }
}
