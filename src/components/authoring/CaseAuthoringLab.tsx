import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Case Authoring Lab (SDD-100 content pipeline, night build 2026-07-02).
// Structured editor over the humane `.case.md` source shape: the dev-server
// parses markdown into `source`, this editor mutates it with forms, and the
// server serializes it back (round-trip law tested in
// generate-tiny-olsen-case.test.mjs). Saving the CANONICAL case with
// "regenerate" also refreshes the react lab TS module and the Godot JSON.
// Draft case files (e.g. SB-317 proposals) save markdown only — they can
// never touch the Godot repo.

type IdList = string[];

interface CaseDocument {
  id: string;
  kind: string;
  title: string;
  register: string;
  peek: string;
  meta: string;
  body: string;
  body_bbcode?: string;
}

interface CaseFact {
  id: string;
  label: string;
  summary: string;
  domain: string;
  category: string;
  source_document_id: string;
  quote_override: string | null;
  supports: IdList;
  discuss: IdList;
  reveals_questions: IdList;
}

interface CaseQuestion {
  id: string;
  title: string;
  prompt: string;
  appears_on: IdList;
  opens_when: IdList;
}

interface CaseHypothesis {
  id: string;
  title: string;
  summary: string;
  question_id: string;
  needs: IdList;
  opens_tiltak: IdList;
  unlocks_dispatches: IdList;
}

interface CaseTiltak {
  id: string;
  title: string;
  slot: string;
  cost: number;
  needs: IdList;
  needs_hypothesis: IdList;
  description: string;
  sim_hook_id: string;
}

interface CaseDispatch {
  id: string;
  title: string;
  description: string;
  sim_hook_id: string;
  visit_hour: number;
  occupies_hours: number;
  gate: string;
  effects: string;
}

interface CaseClock {
  id: string;
  label: string;
  sim_hook_id: string;
  question: string;
  good_segment_label: string;
  good_segment_size: number;
  bad_segment_label: string;
  bad_segment_size: number;
  visibility: string | null;
}

interface CaseEventDelta {
  event_type: string;
  log_text: string;
  clock_id: string;
  clock_direction: number;
  reveal_fact_id: string;
}

interface CaseSource {
  case: { id: string; title: string; scenario_stage: number; vurdering_frist_day: number };
  documents: CaseDocument[];
  facts: CaseFact[];
  questions: CaseQuestion[];
  hypotheses: CaseHypothesis[];
  tiltak: CaseTiltak[];
  dispatches: CaseDispatch[];
  clocks: CaseClock[];
  event_deltas: CaseEventDelta[];
}

type SectionKey =
  | 'documents'
  | 'facts'
  | 'questions'
  | 'hypotheses'
  | 'tiltak'
  | 'dispatches'
  | 'clocks'
  | 'event_deltas';

const SECTIONS: Array<{ key: SectionKey; label: string }> = [
  { key: 'documents', label: 'Dokumenter' },
  { key: 'facts', label: 'Fakta' },
  { key: 'questions', label: 'Spørsmål' },
  { key: 'hypotheses', label: 'Lesninger' },
  { key: 'tiltak', label: 'Tiltak' },
  { key: 'dispatches', label: 'Oppdrag' },
  { key: 'clocks', label: 'Klokker' },
  { key: 'event_deltas', label: 'Hendelser' },
];

