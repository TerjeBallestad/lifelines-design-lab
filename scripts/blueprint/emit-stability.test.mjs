// TASK-018 emit-stability golden.
//
// Interpretation (recorded in the PLAN-003 TASK-018 progress note): the
// compiler's emit is JSON, not markup, so emit(parse(x)) cannot literally
// re-parse its own emitted artifact. The fixed point proven here is the
// strongest honestly testable version:
//   1. Determinism: compiling the same source twice yields byte-identical
//      serialized output (slice JSON, labContent, diagnostics) — the emit is
//      a fixed point over its source.
//   2. Serializer fixed point: parsing the emitted core JSON and re-emitting
//      it through the canonical tab serializer reproduces the bytes exactly
//      (serialize(parse(serialize(slice))) === serialize(slice)) — the emit
//      contains only plain JSON-representable data with stable key order.
// Both hold for a 0.2 fixture case and for the current 0.1 file.
import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { compileTinyOlsen, serializeSliceJson } from './compile-olsen-case.mjs';

const root = resolve(process.cwd());
const sources = [
  {
    name: '0.2 fixture case (fragments.case.md)',
    path: join(root, 'src/compiler/__tests__/fixtures/fragments.case.md'),
  },
  {
    name: '0.1 file (tiny-olsen.case.md)',
    path: join(root, 'content/cases/olsen/tiny-olsen.case.md'),
  },
];

describe.each(sources)('emit stability — $name', ({ path }) => {
  it('compiling the same source twice yields byte-identical output', async () => {
    const text = await readFile(path, 'utf8');
    const first = compileTinyOlsen(text);
    const second = compileTinyOlsen(text);
    expect(serializeSliceJson(second.slice)).toBe(serializeSliceJson(first.slice));
    expect(JSON.stringify(second.labContent)).toBe(JSON.stringify(first.labContent));
    expect(JSON.stringify(second.diagnostics)).toBe(JSON.stringify(first.diagnostics));
  });

  it('the tab serializer is a fixed point under JSON re-parse', async () => {
    const text = await readFile(path, 'utf8');
    const { slice } = compileTinyOlsen(text);
    const emitted = serializeSliceJson(slice);
    expect(serializeSliceJson(JSON.parse(emitted))).toBe(emitted);
  });
});

describe('canonical serialization', () => {
  it('the core-JSON serializer writes TAB indentation with a trailing newline', () => {
    expect(serializeSliceJson({ id: 'x', documents: [{ id: 'd' }] })).toBe(
      '{\n\t"id": "x",\n\t"documents": [\n\t\t{\n\t\t\t"id": "d"\n\t\t}\n\t]\n}\n',
    );
  });
});
