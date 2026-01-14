/**
 * Functional Holographic Memory System
 * Implements actual memory storage/retrieval using prime-based interference patterns
 */

export interface MemoryFragment {
  id: string;
  content: string;
  primeSignature: number[];
  amplitudes: number[];
  timestamp: number;
  coherenceAtStore: number;
  decayRate: number;
}

export interface MemoryLocation {
  x: number;
  y: number;
  intensity: number;
  fragments: string[]; // IDs of memories stored here
}

export interface HolographicMemory {
  fragments: Map<string, MemoryFragment>;
  field: number[][];
  peaks: MemoryLocation[];
}

// First N primes for encoding
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

const PRIME_BASIS = firstNPrimes(64);
const FIELD_SIZE = 32;

// Hash text to prime signature
function textToPrimeSignature(text: string): { primes: number[]; amplitudes: number[] } {
  const primes: number[] = [];
  const amplitudes: number[] = [];
  
  // Use character codes to select primes
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const words = normalized.split(/\s+/).filter(w => w.length > 0);
  
  // Each word contributes primes
  for (let i = 0; i < Math.min(words.length, 8); i++) {
    const word = words[i];
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = ((hash << 5) - hash + word.charCodeAt(j)) | 0;
    }
    
    // Select prime based on hash
    const primeIdx = Math.abs(hash) % PRIME_BASIS.length;
    if (!primes.includes(PRIME_BASIS[primeIdx])) {
      primes.push(PRIME_BASIS[primeIdx]);
      amplitudes.push(0.8 - i * 0.08); // Decay with word position
    }
  }
  
  // Add some character-level primes for uniqueness
  for (let i = 0; i < Math.min(text.length, 10); i++) {
    const charPrime = PRIME_BASIS[text.charCodeAt(i) % PRIME_BASIS.length];
    if (!primes.includes(charPrime)) {
      primes.push(charPrime);
      amplitudes.push(0.3);
    }
  }
  
  return { primes, amplitudes };
}

// Calculate interference position in field for a prime signature
function calculateFieldPosition(primes: number[], amplitudes: number[]): { x: number; y: number } {
  let xSum = 0, ySum = 0, totalWeight = 0;
  
  for (let i = 0; i < primes.length; i++) {
    const prime = primes[i];
    const amp = amplitudes[i] || 0.5;
    
    // Map prime to position using wave interference
    const angle = (prime * Math.PI) / 31; // Different angle per prime
    const radius = (prime % 15) / 15; // Radial component
    
    xSum += Math.cos(angle) * radius * amp * FIELD_SIZE / 2;
    ySum += Math.sin(angle) * radius * amp * FIELD_SIZE / 2;
    totalWeight += amp;
  }
  
  if (totalWeight === 0) totalWeight = 1;
  
  return {
    x: Math.floor((xSum / totalWeight) + FIELD_SIZE / 2) % FIELD_SIZE,
    y: Math.floor((ySum / totalWeight) + FIELD_SIZE / 2) % FIELD_SIZE
  };
}

// Calculate similarity between two prime signatures (Jaccard-like)
function signatureSimilarity(sig1: number[], sig2: number[]): number {
  const set1 = new Set(sig1);
  const set2 = new Set(sig2);
  
  let intersection = 0;
  set1.forEach(p => { if (set2.has(p)) intersection++; });
  
  const union = set1.size + set2.size - intersection;
  return union > 0 ? intersection / union : 0;
}

export function createHolographicMemory(): HolographicMemory {
  return {
    fragments: new Map(),
    field: Array(FIELD_SIZE).fill(0).map(() => Array(FIELD_SIZE).fill(0)),
    peaks: []
  };
}

export function encodeMemory(
  memory: HolographicMemory,
  content: string,
  coherence: number
): { memory: HolographicMemory; fragmentId: string; location: { x: number; y: number } } {
  const { primes, amplitudes } = textToPrimeSignature(content);
  const position = calculateFieldPosition(primes, amplitudes);
  
  const fragment: MemoryFragment = {
    id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    content,
    primeSignature: primes,
    amplitudes,
    timestamp: Date.now(),
    coherenceAtStore: coherence,
    decayRate: 0.001 + (1 - coherence) * 0.005 // Higher coherence = slower decay
  };
  
  // Update field with interference pattern
  const newField = memory.field.map(row => [...row]);
  
  for (let dx = -4; dx <= 4; dx++) {
    for (let dy = -4; dy <= 4; dy++) {
      const fx = (position.x + dx + FIELD_SIZE) % FIELD_SIZE;
      const fy = (position.y + dy + FIELD_SIZE) % FIELD_SIZE;
      
      // Calculate interference based on distance and prime phases
      let interference = 0;
      for (let i = 0; i < primes.length; i++) {
        const k = (2 * Math.PI) / (5 + Math.log(primes[i]));
        const r = Math.sqrt(dx * dx + dy * dy);
        interference += amplitudes[i] * Math.cos(k * r) * Math.exp(-r * 0.3);
      }
      
      newField[fx][fy] += interference * coherence;
    }
  }
  
  // Add fragment to storage
  const newFragments = new Map(memory.fragments);
  newFragments.set(fragment.id, fragment);
  
  // Update peaks
  const newPeaks = [...memory.peaks];
  const existingPeakIdx = newPeaks.findIndex(
    p => Math.abs(p.x - position.x) < 3 && Math.abs(p.y - position.y) < 3
  );
  
  if (existingPeakIdx >= 0) {
    newPeaks[existingPeakIdx].fragments.push(fragment.id);
    newPeaks[existingPeakIdx].intensity += coherence;
  } else {
    newPeaks.push({
      x: position.x,
      y: position.y,
      intensity: coherence,
      fragments: [fragment.id]
    });
  }
  
  return {
    memory: { fragments: newFragments, field: newField, peaks: newPeaks },
    fragmentId: fragment.id,
    location: position
  };
}

