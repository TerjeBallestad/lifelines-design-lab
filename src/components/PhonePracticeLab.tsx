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
    <div className="lab-shell">
      <header className="hero-card">
        <div>
          <p className="eyebrow">Lifelines Design Lab / M1</p>
          <h1>Phone Practice Lab</h1>
          <p>
            Test whether one phone tiltak attempt creates a better second decision. Cheap HTML first,
            Godot later when the loop earns embodiment.
          </p>
        </div>
        <button onClick={() => store.reset()}>Reset</button>
      </header>

      <main className="grid">
        <section className="panel state-panel">
          <h2>Current state</h2>
          <div className="meters">
            <Meter label="Overskudd" value={store.client.overskudd} />
            <Meter label="Trust" value={store.client.trust} />
            <Meter label="Phone mastery" value={store.client.phoneMastery} />
          </div>
          <div className="state-object">
            <span className="anchor">{telefonAversjon.anchor}</span>
            <h3>{telefonAversjon.label}</h3>
            <p>{telefonAversjon.description}</p>
          </div>
        </section>

        <section className="panel apartment-panel">
          <h2>Apartment overlay</h2>
          <div className="apartment-map">
            <div className="room sofa">Sofa / Frank</div>
            <div className="room phone active">Phone<br /><span>{telefonAversjon.label}</span></div>
            <div className="room bedroom">Bedroom retreat</div>
          </div>
        </section>

        <section className="panel approach-panel">
          <h2>Approach</h2>
          <div className="approach-list">
            {phoneApproaches.map((approach) => (
              <button
                key={approach.id}
                className={approach.id === store.selectedApproachId ? 'selected' : ''}
                onClick={() => store.setApproach(approach.id)}
              >
                <strong>{approach.label}</strong>
                <span>{approach.description}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel control-panel">
          <h2>Die + Frank stance</h2>
          <div className="dice-row">
            {dieFaces.map((face) => (
              <button
                key={face}
                className={face === store.selectedDieFace ? 'die selected' : 'die'}
                onClick={() => store.setDieFace(face)}
              >
                {face}
              </button>
            ))}
          </div>
          <select value={store.frankStance} onChange={(event) => store.setFrankStance(event.target.value as FrankStance)}>
            {frankStances.map((stance) => <option key={stance} value={stance}>{stance.replaceAll('_', ' ')}</option>)}
          </select>
          <button className="run" onClick={() => store.runAttempt()}>Run attempt {store.attempts.length + 1}</button>
        </section>

        <section className="panel timeline-panel">
          <h2>Vignette timeline</h2>
          {!latest ? <p className="empty">No attempt yet.</p> : (
            <ol className="timeline">
              {latest.beats.map((beat) => (
                <li key={beat.id} data-anchor={beat.anchor}>
                  <span>{beat.actor}</span>
                  <strong>{beat.label}</strong>
                  <p>{beat.text}</p>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="panel report-panel">
          <h2>Evidence + Frank report</h2>
          {!latest ? <p className="empty">Evidence appears after an attempt.</p> : (
            <>
              <div className={`outcome ${latest.outcomeClass}`}>{latest.outcome.replaceAll('_', ' ')} / readiness {pct(latest.readiness)}</div>
              <ul className="evidence">
                {latest.evidence.map((item) => <li key={`${item.id}-${item.value}`}>{item.label}: <b>{String(item.value)}</b></li>)}
              </ul>
              <blockquote>{latest.frankReport}</blockquote>
              <h3>Next approach</h3>
              <div className="next-row">
                {latest.nextApproachIds.map((id) => {
                  const approach = phoneApproaches.find((item) => item.id === id)!;
                  return <button key={id} onClick={() => store.chooseNextApproach(id as PhoneApproachId)}>{approach.label}</button>;
                })}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
});

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div className="meter">
      <div><span>{label}</span><b>{pct(value)}</b></div>
      <progress value={value} max={1} />
    </div>
  );
}
