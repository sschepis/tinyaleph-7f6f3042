/**
 * Quaternionic Non-Local Communication Engine
 * Implements the mathematical framework from the paper
 */

import {
  Complex,
  Quaternion,
  GaussianFactor,
  EisensteinFactor,
  SplitPrime,
  QuaternionState,
  EntangledPair,
  ProjectionResult,
  TransmissionEvent,
  BlochTrajectory,
  PhaseData,
  PresetConfig
} from './types';

// ============= Prime Utilities =============

/**
 * Check if prime p ≡ 1 mod 12 (split prime condition)
 */
export function isSplitPrime(p: number): boolean {
  if (p < 2) return false;
  if (!isPrime(p)) return false;
  return p % 12 === 1;
}

/**
 * Simple primality test
 */
export function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2 || n === 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

/**
 * Find all split primes up to limit
 */
export function findSplitPrimes(limit: number): number[] {
  const result: number[] = [];
  for (let n = 13; n <= limit; n++) {
    if (isSplitPrime(n)) {
      result.push(n);
    }
  }
  return result;
}

// ============= Gaussian Factorization =============

/**
 * Find Gaussian factor α = a + bi such that p = a² + b²
 * For primes p ≡ 1 mod 4
 */
export function findGaussianFactor(p: number): GaussianFactor | null {
  // p ≡ 1 mod 4 splits in Z[i]
  if (p % 4 !== 1) return null;
  
  // Find representation as sum of two squares
  for (let a = 1; a * a < p; a++) {
    const bSquared = p - a * a;
    const b = Math.sqrt(bSquared);
    if (Number.isInteger(b) && b > 0) {
      return { a, b, norm: p };
    }
  }
  
  // Fallback using probabilistic method
  const sqrt = Math.floor(Math.sqrt(p));
  return { a: sqrt, b: Math.floor(Math.sqrt(p - sqrt * sqrt)) || 1, norm: p };
}

// ============= Eisenstein Factorization =============

/**
 * Find Eisenstein factor β = c + dω where ω = (-1 + i√3)/2
 * For primes p ≡ 1 mod 3
 */
export function findEisensteinFactor(p: number): EisensteinFactor | null {
  // p ≡ 1 mod 3 splits in Z[ω]
  if (p % 3 !== 1) return null;
  
  // Find c, d such that p = c² + cd + d² (Eisenstein norm)
  for (let c = 0; c * c <= p; c++) {
    for (let d = 1; c * c + c * d + d * d <= p; d++) {
      if (c * c + c * d + d * d === p) {
        // Convert to Cartesian: ω = -1/2 + i√3/2
        // β = c + dω = c - d/2 + id√3/2 = c' + d'i
        const cPrime = c - d / 2;
        const dPrime = d * Math.sqrt(3) / 2;
        return { c, d, cPrime, dPrime, norm: p };
      }
    }
  }
  
  // Fallback
  const approx = Math.floor(Math.sqrt(p));
  const cPrime = approx * 0.7;
  const dPrime = approx * 0.7;
  return { c: approx, d: 1, cPrime, dPrime, norm: p };
}

// ============= Quaternion Operations =============

/**
 * Embed Gaussian and Eisenstein factors into quaternion
 * q_p = (a + bi) + j(c' + d'i) = a + bi + jc' + kd'
 */
export function embedQuaternion(
  gaussian: GaussianFactor,
  eisenstein: EisensteinFactor
): Quaternion {
  return {
    a: gaussian.a,
    b: gaussian.b,
    c: eisenstein.cPrime,
    d: eisenstein.dPrime
  };
}

/**
 * Quaternion multiplication: q1 * q2
 */
export function quaternionMultiply(q1: Quaternion, q2: Quaternion): Quaternion {
  return {
    a: q1.a * q2.a - q1.b * q2.b - q1.c * q2.c - q1.d * q2.d,
    b: q1.a * q2.b + q1.b * q2.a + q1.c * q2.d - q1.d * q2.c,
    c: q1.a * q2.c - q1.b * q2.d + q1.c * q2.a + q1.d * q2.b,
    d: q1.a * q2.d + q1.b * q2.c - q1.c * q2.b + q1.d * q2.a
  };
}

