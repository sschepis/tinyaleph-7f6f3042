/**
 * Octonion Mathematics for Enhanced Non-Local Communication
 */

// Octonion: o = e0 + e1*i + e2*j + e3*k + e4*l + e5*il + e6*jl + e7*kl
export interface Octonion {
  e0: number;
  e1: number;
  e2: number;
  e3: number;
  e4: number;
  e5: number;
  e6: number;
  e7: number;
}

export function createOctonion(
  e0: number = 1, e1: number = 0, e2: number = 0, e3: number = 0,
  e4: number = 0, e5: number = 0, e6: number = 0, e7: number = 0
): Octonion {
  return { e0, e1, e2, e3, e4, e5, e6, e7 };
}

// Octonion multiplication using Cayley-Dickson construction
export function octonionMultiply(o1: Octonion, o2: Octonion): Octonion {
  return {
    e0: o1.e0*o2.e0 - o1.e1*o2.e1 - o1.e2*o2.e2 - o1.e3*o2.e3 - o1.e4*o2.e4 - o1.e5*o2.e5 - o1.e6*o2.e6 - o1.e7*o2.e7,
    e1: o1.e0*o2.e1 + o1.e1*o2.e0 + o1.e2*o2.e3 - o1.e3*o2.e2 + o1.e4*o2.e5 - o1.e5*o2.e4 - o1.e6*o2.e7 + o1.e7*o2.e6,
    e2: o1.e0*o2.e2 - o1.e1*o2.e3 + o1.e2*o2.e0 + o1.e3*o2.e1 + o1.e4*o2.e6 + o1.e5*o2.e7 - o1.e6*o2.e4 - o1.e7*o2.e5,
    e3: o1.e0*o2.e3 + o1.e1*o2.e2 - o1.e2*o2.e1 + o1.e3*o2.e0 + o1.e4*o2.e7 - o1.e5*o2.e6 + o1.e6*o2.e5 - o1.e7*o2.e4,
    e4: o1.e0*o2.e4 - o1.e1*o2.e5 - o1.e2*o2.e6 - o1.e3*o2.e7 + o1.e4*o2.e0 + o1.e5*o2.e1 + o1.e6*o2.e2 + o1.e7*o2.e3,
    e5: o1.e0*o2.e5 + o1.e1*o2.e4 - o1.e2*o2.e7 + o1.e3*o2.e6 - o1.e4*o2.e1 + o1.e5*o2.e0 - o1.e6*o2.e3 + o1.e7*o2.e2,
    e6: o1.e0*o2.e6 + o1.e1*o2.e7 + o1.e2*o2.e4 - o1.e3*o2.e5 - o1.e4*o2.e2 + o1.e5*o2.e3 + o1.e6*o2.e0 - o1.e7*o2.e1,
    e7: o1.e0*o2.e7 - o1.e1*o2.e6 + o1.e2*o2.e5 + o1.e3*o2.e4 - o1.e4*o2.e3 - o1.e5*o2.e2 + o1.e6*o2.e1 + o1.e7*o2.e0
  };
}

export function octonionConjugate(o: Octonion): Octonion {
  return { e0: o.e0, e1: -o.e1, e2: -o.e2, e3: -o.e3, e4: -o.e4, e5: -o.e5, e6: -o.e6, e7: -o.e7 };
}

export function octonionNorm(o: Octonion): number {
  return Math.sqrt(o.e0*o.e0 + o.e1*o.e1 + o.e2*o.e2 + o.e3*o.e3 + o.e4*o.e4 + o.e5*o.e5 + o.e6*o.e6 + o.e7*o.e7);
}

export function octonionNormalize(o: Octonion): Octonion {
  const norm = octonionNorm(o);
  if (norm === 0) return createOctonion(1, 0, 0, 0, 0, 0, 0, 0);
  return {
    e0: o.e0/norm, e1: o.e1/norm, e2: o.e2/norm, e3: o.e3/norm,
    e4: o.e4/norm, e5: o.e5/norm, e6: o.e6/norm, e7: o.e7/norm
  };
}

