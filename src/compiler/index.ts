// Kildeverket markup 0.2 compiler — pure module, no filesystem access.
// Importable by plain node (native type stripping) and by Vite browser code.
//
// Entry point: compileCase(text) → { slice, labContent, diagnostics }.
// The file always compiles: any input yields a result; problems surface as
// typed diagnostics (see diagnostics.ts for the stable code list).

import { DiagnosticBag, codes, span } from './diagnostics.ts';
import type { Diagnostic } from './diagnostics.ts';
import { parseCaseText, parseCharacterText } from './parse.ts';
import { emitCase } from './emit.ts';
import type { CaseSlice, LabContent } from './emit.ts';
import { emitCharacter } from './emit-character.ts';
import type { CharacterContent } from './emit-character.ts';

export interface CompileResult {
  slice: CaseSlice;
  labContent: LabContent;
  diagnostics: Diagnostic[];
}

export interface CompileCharacterResult {
  content: CharacterContent;
  diagnostics: Diagnostic[];
}

export function compileCase(text: string): CompileResult {
  const diag = new DiagnosticBag();
  try {
    const parsed = parseCaseText(text, diag);
    const { slice, labContent } = emitCase(parsed, diag);
    return { slice, labContent, diagnostics: diag.items };
  } catch (err) {
    // The compiler must never throw ("the file always compiles").
    diag.add(
      'internal-error',
      'error',
      `Internal compiler error: ${err instanceof Error ? err.message : String(err)}`,
      span(1),
      [],
    );
    return {
      slice: {
        id: '',
        title: '',
        scenario_stage: 0,
        documents: [],
        facts: [],
        questions: [],
        hypotheses: [],
        tiltak: [],
        dispatches: [],
        clocks: [],
        event_delta_specs: [],
        day_script_beats: [],
      },
      labContent: { documents: {}, facts: {}, questions: {}, tiltak: {}, dispatches: {} },
      diagnostics: diag.items,
    };
  }
}

// Sibling entry for `content/characters/<id>.sim.md` (SDD-130 §2); same
// never-throws law as compileCase.
export function compileCharacter(text: string): CompileCharacterResult {
  const diag = new DiagnosticBag();
  try {
    const parsed = parseCharacterText(text, diag);
    const { content } = emitCharacter(parsed, diag);
    return { content, diagnostics: diag.items };
  } catch (err) {
    diag.add(
      'internal-error',
      'error',
      `Internal compiler error: ${err instanceof Error ? err.message : String(err)}`,
      span(1),
      [],
    );
    return { content: { id: '', thoughts: [] }, diagnostics: diag.items };
  }
}

export { codes } from './diagnostics.ts';
export { blockRuns } from '../domain/blueprint.ts';
export { findStubBlocks, isStubBlock } from './stubs.ts';
export type { StubBlockRef } from './stubs.ts';
export type { Diagnostic, DiagnosticCode, Severity, Span } from './diagnostics.ts';
export type { CaseSlice, LabContent, ProposalOut, RecipeOut } from './emit.ts';
export type {
  CharacterContent,
  ThoughtPoolOut,
  BarkPoolOut,
  PhoneLinesOut,
} from './emit-character.ts';
export type { PredicateSpec } from './condition.ts';
export type { EffectSpec } from './effects.ts';
export type {
  CallOut,
  CallExchangeOut,
  CallLineOut,
  ChatEntryOut,
  ChatFollowupOut,
} from './weave.ts';
