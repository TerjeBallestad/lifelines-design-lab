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

export type SkillProbeId = 'telephone_probe';

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
          title: 'Selvbjerging',
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
          title: 'Selvbjerging',
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
  if (probeId !== 'telephone_probe') throw new Error(`Unknown skill probe: ${probeId}`);

  if (outcomeClass === 'negative') {
    return {
      id: `telephone_probe-${dieFace}-${outcomeClass}`,
      probeId,
      title: 'Prøv telefon med Frank',
      outcomeClass,
      dieFace,
      tirade:
        'Elling forklarer at telefonen er et overfall med ringelyd, og at siviliserte mennesker skriver brev når de vil hverandre noe.',
      evidence: ['Telefon prøvesituasjon: motstand mot ringing, ikke bevis på manglende språk.'],
      updates: { social_courage: '1?' },
      trainingHint: 'Mestring: la telefonen ringe uten å ta den før neste samtale prøves.',
    };
  }

  if (outcomeClass === 'neutral') {
    return {
      id: `telephone_probe-${dieFace}-${outcomeClass}`,
      probeId,
      title: 'Prøv telefon med Frank',
      outcomeClass,
      dieFace,
      evidence: ['Telefon prøvesituasjon: Elling blir ved bordet, men samtalen starter ikke.'],
      updates: { social_courage: '1?', conversation: '1?' },
      trainingHint: 'Mestring: øv på én ferdig første setning med manus.',
    };
  }

  return {
    id: `telephone_probe-${dieFace}-${outcomeClass}`,
    probeId,
    title: 'Prøv telefon med Frank',
    outcomeClass,
    dieFace,
    evidence: ['Telefon prøvesituasjon: Elling sier én setning når rammen er smal nok.'],
    updates: { social_courage: 1, conversation: '1?' },
    trainingHint: 'Mestring: gjenta samme korte ringevindu før kravet økes.',
  };
}
