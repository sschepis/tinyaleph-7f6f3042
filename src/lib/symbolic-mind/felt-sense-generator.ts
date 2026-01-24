import type { BodyRegion, SensationIntensity } from './types';
import type { AggregateSomaticState } from './somatic-database';

/**
 * Felt Sense Generator
 * Synthesizes somatic data into readable, embodied narratives.
 */

// Narrative templates for body regions
const REGION_NARRATIVES: Record<BodyRegion, string[]> = {
  'crown': ['at the crown of the head', 'in the uppermost reaches of awareness', 'at the vertex'],
  'third-eye': ['behind the brow', 'at the seat of insight', 'in the space between the eyes'],
  'throat': ['in the throat', 'at the voice center', 'where words emerge'],
  'heart': ['in the heart center', 'within the chest', 'at the emotional core'],
  'solar-plexus': ['at the solar plexus', 'in the power center', 'below the sternum'],
  'sacral': ['in the lower belly', 'at the sacral center', 'in the creative basin'],
  'root': ['at the base of the spine', 'in the root', 'grounding downward'],
  'spine': ['along the spinal column', 'through the vertebral axis', 'up and down the spine'],
  'hands': ['in the palms', 'through the hands', 'at the fingertips'],
  'feet': ['through the soles of the feet', 'in the foundation of standing', 'where earth meets body'],
  'chest': ['across the chest', 'in the ribcage', 'within the thorax'],
  'belly': ['in the belly', 'deep in the gut', 'within the abdominal cavity'],
  'limbs': ['through the limbs', 'in arms and legs', 'extending outward'],
  'skin': ['across the skin', 'at the body\'s boundary', 'on the surface'],
  'whole-body': ['throughout the entire body', 'pervading all tissues', 'in every cell'],
  'jaw': ['in the jaw', 'at the mandible', 'where tension grips']
};

// Nervous system state descriptions
const NS_DESCRIPTIONS: Record<'high-sympathetic' | 'moderate-sympathetic' | 'balanced' | 'moderate-parasympathetic' | 'high-parasympathetic', string[]> = {
  'high-sympathetic': [
    'The body enters a state of heightened alertness',
    'An activated, ready-for-action quality pervades',
    'The nervous system fires into mobilization'
  ],
  'moderate-sympathetic': [
    'A subtle energization courses through',
    'Gentle activation brings clarity and readiness',
    'The body leans toward engagement'
  ],
  'balanced': [
    'A harmonious equilibrium settles in',
    'Neither rushing nor retreating, the system finds balance',
    'Centered stillness with available energy'
  ],
  'moderate-parasympathetic': [
    'A softening begins to unfold',
    'The body settles into receptive ease',
    'Gentle relaxation spreads through the tissues'
  ],
  'high-parasympathetic': [
    'Deep relaxation washes through',
    'The body surrenders into profound rest',
    'A wave of letting-go pervades all systems'
  ]
};

// Intensity modifiers
const INTENSITY_MODIFIERS: Record<SensationIntensity, string[]> = {
  'subtle': ['faintly', 'subtly', 'delicately', 'barely perceptibly'],
  'moderate': ['noticeably', 'clearly', 'distinctly', 'palpably'],
  'strong': ['intensely', 'powerfully', 'vividly', 'forcefully']
};

// Transition phrases
const TRANSITIONS = [
  'Meanwhile,',
  'Simultaneously,',
  'At the same time,',
  'In concert,',
  'Together with this,',
  'Accompanying this,'
];

// Pick a random element from an array deterministically based on a seed
function seededPick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

/**
 * Generate a felt-sense narrative from aggregate somatic state
 */
