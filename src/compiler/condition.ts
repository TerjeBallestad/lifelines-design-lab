// §6 condition grammar — one parser everywhere a gate appears:
// when:, needs:, gate:, visible when: (and {…} in weave, Task 2).
// Terms the runtime has an op for emit PredicateSpec; terms it lacks warn
// (SB-020 capability table) and are dropped from the emitted predicate.

import type { DiagnosticBag, Span } from './diagnostics.ts';
import { codes } from './diagnostics.ts';

export interface PredicateSpec {
  op: string;
  args?: Record<string, unknown>;
  children?: PredicateSpec[];
}

type TermKind =
  | 'fact'
  | 'hypothesis'
  | 'tiltak'
  | 'question'
  | 'dispatch'
  | 'clock-compare'
  | 'day-compare'
  | 'stage'
  | 'asked';

export type CondNode =
  | { kind: 'and' | 'or'; children: CondNode[] }
  | { kind: 'not'; child: CondNode }
  | { kind: 'n-of'; count: number; children: CondNode[] }
  | { kind: 'term'; term: TermKind; id: string; value?: number };

interface Token {
  type: 'id' | 'number' | 'op';
  text: string;
}

function tokenize(src: string): Token[] | null {
  const tokens: Token[] = [];
  let rest = src;
  while (rest.length > 0) {
    const ws = rest.match(/^\s+/);
    if (ws) {
      rest = rest.slice(ws[0].length);
      continue;
    }
    const op = rest.match(/^(>=|[(),+])/);
    if (op) {
      tokens.push({ type: 'op', text: op[0] });
      rest = rest.slice(op[0].length);
      continue;
    }
    const num = rest.match(/^\d+/);
    if (num) {
      tokens.push({ type: 'number', text: num[0] });
      rest = rest.slice(num[0].length);
      continue;
    }
    const id = rest.match(/^[A-Za-zÀ-ÿæøåÆØÅ_][\w.À-ÿæøåÆØÅ-]*/);
    if (id) {
      tokens.push({ type: 'id', text: id[0] });
      rest = rest.slice(id[0].length);
      continue;
    }
    return null; // unknown character
  }
  return tokens;
}

class Parser {
  private pos = 0;
  private readonly tokens: Token[];
  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  peek(offset = 0): Token | undefined {
    return this.tokens[this.pos + offset];
  }

  next(): Token | undefined {
    return this.tokens[this.pos++];
  }

  atKeyword(word: string): boolean {
    const token = this.peek();
    return token?.type === 'id' && token.text === word;
  }

  atOp(text: string): boolean {
    const token = this.peek();
    return token?.type === 'op' && token.text === text;
  }

  expectOp(text: string): void {
    if (!this.atOp(text)) throw new CondError(`expected "${text}"`);
    this.next();
  }

  done(): boolean {
    return this.pos >= this.tokens.length;
  }
}

class CondError extends Error {}

function classifyTerm(id: string): TermKind {
  if (id.startsWith('asked.')) return 'asked';
  if (id.startsWith('h_')) return 'hypothesis';
  if (id.startsWith('t_')) return 'tiltak';
  if (id.startsWith('q_')) return 'question';
  if (id.startsWith('d_')) return 'dispatch';
  if (id.startsWith('ck_')) return 'clock-compare';
  return 'fact';
}

function parseExpr(p: Parser): CondNode {
  return parseOr(p);
}

function parseOr(p: Parser): CondNode {
  const children = [parseAnd(p)];
  while (p.atKeyword('or')) {
    p.next();
    children.push(parseAnd(p));
  }
  return children.length === 1 ? children[0] : { kind: 'or', children };
}

function parseAnd(p: Parser): CondNode {
  const children = [parseUnary(p)];
  for (;;) {
    if (p.atKeyword('and') || p.atOp(',') || p.atOp('+')) {
      p.next();
      children.push(parseUnary(p));
      continue;
    }
    break;
  }
  return children.length === 1 ? children[0] : { kind: 'and', children };
}

function parseUnary(p: Parser): CondNode {
  if (p.atKeyword('not')) {
    p.next();
    return { kind: 'not', child: parseUnary(p) };
  }
  return parsePrimary(p);
}

function parsePrimary(p: Parser): CondNode {
  const token = p.peek();
  if (!token) throw new CondError('unexpected end of condition');

  // n of (a, b, c)
  if (token.type === 'number' && p.peek(1)?.text === 'of') {
    p.next();
    p.next();
    p.expectOp('(');
    const children = [parseExpr(p)];
    while (p.atOp(',')) {
      p.next();
      children.push(parseExpr(p));
    }
    p.expectOp(')');
    return { kind: 'n-of', count: Number(token.text), children };
  }

  if (p.atOp('(')) {
    p.next();
    const inner = parseExpr(p);
    p.expectOp(')');
    return inner;
  }

  if (token.type !== 'id') throw new CondError(`unexpected token "${token.text}"`);

  // stage N
  if (token.text === 'stage') {
    p.next();
    const num = p.next();
    if (num?.type !== 'number') throw new CondError('stage requires a number');
    return { kind: 'term', term: 'stage', id: 'stage', value: Number(num.text) };
  }

  // day >= N
  if (token.text === 'day') {
    p.next();
    p.expectOp('>=');
    const num = p.next();
    if (num?.type !== 'number') throw new CondError('day >= requires a number');
    return { kind: 'term', term: 'day-compare', id: 'day', value: Number(num.text) };
  }

  // legacy Gate tokens: `fact f_x`, `hypothesis h_x`
  if ((token.text === 'fact' || token.text === 'hypothesis') && p.peek(1)?.type === 'id') {
    p.next();
    const id = p.next();
    if (!id) throw new CondError('missing id');
    return {
      kind: 'term',
      term: token.text === 'fact' ? 'fact' : 'hypothesis',
      id: id.text,
    };
  }

  // plain term, optional (taken)/(open)/(done) marker, optional >= N
  if (token.text === 'and' || token.text === 'or' || token.text === 'not' || token.text === 'of') {
    throw new CondError(`unexpected keyword "${token.text}"`);
  }
  p.next();
  const id = token.text;
  let term = classifyTerm(id);
  if (p.atOp('(')) {
    const marker = p.peek(1);
    if (
      marker?.type === 'id' &&
      (marker.text === 'taken' || marker.text === 'open' || marker.text === 'done') &&
      p.peek(2)?.text === ')'
    ) {
      p.next();
      p.next();
      p.next();
      term = marker.text === 'taken' ? 'tiltak' : marker.text === 'open' ? 'question' : 'dispatch';
    }
  }
  if (p.atOp('>=')) {
    p.next();
    const num = p.next();
    if (num?.type !== 'number') throw new CondError('>= requires a number');
    return { kind: 'term', term: 'clock-compare', id, value: Number(num.text) };
  }
  return { kind: 'term', term, id };
}

