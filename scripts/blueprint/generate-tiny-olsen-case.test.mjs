import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  buildTinyOlsenArtifacts,
  defaultPaths,
  renderGeneratedBlueprintModule,
} from './generate-tiny-olsen-case.mjs';

const paths = defaultPaths(process.cwd());

describe('tiny Olsen case generator', () => {
  it('parses markdown evidence spans and builds the tiny Godot source pack', async () => {
    const artifacts = await buildTinyOlsenArtifacts(paths);

    expect(artifacts.godotSource.id).toBe('case_olsen_tiny');
    expect(artifacts.godotSource.documents).toHaveLength(1);
    expect(artifacts.godotSource.documents[0].id).toBe('doc_bekymring');
    expect(artifacts.godotSource.documents[0].runs.map((run) => run.fact_id)).toEqual([
      'f_grete_baerer',
      'f_manglende_post',
      'f_regninger',
      'f_lite_mat',
      'f_telefon_ubesvart',
    ]);
    expect(artifacts.godotSource.documents[0].body_bbcode).toContain('[url=fact:f_grete_baerer]');
    expect(artifacts.godotSource.questions.map((q) => q.id)).toEqual(['q_hverdag', 'q_okonomi']);
    expect(artifacts.godotSource.hypotheses).toHaveLength(3);
    expect(artifacts.godotSource.dispatches.map((d) => d.id)).toEqual(['d_ring_grete', 'd_konto']);
    expect(artifacts.godotSource.clocks.map((c) => c.id)).toEqual(['ck_overfort']);
  });

  it('renders typed design-lab content from the same canonical source', async () => {
    const artifacts = await buildTinyOlsenArtifacts(paths);
    const moduleSource = renderGeneratedBlueprintModule(artifacts);

    expect(moduleSource).toContain('export const tinyOlsenDocuments');
    expect(moduleSource).toContain('doc_bekymring');
    expect(moduleSource).toContain("factId: 'f_grete_baerer'");
    expect(moduleSource).toContain('export const tinyOlsenGodotSource');
  });

  it('matches the committed Godot source JSON exactly after generation', async () => {
    const artifacts = await buildTinyOlsenArtifacts(paths);
    const committed = JSON.parse(
      await readFile(
        join(paths.coreLoopRoot, 'resources/cases/olsen/source/tiny_olsen_slice.json'),
        'utf8',
      ),
    );

    expect(artifacts.godotSource).toEqual(committed);
  });
});
