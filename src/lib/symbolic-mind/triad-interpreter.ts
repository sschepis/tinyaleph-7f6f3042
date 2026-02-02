/**
 * Symbolic Triad Interpreter
 * 
 * Generates rich narrative interpretations when 3+ symbols are active,
 * combining symbolic meaning with somatic resonance to create deeper readings.
 */

import { SYMBOL_DATABASE } from './symbol-database';
import { getSomaticByPrime, aggregateSomaticState, type AggregateSomaticState } from './somatic-database';
import type { SymbolicSymbol, SomaticMapping } from './types';

// ============= TYPES =============

export interface TriadMember {
  prime: number;
  amplitude: number;
  symbol: SymbolicSymbol | null;
  somatic: SomaticMapping | undefined;
  meaning: string;
}

export interface TriadRelationship {
  type: 'tension' | 'harmony' | 'transformation' | 'paradox' | 'synthesis';
  description: string;
  intensity: number;
}

export interface TriadInterpretation {
  members: TriadMember[];
  relationships: TriadRelationship[];
  narrative: string;
  somaticNarrative: string;
  theme: string;
  archetype: string;
  actionGuidance: string;
  timestamp: number;
}

// ============= PRIME TO SYMBOL LOOKUP =============

const PRIME_TO_SYMBOL: Map<number, SymbolicSymbol> = new Map(
  Object.values(SYMBOL_DATABASE).map(s => [s.prime, s])
);

// ============= RELATIONSHIP DETECTION =============

const RELATIONSHIP_PATTERNS: {
  categories: [string, string];
  type: TriadRelationship['type'];
  templates: string[];
}[] = [
  // Tension patterns
  { categories: ['archetype', 'concept'], type: 'tension', templates: [
    '{0} wrestles with the concept of {1}',
    'The archetype of {0} confronts {1}',
    '{0} is challenged by the presence of {1}'
  ]},
  { categories: ['emotion', 'concept'], type: 'tension', templates: [
    'The feeling of {0} meets the idea of {1}',
    '{0} arises in response to {1}',
    '{1} evokes the sensation of {0}'
  ]},
  
  // Harmony patterns
  { categories: ['element', 'element'], type: 'harmony', templates: [
    '{0} and {1} dance in elemental balance',
    'The forces of {0} and {1} find equilibrium',
    '{0} harmonizes with {1}'
  ]},
  { categories: ['celestial', 'celestial'], type: 'harmony', templates: [
    '{0} and {1} align in celestial conjunction',
    'The energies of {0} and {1} merge',
    '{0} reflects the light of {1}'
  ]},
  
  // Transformation patterns
  { categories: ['journey', 'archetype'], type: 'transformation', templates: [
    'The {0} transforms the {1}',
    'Through {0}, the {1} evolves',
    '{1} undergoes {0}'
  ]},
  { categories: ['tarot', 'emotion'], type: 'transformation', templates: [
    '{0} catalyzes a shift in {1}',
    'The energy of {0} transmutes {1}',
    '{1} is transformed by {0}'
  ]},
  
  // Paradox patterns
  { categories: ['concept', 'concept'], type: 'paradox', templates: [
    '{0} and {1} exist in productive tension',
    'The paradox of {0} meeting {1} reveals deeper truth',
    '{0} contains its opposite in {1}'
  ]},
  
  // Synthesis patterns
  { categories: ['geometry', 'element'], type: 'synthesis', templates: [
    'The sacred form of {0} channels {1}',
    '{0} gives structure to {1}',
    '{1} flows through the pattern of {0}'
  ]},
  { categories: ['planetary', 'archetype'], type: 'synthesis', templates: [
    'The influence of {0} empowers the {1}',
    '{0} and {1} unite in cosmic purpose',
    'The {1} receives the blessing of {0}'
  ]}
];

