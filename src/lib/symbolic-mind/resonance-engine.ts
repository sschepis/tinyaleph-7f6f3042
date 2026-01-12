import type { Symbol, MindState, ResonanceResult, WaveState } from './types';
import { SYMBOL_DATABASE, KEYWORD_MAP, getAllSymbols, CATEGORY_RESONANCE } from './symbol-database';

const PHI = (1 + Math.sqrt(5)) / 2; // Golden ratio
const COHERENCE_THRESHOLD = 0.72;
const MAX_ITERATIONS = 25;
const WAVE_DIMENSIONS = 16; // Sedenion dimensions

// ============= WAVE INTERFERENCE MODEL =============

// Generate a waveform from a prime number
function primeToWave(prime: number): number[] {
  const wave = new Array(WAVE_DIMENSIONS).fill(0);
  
  // Each prime creates a unique interference pattern
  for (let i = 0; i < WAVE_DIMENSIONS; i++) {
    // Multiple harmonics based on prime structure
    const fundamental = Math.sin((prime * (i + 1) * PHI) % (2 * Math.PI));
    const harmonic2 = Math.sin((prime * (i + 1) * PHI * 2) % (2 * Math.PI)) * 0.5;
    const harmonic3 = Math.cos((prime * (i + 1) / PHI) % (2 * Math.PI)) * 0.25;
    
    wave[i] = fundamental + harmonic2 + harmonic3;
  }
  
  // Normalize
  const norm = Math.sqrt(wave.reduce((sum, v) => sum + v * v, 0));
  return norm > 0 ? wave.map(v => v / norm) : wave;
}

// Superpose multiple waves with interference
function superposeWaves(waves: { wave: number[]; amplitude: number; phase: number }[]): number[] {
  if (waves.length === 0) return new Array(WAVE_DIMENSIONS).fill(0);
  
  const superposed = new Array(WAVE_DIMENSIONS).fill(0);
  
  for (const { wave, amplitude, phase } of waves) {
    for (let i = 0; i < WAVE_DIMENSIONS; i++) {
      // Apply phase shift and amplitude
      const phaseShift = Math.cos(phase + (i * Math.PI / WAVE_DIMENSIONS));
      superposed[i] += wave[i] * amplitude * (1 + phaseShift * 0.3);
    }
  }
  
  // Normalize the superposition
  const norm = Math.sqrt(superposed.reduce((sum, v) => sum + v * v, 0));
  return norm > 0 ? superposed.map(v => v / norm) : superposed;
}

// Calculate interference between two waves (constructive = positive, destructive = negative)
function calculateInterference(wave1: number[], wave2: number[]): { 
  interference: number; 
  constructive: number; 
  destructive: number 
} {
  let constructive = 0;
  let destructive = 0;
  
  for (let i = 0; i < WAVE_DIMENSIONS; i++) {
    const product = wave1[i] * wave2[i];
    if (product > 0) {
      constructive += product;
    } else {
      destructive += Math.abs(product);
    }
  }
  
  const total = constructive + destructive;
  const interference = total > 0 ? (constructive - destructive) / total : 0;
  
  return { interference, constructive, destructive };
}

// Calculate resonance between two symbols using wave interference
function computeResonance(s1: Symbol, s2: Symbol): number {
  const wave1 = s1.state || primeToWave(s1.prime);
  const wave2 = s2.state || primeToWave(s2.prime);
  
  // Wave interference score
  const { interference, constructive } = calculateInterference(wave1, wave2);
  
  // Prime ratio bonus (golden ratio proximity)
  const ratio = Math.max(s1.prime, s2.prime) / Math.min(s1.prime, s2.prime);
  const phiProximity = 1 - Math.min(
    Math.abs(ratio - PHI), 
    Math.abs(ratio - PHI * PHI),
    Math.abs(ratio - PHI * PHI * PHI)
  ) / PHI;
  
  // Category resonance bonus
  let categoryBonus = 0;
  if (s1.category === s2.category) {
    categoryBonus = 0.15;
  } else if (CATEGORY_RESONANCE[s1.category]?.includes(s2.category)) {
    categoryBonus = 0.08;
  }
  
  // Culture harmony
  const cultureBonus = s1.culture === s2.culture ? 0.05 : 0;
  
  // Combine factors with interference as primary driver
  const baseScore = (interference + 1) / 2; // Normalize to 0-1
  const finalScore = baseScore * 0.5 + constructive * 0.2 + phiProximity * 0.15 + categoryBonus + cultureBonus;
  
  return Math.max(0, Math.min(1, finalScore));
}

