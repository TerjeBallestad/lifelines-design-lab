// Blocking guard for banned typography: em dash (—), guillemets (« »), and
// the middle dot (·) must not enter authored content or player-visible source
// again (they were swept repo-wide in August 2026; the game writes "-" and
// straight quotes). The compiler's lint-banned-typography warns per line but
// never blocks — THIS test is the hard stop, and it runs in every `vitest run`.
//
// Lives in scripts/ (not src/) because it needs node:fs, and the app tsconfig
// has no @types/node.
import { describe, expect, it } from 'vitest';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(process.cwd());

const BANNED = /[—«»·]/;

// ` · ` immediately before a composite follow key is case-file grammar
// (parse.ts splitCompositeFieldLine) — the only legal middle dot.
const COMPOSITE_SEPARATOR =
  / · (?=(?:Register|Category|Cost|Weight|Bad|Delay|Duration|Occupies):\s)/g;

// Pure comment lines and trailing `// …` comments may keep the characters —
// they are not player-visible. Same heuristics as parse.ts stripComment.
const COMMENT_LINE = /^\s*(\/\/|\*|\/\*)/;
const TRAILING_COMMENT = /\s+\/\/.*$/;

// Player-visible trees. Generated artifacts are included on purpose: they
// prove the whole pipeline stayed clean, not just the sources.
const SCANNED = [
  { dir: 'content', extensions: ['.md'] },
  { dir: 'src/content', extensions: ['.ts'] },
  { dir: 'src/components', extensions: ['.ts', '.tsx'] },
  { dir: 'src/stores', extensions: ['.ts', '.tsx'] },
  { dir: 'src/engine', extensions: ['.ts'] },
  { dir: 'templates/docs', extensions: ['.mjs'] },
];

// Test code and fixtures assert on grammar (the compiler still accepts «»
// from older content), so they stay out of scope.
const SKIPPED = /(\.test\.|__tests__)/;

async function walk(dir, extensions, out) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path, extensions, out);
    else if (extensions.some((ext) => entry.name.endsWith(ext)) && !SKIPPED.test(path))
      out.push(path);
  }
  return out;
}

describe('banned typography guard', () => {
  it('no em dash, guillemet, or middle dot in content or player-visible source', async () => {
    const violations = [];
    for (const { dir, extensions } of SCANNED) {
      const files = await walk(resolve(ROOT, dir), extensions, []);
      for (const file of files) {
        // Mask block comments (newlines kept, so line numbers hold) — their
        // bodies are not player-visible.
        const text = (await readFile(file, 'utf8')).replace(/\/\*[\s\S]*?\*\//g, (comment) =>
          comment.replace(/[^\n]/g, ' '),
        );
        const lines = text.split('\n');
        lines.forEach((line, index) => {
          if (COMMENT_LINE.test(line)) return;
          const code = line.replace(TRAILING_COMMENT, '').replace(COMPOSITE_SEPARATOR, '   ');
          const match = code.match(BANNED);
          if (match)
            violations.push(
              `${relative(ROOT, file)}:${index + 1} contains "${match[0]}": ${line.trim().slice(0, 80)}`,
            );
        });
      }
    }
    expect(violations).toEqual([]);
  });
});
