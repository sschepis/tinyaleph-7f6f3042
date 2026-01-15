import type { Sephirah, SephirahName, MeditationSequence } from './types';

// Tree of Life configuration with positions optimized for visualization
export const SEPHIROT: Record<SephirahName, Sephirah> = {
  keter: {
    id: 'keter',
    name: 'Keter',
    hebrewName: 'כתר',
    meaning: 'Divine Connection',
    pillar: 'consciousness',
    layer: 'collective-unconscious',
    position: { x: 50, y: 5 },
    planetarySymbol: '♆',
    psychologicalAspect: 'Transpersonal Self',
    color: '#ffffff',
    connections: ['hokhmah', 'binah', 'tiferet']
  },
  hokhmah: {
    id: 'hokhmah',
    name: 'Hokhmah',
    hebrewName: 'חכמה',
    meaning: 'Active Intellect',
    pillar: 'dynamic',
    layer: 'collective-unconscious',
    position: { x: 80, y: 15 },
    planetarySymbol: '♅',
    psychologicalAspect: 'Animus/Father',
    color: '#8b5cf6',
    connections: ['keter', 'binah', 'hesed', 'tiferet']
  },
  binah: {
    id: 'binah',
    name: 'Binah',
    hebrewName: 'בינה',
    meaning: 'Passive Intellect',
    pillar: 'structure',
    layer: 'collective-unconscious',
    position: { x: 20, y: 15 },
    planetarySymbol: '♄',
    psychologicalAspect: 'Anima/Mother',
    color: '#06b6d4',
    connections: ['keter', 'hokhmah', 'gevurah', 'tiferet']
  },
  daat: {
    id: 'daat',
    name: 'Daat',
    hebrewName: 'דעת',
    meaning: 'Higher Knowledge',
    pillar: 'consciousness',
    layer: 'collective-unconscious',
    position: { x: 50, y: 25 },
    planetarySymbol: '✡',
    psychologicalAspect: 'Collective Unconscious',
    color: '#a1a1aa',
    connections: ['hokhmah', 'binah', 'hesed', 'gevurah']
  },
  hesed: {
    id: 'hesed',
    name: 'Hesed',
    hebrewName: 'חסד',
    meaning: 'Active Emotion',
    pillar: 'dynamic',
    layer: 'individual-unconscious',
    position: { x: 80, y: 40 },
    planetarySymbol: '♃',
    psychologicalAspect: 'Ego Ideal/Reward',
    color: '#3b82f6',
    connections: ['hokhmah', 'binah', 'gevurah', 'tiferet', 'nezah']
  },
  gevurah: {
    id: 'gevurah',
    name: 'Gevurah',
    hebrewName: 'גבורה',
    meaning: 'Passive Emotion',
    pillar: 'structure',
    layer: 'individual-unconscious',
    position: { x: 20, y: 40 },
    planetarySymbol: '♂',
    psychologicalAspect: 'Super Ego/Punishment',
    color: '#ef4444',
    connections: ['binah', 'hesed', 'tiferet', 'hod']
  },
  tiferet: {
    id: 'tiferet',
    name: 'Tiferet',
    hebrewName: 'תפארת',
    meaning: 'Self of Individuality',
    pillar: 'consciousness',
    layer: 'individual-unconscious',
    position: { x: 50, y: 50 },
    planetarySymbol: '☉',
    psychologicalAspect: 'Conscience/Soul',
    color: '#fbbf24',
    connections: ['keter', 'hokhmah', 'binah', 'hesed', 'gevurah', 'nezah', 'hod', 'yesod']
  },
  nezah: {
    id: 'nezah',
    name: 'Nezah',
    hebrewName: 'נצח',
    meaning: 'Active Action',
    pillar: 'dynamic',
    layer: 'personal-consciousness',
    position: { x: 80, y: 65 },
    planetarySymbol: '♀',
    psychologicalAspect: 'Libido',
    color: '#22c55e',
    connections: ['hesed', 'tiferet', 'hod', 'yesod', 'malkhut']
  },
  hod: {
    id: 'hod',
    name: 'Hod',
    hebrewName: 'הוד',
    meaning: 'Passive Action',
    pillar: 'structure',
    layer: 'personal-consciousness',
    position: { x: 20, y: 65 },
    planetarySymbol: '☿',
    psychologicalAspect: 'Mortido',
    color: '#f97316',
    connections: ['gevurah', 'tiferet', 'nezah', 'yesod', 'malkhut']
  },
  yesod: {
    id: 'yesod',
    name: 'Yesod',
    hebrewName: 'יסוד',
    meaning: 'Ego Identity',
    pillar: 'consciousness',
    layer: 'personal-consciousness',
    position: { x: 50, y: 78 },
    planetarySymbol: '☽',
    psychologicalAspect: 'Liminal Threshold',
    color: '#a855f7',
    connections: ['tiferet', 'nezah', 'hod', 'malkhut']
  },
  malkhut: {
    id: 'malkhut',
    name: 'Malkhut',
    hebrewName: 'מלכות',
    meaning: 'Body',
    pillar: 'consciousness',
    layer: 'personal-consciousness',
    position: { x: 50, y: 95 },
    planetarySymbol: '⊕',
    psychologicalAspect: 'Id-Nefesh/Subconscious',
    color: '#78716c',
    connections: ['nezah', 'hod', 'yesod']
  }
};

