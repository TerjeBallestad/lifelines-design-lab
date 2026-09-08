// Ti dager engine (SDD-012). Pure functions over one state object. No DOM.
// Content shapes are documented in case.json and checked by validate.js.

/* ------------------------------------------------------------------ */
/* Condition grammar                                                   */
/* ------------------------------------------------------------------ */
// Atoms: `has f_x`, `fired t_x`, `visited v_x`, `called c_x`,
//        `door >= n` (any of < <= == >= >), `day >= n`, `witnessed`, `any_visit`.
// Prefix an atom with `not`. Join atoms with `and`. Empty string is true.

const OPS = {
  '<': (a, b) => a < b,
  '<=': (a, b) => a <= b,
  '==': (a, b) => a === b,
  '>=': (a, b) => a >= b,
  '>': (a, b) => a > b,
};

export function evalAtom(atom, s) {
  const parts = atom.trim().split(/\s+/);
  let neg = false;
  if (parts[0] === 'not') {
    neg = true;
    parts.shift();
  }
  const [head, a, b] = parts;
  let v;
  switch (head) {
    case 'has':
      v = !!s.facts[a];
      break;
    case 'fired':
      v = !!s.fired[a];
      break;
    case 'visited':
      v = s.visits.includes(a);
      break;
    case 'called':
      v = s.calls.includes(a);
      break;
    case 'door':
      v = OPS[a](s.door, Number(b));
      break;
    case 'day':
      v = OPS[a](s.day, Number(b));
      break;
    case 'witnessed':
      v = s.witnessed;
      break;
    case 'any_visit':
      v = s.visits.length > 0;
      break;
    case '':
    case undefined:
      v = true;
      break;
    default:
      throw new Error(`unknown condition atom: ${atom}`);
  }
  return neg ? !v : v;
}

export function evalCond(cond, s) {
  if (!cond || !cond.trim()) return true;
  return cond.split(/\s+and\s+/).every((atom) => evalAtom(atom, s));
}

/* ------------------------------------------------------------------ */
/* Anchors in prose: [text](f_id)                                       */
/* ------------------------------------------------------------------ */

export const ANCHOR_RE = /\[([^\]]+)\]\(([a-z0-9_]+)\)/g;

export function anchorsIn(text) {
  const out = [];
  for (const m of (text || '').matchAll(ANCHOR_RE)) out.push(m[2]);
  return out;
}

/* ------------------------------------------------------------------ */
/* State                                                                */
/* ------------------------------------------------------------------ */

export function createState(CASE) {
  const s = {
    day: 1,
    fieldUsed: false,
    door: CASE.case.opening.door ?? 0,
    docs: {}, // docId -> { day, read }
    docOrder: [], // arrival order, newest first
    facts: {}, // factId -> { day, source }
    fired: {}, // triggerId -> day
    visits: [], // visitIds, in order (repeats allowed)
    calls: [], // callIds started
    briefs: [], // visitIds unlocked for Frank
    unlockedCalls: [], // callIds unlocked by Frank
    frank: [], // { day, who, text, fact? }
    report: [], // Dagsrapport lines queued for tomorrow
    queue: [], // docIds landing tomorrow
    pending: [], // { day, doc }
    witnessed: false,
    verdict: null,
    ended: false,
    log: [], // { day, text }
  };
  for (const id of CASE.case.opening.documents || []) receiveDoc(s, id);
  for (const line of CASE.frank?.opening || []) s.frank.push({ day: 1, who: 'Frank', text: line });
  return s;
}

function logLine(s, text) {
  s.log.push({ day: s.day, text });
}

/* ------------------------------------------------------------------ */
/* Documents and facts                                                  */
/* ------------------------------------------------------------------ */

export function receiveDoc(s, docId) {
  if (s.docs[docId]) return false;
  s.docs[docId] = { day: s.day, read: false };
  s.docOrder.unshift(docId);
  return true;
}

