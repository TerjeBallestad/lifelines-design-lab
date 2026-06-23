import { describe, expect, it } from 'vitest';
import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  buildTinyOlsenArtifacts,
  defaultPaths,
  renderGeneratedBlueprintModule,
} from './generate-tiny-olsen-case.mjs';

const paths = defaultPaths(process.cwd());

describe('tiny Olsen case generator', () => {
  it('parses markdown evidence spans and builds the multi-document Godot source pack', async () => {
    const artifacts = await buildTinyOlsenArtifacts(paths);
    const godot = artifacts.godotSource;

    expect(godot.id).toBe('case_olsen_tiny');
    // Multi-document: the full blueprint slice carries the eight casework documents.
    expect(godot.documents).toHaveLength(8);
    const bekymring = godot.documents.find((doc) => doc.id === 'doc_bekymring');
    expect(bekymring.kind).toBe('BEKYMRINGSMELDING');
    expect(bekymring.runs.filter((run) => run.fact_id).map((run) => run.fact_id)).toEqual([
      'f_grete_syk',
      'f_aldri_alene',
      'f_ingen_tjenester',
      'f_grete_baerer',
      'f_saarbar',
    ]);
    expect(bekymring.body_bbcode).toContain('[url=fact:f_grete_baerer]');
    expect(bekymring.body_bbcode).toContain('Mor opplyser at hun bistår');

    // Document display fields flow through to the Godot pack.
    expect(bekymring.register).toBe('klinisk');
    expect(bekymring.peek.length).toBeGreaterThan(0);
    expect(bekymring.meta.startsWith('LEGESENTERET')).toBe(true);

    // Fact display fields: category, derived quote, discuss list.
    const greteSyk = godot.facts.find((fact) => fact.id === 'f_grete_syk');
    expect(greteSyk.category).toBe('Dokument');
    expect(greteSyk.quote).toBe('sykdom med kort forventet forløp');
    expect(greteSyk.discuss).toEqual(['Frank']);
    expect(godot.facts.find((fact) => fact.id === 'f_gap').supports_questions).toEqual([
      'q_okonomi',
      'q_bolig',
    ]);

    // Hypotheses / tiltak / dispatch wiring on the canonical id-space.
    expect(godot.hypotheses.find((h) => h.id === 'h_ok_gap').question_id).toBe('q_okonomi');
    expect(godot.questions.map((q) => q.id)).toEqual([
      'q_okonomi',
      'q_bolig',
      'q_hverdag',
      'q_selv',
      'q_kontakt',
      'q_kollaps',
    ]);
    expect(godot.dispatches.map((d) => d.id)).toEqual(['d_ring_grete', 'd_konto']);

    // The wired food-delivery seam survives: sim_hooks runtime hardcodes + event deltas.
    expect(godot.tiltak.find((t) => t.id === 't_matlevering').sim_hook_id).toBe(
      'case.olsen.tiltak.food',
    );
    expect(godot.tiltak.find((t) => t.id === 't_hjemmehjelp').sim_hook_id).toBe(
      'case.olsen.tiltak.channel',
    );
    expect(godot.event_delta_specs.map((e) => e.event_type)).toEqual([
      'grete_received',
      'delivery_taken_in',
      'delivery_unanswered',
    ]);
    expect(godot.event_delta_specs.find((e) => e.event_type === 'delivery_taken_in').clock_id).toBe(
      'ck_selvstendighet',
    );

    // Clock visibility predicate: gated clock vs always-visible clock.
    const bostotte = godot.clocks.find((c) => c.id === 'ck_bostotte');
    expect(bostotte.visibility.op).toBe('hypothesis_chosen');
    expect(godot.clocks.find((c) => c.id === 'ck_overfort').visibility).toBeUndefined();

    const visibleText = artifacts.labContent.documents.doc_bekymring.blocks[0].runs
      .map((run) => run.text)
      .join('');
    expect(visibleText).toContain('Mor opplyser at hun bistår');
    expect(visibleText).toContain('sårbar ved bortfall');
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
    const coreSourcePath = join(
      paths.coreLoopRoot,
      'resources/cases/olsen/source/tiny_olsen_slice.json',
    );
    try {
      await access(coreSourcePath);
    } catch {
      console.warn(`Skipping cross-repo Godot source check; missing ${coreSourcePath}`);
      return;
    }

    const artifacts = await buildTinyOlsenArtifacts(paths);
    const committed = JSON.parse(await readFile(coreSourcePath, 'utf8'));

    expect(artifacts.godotSource).toEqual(committed);
  });
});
