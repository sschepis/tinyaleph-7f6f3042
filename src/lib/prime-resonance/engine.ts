// Prime Resonance Engine - Quantum-like computation with primes

import { ComplexNumber, PrimeState, EvolutionState, MeasurementResult, ResonanceScore, FIRST_64_PRIMES } from './types';

// Complex number operations
export const complex = {
  create: (re: number, im: number = 0): ComplexNumber => ({ re, im }),
  add: (a: ComplexNumber, b: ComplexNumber): ComplexNumber => ({ re: a.re + b.re, im: a.im + b.im }),
  mul: (a: ComplexNumber, b: ComplexNumber): ComplexNumber => ({
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re
  }),
  scale: (a: ComplexNumber, s: number): ComplexNumber => ({ re: a.re * s, im: a.im * s }),
  magnitude: (a: ComplexNumber): number => Math.sqrt(a.re * a.re + a.im * a.im),
  phase: (a: ComplexNumber): number => Math.atan2(a.im, a.re),
  fromPolar: (r: number, theta: number): ComplexNumber => ({ re: r * Math.cos(theta), im: r * Math.sin(theta) }),
  conjugate: (a: ComplexNumber): ComplexNumber => ({ re: a.re, im: -a.im }),
  toString: (a: ComplexNumber): string => {
    const re = a.re.toFixed(3);
    const im = Math.abs(a.im).toFixed(3);
    if (Math.abs(a.im) < 0.001) return re;
    return `${re} ${a.im >= 0 ? '+' : '-'} ${im}i`;
  }
};

// Create prime basis state |p⟩
export function basisState(prime: number): PrimeState {
  const amplitudes = new Map<number, ComplexNumber>();
  amplitudes.set(prime, complex.create(1, 0));
  return { amplitudes, primes: [prime] };
}

// Create uniform superposition over first n primes
export function uniformSuperposition(n: number = 16): PrimeState {
  const primes = FIRST_64_PRIMES.slice(0, n);
  const amplitudes = new Map<number, ComplexNumber>();
  const amplitude = 1 / Math.sqrt(n);
  primes.forEach(p => amplitudes.set(p, complex.create(amplitude, 0)));
  return { amplitudes, primes };
}

// Create weighted superposition from concept (word → primes mapping)
export function conceptState(primeSignature: number[]): PrimeState {
  const amplitudes = new Map<number, ComplexNumber>();
  const norm = 1 / Math.sqrt(primeSignature.length);
  primeSignature.forEach(p => {
    amplitudes.set(p, complex.create(norm, 0));
  });
  return { amplitudes, primes: primeSignature };
}

// Calculate norm ⟨ψ|ψ⟩
export function stateNorm(state: PrimeState): number {
  let sum = 0;
  state.amplitudes.forEach(amp => {
    sum += complex.magnitude(amp) ** 2;
  });
  return Math.sqrt(sum);
}

// Normalize state
export function normalize(state: PrimeState): PrimeState {
  const norm = stateNorm(state);
  if (norm < 0.0001) return state;
  const amplitudes = new Map<number, ComplexNumber>();
  state.amplitudes.forEach((amp, p) => {
    amplitudes.set(p, complex.scale(amp, 1 / norm));
  });
  return { amplitudes, primes: state.primes };
}

// Inner product ⟨ψ₁|ψ₂⟩
export function innerProduct(s1: PrimeState, s2: PrimeState): ComplexNumber {
  let result = complex.create(0, 0);
  s1.amplitudes.forEach((amp1, p) => {
    const amp2 = s2.amplitudes.get(p);
    if (amp2) {
      result = complex.add(result, complex.mul(complex.conjugate(amp1), amp2));
    }
  });
  return result;
}

// Calculate von Neumann entropy S = -Σ|αp|² log|αp|²
export function entropy(state: PrimeState): number {
  let S = 0;
  const norm = stateNorm(state);
  state.amplitudes.forEach(amp => {
    const prob = (complex.magnitude(amp) / norm) ** 2;
    if (prob > 0.0001) {
      S -= prob * Math.log2(prob);
    }
  });
  return S;
}

// P̂ operator: Prime eigenvalue P̂|p⟩ = p|p⟩
export function applyPrimeOperator(state: PrimeState): PrimeState {
  const amplitudes = new Map<number, ComplexNumber>();
  state.amplitudes.forEach((amp, p) => {
    amplitudes.set(p, complex.scale(amp, p));
  });
  return { amplitudes, primes: state.primes };
}

// R̂(n) operator: Phase rotation e^(2πi log_p(n))
export function applyRotationOperator(state: PrimeState, n: number): PrimeState {
  const amplitudes = new Map<number, ComplexNumber>();
  state.amplitudes.forEach((amp, p) => {
    const theta = 2 * Math.PI * Math.log(n) / Math.log(p);
    const rotation = complex.fromPolar(1, theta);
    amplitudes.set(p, complex.mul(amp, rotation));
  });
  return { amplitudes, primes: state.primes };
}