export function parseCondition(src: string): { ast: CondNode | null; error: string | null } {
  const trimmed = src.trim();
  if (!trimmed) return { ast: null, error: null };
  const tokens = tokenize(trimmed);
  if (!tokens) return { ast: null, error: 'unrecognized character in condition' };
  const parser = new Parser(tokens);
  try {
    const ast = parseExpr(parser);
    if (!parser.done()) throw new CondError('trailing tokens in condition');
    return { ast, error: null };
  } catch (err) {
    return { ast: null, error: err instanceof Error ? err.message : String(err) };
  }
}

const UNSUPPORTED_TERM: Partial<Record<TermKind, { code: string; label: string }>> = {
  tiltak: { code: codes.COND_UNSUPPORTED_TILTAK_TAKEN, label: 'tiltak-taken' },
  question: { code: codes.COND_UNSUPPORTED_QUESTION_OPEN, label: 'question-open' },
  dispatch: { code: codes.COND_UNSUPPORTED_DISPATCH_DONE, label: 'dispatch-done' },
  'clock-compare': { code: codes.COND_UNSUPPORTED_CLOCK_COMPARE, label: 'clock >= N' },
  'day-compare': { code: codes.COND_UNSUPPORTED_DAY_COMPARE, label: 'day >= N' },
  asked: { code: codes.COND_UNSUPPORTED_ASKED_COUNT, label: 'asked.* read count' },
};

/**
 * Emit a runtime PredicateSpec from a condition AST. Terms without a runtime
 * op (SB-020 capability table) produce a structured warning and are dropped
 * from the emit — the warning list is the engine backlog (DD-002).
 */
export function emitPredicate(
  ast: CondNode,
  diag: DiagnosticBag,
  ownerId: string,
  where: Span,
): PredicateSpec | null {
  switch (ast.kind) {
    case 'and':
    case 'or': {
      const children = ast.children
        .map((child) => emitPredicate(child, diag, ownerId, where))
        .filter((child): child is PredicateSpec => child !== null);
      if (children.length === 0) return null;
      if (children.length === 1) return children[0];
      return { op: ast.kind === 'and' ? 'all' : 'any', children };
    }
    case 'not': {
      const child = emitPredicate(ast.child, diag, ownerId, where);
      if (child === null) return null;
      return { op: 'not', children: [child] };
    }
    case 'n-of':
      diag.add(
        codes.COND_UNSUPPORTED_N_OF,
        'warning',
        `"n of (…)" has no runtime predicate op; the term is dropped from the emitted gate (engine backlog).`,
        where,
        [ownerId],
      );
      return null;
    case 'term': {
      switch (ast.term) {
        case 'fact':
          return { op: 'fact_lifted', args: { fact_id: ast.id } };
        case 'hypothesis':
          return { op: 'hypothesis_chosen', args: { hypothesis_id: ast.id } };
        case 'stage':
          return { op: 'scenario_stage_at_least', args: { stage: ast.value ?? 0 } };
        default: {
          const info = UNSUPPORTED_TERM[ast.term];
          if (info) {
            diag.add(
              info.code,
              'warning',
              `"${ast.id}" (${info.label}) has no runtime predicate op; the term is dropped from the emitted gate (engine backlog).`,
              where,
              [ast.id, ownerId],
            );
          }
          return null;
        }
      }
    }
  }
}

/** All fact ids a condition AST references (for stub checks and labContent). */
export function factIdsInCondition(ast: CondNode | null): string[] {
  const out: string[] = [];
  const walk = (node: CondNode): void => {
    switch (node.kind) {
      case 'term':
        if (node.term === 'fact' && !out.includes(node.id)) out.push(node.id);
        break;
      case 'not':
        walk(node.child);
        break;
      default:
        for (const child of node.children) walk(child);
    }
  };
  if (ast) walk(ast);
  return out;
}

/** All hypothesis ids a condition AST references (for stub checks). */
export function hypothesisIdsInCondition(ast: CondNode | null): string[] {
  const out: string[] = [];
  const walk = (node: CondNode): void => {
    switch (node.kind) {
      case 'term':
        if (node.term === 'hypothesis' && !out.includes(node.id)) out.push(node.id);
        break;
      case 'not':
        walk(node.child);
        break;
      default:
        for (const child of node.children) walk(child);
    }
  };
  if (ast) walk(ast);
  return out;
}
