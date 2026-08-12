import { describe, expect, it } from 'vitest';
import { compileCase } from '../index';
import { codes } from '../diagnostics';
import fragments from './fixtures/shipped-fragments.json';

// Every expected fragment comes from shipped-fragments.json, copied verbatim
// (programmatically) from
// ../lifelines-core-loop/resources/cases/olsen/source/tiny_olsen_slice.json.
// scripts/compiler/provenance.test.mjs re-asserts the copy against the live
// shipped file whenever the core-loop checkout is present.

const HEADER = '# Case: c_x\nTitle: X\nStage: 0\n';

function diagCodes(out: ReturnType<typeof compileCase>): string[] {
  return out.diagnostics.map((d) => d.code);
}

// Weave fixtures live in template literals (not .case.md files) because the
// indentation is semantic and prettier reformats markdown list indentation.

const GRETE_CALL = `${HEADER}
# Conversation: call:grete
gate: f_grete_baerer
Soft reject: «… Jeg vet ikke hva du mener med det.»

Ja, hallo?
du: Det gjelder Elling. Dr. Haug har meldt bekymring.
[Han klarer seg. Han har alltid klart seg.](fact:f_klarer_seg)

* f_grete_baerer: Hvem overtar hvis du skulle bli innlagt?
    [… (det blir stille i den andre enden)](fact:f_ingen_plan)
* f_klarer_seg: Kan jeg få hilse på Elling?
    [Han tar ikke telefonen. Det er ikke noe galt med ham. Han liker bare ikke apparatet.](fact:f_elling_tlf)
* f_saarbar: Vi vil gjerne komme på hjemmebesøk.
    [Betyr dette at noen kommer til å ta ham fra leiligheten?](fact:f_grete_redd)
    … Hvis det må til.
`;

const FRANK_CHAT = `${HEADER}
# Conversation: chat:frank

* f_post: Posten i gangen - likegyldighet?
    Nei. Han vet nøyaktig hva som ligger der. Han la merke til at jeg så på bunken, og han ble urolig av det.
    Det er ikke likegyldighet. Det er noe som ligner mer på frykt for hva papiret krever av svar.
    * * Frykt for hva, helt konkret?
        For hva svaret koster. Hvert brev er en beskjed om at noen venter på noe han ikke får til.
        Jeg tror han sluttet å åpne den dagen han sluttet å kunne svare. De to tingene henger sammen.
    * * Hva gjør vi med bunken?
        Ikke ta den fra ham. Da tar du det siste han har kontroll på.
        Åpne ett brev. Sammen. Det ufarligste først - strømregningen, ikke sosialkontoret. La ham se at et åpnet brev ikke eksploderer.

* f_avstand: Møbelet mellom dere - hvor lang vei er det inn?
    Lang. Men han kastet meg ikke ut, og han svarte da jeg spurte om noe han kunne.
    Det er en dør på gløtt. Den lukkes hvis vi river i den.
    ~ pay f_dor_glott
    * * Hva var det som åpnet den?
        At jeg spurte om noe han kunne svare på. Ikke omsorg. Kunnskap.
        Det er kanalen inn: la ham være den som vet. Alle andre i livet hans har vært den som ordner.
    * * Og hvis vi river i den?
        Da lukkes den. Og jeg tror ikke den åpner for den neste som ringer på.
        Vi har én sjanse til å være de som ikke rev.

* f_dor_glott: Døren på gløtt - hva holder den åpen? [answer=none]
    At noen spør ham om noe han kan svare på. Det er hele mekanikken.
    Den tåler ikke omsorg ennå. Den tåler spørsmål.
`;

describe('§8 weave → calls (golden: shipped Grete call)', () => {
  const out = compileCase(GRETE_CALL);

  it('emits calls[0] deep-equal to the shipped call - gate, opening with speaker tag and fact lift, three exchanges, soft reject', () => {
    expect(out.slice.calls).toHaveLength(1);
    expect(out.slice.calls?.[0]).toEqual(fragments.calls.grete);
  });

  it('produces no diagnostics beyond unresolved-fact stubs and §9 advisory lints (the fixture declares no facts)', () => {
    const other = out.diagnostics.filter(
      (d) => d.code !== codes.STUB_UNRESOLVED_ID && !d.code.startsWith('lint-'),
    );
    expect(other).toEqual([]);
  });
});

