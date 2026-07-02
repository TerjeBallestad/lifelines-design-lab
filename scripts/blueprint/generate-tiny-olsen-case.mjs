#!/usr/bin/env node
// Tiny-Olsen artifact generator (thin CLI over case-format.mjs).
//
//   content/cases/olsen/tiny-olsen.case.md   (humane source — edit THIS)
//        │ parseCaseMarkdown + buildArtifacts
//        ├─> src/content/blueprint/generated/tinyOlsen.ts        (react lab)
//        └─> ../lifelines-core-loop/resources/cases/olsen/source/
//            tiny_olsen_slice.json                                (Godot)
//
// Night build 2026-07-02: full evolved schema lives in case-format.mjs;
// serializeCase() there is the reverse direction (JSON -> .case.md) used to
// heal drift. Round-trip law is enforced by generate-tiny-olsen-case.test.mjs.
// JSON is written with TAB indentation (SB-313 canonical form).

import { constants as fsConstants } from 'node:fs';
import { access, readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';
import { parseCaseMarkdown, buildArtifacts, stableStringify } from './case-format.mjs';

export { parseCaseMarkdown } from './case-format.mjs';

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

export async function buildTinyOlsenArtifacts(paths = defaultPaths()) {
  const caseText = await readFile(paths.casePath, 'utf8');
  const source = parseCaseMarkdown(caseText);
  const { godotSource, labContent, warnings } = buildArtifacts(source);
  if (warnings.length) {
    throw new Error(`Case content validation failed:\n  ${warnings.join('\n  ')}`);
  }
  return { godotSource, labContent, source };
}

export function renderGeneratedBlueprintModule({ godotSource, labContent }) {
  return (
    `import type { BlueprintDispatch, BlueprintDocument, BlueprintFact, BlueprintQuestion, BlueprintTiltak } from '../../../domain/blueprint';\n\n` +
    `export const tinyOlsenDocuments = ${toTs(labContent.documents)} satisfies Record<string, BlueprintDocument>;\n\n` +
    `export const tinyOlsenFacts = ${toTs(labContent.facts)} satisfies Record<string, BlueprintFact>;\n\n` +
    `export const tinyOlsenQuestions = ${toTs(labContent.questions)} satisfies Record<string, BlueprintQuestion>;\n\n` +
    `export const tinyOlsenTiltak = ${toTs(labContent.tiltak)} satisfies Record<string, BlueprintTiltak>;\n\n` +
    `export const tinyOlsenDispatches = ${toTs(labContent.dispatches)} satisfies Record<string, BlueprintDispatch>;\n\n` +
    `export const tinyOlsenGodotSource = ${toTs(godotSource)} as const;\n`
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
  await writeFile(paths.coreSourcePath, stableStringify(artifacts.godotSource), 'utf8');
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
  const moduleSource = await formatGeneratedBlueprintModule(artifacts);
  const jsonSource = stableStringify(artifacts.godotSource);
  if (check) {
    const currentModule = await readFile(paths.generatedModulePath, 'utf8');
    let currentJson = null;
    try {
      currentJson = await readFile(paths.coreSourcePath, 'utf8');
    } catch {
      console.warn(
        `core-loop source JSON not found; skipping cross-repo freshness check: ${paths.coreSourcePath}`,
      );
    }
    if (currentModule !== moduleSource || (currentJson != null && currentJson !== jsonSource)) {
      throw new Error('Generated tiny Olsen artifacts are stale. Run npm run gen:olsen.');
    }
    console.log('Generated tiny Olsen artifacts are fresh.');
  } else {
    await writeTinyOlsenArtifacts(paths);
    console.log('Wrote generated tiny Olsen artifacts.');
  }
}
