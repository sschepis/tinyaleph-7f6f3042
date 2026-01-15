import type { ActivatedArchetype, ArchetypeCategory } from './types';

// Jungian archetypes with associated keywords and symbols
const ARCHETYPES: Record<string, {
  name: string;
  symbol: string;
  keywords: string[];
  primes: number[];
  category: ArchetypeCategory;
}> = {
  hero: {
    name: 'The Hero',
    symbol: '⚔️',
    keywords: ['brave', 'courage', 'fight', 'overcome', 'victory', 'strength', 'challenge', 'triumph', 'quest', 'battle'],
    primes: [2, 3, 5],
    category: 'action'
  },
  sage: {
    name: 'The Sage',
    symbol: '📚',
    keywords: ['wisdom', 'knowledge', 'truth', 'understanding', 'insight', 'learn', 'analyze', 'study', 'discover', 'think'],
    primes: [7, 11, 13],
    category: 'wisdom'
  },
  magician: {
    name: 'The Magician',
    symbol: '✨',
    keywords: ['transform', 'create', 'manifest', 'change', 'power', 'magic', 'possibility', 'alchemy', 'vision', 'catalyst'],
    primes: [17, 19, 23],
    category: 'transformation'
  },
  lover: {
    name: 'The Lover',
    symbol: '💕',
    keywords: ['love', 'passion', 'beauty', 'connection', 'intimacy', 'heart', 'desire', 'romance', 'feeling', 'emotion'],
    primes: [29, 31, 37],
    category: 'emotion'
  },
  rebel: {
    name: 'The Rebel',
    symbol: '🔥',
    keywords: ['break', 'rebel', 'revolution', 'freedom', 'disrupt', 'radical', 'challenge', 'against', 'change', 'destroy'],
    primes: [41, 43, 47],
    category: 'action'
  },
  creator: {
    name: 'The Creator',
    symbol: '🎨',
    keywords: ['create', 'imagine', 'art', 'design', 'build', 'express', 'innovation', 'original', 'vision', 'craft'],
    primes: [53, 59, 61],
    category: 'creation'
  },
  caregiver: {
    name: 'The Caregiver',
    symbol: '🤲',
    keywords: ['care', 'nurture', 'protect', 'help', 'support', 'compassion', 'heal', 'serve', 'generous', 'kind'],
    primes: [67, 71, 73],
    category: 'emotion'
  },
  ruler: {
    name: 'The Ruler',
    symbol: '👑',
    keywords: ['lead', 'control', 'order', 'power', 'authority', 'success', 'command', 'responsibility', 'status', 'stability'],
    primes: [79, 83, 89],
    category: 'action'
  },
  innocent: {
    name: 'The Innocent',
    symbol: '🌸',
    keywords: ['pure', 'simple', 'hope', 'optimism', 'faith', 'trust', 'goodness', 'paradise', 'wonder', 'joy'],
    primes: [97, 101, 103],
    category: 'spirit'
  },
  explorer: {
    name: 'The Explorer',
    symbol: '🧭',
    keywords: ['discover', 'journey', 'adventure', 'seek', 'explore', 'freedom', 'authentic', 'wander', 'experience', 'independent'],
    primes: [107, 109, 113],
    category: 'transformation'
  },
  shadow: {
    name: 'The Shadow',
    symbol: '🌑',
    keywords: ['dark', 'hidden', 'fear', 'repressed', 'unconscious', 'shadow', 'deny', 'suppress', 'nightmare', 'secret'],
    primes: [127, 131, 137],
    category: 'shadow'
  },
  anima: {
    name: 'The Anima',
    symbol: '🌙',
    keywords: ['feminine', 'intuition', 'receptive', 'nurturing', 'creative', 'emotional', 'dream', 'soul', 'inner', 'beauty'],
    primes: [139, 149, 151],
    category: 'spirit'
  },
  animus: {
    name: 'The Animus',
    symbol: '☀️',
    keywords: ['masculine', 'rational', 'assertive', 'action', 'logic', 'strength', 'focus', 'decisive', 'will', 'purpose'],
    primes: [157, 163, 167],
    category: 'action'
  },
  self: {
    name: 'The Self',
    symbol: '☯️',
    keywords: ['whole', 'unity', 'integration', 'center', 'complete', 'balance', 'harmony', 'transcend', 'enlighten', 'totality'],
    primes: [173, 179, 181],
    category: 'wisdom'
  },
  trickster: {
    name: 'The Trickster',
    symbol: '🃏',
    keywords: ['trick', 'joke', 'paradox', 'absurd', 'chaos', 'humor', 'play', 'mischief', 'irony', 'surprise'],
    primes: [191, 193, 197],
    category: 'transformation'
  },
  mother: {
    name: 'The Great Mother',
    symbol: '🌍',
    keywords: ['mother', 'birth', 'nature', 'nurture', 'earth', 'fertility', 'creation', 'origin', 'comfort', 'abundance'],
    primes: [199, 211, 223],
    category: 'creation'
  }
};