export function generateFeltSense(state: AggregateSomaticState, coherence: number = 0.5): string {
  if (state.dominantRegions.length === 0) {
    return 'The body rests in neutral stillness, awaiting activation.';
  }
  
  const parts: string[] = [];
  const seed = Math.floor(coherence * 1000);
  
  // 1. Opening - Nervous system state
  const nsKey = getNervousSystemKey(state.nervousSystemBalance);
  parts.push(seededPick(NS_DESCRIPTIONS[nsKey], seed));
  
  // 2. Primary sensation and location
  if (state.activeSensations.length > 0) {
    const primary = state.activeSensations[0];
    const region = primary.regions[0] || 'whole-body';
    const modifier = seededPick(INTENSITY_MODIFIERS[primary.intensity], seed + 1);
    const location = seededPick(REGION_NARRATIVES[region], seed + 2);
    
    parts.push(`${capitalizeFirst(primary.sensation)} arises ${modifier} ${location}.`);
  }
  
  // 3. Secondary sensations (if any)
  if (state.activeSensations.length > 1) {
    const secondary = state.activeSensations[1];
    const region = secondary.regions[0] || 'whole-body';
    const transition = seededPick(TRANSITIONS, seed + 3);
    const location = seededPick(REGION_NARRATIVES[region], seed + 4);
    
    parts.push(`${transition} ${secondary.sensation} emerges ${location}.`);
  }
  
  // 4. Body region emphasis
  if (state.dominantRegions.length > 2) {
    const topRegions = state.dominantRegions.slice(0, 3).map(r => r.region);
    const regionNames = topRegions.map(r => getRegionName(r));
    
    if (state.overallIntensity > 0.6) {
      parts.push(`The ${regionNames.join(', ')} form a triangle of heightened awareness.`);
    } else {
      parts.push(`Subtle connections weave between ${regionNames.join(' and ')}.`);
    }
  }
  
  // 5. Energy center integration (if active)
  if (state.activeEnergyCenters.length > 0) {
    const centers = state.activeEnergyCenters.slice(0, 3);
    if (centers.length === 1) {
      parts.push(`The ${centers[0]} center pulses with presence.`);
    } else if (centers.length === 2) {
      parts.push(`A current flows between the ${centers[0]} and ${centers[1]}.`);
    } else {
      parts.push(`Multiple energy centers—${centers.join(', ')}—resonate together.`);
    }
  }
  
  // 6. Closing based on overall intensity
  if (state.overallIntensity > 0.7) {
    parts.push('The body speaks loudly; listen.');
  } else if (state.overallIntensity > 0.4) {
    parts.push('A clear somatic signature emerges.');
  } else {
    parts.push('Subtle whispers from the body await attention.');
  }
  
  return parts.join(' ');
}

/**
 * Generate a short summary phrase
 */
export function generateShortFeltSense(state: AggregateSomaticState): string {
  if (state.activeSensations.length === 0) {
    return 'Neutral stillness';
  }
  
  const primary = state.activeSensations[0];
  const region = primary.regions[0] || 'whole-body';
  const nsLabel = getNervousSystemLabel(state.nervousSystemBalance);
  
  return `${capitalizeFirst(primary.sensation)} in ${getRegionName(region)} • ${nsLabel}`;
}

// Helper functions
function getNervousSystemKey(balance: number): keyof typeof NS_DESCRIPTIONS {
  if (balance > 0.5) return 'high-sympathetic';
  if (balance > 0.15) return 'moderate-sympathetic';
  if (balance < -0.5) return 'high-parasympathetic';
  if (balance < -0.15) return 'moderate-parasympathetic';
  return 'balanced';
}

function getNervousSystemLabel(balance: number): string {
  if (balance > 0.5) return 'Activated';
  if (balance > 0.15) return 'Energized';
  if (balance < -0.5) return 'Deep Rest';
  if (balance < -0.15) return 'Relaxed';
  return 'Balanced';
}

function getRegionName(region: BodyRegion): string {
  const names: Record<BodyRegion, string> = {
    'crown': 'crown',
    'third-eye': 'third eye',
    'throat': 'throat',
    'heart': 'heart',
    'solar-plexus': 'solar plexus',
    'sacral': 'sacrum',
    'root': 'root',
    'spine': 'spine',
    'hands': 'hands',
    'feet': 'feet',
    'chest': 'chest',
    'belly': 'belly',
    'limbs': 'limbs',
    'skin': 'skin',
    'whole-body': 'whole body',
    'jaw': 'jaw'
  };
  return names[region];
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
