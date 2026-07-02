// Dev-server API for the case-authoring editor (SDD-100 pipeline, night build).
// Mounted by vite.config.ts; dev-only (never part of the built bundle).
//
//   GET  /api/cases                 -> { cases: [relative .case.md paths] }
//   GET  /api/case?path=<rel>       -> { path, markdown }
//   POST /api/case/preview          -> { warnings, summary } | { error }
//        body: { markdown }            (parse+build only — live validation)
//   POST /api/case                  -> { ok, warnings, regenerated } | { error }
//        body: { path, markdown, regenerate }
//
// Safety rules:
// - paths must resolve inside content/cases/ and end with .case.md
// - artifact regeneration (react TS + GODOT JSON) runs ONLY for the canonical
//   case file AND only when regenerate=true — draft files never touch Godot.

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import {
  parseCaseMarkdown,
  buildArtifacts,
  serializeSource,
} from '../../scripts/blueprint/case-format.mjs';
import {
  defaultPaths,
  writeTinyOlsenArtifacts,
} from '../../scripts/blueprint/generate-tiny-olsen-case.mjs';

const CANONICAL_RELATIVE = join('olsen', 'tiny-olsen.case.md');

export function caseAuthoringApi() {
  return {
    name: 'case-authoring-api',
    configureServer(server) {
      const root = server.config.root;
      const casesRoot = resolve(root, 'content/cases');

      const resolveCasePath = (rel) => {
        if (!rel || !rel.endsWith('.case.md')) return null;
        const abs = resolve(casesRoot, rel);
        if (!abs.startsWith(casesRoot + sep)) return null;
        return abs;
      };

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost');
        try {
          if (req.method === 'GET' && url.pathname === '/api/cases') {
            const cases = await listCaseFiles(casesRoot);
            return sendJson(res, 200, { cases, canonical: CANONICAL_RELATIVE });
          }
          if (req.method === 'GET' && url.pathname === '/api/case') {
            const abs = resolveCasePath(url.searchParams.get('path'));
            if (!abs) return sendJson(res, 400, { error: 'invalid case path' });
            const markdown = await readFile(abs, 'utf8');
            return sendJson(res, 200, { path: url.searchParams.get('path'), markdown });
          }
          if (req.method === 'POST' && url.pathname === '/api/case/preview') {
            const body = await readJsonBody(req);
            try {
              const source = body.source ?? parseCaseMarkdown(body.markdown ?? '');
              const { godotSource, warnings } = buildArtifacts(source);
              return sendJson(res, 200, {
                warnings,
                source,
                summary: {
                  documents: godotSource.documents.length,
                  facts: godotSource.facts.length,
                  questions: godotSource.questions.length,
                  hypotheses: godotSource.hypotheses.length,
                  tiltak: godotSource.tiltak.length,
                  dispatches: godotSource.dispatches.length,
                  clocks: godotSource.clocks.length,
                },
                godotSource,
              });
            } catch (error) {
              return sendJson(res, 200, { error: String(error.message ?? error) });
            }
          }
          if (req.method === 'POST' && url.pathname === '/api/case') {
            const body = await readJsonBody(req);
            const abs = resolveCasePath(body.path);
            if (!abs) return sendJson(res, 400, { error: 'invalid case path' });
            // Editor sends either raw markdown OR the edited structured source
            // (which we serialize back to the humane markdown ourselves).
            let markdown = body.markdown;
            let warnings = [];
            try {
              if (body.source) markdown = serializeSource(body.source);
              const source = parseCaseMarkdown(markdown ?? '');
              warnings = buildArtifacts(source).warnings;
            } catch (error) {
              return sendJson(res, 400, { error: String(error.message ?? error) });
            }
            await writeFile(abs, markdown, 'utf8');
            let regenerated = false;
            const isCanonical = relative(casesRoot, abs) === CANONICAL_RELATIVE;
            if (body.regenerate && isCanonical) {
              if (warnings.length) {
                return sendJson(res, 200, {
                  ok: true,
                  warnings,
                  regenerated: false,
                  note: 'saved, but artifacts NOT regenerated while warnings exist',
                });
              }
              await writeTinyOlsenArtifacts(defaultPaths(root));
              regenerated = true;
            }
            return sendJson(res, 200, { ok: true, warnings, regenerated, isCanonical });
          }
        } catch (error) {
          return sendJson(res, 500, { error: String(error?.message ?? error) });
        }
        return next();
      });
    },
  };
}

async function listCaseFiles(casesRoot) {
  const out = [];
  const walk = async (dir) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const abs = join(dir, entry.name);
      if (entry.isDirectory()) await walk(abs);
      else if (entry.name.endsWith('.case.md')) out.push(relative(casesRoot, abs));
    }
  };
  await walk(casesRoot);
  return out.sort();
}

function readJsonBody(req) {
  return new Promise((resolvePromise, rejectPromise) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolvePromise(JSON.parse(data || '{}'));
      } catch (error) {
        rejectPromise(error);
      }
    });
    req.on('error', rejectPromise);
  });
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}