export function recallMemory(
  memory: HolographicMemory,
  query: string,
  threshold: number = 0.2
): { fragment: MemoryFragment; similarity: number; location: { x: number; y: number } }[] {
  const { primes } = textToPrimeSignature(query);
  const queryPosition = calculateFieldPosition(primes, primes.map(() => 0.5));
  
  const results: { fragment: MemoryFragment; similarity: number; location: { x: number; y: number } }[] = [];
  
  memory.fragments.forEach(fragment => {
    const similarity = signatureSimilarity(primes, fragment.primeSignature);
    
    if (similarity >= threshold) {
      const location = calculateFieldPosition(fragment.primeSignature, fragment.amplitudes);
      results.push({ fragment, similarity, location });
    }
  });
  
  // Sort by similarity and recency
  results.sort((a, b) => {
    const simDiff = b.similarity - a.similarity;
    if (Math.abs(simDiff) > 0.1) return simDiff;
    return b.fragment.timestamp - a.fragment.timestamp;
  });
  
  return results.slice(0, 5);
}

export function recallAtLocation(
  memory: HolographicMemory,
  x: number,
  y: number,
  radius: number = 3
): MemoryFragment[] {
  const peak = memory.peaks.find(
    p => Math.abs(p.x - x) <= radius && Math.abs(p.y - y) <= radius
  );
  
  if (!peak) return [];
  
  return peak.fragments
    .map(id => memory.fragments.get(id))
    .filter((f): f is MemoryFragment => f !== undefined)
    .sort((a, b) => b.timestamp - a.timestamp);
}

export function applyMemoryDecay(
  memory: HolographicMemory,
  deltaTime: number
): HolographicMemory {
  const newFragments = new Map(memory.fragments);
  const toRemove: string[] = [];
  
  newFragments.forEach((fragment, id) => {
    const age = (Date.now() - fragment.timestamp) / 1000; // seconds
    const decayFactor = Math.exp(-fragment.decayRate * age * deltaTime);
    
    if (decayFactor < 0.1) {
      toRemove.push(id);
    } else {
      newFragments.set(id, {
        ...fragment,
        amplitudes: fragment.amplitudes.map(a => a * decayFactor)
      });
    }
  });
  
  // Remove decayed memories
  toRemove.forEach(id => newFragments.delete(id));
  
  // Decay field intensity
  const newField = memory.field.map(row => row.map(val => val * 0.999));
  
  // Update peaks
  const newPeaks = memory.peaks
    .map(peak => ({
      ...peak,
      intensity: peak.intensity * 0.999,
      fragments: peak.fragments.filter(id => !toRemove.includes(id))
    }))
    .filter(peak => peak.fragments.length > 0);
  
  return { fragments: newFragments, field: newField, peaks: newPeaks };
}

// Get field for visualization (normalized 0-1)
export function getFieldVisualization(memory: HolographicMemory): number[][] {
  const maxVal = Math.max(
    1,
    ...memory.field.flat().map(Math.abs)
  );
  
  return memory.field.map(row => row.map(val => (val + maxVal) / (2 * maxVal)));
}

export function getMemoryStats(memory: HolographicMemory): {
  totalMemories: number;
  peakCount: number;
  fieldEnergy: number;
  oldestMemory: number | null;
  newestMemory: number | null;
} {
  const timestamps = Array.from(memory.fragments.values()).map(f => f.timestamp);
  const fieldEnergy = memory.field.flat().reduce((sum, v) => sum + v * v, 0);
  
  return {
    totalMemories: memory.fragments.size,
    peakCount: memory.peaks.length,
    fieldEnergy: Math.sqrt(fieldEnergy),
    oldestMemory: timestamps.length > 0 ? Math.min(...timestamps) : null,
    newestMemory: timestamps.length > 0 ? Math.max(...timestamps) : null
  };
}