/**
 * Quaternion conjugate: q* = a - bi - cj - dk
 */
export function quaternionConjugate(q: Quaternion): Quaternion {
  return { a: q.a, b: -q.b, c: -q.c, d: -q.d };
}

/**
 * Quaternion norm: |q|² = a² + b² + c² + d²
 */
export function quaternionNorm(q: Quaternion): number {
  return Math.sqrt(q.a * q.a + q.b * q.b + q.c * q.c + q.d * q.d);
}

/**
 * Normalize quaternion to unit quaternion
 */
export function quaternionNormalize(q: Quaternion): Quaternion {
  const norm = quaternionNorm(q);
  if (norm === 0) return { a: 1, b: 0, c: 0, d: 0 };
  return {
    a: q.a / norm,
    b: q.b / norm,
    c: q.c / norm,
    d: q.d / norm
  };
}

/**
 * Quaternion exponential for unitary evolution
 * exp(q) where q is purely imaginary (a = 0)
 */
export function quaternionExp(q: Quaternion, t: number): Quaternion {
  const vectorNorm = Math.sqrt(q.b * q.b + q.c * q.c + q.d * q.d);
  if (vectorNorm === 0) {
    return { a: Math.cos(q.a * t), b: 0, c: 0, d: 0 };
  }
  
  const theta = vectorNorm * t;
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  const scale = sinT / vectorNorm;
  
  return {
    a: cosT,
    b: q.b * scale,
    c: q.c * scale,
    d: q.d * scale
  };
}

// ============= Split Prime Construction =============

/**
 * Create a complete SplitPrime structure from a prime number
 */
export function createSplitPrime(p: number): SplitPrime | null {
  if (!isSplitPrime(p)) return null;
  
  const gaussian = findGaussianFactor(p);
  const eisenstein = findEisensteinFactor(p);
  
  if (!gaussian || !eisenstein) return null;
  
  const quaternion = embedQuaternion(gaussian, eisenstein);
  
  // Bloch vector from quaternion: n_p = (b, c', d') normalized
  const vectorNorm = Math.sqrt(
    quaternion.b ** 2 + quaternion.c ** 2 + quaternion.d ** 2
  );
  
  const blochVector: [number, number, number] = vectorNorm > 0
    ? [
        quaternion.b / vectorNorm,
        quaternion.c / vectorNorm,
        quaternion.d / vectorNorm
      ]
    : [0, 0, 1];
  
  return {
    p,
    gaussian,
    eisenstein,
    quaternion,
    blochVector
  };
}

// ============= Quaternionic Dynamics =============

/**
 * Create Hamiltonian from Bloch vector components
 * H_q = x·σ_x + y·σ_y + z·σ_z represented as quaternion
 */
export function createHamiltonian(blochVector: [number, number, number]): Quaternion {
  // Pauli matrices in quaternion form: σ_x ~ i, σ_y ~ j, σ_z ~ k
  return {
    a: 0,
    b: blochVector[0], // x component
    c: blochVector[1], // y component  
    d: blochVector[2]  // z component
  };
}

/**
 * Time evolution under quaternionic Hamiltonian
 * U_p(t) = exp(-i H_q t)
 */
export function evolveState(
  state: QuaternionState,
  hamiltonian: Quaternion,
  dt: number
): QuaternionState {
  // Evolution operator
  const evolution = quaternionExp(hamiltonian, -dt);
  
  // Evolve quaternion
  const evolved = quaternionMultiply(evolution, state.quaternion);
  const normalized = quaternionNormalize(evolved);
  
  // Update phase
  const newPhase = state.phase + dt * quaternionNorm(hamiltonian);
  
  // Extract new Bloch vector
  const vectorNorm = Math.sqrt(
    normalized.b ** 2 + normalized.c ** 2 + normalized.d ** 2
  );
  
  const blochVector: [number, number, number] = vectorNorm > 0
    ? [normalized.b / vectorNorm, normalized.c / vectorNorm, normalized.d / vectorNorm]
    : [0, 0, 1];
  
  return {
    quaternion: normalized,
    phase: newPhase % (2 * Math.PI),
    amplitude: quaternionNorm(evolved),
    blochVector
  };
}