const TEMPLATES: Record<SectionKey, (n: number) => unknown> = {
  documents: (n) => ({
    id: `doc_ny_${n}`,
    kind: 'FELTNOTAT',
    title: 'Nytt dokument',
    register: 'notat',
    peek: '«…»',
    meta: 'META',
    body: 'Prosa med [løftbart faktum](fact:f_ny) her.',
  }),
  facts: (n) => ({
    id: `f_ny_${n}`,
    label: 'Nytt faktum',
    summary: 'Sammendrag.',
    domain: 'Hverdag/rutine',
    category: 'Observasjon',
    source_document_id: '',
    quote_override: null,
    supports: [],
    discuss: ['Frank'],
    reveals_questions: [],
  }),
  questions: (n) => ({
    id: `q_ny_${n}`,
    title: 'Nytt spørsmål?',
    prompt: 'Nytt spørsmål?',
    appears_on: [],
    opens_when: [],
  }),
  hypotheses: (n) => ({
    id: `h_ny_${n}`,
    title: 'Ny lesning.',
    summary: 'Hva denne lesningen innebærer.',
    question_id: '',
    needs: [],
    opens_tiltak: [],
    unlocks_dispatches: [],
  }),
  tiltak: (n) => ({
    id: `t_ny_${n}`,
    title: 'Nytt tiltak',
    slot: 's2',
    cost: 1,
    needs: [],
    needs_hypothesis: [],
    description: 'Beskrivelse.',
    sim_hook_id: 'case.olsen.tiltak.ny',
  }),
  dispatches: (n) => ({
    id: `d_ny_${n}`,
    title: 'Nytt oppdrag',
    description: 'Beskrivelse.',
    sim_hook_id: 'case.olsen.dispatch.ny',
    visit_hour: 14,
    occupies_hours: 2,
    gate: 'fact f_ny',
    effects: 'scenario_stage 1',
  }),
  clocks: (n) => ({
    id: `ck_ny_${n}`,
    label: 'Ny klokke',
    sim_hook_id: 'case.olsen.clock.ny',
    question: '',
    good_segment_label: '',
    good_segment_size: 0,
    bad_segment_label: '',
    bad_segment_size: 0,
    visibility: null,
  }),
  event_deltas: (n) => ({
    event_type: `event_ny_${n}`,
    log_text: '',
    clock_id: '',
    clock_direction: 0,
    reveal_fact_id: '',
  }),
};

function itemId(section: SectionKey, item: unknown): string {
  return section === 'event_deltas'
    ? (item as CaseEventDelta).event_type
    : (item as { id: string }).id;
}