function detectRelationship(a: TriadMember, b: TriadMember): TriadRelationship | null {
  if (!a.symbol || !b.symbol) {
    // Generic relationship for unmapped symbols
    return {
      type: 'synthesis',
      description: `${a.meaning} interweaves with ${b.meaning}`,
      intensity: (a.amplitude + b.amplitude) / 2
    };
  }
  
  const catA = a.symbol.category;
  const catB = b.symbol.category;
  
  // Find matching pattern
  for (const pattern of RELATIONSHIP_PATTERNS) {
    if ((pattern.categories[0] === catA && pattern.categories[1] === catB) ||
        (pattern.categories[0] === catB && pattern.categories[1] === catA)) {
      const template = pattern.templates[Math.floor(Math.random() * pattern.templates.length)];
      const desc = template.replace('{0}', a.symbol.name).replace('{1}', b.symbol.name);
      
      return {
        type: pattern.type,
        description: desc,
        intensity: (a.amplitude + b.amplitude) / 2
      };
    }
  }
  
  // Default synthesis relationship
  return {
    type: 'synthesis',
    description: `${a.symbol.name} meets ${b.symbol.name} in meaningful confluence`,
    intensity: (a.amplitude + b.amplitude) / 2
  };
}

// ============= THEME DETECTION =============

const THEME_PATTERNS: { keywords: string[]; theme: string; archetype: string }[] = [
  { keywords: ['hero', 'challenge', 'courage', 'battle', 'warrior'], theme: 'The Hero\'s Journey', archetype: 'The Warrior' },
  { keywords: ['shadow', 'dark', 'unconscious', 'hidden', 'death'], theme: 'Shadow Integration', archetype: 'The Shadow' },
  { keywords: ['love', 'heart', 'union', 'lovers', 'venus'], theme: 'Sacred Union', archetype: 'The Lover' },
  { keywords: ['wisdom', 'sage', 'knowledge', 'hermit', 'third-eye'], theme: 'The Quest for Wisdom', archetype: 'The Sage' },
  { keywords: ['change', 'transformation', 'death', 'wheel', 'tower'], theme: 'Transformation', archetype: 'The Phoenix' },
  { keywords: ['mother', 'nurture', 'earth', 'empress', 'fertility'], theme: 'The Great Mother', archetype: 'The Nurturer' },
  { keywords: ['father', 'authority', 'emperor', 'structure', 'law'], theme: 'Sovereign Power', archetype: 'The Ruler' },
  { keywords: ['child', 'innocent', 'fool', 'beginning', 'play'], theme: 'Divine Innocence', archetype: 'The Child' },
  { keywords: ['spiral', 'cycle', 'return', 'wheel', 'time'], theme: 'Eternal Return', archetype: 'The Cyclical' },
  { keywords: ['star', 'hope', 'light', 'sun', 'radiance'], theme: 'Illumination', archetype: 'The Light-Bringer' },
  { keywords: ['void', 'emptiness', 'moon', 'mystery', 'unknown'], theme: 'The Fertile Void', archetype: 'The Mystery' },
  { keywords: ['fire', 'passion', 'anger', 'mars', 'power'], theme: 'Sacred Fire', archetype: 'The Transformer' },
  { keywords: ['water', 'emotion', 'flow', 'sorrow', 'neptune'], theme: 'Emotional Depths', archetype: 'The Dreamer' },
  { keywords: ['air', 'thought', 'mercury', 'communication'], theme: 'Mental Clarity', archetype: 'The Messenger' },
  { keywords: ['earth', 'ground', 'stability', 'saturn', 'root'], theme: 'Grounding', archetype: 'The Builder' }
];

