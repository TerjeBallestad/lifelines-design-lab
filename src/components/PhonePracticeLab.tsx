import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import {
  actionCards,
  actionOutcomeCopy,
  actionProbabilities,
  actionRiskCopy,
  adjustedDie,
} from '../content/actionCards';
import { frankQuestions } from '../content/frankQuestions';
import type {
  ActionCard,
  ActionOutcomeClass,
  AttemptResult,
  EllingPosition,
  FrankPosition,
  PhoneApproachId,
  PressureId,
  RoomState,
  ScriptState,
} from '../domain/types';
import { useRootStore } from '../stores/RootStore';


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


const initialConcernDocumentLabel = 'Bekymringsmelding';
const initialConcernObjective = 'Etabler kontakt med Grete';
const initialConcernAction = 'Ring Grete';
const firstContactReportTitle = 'Frankrapport · Første kontakt';
const requestFinancialStatementAction = 'Be om kontoutskrift';
const scheduleSocialVisitAction = 'Avtal sosialt besøk';
const visiblePreDeathActionCards = actionCards.filter((card) => card.id !== 'phone_first_step');

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
                Saken om Elling
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-base-content/70">
                Les saken, gjør ett sakssteg, se hva det faktisk betyr i rommet.
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
            Tiltak i stua
          </button>
          {store.socialVisitScheduled ? (
            <button
              className={clsx(
                'btn',
                store.labMode === 'social_visit' ? 'btn-primary' : 'btn-outline',
              )}
              onClick={() => store.performSocialVisit()}
              disabled={store.socialVisitReportVisible}
            >
              Sosialt besøk
            </button>
          ) : null}
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
                <SectionTitle>Handlingsterninger</SectionTitle>
                <p className="mb-3 text-xs leading-relaxed text-base-content/60">
                  Velg én terning og legg den på ett tiltakskort. Høy terning gir tryggere åpning,
                  men kortet bestemmer hva som står på spill.
                </p>
                <DiceTray />
              </Panel>

              <ActionCardDeck />

              <ActionContextPanel />
            </div>
          </main>
        ) : store.labMode === 'frank_call' ? (
          <GreteCallSurface />
        ) : store.labMode === 'social_visit' ? (
          <SocialVisitSurface />
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

const SocialVisitSurface = observer(function SocialVisitSurface() {
  const store = useRootStore();

  return (
    <main className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <Panel>
        <SectionTitle>Sosialt besøk hos Grete</SectionTitle>
        <p className="text-sm leading-relaxed text-base-content/65">
          Frank kommer inn i leiligheten mens Grete fortsatt gjør rommet praktisk og sosialt
          lesbart.
        </p>
        <div className="relative mt-5 h-[520px] overflow-hidden rounded-box border-2 border-base-content/20 bg-base-300 shadow-inner">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px)] bg-[length:36px_36px]" />
          <Zone className="left-8 top-8 h-36 w-64" label="kjøkkenbordet" />
          <Zone className="right-10 top-10 h-36 w-56" label="lesestolen" />
          <Zone className="bottom-12 right-14 h-36 w-52" label="gangen" />
          <StageObject className="left-20 top-24">kaffe og kopper</StageObject>
          <StageObject className="left-24 top-44 h-12 w-44">post under avisen</StageObject>
          {store.financialStatementVisible ? (
            <StageObject className="left-56 top-44 h-12 w-52">kontoutskrift på benken</StageObject>
          ) : null}
          <StageObject className="right-28 top-28">stol vendt bort</StageObject>
          <Person label="Grete" tone="frank" position="left-28 top-28" />
          <Person label="Frank" tone="frank" position="left-56 top-28" />
          <Person label="Elling" tone="client" position="right-28 bottom-28" />
          <PressureLabel className="left-48 top-12" active>
            omsorgsarbeid
          </PressureLabel>
          <PressureLabel className="left-36 top-56" active>
            uåpnet post
          </PressureLabel>
          <PressureLabel className="right-40 bottom-20" active>
            holder avstand
          </PressureLabel>
        </div>
      </Panel>

      <Panel>
        <SectionTitle>Det Frank ser</SectionTitle>
        <div className="grid gap-3 text-sm leading-relaxed text-base-content/75">
          <div className="rounded-box border border-success/30 bg-success/10 p-4">
            <div className="font-bold">Grete holder samtalen i gang</div>
            <p className="mt-1">
              Hun setter fram kaffe, svarer før Elling rekker å si noe, og oversetter små pauser til
              forklaringer Frank kan bruke.
            </p>
          </div>
          <div className="rounded-box border border-warning/30 bg-warning/10 p-4">
            <div className="font-bold">Elling er til stede, men ikke med</div>
            <p className="mt-1">
              Han blir i utkanten av rommet. Ikke fiendtlig. Ikke trygg. Mest opptatt av at besøket
              skal bli ferdig uten at noen krever en prestasjon.
            </p>
          </div>
          <div className="rounded-box border border-info/30 bg-info/10 p-4">
            <div className="font-bold">Dokumentet får plass i rommet</div>
            <p className="mt-1">
              {store.financialStatementVisible
                ? 'Kontoutskriften ligger fysisk ved posten. Det økonomiske spørsmålet har en adresse i leiligheten.'
                : 'Posten ligger synlig, men Frank mangler fortsatt dokumentet som forklarer hva den betyr.'}
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-box border border-accent/30 bg-accent/10 p-4">
          <div className="font-black uppercase tracking-[0.18em] text-accent">
            Det du legger merke til
          </div>
          <p className="mt-2 text-sm leading-relaxed text-base-content/70">
            Marker én konkret ting i rommet før Frank skriver notat. Senere kan du spørre om han så
            det samme.
          </p>
          <div className="mt-4 grid gap-2">
            {frankQuestions.map((question) => {
              const noticed = store.noticedApartmentEvidenceIds.includes(question.evidenceId);
              return (
                <button
                  key={question.evidenceId}
                  className={clsx(
                    'btn h-auto justify-start rounded-box px-4 py-3 text-left normal-case',
                    noticed ? 'btn-accent text-accent-content' : 'btn-ghost bg-base-200',
                  )}
                  type="button"
                  onClick={() => store.noticeApartmentDetail(question.evidenceId)}
                  disabled={noticed}
                >
                  <span className="grid gap-1">
                    <strong>{question.clueLabel}</strong>
                    <span className="text-xs font-normal opacity-75">{question.roomNotice}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <button className="btn btn-success mt-5" onClick={() => store.completeSocialVisit()}>
          Skriv besøksnotat
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
                Ellings uføretrygd kommer inn på Gretes konto. Hun betaler husleie, strøm og
                telefon derfra, og Elling håndterer ikke de faste trekkene selv.
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
        {store.socialVisitReportVisible ? (
          <article className="mt-4 rounded-box border border-success/30 bg-success/10 p-4">
            <div className="badge badge-success mb-3">Besøksnotat: Gretes rolle i saken</div>
            <div className="space-y-2 text-sm leading-relaxed text-base-content/80">
              <p>
                Frank beskriver ikke et rotete hjem. Han beskriver et hjem som fungerer fordi
                Grete mottar Ellings trygd, betaler regningene og skjermer ham fra hverdagskravene.
              </p>
              <p>
                <strong>Risiko:</strong> Hvis Grete dør, må Elling for første gang prøve å eie økonomien
                og hverdagen sin med støtte fra saken, ikke fra moren.
              </p>
            </div>
          </article>
        ) : null}
        {store.apartmentEvidenceIds.length ? (
          <article className="mt-4 rounded-box border border-accent/30 bg-accent/10 p-4">
            <div className="badge badge-accent mb-3">Bevis fra leiligheten</div>
            <div className="grid gap-2 text-sm leading-relaxed text-base-content/80">
              {store.apartmentEvidenceIds.includes('post_pressure') ? (
                <p>
                  <strong>Grete mottar Ellings trygd:</strong> saken må flytte økonomistøtten fra
                  morens skjerming til Ellings egen mestring.
                </p>
              ) : null}
              {store.apartmentEvidenceIds.includes('elling_distance') ? (
                <p>
                  <strong>Elling mangler hverdagsferdigheter:</strong> regninger, telefoner og
                  avtaler drives fortsatt gjennom Grete.
                </p>
              ) : null}
              {store.apartmentEvidenceIds.includes('grete_load') ? (
                <p>
                  <strong>Grete tror det snart ordner seg:</strong> saken må planlegge for risikoen
                  hun håper ikke kommer.
                </p>
              ) : null}
            </div>
          </article>
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
        <SectionTitle>Neste sakssteg</SectionTitle>
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
                Velg hva Frank gjør nå
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
                {store.socialVisitScheduled && !store.socialVisitReportVisible ? (
                  <button
                    className="btn btn-success justify-start"
                    type="button"
                    onClick={() => store.performSocialVisit()}
                  >
                    Gjennomfør sosialt besøk
                  </button>
                ) : null}
              </div>
            </div>
            {store.socialVisitReportVisible ? (
              <div className="rounded-box border border-accent/30 bg-accent/10 p-4">
                <div className="font-black uppercase tracking-[0.18em] text-accent">
                  Spør Frank om noe du faktisk så
                </div>
                <p className="mt-2 text-sm leading-relaxed text-base-content/70">
                  Velg én ting fra besøket. Frank svarer kort, og svaret kan åpne ett nytt
                  sakssteg.
                </p>
                <div className="mt-4 grid gap-2">
                  {frankQuestions.map((question) => {
                    const noticed = store.noticedApartmentEvidenceIds.includes(question.evidenceId);
                    const asked = store.askedFrankQuestionIds.includes(question.id);
                    return (
                      <button
                        key={question.id}
                        className="btn btn-outline btn-accent h-auto justify-start rounded-box px-4 py-3 text-left normal-case"
                        type="button"
                        onClick={() => store.askFrank(question.id)}
                        disabled={!noticed || asked}
                      >
                        <span className="grid gap-1">
                          <strong>{question.prompt}</strong>
                          <span className="text-xs font-normal opacity-70">
                            {noticed ? question.clueLabel : 'Må legges merke til i rommet først'}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                {store.askedFrankQuestionIds.length ? (
                  <div className="mt-4 grid gap-3">
                    {frankQuestions
                      .filter((question) => store.askedFrankQuestionIds.includes(question.id))
                      .map((question) => (
                        <article
                          key={question.id}
                          className="rounded-box border border-success/30 bg-success/10 p-5 text-sm leading-relaxed"
                        >
                          <div className="flex items-center gap-3">
                            <div className="avatar placeholder">
                              <div className="w-14 rounded-full bg-success text-success-content">
                                <span>F</span>
                              </div>
                            </div>
                            <div>
                              <div className="font-bold">Frank svarer</div>
                              <div className="text-xs uppercase tracking-[0.18em] text-base-content/50">
                                Romobservasjon · samtale
                              </div>
                            </div>
                          </div>
                          <div className="mt-5 grid gap-3">
                            <SpeechBubble side="right" label="Du">
                              {question.prompt}
                            </SpeechBubble>
                            <SpeechBubble side="left" label="Frank">
                              {question.reply}
                            </SpeechBubble>
                          </div>
                          <div className="badge badge-outline mt-4">{question.actionLabel}</div>
                        </article>
                      ))}
                  </div>
                ) : null}
                {store.deskDecisionVisible ? (
                  <div className="mt-5 rounded-box border border-success/30 bg-success/10 p-4">
                    <div className="font-bold">Nytt sakssteg</div>
                    <p className="mt-1 text-sm leading-relaxed">
                      Start med hjelp som flytter én konkret oppgave bort fra Grete uten å ta hjemmet
                      fra Elling.
                    </p>
                    <button
                      className="btn btn-success mt-3"
                      type="button"
                      onClick={() => store.choosePracticalReliefDecision()}
                    >
                      Foreslå praktisk avlastning
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
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
                Mulig neste tiltak
              </div>
              {hasPracticeSignal ? (
                <>
                  <p className="mt-2 text-sm leading-relaxed">
                    Bruk det Frank faktisk så til å velge ett smalere tiltak. Ikke løs hele livet;
                    flytt én oppgave.
                  </p>
                  <button
                    className="btn btn-success mt-4"
                    onClick={() => store.applyDeskVedtak(nextApproach as PhoneApproachId)}
                  >
                    Ta tiltaket tilbake til stua
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
      label: 'Frank så en liten handling',
      text: `Elling kom til punktet: ${happened}. Det er lite, men det er noe Frank kan bygge neste tiltak på.`,
    },
    {
      id: 'room_friction',
      label: 'Rommet viste hva som presset forsøket',
      text: frictionCopy[latest.finalRoom.lastFriction] ?? latest.finalRoom.lastFriction,
    },
  ];
  if (latest.outcomeClass !== 'negative') {
    items.push({
      id: 'boundary_risk',
      label: 'Neste steg trenger en grense',
      text: 'Når en oppgave blir mulig, kan den også bli for stor. Tiltaket må være smalt.',
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

const ActionContextPanel = observer(function ActionContextPanel() {
  const store = useRootStore();
  const selectedCard =
    visiblePreDeathActionCards.find((card) => card.id === store.selectedActionCardId) ??
    visiblePreDeathActionCards[0];

  return (
    <Panel>
      <SectionTitle>Ferdigheter og ramme</SectionTitle>
      <div className="grid gap-3">
        <div className="rounded-box border border-warning/30 bg-warning/10 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.18em] text-warning">
                Ressursramme
              </div>
              <div className="mt-1 text-2xl font-black">14 mynter</div>
            </div>
            <div className="text-right text-xs leading-relaxed text-base-content/60">
              Mynter åpner tiltak.
              <br />
              Terninger bruker dagens handlingsrom.
            </div>
          </div>
        </div>

        <SkillDomainCard
          title="Selvbjerging"
          level={2}
          skills={['Mat', 'Husarbeid', 'Økonomi ?', 'Rutine']}
          activeSkill={selectedCard.skill}
        />
        <SkillDomainCard
          title="Indre liv"
          level={3}
          skills={['Observasjon', 'Skriving', 'Følelsesreg.', 'Refleksjon']}
          activeSkill={selectedCard.skill}
        />
        <SkillDomainCard
          title="Sosialt"
          level={1}
          skills={['Muntlig uttrykk', 'Telefon og ærend ?', 'Tillit']}
          activeSkill={selectedCard.skill}
        />

        <div className="rounded-box border border-base-content/10 bg-base-200 p-3 text-xs leading-relaxed">
          <div className="font-bold">Kortet styrer forsøket</div>
          <p className="mt-1 text-base-content/65">
            Valgt kort: {selectedCard.title}. Dette er før Grete dør, så tiltakene handler om å
            avlaste Grete og beskytte hjemmet — ikke om telefontrening ennå.
          </p>
        </div>
      </div>
    </Panel>
  );
});

function SkillDomainCard({
  title,
  level,
  skills,
  activeSkill,
}: {
  title: string;
  level: number;
  skills: string[];
  activeSkill: string;
}) {
  return (
    <div className="rounded-box border border-base-content/10 bg-base-200 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="font-black uppercase tracking-[0.16em] text-base-content/60">{title}</div>
        <div className="badge badge-secondary">lvl {level}</div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {skills.map((skill) => {
          const active = activeSkill && skill.toLowerCase().includes(activeSkill.toLowerCase());
          return (
            <span key={skill} className={clsx('badge', active ? 'badge-accent' : 'badge-ghost')}>
              {skill}
            </span>
          );
        })}
      </div>
    </div>
  );
}

const DiceTray = observer(function DiceTray() {
  const store = useRootStore();

  return (
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
          title={die.used ? 'Brukt i dag' : `Terning ${die.face}`}
        >
          {die.face}
        </button>
      ))}
    </div>
  );
});

const ActionCardDeck = observer(function ActionCardDeck() {
  const store = useRootStore();
  const selectedDie = store.selectedDie;
  const latest = store.actionResults.slice(-1)[0];

  return (
    <Panel>
      <SectionTitle>Tiltakskort</SectionTitle>
      <div className="mb-4 rounded-box border border-warning/30 bg-warning/10 p-3 text-xs leading-relaxed text-base-content/70">
        Rammen er 14 mynter, men hvert forsøk koster én terning. Mynter åpner tiltak. Terningen
        avgjør hvor god åpningen er akkurat nå.
      </div>
      <div className="grid gap-3">
        {visiblePreDeathActionCards.map((card) => (
          <ActionCardView
            key={card.id}
            card={card}
            selected={store.selectedActionCardId === card.id}
            dieFace={selectedDie?.face}
            onSelect={() => store.selectActionCard(card.id)}
          />
        ))}
      </div>
      <button
        className="btn btn-success mt-4 w-full"
        disabled={!selectedDie}
        onClick={() => store.playSelectedActionCard()}
      >
        Legg terning på valgt kort
      </button>
      {latest ? (
        <div className="mt-4 rounded-box border border-accent/30 bg-accent/10 p-4 text-sm leading-relaxed">
          <div className="font-black uppercase tracking-[0.18em] text-accent">
            Siste kort: {actionOutcomeCopy[latest.outcomeClass]}
          </div>
          <p className="mt-2 font-bold">{latest.title}</p>
          <p className="mt-1 text-base-content/70">{latest.text}</p>
          <div className="badge badge-outline mt-3">
            terning {latest.dieFace} → {latest.adjustedDie}
          </div>
        </div>
      ) : null}
    </Panel>
  );
});

function ActionCardView({
  card,
  selected,
  dieFace,
  onSelect,
}: {
  card: ActionCard;
  selected: boolean;
  dieFace?: number;
  onSelect: () => void;
}) {
  const total = dieFace ? adjustedDie(dieFace as 1 | 2 | 3 | 4 | 5 | 6, card.modifier) : undefined;
  const chances = total ? actionProbabilities(total) : undefined;

  return (
    <article
      className={clsx(
        'rounded-box border p-4 text-left transition',
        selected ? 'border-accent bg-accent/15' : 'border-base-content/10 bg-base-200 hover:bg-base-100',
      )}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onSelect();
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge badge-neutral">
          {card.type === 'repeatable' ? 'Gjentakbar' : 'Kritisk'}
        </span>
        <span className={riskBadgeClass(card.risk)}>{actionRiskCopy[card.risk]}</span>
        <span className="badge badge-outline">{card.skill}</span>
        <span className="badge badge-outline">mod {signed(card.modifier)}</span>
      </div>
      <h3 className="mt-3 text-lg font-black">{card.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-base-content/70">{card.body}</p>
      <div className="mt-3 rounded-box border border-base-content/10 bg-base-100 p-3">
        <div className="flex items-center justify-between gap-3 text-sm font-bold">
          <span>Input terning</span>
          <span>{dieFace ? `${dieFace} ${signed(card.modifier)} = ${total}` : 'velg terning'}</span>
        </div>
        {chances ? (
          <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
            {(['positive', 'neutral', 'negative'] as ActionOutcomeClass[]).map((kind) => (
              <div key={kind} className="rounded-box bg-base-200 p-2">
                <div className="font-bold">{actionOutcomeCopy[kind]}</div>
                <div>{pct(chances[kind])}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <div className="mt-3 grid gap-2 text-xs leading-relaxed">
        {(['positive', 'neutral', 'negative'] as ActionOutcomeClass[]).map((kind) => (
          <div key={kind} className="rounded-box border border-base-content/10 bg-base-100 p-2">
            <span className="font-bold">{actionOutcomeCopy[kind]}: </span>
            {card.outcomes[kind].title}
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {card.clockEffects.map((clock) => (
          <span key={clock} className="badge badge-ghost">
            {clock}
          </span>
        ))}
      </div>
    </article>
  );
}

function riskBadgeClass(risk: ActionCard['risk']): string {
  return clsx(
    'badge',
    risk === 'safe' && 'badge-success',
    risk === 'risky' && 'badge-warning',
    risk === 'fragile' && 'badge-error',
  );
}

function signed(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
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


function ApartmentStage({
  room,
  carriedWeaknesses,
}: {
  room: RoomState;
  carriedWeaknesses: PressureId[];
}) {
  return (
    <div className="relative mt-4 h-135 overflow-hidden rounded-box border-2 border-base-content/20 bg-base-300 shadow-inner">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px)] bg-size-[36px_36px]" />
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



function scriptObjectLabel(scriptState: ScriptState): string {
  if (scriptState === 'missing') return 'uten manus';
  if (scriptState === 'used') return 'brukt manus';
  if (scriptState === 'ignored') return 'manuset ble liggende';
  return 'telefonmanus';
}