// ============= Entanglement =============

/**
 * Create entangled pair from two split primes
 */
export function createEntangledPair(
  alice: SplitPrime,
  bob: SplitPrime,
  twistCoupling: number
): EntangledPair {
  // Composite Hamiltonian with twist interaction
  // H_pq = H_q(p) ⊗ I + I ⊗ H_q(q) + γ_pq(σ_z ⊗ σ_z)
  const hAlice = createHamiltonian(alice.blochVector);
  const hBob = createHamiltonian(bob.blochVector);
  
  // Simplified composite (sum with twist)
  const compositeHamiltonian: Quaternion = {
    a: 0,
    b: hAlice.b + hBob.b,
    c: hAlice.c + hBob.c,
    d: hAlice.d + hBob.d + twistCoupling
  };
  
  // Initial phase difference
  const phaseDifference = calculatePhaseDifference(
    alice.quaternion,
    bob.quaternion
  );
  
  return {
    alice,
    bob,
    twistCoupling,
    compositeHamiltonian,
    phaseDifference,
    isSynchronized: false,
    correlationStrength: 0
  };
}

/**
 * Calculate phase difference Δφ_q = arg(q_p* · q_q)
 */
export function calculatePhaseDifference(q1: Quaternion, q2: Quaternion): number {
  const conjugate = quaternionConjugate(q1);
  const product = quaternionMultiply(conjugate, q2);
  
  // Phase from quaternion: atan2(|vector|, scalar)
  const vectorNorm = Math.sqrt(
    product.b ** 2 + product.c ** 2 + product.d ** 2
  );
  
  return Math.atan2(vectorNorm, product.a);
}

/**
 * Update entangled pair with time evolution
 */
export function evolveEntangledPair(
  pair: EntangledPair,
  dt: number,
  epsilon: number
): EntangledPair {
  // Evolve both quaternions under composite Hamiltonian
  const evolution = quaternionExp(pair.compositeHamiltonian, -dt);
  
  const evolvedAlice = quaternionNormalize(
    quaternionMultiply(evolution, pair.alice.quaternion)
  );
  const evolvedBob = quaternionNormalize(
    quaternionMultiply(evolution, pair.bob.quaternion)
  );
  
  // Update split primes with evolved quaternions
  const newAlice = { ...pair.alice, quaternion: evolvedAlice };
  const newBob = { ...pair.bob, quaternion: evolvedBob };
  
  // Recalculate phase difference
  const phaseDifference = calculatePhaseDifference(evolvedAlice, evolvedBob);
  
  // Check synchronization
  const isSynchronized = Math.abs(phaseDifference) < epsilon;
  
  // Calculate correlation strength
  const correlationStrength = Math.exp(-phaseDifference * phaseDifference / 2);
  
  return {
    ...pair,
    alice: newAlice,
    bob: newBob,
    phaseDifference,
    isSynchronized,
    correlationStrength
  };
}

// ============= Projection Operator =============

/**
 * Apply symbolic projection operator C_q
 * Returns eigenvalue ±√p
 */
export function projectState(
  prime: SplitPrime,
  state: QuaternionState
): ProjectionResult {
  // Projection: C_q(q_p) = H_p = b^(-1)
  // Eigenvalues: ±√p
  
  const sqrtP = Math.sqrt(prime.p);
  
  // Determine eigenvalue based on Bloch vector orientation
  const dotProduct = 
    state.blochVector[0] * prime.blochVector[0] +
    state.blochVector[1] * prime.blochVector[1] +
    state.blochVector[2] * prime.blochVector[2];
  
  const eigenvalue = dotProduct >= 0 ? sqrtP : -sqrtP;
  
  // Collapse to eigenstate
  const collapsedQuaternion: Quaternion = {
    a: eigenvalue > 0 ? 1 : 0,
    b: prime.blochVector[0] * (eigenvalue > 0 ? 1 : -1),
    c: prime.blochVector[1] * (eigenvalue > 0 ? 1 : -1),
    d: prime.blochVector[2] * (eigenvalue > 0 ? 1 : -1)
  };
  
  const normalized = quaternionNormalize(collapsedQuaternion);
  
  return {
    eigenvalue,
    collapsedState: {
      quaternion: normalized,
      phase: 0,
      amplitude: Math.abs(eigenvalue),
      blochVector: eigenvalue > 0 
        ? prime.blochVector 
        : [-prime.blochVector[0], -prime.blochVector[1], -prime.blochVector[2]]
    },
    symbolicMeaning: eigenvalue > 0 
      ? `Aligned with prime ${prime.p}: +√${prime.p} ≈ ${sqrtP.toFixed(3)}`
      : `Anti-aligned with prime ${prime.p}: -√${prime.p} ≈ ${(-sqrtP).toFixed(3)}`
  };
}