describe('§8 weave → frank_chat (goldens: c_post, c_avstand, c_dor_glott)', () => {
  const out = compileCase(FRANK_CHAT);
  const entries = out.slice.frank_chat ?? [];
  const byId = (id: string) => {
    const found = entries.find((entry) => entry.id === id);
    if (!found) throw new Error(`missing ${id} in ${entries.map((e) => e.id).join(', ')}`);
    return found;
  };

  it('c_post: card-keyed branch with two one-deep follow-ups; answer derives from answer_lines', () => {
    expect(byId('c_post')).toEqual(fragments.frank_chat.c_post);
  });

  it('c_avstand: ~ pay in the branch mints pays_fact', () => {
    expect(byId('c_avstand')).toEqual(fragments.frank_chat.c_avstand);
  });

  it('c_dor_glott: [answer=none] keeps the legacy answer empty, answer_lines primary, followups []', () => {
    expect(byId('c_dor_glott')).toEqual(fragments.frank_chat.c_dor_glott);
  });

  it('entry ids derive from the key card (f_post → c_post) - no diagnostics beyond stubs and advisory lints', () => {
    expect(entries.map((entry) => entry.id)).toEqual(['c_post', 'c_avstand', 'c_dor_glott']);
    const other = out.diagnostics.filter(
      (d) => d.code !== codes.STUB_UNRESOLVED_ID && !d.code.startsWith('lint-'),
    );
    expect(other).toEqual([]);
  });
});

describe('§10 compat: Question/Answer/Needs triples compile as one-choice weaves', () => {
  it('a chat:<id> block with a triple and no branches emits a single entry', () => {
    const out = compileCase(
      `${HEADER}\n# Conversation: chat:c_bok\nQuestion: Boken - hva betyr den?\nAnswer: Den betyr alt.\nNeeds: f_bok\n`,
    );
    expect(out.slice.frank_chat).toEqual([
      {
        id: 'c_bok',
        question: 'Boken - hva betyr den?',
        answer: 'Den betyr alt.',
        needs: ['f_bok'],
        answer_lines: ['Den betyr alt.'],
        followups: [],
      },
    ]);
  });

  it('a triple with "Pays fact:" emits pays_fact and a fixit-pays-fact naming the ~ pay replacement', () => {
    const out = compileCase(
      `${HEADER}\n# Conversation: chat:c_bok\nQuestion: Boken - hva betyr den?\nAnswer: Den betyr alt.\nNeeds: f_bok\nPays fact: f_bok_notert\n`,
    );
    expect(out.slice.frank_chat).toEqual([
      {
        id: 'c_bok',
        question: 'Boken - hva betyr den?',
        answer: 'Den betyr alt.',
        needs: ['f_bok'],
        pays_fact: 'f_bok_notert',
        answer_lines: ['Den betyr alt.'],
        followups: [],
      },
    ]);
    const fixit = out.diagnostics.find((d) => d.code === codes.FIXIT_PAYS_FACT);
    expect(fixit?.severity).toBe('info');
    expect(fixit?.message).toContain('~ pay f_bok_notert');
  });
});

// ---------------------------------------------------------------------------
// Ruling 2 warn list - every unplayable construct parses, emits NOTHING for
// that construct, and produces its stable diagnostic code (DD-002: the warning
// list is the engine backlog).
// ---------------------------------------------------------------------------

