import type { ActionOutcomeClass } from '../domain/types';

export type SkillValue = number | '???' | `${number}?`;
export type SkillProfileId = 'elling' | 'grete';
export type SkillId =
  | 'housekeeping'
  | 'cooking'
  | 'routine'
  | 'planning'
  | 'social_courage'
  | 'conversation'
  | 'assertiveness'
  | 'emotional_regulation'
  | 'self_expression'
  | 'structured_writing'
  | 'creativity'
  | 'reflection';

export interface SkillEntry {
  id: SkillId;
  name: string;
  value: SkillValue;
  note?: string;
}

export interface SkillDomain {
  title: string;
  skills: SkillEntry[];
}

export interface SkillProfile {
  id: SkillProfileId;
  name: string;
  caption: string;
  domains: SkillDomain[];
}

export type SkillProbeId = 'post_observation';

export interface SkillProbeResult {
  id: string;
  probeId: SkillProbeId;
  title: string;
  outcomeClass: ActionOutcomeClass;
  dieFace: number;
  tirade?: string;
  evidence: string[];
  updates: Partial<Record<SkillId, SkillValue>>;
  trainingHint: string;
}

function skills(entries: SkillEntry[]): SkillEntry[] {
  return entries.map((entry) => ({ ...entry }));
}

export function createInitialSkillProfiles(): SkillProfile[] {
  return [
    {
      id: 'elling',
      name: 'Elling',
      caption: 'Direkte observert ferdighetsbilde. Mye er fortsatt ???.',
      domains: [
        {
          title: 'Husholdning',
          skills: skills([
            { id: 'housekeeping', name: 'Husarbeid', value: '???' },
            { id: 'cooking', name: 'Matlaging', value: '???' },
            { id: 'routine', name: 'Rutine', value: '???' },
            { id: 'planning', name: 'Planlegging', value: '???' },
          ]),
        },
        {
          title: 'Sosialt',
          skills: skills([
            { id: 'social_courage', name: 'Sosialt mot', value: '???' },
            { id: 'conversation', name: 'Samtale', value: '???' },
            { id: 'assertiveness', name: 'Selvhevdelse', value: '???' },
            { id: 'emotional_regulation', name: 'Følelsesregulering', value: '???' },
          ]),
        },
        {
          title: 'Indre liv',
          skills: skills([
            { id: 'self_expression', name: 'Selvuttrykk', value: '???' },
            { id: 'structured_writing', name: 'Skriftlig struktur', value: '???' },
            { id: 'creativity', name: 'Kreativitet', value: '???' },
            { id: 'reflection', name: 'Refleksjon', value: '???' },
          ]),
        },
      ],
    },
    {
      id: 'grete',
      name: 'Grete',
      caption: 'Kjent fra tidligere kontakt, papirer og hverdagsdrift.',
      domains: [
        {
          title: 'Husholdning',
          skills: skills([
            { id: 'housekeeping', name: 'Husarbeid', value: 3 },
            { id: 'cooking', name: 'Matlaging', value: 3 },
            { id: 'routine', name: 'Rutine', value: 3 },
            { id: 'planning', name: 'Planlegging', value: 2 },
          ]),
        },
        {
          title: 'Sosialt',
          skills: skills([
            { id: 'social_courage', name: 'Sosialt mot', value: 2 },
            { id: 'conversation', name: 'Samtale', value: 2 },
            { id: 'assertiveness', name: 'Selvhevdelse', value: 1 },
            { id: 'emotional_regulation', name: 'Følelsesregulering', value: 2 },
          ]),
        },
        {
          title: 'Indre liv',
          skills: skills([
            { id: 'self_expression', name: 'Selvuttrykk', value: '???' },
            { id: 'structured_writing', name: 'Skriftlig struktur', value: '???' },
            { id: 'creativity', name: 'Kreativitet', value: '???' },
            { id: 'reflection', name: 'Refleksjon', value: '???' },
          ]),
        },
      ],
    },
  ];
}

export function updateProfileSkill(
  profiles: SkillProfile[],
  profileId: SkillProfileId,
  skillId: SkillId,
  value: SkillValue,
  note?: string,
): SkillProfile[] {
  return profiles.map((profile) => {
    if (profile.id !== profileId) return profile;
    return {
      ...profile,
      domains: profile.domains.map((domain) => ({
        ...domain,
        skills: domain.skills.map((skill) =>
          skill.id === skillId ? { ...skill, value, note: note ?? skill.note } : skill,
        ),
      })),
    };
  });
}

export function resolveSkillProbe(
  probeId: SkillProbeId,
  dieFace: number,
  outcomeClass: ActionOutcomeClass,
): SkillProbeResult {
  if (probeId !== 'post_observation') throw new Error(`Unknown skill probe: ${probeId}`);

  if (outcomeClass === 'negative') {
    return {
      id: `post_observation-${dieFace}-${outcomeClass}`,
      probeId,
      title: 'Les posten med Frank',
      outcomeClass,
      dieFace,
      tirade:
        'Post er ikke et karaktervitne. Den ligger der bare, og det kan den fortsette med ganske lenge.',
      evidence: [
        'Posten peker mot at Grete styrer regninger og frister. Det sier ennå ikke hva Elling kan alene.',
      ],
      updates: { planning: '1?' },
      trainingHint: 'Mestring: én regning åpnes sammen med Frank før saken antar mer.',
    };
  }

  if (outcomeClass === 'neutral') {
    return {
      id: `post_observation-${dieFace}-${outcomeClass}`,
      probeId,
      title: 'Les posten med Frank',
      outcomeClass,
      dieFace,
      evidence: [
        'Posten under avisen viser et praktisk hull: frister og faste trekk går gjennom Grete.',
      ],
      updates: { planning: '1?', routine: '1?' },
      trainingHint: 'Mestring: finn én fast plass for brev før økonomien tolkes videre.',
    };
  }

  return {
    id: `post_observation-${dieFace}-${outcomeClass}`,
    probeId,
    title: 'Les posten med Frank',
    outcomeClass,
    dieFace,
    evidence: [
      'Frank kan knytte posten til Husholdning: Elling må trolig øve på brev, frister og faste trekk.',
    ],
    updates: { planning: 1, routine: '1?' },
    trainingHint: 'Mestring: la Elling sortere ett brev mens Grete ikke svarer for ham.',
  };
}