// Ĉ(n) operator: Coupling creates interference
export function applyCouplingOperator(state: PrimeState, n: number): PrimeState {
  const amplitudes = new Map<number, ComplexNumber>();
  state.amplitudes.forEach((amp, p) => {
    const phaseShift = (n % p) / p * 2 * Math.PI;
    const coupling = complex.fromPolar(1, phaseShift);
    amplitudes.set(p, complex.mul(amp, coupling));
  });
  return { amplitudes, primes: state.primes };
}

// Ĥ operator: Hadamard-like spreading
export function applyHadamardOperator(state: PrimeState): PrimeState {
  const n = Math.min(16, FIRST_64_PRIMES.length);
  const primes = FIRST_64_PRIMES.slice(0, n);
  const amplitudes = new Map<number, ComplexNumber>();
  const invSqrtN = 1 / Math.sqrt(n);
  
  primes.forEach((p, i) => {
    let newAmp = complex.create(0, 0);
    state.amplitudes.forEach((amp, q) => {
      const j = primes.indexOf(q);
      if (j >= 0) {
        const phase = (2 * Math.PI * i * j) / n;
        const hadamardElement = complex.fromPolar(invSqrtN, phase);
        newAmp = complex.add(newAmp, complex.mul(amp, hadamardElement));
      }
    });
    if (complex.magnitude(newAmp) > 0.0001) {
      amplitudes.set(p, newAmp);
    }
  });
  
  return normalize({ amplitudes, primes });
}

// Quantum measurement (Born rule)
export function measure(state: PrimeState): MeasurementResult {
  const norm = stateNorm(state);
  const probabilities: { prime: number; prob: number }[] = [];
  
  state.amplitudes.forEach((amp, p) => {
    const prob = (complex.magnitude(amp) / norm) ** 2;
    probabilities.push({ prime: p, prob });
  });
  
  const r = Math.random();
  let cumulative = 0;
  
  for (const { prime, prob } of probabilities) {
    cumulative += prob;
    if (r <= cumulative) {
      return { prime, probability: prob, collapsed: true };
    }
  }
  
  return { prime: probabilities[0]?.prime || 2, probability: 1, collapsed: true };
}

// Get probability distribution
export function getProbabilities(state: PrimeState): { prime: number; probability: number }[] {
  const norm = stateNorm(state);
  const result: { prime: number; probability: number }[] = [];
  
  state.amplitudes.forEach((amp, p) => {
    const prob = (complex.magnitude(amp) / norm) ** 2;
    result.push({ prime: p, probability: prob });
  });
  
  return result.sort((a, b) => b.probability - a.probability);
}

// Entropy-driven evolution step
export function evolve(
  state: PrimeState,
  params: { lambda: number; rStable: number; dt: number }
): { state: PrimeState; entropy: number; collapseProb: number } {
  const { lambda, rStable, dt } = params;
  
  // Apply Hadamard for unitary evolution
  let evolved = applyHadamardOperator(state);
  
  // Apply damping towards stable resonance
  const currentEntropy = entropy(evolved);
  const dampingFactor = 1 - lambda * dt * Math.abs(currentEntropy - rStable);
  
  const amplitudes = new Map<number, ComplexNumber>();
  evolved.amplitudes.forEach((amp, p) => {
    // Small random phase perturbation
    const perturbation = complex.fromPolar(1, (Math.random() - 0.5) * 0.1);
    const perturbed = complex.mul(amp, perturbation);
    amplitudes.set(p, complex.scale(perturbed, Math.max(0.1, dampingFactor)));
  });
  
  const newState = normalize({ amplitudes, primes: evolved.primes });
  const newEntropy = entropy(newState);
  
  // Collapse probability from entropy integral
  const collapseProb = 1 - Math.exp(-newEntropy * dt);
  
  return { state: newState, entropy: newEntropy, collapseProb };
}

// Calculate resonance score between two states
export function resonanceScore(s1: PrimeState, s2: PrimeState): ResonanceScore {
  // Jaccard similarity of prime sets
  const set1 = new Set(s1.primes);
  const set2 = new Set(s2.primes);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  const jaccard = intersection.size / union.size;
  
  // Phase coherence from inner product
  const inner = innerProduct(s1, s2);
  const phaseCoherence = complex.magnitude(inner);
  
  // Combined score
  const total = 0.5 * jaccard + 0.5 * phaseCoherence;
  
  return { jaccard, phaseCoherence, total };
}

// Get dominant primes (highest probability)
export function getDominant(state: PrimeState, count: number = 3): { prime: number; amplitude: number }[] {
  const probs = getProbabilities(state);
  return probs.slice(0, count).map(p => ({
    prime: p.prime,
    amplitude: Math.sqrt(p.probability)
  }));
}

// Create composite state from factorization
export function compositeState(n: number): PrimeState {
  const factors: number[] = [];
  let temp = n;
  
  for (const p of FIRST_64_PRIMES) {
    while (temp % p === 0) {
      factors.push(p);
      temp = temp / p;
    }
    if (temp === 1) break;
  }
  
  if (factors.length === 0) return basisState(2);
  
  const unique = [...new Set(factors)];
  return conceptState(unique);
}