// Each archetype resonates symbols from its domain
function getResonantSymbols(anchor: Symbol, allSymbols: Symbol[], count: number = 3): Symbol[] {
  const resonances: { symbol: Symbol; score: number }[] = [];
  
  for (const symbol of allSymbols) {
    if (symbol.id === anchor.id) continue;
    
    const score = computeResonance(anchor, symbol);
    resonances.push({ symbol, score });
  }
  
  // Sort by resonance and return top matches
  resonances.sort((a, b) => b.score - a.score);
  return resonances.slice(0, count).map(r => r.symbol);
}

// Extract symbols from user text
export function inferSymbolsFromText(text: string): Symbol[] {
  const lowerText = text.toLowerCase();
  const foundSymbols: Map<string, { symbol: Symbol; strength: number }> = new Map();
  
  // Check each keyword mapping
  for (const [symbolId, keywords] of Object.entries(KEYWORD_MAP)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        const symbol = SYMBOL_DATABASE[symbolId];
        if (symbol) {
          const existing = foundSymbols.get(symbolId);
          // Accumulate strength for multiple keyword matches
          const strength = (existing?.strength || 0) + 1;
          foundSymbols.set(symbolId, { 
            symbol: { ...symbol, state: primeToWave(symbol.prime) },
            strength 
          });
        }
      }
    }
  }
  
  // If no symbols found, use query pattern detection
  if (foundSymbols.size === 0) {
    if (lowerText.includes('?')) {
      const sage = SYMBOL_DATABASE.sage;
      foundSymbols.set('sage', { 
        symbol: { ...sage, state: primeToWave(sage.prime) }, 
        strength: 1 
      });
    }
    if (lowerText.includes('help') || lowerText.includes('need')) {
      const hero = SYMBOL_DATABASE.hero;
      foundSymbols.set('hero', { 
        symbol: { ...hero, state: primeToWave(hero.prime) }, 
        strength: 1 
      });
    }
    if (lowerText.includes('feel') || lowerText.includes('emotion')) {
      const water = SYMBOL_DATABASE.water;
      foundSymbols.set('water', { 
        symbol: { ...water, state: primeToWave(water.prime) }, 
        strength: 1 
      });
    }
    if (lowerText.includes('decide') || lowerText.includes('choice')) {
      const threshold = SYMBOL_DATABASE.threshold;
      foundSymbols.set('threshold', { 
        symbol: { ...threshold, state: primeToWave(threshold.prime) }, 
        strength: 1 
      });
    }
    // Fallback
    if (foundSymbols.size === 0) {
      const self = SYMBOL_DATABASE.self;
      foundSymbols.set('self', { 
        symbol: { ...self, state: primeToWave(self.prime) }, 
        strength: 1 
      });
    }
  }
  
  // Sort by strength and return
  return Array.from(foundSymbols.values())
    .sort((a, b) => b.strength - a.strength)
    .map(({ symbol }) => symbol);
}

// ============= WAVE SUPERPOSITION COLLAPSE =============

export interface SuperpositionState {
  waves: WaveState[];
  collapsed: number[];
  probability: number;
}

// Run the resonance loop with wave interference
export function runResonanceLoop(
  inputSymbols: Symbol[],
  anchoringSymbols: Symbol[],
  onIteration?: (state: MindState) => void
): MindState {
  // Initialize wave states for anchors
  const anchors = anchoringSymbols.map(s => ({
    ...s,
    state: s.state || primeToWave(s.prime)
  }));
  
  // Initialize input symbols with their waves
  let activeSymbols = inputSymbols.map(s => ({
    ...s,
    state: s.state || primeToWave(s.prime)
  }));
  
  let iteration = 0;
  let coherence = 0;
  let converged = false;
  
  // Superposition of all active waves
  let superposition: number[] = [];
  
  // Get all symbols for resonance lookup
  const allSymbols = getAllSymbols();
  
  while (iteration < MAX_ITERATIONS && !converged) {
    iteration++;
    
    // Each anchor resonates its own symbols back
    const resonatedSymbols: Map<string, { symbol: Symbol; amplitude: number }> = new Map();
    
    for (const anchor of anchors) {
      // Calculate how strongly this anchor is activated by input
      let anchorActivation = 0;
      for (const active of activeSymbols) {
        anchorActivation += computeResonance(active, anchor);
      }
      anchorActivation /= Math.max(activeSymbols.length, 1);
      
      // If anchor is sufficiently activated, it resonates its domain symbols
      if (anchorActivation > 0.25) {
        const resonant = getResonantSymbols(anchor, allSymbols, 2);
        
        for (const symbol of resonant) {
          const existing = resonatedSymbols.get(symbol.id);
          const amplitude = anchorActivation * computeResonance(anchor, symbol);
          
          if (!existing || amplitude > existing.amplitude) {
            resonatedSymbols.set(symbol.id, {
              symbol: { ...symbol, state: primeToWave(symbol.prime) },
              amplitude
            });
          }
        }
      }
    }
    
    // Add strongly resonated symbols to active set
    for (const { symbol, amplitude } of resonatedSymbols.values()) {
      if (amplitude > 0.3 && !activeSymbols.find(s => s.id === symbol.id)) {
        // Ensure the symbol has a state before adding
        const symbolWithState = {
          ...symbol,
          state: symbol.state || primeToWave(symbol.prime)
        };
        activeSymbols.push(symbolWithState);
      }
    }
    
    // Build superposition from all active waves
    const waves = activeSymbols.map((s, i) => ({
      wave: s.state || primeToWave(s.prime),
      amplitude: 1 / Math.sqrt(activeSymbols.length), // Normalize amplitudes
      phase: (i * Math.PI * 2) / activeSymbols.length // Distribute phases
    }));
    
    superposition = superposeWaves(waves);
    
    // Calculate coherence as interference quality with anchors
    let totalInterference = 0;
    let activeAnchors = 0;
    
    for (const anchor of anchors) {
      const { interference } = calculateInterference(superposition, anchor.state!);
      if (interference > 0) {
        totalInterference += interference;
        activeAnchors++;
      }
    }
    
    coherence = activeAnchors > 0 
      ? (totalInterference / activeAnchors) * (1 + Math.log(activeSymbols.length) * 0.1)
      : 0;
    
    coherence = Math.min(1, Math.max(0, coherence));
    converged = coherence >= COHERENCE_THRESHOLD;
    
    const state: MindState = {
      anchoringSymbols: anchors,
      activeSymbols: [...activeSymbols],
      coherence,
      iteration,
      converged,
      superposition, // Include the superposition state
    };
    
    onIteration?.(state);
  }
  
  return {
    anchoringSymbols: anchors,
    activeSymbols,
    coherence,
    iteration,
    converged,
    superposition,
  };
}