// Traditional pathworking meditation sequences
export const MEDITATION_SEQUENCES: MeditationSequence[] = [
  {
    id: 'lightning-flash',
    name: 'Lightning Flash',
    description: 'The path of divine emanation from Keter to Malkhut',
    path: ['keter', 'hokhmah', 'binah', 'hesed', 'gevurah', 'tiferet', 'nezah', 'hod', 'yesod', 'malkhut'],
    duration: 2000
  },
  {
    id: 'serpent-ascent',
    name: 'Serpent Ascent',
    description: 'The path of consciousness rising from Malkhut to Keter',
    path: ['malkhut', 'yesod', 'hod', 'nezah', 'tiferet', 'gevurah', 'hesed', 'binah', 'hokhmah', 'keter'],
    duration: 2500
  },
  {
    id: 'middle-pillar',
    name: 'Middle Pillar',
    description: 'Meditation on the Pillar of Consciousness',
    path: ['keter', 'daat', 'tiferet', 'yesod', 'malkhut'],
    duration: 3000
  },
  {
    id: 'pillar-of-severity',
    name: 'Pillar of Severity',
    description: 'The left pillar of structure and discipline',
    path: ['binah', 'gevurah', 'hod'],
    duration: 2500
  },
  {
    id: 'pillar-of-mercy',
    name: 'Pillar of Mercy',
    description: 'The right pillar of expansion and flow',
    path: ['hokhmah', 'hesed', 'nezah'],
    duration: 2500
  },
  {
    id: 'heart-circuit',
    name: 'Heart Circuit',
    description: 'The emotional center through Tiferet',
    path: ['hesed', 'tiferet', 'gevurah', 'tiferet', 'hesed'],
    duration: 2000
  }
];

// Keywords that activate specific sephirot based on semantic content
export const SEPHIRAH_KEYWORDS: Record<SephirahName, string[]> = {
  keter: ['divine', 'unity', 'source', 'infinite', 'transcendence', 'crown', 'will', 'pure'],
  hokhmah: ['wisdom', 'insight', 'intuition', 'father', 'creative', 'spark', 'active', 'masculine'],
  binah: ['understanding', 'mother', 'form', 'analysis', 'structure', 'passive', 'feminine', 'receptive'],
  daat: ['knowledge', 'hidden', 'secret', 'gnosis', 'awareness', 'synthesis', 'bridge', 'abyss'],
  hesed: ['love', 'mercy', 'kindness', 'grace', 'expansion', 'generosity', 'abundance', 'benevolence'],
  gevurah: ['strength', 'judgment', 'discipline', 'restriction', 'severity', 'power', 'boundary', 'justice'],
  tiferet: ['beauty', 'balance', 'harmony', 'heart', 'self', 'compassion', 'integration', 'center'],
  nezah: ['victory', 'endurance', 'passion', 'desire', 'emotion', 'art', 'nature', 'instinct'],
  hod: ['glory', 'intellect', 'logic', 'communication', 'reason', 'language', 'mind', 'thought'],
  yesod: ['foundation', 'ego', 'dream', 'unconscious', 'imagination', 'astral', 'psyche', 'moon'],
  malkhut: ['kingdom', 'body', 'earth', 'manifest', 'physical', 'material', 'reality', 'action']
};

export const ALL_SEPHIROT = Object.values(SEPHIROT);
export const SEPHIRAH_IDS = Object.keys(SEPHIROT) as SephirahName[];