// I-Ching trigrams for additional symbolic layer
const TRIGRAMS: Record<string, { name: string; symbol: string; meaning: string; lines: boolean[] }> = {
  heaven: { name: 'Heaven', symbol: '☰', meaning: 'Creative force', lines: [true, true, true] },
  earth: { name: 'Earth', symbol: '☷', meaning: 'Receptive ground', lines: [false, false, false] },
  thunder: { name: 'Thunder', symbol: '☳', meaning: 'Awakening shock', lines: [false, false, true] },
  water: { name: 'Water', symbol: '☵', meaning: 'Flowing depth', lines: [false, true, false] },
  mountain: { name: 'Mountain', symbol: '☶', meaning: 'Still wisdom', lines: [true, false, false] },
  wind: { name: 'Wind', symbol: '☴', meaning: 'Gentle penetration', lines: [true, true, false] },
  fire: { name: 'Fire', symbol: '☲', meaning: 'Illuminating clarity', lines: [true, false, true] },
  lake: { name: 'Lake', symbol: '☱', meaning: 'Joyful expression', lines: [false, true, true] }
};

// Tarot major arcana
const TAROT: Record<string, { name: string; symbol: string; meaning: string; number: number }> = {
  fool: { name: 'The Fool', symbol: '0', meaning: 'New beginnings', number: 0 },
  magician: { name: 'The Magician', symbol: 'I', meaning: 'Manifestation', number: 1 },
  priestess: { name: 'High Priestess', symbol: 'II', meaning: 'Intuition', number: 2 },
  empress: { name: 'The Empress', symbol: 'III', meaning: 'Abundance', number: 3 },
  emperor: { name: 'The Emperor', symbol: 'IV', meaning: 'Structure', number: 4 },
  hierophant: { name: 'Hierophant', symbol: 'V', meaning: 'Tradition', number: 5 },
  lovers: { name: 'The Lovers', symbol: 'VI', meaning: 'Choice & Union', number: 6 },
  chariot: { name: 'The Chariot', symbol: 'VII', meaning: 'Willpower', number: 7 },
  strength: { name: 'Strength', symbol: 'VIII', meaning: 'Inner power', number: 8 },
  hermit: { name: 'The Hermit', symbol: 'IX', meaning: 'Inner wisdom', number: 9 },
  wheel: { name: 'Wheel of Fortune', symbol: 'X', meaning: 'Cycles', number: 10 },
  justice: { name: 'Justice', symbol: 'XI', meaning: 'Balance', number: 11 },
  hanged: { name: 'Hanged Man', symbol: 'XII', meaning: 'Surrender', number: 12 },
  death: { name: 'Death', symbol: 'XIII', meaning: 'Transformation', number: 13 },
  temperance: { name: 'Temperance', symbol: 'XIV', meaning: 'Integration', number: 14 },
  devil: { name: 'The Devil', symbol: 'XV', meaning: 'Shadow bonds', number: 15 },
  tower: { name: 'The Tower', symbol: 'XVI', meaning: 'Sudden change', number: 16 },
  star: { name: 'The Star', symbol: 'XVII', meaning: 'Hope', number: 17 },
  moon: { name: 'The Moon', symbol: 'XVIII', meaning: 'Illusion', number: 18 },
  sun: { name: 'The Sun', symbol: 'XIX', meaning: 'Joy', number: 19 },
  judgement: { name: 'Judgement', symbol: 'XX', meaning: 'Awakening', number: 20 },
  world: { name: 'The World', symbol: 'XXI', meaning: 'Completion', number: 21 }
};

/**
 * Calculate prime-based semantic resonance for a word
 */
function wordToPrimeSignature(word: string): number[] {
  const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
  const signature: number[] = [];
  
  for (let i = 0; i < word.length && i < primes.length; i++) {
    signature.push(word.charCodeAt(i) * primes[i]);
  }
  
  return signature;
}

/**
 * Calculate resonance between word and archetype primes
 */
function calculateArchetypeResonance(word: string, archetypePrimes: number[]): number {
  const signature = wordToPrimeSignature(word);
  if (signature.length === 0) return 0;
  
  let resonance = 0;
  for (const sig of signature) {
    for (const prime of archetypePrimes) {
      // Check for harmonic relationships
      if (sig % prime === 0 || prime % sig === 0) {
        resonance += 0.3;
      }
      // Check for golden ratio proximity
      const ratio = sig / prime;
      const phi = (1 + Math.sqrt(5)) / 2;
      if (Math.abs(ratio - phi) < 0.5 || Math.abs(ratio - 1/phi) < 0.5) {
        resonance += 0.2;
      }
    }
  }
  
  return Math.min(1, resonance);
}