function detectTheme(members: TriadMember[]): { theme: string; archetype: string } {
  const allText = members.map(m => {
    const parts = [m.meaning.toLowerCase()];
    if (m.symbol) {
      parts.push(m.symbol.id, m.symbol.category, m.symbol.meaning.toLowerCase());
    }
    return parts.join(' ');
  }).join(' ');
  
  let bestMatch = { theme: 'The Unfolding Mystery', archetype: 'The Seeker', score: 0 };
  
  for (const pattern of THEME_PATTERNS) {
    const score = pattern.keywords.filter(kw => allText.includes(kw)).length;
    if (score > bestMatch.score) {
      bestMatch = { theme: pattern.theme, archetype: pattern.archetype, score };
    }
  }
  
  return { theme: bestMatch.theme, archetype: bestMatch.archetype };
}

// ============= NARRATIVE GENERATION =============

const OPENING_PHRASES = [
  'In this moment of confluence,',
  'The symbols speak together:',
  'A meaningful pattern emerges—',
  'The triad reveals:',
  'From the dance of these symbols,',
  'The resonance speaks:',
  'Listen to what arises:'
];

const TRANSITION_PHRASES = [
  'Meanwhile,',
  'At the same time,',
  'Simultaneously,',
  'In counterpoint,',
  'Woven through this,',
  'Complementing this,'
];

const CLOSING_PHRASES = [
  'This is an invitation to {action}.',
  'The moment calls for {action}.',
  'Consider this: {action}.',
  'The symbols suggest: {action}.',
  'Perhaps it is time to {action}.'
];

const ACTION_GUIDANCE_MAP: Record<string, string[]> = {
  'tension': ['sit with the discomfort', 'explore the edges', 'find where opposites meet', 'hold both truths'],
  'harmony': ['move with the flow', 'accept the gift', 'amplify this alignment', 'celebrate the connection'],
  'transformation': ['release what was', 'embrace the change', 'trust the process', 'step into the new'],
  'paradox': ['transcend either/or thinking', 'find the third way', 'hold the mystery', 'let paradox teach'],
  'synthesis': ['integrate these energies', 'create from this union', 'honor all parts', 'weave them together']
};

function generateNarrative(members: TriadMember[], relationships: TriadRelationship[]): string {
  const parts: string[] = [];
  
  // Opening
  parts.push(OPENING_PHRASES[Math.floor(Math.random() * OPENING_PHRASES.length)]);
  
  // Primary symbol
  const primary = members[0];
  if (primary.symbol) {
    parts.push(`${primary.symbol.name} (${primary.symbol.unicode}) stands at the center, speaking of ${primary.symbol.meaning.toLowerCase()}.`);
  } else {
    parts.push(`Prime ${primary.prime} pulses at the center, carrying the essence of "${primary.meaning}".`);
  }
  
  // Secondary symbols and relationships
  for (let i = 1; i < Math.min(members.length, 3); i++) {
    const member = members[i];
    const rel = relationships.find(r => r.description.includes(member.meaning) || 
      (member.symbol && r.description.includes(member.symbol.name)));
    
    if (i === 1) {
      if (member.symbol) {
        parts.push(`${member.symbol.name} joins the resonance, offering ${member.symbol.meaning.toLowerCase()}.`);
      } else {
        parts.push(`"${member.meaning}" weaves into the pattern.`);
      }
    } else {
      const transition = TRANSITION_PHRASES[Math.floor(Math.random() * TRANSITION_PHRASES.length)];
      if (member.symbol) {
        parts.push(`${transition} ${member.symbol.name} completes the triad with ${member.symbol.meaning.toLowerCase()}.`);
      } else {
        parts.push(`${transition} "${member.meaning}" rounds out the configuration.`);
      }
    }
  }
  
  // Relationship dynamics
  if (relationships.length > 0) {
    const strongest = relationships.sort((a, b) => b.intensity - a.intensity)[0];
    parts.push(`${strongest.description}.`);
  }
  
  return parts.join(' ');
}

