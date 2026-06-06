import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import {
  phoneActivityClocks,
  phoneApproaches,
  phonePressureObjects,
  phoneSupportModes,
  telefonAversjon,
} from '../content/phonePractice';
import type {
  AttemptResult,
  EllingPosition,
  FrankPosition,
  FrankStance,
  PhoneApproachId,
  PressureId,
  RoomState,
  ScriptState,
  SupportModeId,
} from '../domain/types';
import { useRootStore } from '../stores/RootStore';

const frankStances: FrankStance[] = ['soft', 'matter_of_fact', 'pushy'];
const frankPositions: Array<{ id: FrankPosition; label: string; note: string }> = [
  {
    id: 'near_phone',
    label: 'Ved telefonen',
    note: 'Frank kan hjelpe, men forsøket får publikum',
  },
  {
    id: 'seated_away',
    label: 'I stolen unna',
    note: 'Frank er til stede uten å gjøre forsøk av det',
  },
  {
    id: 'absent_setup',
    label: 'Legger rommet klart',
    note: 'Frank legger fram første steg og lar Elling prøve alene',
  },
];

const pressureCopy: Record<PressureId, string> = {
  restlessness: 'stolen han ikke blir sittende i',
  shame: 'manuset som ble lagt bort',
  sleep_debt: 'den dårlige natten i rommet',
  unpaid_bill: 'brevet under avisen',
  hope: 'Gretes nummer ved telefonen',
  phone_fear: 'telefonen på sidebordet',
  dignity_exposure: 'Frank som publikum',
};

const outcomeCopy: Record<string, string> = {
  retreat: 'soveromsdøren vant',
  anger_retreat: 'sinne vendt mot Frank',
  pomp_defense: 'prinsippsak i stuen',
  annoyed_compliance: 'motvillig berøring',
  partial_practice: 'ble ved telefonen',
  completed_practice: 'én kort samtale',
};

const scriptCopy: Record<ScriptState, string> = {
  missing: 'manuset mangler',
  placed: 'manus ved telefonen',
  used: 'manuset ble brukt',
  ignored: 'manuset ble liggende',
};

const frankPositionCopy: Record<FrankPosition, string> = {
  near_phone: 'Frank står ved telefonen',
  seated_away: 'Frank sitter unna',
  absent_setup: 'Frank har gått ut',
};

const frankStanceCopy: Record<FrankStance, string> = {
  soft: 'rolig',
  matter_of_fact: 'nøktern',
  pushy: 'for tydelig',
};

const anchorCopy: Record<string, string> = {
  phone: 'telefonbordet',
  chair: 'lesestolen',
  sofa: 'sofaen',
  bedroom: 'soverommet',
  desk: 'kjøkkenbordet',
};

const actorCopy: Record<string, string> = {
  Frank: 'Frank',
  Elling: 'Elling',
  Phone: 'Telefonen',
  Room: 'Stua',
};

const initialConcernDocumentLabel = 'Bekymringsmelding';
const initialConcernObjective = 'Etabler kontakt med Grete';
const initialConcernAction = 'Ring Grete';
const firstContactReportTitle = 'Frankrapport · Første kontakt';
const requestFinancialStatementAction = 'Be om kontoutskrift';
const scheduleSocialVisitAction = 'Avtal sosialt besøk';

const frictionCopy: Record<string, string> = {
  'dignity preserved through ridicule': 'verdighet bevart gjennom latterliggjøring',
  'first step possible, conversation still too large': 'første steg mulig, samtalen for stor',
  'competence-test anger': 'det ble en prøve i å være flink',
  'low overskudd / refusal spiral': 'lite overskudd, rask retrett',
  'room withdrawal': 'rommet trakk seg sammen',
  'Frank proximity turned practice into an exam': 'Frank sto for nært',
  'pointlessness defense': 'oppgaven ble gjort meningsløs',
  'script support visible': 'manuset ligger ved telefonen',
  'setup changed': 'Frank endret rommet',
  'Frank too close?': 'Frank står kanskje for nært',
  'new day / fresh capacity': 'ny dag, litt nytt rom',
  'Grete still carries the doorway': 'Grete bærer fortsatt døråpningen',
  unknown: 'rommet venter',
};

