#!/usr/bin/env node
// Thin CLI over the 0.2 compiler (src/compiler) — TASK-018 wiring.
// Replaces the parse layer of generate-tiny-olsen-case.mjs on the live path;
// that file remains solely as the legacy-equivalence oracle until SB-024
// retires it. `npm run gen:olsen` / `gen:olsen:check` keep their names and
// behavior but run the new compiler.
import { constants as fsConstants } from 'node:fs';
import { access, readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';
import { compileCase } from '../../src/compiler/index.ts';

export function defaultPaths(cwd = process.cwd()) {
  const designLabRoot = resolve(cwd);
  const coreLoopRoot = resolve(designLabRoot, '../lifelines-core-loop');
  return {
    designLabRoot,
    coreLoopRoot,
    casePath: join(designLabRoot, 'content/cases/olsen/tiny-olsen.case.md'),
    generatedModulePath: join(designLabRoot, 'src/content/blueprint/generated/tinyOlsen.ts'),
    coreSourcePath: join(coreLoopRoot, 'resources/cases/olsen/source/tiny_olsen_slice.json'),
  };
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
  return JSON.stringify(value, null, 2)
    .replace(/"([A-Za-z_$][\w$]*)":/g, '$1:')
    .replace(/: "([a-zA-Z0-9_]+)"/g, ": '$1'")
    .replace(/"/g, "'");
}

export async function formatGeneratedBlueprintModule(artifacts) {
  return prettier.format(renderGeneratedBlueprintModule(artifacts), {
    parser: 'typescript',
    singleQuote: true,
    trailingComma: 'all',
    printWidth: 100,
  });
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

export async function writeTinyOlsenArtifacts(paths = defaultPaths()) {
  const artifacts = await buildTinyOlsenArtifacts(paths);
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
  const moduleSource = await formatGeneratedBlueprintModule(artifacts);
  const jsonSource = serializeSliceJson(artifacts.slice);
  if (check) {
    let stale = false;
    const currentModule = await readFile(paths.generatedModulePath, 'utf8');
    if (currentModule === moduleSource) {
      console.log(`tinyOlsen.ts is up to date`);
    } else {
      console.log(`tinyOlsen.ts is stale: ${paths.generatedModulePath}`);
      stale = true;
    }
    let currentJson = null;
    try {
      currentJson = await readFile(paths.coreSourcePath, 'utf8');
    } catch {
      console.warn(
        `core-loop source JSON not found; skipping cross-repo freshness check: ${paths.coreSourcePath}`,
      );
    }
    if (currentJson != null) {
      if (currentJson === jsonSource) {
        console.log(`core JSON is up to date`);
      } else {
        console.log(`core JSON is stale: ${paths.coreSourcePath}`);
        stale = true;
      }
    }
    if (stale) {
      throw new Error('Generated tiny Olsen artifacts are stale. Run npm run gen:olsen.');
    }
    console.log('tiny Olsen artifacts are up to date');
  } else {
    await writeTinyOlsenArtifacts(paths);
    console.log(`wrote ${paths.generatedModulePath}`);
    console.log(`wrote ${paths.coreSourcePath}`);
  }
}
