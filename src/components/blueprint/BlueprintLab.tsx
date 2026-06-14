import clsx from 'clsx';
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  Coins,
  FileText,
  Home,
  MessageSquare,
  RotateCcw,
  Search,
  Send,
  Sparkles,
} from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import {
  blueprintDayName,
  blueprintDomains,
  blueprintFacts,
  blueprintPrologue,
  blueprintQuestions,
  blueprintSlotLabels,
  blueprintTiltak,
} from '../../content/blueprint';
import type {
  BlueprintDocument,
  BlueprintDomain,
  BlueprintFact,
  BlueprintSurface,
  BlueprintTextRun,
  BlueprintTiltakSlot,
} from '../../domain/blueprint';
import { BlueprintStore } from '../../stores/BlueprintStore';

const surfaces: Array<{ id: BlueprintSurface; label: string; icon: ReactNode }> = [
  { id: 'pulten', label: 'Pulten', icon: <FileText size={16} /> },
  { id: 'fakta', label: 'Sakens fakta', icon: <BookOpen size={16} /> },
  { id: 'sporsmal', label: 'Åpne spørsmål', icon: <Search size={16} /> },
  { id: 'vedtak', label: 'Vedtak og tiltak', icon: <ClipboardList size={16} /> },
  { id: 'frank', label: 'Frank', icon: <MessageSquare size={16} /> },
  { id: 'leiligheten', label: 'Leiligheten', icon: <Home size={16} /> },
];

const domainIcon: Record<BlueprintDomain, string> = {
  'Økonomi/bolig': '●',
  'Hverdag/rutine': '⌂',
  'Helse/risiko': '+',
  'Nettverk/sosialt': '☎',
  Ressurser: '✦',
};

export function BlueprintLab() {
  const [store] = useState(() => new BlueprintStore());
  return <BlueprintSurface store={store} />;
}

const BlueprintSurface = observer(function BlueprintSurface({ store }: { store: BlueprintStore }) {
  return (
    <div className="blueprint-root min-h-screen bg-[#382f26] text-[#2a2520]">
      {store.progress.phase === 'prologue' ? <Prologue store={store} /> : null}
      <div
        className={clsx(
          'mx-auto max-w-[1480px] px-3 pb-10 pt-4 md:px-6',
          store.progress.phase === 'prologue' && 'hidden',
        )}
      >
        <Header store={store} />
        <Tabs store={store} />
        <main className="blueprint-sheet min-h-[680px] p-3 md:p-5">
          {store.activeSurface === 'pulten' ? <Desk store={store} /> : null}
          {store.activeSurface === 'fakta' ? <FactsBoard store={store} /> : null}
          {store.activeSurface === 'sporsmal' ? <QuestionsBoard store={store} /> : null}
          {store.activeSurface === 'vedtak' ? <VedtakBoard store={store} /> : null}
          {store.activeSurface === 'frank' ? <FrankBoard store={store} /> : null}
          {store.activeSurface === 'leiligheten' ? <ApartmentBoard store={store} /> : null}
        </main>
      </div>
      <DocumentReader store={store} />
      <FactDialog store={store} />
      <Notices store={store} />
      {store.reflectionVisible ? <Reflection store={store} /> : null}
    </div>
  );
});

