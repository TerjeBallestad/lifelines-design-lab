import type { Approach, StateObject } from '../domain/types';

export const telefonAversjon: StateObject = {
  id: 'telefon_aversjon',
  label: 'Telefonen står for åpen sosial risiko',
  anchor: 'phone',
  description:
    'Telefonen er ikke bare et apparat. Den er overgang, improvisasjon og risiko for å bli tatt på senga.',
  pressure: 0.72,
};

export const phoneApproaches: Approach[] = [
  {
    id: 'none',
    label: 'Bare prøv',
    description: 'Frank ber Elling øve uten ekstra ramme.',
    trustDelta: -0.04,
    controlDelta: -0.08,
    pressureDelta: 0.12,
  },
  {
    id: 'written_script',
    label: 'Skriftlig manus',
    description: 'Elling får nøyaktig første setning og en utgangsreplikk.',
    trustDelta: 0.03,
    controlDelta: 0.18,
    pressureDelta: -0.08,
  },
  {
    id: 'pre_agreed_window',
    label: 'Avtalt tidsvindu',
    description: 'Telefonøving skjer i et lite, varslet vindu.',
    trustDelta: 0.02,
    controlDelta: 0.14,
    pressureDelta: -0.05,
  },
  {
    id: 'tolerate_ringtone',
    label: 'Bare tåle ringelyden',
    description: 'Målet er ikke å svare. Bare bli i rommet mens telefonen ringer.',
    trustDelta: 0.04,
    controlDelta: 0.22,
    pressureDelta: -0.16,
  },
  {
    id: 'grete_primes_first',
    label: 'Grete forbereder først',
    description: 'Grete gjør rammen sosialt tryggere før Frank ber om øving.',
    trustDelta: 0.05,
    controlDelta: 0.1,
    pressureDelta: -0.12,
  },
  {
    id: 'frank_pushes',
    label: 'Frank presser tydelig',
    description: 'Frank gjør framdrift viktigere enn Ellings opplevelse av kontroll.',
    trustDelta: -0.09,
    controlDelta: -0.18,
    pressureDelta: 0.2,
  },
];

export function getApproach(id: string): Approach {
  const approach = phoneApproaches.find((item) => item.id === id);
  if (!approach) throw new Error(`Unknown approach: ${id}`);
  return approach;
}