export function openDoc(s, docId) {
  if (!s.docs[docId]) return false;
  s.docs[docId].read = true;
  return true;
}

export function liftFact(s, factId, source) {
  if (s.facts[factId]) return false;
  s.facts[factId] = { day: s.day, source: source || null };
  logLine(s, `Fakta loftet: ${factId}`);
  return true;
}

/* ------------------------------------------------------------------ */
/* Frank                                                                */
/* ------------------------------------------------------------------ */

export function handToFrank(CASE, s, factId) {
  if (!s.facts[factId]) return null;
  if (s.facts[factId].handed) return null;
  s.facts[factId].handed = true;
  const fact = CASE.facts[factId];
  const line = fact.frank?.line || CASE.frank?.shrug || 'Frank nikker.';
  s.frank.push({ day: s.day, who: 'Du', text: fact.label, fact: factId });
  s.frank.push({ day: s.day, who: 'Frank', text: line });
  const unlocks = fact.frank?.unlocks || {};
  if (unlocks.brief && !s.briefs.includes(unlocks.brief)) s.briefs.push(unlocks.brief);
  if (unlocks.call && !s.unlockedCalls.includes(unlocks.call)) s.unlockedCalls.push(unlocks.call);
  return { line, unlocks };
}

export function availableBriefs(CASE, s) {
  return s.briefs.filter((vid) => {
    const v = CASE.visits[vid];
    if (!v) return false;
    if (!v.repeat && s.visits.includes(vid)) return false;
    return evalCond(v.avail || '', s);
  });
}

/* ------------------------------------------------------------------ */
/* Calls                                                                */
/* ------------------------------------------------------------------ */

export function availableCalls(CASE, s) {
  return Object.keys(CASE.calls).filter((cid) => {
    const c = CASE.calls[cid];
    if (c.unlock === 'frank' && !s.unlockedCalls.includes(cid)) return false;
    if (c.once && s.calls.includes(cid)) return false;
    return evalCond(c.avail || '', s);
  });
}

// Starts a call. Returns the first node, or for a ladder call the single line.
export function ringCall(CASE, s, callId) {
  const c = CASE.calls[callId];
  if (!c) return null;
  if (!availableCalls(CASE, s).includes(callId)) return null;
  s.calls.push(callId);
  logLine(s, `Ringte: ${callId}`);
  if (c.ladder) {
    const text = c.ladder[String(s.door)] ?? c.ladder.default;
    return { kind: 'ladder', lines: [{ who: c.to, text }], replies: [] };
  }
  return callNode(CASE, s, callId, c.start);
}

export function callNode(CASE, s, callId, nodeId) {
  const c = CASE.calls[callId];
  const n = c.nodes[nodeId];
  if (!n) return null;
  const lines = (n.lines || []).filter((l) => evalCond(l.when || '', s));
  const replies = (n.replies || []).filter((r) => evalCond(r.when || '', s));
  return { kind: 'node', id: nodeId, lines, replies };
}

/* ------------------------------------------------------------------ */
/* Visits (the one field action)                                        */
/* ------------------------------------------------------------------ */

