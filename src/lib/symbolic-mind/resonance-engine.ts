import type { Symbol, MindState, ResonanceResult } from './types';
import { SYMBOL_DATABASE, KEYWORD_MAP, getAllSymbols } from './symbol-database';

const PHI = (1 + Math.sqrt(5)) / 2; // Golden ratio
const COHERENCE_THRESHOLD = 0.75;
const MAX_ITERATIONS = 20;

// Generate a sedenion-like state from a prime
function primeToState(prime: number): number[] {
  const state = new Array(16).fill(0);
  for (let i = 0; i < 16; i++) {
    const angle = (prime * (i + 1) * PHI) % (2 * Math.PI);
    state[i] = Math.sin(angle) * Math.cos(angle * PHI);
  }
  // Normalize
  const norm = Math.sqrt(state.reduce((sum, v) => sum + v * v, 0));
  return norm > 0 ? state.map(v => v / norm) : state;
}

// Compute resonance between two symbols
function computeResonance(s1: Symbol, s2: Symbol): number {
  const state1 = s1.state || primeToState(s1.prime);
  const state2 = s2.state || primeToState(s2.prime);
  
  // Dot product for base similarity
  let dot = 0;
  for (let i = 0; i < 16; i++) {
    dot += state1[i] * state2[i];
  }
  
  // Prime ratio bonus (golden ratio proximity)
  const ratio = Math.max(s1.prime, s2.prime) / Math.min(s1.prime, s2.prime);
  const phiProximity = 1 - Math.min(Math.abs(ratio - PHI), Math.abs(ratio - PHI * PHI)) / PHI;
  
  // Category bonus
  const categoryBonus = s1.category === s2.category ? 0.1 : 0;
  
  return Math.max(0, Math.min(1, (dot + 1) / 2 * 0.6 + phiProximity * 0.3 + categoryBonus));
}

// Extract symbols from user text
export function inferSymbolsFromText(text: string): Symbol[] {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);
  const foundSymbols: Map<string, Symbol> = new Map();
  
  // Check each keyword mapping
  for (const [symbolId, keywords] of Object.entries(KEYWORD_MAP)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        const symbol = SYMBOL_DATABASE[symbolId];
        if (symbol && !foundSymbols.has(symbolId)) {
          foundSymbols.set(symbolId, { ...symbol, state: primeToState(symbol.prime) });
        }
      }
    }
  }
  
  // If no symbols found, use general concepts based on question type
  if (foundSymbols.size === 0) {
    // Default symbols based on query patterns
    if (lowerText.includes('?')) {
      foundSymbols.set('sage', { ...SYMBOL_DATABASE.sage, state: primeToState(SYMBOL_DATABASE.sage.prime) });
    }
    if (lowerText.includes('help') || lowerText.includes('need')) {
      foundSymbols.set('hero', { ...SYMBOL_DATABASE.hero, state: primeToState(SYMBOL_DATABASE.hero.prime) });
    }
    if (lowerText.includes('feel')) {
      foundSymbols.set('water', { ...SYMBOL_DATABASE.water, state: primeToState(SYMBOL_DATABASE.water.prime) });
    }
    // Fallback
    if (foundSymbols.size === 0) {
      foundSymbols.set('self', { ...SYMBOL_DATABASE.self, state: primeToState(SYMBOL_DATABASE.self.prime) });
    }
  }
  
  return Array.from(foundSymbols.values());
}

// Run the resonance loop until coherence is reached
export function runResonanceLoop(
  inputSymbols: Symbol[],
  anchoringSymbols: Symbol[],
  onIteration?: (state: MindState) => void
): MindState {
  // Initialize states
  const anchors = anchoringSymbols.map(s => ({
    ...s,
    state: s.state || primeToState(s.prime)
  }));
  
  let activeSymbols = inputSymbols.map(s => ({
    ...s,
    state: s.state || primeToState(s.prime)
  }));
  
  let iteration = 0;
  let coherence = 0;
  let converged = false;
  
  while (iteration < MAX_ITERATIONS && !converged) {
    iteration++;
    
    // For each active symbol, find resonance with anchors
    const resonances: ResonanceResult[] = [];
    
    for (const active of activeSymbols) {
      for (const anchor of anchors) {
        const resonance = computeResonance(active, anchor);
        if (resonance > 0.3) {
          resonances.push({
            symbol: anchor,
            resonance,
            contribution: anchor.state!
          });
        }
      }
    }
    
    // Sort by resonance and take top contributors
    resonances.sort((a, b) => b.resonance - a.resonance);
    const topResonances = resonances.slice(0, 5);
    
    // Update active symbols based on resonance
    if (topResonances.length > 0) {
      // Add highly resonant anchors to active set
      for (const res of topResonances) {
        if (res.resonance > 0.5 && !activeSymbols.find(s => s.id === res.symbol.id)) {
          // Ensure symbol has state before adding
          const symbolWithState = {
            ...res.symbol,
            state: res.symbol.state || primeToState(res.symbol.prime)
          };
          activeSymbols.push(symbolWithState);
        }
      }
      
      // Calculate overall coherence
      const totalResonance = topResonances.reduce((sum, r) => sum + r.resonance, 0);
      coherence = totalResonance / Math.max(topResonances.length, 1);
      
      // Amplify coherence based on symbol count
      coherence = Math.min(1, coherence * (1 + activeSymbols.length * 0.05));
    }
    
    converged = coherence >= COHERENCE_THRESHOLD;
    
    const state: MindState = {
      anchoringSymbols: anchors,
      activeSymbols: [...activeSymbols],
      coherence,
      iteration,
      converged
    };
    
    onIteration?.(state);
  }
  
  return {
    anchoringSymbols: anchors,
    activeSymbols,
    coherence,
    iteration,
    converged
  };
}

// Select output symbols based on final state
export function selectOutputSymbols(state: MindState): Symbol[] {
  // Combine input and resonated anchors, prioritize by relevance
  const allActive = [...state.activeSymbols];
  
  // Sort by prime (lower = more fundamental)
  allActive.sort((a, b) => a.prime - b.prime);
  
  // Return top symbols
  return allActive.slice(0, Math.min(5, allActive.length));
}

// Get default anchoring symbols for the Mind
export function getDefaultAnchors(): Symbol[] {
  const anchorIds = ['self', 'shadow', 'hero', 'sage', 'love', 'truth', 'path', 'eye', 'spiral'];
  return anchorIds.map(id => {
    const baseSymbol = SYMBOL_DATABASE[id];
    return {
      ...baseSymbol,
      state: primeToState(baseSymbol.prime)
    } as Symbol;
  });
}
