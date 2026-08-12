// Helpers shared by the emitters (emit.ts, emit-visit.ts, emit-character.ts).
// Extracted in the PLAN-006 review commit so Stub/field semantics have one
// home — a change here changes every emitter at once.

import type { DiagnosticBag, Span } from './diagnostics.ts';
import { codes, span } from './diagnostics.ts';
import type { RawBlock, RawField } from './parse.ts';

export function blockSpan(block: RawBlock): Span {
  return span(block.startLine, block.endLine);
}

export function stripGuillemets(value: string): string {
  if (value.startsWith('«') && value.endsWith('»')) return value.slice(1, -1);
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    // Inner quotes may be authored either bare (the stripper only ever cuts
    // the OUTER pair) or as \" — unescape so no backslash reaches runtime
    // text (PLAN-009 end-gate review: literal \" leaked into 7 strings).
    return value.slice(1, -1).replaceAll('\\"', '"');
  }
  return value;
}

/**
 * Case-insensitive field lookup with leftover tracking: emitters read the
 * fields they know, then warnLeftovers reports the rest as FIELD_UNKNOWN.
 */
export class FieldMap {
  private readonly used = new Set<RawField>();
  private readonly fields: RawField[];
  constructor(fields: RawField[]) {
    this.fields = fields;
  }

  find(...keys: string[]): RawField | undefined {
    const lower = keys.map((key) => key.toLowerCase());
    const found = this.fields.find((field) => lower.includes(field.key.toLowerCase()));
    if (found) this.used.add(found);
    return found;
  }

  all(...keys: string[]): RawField[] {
    const lower = keys.map((key) => key.toLowerCase());
    const found = this.fields.filter((field) => lower.includes(field.key.toLowerCase()));
    for (const field of found) this.used.add(field);
    return found;
  }

  value(...keys: string[]): string | undefined {
    return this.find(...keys)?.value;
  }

  leftovers(): RawField[] {
    return this.fields.filter((field) => !this.used.has(field));
  }
}

export function warnLeftovers(fieldMap: FieldMap, diag: DiagnosticBag, ownerId: string): void {
  for (const field of fieldMap.leftovers()) {
    diag.add(
      codes.FIELD_UNKNOWN,
      'warning',
      `Unknown field "${field.key}:" on ${ownerId}`,
      span(field.line),
      [ownerId],
    );
  }
}

/**
 * The SDD-130 `Stub: yes` marker. Only "yes" counts; any other value warns
 * and the marker is ignored.
 */
export function readStubMarker(
  field: RawField | undefined,
  ownerId: string,
  diag: DiagnosticBag,
): boolean {
  if (!field) return false;
  if (field.value.trim() !== 'yes') {
    diag.add(
      codes.LINE_UNPARSED,
      'warning',
      `Stub takes only "yes", got: "${field.value}" — the marker is ignored.`,
      span(field.line),
      [ownerId],
    );
    return false;
  }
  return true;
}