// Resolves the visit: picks beats for the current door step, moves the
// ladder, delivers paper, spends the day. `skipped` marks that the player
// did not watch the scene, which decides `witnessed`.
export function sendFrank(CASE, s, visitId, opts = {}) {
  if (s.fieldUsed || s.ended) return null;
  if (!availableBriefs(CASE, s).includes(visitId)) return null;
  const v = CASE.visits[visitId];
  const doorBefore = s.door;

  const beats = (v.beats || []).filter((b) => evalCond(b.when || '', s));

  let moved = 0;
  if (v.advance && evalCond(v.advance, s) && s.door < 4) {
    s.door += 1;
    moved = 1;
  } else if (v.setback && evalCond(v.setback, s) && s.door > 0) {
    s.door -= 1;
    moved = -1;
  }
  if (moved > 0 && v.scene !== false && !opts.skipped) s.witnessed = true;

  s.visits.push(visitId);
  s.fieldUsed = true;
  logLine(s, `Frank sendt: ${visitId} (dor ${doorBefore} -> ${s.door})`);

  const delivered = [];
  if (v.notat) {
    const variant = pickVariant(v.notat, s);
    if (variant) {
      const docId = variant.doc;
      if (receiveDoc(s, docId)) delivered.push(docId);
    }
  }
  if (v.delivers) {
    for (const d of v.delivers) {
      if (d.delay && d.delay > 0) s.pending.push({ day: s.day + d.delay, doc: d.doc });
      else if (receiveDoc(s, d.doc)) delivered.push(d.doc);
    }
  }
  for (const line of v.report || []) if (evalCond(line.when || '', s)) s.report.push(line.text);

  return { beats, doorBefore, doorAfter: s.door, moved, delivered, scene: v.scene !== false };
}

export function pickVariant(list, s) {
  const arr = Array.isArray(list) ? list : [list];
  return arr.find((x) => evalCond(x.when || '', s)) || null;
}

/* ------------------------------------------------------------------ */
/* Day boundary                                                         */
/* ------------------------------------------------------------------ */

export function endDay(CASE, s) {
  if (s.ended) return null;
  const firedNow = [];

  // 1) Triggers, evaluated against the day that is ending.
  for (const tr of CASE.triggers) {
    if (s.fired[tr.id]) continue;
    const met = evalCond(tr.when || '', s) && s.day >= (tr.floor ?? 1);
    const forced = tr.ceil ? s.day >= tr.ceil : false;
    if (met || forced) {
      s.fired[tr.id] = s.day;
      firedNow.push(tr.id);
      applyEffect(CASE, s, tr.effect || {});
    }
  }

  // 2) Next day.
  s.day += 1;
  s.fieldUsed = false;

  // 3) Morning.
  const landed = [];
  for (const id of s.queue) if (receiveDoc(s, id)) landed.push(id);
  s.queue = [];
  s.pending = s.pending.filter((p) => {
    if (p.day <= s.day) {
      if (receiveDoc(s, p.doc)) landed.push(p.doc);
      return false;
    }
    return true;
  });
  let report = null;
  if (s.report.length) {
    report = s.report.slice();
    s.report = [];
  }

  const atVerdict = s.day >= CASE.case.days;
  if (atVerdict) s.ended = 'verdict';
  return { day: s.day, fired: firedNow, landed, report, atVerdict };
}

function applyEffect(CASE, s, e) {
  if (e.doc) s.queue.push(e.doc);
  if (e.report) s.report.push(e.report);
  if (e.brief && !s.briefs.includes(e.brief)) s.briefs.push(e.brief);
  if (e.call && !s.unlockedCalls.includes(e.call)) s.unlockedCalls.push(e.call);
  if (e.door) s.door = Math.max(0, Math.min(4, s.door + e.door));
  if (e.frank) s.frank.push({ day: s.day + 1, who: 'Frank', text: e.frank });
}

/* ------------------------------------------------------------------ */
/* Verdict                                                              */
/* ------------------------------------------------------------------ */

export function signVerdict(CASE, s, verdictId) {
  const v = CASE.case.verdicts.find((x) => x.id === verdictId);
  if (!v) return null;
  const page = pickVariant(v.pages, s);
  s.verdict = verdictId;
  s.ended = 'signed';
  return { label: v.label, text: page ? page.text : '' };
}

/* ------------------------------------------------------------------ */
/* Convenience for tests and the UI                                     */
/* ------------------------------------------------------------------ */

export function docsWithFacts(CASE, s, docId) {
  return anchorsIn(CASE.documents[docId]?.text || '');
}

export function unreadCount(s) {
  return Object.values(s.docs).filter((d) => !d.read).length;
}