// Convert message to octonion using hash-based encoding
export function messageToOctonion(message: string, channelId: number = 0): Octonion {
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    hash = ((hash << 5) - hash) + message.charCodeAt(i);
    hash = hash & hash;
  }
  
  const components: number[] = [];
  for (let i = 0; i < 8; i++) {
    const seed = hash + channelId * 1000 + i * 100;
    components.push(Math.sin(seed * 0.001) * 0.5);
  }
  
  return octonionNormalize(createOctonion(...components as [number, number, number, number, number, number, number, number]));
}

// Calculate octonion correlation including non-associative effects
export function octonionCorrelation(o1: Octonion, o2: Octonion): number {
  const innerProduct = 
    o1.e0 * o2.e0 + o1.e1 * o2.e1 + o1.e2 * o2.e2 + o1.e3 * o2.e3 +
    o1.e4 * o2.e4 + o1.e5 * o2.e5 + o1.e6 * o2.e6 + o1.e7 * o2.e7;
  
  const normA = octonionNorm(o1);
  const normB = octonionNorm(o2);
  
  if (normA === 0 || normB === 0) return 0;
  
  const correlation = Math.abs(innerProduct / (normA * normB));
  
  // Non-associative correction term
  const nonAssocCorrection = Math.abs(
    (o1.e4 * o2.e5 - o1.e5 * o2.e4) +
    (o1.e6 * o2.e7 - o1.e7 * o2.e6)
  ) * 0.1;
  
  return Math.min(1.0, correlation + nonAssocCorrection);
}

// Extract quaternion from octonion (first 4 components)
export function octonionToQuaternion(o: Octonion): { a: number; b: number; c: number; d: number } {
  return { a: o.e0, b: o.e1, c: o.e2, d: o.e3 };
}

// Prime basis configuration for phase-locked evolution
export const PRIME_BASIS = {
  primes: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71],
  frequencies: [2.0, 3.0, 5.0, 7.0, 11.0, 13.0, 17.0, 19.0, 23.0, 29.0,
                31.0, 37.0, 41.0, 43.0, 47.0, 53.0, 59.0, 61.0, 67.0, 71.0],
};

export interface PrimeAmplitude {
  real: number;
  imag: number;
}

// Create initial prime amplitudes for a node
export function createPrimeAmplitudes(antiPhase: boolean = false): PrimeAmplitude[] {
  const count = PRIME_BASIS.primes.length;
  return Array(count).fill(0).map(() => ({
    real: 1 / Math.sqrt(count),
    imag: 0
  }));
}

// Create phase offsets for a node
export function createPhaseOffsets(antiPhase: boolean = false): number[] {
  const offsets = Array(PRIME_BASIS.primes.length).fill(0).map(() => Math.random() * 2 * Math.PI);
  if (antiPhase) {
    return offsets.map(p => p + Math.PI);
  }
  return offsets;
}

// Normalize quantum state from prime amplitudes
export function normalizePrimeState(amplitudes: PrimeAmplitude[]): void {
  let norm = 0;
  for (const amp of amplitudes) {
    norm += amp.real * amp.real + amp.imag * amp.imag;
  }
  norm = Math.sqrt(norm);
  
  if (norm > 0) {
    for (const amp of amplitudes) {
      amp.real /= norm;
      amp.imag /= norm;
    }
  }
}

// Calculate resonance strength between two sets of prime amplitudes
export function calculateResonanceStrength(ampsA: PrimeAmplitude[], ampsB: PrimeAmplitude[]): number {
  let resonance = 0;
  
  for (let i = 0; i < Math.min(ampsA.length, ampsB.length); i++) {
    const real = ampsA[i].real * ampsB[i].real + ampsA[i].imag * ampsB[i].imag;
    const imag = ampsA[i].imag * ampsB[i].real - ampsA[i].real * ampsB[i].imag;
    resonance += Math.sqrt(real * real + imag * imag);
  }
  
  return resonance / ampsA.length;
}