export function CaseAuthoringLab() {
  const [caseList, setCaseList] = useState<string[]>([]);
  const [canonical, setCanonical] = useState('');
  const [casePath, setCasePath] = useState('');
  const [source, setSource] = useState<CaseSource | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [parseError, setParseError] = useState('');
  const [selection, setSelection] = useState<{ section: SectionKey; index: number } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState('');
  const [rawMode, setRawMode] = useState(false);
  const [rawText, setRawText] = useState('');
  const previewTimer = useRef<number | null>(null);

  const loadCase = useCallback(async (path: string) => {
    const res = await fetch(`/api/case?path=${encodeURIComponent(path)}`);
    const data = await res.json();
    const preview = await fetch('/api/case/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markdown: data.markdown }),
    }).then((r) => r.json());
    if (preview.error) {
      setParseError(preview.error);
      setSource(null);
      setRawText(data.markdown);
      setRawMode(true);
    } else {
      setParseError('');
      setSource(preview.source as CaseSource);
      setWarnings(preview.warnings ?? []);
      setRawText(data.markdown);
    }
    setCasePath(path);
    setSelection(null);
    setDirty(false);
    setStatus('');
  }, []);

  useEffect(() => {
    fetch('/api/cases')
      .then((r) => r.json())
      .then((data) => {
        setCaseList(data.cases ?? []);
        setCanonical(data.canonical ?? '');
        const requested = new URLSearchParams(window.location.search).get('case');
        const initial =
          requested && data.cases?.includes(requested)
            ? requested
            : (data.canonical ?? data.cases?.[0]);
        if (initial) void loadCase(initial);
      })
      .catch(() => setStatus('Fant ikke API — kjører dev-serveren?'));
  }, [loadCase]);

  // Debounced live validation whenever the structured source changes.
  useEffect(() => {
    if (!source) return;
    if (previewTimer.current) window.clearTimeout(previewTimer.current);
    previewTimer.current = window.setTimeout(() => {
      fetch('/api/case/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source }),
      })
        .then((r) => r.json())
        .then((preview) => {
          if (preview.error) setParseError(preview.error);
          else {
            setParseError('');
            setWarnings(preview.warnings ?? []);
          }
        })
        .catch(() => undefined);
    }, 350);
  }, [source]);

  const idPools = useMemo(() => {
    if (!source) return {} as Record<string, string[]>;
    return {
      documents: source.documents.map((d) => d.id),
      facts: source.facts.map((f) => f.id),
      questions: source.questions.map((q) => q.id),
      hypotheses: source.hypotheses.map((h) => h.id),
      tiltak: source.tiltak.map((t) => t.id),
      dispatches: source.dispatches.map((d) => d.id),
      clocks: source.clocks.map((c) => c.id),
    };
  }, [source]);

  const mutate = useCallback((fn: (draft: CaseSource) => void) => {
    setSource((prev) => {
      if (!prev) return prev;
      const draft = structuredClone(prev);
      fn(draft);
      return draft;
    });
    setDirty(true);
  }, []);

  const save = useCallback(
    async (regenerate: boolean) => {
      if (!casePath) return;
      setStatus('Lagrer…');
      const body = rawMode
        ? { path: casePath, markdown: rawText, regenerate }
        : { path: casePath, source, regenerate };
      const res = await fetch('/api/case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error) {
        setStatus(`Feil: ${data.error}`);
        return;
      }
      setDirty(false);
      setStatus(
        data.regenerated
          ? 'Lagret + artefakter regenerert (react-lab + Godot).'
          : data.note
            ? `Lagret. ${data.note}`
            : 'Lagret (.case.md).',
      );
      if (!rawMode) await loadCase(casePath);
    },
    [casePath, rawMode, rawText, source, loadCase],
  );

  if (!source && !rawMode) {
    return (
      <div className="p-8 text-sm opacity-70">
        Laster saken… {status && <span className="text-error">{status}</span>}
      </div>
    );
  }

  const selectedItem =
    source && selection ? (source[selection.section] as unknown[])[selection.index] : null;

  return (
    <div className="mx-auto flex max-w-[1480px] gap-3 p-3">
      {/* ===== Left: navigator ===== */}
      <aside className="w-60 shrink-0 space-y-2">
        <select
          className="select select-bordered select-sm w-full"
          value={casePath}
          onChange={(e) => void loadCase(e.target.value)}
        >
          {caseList.map((path) => (
            <option key={path} value={path}>
              {path === canonical ? `★ ${path}` : path}
            </option>
          ))}
        </select>
        <div className="flex gap-1">
          <button className="btn btn-primary btn-sm flex-1" onClick={() => void save(false)}>
            Lagre{dirty ? ' •' : ''}
          </button>
          {casePath === canonical && (
            <button
              className="btn btn-warning btn-sm flex-1"
              title="Lagre og regenerer react-lab TS + Godot JSON"
              onClick={() => void save(true)}
            >
              Lagre → Godot
            </button>
          )}
        </div>
        <label className="label cursor-pointer justify-start gap-2 py-0">
          <input
            type="checkbox"
            className="toggle toggle-xs"
            checked={rawMode}
            onChange={(e) => setRawMode(e.target.checked)}
          />
          <span className="label-text text-xs">Rå markdown</span>
        </label>
        {status && <div className="text-xs opacity-80">{status}</div>}
        {!rawMode &&
          source &&
          SECTIONS.map((section) => (
            <div key={section.key} className="rounded-box border border-base-300 bg-base-100">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-[11px] font-black uppercase tracking-wider opacity-60">
                  {section.label} · {(source[section.key] as unknown[]).length}
                </span>
                <button
                  className="btn btn-ghost btn-xs"
                  title="Legg til"
                  onClick={() =>
                    mutate((draft) => {
                      const items = draft[section.key] as unknown[];
                      items.push(TEMPLATES[section.key](items.length + 1));
                      setSelection({ section: section.key, index: items.length });
                    })
                  }
                >
                  +
                </button>
              </div>
              <ul className="max-h-44 overflow-y-auto pb-1">
                {(source[section.key] as unknown[]).map((item, index) => (
                  <li key={`${itemId(section.key, item)}_${index}`}>
                    <button
                      className={`w-full truncate px-2 py-0.5 text-left text-xs hover:bg-base-200 ${
                        selection?.section === section.key && selection.index === index
                          ? 'bg-primary/15 font-bold'
                          : ''
                      }`}
                      onClick={() => setSelection({ section: section.key, index })}
                    >
                      {itemId(section.key, item)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </aside>

      {/* ===== Center: editor ===== */}
      <main className="min-w-0 flex-1">
        {rawMode ? (
          <textarea
            className="textarea textarea-bordered h-[80vh] w-full font-mono text-xs"
            value={rawText}
            onChange={(e) => {
              setRawText(e.target.value);
              setDirty(true);
            }}
          />
        ) : source && selection && selectedItem ? (
          <ItemEditor
            section={selection.section}
            item={selectedItem}
            source={source}
            idPools={idPools}
            onChange={(patch) =>
              mutate((draft) => {
                Object.assign(
                  (draft[selection.section] as unknown[])[selection.index] as object,
                  patch,
                );
              })
            }
            onDelete={() =>
              mutate((draft) => {
                (draft[selection.section] as unknown[]).splice(selection.index, 1);
                setSelection(null);
              })
            }
            onSelect={(section, id) => {
              const index = (source[section] as unknown[]).findIndex(
                (candidate) => itemId(section, candidate) === id,
              );
              if (index >= 0) setSelection({ section, index });
            }}
          />
        ) : (
          source && <CaseHeaderEditor source={source} mutate={mutate} />
        )}
      </main>

      {/* ===== Right: warnings + wiring ===== */}
      <aside className="w-72 shrink-0 space-y-2">
        <div className="rounded-box border border-base-300 bg-base-100 p-2">
          <div className="text-[11px] font-black uppercase tracking-wider opacity-60">
            Validering
          </div>
          {parseError ? (
            <div className="mt-1 text-xs text-error">{parseError}</div>
          ) : warnings.length ? (
            <ul className="mt-1 space-y-1 text-xs text-warning">
              {warnings.map((warning) => (
                <li key={warning}>⚠ {warning}</li>
              ))}
            </ul>
          ) : (
            <div className="mt-1 text-xs text-success">✓ Ingen advarsler</div>
          )}
        </div>
        {source && selection && selectedItem != null && (
          <WiringPanel
            section={selection.section}
            item={selectedItem}
            source={source}
            onSelect={(section, id) => {
              const index = (source[section] as unknown[]).findIndex(
                (candidate) => itemId(section, candidate) === id,
              );
              if (index >= 0) setSelection({ section, index });
            }}
          />
        )}
      </aside>
    </div>
  );
}

// === Case header form ============================================================

function CaseHeaderEditor({
  source,
  mutate,
}: {
  source: CaseSource;
  mutate: (fn: (draft: CaseSource) => void) => void;
}) {
  return (
    <div className="rounded-box border border-base-300 bg-base-100 p-4">
      <h2 className="mb-2 font-black">Sak</h2>
      <p className="mb-3 text-xs opacity-60">
        Velg et element i venstremenyen for å redigere det — eller rediger sakens hode her.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Field
          label="Id"
          value={source.case.id}
          onChange={(v) => mutate((d) => void (d.case.id = v))}
        />
        <Field
          label="Tittel"
          value={source.case.title}
          onChange={(v) => mutate((d) => void (d.case.title = v))}
        />
        <Field
          label="Vurdering frist (dag)"
          value={String(source.case.vurdering_frist_day)}
          onChange={(v) => mutate((d) => void (d.case.vurdering_frist_day = Number(v) || 0))}
        />
        <Field
          label="Scenario stage"
          value={String(source.case.scenario_stage)}
          onChange={(v) => mutate((d) => void (d.case.scenario_stage = Number(v) || 0))}
        />
      </div>
    </div>
  );
}

// === Generic item editor =========================================================

function ItemEditor({
  section,
  item,
  source,
  idPools,
  onChange,
  onDelete,
  onSelect,
}: {
  section: SectionKey;
  item: unknown;
  source: CaseSource;
  idPools: Record<string, string[]>;
  onChange: (patch: Record<string, unknown>) => void;
  onDelete: () => void;
  onSelect: (section: SectionKey, id: string) => void;
}) {
  const record = item as Record<string, unknown>;
  const header = (
    <div className="mb-2 flex items-center justify-between">
      <h2 className="font-mono text-sm font-black">{itemId(section, item)}</h2>
      <button className="btn btn-ghost btn-xs text-error" onClick={onDelete}>
        Slett
      </button>
    </div>
  );

  const text = (key: string, label: string) => (
    <Field
      label={label}
      value={String(record[key] ?? '')}
      onChange={(v) => onChange({ [key]: v })}
    />
  );
  const num = (key: string, label: string) => (
    <Field
      label={label}
      value={String(record[key] ?? 0)}
      onChange={(v) => onChange({ [key]: Number(v) || 0 })}
    />
  );
  const area = (key: string, label: string, rows = 3) => (
    <AreaField
      label={label}
      rows={rows}
      value={String(record[key] ?? '')}
      onChange={(v) => onChange({ [key]: v })}
    />
  );
  const list = (key: string, label: string, pool?: string[]) => (
    <ListField
      label={label}
      values={(record[key] as string[]) ?? []}
      pool={pool}
      onChange={(v) => onChange({ [key]: v })}
    />
  );

  return (
    <div className="rounded-box border border-base-300 bg-base-100 p-4">
      {header}
      <div className="space-y-2">
        {text('id', 'Id')}
        {section === 'documents' && (
          <>
            <div className="grid grid-cols-2 gap-2">
              {text('kind', 'Kind')}
              {text('title', 'Tittel')}
              {text('register', 'Register (klinisk/notat/formell/vedtak)')}
              {text('meta', 'Meta')}
            </div>
            {text('peek', 'Peek (forhåndsvisning på pulten)')}
            <AreaField
              label="Prosa — merk løftbare fakta som [tekst](fact:f_id)"
              rows={16}
              mono
              value={String(record.body ?? '')}
              onChange={(v) => onChange({ body: v })}
            />
          </>
        )}
        {section === 'facts' && (
          <>
            {text('label', 'Etikett (korttittel på brettet)')}
            {area('summary', 'Sammendrag (saksspråk)')}
            <div className="grid grid-cols-2 gap-2">
              {text('domain', 'Domene')}
              {text('category', 'Kategori')}
            </div>
            <ListField
              label="Kildedokument"
              values={[String(record.source_document_id ?? '')]}
              pool={idPools.documents}
              single
              onChange={(v) => onChange({ source_document_id: v[0] ?? '' })}
            />
            {list('supports', 'Støtter spørsmål', idPools.questions)}
            {list('reveals_questions', 'Avdekker spørsmål', idPools.questions)}
            {list('discuss', 'Kan drøftes med')}
          </>
        )}
        {section === 'questions' && (
          <>
            {area('title', 'Spørsmålet (tittel = prompt)', 2)}
            {list('opens_when', 'Åpnes av fakta', idPools.facts)}
            <div className="text-[11px] opacity-60">
              Husk symmetrien: fakta som åpner spørsmålet bør ha «Avdekker spørsmål» tilbake.
            </div>
          </>
        )}
        {section === 'hypotheses' && (
          <>
            {area('title', 'Lesningen (én setning, spillerens stemme)', 2)}
            {area('summary', 'Notat (hva lesningen innebærer)')}
            <ListField
              label="Hører til spørsmål"
              values={[String(record.question_id ?? '')]}
              pool={idPools.questions}
              single
              onChange={(v) => onChange({ question_id: v[0] ?? '' })}
            />
            {list('needs', 'Sterkt grunnlag (authored basis — glød, ikke gate)', idPools.facts)}
            {list('opens_tiltak', 'Åpner tiltak', idPools.tiltak)}
            {list('unlocks_dispatches', 'Åpner oppdrag', idPools.dispatches)}
          </>
        )}
        {section === 'tiltak' && (
          <>
            {text('title', 'Tittel')}
            <div className="grid grid-cols-2 gap-2">
              {text('slot', 'Slot (s1/s2/s3/press)')}
              {num('cost', 'Kostnad (mynter)')}
            </div>
            {area('description', 'Beskrivelse')}
            {text('sim_hook_id', 'Sim hook')}
          </>
        )}
        {section === 'dispatches' && (
          <>
            {text('title', 'Tittel')}
            {area('description', 'Beskrivelse')}
            <div className="grid grid-cols-2 gap-2">
              {num('visit_hour', 'Frank drar kl.')}
              {num('occupies_hours', 'Opptar timer')}
            </div>
            {text('gate', 'Gate — «hypothesis h_x + fact f_y»')}
            {text('effects', 'Effects — «scenario_stage 1; pending_doc doc_x after 1 day on ck_y»')}
            {text('sim_hook_id', 'Sim hook')}
          </>
        )}
        {section === 'clocks' && (
          <>
            {text('label', 'Etikett')}
            {text('question', 'Spørsmålet klokken svarer på')}
            <div className="grid grid-cols-2 gap-2">
              {text('good_segment_label', 'God-segment etikett')}
              {num('good_segment_size', 'God-segment størrelse')}
              {text('bad_segment_label', 'Dårlig-segment etikett')}
              {num('bad_segment_size', 'Dårlig-segment størrelse')}
            </div>
            {text('visibility', 'Synlighet — gate-syntaks, tom = alltid')}
            {text('sim_hook_id', 'Sim hook')}
          </>
        )}
        {section === 'event_deltas' && (
          <>
            {text('event_type', 'Event type (id)')}
            {area('log_text', 'Loggtekst', 2)}
            <div className="grid grid-cols-2 gap-2">
              <ListField
                label="Klokke"
                values={[String(record.clock_id ?? '')]}
                pool={idPools.clocks}
                single
                onChange={(v) => onChange({ clock_id: v[0] ?? '' })}
              />
              {num('clock_direction', 'Retning (+1/-1)')}
            </div>
            <ListField
              label="Avdekker faktum"
              values={[String(record.reveal_fact_id ?? '')]}
              pool={idPools.facts}
              single
              onChange={(v) => onChange({ reveal_fact_id: v[0] ?? '' })}
            />
          </>
        )}
      </div>
      {section === 'questions' && (
        <QuestionReadings questionId={String(record.id)} source={source} onSelect={onSelect} />
      )}
    </div>
  );
}

function QuestionReadings({
  questionId,
  source,
  onSelect,
}: {
  questionId: string;
  source: CaseSource;
  onSelect: (section: SectionKey, id: string) => void;
}) {
  const readings = source.hypotheses.filter((h) => h.question_id === questionId);
  return (
    <div className="mt-4 border-t border-base-300 pt-2">
      <div className="text-[11px] font-black uppercase tracking-wider opacity-60">
        Lesninger på dette spørsmålet
      </div>
      <ul className="mt-1 space-y-1">
        {readings.map((h) => (
          <li key={h.id}>
            <button className="link text-xs" onClick={() => onSelect('hypotheses', h.id)}>
              {h.id}
            </button>{' '}
            <span className="text-xs opacity-70">{h.title}</span>
          </li>
        ))}
        {!readings.length && (
          <li className="text-xs opacity-50">Ingen — legg til under Lesninger.</li>
        )}
      </ul>
    </div>
  );
}

// === Wiring panel ================================================================

function WiringPanel({
  section,
  item,
  source,
  onSelect,
}: {
  section: SectionKey;
  item: unknown;
  source: CaseSource;
  onSelect: (section: SectionKey, id: string) => void;
}) {
  const record = item as Record<string, unknown>;
  const rows: Array<{ label: string; section: SectionKey; ids: string[] }> = [];
  if (section === 'facts') {
    const id = String(record.id);
    rows.push({
      label: 'Sitert i dokument',
      section: 'documents',
      ids: source.documents.filter((d) => d.body.includes(`(fact:${id})`)).map((d) => d.id),
    });
    rows.push({
      label: 'Åpner spørsmål',
      section: 'questions',
      ids: source.questions.filter((q) => q.opens_when.includes(id)).map((q) => q.id),
    });
    rows.push({
      label: 'Sterkt grunnlag for',
      section: 'hypotheses',
      ids: source.hypotheses.filter((h) => h.needs.includes(id)).map((h) => h.id),
    });
  }
  if (section === 'questions') {
    const id = String(record.id);
    rows.push({
      label: 'Åpnes av fakta',
      section: 'facts',
      ids: (record.opens_when as string[]) ?? [],
    });
    rows.push({
      label: 'Lesninger',
      section: 'hypotheses',
      ids: source.hypotheses.filter((h) => h.question_id === id).map((h) => h.id),
    });
  }
  if (section === 'hypotheses') {
    rows.push({
      label: 'Åpner tiltak',
      section: 'tiltak',
      ids: (record.opens_tiltak as string[]) ?? [],
    });
    rows.push({
      label: 'Åpner oppdrag',
      section: 'dispatches',
      ids: (record.unlocks_dispatches as string[]) ?? [],
    });
    rows.push({
      label: 'Sterkt grunnlag',
      section: 'facts',
      ids: (record.needs as string[]) ?? [],
    });
  }
  if (section === 'tiltak') {
    const id = String(record.id);
    rows.push({
      label: 'Åpnes av lesninger',
      section: 'hypotheses',
      ids: source.hypotheses.filter((h) => h.opens_tiltak.includes(id)).map((h) => h.id),
    });
  }
  if (section === 'documents') {
    const id = String(record.id);
    rows.push({
      label: 'Fakta i dokumentet',
      section: 'facts',
      ids: source.facts.filter((f) => f.source_document_id === id).map((f) => f.id),
    });
  }
  if (!rows.length) return null;
  return (
    <div className="rounded-box border border-base-300 bg-base-100 p-2">
      <div className="text-[11px] font-black uppercase tracking-wider opacity-60">Koblinger</div>
      {rows.map((row) => (
        <div key={row.label} className="mt-1">
          <div className="text-[10px] uppercase opacity-50">{row.label}</div>
          <div className="flex flex-wrap gap-1">
            {row.ids.map((id) => (
              <button
                key={id}
                className="badge badge-outline badge-sm hover:badge-primary"
                onClick={() => onSelect(row.section, id)}
              >
                {id}
              </button>
            ))}
            {!row.ids.length && <span className="text-xs opacity-40">—</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

// === Field primitives ============================================================

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="form-control w-full">
      <span className="label-text text-[11px] opacity-60">{label}</span>
      <input
        className="input input-bordered input-sm w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function AreaField({
  label,
  value,
  rows,
  mono,
  onChange,
}: {
  label: string;
  value: string;
  rows: number;
  mono?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="form-control w-full">
      <span className="label-text text-[11px] opacity-60">{label}</span>
      <textarea
        className={`textarea textarea-bordered w-full text-sm ${mono ? 'font-mono text-xs' : ''}`}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function ListField({
  label,
  values,
  pool,
  single,
  onChange,
}: {
  label: string;
  values: string[];
  pool?: string[];
  single?: boolean;
  onChange: (values: string[]) => void;
}) {
  const listId = useMemo(
    () => `pool_${Math.abs(hashCode(label + (pool ?? []).join(',')))}`,
    [label, pool],
  );
  return (
    <label className="form-control w-full">
      <span className="label-text text-[11px] opacity-60">
        {label}
        {single ? '' : ' (kommaseparert)'}
      </span>
      <input
        className="input input-bordered input-sm w-full font-mono text-xs"
        list={pool ? listId : undefined}
        value={values.filter(Boolean).join(', ')}
        onChange={(e) =>
          onChange(
            e.target.value
              .split(',')
              .map((v) => v.trim())
              .filter(Boolean)
              .slice(0, single ? 1 : undefined),
          )
        }
      />
      {pool && (
        <datalist id={listId}>
          {pool.map((id) => (
            <option key={id} value={id} />
          ))}
        </datalist>
      )}
    </label>
  );
}

function hashCode(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) | 0;
  return hash;
}
