#!/usr/bin/env node
// Thin CLI over the 0.2 compiler (src/compiler).
// TASK-018 wired the case path; PLAN-006 TASK-028 generalized gen:olsen into
// gen:content — one live path compiling the case file plus every
// content/characters/*.sim.md into the committed artifacts. `npm run
// gen:olsen` remains an alias of `gen:content`.
import { constants as fsConstants } from 'node:fs';
import { access, readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';
import { compileCase, compileCharacter, findStubBlocks } from '../../src/compiler/index.ts';

export function defaultPaths(cwd = process.cwd()) {
  const designLabRoot = resolve(cwd);
  const coreLoopRoot = resolve(designLabRoot, '../lifelines-core-loop');
  return {
    designLabRoot,
    coreLoopRoot,
    casePath: join(designLabRoot, 'content/cases/olsen/tiny-olsen.case.md'),
    generatedModulePath: join(designLabRoot, 'src/content/blueprint/generated/tinyOlsen.ts'),
    coreSourcePath: join(coreLoopRoot, 'resources/cases/olsen/source/tiny_olsen_slice.json'),
    charactersDir: join(designLabRoot, 'content/characters'),
    coreCharactersDir: join(coreLoopRoot, 'resources/characters/source'),
  };
}

/** Every character source file, sorted for deterministic output order. */
export async function discoverCharacterSources(paths = defaultPaths()) {
  let names;
  try {
    names = await readdir(paths.charactersDir);
  } catch {
    return [];
  }
  return names
    .filter((name) => name.endsWith('.sim.md'))
    .sort()
    .map((name) => ({
      id: basename(name, '.sim.md'),
      sourcePath: join(paths.charactersDir, name),
      outPath: join(paths.coreCharactersDir, `${basename(name, '.sim.md')}_sim_content.json`),
    }));
}

/**
 * Canonical core-loop serialization: TAB indentation (SB-313/SB-486
 * formatting law — the shipped tiny_olsen_slice.json is tab-indented).
 */
export function serializeSliceJson(slice) {
  const stamped = {
    _generated:
      'DO NOT HAND-EDIT. Compiled from lifelines-design-lab content/cases/olsen/tiny-olsen.case.md — edit that file and run `npm run gen:olsen` there. Hand edits are overwritten by the next compile.',
    ...slice,
  };
  return `${JSON.stringify(stamped, null, '\t')}\n`;
}

export function compileTinyOlsen(caseText) {
  const { slice, labContent, diagnostics } = compileCase(caseText);
  return { slice, labContent, diagnostics };
}

/**
 * Same tab-JSON formatting law for the per-character sim-content files
 * (resources/characters/source/<id>_sim_content.json).
 */
export function serializeCharacterJson(content, sourceFileName) {
  const stamped = {
    _generated: `DO NOT HAND-EDIT. Compiled from lifelines-design-lab content/characters/${sourceFileName} — edit that file and run \`npm run gen:content\` there. Hand edits are overwritten by the next compile.`,
    ...content,
  };
  return `${JSON.stringify(stamped, null, '\t')}\n`;
}

export async function buildCharacterArtifact(source) {
  const text = await readFile(source.sourcePath, 'utf8');
  const { content, diagnostics } = compileCharacter(text);
  if (content.id && content.id !== source.id) {
    diagnostics.push({
      code: 'line-unparsed',
      severity: 'warning',
      message: `# Character: ${content.id} does not match the file name ${source.id}.sim.md; the file name wins for the output path.`,
      span: { startLine: 1, endLine: 1 },
      subjectIds: [content.id],
    });
  }
  return { source, content, diagnostics };
}

export async function buildTinyOlsenArtifacts(paths = defaultPaths()) {
  const caseText = await readFile(paths.casePath, 'utf8');
  return compileTinyOlsen(caseText);
}

export function renderGeneratedBlueprintModule({ slice, labContent }) {
  return (
    `import type { BlueprintDispatch, BlueprintDocument, BlueprintFact, BlueprintQuestion, BlueprintTiltak } from '../../../domain/blueprint';\n\n` +
    `export const tinyOlsenDocuments = ${toTs(labContent.documents)} satisfies Record<string, BlueprintDocument>;\n\n` +
    `export const tinyOlsenFacts = ${toTs(labContent.facts)} satisfies Record<string, BlueprintFact>;\n\n` +
    `export const tinyOlsenQuestions = ${toTs(labContent.questions)} satisfies Record<string, BlueprintQuestion>;\n\n` +
    `export const tinyOlsenTiltak = ${toTs(labContent.tiltak)} satisfies Record<string, BlueprintTiltak>;\n\n` +
    `export const tinyOlsenDispatches = ${toTs(labContent.dispatches)} satisfies Record<string, BlueprintDispatch>;\n\n` +
    `export const tinyOlsenGodotSource = ${toTs(slice)} as const;\n`
  );
}

function toTs(value) {
  // Walk real JSON string literals and re-quote them as single-quoted TS
  // strings with correct escaping (a bare "→'" swap corrupts any content
  // that itself contains an apostrophe or a double quote).
  return JSON.stringify(value, null, 2)
    .replace(/"(?:[^"\\]|\\.)*"/g, (literal) => {
      const text = JSON.parse(literal);
      return `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;
    })
    .replace(/'([A-Za-z_$][\w$]*)':/g, '$1:');
}

export async function formatGeneratedBlueprintModule(artifacts) {
  return prettier.format(renderGeneratedBlueprintModule(artifacts), {
    parser: 'typescript',
    singleQuote: true,
    trailingComma: 'all',
    printWidth: 100,
  });
}

/**
 * SB-071 stub-count lint (SDD-130 §2: "a lint counts stubs — the placeholder
 * purge is done when the count is zero"). Counts every `Stub: yes` block
 * across the case file and each character source. Never fatal — stubs are
 * the expected state until the purge lands; the count makes it measurable.
 */
export async function countStubs(paths = defaultPaths()) {
  const perFile = [];
  const caseText = await readFile(paths.casePath, 'utf8');
  perFile.push({
    file: basename(paths.casePath),
    count: findStubBlocks(caseText, 'case').length,
  });
  for (const source of await discoverCharacterSources(paths)) {
    const text = await readFile(source.sourcePath, 'utf8');
    perFile.push({
      file: basename(source.sourcePath),
      count: findStubBlocks(text, 'character').length,
    });
  }
  return { total: perFile.reduce((sum, entry) => sum + entry.count, 0), perFile };
}

export function formatStubCount({ total, perFile }) {
  const breakdown = perFile
    .filter((entry) => entry.count > 0)
    .map((entry) => `${entry.file} ${entry.count}`)
    .join(' · ');
  return total === 0
    ? 'stub count: 0 — the placeholder purge is done'
    : `stub count: ${total} (Stub: yes blocks awaiting rewrite) — ${breakdown}`;
}

function printDiagnostics(diagnostics) {
  for (const diagnostic of diagnostics) {
    const where =
      diagnostic.span.startLine === diagnostic.span.endLine
        ? `L${diagnostic.span.startLine}`
        : `L${diagnostic.span.startLine}-${diagnostic.span.endLine}`;
    console.error(`[${diagnostic.severity}] ${diagnostic.code} ${where}: ${diagnostic.message}`);
  }
}

export async function writeTinyOlsenArtifacts(paths = defaultPaths(), prebuilt = null) {
  // The CLI passes its already-built (and diagnostic-printed) artifacts so
  // the written bytes come from the same compile — one build, one truth.
  const artifacts = prebuilt ?? (await buildTinyOlsenArtifacts(paths));
  await mkdir(dirname(paths.generatedModulePath), { recursive: true });
  await assertWritableDirectory(
    dirname(paths.coreSourcePath),
    'core-loop generated source directory',
  );
  await writeFile(
    paths.generatedModulePath,
    await formatGeneratedBlueprintModule(artifacts),
    'utf8',
  );
  await writeFile(paths.coreSourcePath, serializeSliceJson(artifacts.slice), 'utf8');
  return artifacts;
}

export async function writeCharacterArtifacts(paths = defaultPaths(), prebuilt = null) {
  const artifacts =
    prebuilt ??
    (await Promise.all((await discoverCharacterSources(paths)).map(buildCharacterArtifact)));
  if (artifacts.length === 0) return [];
  await mkdir(paths.coreCharactersDir, { recursive: true });
  await assertWritableDirectory(paths.coreCharactersDir, 'core-loop character source directory');
  for (const artifact of artifacts) {
    await writeFile(
      artifact.source.outPath,
      serializeCharacterJson(artifact.content, basename(artifact.source.sourcePath)),
      'utf8',
    );
  }
  return artifacts;
}

async function assertWritableDirectory(path, label) {
  try {
    await access(path, fsConstants.W_OK);
  } catch {
    throw new Error(`${label} is missing or not writable: ${path}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  const paths = defaultPaths(process.cwd());
  const artifacts = await buildTinyOlsenArtifacts(paths);
  printDiagnostics(artifacts.diagnostics);
  const characterSources = await discoverCharacterSources(paths);
  const characters = [];
  for (const source of characterSources) {
    const artifact = await buildCharacterArtifact(source);
    printDiagnostics(artifact.diagnostics);
    characters.push(artifact);
  }
  const moduleSource = await formatGeneratedBlueprintModule(artifacts);
  const jsonSource = serializeSliceJson(artifacts.slice);
  // SB-071: the stub-count lint runs in both modes — check output is where
  // the placeholder purge gets measured (gen:content:check / case:check).
  console.log(formatStubCount(await countStubs(paths)));
  if (check) {
    let stale = false;
    const checkFile = async (path, expected, label, { skipMissing = false } = {}) => {
      let current = null;
      try {
        current = await readFile(path, 'utf8');
      } catch {
        if (skipMissing) {
          console.warn(`${label} not found; skipping cross-repo freshness check: ${path}`);
          return;
        }
        console.log(`${label} is missing: ${path}`);
        stale = true;
        return;
      }
      if (current === expected) {
        console.log(`${label} is up to date`);
      } else {
        console.log(`${label} is stale: ${path}`);
        stale = true;
      }
    };
    await checkFile(paths.generatedModulePath, moduleSource, 'tinyOlsen.ts');
    await checkFile(paths.coreSourcePath, jsonSource, 'core JSON', { skipMissing: true });
    // The character files live beside the case JSON in core-loop: when that
    // checkout is absent the case check already warned, so skip these too.
    let coreLoopPresent = true;
    try {
      await access(paths.coreCharactersDir, fsConstants.F_OK);
    } catch {
      coreLoopPresent = false;
    }
    if (coreLoopPresent) {
      for (const artifact of characters) {
        await checkFile(
          artifact.source.outPath,
          serializeCharacterJson(artifact.content, basename(artifact.source.sourcePath)),
          `${artifact.source.id}_sim_content.json`,
        );
      }
    } else if (characters.length > 0) {
      console.warn(
        `core-loop character directory not found; skipping cross-repo freshness check: ${paths.coreCharactersDir}`,
      );
    }
    if (stale) {
      throw new Error('Generated content artifacts are stale. Run npm run gen:content.');
    }
    console.log('generated content artifacts are up to date');
  } else {
    await writeTinyOlsenArtifacts(paths, artifacts);
    console.log(`wrote ${paths.generatedModulePath}`);
    console.log(`wrote ${paths.coreSourcePath}`);
    const written = await writeCharacterArtifacts(paths, characters);
    for (const artifact of written) console.log(`wrote ${artifact.source.outPath}`);
  }
}
