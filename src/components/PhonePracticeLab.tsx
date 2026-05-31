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
  { id: 'near_phone', label: 'Near phone', note: 'support becomes audience' },
  { id: 'seated_away', label: 'Seated away', note: 'room stays less public' },
  { id: 'absent_setup', label: 'Absent / setup only', note: 'Frank leaves the first step alone' },
];

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
                Phone Resistance Room
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-base-content/70">
                Compose two supports, assign one daily die, then watch whether the room shows phone
                fear, dignity defense, Frank pressure, low overskudd, or the weakness you
                deliberately carried in.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-outline btn-accent" onClick={() => store.rollNewDay()}>
                New dice day
              </button>
              <button className="btn btn-outline" onClick={() => store.reset()}>
                Reset
              </button>
            </div>
          </div>
        </header>

        <main className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_0.9fr]">
          <Panel className="min-h-[660px] self-start">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <SectionTitle>Apartment stage</SectionTitle>
                <p className="text-sm text-base-content/60">
                  The case desk should interpret this room, not replace it.
                </p>
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
              <SectionTitle>1. Setup support</SectionTitle>
              <div className="grid gap-2">
                {frankPositions.map((position) => (
                  <button
                    key={position.id}
                    className={clsx(
                      'btn h-auto justify-start rounded-box px-4 py-3 text-left normal-case',
                      store.frankPosition === position.id ? 'btn-primary' : 'btn-ghost bg-base-200',
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
              <SectionTitle>2. Compose support topology</SectionTitle>
              <p className="mb-3 text-xs leading-relaxed text-base-content/60">
                Pick two. The point is not full coverage; it is choosing which weakness Frank is
                willing to carry today.
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
                          risk: {support.risk}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <SupportTopology selectedIds={store.selectedSupportIds} />
            </Panel>

            <Panel>
              <SectionTitle>3. Pick activity framing</SectionTitle>
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
              <SectionTitle>4. Assign one daily die</SectionTitle>
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
                Dice bias the odds. They do not pick a deterministic branch.
              </p>
              <select
                className="select select-bordered mt-4 w-full"
                value={store.frankStance}
                onChange={(event) => store.setFrankStance(event.target.value as FrankStance)}
              >
                {frankStances.map((stance) => (
                  <option key={stance} value={stance}>
                    Frank tone: {stance.replaceAll('_', ' ')}
                  </option>
                ))}
              </select>
              <button
                className="btn btn-success mt-4 w-full"
                onClick={() => store.runAttempt()}
                disabled={!store.selectedDie}
              >
                Run phone attempt {store.attempts.length + 1}
              </button>
            </Panel>

            <Panel>
              <SectionTitle>Activity / skill lens</SectionTitle>
              <div className="grid gap-4">
                <Meter label="Overskudd" value={store.client.overskudd} />
                <Meter label="Trust" value={store.client.trust} />
                <Meter label="Phone mastery" value={store.client.phoneMastery} />
              </div>
              <div className="mt-5 rounded-box border border-secondary/30 border-l-4 bg-base-200 p-4 shadow-inner">
                <span className="badge badge-secondary badge-sm font-bold uppercase tracking-wider">
                  {telefonAversjon.anchor}
                </span>
                <h3 className="mt-3 text-lg font-bold">{telefonAversjon.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-base-content/70">
                  {telefonAversjon.description}
                </p>
              </div>
              <h3 className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-base-content/50">
                Citizen clocks / phone activity
              </h3>
              <div className="mt-3 grid gap-3">
                {phoneActivityClocks.map((clock) => (
                  <ActivityClockCard
                    key={clock.id}
                    clock={clock}
                    mastery={store.client.phoneMastery}
                  />
                ))}
              </div>
              <h3 className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-base-content/50">
                State objects on the table
              </h3>
              <div className="mt-3 grid gap-2">
                {phonePressureObjects.map((pressure) => (
                  <PressureObjectCard key={pressure.id} pressure={pressure} />
                ))}
              </div>
            </Panel>
          </div>

          <Panel className="xl:col-span-2">
            <SectionTitle>Scene evidence</SectionTitle>
            {!latest ? (
              <EmptyState>No attempt yet. Set Frank, script, framing, and assign a die.</EmptyState>
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
                        <span className="badge badge-accent badge-sm">{beat.actor}</span>
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
                    {latest.outcome.replaceAll('_', ' ')} / readiness {pct(latest.readiness)}
                  </div>
                  <ul className="mt-4 grid gap-y-2 text-sm text-base-content/80">
                    {latest.evidence.map((item) => (
                      <li key={`${item.id}-${item.value}`} className="flex justify-between gap-4">
                        <span>{item.label}</span>
                        <b className="text-right text-base-content">{String(item.value)}</b>
                      </li>
                    ))}
                  </ul>
                  <blockquote className="mt-5 rounded-box border-l-4 border-accent bg-base-200 p-4 text-base-content/80">
                    {latest.frankReport}
                  </blockquote>
                  <h3 className="mt-5 text-lg font-bold">Next approach</h3>
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
      </div>
    </div>
  );
});

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
      <div className="font-bold text-base-content/70">Carried weakness</div>
      <div className="mt-2 flex flex-wrap gap-1">
        {carried.slice(0, 5).map((pressure) => (
          <span key={pressure} className="badge badge-warning badge-sm capitalize">
            {pressure.replaceAll('_', ' ')}
          </span>
        ))}
      </div>
      <p className="mt-2 text-base-content/55">
        This is the vulnerability-topology graft: two supports improve the posture, but never make
        the phone room safe from every pressure.
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
      <Zone className="left-8 top-10 h-40 w-56" label="phone zone" />
      <Zone className="right-12 top-12 h-36 w-56" label="reading / refuge chair" />
      <Zone className="bottom-12 right-16 h-36 w-52" label="bedroom retreat" />
      <StageObject className="left-20 top-24">phone</StageObject>
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
      <StageObject className="right-28 top-28">chair</StageObject>
      <StageObject
        className={clsx(
          'bottom-20 right-28 w-28',
          room.doorClosed && 'border-error bg-error/20 text-error',
        )}
      >
        {room.doorClosed ? 'closed door' : 'bedroom door'}
      </StageObject>
      <PressureLabel className="left-48 top-10" active={carriedWeaknesses.includes('phone_fear')}>
        phone fear
      </PressureLabel>
      <PressureLabel className="right-48 top-44" active={carriedWeaknesses.includes('shame')}>
        shame / dignity
      </PressureLabel>
      <PressureLabel
        className="bottom-28 right-52"
        active={carriedWeaknesses.includes('sleep_debt')}
      >
        sleep debt
      </PressureLabel>
      <PressureLabel
        className="left-24 bottom-24"
        active={carriedWeaknesses.includes('unpaid_bill')}
      >
        unopened bill
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
  mastery,
}: {
  clock: (typeof phoneActivityClocks)[number];
  mastery: number;
}) {
  const filled = Math.min(clock.segments, clock.filled + Math.round(mastery * 2));
  return (
    <div className="rounded-box border border-base-content/10 bg-base-200 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-bold">{clock.label}</h4>
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
      <div className="mt-3 grid grid-cols-8 gap-1">
        {Array.from({ length: clock.segments }).map((_, index) => (
          <span
            key={index}
            className={clsx(
              'h-2 rounded-full',
              index < filled ? 'bg-accent' : 'bg-base-content/15',
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
        <span className="badge badge-outline badge-sm">{pressure.anchor}</span>
      </div>
      <progress className="progress progress-warning mt-2 w-full" value={pressure.clock} max={1} />
      <p className="mt-2 text-xs leading-relaxed text-base-content/60">
        Escalates into {pressure.escalatesInto}. Softened by {pressure.softenedBy}.
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
      <span className="badge badge-outline">Frank: {room.frankPosition.replaceAll('_', ' ')}</span>
      <span
        className={clsx(
          'badge',
          room.scriptState === 'missing' ? 'badge-error' : 'badge-secondary',
        )}
      >
        script {room.scriptState}
      </span>
      <span className={clsx('badge', room.doorClosed ? 'badge-error' : 'badge-success')}>
        {room.doorClosed ? 'bedroom door closed' : 'room open'}
      </span>
      <span className="badge badge-accent">{room.lastFriction}</span>
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

function scriptButtonLabel(scriptState: ScriptState): string {
  if (scriptState === 'used') return 'Script used in last attempt';
  if (scriptState === 'placed') return 'Script placed in room';
  if (scriptState === 'ignored') return 'Place script again';
  return 'Place phone script';
}

function scriptObjectLabel(scriptState: ScriptState): string {
  if (scriptState === 'missing') return 'no script';
  if (scriptState === 'used') return 'used script';
  if (scriptState === 'ignored') return 'ignored script';
  return 'phone script';
}

function outcomeBadgeClass(outcomeClass: string): string {
  return clsx('badge badge-lg capitalize', {
    'badge-success': outcomeClass === 'positive',
    'badge-warning': outcomeClass === 'neutral',
    'badge-error': outcomeClass === 'negative',
  });
}