function generateSomaticNarrative(somaticState: AggregateSomaticState): string {
  if (somaticState.dominantRegions.length === 0) {
    return 'The body remains still, awaiting deeper resonance.';
  }
  
  const parts: string[] = [];
  
  // Body regions
  const topRegions = somaticState.dominantRegions.slice(0, 3).map(r => r.region);
  parts.push(`In the body, this configuration awakens the ${topRegions.join(', ')}.`);
  
  // Sensations
  if (somaticState.activeSensations.length > 0) {
    const sensations = somaticState.activeSensations.slice(0, 2).map(s => s.sensation);
    parts.push(`Sensations of ${sensations.join(' and ')} arise.`);
  }
  
  // Nervous system
  const ns = somaticState.nervousSystemBalance;
  if (ns > 0.3) {
    parts.push('The nervous system activates, ready for action.');
  } else if (ns < -0.3) {
    parts.push('A settling calm spreads through the tissues.');
  } else {
    parts.push('The system finds equilibrium between action and rest.');
  }
  
  return parts.join(' ');
}

function generateActionGuidance(relationships: TriadRelationship[]): string {
  if (relationships.length === 0) {
    return 'Observe and let the meaning unfold.';
  }
  
  // Find dominant relationship type
  const typeCounts: Record<string, number> = {};
  for (const rel of relationships) {
    typeCounts[rel.type] = (typeCounts[rel.type] || 0) + rel.intensity;
  }
  
  const dominantType = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])[0][0] as TriadRelationship['type'];
  
  const actions = ACTION_GUIDANCE_MAP[dominantType] || ACTION_GUIDANCE_MAP['synthesis'];
  const action = actions[Math.floor(Math.random() * actions.length)];
  
  const template = CLOSING_PHRASES[Math.floor(Math.random() * CLOSING_PHRASES.length)];
  return template.replace('{action}', action);
}

// ============= MAIN INTERPRETER =============

export function interpretTriad(
  primes: number[],
  amplitudes: number[],
  meaningOverrides?: Map<number, string>
): TriadInterpretation | null {
  // Need at least 3 active symbols
  const activeIndices = amplitudes
    .map((amp, i) => ({ amp, i }))
    .filter(x => x.amp > 0.1)
    .sort((a, b) => b.amp - a.amp)
    .slice(0, 5);
  
  if (activeIndices.length < 3) {
    return null;
  }
  
  // Build members
  const members: TriadMember[] = activeIndices.map(({ amp, i }) => {
    const prime = primes[i];
    const symbol = PRIME_TO_SYMBOL.get(prime) || null;
    const somatic = getSomaticByPrime(prime);
    const meaning = meaningOverrides?.get(prime) || symbol?.name || `Prime ${prime}`;
    
    return { prime, amplitude: amp, symbol, somatic, meaning };
  });
  
  // Detect relationships between pairs
  const relationships: TriadRelationship[] = [];
  for (let i = 0; i < Math.min(members.length, 3); i++) {
    for (let j = i + 1; j < Math.min(members.length, 3); j++) {
      const rel = detectRelationship(members[i], members[j]);
      if (rel) relationships.push(rel);
    }
  }
  
  // Detect theme
  const { theme, archetype } = detectTheme(members);
  
  // Generate narratives
  const narrative = generateNarrative(members, relationships);
  
  // Generate somatic narrative from aggregate state
  const somaticState = aggregateSomaticState(
    members.map(m => m.prime),
    members.map(m => m.amplitude)
  );
  const somaticNarrative = generateSomaticNarrative(somaticState);
  
  // Generate action guidance
  const actionGuidance = generateActionGuidance(relationships);
  
  return {
    members,
    relationships,
    narrative,
    somaticNarrative,
    theme,
    archetype,
    actionGuidance,
    timestamp: Date.now()
  };
}

/**
 * Get a short summary of the triad
 */
export function getTriadSummary(interpretation: TriadInterpretation): string {
  const symbols = interpretation.members
    .slice(0, 3)
    .map(m => m.symbol?.unicode || '◇')
    .join(' ');
  
  return `${symbols} — ${interpretation.theme}`;
}
