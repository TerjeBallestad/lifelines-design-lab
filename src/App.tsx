import { useState } from 'react';
import { BlueprintLab } from './components/blueprint/BlueprintLab';
import { PhonePracticeLab } from './components/PhonePracticeLab';

export default function App() {
  const [surface, setSurface] = useState<'blueprint' | 'phone'>('blueprint');

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 border-b border-black/10 bg-base-100/95 px-3 py-2 backdrop-blur">
        <div className="mx-auto flex max-w-[1480px] flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-base-content/50">
              Lifelines Design Lab
            </div>
            <div className="font-black">Playable surfaces</div>
          </div>
          <div className="join">
            <button
              className={`btn join-item btn-sm ${surface === 'blueprint' ? 'btn-primary' : 'btn-outline'}`}
              type="button"
              onClick={() => setSurface('blueprint')}
            >
              Blueprint v1
            </button>
            <button
              className={`btn join-item btn-sm ${surface === 'phone' ? 'btn-primary' : 'btn-outline'}`}
              type="button"
              onClick={() => setSurface('phone')}
            >
              Phone Practice Lab
            </button>
          </div>
        </div>
      </div>
      {surface === 'blueprint' ? <BlueprintLab /> : <PhonePracticeLab />}
    </div>
  );
}
