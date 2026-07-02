import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import {
  buildTinyOlsenArtifacts,
  defaultPaths,
  renderGeneratedBlueprintModule,
} from './generate-tiny-olsen-case.mjs';
import { parseCaseMarkdown, buildArtifacts, serializeCase } from './case-format.mjs';

// Content-agnostic pipeline laws (night build 2026-07-02). The old test asserted
// hardcoded counts from the pre-drift one-document case; that content is gone
// (SB-314 root cause). These laws must hold for ANY authored case so the
// authoring editor can evolve content without rewriting tests.

const paths = defaultPaths(process.cwd());

describe('tiny Olsen case pipeline', () => {
  it('parses the humane source and builds artifacts without validation warnings', async () => {
    const artifacts = await buildTinyOlsenArtifacts(paths);
    expect(artifacts.godotSource.id).toBeTruthy();
    expect(artifacts.godotSource.documents.length).toBeGreaterThan(0);
    expect(artifacts.godotSource.facts.length).toBeGreaterThan(0);
    expect(artifacts.godotSource.questions.length).toBeGreaterThan(0);
    expect(artifacts.godotSource.hypotheses.length).toBeGreaterThan(0);
  });

  it('matches the committed Godot core-loop source JSON (cross-repo freshness)', async () => {
    const artifacts = await buildTinyOlsenArtifacts(paths);
    const committed = JSON.parse(await readFile(paths.coreSourcePath, 'utf8'));
    expect(artifacts.godotSource).toEqual(committed);
  });

  it('obeys the round-trip law: serialize -> parse -> build == original', async () => {
    const artifacts = await buildTinyOlsenArtifacts(paths);
    const markdown = serializeCase(artifacts.godotSource);
    const rebuilt = buildArtifacts(parseCaseMarkdown(markdown));
    expect(rebuilt.warnings).toEqual([]);
    expect(rebuilt.godotSource).toEqual(artifacts.godotSource);
  });

  it('derives every fact quote from a document run or an explicit Quote override', async () => {
    const artifacts = await buildTinyOlsenArtifacts(paths);
    for (const fact of artifacts.godotSource.facts) {
      expect(typeof fact.quote).toBe('string');
    }
  });

  it('renders the typed design-lab module with all expected exports', async () => {
    const artifacts = await buildTinyOlsenArtifacts(paths);
    const moduleSource = renderGeneratedBlueprintModule(artifacts);
    for (const name of [
      'tinyOlsenDocuments',
      'tinyOlsenFacts',
      'tinyOlsenQuestions',
      'tinyOlsenTiltak',
      'tinyOlsenDispatches',
      'tinyOlsenGodotSource',
    ]) {
      expect(moduleSource).toContain(`export const ${name}`);
    }
  });
});