function pct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export const PhonePracticeLab = observer(function PhonePracticeLab() {
  const store = useRootStore();
  const latest = store.latestAttempt;
  const activeRoom = store.activeRoom;

  return (
    <div className="min-h-screen bg-base-300 text-base-content">
      <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
        <header className="card border border-base-content/10 bg-base-100 shadow-2xl">
          <div className="card-body gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-accent">
                Lifelines Design Lab / M2
              </p>
              <h1 className="text-4xl font-black tracking-tight md:text-5xl">
                Telefonøving i stua
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-base-content/70">
                Bekymringsmelding, hjemmebesøk, telefonøving og rapporter på pulten.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="badge badge-lg badge-neutral">Dag {store.day}</div>
              <div className="badge badge-lg badge-info">Handlinger {store.dayActions}/2</div>
              <button className="btn btn-outline btn-accent" onClick={() => store.rollNewDay()}>
                Ny dag
              </button>
              <button className="btn btn-outline" onClick={() => store.reset()}>
                Nullstill
              </button>
            </div>
          </div>
        </header>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className={clsx('btn', store.labMode === 'apartment' ? 'btn-primary' : 'btn-outline')}
            onClick={() => store.setLabMode('apartment')}
          >
            Apartment clocks
          </button>
          <button
            className={clsx('btn', store.labMode === 'desk' ? 'btn-primary' : 'btn-outline')}
            onClick={() => store.setLabMode('desk')}
          >
            Case Desk
          </button>
        </div>

        {store.labMode === 'apartment' ? (
          <main className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_0.9fr]">
            <Panel className="min-h-[660px] self-start">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <SectionTitle>Stua</SectionTitle>
                  <p className="text-sm text-base-content/60">Stue, telefonbord og soveromsdør.</p>
                </div>
                <RoomPills room={activeRoom} />
              </div>
              <ApartmentStage
                room={activeRoom}
                carriedWeaknesses={latest?.supportAnalysis.carriedWeaknesses ?? []}
              />
              {activeRoom.bark ? (
                <div className="alert alert-info mt-4 border-info/30 bg-info/10 text-info-content">
                  <span>{activeRoom.bark}</span>
                </div>
              ) : null}
            </Panel>

            <div className="grid content-start gap-4">
              <Panel>
                <SectionTitle>1. Frank i rommet</SectionTitle>
                <div className="grid gap-2">
                  {frankPositions.map((position) => (
                    <button
                      key={position.id}
                      className={clsx(
                        'btn h-auto justify-start rounded-box px-4 py-3 text-left normal-case',
                        store.frankPosition === position.id
                          ? 'btn-primary'
                          : 'btn-ghost bg-base-200',
                      )}
                      onClick={() => store.setFrankPosition(position.id)}
                    >
                      <span className="grid gap-1">
                        <strong>{position.label}</strong>
                        <span className="text-xs font-normal opacity-70">{position.note}</span>
                      </span>
                    </button>
                  ))}
                  <button
                    className={clsx(
                      'btn mt-1',
                      store.scriptState === 'placed' || store.scriptState === 'used'
                        ? 'btn-secondary'
                        : 'btn-outline btn-secondary',
                    )}
                    onClick={() => store.placeScript()}
                    disabled={store.scriptState === 'used'}
                  >
                    {scriptButtonLabel(store.scriptState)}
                  </button>
                </div>
              </Panel>

              <Panel>
                <SectionTitle>2. Støtten Frank gir</SectionTitle>
                <p className="mb-3 text-xs leading-relaxed text-base-content/60">
                  Velg to former for hjelp. Noe blir lettere i dag, men ikke alt kan ryddes bort med
                  et godt ment forslag.
                </p>
                <div className="grid gap-2">
                  {phoneSupportModes.map((support) => {
                    const selected = store.selectedSupportIds.includes(support.id);
                    return (
                      <button
                        key={support.id}
                        className={clsx(
                          'btn h-auto justify-start rounded-box px-4 py-3 text-left normal-case',
                          selected ? 'btn-accent text-accent-content' : 'btn-ghost bg-base-200',
                        )}
                        onClick={() => store.toggleSupport(support.id)}
                      >
                        <span className="grid gap-1">
                          <strong>{support.label}</strong>
                          <span className="text-xs font-normal leading-relaxed opacity-75">
                            {support.good}
                          </span>
                          <span className="text-[0.68rem] font-normal uppercase tracking-wider opacity-60">
                            står åpent: {support.risk}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <SupportTopology selectedIds={store.selectedSupportIds} />
              </Panel>

              <Panel>
                <SectionTitle>3. Første telefonsteg</SectionTitle>
                <div className="grid gap-2">
                  {phoneApproaches.map((approach) => (
                    <button
                      key={approach.id}
                      className={clsx(
                        'btn h-auto justify-start rounded-box border-base-content/10 px-4 py-3 text-left normal-case',
                        approach.id === store.selectedApproachId
                          ? 'btn-accent text-accent-content'
                          : 'btn-ghost bg-base-200 hover:bg-base-100',
                      )}
                      onClick={() => store.setApproach(approach.id)}
                    >
                      <span className="grid gap-1">
                        <strong>{approach.label}</strong>
                        <span className="text-xs font-normal leading-relaxed opacity-70">
                          {approach.description}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </Panel>

              <Panel>
                <SectionTitle>4. Bruk en terning</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {store.dicePool.map((die) => (
                    <button
                      key={die.id}
                      className={clsx(
                        'btn btn-square text-xl font-black',
                        die.used && 'btn-disabled opacity-35',
                        !die.used && store.selectedDieId === die.id && 'btn-primary',
                        !die.used && store.selectedDieId !== die.id && 'btn-outline',
                      )}
                      onClick={() => store.selectDie(die.id)}
                      disabled={die.used}
                    >
                      {die.face}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-base-content/60">
                  Terningen hjelper forsøket i gang. Rommet avgjør fortsatt hvor langt det går.
                </p>
                <select
                  className="select select-bordered mt-4 w-full"
                  value={store.frankStance}
                  onChange={(event) => store.setFrankStance(event.target.value as FrankStance)}
                >
                  {frankStances.map((stance) => (
                    <option key={stance} value={stance}>
                      Frank: {frankStanceCopy[stance]}
                    </option>
                  ))}
                </select>
                <button
                  className="btn btn-success mt-4 w-full"
                  onClick={() => store.runAttempt()}
                  disabled={!store.selectedDie}
                >
                  Prøv telefonen {store.attempts.length + 1}
                </button>
              </Panel>

              <Panel>
                <SectionTitle>Hva Elling kan øve på</SectionTitle>
                <div className="grid gap-4">
                  <Meter label="Overskudd" value={store.client.overskudd} />
                  <Meter label="Tillit" value={store.client.trust} />
                  <Meter label="Telefonøving" value={store.client.phoneMastery} />
                </div>
                <div className="mt-5 rounded-box border border-secondary/30 border-l-4 bg-base-200 p-4 shadow-inner">
                  <span className="badge badge-secondary badge-sm font-bold uppercase tracking-wider">
                    {anchorCopy[telefonAversjon.anchor]}
                  </span>
                  <h3 className="mt-3 text-lg font-bold">{telefonAversjon.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-base-content/70">
                    {telefonAversjon.description}
                  </p>
                </div>
                <h3 className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-base-content/50">
                  Øvingsstier
                </h3>
                <div className="mt-3 grid gap-3">
                  {phoneActivityClocks.map((clock) => (
                    <ActivityClockCard
                      key={clock.id}
                      clock={clock}
                      filledOverride={
                        clock.tone === 'complication'
                          ? store.phoneComplicationClockProgress
                          : store.phonePracticeClockProgress
                      }
                    />
                  ))}
                </div>
                <h3 className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-base-content/50">
                  Det Frank følger med på
                </h3>
                <div className="mt-3 grid gap-2">
                  {phonePressureObjects.map((pressure) => (
                    <PressureObjectCard key={pressure.id} pressure={pressure} />
                  ))}
                </div>
              </Panel>
            </div>

            <Panel className="xl:col-span-2">
              <SectionTitle>Det som skjedde i rommet</SectionTitle>
              {!latest ? (
                <EmptyState>
                  Ingen forsøk ennå. Plasser Frank, legg fram litt hjelp, velg et beskjedent krav og
                  bruk en terning.
                </EmptyState>
              ) : (
                <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                  <ol className="grid gap-3">
                    {latest.beats.map((beat) => (
                      <li
                        key={beat.id}
                        data-anchor={beat.anchor}
                        className="rounded-box border border-base-content/10 bg-base-200 p-4"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="badge badge-accent badge-sm">
                            {actorCopy[beat.actor]}
                          </span>
                          <strong>{beat.label}</strong>
                          <span className="badge badge-ghost badge-sm">{beat.friction}</span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-base-content/70">
                          {beat.text}
                        </p>
                        {beat.bark ? <p className="mt-2 italic text-accent">{beat.bark}</p> : null}
                      </li>
                    ))}
                  </ol>
                  <div>
                    <div className={outcomeBadgeClass(latest.outcomeClass)}>
                      Det som skjedde: {outcomeCopy[latest.outcome]} / rommet holdt{' '}
                      {pct(latest.readiness)}
                    </div>
                    <ul className="mt-4 grid gap-y-2 text-sm text-base-content/80">
                      {latest.evidence.map((item) => (
                        <li key={`${item.id}-${item.value}`} className="flex justify-between gap-4">
                          <span>{item.label}</span>
                          <b className="text-right text-base-content">
                            {evidenceValueCopy(item.value)}
                          </b>
                        </li>
                      ))}
                    </ul>
                    <blockquote className="mt-5 rounded-box border-l-4 border-accent bg-base-200 p-4 text-base-content/80">
                      {latest.frankReport}
                    </blockquote>
                    <h3 className="mt-5 text-lg font-bold">Neste forsøk</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {latest.nextApproachIds.map((id) => {
                        const approach = phoneApproaches.find((item) => item.id === id)!;
                        return (
                          <button
                            key={id}
                            className="btn btn-outline btn-accent"
                            onClick={() => store.chooseNextApproach(id as PhoneApproachId)}
                          >
                            {approach.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </Panel>
          </main>
        ) : store.labMode === 'frank_call' ? (
          <GreteCallSurface />
        ) : (
          <CaseDeskSurface />
        )}
      </div>
    </div>
  );
});

const GreteCallSurface = observer(function GreteCallSurface() {
  const store = useRootStore();

  return (
    <main className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <Panel>
        <SectionTitle>Frank på telefon</SectionTitle>
        <p className="text-sm leading-relaxed text-base-content/65">
          Frank ringer fra kontoret. Grete tar telefonen.
        </p>
        <div className="mt-5 rounded-box border border-success/30 bg-success/10 p-5">
          <div className="flex items-center gap-3">
            <div className="avatar placeholder">
              <div className="w-14 rounded-full bg-success text-success-content">
                <span>F</span>
              </div>
            </div>
            <div>
              <div className="font-bold">Frank ringer Grete</div>
              <div className="text-xs uppercase tracking-[0.18em] text-base-content/50">
                Telefonsamtale · obskurert
              </div>
            </div>
          </div>
          <div className="mt-5 grid gap-3 text-sm">
            <SpeechBubble side="left" label="Frank">
              Hei, dette er Frank Åsli. Jeg ringer fra sosialkontoret.
            </SpeechBubble>
            <SpeechBubble side="right" label="Grete">
              <span aria-label="obskurert samtale">☕ … … “smart gutt” … døråpning …</span>
            </SpeechBubble>
            <SpeechBubble side="left" label="Frank">
              Vi trenger bare å forstå hverdagen litt bedre. Ikke mer enn det.
            </SpeechBubble>
            <SpeechBubble side="right" label="Grete">
              <span aria-label="obskurert samtale">… passer på … ikke så lett … blir her …</span>
            </SpeechBubble>
          </div>
        </div>
      </Panel>

      <Panel>
        <SectionTitle>Telefonnotat</SectionTitle>
        <div className="grid gap-3 text-sm leading-relaxed text-base-content/75">
          <p>Grete svarte selv. Samtalen ble ført med henne. Elling kom ikke til telefonen.</p>
          <div className="rounded-box border border-warning/30 bg-warning/10 p-4">
            <div className="font-bold">Ny rapport</div>
            <p className="mt-1">{firstContactReportTitle}</p>
          </div>
        </div>
        <button className="btn btn-success mt-5" onClick={() => store.completeGreteCall()}>
          Legg rapporten på pulten
        </button>
      </Panel>
    </main>
  );
});

function SpeechBubble({
  children,
  label,
  side,
}: {
  children: React.ReactNode;
  label: string;
  side: 'left' | 'right';
}) {
  return (
    <div className={clsx('chat', side === 'left' ? 'chat-start' : 'chat-end')}>
      <div className="chat-header text-xs text-base-content/55">{label}</div>
      <div className="chat-bubble chat-bubble-primary max-w-md text-sm">{children}</div>
    </div>
  );
}

const CaseDeskSurface = observer(function CaseDeskSurface() {
  const store = useRootStore();
  const latest = store.latestAttempt;
  const selected = new Set(store.selectedDeskEvidenceIds);
  const evidence = latest ? deskEvidenceFromAttempt(latest) : [];
  const hasPracticeSignal = evidence.some(
    (item) => item.id === 'practice_signal' && selected.has(item.id),
  );
  const hasBoundarySignal = evidence.some(
    (item) => item.id === 'boundary_risk' && selected.has(item.id),
  );
  const hasAnyEvidence = selected.size > 0;
  const nextApproach = latest?.nextApproachIds[0] ?? 'tolerate_ringtone';
  const showFirstContactReport = store.firstContactReportVisible && !latest;

  return (
    <main className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
      <Panel>
        <SectionTitle>Case Desk</SectionTitle>
        <p className="text-sm leading-relaxed text-base-content/65">
          Dokumenter, rapporter og notater i saken.
        </p>
        {!latest && !showFirstContactReport ? (
          <div className="mt-4 grid gap-4">
            <article className="rounded-box border border-warning/30 bg-warning/10 p-4">
              <div className="badge badge-warning mb-3">
                Dokument: {initialConcernDocumentLabel}
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-base-content/80">
                <p>
                  <strong>Pasient:</strong> Grete Halvorsen
                  <br />
                  <strong>Gjelder:</strong> Elling Halvorsen (35 år)
                </p>
                <p>
                  Grete oppgir at Elling bor hjemme, hun har 100% omsorg. Hun beskriver ham som “en
                  smart gutt” og ønsker ikke videre tiltak nå.
                </p>
                <p>
                  Lege vurderer at familien kan ha behov for oppfølging dersom Gretes helsetilstand
                  forverres.
                </p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>Etablere kontakt med Grete</li>
                  <li>Kartlegge Ellings hverdag og nettverk</li>
                  <li>Vurdere støtte ved endret omsorgssituasjon</li>
                </ul>
                <p className="text-xs leading-relaxed text-base-content/55 float-end pr-6">
                  Dr. Haug
                </p>
              </div>
            </article>
          </div>
        ) : showFirstContactReport ? (
          <div className="mt-4 grid gap-4">
            <article className="rounded-box border border-base-content/10 bg-base-200 p-4">
              <div className="badge badge-outline mb-3">{firstContactReportTitle}</div>
              <div className="space-y-3 text-sm leading-relaxed text-base-content/80">
                <p>
                  <strong>Observasjon:</strong> Grete svarte raskt og førte samtalen. Hun omtaler
                  Elling som “en smart gutt”.
                </p>
                <p>
                  <strong>Usikkerhet:</strong> Elling deltok ikke direkte. Det er uklart om han
                  kjenner til henvendelsen eller hva han selv forstår av saken.
                </p>
                <p>
                  <strong>Anbefalt:</strong> innhent økonomisk oversikt og avtal et kort sosialt
                  besøk før saken tolkes for hardt.
                </p>
              </div>
            </article>
          </div>
        ) : (
          <div className="mt-4 grid gap-4">
            <article className="rounded-box border border-base-content/10 bg-base-200 p-4">
              <div className="badge badge-outline mb-3">Frank-rapport</div>
              <p className="leading-relaxed text-base-content/80">{latest!.frankReport}</p>
            </article>
            <article className="rounded-box border border-base-content/10 bg-base-200 p-4">
              <div className="badge badge-outline mb-3">Dokument: telefonnotat</div>
              <p className="leading-relaxed text-base-content/75">
                Frank fikk se {outcomeCopy[latest!.outcome]}. Rommet pekte særlig på{' '}
                {frictionCopy[latest!.finalRoom.lastFriction] ?? latest!.finalRoom.lastFriction}.
              </p>
            </article>
          </div>
        )}
        {store.financialStatementVisible ? (
          <article className="mt-4 rounded-box border border-info/30 bg-info/10 p-4">
            <div className="badge badge-info mb-3">Dokument: Kontoutskrift</div>
            <div className="space-y-2 text-sm leading-relaxed text-base-content/80">
              <p>
                Grete betaler husleie, strøm og telefon fra samme konto. Elling har små inntekter
                inn, men ingen faste trekk i eget navn.
              </p>
              <p>
                <strong>Merknad:</strong> Dersom Grete faller bort, blir leiligheten et praktisk
                spørsmål før den blir et omsorgsspørsmål.
              </p>
            </div>
          </article>
        ) : store.financialStatementRequested ? (
          <div className="alert alert-info mt-4 border-info/30 bg-info/10 text-sm">
            <span>Kontoutskrift bestilt. Dokumentet ventes neste dag.</span>
          </div>
        ) : null}
        {store.socialVisitScheduled ? (
          <div className="alert alert-success mt-3 border-success/30 bg-success/10 text-sm">
            <span>Sosialt besøk avtalt. Grete setter fram kaffe før Frank kommer.</span>
          </div>
        ) : null}
        {store.caseLog.length ? (
          <div className="mt-4 rounded-box border border-base-content/10 bg-base-200 p-3">
            <div className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-base-content/50">
              Sakslogg
            </div>
            <ol className="grid gap-1 text-xs leading-relaxed text-base-content/65">
              {store.caseLog.map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ol>
          </div>
        ) : null}
      </Panel>

      <Panel>
        <SectionTitle>Handlinger</SectionTitle>
        {!latest && !showFirstContactReport ? (
          <div className="rounded-box border border-success/30 bg-success/10 p-4">
            <div className="font-black uppercase tracking-[0.18em] text-success">Første mål</div>
            <p className="mt-2 text-sm leading-relaxed text-base-content/75">
              {initialConcernObjective}.
            </p>
            <button
              className="btn btn-success mt-4"
              onClick={() => store.callGreteFromConcernReport()}
            >
              {initialConcernAction}
            </button>
          </div>
        ) : showFirstContactReport ? (
          <div className="grid gap-3">
            <div className="rounded-box border border-success/30 bg-success/10 p-4">
              <div className="font-black uppercase tracking-[0.18em] text-success">
                Nye handlinger
              </div>
              <div className="mt-4 grid gap-2">
                <button
                  className="btn btn-outline btn-success justify-start"
                  type="button"
                  onClick={() => store.requestFinancialStatement()}
                  disabled={
                    store.dayActions <= 0 ||
                    store.financialStatementRequested ||
                    store.financialStatementVisible
                  }
                >
                  {store.financialStatementVisible
                    ? 'Kontoutskrift mottatt'
                    : store.financialStatementRequested
                      ? 'Kontoutskrift bestilt'
                      : requestFinancialStatementAction}
                </button>
                <button
                  className="btn btn-outline btn-success justify-start"
                  type="button"
                  onClick={() => store.scheduleSocialVisit()}
                  disabled={store.dayActions <= 0 || store.socialVisitScheduled}
                >
                  {store.socialVisitScheduled ? 'Sosialt besøk avtalt' : scheduleSocialVisitAction}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-2">
              {evidence.map((item) => (
                <button
                  key={item.id}
                  className={clsx(
                    'btn h-auto justify-start rounded-box px-4 py-3 text-left normal-case',
                    selected.has(item.id)
                      ? 'btn-accent text-accent-content'
                      : 'btn-ghost bg-base-200',
                  )}
                  onClick={() => store.toggleDeskEvidence(item.id)}
                >
                  <span className="grid gap-1">
                    <strong>{item.label}</strong>
                    <span className="text-xs font-normal leading-relaxed opacity-75">
                      {item.text}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              <ClaimBucket
                title="Bekreftet"
                active={hasPracticeSignal}
                text="Telefonøving kan gi en liten faktisk handling, selv når forsøket ser stygt ut."
              />
              <ClaimBucket
                title="Hypotese"
                active={hasBoundarySignal}
                text="Ny kontaktmulighet trenger en grense, ellers blir telefonen neste problem."
              />
              <ClaimBucket
                title="Åpent spørsmål"
                active={hasAnyEvidence && !hasBoundarySignal}
                text="Er dette øving som utvider livet, eller bare en tryggere måte å bli værende inne?"
              />
              <ClaimBucket
                title="Motstrid"
                active={hasPracticeSignal && hasBoundarySignal}
                text="Samme framgang gjør saken vanskeligere: han kan mer, og kan rote seg inn i mer."
              />
            </div>

            <div className="mt-5 rounded-box border border-success/30 bg-success/10 p-4">
              <div className="font-black uppercase tracking-[0.18em] text-success">
                Mulig vedtak
              </div>
              {hasPracticeSignal ? (
                <>
                  <p className="mt-2 text-sm leading-relaxed">
                    Saken tåler et smalere neste steg. Ikke “telefonen er løst” — bare at neste
                    forsøk kan begrunnes med det Frank faktisk så.
                  </p>
                  <button
                    className="btn btn-success mt-4"
                    onClick={() => store.applyDeskVedtak(nextApproach as PhoneApproachId)}
                  >
                    Ta neste tiltak tilbake til Apartment
                  </button>
                </>
              ) : (
                <p className="mt-2 text-sm leading-relaxed text-base-content/65">
                  Løft minst ett konkret bevis før pulten kan anbefale neste tiltak.
                </p>
              )}
            </div>
          </>
        )}
      </Panel>
    </main>
  );
});

function deskEvidenceFromAttempt(latest: AttemptResult): Array<{
  id: string;
  label: string;
  text: string;
}> {
  const happened = outcomeCopy[latest.outcome];
  const items = [
    {
      id: 'practice_signal',
      label: 'Øvingen ga en faktisk handling',
      text: `Frank så ${happened}, ikke bare en mening om telefonen.`,
    },
    {
      id: 'room_friction',
      label: 'Rommet viste hvor det skar seg',
      text: frictionCopy[latest.finalRoom.lastFriction] ?? latest.finalRoom.lastFriction,
    },
  ];
  if (latest.outcomeClass !== 'negative') {
    items.push({
      id: 'boundary_risk',
      label: 'Ny evne trenger ny grense',
      text: 'Når telefonen virker litt, kan den også åpne regning, sexlinje og privat rot.',
    });
  }
  return items;
}

function ClaimBucket({ title, text, active }: { title: string; text: string; active: boolean }) {
  return (
    <div
      className={clsx(
        'rounded-box border p-3 text-sm',
        active
          ? 'border-accent bg-accent/15 text-base-content'
          : 'border-base-content/10 bg-base-200 text-base-content/45',
      )}
    >
      <div className="font-bold">{title}</div>
      <p className="mt-1 leading-relaxed">{text}</p>
    </div>
  );
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={clsx(
        'card min-h-56 border border-base-content/10 bg-base-100 shadow-xl',
        className,
      )}
    >
      <div className="card-body">{children}</div>
    </section>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="card-title mb-2 text-lg">{children}</h2>;
}

function SupportTopology({ selectedIds }: { selectedIds: SupportModeId[] }) {
  const selected = phoneSupportModes.filter((support) => selectedIds.includes(support.id));
  const covered = new Set(selected.flatMap((support) => support.covers));
  const weak = new Set(selected.flatMap((support) => support.weak));
  const all = new Set<PressureId>(
    phoneSupportModes.flatMap((support) => [...support.covers, ...support.weak]),
  );
  const carried = [...all].filter((pressure) => !covered.has(pressure) || weak.has(pressure));

  return (
    <div className="mt-3 rounded-box border border-base-content/10 bg-base-200 p-3 text-xs leading-relaxed">
      <div className="font-bold text-base-content/70">Det planen ikke dekker</div>
      <div className="mt-2 flex flex-wrap gap-1">
        {carried.slice(0, 5).map((pressure) => (
          <span key={pressure} className="badge badge-warning badge-sm capitalize">
            {pressureCopy[pressure]}
          </span>
        ))}
      </div>
      <p className="mt-2 text-base-content/55">
        To typer hjelp kan roe rommet. Noe vanlig trøbbel blir likevel liggende.
      </p>
    </div>
  );
}

function ApartmentStage({
  room,
  carriedWeaknesses,
}: {
  room: RoomState;
  carriedWeaknesses: PressureId[];
}) {
  return (
    <div className="relative mt-4 h-[540px] overflow-hidden rounded-box border-2 border-base-content/20 bg-base-300 shadow-inner">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px)] bg-[length:36px_36px]" />
      <Zone className="left-8 top-10 h-40 w-56" label="telefonbordet" />
      <Zone className="right-12 top-12 h-36 w-56" label="lesestolen" />
      <Zone className="bottom-12 right-16 h-36 w-52" label="soveromsdøra" />
      <StageObject className="left-20 top-24">telefon</StageObject>
      <StageObject
        className={clsx(
          'left-20 top-44 h-10 w-28',
          room.scriptState === 'missing' && 'opacity-30',
          room.scriptState === 'used' && 'border-success bg-success/20 text-success',
          room.scriptState === 'ignored' && 'border-warning bg-warning/20 text-warning',
        )}
      >
        {scriptObjectLabel(room.scriptState)}
      </StageObject>
      <StageObject className="right-28 top-28">stol</StageObject>
      <StageObject
        className={clsx(
          'bottom-20 right-28 w-28',
          room.doorClosed && 'border-error bg-error/20 text-error',
        )}
      >
        {room.doorClosed ? 'lukket dør' : 'soveromsdør'}
      </StageObject>
      <PressureLabel className="left-48 top-10" active={carriedWeaknesses.includes('phone_fear')}>
        terskel
      </PressureLabel>
      <PressureLabel className="right-48 top-44" active={carriedWeaknesses.includes('shame')}>
        skam / verdighet
      </PressureLabel>
      <PressureLabel
        className="bottom-28 right-52"
        active={carriedWeaknesses.includes('sleep_debt')}
      >
        dårlig natt
      </PressureLabel>
      <PressureLabel
        className="left-24 bottom-24"
        active={carriedWeaknesses.includes('unpaid_bill')}
      >
        brevet
      </PressureLabel>
      <Person label="Elling" tone="client" position={ellingPosition(room.ellingPosition)} />
      <Person label="Frank" tone="frank" position={frankPosition(room.frankPosition)} />
    </div>
  );
}

function PressureLabel({
  children,
  className,
  active,
}: {
  children: React.ReactNode;
  className: string;
  active: boolean;
}) {
  return (
    <div
      className={clsx(
        'absolute rounded border px-2 py-1 text-[0.66rem] font-black uppercase tracking-[0.16em] shadow-lg',
        active
          ? 'border-warning bg-warning/25 text-warning-content'
          : 'border-base-content/10 bg-base-100/60 text-base-content/35',
        className,
      )}
    >
      {children}
    </div>
  );
}

function ActivityClockCard({
  clock,
  filledOverride,
}: {
  clock: (typeof phoneActivityClocks)[number];
  filledOverride: number;
}) {
  const filled = Math.min(clock.segments, Math.max(clock.filled, filledOverride));
  return (
    <div
      className={clsx(
        'rounded-box border bg-base-200 p-3',
        clock.tone === 'complication' ? 'border-warning/40' : 'border-base-content/10',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-bold">{clock.label}</h4>
            {clock.tone === 'complication' ? (
              <span className="badge badge-warning badge-sm">nytt problem</span>
            ) : (
              <span className="badge badge-success badge-sm">øving</span>
            )}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-base-content/60">{clock.description}</p>
        </div>
        <div className="flex gap-1">
          {clock.diceSlots.map((slot, index) => (
            <span
              key={`${clock.id}-${slot}-${index}`}
              className={clsx(
                'grid h-7 w-7 place-items-center border text-[0.6rem] font-black uppercase',
                slot === 'safe' && 'border-success bg-success/20 text-success',
                slot === 'risky' && 'border-warning bg-warning/20 text-warning',
                slot === 'empty' && 'border-base-content/30 text-base-content/50',
                slot === 'locked' && 'border-base-content/10 bg-base-300 text-base-content/25',
              )}
            >
              {slot === 'locked' ? '×' : '□'}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-3 grid gap-2">
        {(clock.stages ?? []).map((stage, index) => (
          <div
            key={stage}
            className={clsx(
              'rounded border px-3 py-2 text-xs leading-relaxed',
              index < filled
                ? clock.tone === 'complication'
                  ? 'border-warning/40 bg-warning/15'
                  : 'border-success/40 bg-success/15'
                : 'border-base-content/10 bg-base-100/50 text-base-content/55',
            )}
          >
            <span className="mr-2 font-black">{index < filled ? '●' : '○'}</span>
            {stage}
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-8 gap-1">
        {Array.from({ length: clock.segments }).map((_, index) => (
          <span
            key={index}
            className={clsx(
              'h-2 rounded-full',
              index < filled
                ? clock.tone === 'complication'
                  ? 'bg-warning'
                  : 'bg-accent'
                : 'bg-base-content/15',
            )}
          />
        ))}
      </div>
    </div>
  );
}

function PressureObjectCard({ pressure }: { pressure: (typeof phonePressureObjects)[number] }) {
  return (
    <div className="rounded-box border border-base-content/10 bg-base-200 p-3">
      <div className="flex items-center justify-between gap-2">
        <strong>{pressure.label}</strong>
        <span className="badge badge-outline badge-sm">{anchorCopy[pressure.anchor]}</span>
      </div>
      <progress className="progress progress-warning mt-2 w-full" value={pressure.clock} max={1} />
      <p className="mt-2 text-xs leading-relaxed text-base-content/60">
        Kan bli {pressure.escalatesInto}. Roer seg med {pressure.softenedBy}.
      </p>
    </div>
  );
}

function Zone({ label, className }: { label: string; className: string }) {
  return (
    <div
      className={clsx(
        'absolute rounded-box border border-dashed border-base-content/20 p-3 text-sm text-base-content/40',
        className,
      )}
    >
      {label}
    </div>
  );
}

function StageObject({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        'absolute grid h-16 w-24 place-items-center rounded-box border border-base-content/20 bg-base-100 text-center text-sm shadow-lg transition-all duration-500',
        className,
      )}
    >
      {children}
    </div>
  );
}

function Person({
  label,
  tone,
  position,
}: {
  label: string;
  tone: 'client' | 'frank';
  position: string;
}) {
  return (
    <div
      className={clsx(
        'absolute grid h-20 w-20 place-items-center rounded-full border text-sm font-black shadow-xl transition-all duration-500',
        tone === 'client'
          ? 'border-info/70 bg-info/25 text-info-content'
          : 'border-warning/70 bg-warning/25 text-warning-content',
        position,
      )}
    >
      {label}
    </div>
  );
}

function ellingPosition(position: EllingPosition): string {
  return {
    chair: 'right-72 top-44',
    phone: 'left-36 top-28',
    pace: 'left-1/2 top-64 -translate-x-1/2',
    bedroom_door: 'bottom-24 right-44',
    bedroom: 'bottom-10 right-10 opacity-70',
  }[position];
}

function frankPosition(position: FrankPosition): string {
  return {
    near_phone: 'left-64 top-28',
    seated_away: 'left-1/2 top-72 -translate-x-1/2',
    absent_setup: 'bottom-8 left-8 opacity-40',
  }[position];
}

function RoomPills({ room }: { room: RoomState }) {
  return (
    <div className="flex max-w-xl flex-wrap justify-end gap-2">
      <span className="badge badge-outline">{frankPositionCopy[room.frankPosition]}</span>
      <span
        className={clsx(
          'badge',
          room.scriptState === 'missing' ? 'badge-error' : 'badge-secondary',
        )}
      >
        {scriptCopy[room.scriptState]}
      </span>
      <span className={clsx('badge', room.doorClosed ? 'badge-error' : 'badge-success')}>
        {room.doorClosed ? 'soveromsdøren er lukket' : 'stuen er åpen'}
      </span>
      <span className="badge badge-accent">
        {frictionCopy[room.lastFriction] ?? room.lastFriction}
      </span>
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="rounded-box bg-base-200 p-4 text-base-content/50">{children}</p>;
}

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <b>{pct(value)}</b>
      </div>
      <progress className="progress progress-accent w-full" value={value} max={1} />
    </div>
  );
}

function evidenceValueCopy(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'ja' : 'nei';
  if (typeof value === 'number') return String(value);
  if (typeof value !== 'string') return String(value);
  const approach = phoneApproaches.find((item) => item.id === value);
  return (
    outcomeCopy[value] ??
    scriptCopy[value as ScriptState] ??
    frankPositionCopy[value as FrankPosition] ??
    frictionCopy[value] ??
    approach?.label ??
    value
  );
}

function scriptButtonLabel(scriptState: ScriptState): string {
  if (scriptState === 'used') return 'Manus brukt i forrige forsøk';
  if (scriptState === 'placed') return 'Manus ligger ved telefonen';
  if (scriptState === 'ignored') return 'Legg manuset fram igjen';
  return 'Legg fram telefonmanus';
}

function scriptObjectLabel(scriptState: ScriptState): string {
  if (scriptState === 'missing') return 'uten manus';
  if (scriptState === 'used') return 'brukt manus';
  if (scriptState === 'ignored') return 'manuset ble liggende';
  return 'telefonmanus';
}

function outcomeBadgeClass(outcomeClass: string): string {
  return clsx('badge badge-lg capitalize', {
    'badge-success': outcomeClass === 'positive',
    'badge-warning': outcomeClass === 'neutral',
    'badge-error': outcomeClass === 'negative',
  });
}