describe('ruling 2 warn list - parses, warns, never emits', () => {
  it('nesting deeper than one (* * *) warns weave-nesting-too-deep and drops the deep node', () => {
    const out = compileCase(
      `${HEADER}\n# Conversation: chat:frank\n* f_a: Q?\n    L1\n    * * F1\n        FL1\n        * * * For dypt\n            Dyp linje\n`,
    );
    expect(diagCodes(out)).toContain(codes.WEAVE_NESTING_TOO_DEEP);
    expect(out.slice.frank_chat?.[0].followups).toEqual([{ label: 'F1', lines: ['FL1'] }]);
    expect(JSON.stringify(out.slice)).not.toContain('For dypt');
    expect(JSON.stringify(out.slice)).not.toContain('Dyp linje');
  });

  it('gather "- (hub)" warns weave-gather-unsupported and emits nothing for it', () => {
    const out = compileCase(
      `${HEADER}\n# Conversation: call:grete\n* f_a: Ask?\n    Reply.\n- (hub)\n`,
    );
    expect(diagCodes(out)).toContain(codes.WEAVE_GATHER_UNSUPPORTED);
    expect(out.slice.calls?.[0].exchanges).toEqual([
      { card_id: 'f_a', ask: 'Ask?', reply: [{ text: 'Reply.' }] },
    ]);
    expect(JSON.stringify(out.slice)).not.toContain('hub');
  });

  it('divert "-> hub" warns weave-divert-unsupported and emits nothing for it', () => {
    const out = compileCase(
      `${HEADER}\n# Conversation: call:grete\n* f_a: Ask?\n    Reply.\n    -> hub\n`,
    );
    expect(diagCodes(out)).toContain(codes.WEAVE_DIVERT_UNSUPPORTED);
    expect(out.slice.calls?.[0].exchanges[0].reply).toEqual([{ text: 'Reply.' }]);
    expect(JSON.stringify(out.slice)).not.toContain('hub');
  });

  it('"-> END" warns weave-end-unsupported and emits nothing for it', () => {
    const out = compileCase(
      `${HEADER}\n# Conversation: call:grete\n* f_a: Ask?\n    Reply.\n    -> END\n`,
    );
    expect(diagCodes(out)).toContain(codes.WEAVE_END_UNSUPPORTED);
    expect(out.slice.calls?.[0].exchanges[0].reply).toEqual([{ text: 'Reply.' }]);
    expect(JSON.stringify(out.slice)).not.toContain('END');
  });

  it('fallback "* ->" warns weave-fallback-unsupported, emits nothing, and does NOT map to soft_reject', () => {
    const out = compileCase(
      `${HEADER}\n# Conversation: call:grete\nSoft reject: «Nei.»\n* f_a: Ask?\n    Reply.\n* ->\n    Aldri sagt.\n`,
    );
    expect(diagCodes(out)).toContain(codes.WEAVE_FALLBACK_UNSUPPORTED);
    expect(out.slice.calls?.[0].exchanges).toHaveLength(1);
    expect(out.slice.calls?.[0].soft_reject).toBe('Nei.'); // declarative, untouched
    expect(JSON.stringify(out.slice)).not.toContain('Aldri sagt.');
  });

  it('sequence text {a|b} warns weave-sequence-unsupported and drops the line', () => {
    const out = compileCase(
      `${HEADER}\n# Conversation: call:grete\n* f_a: Ask?\n    {først|senere}\n    Reply.\n`,
    );
    expect(diagCodes(out)).toContain(codes.WEAVE_SEQUENCE_UNSUPPORTED);
    expect(out.slice.calls?.[0].exchanges[0].reply).toEqual([{ text: 'Reply.' }]);
    expect(JSON.stringify(out.slice)).not.toContain('først');
  });

  it('choice label "(gro)" warns weave-label-unsupported; the branch still emits, the label never does', () => {
    const out = compileCase(
      `${HEADER}\n# Conversation: call:grete\n* f_a: (gro) Ask?\n    Reply.\n`,
    );
    expect(diagCodes(out)).toContain(codes.WEAVE_LABEL_UNSUPPORTED);
    expect(out.slice.calls?.[0].exchanges).toEqual([
      { card_id: 'f_a', ask: 'Ask?', reply: [{ text: 'Reply.' }] },
    ]);
    expect(JSON.stringify(out.slice)).not.toContain('gro');
  });

  it('asked.* in a call gate warns cond-unsupported-asked-count and drops the term from the gate', () => {
    const out = compileCase(
      `${HEADER}\n# Conversation: call:grete\ngate: f_x and asked.gro\n* f_a: Ask?\n    Reply.\n`,
    );
    expect(diagCodes(out)).toContain(codes.COND_UNSUPPORTED_ASKED_COUNT);
    expect(out.slice.calls?.[0].gate).toEqual({ op: 'fact_lifted', args: { fact_id: 'f_x' } });
  });

  it('"n of (…)" in a weave guard warns cond-unsupported-n-of; needs keeps only the card key', () => {
    const out = compileCase(
      `${HEADER}\n# Conversation: chat:frank\n* f_a: {2 of (f_b, f_c)} Q?\n    L\n`,
    );
    expect(diagCodes(out)).toContain(codes.COND_UNSUPPORTED_N_OF);
    expect(out.slice.frank_chat?.[0].needs).toEqual(['f_a']);
  });

  it('a guard term with no runtime op (dispatch done) warns and is dropped from needs', () => {
    const out = compileCase(
      `${HEADER}\n# Conversation: chat:frank\n* f_a: {d_konto (done)} Q?\n    L\n`,
    );
    expect(diagCodes(out)).toContain(codes.COND_UNSUPPORTED_DISPATCH_DONE);
    expect(out.slice.frank_chat?.[0].needs).toEqual(['f_a']);
  });

  it('a non-flat chat guard (or) warns weave-chat-guard-unsupported; needs keeps only the card key', () => {
    const out = compileCase(
      `${HEADER}\n# Conversation: chat:frank\n* f_a: {f_b or f_c} Q?\n    L\n`,
    );
    expect(diagCodes(out)).toContain(codes.WEAVE_CHAT_GUARD_UNSUPPORTED);
    expect(out.slice.frank_chat?.[0].needs).toEqual(['f_a']);
  });

  it('a flat AND fact guard on a chat branch folds into needs (the one legal chat guard)', () => {
    const out = compileCase(
      `${HEADER}\n# Conversation: chat:frank\n* f_a: {f_b and f_c} Q?\n    L\n`,
    );
    expect(out.slice.frank_chat?.[0].needs).toEqual(['f_a', 'f_b', 'f_c']);
  });

  it('a guard on a follow-up warns weave-followup-guard; the follow-up emits without any guard', () => {
    const out = compileCase(
      `${HEADER}\n# Conversation: chat:frank\n* f_a: Q?\n    L\n    * * {f_b} F?\n        FL\n`,
    );
    expect(diagCodes(out)).toContain(codes.WEAVE_FOLLOWUP_GUARD);
    expect(out.slice.frank_chat?.[0].followups).toEqual([{ label: 'F?', lines: ['FL'] }]);
  });

  it('a guard on a call exchange warns weave-exchange-guard; the exchange emits without a gate', () => {
    const out = compileCase(
      `${HEADER}\n# Conversation: call:grete\n* f_a: {f_b} Ask?\n    Reply.\n`,
    );
    expect(diagCodes(out)).toContain(codes.WEAVE_EXCHANGE_GUARD);
    expect(out.slice.calls?.[0].exchanges).toEqual([
      { card_id: 'f_a', ask: 'Ask?', reply: [{ text: 'Reply.' }] },
    ]);
  });

  it('a free-text (non-card-keyed) choice warns weave-choice-not-card-keyed and emits nothing', () => {
    const out = compileCase(`${HEADER}\n# Conversation: call:grete\n* [Hvem er du?]\n    Reply.\n`);
    expect(diagCodes(out)).toContain(codes.WEAVE_CHOICE_NOT_CARD_KEYED);
    expect(out.slice.calls?.[0].exchanges).toEqual([]);
    expect(JSON.stringify(out.slice)).not.toContain('Hvem er du?');
  });

  it('~ effects the surface cannot carry (~ open in a chat branch) warn weave-effect-unsupported and emit nothing', () => {
    const out = compileCase(
      `${HEADER}\n# Conversation: chat:frank\n* f_a: Q?\n    L\n    ~ open q_x\n`,
    );
    expect(diagCodes(out)).toContain(codes.WEAVE_EFFECT_UNSUPPORTED);
    expect(out.slice.frank_chat?.[0]).toEqual({
      id: 'c_a',
      question: 'Q?',
      answer: 'L',
      needs: ['f_a'],
      answer_lines: ['L'],
      followups: [],
    });
  });

  it('~ pay in a call branch warns weave-effect-unsupported (call lifts are authored as anchors)', () => {
    const out = compileCase(
      `${HEADER}\n# Conversation: call:grete\n* f_a: Ask?\n    Reply.\n    ~ pay f_x\n`,
    );
    expect(diagCodes(out)).toContain(codes.WEAVE_EFFECT_UNSUPPORTED);
    expect(out.slice.calls?.[0].exchanges).toEqual([
      { card_id: 'f_a', ask: 'Ask?', reply: [{ text: 'Reply.' }] },
    ]);
  });

  it('a follow-up under a call warns weave-call-followup and emits nothing (calls have no followups field)', () => {
    const out = compileCase(
      `${HEADER}\n# Conversation: call:grete\n* f_a: Ask?\n    Reply.\n    * * F?\n        FL\n`,
    );
    expect(diagCodes(out)).toContain(codes.WEAVE_CALL_FOLLOWUP);
    expect(out.slice.calls?.[0].exchanges).toEqual([
      { card_id: 'f_a', ask: 'Ask?', reply: [{ text: 'Reply.' }] },
    ]);
    expect(JSON.stringify(out.slice)).not.toContain('FL');
  });

  it('an unknown conversation kind warns weave-unknown-kind and is skipped, never fatal', () => {
    const out = compileCase(
      `${HEADER}\n# Conversation: frank.okonomi\n* f_gap: Q?\n    L\n\n# Question: q_a\nTitle: T?\n`,
    );
    expect(diagCodes(out)).toContain(codes.WEAVE_UNKNOWN_KIND);
    expect(out.slice.calls ?? []).toEqual([]);
    expect(out.slice.frank_chat ?? []).toEqual([]);
    expect(out.slice.questions).toHaveLength(1);
  });
});

describe('sparse emit of the weave sections', () => {
  it('a case without conversation blocks omits calls and frank_chat entirely', () => {
    const out = compileCase(HEADER);
    expect('calls' in out.slice).toBe(false);
    expect('frank_chat' in out.slice).toBe(false);
  });
});
