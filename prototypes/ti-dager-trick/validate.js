// Content validator for case.json (SDD-012). Pure. Returns a list of problems.
import { anchorsIn, evalCond } from './engine.js';

const COND_KEYS = ['when', 'avail', 'advance', 'setback'];

export function validateCase(CASE) {
  const problems = [];
  const err = (msg) => problems.push(msg);

  const docs = CASE.documents || {};
  const facts = CASE.facts || {};
  const visits = CASE.visits || {};
  const calls = CASE.calls || {};

  const needDoc = (id, where) => {
    if (!docs[id]) err(`${where}: document '${id}' does not exist`);
  };
  const needFact = (id, where) => {
    if (!facts[id]) err(`${where}: fact '${id}' does not exist`);
  };
  const needVisit = (id, where) => {
    if (!visits[id]) err(`${where}: visit '${id}' does not exist`);
  };
  const needCall = (id, where) => {
    if (!calls[id]) err(`${where}: call '${id}' does not exist`);
  };

  // Conditions parse against a dummy state.
  const dummy = {
    facts: {},
    fired: {},
    visits: [],
    calls: [],
    door: 0,
    day: 1,
    witnessed: false,
  };
  const checkCond = (cond, where) => {
    if (cond == null) return;
    try {
      evalCond(cond, dummy);
    } catch (e) {
      err(`${where}: bad condition '${cond}': ${e.message}`);
    }
  };
  const checkCondKeys = (obj, where) => {
    for (const k of COND_KEYS) if (obj && obj[k] != null) checkCond(obj[k], `${where}.${k}`);
  };

  // Opening
  for (const id of CASE.case?.opening?.documents || []) needDoc(id, 'case.opening');

  // Documents: anchors name facts.
  for (const [id, d] of Object.entries(docs)) {
    for (const f of anchorsIn(d.text)) needFact(f, `documents.${id}`);
    if (!d.text) err(`documents.${id}: empty text`);
  }

  // Facts: Frank unlocks name real things.
  for (const [id, f] of Object.entries(facts)) {
    const u = f.frank?.unlocks || {};
    if (u.brief) needVisit(u.brief, `facts.${id}.frank.unlocks`);
    if (u.call) needCall(u.call, `facts.${id}.frank.unlocks`);
    if (!f.label) err(`facts.${id}: no label`);
  }

  // Calls
  for (const [id, c] of Object.entries(calls)) {
    checkCondKeys(c, `calls.${id}`);
    if (c.ladder) {
      for (const step of ['0', '1', '2', '3', '4'])
        if (!c.ladder[step] && !c.ladder.default)
          err(`calls.${id}.ladder: no line for step ${step}`);
      continue;
    }
    if (c.claims) {
      for (const cl of c.claims) {
        checkCondKeys(cl, `calls.${id}.${cl.id}`);
        if (!cl.suit || !cl.lead) err(`calls.${id}.${cl.id}: claim needs suit and lead`);
        for (const oc of ['win', 'follow', 'off', 'pass']) {
          const list = asList(cl.outcomes?.[oc]);
          if (!list.length) err(`calls.${id}.${cl.id}: no '${oc}' outcome`);
          if (!list.some((o) => !o.when))
            err(`calls.${id}.${cl.id}.${oc}: no unconditional variant`);
          for (const o of list) {
            checkCondKeys(o, `calls.${id}.${cl.id}.${oc}`);
            for (const g of o.gain || []) needFact(g, `calls.${id}.${cl.id}.${oc}.gain`);
            if (o.unlocks?.brief) needVisit(o.unlocks.brief, `calls.${id}.${cl.id}.${oc}`);
            if (o.unlocks?.call) needCall(o.unlocks.call, `calls.${id}.${cl.id}.${oc}`);
          }
        }
      }
      continue;
    }
    if (!c.nodes || !c.nodes[c.start]) err(`calls.${id}: start node '${c.start}' missing`);
    for (const [nid, n] of Object.entries(c.nodes || {})) {
      for (const l of n.lines || []) {
        checkCondKeys(l, `calls.${id}.${nid}.line`);
        for (const f of anchorsIn(l.text)) needFact(f, `calls.${id}.${nid}`);
      }
      for (const r of n.replies || []) {
        checkCondKeys(r, `calls.${id}.${nid}.reply`);
        if (!c.nodes[r.next]) err(`calls.${id}.${nid}: reply points to missing node '${r.next}'`);
      }
    }
  }

  // Visits
  for (const [id, v] of Object.entries(visits)) {
    checkCondKeys(v, `visits.${id}`);
    if (!v.brief) err(`visits.${id}: no brief`);
    for (const b of v.beats || []) {
      checkCondKeys(b, `visits.${id}.beat`);
      for (const f of anchorsIn(b.text)) needFact(f, `visits.${id}.beat`);
    }
    for (const n of asList(v.notat)) {
      checkCondKeys(n, `visits.${id}.notat`);
      needDoc(n.doc, `visits.${id}.notat`);
    }
    for (const d of v.delivers || []) needDoc(d.doc, `visits.${id}.delivers`);
    if (v.scene !== false && !(v.beats || []).length) err(`visits.${id}: scene with no beats`);
    // A scene visit that branches on the door must have a beat for every step it can be played at.
    if (v.scene !== false && v.repeat) {
      for (let step = 0; step <= 4; step++) {
        const st = { ...dummy, door: step, fired: { innleggelse: 1, dodsfall: 1 } };
        const beats = (v.beats || []).filter((b) => evalCond(b.when || '', st));
        if (!beats.length) err(`visits.${id}: no beats at door step ${step}`);
        const notat = asList(v.notat).find((n) => evalCond(n.when || '', st));
        if (v.notat && !notat) err(`visits.${id}: no notat at door step ${step}`);
      }
    }
  }

  // Triggers
  const seen = new Set();
  for (const t of CASE.triggers || []) {
    if (seen.has(t.id)) err(`triggers: duplicate id '${t.id}'`);
    seen.add(t.id);
    checkCondKeys(t, `triggers.${t.id}`);
    const e = t.effect || {};
    if (e.doc) needDoc(e.doc, `triggers.${t.id}.effect`);
    if (e.brief) needVisit(e.brief, `triggers.${t.id}.effect`);
    if (e.call) needCall(e.call, `triggers.${t.id}.effect`);
    if (t.ceil && t.floor && t.ceil < t.floor) err(`triggers.${t.id}: ceil before floor`);
  }

  // Verdicts
  for (const v of CASE.case?.verdicts || []) {
    for (const p of asList(v.pages)) checkCondKeys(p, `verdicts.${v.id}.page`);
    const fallback = asList(v.pages).some((p) => !p.when);
    if (!fallback) err(`verdicts.${v.id}: no unconditional page`);
  }

  // Reachability: every fact is liftable from somewhere.
  const liftable = new Set();
  for (const d of Object.values(docs)) for (const f of anchorsIn(d.text)) liftable.add(f);
  for (const c of Object.values(calls))
    for (const n of Object.values(c.nodes || {}))
      for (const l of n.lines || []) for (const f of anchorsIn(l.text)) liftable.add(f);
  for (const v of Object.values(visits))
    for (const b of v.beats || []) for (const f of anchorsIn(b.text)) liftable.add(f);
  for (const c of Object.values(calls))
    for (const cl of c.claims || [])
      for (const list of Object.values(cl.outcomes || {}))
        for (const o of asList(list)) for (const g of o.gain || []) liftable.add(g);
  for (const id of Object.keys(facts)) if (!liftable.has(id)) err(`facts.${id}: never liftable`);
  // Every fact carries a suit and rank so it can be played into a trick.
  for (const [id, f] of Object.entries(facts))
    if (!f.suit || !f.rank) err(`facts.${id}: needs suit and rank`);

  // Every document is deliverable from somewhere.
  const deliverable = new Set(CASE.case?.opening?.documents || []);
  for (const t of CASE.triggers || []) if (t.effect?.doc) deliverable.add(t.effect.doc);
  for (const v of Object.values(visits)) {
    for (const n of asList(v.notat)) deliverable.add(n.doc);
    for (const d of v.delivers || []) deliverable.add(d.doc);
  }
  for (const id of Object.keys(docs))
    if (!deliverable.has(id)) err(`documents.${id}: never delivered`);

  // Typography: content convention bans em dash, guillemets, middle dot, curly quotes.
  const banned = /[—–«»·‘’“”]/;
  const walk = (o, path) => {
    if (typeof o === 'string') {
      if (banned.test(o)) err(`${path}: banned typography`);
    } else if (Array.isArray(o)) o.forEach((x, i) => walk(x, `${path}[${i}]`));
    else if (o && typeof o === 'object')
      for (const [k, v] of Object.entries(o)) walk(v, path ? `${path}.${k}` : k);
  };
  walk(CASE, '');

  return problems;
}

function asList(x) {
  if (!x) return [];
  return Array.isArray(x) ? x : [x];
}