/**
 * Analyze text and extract activated archetypes
 */
export function analyzeArchetypes(text: string): ActivatedArchetype[] {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);
  const activated: ActivatedArchetype[] = [];
  
  for (const [id, archetype] of Object.entries(ARCHETYPES)) {
    let activation = 0;
    const matchedKeywords: string[] = [];
    
    // Check for keyword matches
    for (const keyword of archetype.keywords) {
      if (lowerText.includes(keyword)) {
        activation += 0.15;
        matchedKeywords.push(keyword);
      }
    }
    
    // Calculate prime resonance with text words
    for (const word of words.slice(0, 50)) {
      const resonance = calculateArchetypeResonance(word, archetype.primes);
      activation += resonance * 0.05;
    }
    
    if (activation > 0.1) {
      activated.push({
        id,
        name: archetype.name,
        symbol: archetype.symbol,
        activation: Math.min(1, activation),
        primes: archetype.primes,
        category: archetype.category,
        matchedKeywords
      });
    }
  }
  
  // Sort by activation and return top results
  return activated.sort((a, b) => b.activation - a.activation).slice(0, 6);
}

/**
 * Get active trigram based on hexagram lines
 */
export function getActiveTrigram(hexagramLines: boolean[]): { upper: typeof TRIGRAMS[keyof typeof TRIGRAMS]; lower: typeof TRIGRAMS[keyof typeof TRIGRAMS] } {
  const upperLines = hexagramLines.slice(3);
  const lowerLines = hexagramLines.slice(0, 3);
  
  const findTrigram = (lines: boolean[]) => {
    for (const [, trigram] of Object.entries(TRIGRAMS)) {
      if (trigram.lines.every((l, i) => l === lines[i])) {
        return trigram;
      }
    }
    return TRIGRAMS.earth;
  };
  
  return {
    upper: findTrigram(upperLines),
    lower: findTrigram(lowerLines)
  };
}

/**
 * Get active tarot card based on entropy and content analysis
 */
export function getActiveTarot(entropy: number, archetypes: ActivatedArchetype[]): typeof TAROT[keyof typeof TAROT] {
  // Map entropy to tarot number (0-21)
  const baseNumber = Math.floor(entropy * 21);
  
  // Adjust based on active archetypes
  let adjustedNumber = baseNumber;
  
  if (archetypes.some(a => a.id === 'hero')) adjustedNumber = 7; // Chariot
  else if (archetypes.some(a => a.id === 'sage')) adjustedNumber = 9; // Hermit
  else if (archetypes.some(a => a.id === 'magician')) adjustedNumber = 1; // Magician
  else if (archetypes.some(a => a.id === 'shadow')) adjustedNumber = 15; // Devil
  else if (archetypes.some(a => a.id === 'self')) adjustedNumber = 21; // World
  else if (archetypes.some(a => a.id === 'lover')) adjustedNumber = 6; // Lovers
  else if (archetypes.some(a => a.id === 'creator')) adjustedNumber = 3; // Empress
  else if (archetypes.some(a => a.id === 'rebel')) adjustedNumber = 16; // Tower
  
  const tarotArray = Object.values(TAROT);
  return tarotArray[Math.min(adjustedNumber, tarotArray.length - 1)];
}

/**
 * Calculate overall symbolic resonance field
 */
export function calculateSymbolicField(archetypes: ActivatedArchetype[]): {
  dominantCategory: ArchetypeCategory;
  fieldStrength: number;
  primeSum: number;
} {
  if (archetypes.length === 0) {
    return { dominantCategory: 'wisdom', fieldStrength: 0, primeSum: 0 };
  }
  
  const categories: Record<ArchetypeCategory, number> = {
    action: 0,
    wisdom: 0,
    emotion: 0,
    transformation: 0,
    creation: 0,
    spirit: 0,
    shadow: 0
  };
  
  let primeSum = 0;
  let totalActivation = 0;
  
  for (const arch of archetypes) {
    categories[arch.category] += arch.activation;
    totalActivation += arch.activation;
    primeSum += arch.primes.reduce((a, b) => a + b, 0);
  }
  
  const dominantCategory = (Object.entries(categories)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'wisdom') as ArchetypeCategory;
  
  return {
    dominantCategory,
    fieldStrength: Math.min(1, totalActivation / 3),
    primeSum
  };
}
