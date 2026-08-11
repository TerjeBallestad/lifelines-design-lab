// SB-083: the active-case seam. One module owns which source file the lens
// pages operate on: discovery over content/, the ?case / ?file URL params,
// the boot text, the localStorage key builders, and the save target. The
// lens pages import this instead of hard-wiring a source path.
//
// SB-068 widens the seam from case-only to the SDD-130 source-file list:
// every `.case.md` under content/cases plus every `.sim.md` under
// content/characters. The case exports keep their meaning — canvas and
// playtest stay case lenses; the script editor rides the source exports.

// Eager on purpose: the source files stay inside the vite module graph, so
// an external edit still triggers the live reload the probes rely on. A
// fetch() loader would lose that.
const files = import.meta.glob(['/content/cases/**/*.case.md', '/content/characters/*.sim.md'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/** Repo-relative case paths (no leading slash), sorted for a stable picker
 *  order. The first entry is the default case. */
export const casePaths = Object.keys(files)
  .map((key) => key.slice(1))
  .filter((path) => path.endsWith('.case.md'))
  .sort();

if (casePaths.length === 0) throw new Error('no .case.md found under content/cases/');

/** Every editable source file: cases first, then the character sim files. */
export const sourcePaths = [
  ...casePaths,
  ...Object.keys(files)
    .map((key) => key.slice(1))
    .filter((path) => path.endsWith('.sim.md'))
    .sort(),
];

/** True when the path is a `content/characters/*.sim.md` file. */
export const isCharacterPath = (path: string): boolean => path.endsWith('.sim.md');

// Tests run model.ts under a node environment with no `location`; there the
// default case is the answer, same as a lens page opened without a param.
const search =
  typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();
const fileParam = search.get('file');
const caseParam = search.get('case');

/** The source file this page operates on: ?file=<relpath> when it names a
 *  real source, else ?case=<relpath> (the legacy param), else the default
 *  case (first sorted case path). */
export const activeSourcePath =
  fileParam !== null && sourcePaths.includes(fileParam)
    ? fileParam
    : caseParam !== null && sourcePaths.includes(caseParam)
      ? caseParam
      : casePaths[0];

/** The active source text as it was on disk at module-graph build time. */
export const activeSourceText = files[`/${activeSourcePath}`];

/** The case this page operates on. When the active source is a character
 *  file, the case lenses (canvas, playtest) fall back to the default case. */
export const activeCasePath = isCharacterPath(activeSourcePath)
  ? casePaths[0]
  : activeSourcePath;

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

/** Save target for a source file — vite.config.ts validates the path. */
export const saveUrlFor = (path: string): string =>
  `/__save-case?path=${encodeURIComponent(path)}`;

/** Save target for the active case — vite.config.ts validates the path. */
export const saveCaseUrl = saveUrlFor(activeCasePath);

/** Save target for the active source file (script editor). */
export const saveSourceUrl = saveUrlFor(activeSourcePath);

/**
 * A source file's boot buffer (SB-025 rule: a reload must never wipe
 * unsaved work). A localStorage draft that differs from disk wins; a
 * successful save clears the draft again. Defaults to the active case —
 * the case lenses call it bare; the script editor passes activeSourcePath.
 */
export function resolveBootText(
  path: string = activeCasePath,
): { text: string; draftRestored: boolean } {
  const diskText = files[`/${path}`];
  const draft = localStorage.getItem(draftKey(path));
  return draft !== null && draft !== diskText
    ? { text: draft, draftRestored: true }
    : { text: diskText, draftRestored: false };
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

/** Picker label for any source file: the case title, or the character id
 *  from the `# Character:` header for a `.sim.md` file. */
export function sourceLabel(path: string): string {
  if (!isCharacterPath(path)) return caseTitle(path);
  const id = (files[`/${path}`] ?? '').match(/^# Character:\s*([\wæøåÆØÅ_.-]+)/m)?.[1];
  return `${id || (path.split('/').pop() ?? path)} · character`;
}

/** Wire the topbar chrome: fill the #case-picker select and carry the
 *  active case across the lens cross-links. Case lenses call it bare (the
 *  picker lists cases, navigates ?case=). The script editor passes
 *  `{ allSources: true }`: the picker lists every source file and
 *  navigates ?file=. */
export function wireCaseChrome(opts: { allSources?: boolean } = {}): void {
  const picker = document.getElementById('case-picker') as HTMLSelectElement | null;
  if (picker) {
    const paths = opts.allSources ? sourcePaths : casePaths;
    const param = opts.allSources ? 'file' : 'case';
    for (const path of paths) {
      const option = document.createElement('option');
      option.value = path;
      option.textContent = sourceLabel(path);
      picker.append(option);
    }
    picker.value = opts.allSources ? activeSourcePath : activeCasePath;
    picker.addEventListener('change', () => {
      location.href = `?${param}=${encodeURIComponent(picker.value)}`;
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