const Prologue = observer(function Prologue({ store }: { store: BlueprintStore }) {
  const shown = blueprintPrologue.slice(0, store.prologueIndex + 1);
  const last = shown.at(-1);
  const finished = Boolean(last?.stamp);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#382f26] p-4">
      <section className="blueprint-story-card max-h-[88vh] w-full max-w-2xl overflow-y-auto p-7 md:p-9">
        <div className="mb-6 text-center text-xs font-bold uppercase tracking-[0.24em] text-[#6b6259]">
          {shown.find((beat) => beat.cap)?.cap}
        </div>
        <div className="grid gap-4">
          {shown
            .filter((beat) => !beat.cap)
            .map((beat, index) =>
              beat.dir ? (
                <p key={index} className="text-sm italic leading-relaxed text-[#6b6259]">
                  {beat.dir}
                </p>
              ) : beat.stamp ? (
                <div key={index} className="py-4 text-center">
                  <span className="blueprint-stamp">{beat.stamp}</span>
                  <p className="mt-4 text-xl font-semibold">{beat.end}</p>
                </div>
              ) : (
                <div key={index}>
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#6b6259]">
                    {beat.who}
                  </div>
                  <p className="text-2xl font-semibold leading-snug">{beat.say}</p>
                </div>
              ),
            )}
        </div>
        <div className="mt-7 flex flex-wrap justify-end gap-2">
          {finished ? (
            <button className="blueprint-button primary" type="button" onClick={store.startCase}>
              <ArrowRight size={16} />
              Til pulten
            </button>
          ) : (
            <>
              <button className="blueprint-button quiet" type="button" onClick={store.startCase}>
                Hopp over
              </button>
              <button
                className="blueprint-button primary"
                type="button"
                onClick={store.advancePrologue}
              >
                <ArrowRight size={16} />
                Videre
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
});

const Header = observer(function Header({ store }: { store: BlueprintStore }) {
  return (
    <header className="mb-3 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
      <div className="blueprint-case-head">
        <div>
          <h1 className="text-lg font-black uppercase tracking-[0.12em]">
            Sak 99/0412 · Olsen, Elling
          </h1>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#6b6259]">
            Oslo kommune · sosialkontoret · meldt av Dr. J. Haug · februar 1999
          </p>
        </div>
        <div className="mt-3 text-xs uppercase tracking-[0.14em] text-[#6b6259] md:mt-0 md:text-right">
          Tiltaksramme: 6 mynter/mnd
          <br />
          Disponert: {store.spentCost || '—'}
        </div>
      </div>
      <ResourceBox value={store.progress.day} label="dag" />
      <ResourceBox value={store.progress.actions} label="handlinger" />
      <button className="blueprint-resource action" type="button" onClick={store.advanceDay}>
        <ArrowRight size={22} />
        <span>Neste dag</span>
      </button>
    </header>
  );
});

function ResourceBox({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="blueprint-resource">
      <div className="text-3xl font-black leading-none">{value}</div>
      <div>{label}</div>
    </div>
  );
}

const Tabs = observer(function Tabs({ store }: { store: BlueprintStore }) {
  const factBadge = store.progress.unreadFacts;
  const questionBadge = store.visibleQuestions.filter((entry) => {
    const state = store.progress.questions[entry.id];
    return (
      !state.hypothesisId &&
      entry.question.hypotheses.some((hypothesis) =>
        hypothesis.needs.every((factId) => store.progress.facts[factId]),
      )
    );
  }).length;
  const frankBadge = store.askableFrankPrompts.length;

  return (
    <nav className="flex flex-wrap gap-1 px-1">
      {surfaces.map((surface) => {
        const badge =
          surface.id === 'fakta'
            ? factBadge
            : surface.id === 'sporsmal'
              ? questionBadge
              : surface.id === 'frank'
                ? frankBadge
                : 0;
        return (
          <button
            key={surface.id}
            className={clsx('blueprint-tab', store.activeSurface === surface.id && 'active')}
            type="button"
            onClick={() => store.showSurface(surface.id)}
          >
            {surface.icon}
            {surface.label}
            {badge > 0 ? <span className="blueprint-tab-badge">{badge}</span> : null}
          </button>
        );
      })}
    </nav>
  );
});

const Desk = observer(function Desk({ store }: { store: BlueprintStore }) {
  return (
    <section className="blueprint-desk min-h-[640px] rounded-sm p-4 md:p-6">
      <div className="flex flex-wrap gap-6">
        {store.documentEntries.map(({ id, document, state }, index) => {
          const evidence = store.evidenceCount(document);
          return (
            <button
              key={id}
              className={clsx('blueprint-desk-doc', state.read && 'read')}
              style={{ transform: `rotate(${(((index * 137) % 50) - 25) / 10}deg)` }}
              type="button"
              onClick={() => store.openDocument(id)}
            >
              {state.isNew ? <span className="blueprint-stamp new">NY</span> : null}
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6b6259]">
                {document.kind} · dag {state.day}
              </span>
              <span className="mt-2 block text-left text-base font-black leading-tight">
                {document.title}
              </span>
              <span className="mt-2 block text-left text-sm leading-snug text-[#6b6259]">
                {document.peek}
              </span>
              {evidence.total ? (
                <span className="absolute bottom-2 right-3 text-[10px] uppercase tracking-[0.12em] text-[#a49a8c]">
                  {evidence.lifted}/{evidence.total} merket
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <p className="mt-8 max-w-xl text-lg font-semibold text-[#cfc4b2]">
        {store.progress.greteStage >= 5
          ? 'Mappen er tyngre enn den var. Det er fortsatt bare én sak i den.'
          : store.progress.day === 1
            ? 'Én melding. Én pult. Begynn der.'
            : 'Pulten svarer først når du ber noen gjøre noe.'}
      </p>
    </section>
  );
});

const DocumentReader = observer(function DocumentReader({ store }: { store: BlueprintStore }) {
  const document = store.currentDocument;
  const [nudged, setNudged] = useState(false);
  const hasEvidence = Boolean(
    document?.blocks.some((block) => block.runs.some((run) => Boolean(run.factId))),
  );
  useEffect(() => {
    setNudged(false);
    if (!document || !store.openDocumentId) return;
    const timer = window.setTimeout(() => setNudged(true), 10_000);
    return () => window.clearTimeout(timer);
  }, [document, store.openDocumentId]);

  if (!document || !store.openDocumentId) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-[#1a1510]/60 p-3 py-8">
      <article
        className={clsx('blueprint-reader w-full max-w-3xl p-5 md:p-8', `reg-${document.register}`)}
      >
        <button
          className="blueprint-button quiet float-right"
          type="button"
          onClick={store.closeDocument}
        >
          Lukk
        </button>
        <div className="mb-5 border-b-2 border-[#2a2520] pb-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-black uppercase tracking-[0.12em]">{document.kind}</h2>
            <span className="text-xs uppercase tracking-[0.14em] text-[#6b6259]">
              {document.meta}
            </span>
          </div>
          <p className="mt-1 text-xl font-semibold">{document.title}</p>
        </div>
        {hasEvidence ? (
          <div className="mb-4 rounded border border-[#c89a2e]/60 bg-[#c89a2e]/10 p-3 text-sm leading-relaxed">
            Tekst med prikket strek kan løftes til Sakens fakta. Gul markering vises først etter at
            faktum er løftet.
          </div>
        ) : null}
        <div className="grid gap-4 text-base leading-8">
          {document.blocks.map((block) => (
            <p key={block.id}>
              <RunText runs={block.runs} store={store} nudged={nudged} />
            </p>
          ))}
        </div>
      </article>
    </div>
  );
});

const RunText = observer(function RunText({
  runs,
  store,
  nudged = false,
}: {
  runs: BlueprintTextRun[];
  store: BlueprintStore;
  nudged?: boolean;
}) {
  return (
    <>
      {runs.map((run, index) => {
        if (!run.factId) return <span key={`${run.text}-${index}`}>{run.text}</span>;
        const lifted = Boolean(store.progress.facts[run.factId]);
        return (
          <button
            key={`${run.factId}-${index}`}
            className={clsx(
              'blueprint-evidence',
              lifted && 'collected',
              nudged && !lifted && 'nudged',
            )}
            type="button"
            data-testid={`blueprint-evidence-${run.factId}`}
            aria-pressed={lifted}
            aria-label={lifted ? `Faktum samlet: ${run.text}` : `Løft faktum: ${run.text}`}
            onClick={() => store.liftFact(run.factId!)}
          >
            <span>{run.text}</span>
            {!lifted ? <Search aria-hidden size={13} /> : <Sparkles aria-hidden size={13} />}
          </button>
        );
      })}
    </>
  );
});

const FactsBoard = observer(function FactsBoard({ store }: { store: BlueprintStore }) {
  return (
    <section>
      <FrameTitle title="Sakens fakta" meta="Auto-arkivert på domene · kilde påført" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {store.factsByDomain.map(({ domain, facts }) => (
          <div key={domain} className="min-w-0">
            <h3 className="mb-3 flex justify-between border-b border-[#a49a8c] pb-1 text-xs font-bold uppercase tracking-[0.14em] text-[#6b6259]">
              <span>{domain}</span>
              <span>{facts.length || '—'}</span>
            </h3>
            <div className="grid gap-3">
              {facts.length ? (
                facts.map((fact) => (
                  <button
                    key={fact.id}
                    className={clsx(
                      'blueprint-fact-chip text-left',
                      store.progress.facts[fact.id]?.fresh && 'fresh',
                    )}
                    type="button"
                    onClick={() => store.selectFact(fact.id)}
                  >
                    <span className="blueprint-domain-icon">{domainIcon[fact.domain]}</span>
                    <span className="font-semibold">{fact.text}</span>
                    <span className="mt-1 block text-xs italic text-[#6b6259]">«{fact.quote}»</span>
                    <span className="mt-2 block text-[10px] uppercase tracking-[0.12em] text-[#6b6259]">
                      {fact.category} · dag {store.progress.facts[fact.id]?.day}
                    </span>
                  </button>
                ))
              ) : (
                <p className="text-sm text-[#a49a8c]">ingenting ennå</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

const QuestionsBoard = observer(function QuestionsBoard({ store }: { store: BlueprintStore }) {
  const boardRef = useRef<HTMLElement | null>(null);
  const [lines, setLines] = useState<Array<{ key: string; d: string }>>([]);
  const visibleSignature = store.visibleQuestions
    .map(
      ({ id }) =>
        `${id}:${store
          .factsForQuestion(id)
          .map((fact) => fact.id)
          .join(',')}`,
    )
    .join('|');

  useLayoutEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    const redraw = () => {
      const bounds = board.getBoundingClientRect();
      const byFact = new Map<string, HTMLElement[]>();
      board.querySelectorAll<HTMLElement>('[data-line-fact]').forEach((node) => {
        const factId = node.dataset.lineFact;
        if (!factId) return;
        const nodes = byFact.get(factId) ?? [];
        nodes.push(node);
        byFact.set(factId, nodes);
      });

      const nextLines: Array<{ key: string; d: string }> = [];
      for (const [factId, nodes] of byFact) {
        if (nodes.length < 2) continue;
        const centers = nodes.map((node) => {
          const rect = node.getBoundingClientRect();
          return {
            x: rect.left + rect.width / 2 - bounds.left,
            y: rect.top + rect.height / 2 - bounds.top,
          };
        });
        for (let index = 0; index < centers.length - 1; index += 1) {
          const a = centers[index];
          const b = centers[index + 1];
          const mid = Math.max(24, Math.abs(b.y - a.y) / 2);
          nextLines.push({
            key: `${factId}-${index}`,
            d: `M ${a.x} ${a.y} C ${a.x} ${a.y + mid}, ${b.x} ${b.y - mid}, ${b.x} ${b.y}`,
          });
        }
      }
      setLines(nextLines);
    };

    redraw();
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(redraw) : undefined;
    resizeObserver?.observe(board);
    window.addEventListener('resize', redraw);
    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', redraw);
    };
  }, [visibleSignature]);

  if (!store.visibleQuestions.length) {
    return (
      <section className="grid min-h-[520px] place-items-center text-center text-xl font-semibold text-[#6b6259]">
        Spørsmålene kommer av fakta. Les dokumentene på pulten.
      </section>
    );
  }

  return (
    <section ref={boardRef} className="blueprint-question-board relative">
      <FrameTitle title="Åpne spørsmål" meta="Arbeidshypoteser er foreløpige · ikke fasit" />
      <svg className="blueprint-question-lines" aria-hidden>
        {lines.map((line) => (
          <path key={line.key} d={line.d} />
        ))}
      </svg>
      <div className="relative z-[1] grid gap-5">
        {store.visibleQuestions.map(({ id, question }) => {
          const facts = store.factsForQuestion(id);
          const stateLabel = store.questionStateLabel(id);
          const chosenId = store.progress.questions[id]?.hypothesisId;
          const chosen = question.hypotheses.find((hypothesis) => hypothesis.id === chosenId);

          return (
            <article key={id} className="blueprint-frame border-l-4 border-l-[#2a2520] p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="text-xl font-black">{question.title}</h2>
                <span className={clsx('blueprint-pill', questionPillTone(stateLabel))}>
                  {stateLabel}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {facts.map((fact) => (
                  <button
                    key={fact.id}
                    className="blueprint-mini-fact"
                    type="button"
                    data-line-fact={fact.id}
                    onClick={() => store.selectFact(fact.id)}
                  >
                    <span className="blueprint-domain-icon">{domainIcon[fact.domain]}</span>
                    {fact.text}
                  </button>
                ))}
                {facts.length < 2 ? (
                  <span className="blueprint-mini-fact missing">… saken mangler grunnlag</span>
                ) : null}
              </div>
              <div className="mt-4 grid gap-2">
                {question.hypotheses.map((hypothesis) => {
                  const available = store.hypothesisAvailable(id, hypothesis.id);
                  const selected = chosenId === hypothesis.id;
                  return (
                    <button
                      key={hypothesis.id}
                      className={clsx(
                        'blueprint-hypothesis text-left',
                        selected && 'chosen',
                        !available && 'blocked',
                      )}
                      type="button"
                      disabled={!available}
                      onClick={() => store.selectHypothesis(id, hypothesis.id)}
                    >
                      <span className="font-black">{selected ? '☒' : '☐'}</span>
                      <span>
                        {available ? (
                          hypothesis.label
                        ) : (
                          <>
                            <span className="blueprint-redact">{hypothesis.label}</span>
                            <span className="ml-2 text-xs uppercase tracking-[0.1em] text-[#c86244]">
                              uleselig · mangler faktum
                            </span>
                          </>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
              {chosen ? (
                <div className="mt-4 rounded border-2 border-[#2a2520] bg-[#ece7d8] p-3">
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#c86244]">
                    Arbeidshypotese · foreløpig
                  </div>
                  <p className="mt-1 text-sm leading-relaxed">{chosen.note}</p>
                  {chosen.opens.length ? (
                    <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[#7a6420]">
                      Gir grunnlag for:{' '}
                      {chosen.opens.map((tiltakId) => blueprintTiltak[tiltakId].title).join(' · ')}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
});

function questionPillTone(label: string): 'gold' | 'blue' | 'neutral' {
  if (label === 'Foreløpig arbeidssvar') return 'gold';
  if (label === 'Delvis belyst') return 'blue';
  return 'neutral';
}

const VedtakBoard = observer(function VedtakBoard({ store }: { store: BlueprintStore }) {
  const slots: BlueprintTiltakSlot[] = ['s1', 's2', 's3', 'press'];
  return (
    <section className="grid gap-5 xl:grid-cols-[1.45fr_0.75fr]">
      <div>
        <FrameTitle
          title={`Vedtak ${store.progress.vedtakCount + 1} · utkast`}
          meta="Tre slots pluss presskort"
        />
        {slots.map((slot) => (
          <div key={slot} className="mb-5">
            <h3 className="mb-2 border-b border-[#a49a8c] pb-1 text-xs font-black uppercase tracking-[0.16em] text-[#6b6259]">
              {blueprintSlotLabels[slot]}
            </h3>
            <div className="grid gap-2">
              {Object.values(blueprintTiltak)
                .filter((tiltak) => tiltak.slot === slot)
                .map((tiltak) => {
                  const availability = store.tiltakAvailability(tiltak.id);
                  const active = store.progress.enactedTiltakIds.includes(tiltak.id);
                  const drafted = store.progress.draftTiltakIds.includes(tiltak.id);
                  return (
                    <button
                      key={tiltak.id}
                      className={clsx(
                        'blueprint-tiltak-card text-left',
                        active && 'active-now',
                        drafted && 'chosen',
                        !active && !availability.ok && 'blocked',
                      )}
                      type="button"
                      disabled={active || !availability.ok}
                      onClick={() => store.toggleDraftTiltak(tiltak.id)}
                    >
                      <span className="text-lg font-black">{active || drafted ? '☒' : '☐'}</span>
                      <span className="min-w-0 flex-1">
                        <span className="font-bold">{tiltak.title}</span>
                        {active ? (
                          <span className="blueprint-pill green ml-2">iverksatt</span>
                        ) : null}
                        {tiltak.early &&
                        !store.progress.sim.doorOpened &&
                        store.progress.clocks.ck_rutine.good === 0 ? (
                          <span className="blueprint-pill warn ml-2">for tidlig?</span>
                        ) : null}
                        <span className="mt-1 block text-sm leading-relaxed text-[#6b6259]">
                          {tiltak.description}
                        </span>
                        {!availability.ok && !active ? (
                          <span className="mt-1 block text-xs uppercase tracking-[0.1em] text-[#c86244]">
                            {availability.why}
                          </span>
                        ) : null}
                      </span>
                      <span className="ml-auto whitespace-nowrap text-xs uppercase tracking-[0.12em] text-[#6b6259]">
                        {tiltak.cost ? `${tiltak.cost} mynt` : '—'}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            className="blueprint-button primary"
            type="button"
            disabled={!store.progress.draftTiltakIds.length}
            onClick={store.enactTiltak}
          >
            <ClipboardList size={16} />
            Fatt vedtak ({store.progress.draftTiltakIds.length})
          </button>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#6b6259]">
            <Coins size={16} />
            Ramme: {store.spentCost + store.draftCost}/6 mynter
          </div>
        </div>
      </div>
      <ClockPanel store={store} />
    </section>
  );
});

function ClockPanel({ store }: { store: BlueprintStore }) {
  const greteStages = [
    'Grete bærer alt',
    'Grete blir sliten',
    'Grete avlyser',
    'Grete er innlagt',
    'Grete er død',
  ];
  return (
    <aside className="blueprint-frame h-fit bg-[#ece7d8] p-4">
      <FrameTitle title="Klokker" meta="Fylles · går ikke tilbake" compact />
      <ClockRow
        name="Grete tilgjengelig"
        question={
          store.progress.greteStage <= 2
            ? 'Hvor lenge bærer hun?'
            : `${greteStages[store.progress.greteStage - 1]}.`
        }
        value={store.progress.greteStage}
        size={5}
      />
      {store.progress.enactedTiltakIds.includes('t_bostotte') ? (
        <ClockPair
          name="Bostøtte sak"
          question="Kan kommunen skape et lovlig grunnlag for husleien?"
          goodLabel="Søknad komplett"
          good={store.progress.clocks.ck_bostotte.good}
          goodSize={4}
          badLabel="Frist glipper"
          bad={store.progress.clocks.ck_bostotte.bad}
          badSize={4}
        />
      ) : null}
      {store.progress.documents.doc_frank_tlf ? (
        <ClockPair
          name="Gretes arbeid overføres"
          question="Er funksjonene hun bar identifisert og flyttet?"
          goodLabel="Funksjoner overført"
          good={store.progress.clocks.ck_overfort.good}
          goodSize={6}
          badLabel="Alt går via Grete"
          bad={store.progress.clocks.ck_overfort.bad}
          badSize={6}
        />
      ) : null}
      {store.progress.enactedTiltakIds.some((id) => blueprintTiltak[id]?.slot === 's3') ? (
        <ClockPair
          name="Skjør rutine"
          question="Tåler én rutine å bli båret av Elling?"
          goodLabel="Rutine tåler støtte"
          good={store.progress.clocks.ck_rutine.good}
          goodSize={4}
          badLabel="Presset for hardt"
          bad={store.progress.clocks.ck_rutine.bad}
          badSize={4}
        />
      ) : null}
      {store.progress.documents.doc_huseier ? (
        <ClockPair
          name="Husleierestanse"
          question="Blir leieproblemet aktiv sak før støtte er på plass?"
          badLabel="Restanse bygges"
          bad={store.progress.clocks.ck_restanse.bad}
          badSize={6}
        />
      ) : null}
    </aside>
  );
}

function ClockPair({
  name,
  question,
  goodLabel,
  good = 0,
  goodSize = 0,
  badLabel,
  bad = 0,
  badSize = 0,
}: {
  name: string;
  question: string;
  goodLabel?: string;
  good?: number;
  goodSize?: number;
  badLabel?: string;
  bad?: number;
  badSize?: number;
}) {
  return (
    <div className="mb-4">
      <div className="font-bold">{name}</div>
      <p className="mb-2 text-sm text-[#6b6259]">{question}</p>
      {goodLabel ? <SegRow label={goodLabel} value={good} size={goodSize} tone="good" /> : null}
      {badLabel ? <SegRow label={badLabel} value={bad} size={badSize} tone="bad" /> : null}
    </div>
  );
}

function ClockRow({
  name,
  question,
  value,
  size,
}: {
  name: string;
  question: string;
  value: number;
  size: number;
}) {
  return (
    <div className="mb-4">
      <div className="font-bold">{name}</div>
      <p className="mb-2 text-sm text-[#6b6259]">{question}</p>
      <SegRow label="scenario" value={value} size={size} tone="neutral" />
    </div>
  );
}

function SegRow({
  label,
  value,
  size,
  tone,
}: {
  label: string;
  value: number;
  size: number;
  tone: 'good' | 'bad' | 'neutral';
}) {
  return (
    <div className="mb-1 flex items-center justify-between gap-3">
      <span className="text-[10px] uppercase tracking-[0.12em] text-[#6b6259]">{label}</span>
      <span className="flex gap-1">
        {Array.from({ length: size }, (_, index) => (
          <span key={index} className={clsx('blueprint-seg', index < value && `fill-${tone}`)} />
        ))}
      </span>
    </div>
  );
}

const FrankBoard = observer(function FrankBoard({ store }: { store: BlueprintStore }) {
  return (
    <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="blueprint-frame p-4">
        <FrameTitle
          title="Send Frank"
          meta={`1 handling per oppdrag · ${store.progress.actions} igjen i dag`}
          compact
        />
        {store.availableDispatches.length ? (
          <div className="grid gap-3">
            {store.availableDispatches.map((dispatch) => (
              <article
                key={dispatch.id}
                className="rounded border-2 border-[#2a2520] bg-[#f5f1e8] p-3"
              >
                <h3 className="font-bold">{dispatch.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#6b6259]">
                  {dispatch.description}
                </p>
                <button
                  className="blueprint-button mt-3"
                  type="button"
                  aria-label={dispatch.title}
                  data-testid={`blueprint-dispatch-${dispatch.id}`}
                  disabled={store.progress.actions < 1}
                  onClick={() => store.runDispatch(dispatch.id)}
                >
                  <Send size={16} />
                  Send · {dispatch.title}
                </button>
              </article>
            ))}
          </div>
        ) : (
          <p className="py-10 text-lg font-semibold text-[#6b6259]">
            Ingen oppdrag akkurat nå. Saken må gi Frank noe å gjøre.
          </p>
        )}
      </div>
      <div className="blueprint-frame p-4">
        <FrameTitle title="Samtale med Frank" meta="Han siterer det han så" compact />
        <div className="mb-4 grid max-h-[420px] gap-3 overflow-y-auto pr-1">
          {store.progress.chatLog.length ? (
            store.progress.chatLog.map((message, index) => (
              <div
                key={index}
                className={clsx('max-w-[88%]', message.who === 'Deg' && 'ml-auto text-right')}
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6b6259]">
                  {message.who}
                </div>
                <div className="rounded-md border-2 border-[#2a2520] bg-[#f5f1e8] p-3 text-left text-lg leading-snug">
                  <RunText runs={message.runs} store={store} />
                </div>
              </div>
            ))
          ) : (
            <p className="text-[#a49a8c]">Spørsmålene låses opp av sakens fakta.</p>
          )}
        </div>
        <div className="grid gap-2">
          {store.askableFrankPrompts.map((prompt) => (
            <button
              key={prompt.id}
              className="blueprint-button justify-start text-left normal-case"
              type="button"
              onClick={() => store.askFrank(prompt.id)}
            >
              <MessageSquare size={16} />
              {prompt.question}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
});

const ApartmentBoard = observer(function ApartmentBoard({ store }: { store: BlueprintStore }) {
  const sim = store.progress.sim;
  if (sim.visitLevel === 0) {
    return (
      <section className="grid min-h-[520px] place-items-center text-center">
        <div className="blueprint-frame max-w-xl p-8">
          <Home className="mx-auto mb-4" size={32} />
          <p className="text-2xl font-semibold">Kommunen har ikke innsyn i leiligheten ennå.</p>
          <p className="mt-3 text-sm leading-relaxed text-[#6b6259]">
            Et hjemmebesøk er den eneste veien inn. Det avtales gjennom Grete, foreløpig.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="grid content-start gap-4">
        <div className="blueprint-frame p-4">
          <FrameTitle
            title="Elling · anslag"
            meta={
              sim.visitLevel === 2 ? 'Løpende · Frank har kanal inn' : 'Sist observert ved besøk'
            }
            compact
          />
          <NeedBar label="Mat" value={sim.needs.hunger} />
          <NeedBar label="Krefter" value={sim.needs.energy} />
          <NeedBar label="Kontakt" value={sim.needs.social} />
          <NeedBar label="Trygghet" value={sim.needs.security} />
        </div>
        <div className="blueprint-frame p-4">
          <FrameTitle title="Leiligheten" meta="Gabels gate 14 · 4. etasje" compact />
          <AptObject
            label="Postbunken på skoskapet"
            value={`${sim.mail} brev`}
            warn={sim.mail > 11}
          />
          <AptObject
            label="Middagsbokser i kjøleskapet"
            value={Math.max(0, sim.foodBoxes)}
            warn={sim.foodBoxes <= 1}
          />
          <AptObject label="Ubesvarte anrop" value={sim.unanswered} warn={sim.unanswered > 4} />
          <AptObject label="Døren" value={sim.doorOpened ? 'går opp for Frank' : 'lukket'} />
          <AptObject label="Gretes stol" value="pleddet brettet" />
        </div>
      </div>
      <div className="blueprint-frame reg-notat p-4">
        <FrameTitle
          title="Logg · det kommunen vet"
          meta={sim.visitLevel === 2 ? 'Daglig' : 'Fragmentarisk'}
          compact
        />
        <div className="grid gap-3 text-xl leading-relaxed">
          {sim.log.length ? (
            Object.entries(
              sim.log.reduce<Record<string, typeof sim.log>>((groups, entry) => {
                (groups[entry.day] ??= []).push(entry);
                return groups;
              }, {}),
            ).map(([day, entries]) => (
              <div key={day}>
                <div className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-[#c86244]">
                  Dag {day} · {blueprintDayName(Number(day)).split('.')[0]}
                </div>
                {entries.map((entry, index) => (
                  <p
                    key={`${entry.text}-${index}`}
                    className={entry.kind === 'tiltak' ? 'text-[#7a6420]' : undefined}
                  >
                    {entry.factId ? (
                      <RunText runs={[{ text: entry.text, factId: entry.factId }]} store={store} />
                    ) : (
                      entry.text
                    )}
                  </p>
                ))}
              </div>
            ))
          ) : (
            <p>Ingen observasjoner ennå.</p>
          )}
        </div>
      </div>
    </section>
  );
});

function NeedBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="mb-3 grid grid-cols-[72px_1fr_36px] items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#6b6259]">{label}</span>
      <span className="h-4 overflow-hidden rounded border-2 border-[#2a2520] bg-[#f5f1e8]">
        <span
          className={clsx(
            'block h-full border-r-2 border-[#2a2520]',
            value < 25 ? 'bg-[#c86244]' : value < 45 ? 'bg-[#c89a2e]' : 'bg-[#7aa66f]',
          )}
          style={{ width: `${value}%` }}
        />
      </span>
      <span className="text-right text-xs text-[#6b6259]">~{Math.round(value)}</span>
    </div>
  );
}

function AptObject({ label, value, warn }: { label: string; value: ReactNode; warn?: boolean }) {
  return (
    <div className="flex justify-between gap-3 border-b border-dashed border-[#a49a8c] py-2 text-sm">
      <span>{label}</span>
      <span className={clsx('text-lg font-black', warn && 'text-[#c86244]')}>{value}</span>
    </div>
  );
}

const FactDialog = observer(function FactDialog({ store }: { store: BlueprintStore }) {
  const fact = store.selectedFact;
  if (!fact) return null;
  const source = store.documentEntries.find(({ document }) =>
    document.blocks.some((block) => block.runs.some((run) => run.factId === fact.id)),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1510]/50 p-4">
      <article className="blueprint-reader w-full max-w-lg p-5">
        <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#6b6259]">
          <span className="blueprint-domain-icon">{domainIcon[fact.domain]}</span>
          {fact.domain} · {fact.category} · dag {store.progress.facts[fact.id]?.day}
        </div>
        <h2 className="mt-2 text-2xl font-semibold leading-tight">{fact.text}</h2>
        <p className="mt-2 text-sm italic text-[#6b6259]">«{fact.quote}»</p>
        <FactRelation title="Henger sammen med">
          {fact.supports
            .filter((questionId) => store.progress.questions[questionId])
            .map((questionId) => (
              <button
                key={questionId}
                className="block border-b border-dashed border-[#a49a8c] py-1 text-left"
                type="button"
                onClick={() => {
                  store.closeFact();
                  store.showSurface('sporsmal');
                }}
              >
                ? {blueprintQuestions[questionId].title}
              </button>
            ))}
        </FactRelation>
        <FactRelation title="Kan drøftes med">
          {fact.discuss.map((person) =>
            person === 'Frank' ? (
              <button
                key={person}
                className="block border-b border-dashed border-[#a49a8c] py-1 text-left"
                type="button"
                onClick={() => {
                  store.closeFact();
                  store.showSurface('frank');
                }}
              >
                ☎ Frank
              </button>
            ) : (
              <span key={person} className="block py-1 text-[#a49a8c]">
                {store.progress.greteStage >= 5 ? '✝' : '○'} Grete
                {store.progress.greteStage >= 5 ? ' — ikke lenger mulig' : ' — senere'}
              </span>
            ),
          )}
        </FactRelation>
        {source ? (
          <FactRelation title="Kilde">
            <button
              className="block border-b border-dashed border-[#a49a8c] py-1 text-left"
              type="button"
              onClick={() => {
                store.closeFact();
                store.openDocument(source.id);
              }}
            >
              ▤ {source.document.title}
            </button>
          </FactRelation>
        ) : null}
        <div className="mt-5 text-right">
          <button className="blueprint-button quiet" type="button" onClick={store.closeFact}>
            Lukk
          </button>
        </div>
      </article>
    </div>
  );
});

function FactRelation({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-[#6b6259]">{title}</h3>
      <div className="text-sm">{children}</div>
    </div>
  );
}

const Notices = observer(function Notices({ store }: { store: BlueprintStore }) {
  useEffect(() => {
    if (!store.notices.length) return;
    const timer = window.setTimeout(() => {
      for (const notice of store.notices) store.dismissNotice(notice.id);
    }, 5_200);
    return () => window.clearTimeout(timer);
  }, [store, store.notices]);

  if (!store.notices.length) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 grid max-w-sm gap-2">
      {store.notices.map((notice) => (
        <button
          key={notice.id}
          className={clsx(
            'blueprint-toast text-left',
            notice.kind === 'hypothesis' && 'hypo',
            notice.kind === 'day' && 'day',
          )}
          type="button"
          onClick={() => {
            if (notice.kind === 'fact') store.showSurface('fakta');
            if (notice.kind === 'hypothesis') store.showSurface('sporsmal');
            if (notice.kind === 'day') store.showSurface('pulten');
            store.dismissNotice(notice.id);
          }}
        >
          <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#6b6259]">
            {notice.tag}
          </span>
          <span className="block text-lg font-semibold leading-snug">{notice.text}</span>
        </button>
      ))}
    </div>
  );
});

const Reflection = observer(function Reflection({ store }: { store: BlueprintStore }) {
  const end = store.progress.endText;
  if (!end) return null;
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-[#382f26] p-4">
      <section className="blueprint-story-card w-full max-w-2xl p-7">
        <div className="mb-4 text-center text-xs font-bold uppercase tracking-[0.24em] text-[#6b6259]">
          Dag 8 · saken fortsetter
        </div>
        <div className="grid gap-3 text-base leading-relaxed">
          <p>{end.para1}</p>
          <p>{end.para2}</p>
        </div>
        <div className="my-5 grid gap-1">
          <SegRow
            label="søknad komplett"
            value={store.progress.clocks.ck_bostotte.good}
            size={4}
            tone="good"
          />
          <SegRow
            label="frist glipper"
            value={store.progress.clocks.ck_bostotte.bad}
            size={4}
            tone="bad"
          />
          <SegRow
            label="funksjoner overført"
            value={store.progress.clocks.ck_overfort.good}
            size={6}
            tone="good"
          />
          <SegRow
            label="alt gikk via Grete"
            value={store.progress.clocks.ck_overfort.bad}
            size={6}
            tone="bad"
          />
          <SegRow
            label="rutine tåler støtte"
            value={store.progress.clocks.ck_rutine.good}
            size={4}
            tone="good"
          />
          <SegRow
            label="presset for hardt"
            value={store.progress.clocks.ck_rutine.bad}
            size={4}
            tone="bad"
          />
          <SegRow
            label="restanse bygges"
            value={store.progress.clocks.ck_restanse.bad}
            size={6}
            tone="bad"
          />
        </div>
        <p className="text-2xl font-semibold leading-snug">{end.closing}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button className="blueprint-button quiet" type="button" onClick={store.closeReflection}>
            Se på saken
          </button>
          <button className="blueprint-button primary" type="button" onClick={store.resetBlueprint}>
            <RotateCcw size={16} />
            Start på nytt
          </button>
        </div>
      </section>
    </div>
  );
});

function FrameTitle({ title, meta, compact }: { title: string; meta: string; compact?: boolean }) {
  return (
    <div
      className={clsx(
        'mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-[#2a2520] pb-2',
        compact && 'mb-3',
      )}
    >
      <h2 className="text-sm font-black uppercase tracking-[0.14em]">{title}</h2>
      <span className="text-[10px] uppercase tracking-[0.14em] text-[#6b6259]">{meta}</span>
    </div>
  );
}
