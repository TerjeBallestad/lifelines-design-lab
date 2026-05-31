import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { phoneApproaches, telefonAversjon } from '../content/phonePractice';
import type { DieFace, FrankStance, PhoneApproachId } from '../domain/types';
import { useRootStore } from '../stores/RootStore';

const dieFaces: DieFace[] = [1, 2, 3, 4, 5, 6];
const frankStances: FrankStance[] = ['soft', 'matter_of_fact', 'pushy'];

function pct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export const PhonePracticeLab = observer(function PhonePracticeLab() {
  const store = useRootStore();
  const latest = store.latestAttempt;

  return (
    <div className="min-h-screen bg-base-300 text-base-content">
      <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
        <header className="card border border-base-content/10 bg-base-100 shadow-2xl">
          <div className="card-body gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-accent">
                Lifelines Design Lab / M1
              </p>
              <h1 className="text-4xl font-black tracking-tight md:text-5xl">Phone Practice Lab</h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-base-content/70">
                Test whether one phone tiltak attempt creates a better second decision. Cheap HTML
                first, Godot later when the loop earns embodiment.
              </p>
            </div>
            <button className="btn btn-outline btn-accent" onClick={() => store.reset()}>
              Reset
            </button>
          </div>
        </header>

        <main className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_1.15fr_1.1fr]">
          <Panel>
            <SectionTitle>Current state</SectionTitle>
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
          </Panel>

          <Panel>
            <SectionTitle>Apartment overlay</SectionTitle>
            <div className="grid h-72 grid-cols-2 grid-rows-2 gap-3">
              <Room>Sofa / Frank</Room>
              <Room active className="row-span-2">
                <div>
                  <div className="font-bold">Phone</div>
                  <div className="mx-auto mt-2 max-w-48 text-sm text-accent">
                    {telefonAversjon.label}
                  </div>
                </div>
              </Room>
              <Room>Bedroom retreat</Room>
            </div>
          </Panel>

          <Panel>
            <SectionTitle>Approach</SectionTitle>
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
            <SectionTitle>Die + Frank stance</SectionTitle>
            <div className="grid grid-cols-6 gap-2">
              {dieFaces.map((face) => (
                <button
                  key={face}
                  className={clsx(
                    'btn btn-square text-xl font-black',
                    face === store.selectedDieFace ? 'btn-primary' : 'btn-outline',
                  )}
                  onClick={() => store.setDieFace(face)}
                >
                  {face}
                </button>
              ))}
            </div>
            <select
              className="select select-bordered mt-4 w-full"
              value={store.frankStance}
              onChange={(event) => store.setFrankStance(event.target.value as FrankStance)}
            >
              {frankStances.map((stance) => (
                <option key={stance} value={stance}>
                  {stance.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
            <button className="btn btn-success mt-4 w-full" onClick={() => store.runAttempt()}>
              Run attempt {store.attempts.length + 1}
            </button>
          </Panel>

          <Panel className="lg:col-span-3">
            <SectionTitle>Vignette timeline</SectionTitle>
            {!latest ? (
              <EmptyState>No attempt yet.</EmptyState>
            ) : (
              <ol className="grid gap-3">
                {latest.beats.map((beat) => (
                  <li
                    key={beat.id}
                    data-anchor={beat.anchor}
                    className="rounded-box border border-base-content/10 bg-base-200 p-4"
                  >
                    <span className="text-xs font-bold uppercase tracking-wider text-accent">
                      {beat.actor}
                    </span>
                    <strong className="mt-1 block">{beat.label}</strong>
                    <p className="mt-2 text-sm leading-relaxed text-base-content/70">{beat.text}</p>
                  </li>
                ))}
              </ol>
            )}
          </Panel>

          <Panel className="lg:col-span-3">
            <SectionTitle>Evidence + Frank report</SectionTitle>
            {!latest ? (
              <EmptyState>Evidence appears after an attempt.</EmptyState>
            ) : (
              <>
                <div className={outcomeBadgeClass(latest.outcomeClass)}>
                  {latest.outcome.replaceAll('_', ' ')} / readiness {pct(latest.readiness)}
                </div>
                <ul className="mt-4 grid gap-x-8 gap-y-2 text-sm text-base-content/80 md:grid-cols-2">
                  {latest.evidence.map((item) => (
                    <li key={`${item.id}-${item.value}`} className="flex justify-between gap-4">
                      <span>{item.label}</span>
                      <b className="text-base-content">{String(item.value)}</b>
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
              </>
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

function Room({
  children,
  active,
  className,
}: {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        'flex items-center justify-center rounded-box border p-4 text-center shadow-inner',
        active
          ? 'border-accent/60 bg-accent/10 ring-2 ring-accent/20'
          : 'border-base-content/10 bg-base-200',
        className,
      )}
    >
      {children}
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

function outcomeBadgeClass(outcomeClass: string): string {
  return clsx('badge badge-lg capitalize', {
    'badge-success': outcomeClass === 'positive',
    'badge-warning': outcomeClass === 'neutral',
    'badge-error': outcomeClass === 'negative',
  });
}
