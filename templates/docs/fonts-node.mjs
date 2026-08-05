// Node-only font embedding for the bake path (split from shared.mjs so the
// browser preview can import shared.mjs/registry.mjs without node:fs).
// Base64 data: URIs keep the baked page self-contained for the file:// goto.
//   Fraunces-700 → titles/letterhead   Fraunces-400 → body   Caveat-400 → handwriting.
//   Mirrors desk_doc.tscn font roles in core-loop.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const FONTS_DIR = join(HERE, 'fonts');

let _fontFaceCss = null;
function fontDataUri(file) {
  const bytes = readFileSync(join(FONTS_DIR, file));
  return `data:font/ttf;base64,${bytes.toString('base64')}`;
}

export function fontFaceCss() {
  if (_fontFaceCss != null) return _fontFaceCss;
  _fontFaceCss = `
@font-face {
  font-family: 'Fraunces';
  font-weight: 400;
  font-style: normal;
  src: url('${fontDataUri('Fraunces-400.ttf')}') format('truetype');
}
@font-face {
  font-family: 'Fraunces';
  font-weight: 700;
  font-style: normal;
  src: url('${fontDataUri('Fraunces-700.ttf')}') format('truetype');
}
@font-face {
  font-family: 'Caveat';
  font-weight: 400;
  font-style: normal;
  src: url('${fontDataUri('Caveat-400.ttf')}') format('truetype');
}
@font-face {
  font-family: 'Special Elite';
  font-weight: 400;
  font-style: normal;
  src: url('${fontDataUri('SpecialElite-400.ttf')}') format('truetype');
}
@font-face {
  font-family: 'Architects Daughter';
  font-weight: 400;
  font-style: normal;
  src: url('${fontDataUri('ArchitectsDaughter-400.ttf')}') format('truetype');
}
@font-face {
  font-family: 'Kalam';
  font-weight: 400;
  font-style: normal;
  src: url('${fontDataUri('Kalam-400.ttf')}') format('truetype');
}`;
  return _fontFaceCss;
}
