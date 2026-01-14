/**
 * Semantic State Collapse System
 * Implements quantum-like superposition and collapse of meaning states
 */

export interface MeaningState {
  id: string;
  interpretation: string;
  primeSignature: number[];
  amplitude: number; // Complex amplitude simplified to real
  phase: number;
  probability: number;
}

export interface Superposition {
  id: string;
  input: string;
  states: MeaningState[];
  entropy: number;
  collapsed: boolean;
  collapsedTo: string | null;
  createdAt: number;
  collapsedAt: number | null;
}

export interface CollapseEvent {
  id: string;
  superpositionId: string;
  context: string;
  collapsedState: MeaningState;
  probability: number;
  coherenceAtCollapse: number;
  timestamp: number;
}

export interface CollapseHistory {
  events: CollapseEvent[];
  reanalysisCount: number;
}

// First N primes
const firstNPrimes = (n: number): number[] => {
  const primes: number[] = [];
  let candidate = 2;
  while (primes.length < n) {
    let isPrime = true;
    for (let i = 2; i <= Math.sqrt(candidate); i++) {
      if (candidate % i === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) primes.push(candidate);
    candidate++;
  }
  return primes;
};

const MEANING_PRIMES = firstNPrimes(32);

// Semantic interpretations database
const INTERPRETATION_TEMPLATES = [
  { template: 'questioning {topic}', weight: 0.8 },
  { template: 'affirming {topic}', weight: 0.7 },
  { template: 'analyzing {topic}', weight: 0.9 },
  { template: 'integrating {topic} with context', weight: 0.6 },
  { template: 'transforming {topic}', weight: 0.5 },
  { template: 'discovering patterns in {topic}', weight: 0.85 },
  { template: 'resolving ambiguity about {topic}', weight: 0.75 },
  { template: 'synthesizing {topic} meaning', weight: 0.65 },
];

// Generate prime signature from text
function textToPrimes(text: string): number[] {
  const primes: number[] = [];
  const normalized = text.toLowerCase();
  
  for (let i = 0; i < Math.min(normalized.length, 8); i++) {
    const idx = normalized.charCodeAt(i) % MEANING_PRIMES.length;
    if (!primes.includes(MEANING_PRIMES[idx])) {
      primes.push(MEANING_PRIMES[idx]);
    }
  }
  
  return primes;
}

// Calculate Shannon entropy
function calculateEntropy(probabilities: number[]): number {
  let entropy = 0;
  for (const p of probabilities) {
    if (p > 0.001) {
      entropy -= p * Math.log2(p);
    }
  }
  return entropy;
}

// Create superposition of meaning states from input
export function createSuperposition(input: string): Superposition {
  const inputPrimes = textToPrimes(input);
  const topic = input.slice(0, 30);
  
  // Generate possible interpretations
  const states: MeaningState[] = INTERPRETATION_TEMPLATES.map((template, idx) => {
    // Create interpretation-specific signature
    const interpPrimes = textToPrimes(template.template);
    const combinedPrimes = [...new Set([...inputPrimes, ...interpPrimes])];
    
    // Random phase
    const phase = Math.random() * 2 * Math.PI;
    
    // Amplitude based on template weight + randomness
    const amplitude = template.weight * (0.7 + Math.random() * 0.3);
    
    return {
      id: `state_${idx}`,
      interpretation: template.template.replace('{topic}', `"${topic}"`),
      primeSignature: combinedPrimes,
      amplitude,
      phase,
      probability: 0 // Will be normalized
    };
  });
  
  // Normalize probabilities (Born rule: P = |amplitude|²)
  const totalAmplitudeSq = states.reduce((sum, s) => sum + s.amplitude * s.amplitude, 0);
  states.forEach(s => {
    s.probability = (s.amplitude * s.amplitude) / totalAmplitudeSq;
  });
  
  const entropy = calculateEntropy(states.map(s => s.probability));
  
  return {
    id: `super_${Date.now()}`,
    input,
    states,
    entropy,
    collapsed: false,
    collapsedTo: null,
    createdAt: Date.now(),
    collapsedAt: null
  };
}

// Apply measurement context to modify superposition
export function applyMeasurementContext(
  superposition: Superposition,
  contextPrimes: number[],
  coherence: number
): Superposition {
  // Context affects amplitudes based on prime overlap
  const newStates = superposition.states.map(state => {
    // Calculate overlap with context
    const overlap = state.primeSignature.filter(p => contextPrimes.includes(p)).length;
    const maxOverlap = Math.max(state.primeSignature.length, contextPrimes.length) || 1;
    const alignmentFactor = overlap / maxOverlap;
    
    // Context-modified amplitude
    // High coherence = stronger context influence
    const contextInfluence = coherence * alignmentFactor;
    const newAmplitude = state.amplitude * (0.5 + contextInfluence);
    
    return {
      ...state,
      amplitude: newAmplitude
    };
  });
  
  // Renormalize
  const totalAmplitudeSq = newStates.reduce((sum, s) => sum + s.amplitude * s.amplitude, 0);
  newStates.forEach(s => {
    s.probability = (s.amplitude * s.amplitude) / totalAmplitudeSq;
  });
  
  return {
    ...superposition,
    states: newStates,
    entropy: calculateEntropy(newStates.map(s => s.probability))
  };
}

// Collapse superposition to definite state
export function collapseState(
  superposition: Superposition,
  coherence: number
): { superposition: Superposition; event: CollapseEvent } {
  if (superposition.collapsed) {
    throw new Error('Superposition already collapsed');
  }
  
  // Sample from probability distribution
  const rand = Math.random();
  let cumulative = 0;
  let selectedState: MeaningState = superposition.states[0];
  
  for (const state of superposition.states) {
    cumulative += state.probability;
    if (rand <= cumulative) {
      selectedState = state;
      break;
    }
  }
  
  const collapsedSuperposition: Superposition = {
    ...superposition,
    collapsed: true,
    collapsedTo: selectedState.id,
    collapsedAt: Date.now(),
    entropy: 0 // Entropy goes to 0 after collapse
  };
  
  const event: CollapseEvent = {
    id: `collapse_${Date.now()}`,
    superpositionId: superposition.id,
    context: 'observer_state',
    collapsedState: selectedState,
    probability: selectedState.probability,
    coherenceAtCollapse: coherence,
    timestamp: Date.now()
  };
  
  return { superposition: collapsedSuperposition, event };
}

// Trigger reanalysis - expand collapsed state back to superposition
export function triggerReanalysis(
  superposition: Superposition,
  newInput: string
): Superposition {
  if (!superposition.collapsed) {
    return superposition;
  }
  
  const newPrimes = textToPrimes(newInput);
  
  // Check for contradiction (low overlap with collapsed state)
  const collapsedState = superposition.states.find(s => s.id === superposition.collapsedTo);
  if (!collapsedState) return superposition;
  
  const overlap = collapsedState.primeSignature.filter(p => newPrimes.includes(p)).length;
  const contradiction = overlap < collapsedState.primeSignature.length * 0.3;
  
  if (!contradiction) return superposition;
  
  // Re-expand superposition
  const newStates = superposition.states.map(state => {
    // Previously collapsed state gets reduced amplitude
    const wasCollapsed = state.id === superposition.collapsedTo;
    const amplitudeModifier = wasCollapsed ? 0.3 : 1.2;
    
    return {
      ...state,
      amplitude: state.amplitude * amplitudeModifier,
      phase: state.phase + (Math.random() - 0.5) * 0.5 // Phase perturbation
    };
  });
  
  // Renormalize
  const totalAmplitudeSq = newStates.reduce((sum, s) => sum + s.amplitude * s.amplitude, 0);
  newStates.forEach(s => {
    s.probability = (s.amplitude * s.amplitude) / totalAmplitudeSq;
  });
  
  return {
    ...superposition,
    states: newStates,
    entropy: calculateEntropy(newStates.map(s => s.probability)),
    collapsed: false,
    collapsedTo: null,
    collapsedAt: null
  };
}

// Get dominant interpretation from superposition
export function getDominantInterpretation(superposition: Superposition): {
  interpretation: string;
  probability: number;
  entropy: number;
} {
  if (superposition.collapsed) {
    const collapsedState = superposition.states.find(s => s.id === superposition.collapsedTo);
    return {
      interpretation: collapsedState?.interpretation || 'Unknown',
      probability: 1,
      entropy: 0
    };
  }
  
  const sorted = [...superposition.states].sort((a, b) => b.probability - a.probability);
  return {
    interpretation: sorted[0]?.interpretation || 'Undefined',
    probability: sorted[0]?.probability || 0,
    entropy: superposition.entropy
  };
}

// Calculate collapse probability based on current state
export function getCollapseProbability(
  superposition: Superposition,
  coherence: number,
  timeSinceCreation: number
): number {
  if (superposition.collapsed) return 0;
  
  // Lower entropy = more likely to collapse
  const entropyFactor = 1 - (superposition.entropy / Math.log2(superposition.states.length));
  
  // Higher coherence = more likely to collapse
  const coherenceFactor = coherence;
  
  // Time pressure - older superpositions more likely to collapse
  const timeFactor = Math.min(1, timeSinceCreation / 10000); // 10 seconds to max
  
  return Math.min(1, entropyFactor * 0.3 + coherenceFactor * 0.4 + timeFactor * 0.3);
}

// Create collapse history tracker
export function createCollapseHistory(): CollapseHistory {
  return {
    events: [],
    reanalysisCount: 0
  };
}

export function addCollapseEvent(
  history: CollapseHistory,
  event: CollapseEvent
): CollapseHistory {
  return {
    ...history,
    events: [...history.events.slice(-49), event]
  };
}

export function getCollapseStats(history: CollapseHistory): {
  totalCollapses: number;
  averageCoherence: number;
  mostCommonInterpretation: string | null;
  reanalysisRate: number;
} {
  if (history.events.length === 0) {
    return {
      totalCollapses: 0,
      averageCoherence: 0,
      mostCommonInterpretation: null,
      reanalysisRate: 0
    };
  }
  
  const avgCoherence = history.events.reduce((s, e) => s + e.coherenceAtCollapse, 0) / history.events.length;
  
  // Count interpretations
  const interpCounts: Record<string, number> = {};
  history.events.forEach(e => {
    const interp = e.collapsedState.interpretation;
    interpCounts[interp] = (interpCounts[interp] || 0) + 1;
  });
  
  const mostCommon = Object.entries(interpCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  
  return {
    totalCollapses: history.events.length,
    averageCoherence: avgCoherence,
    mostCommonInterpretation: mostCommon,
    reanalysisRate: history.reanalysisCount / (history.events.length + history.reanalysisCount + 0.001)
  };
}