// ============= Transmission =============

/**
 * Perform non-local transmission
 */
export function transmit(
  sender: 'alice' | 'bob',
  pair: EntangledPair,
  time: number
): TransmissionEvent {
  const prime = sender === 'alice' ? pair.alice : pair.bob;
  const otherPrime = sender === 'alice' ? pair.bob : pair.alice;
  
  // Calculate phases at transmission
  const senderPhase = calculatePhaseDifference(
    { a: 1, b: 0, c: 0, d: 0 },
    prime.quaternion
  );
  
  const receiverPhase = calculatePhaseDifference(
    { a: 1, b: 0, c: 0, d: 0 },
    otherPrime.quaternion
  );
  
  return {
    timestamp: time,
    sender,
    prime,
    quaternionSent: prime.quaternion,
    phaseAtSend: senderPhase,
    receivedPhase: receiverPhase,
    phaseLockAchieved: pair.isSynchronized,
    twistApplied: pair.twistCoupling
  };
}

// ============= Visualization Helpers =============

/**
 * Generate Bloch trajectory for visualization
 */
export function generateBlochTrajectory(
  prime: SplitPrime,
  steps: number = 100,
  totalTime: number = 2 * Math.PI
): BlochTrajectory {
  const points: BlochTrajectory['points'] = [];
  const hamiltonian = createHamiltonian(prime.blochVector);
  
  let state: QuaternionState = {
    quaternion: prime.quaternion,
    phase: 0,
    amplitude: 1,
    blochVector: prime.blochVector
  };
  
  const dt = totalTime / steps;
  
  for (let i = 0; i <= steps; i++) {
    points.push({
      x: state.blochVector[0],
      y: state.blochVector[1],
      z: state.blochVector[2],
      t: i * dt
    });
    state = evolveState(state, hamiltonian, dt);
  }
  
  return {
    points,
    currentPoint: state.blochVector
  };
}

/**
 * Get phase data for visualization
 */
export function getPhaseData(pair: EntangledPair): PhaseData {
  const alicePhase = calculatePhaseDifference(
    { a: 1, b: 0, c: 0, d: 0 },
    pair.alice.quaternion
  );
  
  const bobPhase = calculatePhaseDifference(
    { a: 1, b: 0, c: 0, d: 0 },
    pair.bob.quaternion
  );
  
  return {
    alicePhase,
    bobPhase,
    difference: pair.phaseDifference,
    isLocked: pair.isSynchronized
  };
}

// ============= Presets =============

export const PRESETS: PresetConfig[] = [
  {
    name: 'Minimal Coupling',
    description: 'Smallest split primes with weak twist',
    primeAlice: 13,
    primeBob: 37,
    twistCoupling: 0.1,
    epsilon: 0.1
  },
  {
    name: 'Strong Resonance',
    description: 'Medium primes with strong coupling',
    primeAlice: 61,
    primeBob: 73,
    twistCoupling: 0.8,
    epsilon: 0.05
  },
  {
    name: 'High Prime Pair',
    description: 'Large split primes for complex dynamics',
    primeAlice: 97,
    primeBob: 109,
    twistCoupling: 0.5,
    epsilon: 0.08
  },
  {
    name: 'Synchronized Lock',
    description: 'Optimized for phase locking',
    primeAlice: 37,
    primeBob: 61,
    twistCoupling: 1.0,
    epsilon: 0.15
  }
];

// Get all split primes up to 200
export const AVAILABLE_SPLIT_PRIMES = findSplitPrimes(200);
