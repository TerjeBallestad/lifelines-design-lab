// §7 effect lines — one ~ line per consequence. Legal in facts, beats,
// dispatches, event deltas and weave branches (weave lands in Task 2).
// Ops the runtime's EffectSpec knows emit JSON; the rest warn and emit
// nothing (DD-002 emit boundary).

import type { DiagnosticBag, Span } from './diagnostics.ts';
import { codes } from './diagnostics.ts';

export interface EffectSpec {
  op: string;
  args: Record<string, unknown>;
}

export type EffectLineAst =
  | { kind: 'pay'; factId: string }
  | { kind: 'clock'; clockId: string; delta: number }
  | { kind: 'deliver'; documentId: string; delayDays: number; clockId: string | null }
  | { kind: 'open'; questionId: string }
  | { kind: 'stage'; stage: number }
  | { kind: 'log'; text: string }
  | { kind: 'error'; text: string };

export function parseEffectLine(body: string): EffectLineAst {
  const text = body.trim();
  let match: RegExpMatchArray | null;
  if ((match = text.match(/^pay\s+(\S+)$/))) return { kind: 'pay', factId: match[1] };
  if ((match = text.match(/^clock\s+(\S+)\s+([+-]\d+)$/)))
    return { kind: 'clock', clockId: match[1], delta: Number(match[2]) };
  if ((match = text.match(/^deliver\s+(\S+)\s+in\s+(\d+)d(?:\s+on\s+(\S+))?$/)))
    return {
      kind: 'deliver',
      documentId: match[1],
      delayDays: Number(match[2]),
      clockId: match[3] ?? null,
    };
  if ((match = text.match(/^open\s+(\S+)$/))) return { kind: 'open', questionId: match[1] };
  if ((match = text.match(/^stage\s+(\d+)$/))) return { kind: 'stage', stage: Number(match[1]) };
  if ((match = text.match(/^log\s+(.*)$/))) return { kind: 'log', text: match[1] };
  return { kind: 'error', text };
}

export function deliverEffect(
  documentId: string,
  delayDays: number,
  clockId: string | null,
): EffectSpec {
  const args: Record<string, unknown> = {};
  if (clockId) args.clock_id = clockId; // bucket key for the pending-doc queue, not a tick
  args.document_id = documentId;
  args.delay_days = delayDays;
  return { op: 'queue_pending_document', args };
}

interface EffectLineWithSpan {
  ast: EffectLineAst;
  span: Span;
}

/**
 * Emit EffectSpec[] from parsed ~ lines. `~ open` lines merge into a single
 * reveal_questions effect (placed at the first `~ open` position), matching
 * the shipped f_dod shape. pay/clock/log have no runtime consumer in these
 * contexts and warn without emitting.
 */
export function emitEffects(
  lines: EffectLineWithSpan[],
  diag: DiagnosticBag,
  ownerId: string,
): EffectSpec[] {
  const out: EffectSpec[] = [];
  let reveal: EffectSpec | null = null;
  for (const { ast, span } of lines) {
    switch (ast.kind) {
      case 'deliver':
        // SB-085 lint 5: queue_pending_document.clock_id is a dead bucket
        // key — the engine's arrival sweep keys on available_day only.
        if (ast.clockId) {
          diag.add(
            codes.DELIVER_CLOCK_ID_DEAD,
            'warning',
            `"on ${ast.clockId}" is a dead bucket key — the engine's arrival sweep keys on available_day only; the clock reference does nothing.`,
            span,
            [ast.clockId, ownerId],
          );
        }
        out.push(deliverEffect(ast.documentId, ast.delayDays, ast.clockId));
        break;
      case 'open': {
        if (reveal === null) {
          reveal = { op: 'reveal_questions', args: { question_ids: [ast.questionId] } };
          out.push(reveal);
        } else {
          (reveal.args.question_ids as string[]).push(ast.questionId);
        }
        break;
      }
      case 'stage':
        out.push({ op: 'set_scenario_stage', args: { stage: ast.stage } });
        break;
      case 'pay':
        diag.add(
          codes.EFFECT_UNSUPPORTED_PAY,
          'warning',
          `~ pay has no runtime effect op outside conversation weave; nothing is emitted for "${ast.factId}" (engine backlog).`,
          span,
          [ast.factId, ownerId],
        );
        break;
      case 'clock':
        diag.add(
          codes.EFFECT_UNSUPPORTED_CLOCK,
          'warning',
          `~ clock has no runtime effect op; nothing is emitted for "${ast.clockId}" (engine backlog).`,
          span,
          [ast.clockId, ownerId],
        );
        break;
      case 'log':
        diag.add(
          codes.EFFECT_UNSUPPORTED_LOG,
          'warning',
          `~ log has no runtime effect op; nothing is emitted (engine backlog).`,
          span,
          [ownerId],
        );
        break;
      case 'error':
        diag.add(
          codes.EFFECT_PARSE_ERROR,
          'warning',
          `Unrecognized ~ effect line: "${ast.text}"`,
          span,
          [ownerId],
        );
        break;
    }
  }
  return out;
}
