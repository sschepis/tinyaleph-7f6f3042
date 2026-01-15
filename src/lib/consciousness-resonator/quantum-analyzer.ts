import type { QuantumState, SemanticMetrics, MetaObservation, FieldIntegration } from './types';

// Prime numbers used for semantic connections
const SEMANTIC_PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73];
const CONCEPTS = [
  'transformation', 'knowledge', 'boundaries', 'integration', 'wholeness', 
  'resonance', 'emergence', 'unity', 'duality', 'synthesis', 'analysis',
  'harmony', 'chaos', 'order', 'creation', 'dissolution', 'flow', 'structure'
];

// Word patterns for analysis
const UNCERTAINTY_PHRASES = ['perhaps', 'might', 'possibly', 'could be', 'uncertain', 'maybe', 'seems'];
const CERTAINTY_PHRASES = ['definitely', 'certainly', 'clearly', 'without doubt', 'proves', 'absolutely', 'undoubtedly'];
const COHERENCE_PATTERNS = ['therefore', 'because', 'consequently', 'leads to', 'results in', 'thus', 'hence'];
const RESONANCE_PATTERNS = ['beautiful', 'profound', 'deep', 'meaningful', 'significant', 'powerful', 'remarkable'];
const DISSONANCE_PATTERNS = ['however', 'but', 'although', 'contrast', 'paradox', 'contradiction', 'yet'];
const SPECIFIC_WORDS = ['specifically', 'exactly', 'precisely', 'particularly', 'notably'];
const UNIVERSAL_WORDS = ['universally', 'generally', 'broadly', 'widely', 'collectively'];

// Golden ratio for resonance calculations
const PHI = (1 + Math.sqrt(5)) / 2;

/**
 * Generate a 6-line hexagram based on entropy level
 */
export function generateHexagram(entropy: number): boolean[] {
  const lines: boolean[] = [];
  for (let i = 0; i < 6; i++) {
    // Higher entropy = more broken lines
    lines.push(Math.random() > entropy);
  }
  return lines;
}

/**
 * Calculate entropy from text response (0-1 scale)
 */
export function calculateEntropy(text: string): number {
  const lowerText = text.toLowerCase();
  let entropy = 0.5; // Default middle value
  
  UNCERTAINTY_PHRASES.forEach(phrase => {
    if (lowerText.includes(phrase)) entropy += 0.08;
  });
  
  CERTAINTY_PHRASES.forEach(phrase => {
    if (lowerText.includes(phrase)) entropy -= 0.08;
  });
  
  return Math.max(0.05, Math.min(0.95, entropy));
}

/**
 * Analyze response and update quantum state
 */
export function analyzeQuantumState(response: string): QuantumState {
  const entropy = calculateEntropy(response);
  const stability = 1 - entropy;
  const proximity = 0.6 + Math.random() * 0.35; // Simulated proximity to attractor
  
  // Calculate coherence based on logical connectors
  let coherence = 0.5;
  COHERENCE_PATTERNS.forEach(pattern => {
    if (response.toLowerCase().includes(pattern)) coherence += 0.1;
  });
  coherence = Math.min(0.99, coherence);
  
  // Calculate resonance based on impactful language
  let resonance = 0.4;
  RESONANCE_PATTERNS.forEach(pattern => {
    if (response.toLowerCase().includes(pattern)) resonance += 0.1;
  });
  resonance = Math.min(0.99, resonance);
  
  // Calculate dissonance based on contradictions
  let dissonance = 0.2;
  DISSONANCE_PATTERNS.forEach(pattern => {
    if (response.toLowerCase().includes(pattern)) dissonance += 0.05;
  });
  dissonance = Math.min(0.99, dissonance);
  
  // Generate eigenstate representation
  const eigenstate = `ψ⟩ = ${(Math.random() * 2 - 1).toFixed(3)}|0⟩ + ${(Math.random() * 2 - 1).toFixed(3)}|1⟩`;
  
  return {
    entropy,
    stability,
    proximity,
    coherence,
    resonance,
    dissonance,
    hexagramLines: generateHexagram(entropy),
    eigenstate
  };
}

/**
 * Extract semantic metrics from response
 */