// Collapse the superposition to select output symbols
export function selectOutputSymbols(state: MindState): Symbol[] {
  if (!state.superposition || state.activeSymbols.length === 0) {
    return state.activeSymbols.slice(0, 5);
  }
  
  // Calculate "collapse probability" for each active symbol
  const collapseScores: { symbol: Symbol; probability: number }[] = [];
  
  for (const symbol of state.activeSymbols) {
    const wave = symbol.state || primeToWave(symbol.prime);
    const { interference, constructive } = calculateInterference(wave, state.superposition);
    
    // Probability weighted by interference quality and prime fundamentality
    const probability = (interference + 1) / 2 * constructive * (1000 / symbol.prime);
    
    collapseScores.push({ symbol, probability });
  }
  
  // Sort by collapse probability
  collapseScores.sort((a, b) => b.probability - a.probability);
  
  // Return top symbols that "survive" the collapse
  return collapseScores.slice(0, Math.min(6, collapseScores.length)).map(s => s.symbol);
}

// Get default anchoring symbols - diverse across traditions
export function getDefaultAnchors(): Symbol[] {
  const anchorIds = [
    // Archetypes
    'self', 'shadow', 'sage',
    // Tarot
    'fool', 'magician', 'tower',
    // I-Ching
    'heaven', 'ichingEarth',
    // Planetary
    'planetSun', 'saturn',
    // Geometry
    'flowerOfLife', 'merkaba',
  ];
  
  return anchorIds.map(id => {
    const baseSymbol = SYMBOL_DATABASE[id];
    if (!baseSymbol) {
      console.warn(`Symbol ${id} not found in database`);
      return null;
    }
    return {
      ...baseSymbol,
      state: primeToWave(baseSymbol.prime)
    } as Symbol;
  }).filter(Boolean) as Symbol[];
}

// Get symbols grouped by tradition for display
export function getSymbolsByTradition(): Record<string, Symbol[]> {
  const traditions: Record<string, Symbol[]> = {
    'Jungian Archetypes': [],
    'Tarot Major Arcana': [],
    'I-Ching Trigrams': [],
    'Planetary': [],
    'Sacred Geometry': [],
    'Elements': [],
    'Universal Concepts': [],
  };
  
  for (const symbol of getAllSymbols()) {
    switch (symbol.category) {
      case 'archetype':
        traditions['Jungian Archetypes'].push(symbol);
        break;
      case 'tarot':
        traditions['Tarot Major Arcana'].push(symbol);
        break;
      case 'iching':
        traditions['I-Ching Trigrams'].push(symbol);
        break;
      case 'planetary':
        traditions['Planetary'].push(symbol);
        break;
      case 'geometry':
        traditions['Sacred Geometry'].push(symbol);
        break;
      case 'element':
        traditions['Elements'].push(symbol);
        break;
      default:
        traditions['Universal Concepts'].push(symbol);
    }
  }
  
  return traditions;
}