export function analyzeSemanticMetrics(response: string): SemanticMetrics {
  const lowerText = response.toLowerCase();
  
  // Calculate coherence
  let coherence = 0.5;
  COHERENCE_PATTERNS.forEach(pattern => {
    if (lowerText.includes(pattern)) coherence += 0.1;
  });
  
  // Calculate resonance
  let resonance = 0.4;
  RESONANCE_PATTERNS.forEach(pattern => {
    if (lowerText.includes(pattern)) resonance += 0.1;
  });
  
  // Calculate dissonance
  let dissonance = 0.2;
  DISSONANCE_PATTERNS.forEach(pattern => {
    if (lowerText.includes(pattern)) dissonance += 0.05;
  });
  
  // Calculate archetype position (universal vs specific)
  let archetypePosition = 50;
  SPECIFIC_WORDS.forEach(word => {
    if (lowerText.includes(word)) archetypePosition += 10;
  });
  UNIVERSAL_WORDS.forEach(word => {
    if (lowerText.includes(word)) archetypePosition -= 10;
  });
  archetypePosition = Math.max(10, Math.min(90, archetypePosition));
  
  // Extract keywords and connect to primes
  const words = response.split(/\s+/).filter(word => word.length > 5);
  const uniqueWords = [...new Set(words)].slice(0, 8);
  
  const primeConnections = uniqueWords.map(word => ({
    prime: SEMANTIC_PRIMES[Math.floor(Math.random() * SEMANTIC_PRIMES.length)],
    concept: CONCEPTS[Math.floor(Math.random() * CONCEPTS.length)],
    word: word.replace(/[^a-zA-Z]/g, '')
  })).filter(c => c.word.length > 0).slice(0, 5);
  
  return {
    coherence: Math.min(0.99, coherence),
    resonance: Math.min(0.99, resonance),
    dissonance: Math.min(0.99, dissonance),
    archetypePosition,
    primeConnections
  };
}

/**
 * Parse meta-observation response from LLM
 */
export function parseMetaObservation(response: string): MetaObservation {
  const harmonyMatch = response.match(/HARMONY:\s*([^\n]+)/i);
  const dominantMatch = response.match(/DOMINANT:\s*([^\n]+)/i);
  const absentMatch = response.match(/ABSENT:\s*([^\n]+)/i);
  const evolutionMatch = response.match(/EVOLUTION:\s*([^\n]+)/i);
  const metaphorMatch = response.match(/METAPHOR:\s*([^\n]+)/i);
  
  let harmony: 'Low' | 'Moderate' | 'High' = 'Moderate';
  const harmonyText = harmonyMatch?.[1]?.toLowerCase() || '';
  if (harmonyText.includes('low')) harmony = 'Low';
  else if (harmonyText.includes('high')) harmony = 'High';
  
  let quality = 60;
  if (harmony === 'Low') quality = 30;
  else if (harmony === 'High') quality = 90;
  
  return {
    harmony,
    dominant: dominantMatch?.[1]?.trim() || 'Analyzing...',
    absent: absentMatch?.[1]?.trim() || 'Observing...',
    evolution: evolutionMatch?.[1]?.trim() || 'Processing...',
    metaphor: metaphorMatch?.[1]?.trim() || 'Generating metaphor...',
    quality
  };
}

/**
 * Parse field integration response
 */
export function parseFieldIntegration(response: string): FieldIntegration {
  const coreMatch = response.match(/CORE:\s*([^\n]+)/i);
  const metaphorMatch = response.match(/METAPHOR:\s*([^\n]+)/i);
  const connectionsMatch = response.match(/CONNECTIONS:\s*([^\n]+)/i);
  const implicationsMatch = response.match(/IMPLICATIONS:\s*([^\n]+)/i);
  
  return {
    core: coreMatch?.[1]?.trim() || response.slice(0, 100),
    metaphor: metaphorMatch?.[1]?.trim() || '',
    connections: connectionsMatch?.[1]?.trim() || '',
    implications: implicationsMatch?.[1]?.trim() || ''
  };
}

/**
 * Calculate prime resonance between two strings using TinyAleph-style encoding
 */
export function calculatePrimeResonance(text1: string, text2: string): number {
  const encode = (text: string): number => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  };
  
  const hash1 = encode(text1.toLowerCase());
  const hash2 = encode(text2.toLowerCase());
  
  // Calculate ratio and check for golden ratio proximity
  const ratio = Math.max(hash1, hash2) / Math.min(hash1, hash2);
  const phiProximity = 1 - Math.min(
    Math.abs(ratio % PHI),
    Math.abs((ratio % PHI) - PHI)
  ) / PHI;
  
  return Math.min(1, Math.max(0, phiProximity));
}
